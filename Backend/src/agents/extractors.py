import os
import json
from src.state import AgentState
from src.schemas import (
    TechnicalExtraction,
    CommercialLogistics,
    ComplianceEligibility,
    ExecutiveSummary
)
from src.prompts import (
    ROLE_TECHNICAL,
    ROLE_COMMERCIAL,
    ROLE_COMPLIANCE,
    ROLE_SUMMARY,
    EXTRACT_TECHNICAL_PROMPT,
    EXTRACT_COMMERCIAL_PROMPT,
    EXTRACT_COMPLIANCE_PROMPT,
    EXTRACT_SUMMARY_PROMPT
)
from src.utils.file_utils import (
    write_markdown_file,
    write_json_file,
    format_executive_summary_md,
    format_commercial_md,
    format_compliance_md
)
from src.agents.base import invoke_extraction_agent

def extract_technical_agent(state: AgentState) -> AgentState:
    """Extracts Bill of Materials and Technical Constraints."""
    try:
        result = invoke_extraction_agent(
            state, 
            TechnicalExtraction, 
            EXTRACT_TECHNICAL_PROMPT,
            ROLE_TECHNICAL,
            "Technical Agent"
        )

        # Save Artifacts
        run_dir = state["run_folder"]
        path_bom = os.path.join(run_dir, "02_bill_of_materials.json")
        path_constraints = os.path.join(run_dir, "03_technical_constraints.json")

        write_json_file(path_bom, result.bill_of_materials.model_dump()["items"])
        write_json_file(path_constraints, result.technical_constraints.model_dump())

        return {"bom_path": path_bom, "constraints_path": path_constraints}
    except Exception as e:
        print(f"Error in extract_technical_agent: {e}")
        return {"bom_path": None, "constraints_path": None}

def extract_commercial_agent(state: AgentState) -> AgentState:
    """Extracts Commercial and Logistics Terms."""
    try:
        result = invoke_extraction_agent(
            state,
            CommercialLogistics,
            EXTRACT_COMMERCIAL_PROMPT,
            ROLE_COMMERCIAL,
            "Commercial Agent"
        )

        # Save Artifacts
        run_dir = state["run_folder"]
        path_commercial = os.path.join(run_dir, "04_commercial_logistics.json")
        path_commercial_md = os.path.join(run_dir, "04_commercial_logistics.md")

        write_json_file(path_commercial, result.model_dump())
        write_markdown_file(path_commercial_md, format_commercial_md(result))

        return {"commercial_path": path_commercial}
    except Exception as e:
        print(f"Error in extract_commercial_agent: {e}")
        return {"commercial_path": None}

def extract_compliance_agent(state: AgentState) -> AgentState:
    """Extracts Compliance and Eligibility Criteria."""
    try:
        result = invoke_extraction_agent(
            state,
            ComplianceEligibility,
            EXTRACT_COMPLIANCE_PROMPT,
            ROLE_COMPLIANCE,
            "Compliance Agent"
        )

        # Save Artifacts
        run_dir = state["run_folder"]
        path_compliance = os.path.join(run_dir, "05_compliance_eligibility.md")

        write_markdown_file(path_compliance, format_compliance_md(result))

        return {"compliance_path": path_compliance}
    except Exception as e:
        print(f"Error in extract_compliance_agent: {e}")
        return {"compliance_path": None}

def extract_summary_agent(state: AgentState) -> AgentState:
    """Extracts Executive Summary."""
    try:
        result = invoke_extraction_agent(
            state,
            ExecutiveSummary,
            EXTRACT_SUMMARY_PROMPT,
            ROLE_SUMMARY,
            "Summary Agent"
        )

        # Save Artifacts
        run_dir = state["run_folder"]
        path_summary = os.path.join(run_dir, "01_executive_summary.md")
        path_summary_json = os.path.join(run_dir, "01_executive_summary.json")

        write_markdown_file(path_summary, format_executive_summary_md(result))
        write_json_file(path_summary_json, result.model_dump())

        return {"summary_path": path_summary, "summary_json_path": path_summary_json}
    except Exception as e:
        print(f"Error in extract_summary_agent: {e}")
        return {"summary_path": None, "summary_json_path": None}

def consolidator_agent(state: AgentState) -> AgentState:
    """
    Synchronizes extractions and sets the phase for review.
    """
    print("--- Consolidator: Verifying Extractions ---")
    required_keys = ["bom_path", "constraints_path", "commercial_path", "compliance_path", "summary_path"]
    
    missing = [key for key in required_keys if not state.get(key)]
    
    if missing:
        print(f"Warning: Missing extraction outputs: {missing}")
    else:
        print("All extraction artifacts verified present.")
    
    # Set phase to 'extraction' so the Reviewer knows what to check
    return {"phase": "extraction"}
