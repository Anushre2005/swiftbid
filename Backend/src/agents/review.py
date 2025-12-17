import os
import json
from langchain_core.messages import SystemMessage, HumanMessage
from src.state import AgentState
from src.schemas import ReviewOutput
from src.prompts import (
    PERSONA_SUPERVISOR,
    REVIEW_CRITERIA_MATCHING,
    REVIEW_CRITERIA_PRICING,
    REVIEW_CRITERIA_EXTRACTION
)
from src.utils.file_utils import read_json_file
from src.agents.base import get_structured_llm, invoke_with_retry

def universal_reviewer_agent(state: AgentState) -> AgentState:
    """
    Reviews the output of the current phase against criteria.
    Has access to the original PDF.
    """
    phase = state.get("phase")
    print(f"--- Reviewer: Assessing Phase '{phase}' ---")
    
    # 1. Select Criteria & Data
    prompt_criteria = ""
    data_to_review = ""
    
    if phase == "extraction":
        prompt_criteria = REVIEW_CRITERIA_EXTRACTION
        # Load summary as a sample, or load all?
        # Let's load BOM and Commercial as they are most critical.
        if state.get("bom_path") and os.path.exists(state["bom_path"]):
            bom = read_json_file(state["bom_path"])
        else:
            bom = "BOM File Missing"

        if state.get("commercial_path") and os.path.exists(state["commercial_path"]):
            comm = read_json_file(state["commercial_path"])
        else:
            comm = "Commercial File Missing"
            
        data_to_review = f"BOM Sample: {json.dumps(bom[:5] if isinstance(bom, list) else bom, indent=2)}\n\nCommercial Terms: {json.dumps(comm, indent=2)}"
        
    elif phase == "matching":
        prompt_criteria = REVIEW_CRITERIA_MATCHING
        if state.get("matched_sku_path") and os.path.exists(state["matched_sku_path"]):
            matches = read_json_file(state["matched_sku_path"])
            data_to_review = json.dumps(matches, indent=2)
        else:
            data_to_review = "Matched SKUs File Missing"
        
    elif phase == "pricing":
        prompt_criteria = REVIEW_CRITERIA_PRICING
        path_strat = os.path.join(state["run_folder"], "07_pricing_strategy.json")
        if os.path.exists(path_strat):
            strategy = read_json_file(path_strat)
            data_to_review = json.dumps(strategy, indent=2)
        else:
            data_to_review = "Pricing Strategy File Missing"
        
    else:
        print(f"Unknown phase {phase}, skipping review.")
        return {"review_feedback": None, "retry_count": 0}

    # 2. Invoke LLM
    with open(state["rfp_file_path"], "rb") as f:
        pdf_data = f.read()

    system_msg = SystemMessage(content=PERSONA_SUPERVISOR)
    
    human_msg = HumanMessage(
        content=[
            {
                "type": "text",
                "text": prompt_criteria.format(data=data_to_review),
            },
            {
                "type": "media",
                "mime_type": "application/pdf",
                "data": pdf_data,
            },
        ]
    )

    # Define the invoke function for retry mechanism
    def do_invoke(api_key: str):
        structured_llm = get_structured_llm(ReviewOutput, api_key=api_key)
        return structured_llm.invoke([system_msg, human_msg])

    try:
        result = invoke_with_retry(do_invoke)
    except Exception as e:
        print(f"Error in Reviewer: {e}")
        # Default to approve on error to prevent blocking
        return {"review_feedback": None, "retry_count": 0}

    # 3. Handle Decision
    if result.is_approved:
        print(">> Review Passed.")
        return {"review_feedback": None, "retry_count": 0}
    else:
        print(f">> Review Failed. Critique: {result.critique}")
        current_retries = state.get("retry_count", 0) + 1
        return {"review_feedback": result.critique, "retry_count": current_retries}
