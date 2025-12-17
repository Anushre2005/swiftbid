from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

# --- 1. Executive Summary Schema ---
class CriticalDates(BaseModel):
    submission_deadline: Optional[str] = Field(None, description="Bid submission deadline (e.g., '2025-03-20')")
    opening_date: Optional[str] = Field(None, description="Bid opening date")

class ExecutiveSummary(BaseModel):
    client_name: str = Field(..., description="Name of the client/organization issuing the RFP")
    tender_reference: str = Field(..., description="Tender or RFP reference number")
    bid_submission_mode: str = Field(..., description="Mode of submission (e.g., 'Online via GeM', 'Physical')")
    critical_dates: CriticalDates = Field(..., description="Key dates for the tender")
    scope_of_work_summary: str = Field(..., description="A concise 2-3 sentence summary of what is being procured")
    estimated_contract_value: Optional[str] = Field("Not Disclosed", description="Estimated value if mentioned")
    key_risks_and_flags: List[str] = Field(default_factory=list, description="High-level risks (e.g., 'Strict timelines', 'Split order')")

# --- 2. Bill of Materials Schema ---
class BOMItem(BaseModel):
    rfp_item_no: str = Field(..., description="Item number as per RFP (e.g., '1', 'Item 1')")
    description: str = Field(..., description="Full description of the item")
    quantity: float = Field(..., description="Numerical quantity required")
    unit: str = Field(..., description="Unit of measure (e.g., 'km', 'nos', 'mtrs')")
    category: Optional[str] = Field(None, description="Inferred category (e.g., 'Telecom Cable', 'Power Cable')")
    delivery_location: Optional[str] = Field(None, description="Specific delivery location for this item if mentioned")
    requested_make: Optional[str] = Field(None, description="Specific make/brand requested if any")
    requires_mii_declaration: bool = Field(False, description="Does this item require specific MII (Make in India) content declaration?")

class BillOfMaterials(BaseModel):
    items: List[BOMItem] = Field(default_factory=list, description="List of all items requested in the RFP")

# --- 3. Technical Constraints Schema ---
class SpecificationItem(BaseModel):
    component: str = Field(..., description="The component being described (e.g., 'Conductor', 'Insulation')")
    parameter: str = Field(..., description="The specific parameter (e.g., 'Diameter', 'Tensile Strength')")
    value: str = Field(..., description="The required value (e.g., '0.5mm', 'Min 100 kg/cm²')")
    tolerance: Optional[str] = Field(None, description="Allowable tolerance (e.g., '± 0.010mm')")
    page_ref: Optional[Union[int, str]] = Field(None, description="Page number where this spec is found")

class InspectionRequirement(BaseModel):
    inspection_type: str = Field(..., description="Type of inspection (e.g., 'Pre-Delivery Inspection', 'Factory Acceptance Test')")
    location: Optional[str] = Field(None, description="Location of inspection (e.g., 'Factory', 'Online', 'Site')")
    agency: Optional[str] = Field(None, description="Inspecting agency (e.g., 'Department Team', 'TUV', 'SGS')")
    expense_bearer: Optional[str] = Field(None, description="Who bears the cost? (e.g., 'Vendor', 'Client')")

class TechnicalConstraints(BaseModel):
    applicable_standards: List[str] = Field(default_factory=list, description="List of standards (e.g., 'IS:8130', 'TEC GR/CUG-01/03')")
    specifications: List[SpecificationItem] = Field(default_factory=list, description="Detailed list of technical specifications")
    testing_requirements: List[str] = Field(default_factory=list, description="List of required tests (e.g., 'Water penetration test')")
    inspection_requirements: List[InspectionRequirement] = Field(default_factory=list, description="List of inspection and testing requirements")

# --- 4. Commercial Logistics Schema ---
class LiquidatedDamages(BaseModel):
    rate_per_week: str = Field(..., description="Penalty rate (e.g., '0.5% per week')")
    max_cap: str = Field(..., description="Maximum penalty cap (e.g., '10% of contract value')")

class FinancialInstruments(BaseModel):
    performance_bank_guarantee: Optional[str] = Field(None, description="PBG requirement (e.g., '3% of total value')")
    security_deposit: Optional[str] = Field(None, description="Security deposit details")
    emd_amount: Optional[str] = Field(None, description="Earnest Money Deposit amount")

