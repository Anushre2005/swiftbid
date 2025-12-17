import os
import json
from langchain_core.messages import SystemMessage, HumanMessage
from src.state import AgentState
from src.schemas import SKUMatchOutput
from src.prompts import PERSONA_SOURCING_ENGINEER, SKU_MATCH_TASK
from src.utils.file_utils import read_json_file, read_text_file, write_json_file
from src.agents.base import get_structured_llm, invoke_with_retry

def sku_matcher_agent(state: AgentState) -> AgentState:
    """
    Matches BOM items to the Catalog using structured output (Top 3 Candidates).
    """
    print("--- Technical Agent: Matching Products (Top 3) ---")
    
    try:
        bom_items = read_json_file(state["bom_path"])
        constraints = read_json_file(state["constraints_path"])
        catalog_content = read_text_file(state["catalog_path"])
    except FileNotFoundError as e:
        print(f"Error loading inputs for SKU Matcher: {e}")
        raise e

    system_msg = SystemMessage(content=PERSONA_SOURCING_ENGINEER)

    prompt_content = SKU_MATCH_TASK.format(
        bom_items=json.dumps(bom_items, indent=2),
        constraints=json.dumps(constraints, indent=2),
        catalog_content=catalog_content
    )

    # Feedback Injection
    feedback = state.get("review_feedback")
    if feedback:
        print(f"!!! SKU Matcher Retrying with Feedback: {feedback[:100]}...")
        prompt_content += f"\n\nIMPORTANT REVISION INSTRUCTION:\nPrevious output was rejected.\nQA Feedback: {feedback}\nPlease correct your matching logic."
    
    human_msg = HumanMessage(content=prompt_content)

    # Define the invoke function for retry mechanism
    def do_invoke(api_key: str):
        structured_llm = get_structured_llm(SKUMatchOutput, api_key=api_key)
        result = structured_llm.invoke([system_msg, human_msg])
        return result

    try:
        result = invoke_with_retry(do_invoke)
    except Exception as e:
        print(f"Error during SKU matching: {e}")
        raise e
    
    if result is None:
        print("Warning: LLM returned None. Defaulting to empty recommendations.")
        result = SKUMatchOutput(recommendations=[])
        result = SKUMatchOutput(recommendations=[])

    # Save Output
    path_matched = os.path.join(state["run_folder"], "06_matched_skus.json")
    write_json_file(path_matched, result.model_dump()["recommendations"])
    
    return {"matched_sku_path": path_matched, "phase": "matching"}
