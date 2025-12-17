import os
import json
import csv
from langchain_core.messages import SystemMessage, HumanMessage
from src.state import AgentState
from src.schemas import PricingStrategy
from src.prompts import PERSONA_COMMERCIAL_MANAGER, PRICING_STRATEGY_TASK
from src.utils.file_utils import read_json_file, read_text_file, write_json_file
from src.agents.base import get_structured_llm, invoke_with_retry

def pricing_agent(state: AgentState) -> AgentState:
    """
    Calculates the final bid price using LLM-derived strategy.
    Supports Item-wise L1 logic, Service/Test pricing, and generates Annexure-VI CSV.
    """
    print("--- Pricing Agent: Developing Strategy & Calculating Bid ---")
    
    # Load Inputs
    try:
        matches = read_json_file(state["matched_sku_path"])
        commercial = read_json_file(state["commercial_path"])
        # Fallback for old states
        if isinstance(matches, dict): matches = matches.get("recommendations", matches.get("matches", []))
        elif isinstance(matches, list): pass # already list
        
    except FileNotFoundError as e:
        print(f"Error loading inputs for Pricing Agent: {e}")
        raise e

    # Try to load summary json
    summary = {}
    if state.get("summary_json_path") and os.path.exists(state["summary_json_path"]):
        summary = read_json_file(state["summary_json_path"])

    # Load Technical Constraints for Tests
    constraints = {}
    if state.get("constraints_path") and os.path.exists(state["constraints_path"]):
        constraints = read_json_file(state["constraints_path"])
    
    required_tests = constraints.get("testing_requirements", [])

    system_msg = SystemMessage(content=PERSONA_COMMERCIAL_MANAGER)

    strategy_content = PRICING_STRATEGY_TASK.format(
        summary=json.dumps(summary, indent=2),
        commercial=json.dumps(commercial, indent=2)
    )

    # Feedback Injection
    feedback = state.get("review_feedback")
    if feedback:
        print(f"!!! Pricing Agent Retrying with Feedback: {feedback[:100]}...")
        strategy_content += f"\n\nIMPORTANT REVISION INSTRUCTION:\nPrevious strategy was rejected.\nQA Feedback: {feedback}\nPlease adjust your strategy."

    human_msg = HumanMessage(content=strategy_content)

    # Define the invoke function for retry mechanism
    def do_invoke(api_key: str):
        structured_llm = get_structured_llm(PricingStrategy, api_key=api_key)
        return structured_llm.invoke([system_msg, human_msg])

    try:
        strategy = invoke_with_retry(do_invoke)
        print(f"Strategy Generated: Global Margin={strategy.global_margin_percent}%, Split Strategy={strategy.split_award_strategy}")
    except Exception as e:
        print(f"Error generating pricing strategy: {e}")
        # Fallback defaults
        strategy = PricingStrategy(
            risk_assessment="Error in generation, using defaults.",
            global_margin_percent=15.0,
            transport_overhead_percent=2.0,
            split_award_strategy="Standard",
            item_strategies=[],
            strategic_rationale="Fallback due to LLM error."
        )

    # 2. Load Catalogs
    product_catalog = {}
    try:
        # Product Catalog
        prod_content = read_text_file(state["catalog_path"])
        reader = csv.DictReader(prod_content.splitlines())
        for row in reader:
            product_catalog[row["SKU"]] = float(row["Base_Price_Per_Km"])
            
        # Service Catalog
        service_catalog = {}
        service_path = "data/catalog/service_pricing.csv"
        if os.path.exists(service_path):
            svc_content = read_text_file(service_path)
            reader = csv.DictReader(svc_content.splitlines())
            for row in reader:
                service_catalog[row["Test_Name"].lower()] = float(row["Unit_Price_INR"])
        else:
            print("Warning: Service pricing catalog not found.")

    except Exception as e:
        print(f"Error reading catalogs for pricing: {e}")
        raise e

    # 3. Calculate Service Costs
    total_service_cost = 0.0
    matched_services = []
    
    # Simple keyword matching for tests
    for req_test in required_tests:
        req_test_lower = req_test.lower()
        cost = 0.0
        match_name = "Unknown"
        
        # Find best match in service catalog
        for svc_name, svc_cost in service_catalog.items():
            # Token overlap matching
            svc_tokens = set(svc_name.split())
            req_tokens = set(req_test_lower.split())
            if len(svc_tokens.intersection(req_tokens)) >= 2: # At least 2 words match
                cost = svc_cost
                match_name = svc_name
                break
        
        if cost > 0:
            total_service_cost += cost
            matched_services.append(f"{match_name} ({cost})")
    
    print(f"Calculated Total Service/Test Cost: {total_service_cost} (Matches: {matched_services})")

    # 4. Build Final Bid
    final_bid = []
    
    # Create specific lookup for item strategies
    item_strategy_map = {s.rfp_item_no: s.item_specific_margin_percent for s in strategy.item_strategies}
    transport_decimal = strategy.transport_overhead_percent / 100.0
    
    # Tax Assumption
    tax_rate = 0.18
    if "inclusive" in commercial.get("taxes_and_duties", "").lower():
        tax_rate = 0.0 
    
    grand_total_val = 0.0

    # Annexure-VI Table Rows
    csv_rows = []
    headers = ["S.No", "Item Description", "Quantity", "Unit Cost/km", "Total Material", "Service/Test Cost", "Total Cost", "Tax Amount", "Grand Total (Rs)"]

    for match in matches:
        # Handle new "recommendations" structure vs old "matches"
        if "selected_sku" in match:
            sku = match["selected_sku"]
            item_no = match["rfp_item_no"]
            desc = match.get("rfp_description", "Unknown Item")
        else:
            sku = match.get("matched_sku")
            item_no = match.get("rfp_item_no")
            desc = "Unknown Item"

        # Get Qty from BOM
        qty = 0
        try:
            bom = read_json_file(state["bom_path"])
            for b_item in bom:
                if str(b_item["rfp_item_no"]) == str(item_no):
                    qty = b_item["quantity"]
                    if desc == "Unknown Item": desc = b_item["description"]
                    break
        except:
            pass

        if sku and sku != "NO_MATCH" and sku in product_catalog:
            base_price = product_catalog[sku]
            
            # 1. Apply Transport
            cost_plus_transport = base_price * (1 + transport_decimal)
            
            # 2. Apply Margin
            margin_pct = item_strategy_map.get(item_no, strategy.global_margin_percent)
            margin_decimal = margin_pct / 100.0
            
            unit_selling_price = cost_plus_transport * (1 + margin_decimal)
            
            # 3. Calculate Material Total
            total_material_cost = unit_selling_price * qty
            
            # 4. Amortize Service Cost
            num_items = len([m for m in matches if m.get("selected_sku", m.get("matched_sku")) != "NO_MATCH"])
            item_service_cost = total_service_cost / num_items if num_items > 0 else 0
            
            total_cost_ex_tax = total_material_cost + item_service_cost
            tax_amount = total_cost_ex_tax * tax_rate
            line_total = total_cost_ex_tax + tax_amount
            
            grand_total_val += line_total
            
            final_bid.append({
                "rfp_item_no": item_no,
                "description": desc,
                "sku": sku,
                "qty": qty,
                "base_price": base_price,
                "margin_percent": margin_pct,
                "unit_price_material": round(unit_selling_price, 2),
                "total_material": round(total_material_cost, 2),
                "allocated_service_cost": round(item_service_cost, 2),
                "total_price_inc_tax": round(line_total, 2)
            })
            
            # CSV Row
            csv_rows.append({
                "S.No": item_no,
                "Item Description": desc,
                "Quantity": qty,
                "Unit Cost/km": f"{round(unit_selling_price, 2):.2f}",
                "Total Material": f"{round(total_material_cost, 2):.2f}",
                "Service/Test Cost": f"{round(item_service_cost, 2):.2f}",
                "Total Cost": f"{round(total_cost_ex_tax, 2):.2f}",
                "Tax Amount": f"{round(tax_amount, 2):.2f}",
                "Grand Total (Rs)": f"{round(line_total, 2):.2f}"
            })
            
        else:
            final_bid.append({
                "rfp_item_no": item_no,
                "error": "No valid SKU matched",
                "notes": str(match)
            })
            csv_rows.append({
                "S.No": item_no,
                "Item Description": desc + " (NO MATCH)",
                "Quantity": qty,
                "Unit Cost/km": "0.00",
                "Total Material": "0.00",
                "Service/Test Cost": "0.00",
                "Total Cost": "0.00",
                "Tax Amount": "0.00",
                "Grand Total (Rs)": "0.00"
            })

    # Save JSON Output
    path_bid = os.path.join(state["run_folder"], "07_final_bid.json")
    path_strategy = os.path.join(state["run_folder"], "07_pricing_strategy.json")
    write_json_file(path_bid, final_bid)
    write_json_file(path_strategy, strategy.model_dump())
    
    # Save CSV Annexure-VI
    path_csv = os.path.join(state["run_folder"], "Annexure_VI_Price_Bid.csv")
    with open(path_csv, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(csv_rows)
        # Add Grand Total Row
        writer.writerow({
            "S.No": "", "Item Description": "GRAND TOTAL", "Quantity": "", 
            "Unit Cost/km": "", "Total Material": "", "Service/Test Cost": "", 
            "Total Cost": "", "Tax Amount": "", 
            "Grand Total (Rs)": f"{round(grand_total_val, 2):.2f}"
        })

    return {"pricing_bid_path": path_bid, "phase": "pricing"}
