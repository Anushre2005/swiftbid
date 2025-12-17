# src/prompts.py

# --- Common Personas ---
PERSONA_RFP_ANALYST = "You are an expert RFP Analyst specializing in {role}."

PERSONA_SOURCING_ENGINEER = (
    "You are a Technical Sourcing Engineer. Your goal is to match BOM items "
    "to the best available Product SKU in the provided Catalog, respecting all technical constraints."
)

PERSONA_COMMERCIAL_MANAGER = (
    "You are a Commercial Manager & Bid Strategist. Your goal is to determine the optimal pricing strategy "
    "(Margin % and Transport Overhead %) for the given tender."
)

PERSONA_SUPERVISOR = (
    "You are a Senior RFP Bid Manager and Quality Assurance Lead. "
    "Your goal is to review the work of your team, identify errors, inconsistencies, or missed requirements, "
    "and provide actionable feedback to ensure the final bid is accurate and competitive."
)

# --- Extraction Roles (used to format PERSONA_RFP_ANALYST) ---
ROLE_TECHNICAL = "Technical Analysis and Engineering specifications"
ROLE_COMMERCIAL = "Commercial Terms, Logistics, and Contract Law"
ROLE_COMPLIANCE = "Vendor Compliance, Eligibility Criteria, and Tender Qualifications"
ROLE_SUMMARY = "Executive Summarization and High-level Project Analysis"

# --- Extraction Prompts ---
EXTRACT_TECHNICAL_PROMPT = """
Extract the Bill of Materials and Technical Constraints.
Crucial:
1. Look for 'Quantity Tolerance' (e.g., +/- 5% cable length).
2. Look for any 'Exceptions/Deviations' format requirements (Annexure-I).
"""
EXTRACT_COMMERCIAL_PROMPT = """
Extract the Commercial and Logistics terms.
Crucial:
1. Look for 'Unloading' - is it Vendor Scope or Department Scope?
2. Look for 'Split Order' or 'Item-wise L1' clauses.
3. Look for 'Make in India' (MII) or 'Class-I Local Supplier' requirements.
"""
EXTRACT_COMPLIANCE_PROMPT = "Extract the Compliance and Eligibility criteria from this RFP."
EXTRACT_SUMMARY_PROMPT = "Extract the Executive Summary from this RFP. Pay special attention to the 'Validity of Offer' period (in days) and any key dates."

# --- Task Prompts ---
SKU_MATCH_TASK = """
Task: You are the Technical Agent. For each item in the BOM, identify the Top 3 matching products from the Catalog.

Input BOM:
{bom_items}

Input Technical Constraints:
{constraints}

Product Catalog (CSV):
{catalog_content}

Instructions:
1. For each BOM item:
   - Identify up to 3 potential matches from the catalog.
   - Calculate "Spec Match %" for each: (Number of matching specs / Total critical specs) * 100.
   - List missing specs for each candidate.
   - Select the BEST single SKU as the final choice.
2. If "NO_MATCH" is the only option, explain why.
3. Your output must strictly follow the schema: list top candidates, then the selected one.
"""

PRICING_STRATEGY_TASK = """
Task: Analyze the tender context and determine the pricing strategy.

1. Executive Summary (Client Profile, Risks, Validity):
{summary}

2. Commercial Terms (Payment, LDs, Delivery, Unloading Scope, Split Clause):
{commercial}

Instructions:
- Assess Risk: High LDs? Strict Payment? Remote location? Long Validity (cost of capital)?
- Unloading: If 'Department Scope', reduce overheads!
- Split Award: If 'Item-wise L1' is allowed, price EACH item profitably. Do not cross-subsidize heavily.
- Strategy:
  - Define a 'global_margin_percent'.
  - If specific items need different margins (e.g. high volume = lower margin), add 'item_strategies'.
  - Define 'transport_overhead_percent' based on location and unloading scope.
"""

# --- Review Criteria ---
REVIEW_CRITERIA_MATCHING = """
Review the SKU Matching Output.

Context:
- The goal is to find the best possible match for every BOM item.
- "NO_MATCH" should only be used if the catalog truly lacks a suitable substitute.
- False Positives (bad matches) are expensive. False Negatives (missed matches) lose revenue.

Input Data:
{data}

Checklist:
1. Are there any 'NO_MATCH' items that clearly look like they should exist in a standard cable catalog? (e.g. 'Cat6' vs 'Category 6').
2. Do the 'High' confidence matches actually align with the technical specs?
3. Are the notes clear?

If you find errors, set is_approved=False and provide specific examples in critique.
"""

REVIEW_CRITERIA_PRICING = """
Review the Pricing Strategy.

Context:
- We need to be competitive but profitable.
- Standard margins are 15-25%.
- Transport overheads are usually 2-5%.

Input Data:
{data}

Checklist:
1. Is the margin recommendation realistic given the risks identified?
2. Is the transport overhead sufficient for the delivery terms (e.g. is it remote/mountainous)?
3. Does the rationale make logical sense?

If the strategy is reckless (too low) or uncompetitive (too high without cause), reject it.
"""

REVIEW_CRITERIA_EXTRACTION = """
Review the Extracted Data.

Context:
- We just extracted critical data from a PDF.
- Missing fields can cause downstream failures.

Input Data:
{data}

Checklist:
1. Are key fields (BOM items, Payment Terms) populated?
2. Does the data look like valid text/numbers or is it garbled?
3. Are there any empty lists [] where there should be content?

If data is missing or looks corrupt, reject it.
"""