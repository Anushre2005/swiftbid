import json
import os
from typing import Any

def read_text_file(path: str) -> str:
    """Reads content from a text file."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"File not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def read_json_file(path: str) -> Any:
    """Reads content from a JSON file."""
    if not os.path.exists(path):
        return {}
        
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def write_markdown_file(path: str, content: str):
    """Writes content to a markdown file."""
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

def write_json_file(path: str, data: Any):
    """Writes data to a JSON file with indentation."""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def format_executive_summary_md(summary_obj) -> str:
    """Converts ExecutiveSummary Pydantic object to Markdown."""
    # Handle dict or object
    if isinstance(summary_obj, dict):
        s = summary_obj
        dates = s.get("critical_dates", {})
        risks = s.get("key_risks_and_flags", [])
    else:
        s = summary_obj.model_dump()
        dates = s.get("critical_dates", {})
        risks = s.get("key_risks_and_flags", [])

    md = f"""# Executive Summary

**Client:** {s.get('client_name')}
**Tender Ref:** {s.get('tender_reference')}
**Submission Mode:** {s.get('bid_submission_mode')}

## Critical Dates
*   **Submission Deadline:** {dates.get('submission_deadline', 'N/A')}
*   **Opening Date:** {dates.get('opening_date', 'N/A')}

## Scope of Work
{s.get('scope_of_work_summary')}

**Estimated Value:** {s.get('estimated_contract_value')}

## Key Risks & Flags
"""
    for risk in risks:
        md += f"*   {risk}\n"
    return md

def format_commercial_md(comm_obj) -> str:
    """Converts CommercialLogistics Pydantic object to Markdown."""
    if isinstance(comm_obj, dict):
        c = comm_obj
    else:
        c = comm_obj.model_dump()
        
    # Handle optional sub-models safely
    ld = c.get("liquidated_damages") or {}
    fin = c.get("financial_instruments") or {}

    md = f"""# Commercial & Logistics Terms

## Delivery & Incoterms
*   **Incoterms:** {c.get('incoterms')}
*   **Delivery Period:** {c.get('delivery_period_weeks')} Weeks
*   **Unloading Responsibility:** {c.get('unloading_responsibility')}
*   **Insurance:** {c.get('insurance_responsibility')}
*   **Packing Requirements:** {c.get('packing_requirements')}

## Payment & Taxes
*   **Currency:** {c.get('currency')}
*   **Payment Terms:** {c.get('payment_terms')}
*   **Taxes:** {c.get('taxes_and_duties')}

## Financial Security
*   **Performance BG:** {fin.get('performance_bank_guarantee', 'N/A')}
*   **Security Deposit:** {fin.get('security_deposit', 'N/A')}
*   **EMD:** {fin.get('emd_amount', 'N/A')}

## Penalties
*   **Liquidated Damages:** {ld.get('rate_per_week', 'N/A')} (Max: {ld.get('max_cap', 'N/A')})
*   **Warranty:** {c.get('warranty_terms')}
"""
    return md

def format_compliance_md(comp_obj) -> str:
    """Converts ComplianceEligibility Pydantic object to Markdown Checklist."""
    if isinstance(comp_obj, dict):
        c = comp_obj
        docs = c.get("required_documents", [])
        criteria = c.get("specific_experience_criteria", [])
    else:
        c = comp_obj.model_dump()
        docs = c.get("required_documents", [])
        criteria = c.get("specific_experience_criteria", [])

    md = f"""# Compliance & Eligibility Checklist

## Eligibility Criteria
- [ ] **Class Requirement:** {c.get('vendor_class_requirement')}
- [ ] **Local Content Requirement:** {c.get('local_content_percent_req')}% 
- [ ] **Turnover:** {c.get('turnover_requirement_avg_3yrs')}
- [ ] **Blacklisting Declaration:** {'Required' if c.get('blacklisting_declaration') else 'Not Required'}

## Experience Criteria
**Summary:** {c.get('past_experience_requirement')}
"""
    for crit in criteria:
        md += f"- [ ] {crit.get('description')} (Min Value: {crit.get('min_value')} {crit.get('currency')})\n"

    md += "\n## Required Documents\n"
    for doc in docs:
        md += f"- [ ] {doc}\n"
    return md