class CommercialLogistics(BaseModel):
    currency: str = Field("INR", description="Currency for the bid")
    incoterms: str = Field(..., description="Delivery terms (e.g., 'FOR Destination', 'Ex-Works')")
    unloading_responsibility: str = Field(..., description="Who is responsible for unloading at site? (e.g., 'Vendor', 'Client/Department')")
    packing_requirements: Optional[str] = Field(None, description="Specific packing instructions (e.g., 'Wooden Drums', 'Rubber Caps')")
    insurance_responsibility: str = Field("Vendor", description="Who is responsible for transit insurance?")
    payment_terms: str = Field(..., description="Payment milestones (e.g., '100% on acceptance', 'Pro-rata')")
    delivery_period_weeks: Optional[int] = Field(None, description="Delivery timeline in weeks")
    taxes_and_duties: str = Field(..., description="Tax handling (e.g., 'Inclusive', 'Extra as applicable')")
    warranty_terms: Optional[str] = Field(None, description="Warranty period details")
    liquidated_damages: Optional[LiquidatedDamages] = Field(None, description="LD clauses")
    financial_instruments: Optional[FinancialInstruments] = Field(None, description="Bank guarantees and deposits")

# --- 5. Compliance & Eligibility Schema ---
class ExperienceCriterion(BaseModel):
    description: str = Field(..., description="Description of the criteria (e.g., 'Single order > 100 Lakhs')")
    min_value: Optional[float] = Field(None, description="Numeric value associated with the criteria (in Lakhs/Crores)")
    currency: Optional[str] = Field("INR", description="Currency for the value")

class ComplianceEligibility(BaseModel):
    vendor_class_requirement: str = Field(..., description="e.g., 'Class-I Local Supplier (>=50% local content)'")
    local_content_percent_req: Optional[float] = Field(None, description="Minimum local content percentage required (e.g., 50.0)")
    turnover_requirement_avg_3yrs: Optional[str] = Field(None, description="Financial turnover requirement")
    past_experience_requirement: Optional[str] = Field(None, description="Summary of experience criteria")
    specific_experience_criteria: List[ExperienceCriterion] = Field(default_factory=list, description="List of specific past experience criteria options")
    required_documents: List[str] = Field(default_factory=list, description="List of certificates/annexures needed (e.g., 'OEM Cert', 'GST Reg')")
    blacklisting_declaration: bool = Field(False, description="Is a self-declaration regarding blacklisting required?")

# --- Master Extraction Output ---
class TechnicalExtraction(BaseModel):
    bill_of_materials: BillOfMaterials
    technical_constraints: TechnicalConstraints

class ExtractionOutput(BaseModel):
    executive_summary: ExecutiveSummary
    bill_of_materials: BillOfMaterials
    technical_constraints: TechnicalConstraints
    commercial_logistics: CommercialLogistics
    compliance_eligibility: ComplianceEligibility

# --- 6. Matcher Schema (Technical Agent) ---
class SKUCandidate(BaseModel):
    sku_id: str = Field(..., description="The SKU ID from the catalog")
    description: str = Field(..., description="Catalog description")
    spec_match_percent: float = Field(..., description="Percentage of specs matched (0-100)")
    missing_specs: List[str] = Field(default_factory=list, description="List of specs not met or missing")
    justification: str = Field(..., description="Why is this a good candidate?")

class SKURecommendation(BaseModel):
    rfp_item_no: str = Field(..., description="Item number from the BOM")
    rfp_description: str = Field(..., description="Original RFP description")
    top_candidates: List[SKUCandidate] = Field(..., description="Top 3 matching candidates from catalog", min_length=1, max_length=3)
    selected_sku: str = Field(..., description="The best SKU ID among the candidates")
    selection_reason: str = Field(..., description="Why this candidate was selected over others")

class SKUMatchOutput(BaseModel):
    recommendations: List[SKURecommendation] = Field(..., description="List of recommendations for all BOM items")

# --- 7. Pricing Schema ---
class ItemPricingStrategy(BaseModel):
    rfp_item_no: str = Field(..., description="RFP Item Number")
    item_specific_margin_percent: float = Field(..., description="Specific margin for this item (can differ from global)")
    rationale: str = Field(..., description="Why this margin? (e.g. 'High competition item', 'Unique spec')")

class PricingStrategy(BaseModel):
    risk_assessment: str = Field(..., description="Assessment of commercial and execution risks (Low/Medium/High) with details")
    global_margin_percent: float = Field(..., description="Base margin percentage")
    transport_overhead_percent: float = Field(..., description="Estimated transport/logistics overhead percentage")
    split_award_strategy: str = Field(..., description="Strategy for split awards (e.g., 'Price each item profitably', 'Loss leader on Item 1')")
    item_strategies: List[ItemPricingStrategy] = Field(default_factory=list, description="Per-item margin overrides")
    strategic_rationale: str = Field(..., description="Explanation for the overall strategy")

# --- 8. Reviewer Schema ---
class ReviewOutput(BaseModel):
    is_approved: bool = Field(..., description="True if output meets standards, False otherwise")
    critique: str = Field(..., description="Detailed feedback if not approved, or 'Looks good'")
    suggestions: List[str] = Field(default_factory=list, description="Specific actionable suggestions")