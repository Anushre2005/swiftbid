from typing import TypedDict, Optional

class AgentState(TypedDict):
    rfp_file_path: str
    run_folder: str
    catalog_path: str
    
    # Artifact Paths
    summary_path: Optional[str]
    summary_json_path: Optional[str]
    bom_path: Optional[str]
    constraints_path: Optional[str]
    commercial_path: Optional[str]
    compliance_path: Optional[str]
    matched_sku_path: Optional[str]
    pricing_bid_path: Optional[str]
    
    # Review Loop State
    phase: str  # 'extraction', 'matching', 'pricing'
    review_feedback: Optional[str]
    retry_count: int
