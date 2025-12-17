from langgraph.graph import StateGraph, START, END
from src.state import AgentState
from src.agents import (
    extract_technical_agent,
    extract_commercial_agent,
    extract_compliance_agent,
    extract_summary_agent,
    consolidator_agent,
    sku_matcher_agent,
    pricing_agent,
    universal_reviewer_agent
)

MAX_RETRIES = 3

def create_extractor_subgraph():
    """
    Creates a subgraph for the extraction phase.
    Flow: START -> [Parallel Agents] -> Consolidator -> END
    """
    workflow = StateGraph(AgentState)

    # Add Nodes
    workflow.add_node("extract_technical", extract_technical_agent)
    workflow.add_node("extract_commercial", extract_commercial_agent)
    workflow.add_node("extract_compliance", extract_compliance_agent)
    workflow.add_node("extract_summary", extract_summary_agent)
    workflow.add_node("consolidator", consolidator_agent)

    # Parallel Start
    workflow.add_edge(START, "extract_technical")
    workflow.add_edge(START, "extract_commercial")
    workflow.add_edge(START, "extract_compliance")
    workflow.add_edge(START, "extract_summary")

    # Fan-in to Consolidator
    workflow.add_edge("extract_technical", "consolidator")
    workflow.add_edge("extract_commercial", "consolidator")
    workflow.add_edge("extract_compliance", "consolidator")
    workflow.add_edge("extract_summary", "consolidator")

    # End Subgraph
    workflow.add_edge("consolidator", END)

    return workflow.compile()

def route_after_review(state: AgentState):
    """
    Determines the next step after review.
    Routes back to the worker if rejected, or forward if approved.
    """
    feedback = state.get("review_feedback")
    retry_count = state.get("retry_count", 0)
    phase = state.get("phase")

    # 1. Check for Max Retries (Force Proceed)
    if feedback and retry_count > MAX_RETRIES:
        print(f"!!! Max Retries ({MAX_RETRIES}) reached for {phase}. Forcing progress.")
        feedback = None # Clear feedback to force approval path
        # ideally we log this permanently somewhere

    # 2. Handle Rejection (Loop Back)
    if feedback:
        print(f"<<< Rejected. Looping back to {phase} (Attempt {retry_count + 1})")
        if phase == "extraction":
            return "extractor"
        elif phase == "matching":
            return "matcher"
        elif phase == "pricing":
            return "pricer"
    
    # 3. Handle Approval (Move Forward)
    print(f">>> Approved. Moving forward from {phase}.")
    if phase == "extraction":
        return "matcher"
    elif phase == "matching":
        return "pricer"
    elif phase == "pricing":
        return END
    
    return END

def create_graph():
    """
    Builds the Main Workflow with Universal Review Loop.
    Flow: 
    START -> Extractor -> Reviewer -> (Loop/Next)
    Matcher -> Reviewer -> (Loop/Next)
    Pricer -> Reviewer -> (Loop/END)
    """
    
    workflow = StateGraph(AgentState)

    # Nodes
    workflow.add_node("extractor", create_extractor_subgraph())
    workflow.add_node("matcher", sku_matcher_agent)
    workflow.add_node("pricer", pricing_agent)
    workflow.add_node("reviewer", universal_reviewer_agent)

    # Edges
    workflow.add_edge(START, "extractor")
    
    # All workers send output to Reviewer
    workflow.add_edge("extractor", "reviewer")
    workflow.add_edge("matcher", "reviewer")
    workflow.add_edge("pricer", "reviewer")

    # Reviewer decides where to go next
    workflow.add_conditional_edges(
        "reviewer",
        route_after_review,
        {
            "extractor": "extractor",
            "matcher": "matcher",
            "pricer": "pricer",
            END: END
        }
    )

    # Compile
    app = workflow.compile()
    return app
