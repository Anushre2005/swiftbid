# SwiftBid

Automating B2B RFP Responses with Agentic AI.

## Overview
SwiftBid is a multi-agent AI system designed to automate the B2B Request for Proposal (RFP) response process for industrial manufacturers. It streamlines RFP identification, product matching, and pricing estimation to improve response speed and accuracy.

## Problem Statement
Current manual RFP response processes face several bottlenecks:
- **Delayed Identification:** Sales teams often miss RFP releases or identify them too late.
- **Manual Matching:** Technical teams spend excessive time manually matching product SKUs to RFP specifications.
- **Workflow Inefficiencies:** Manual handoffs between Sales, Technical, and Pricing teams cause delays that impact win rates.

## Solution Architecture
SwiftBid simulates the RFP response workflow using four specialized AI agents:

1. **Main Agent (Orchestrator):** Coordinates the workflow, passes context between agents, and consolidates the final bid response.
2. **Sales Agent:** Scans sources for upcoming RFPs, summarizes requirements, and identifies deadlines.
3. **Technical Agent:** Analyzes RFP technical specifications and maps them to internal OEM product SKUs with a "Spec Match" score.
4. **Pricing Agent:** Calculates material and service costs based on product selection and required testing standards.

## Technology Stack

### Backend
- **Language:** Python
- **Frameworks:** LangChain, LangGraph
- **AI Models:** Gemini Pro and Flash models
- **Environment Management:** uv

### Frontend
- **Framework:** React
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS

## Project Goals
- Scale the number of RFP responses per year.
- Reduce lead time for technical product matching.
- Ensure timely submissions to increase contract win rates.