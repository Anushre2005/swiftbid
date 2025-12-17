import os
import uuid
import argparse
from dotenv import load_dotenv
from src.graph import create_graph

# Load environment variables
load_dotenv()

def setup_run_directory(base_path: str = "data/runs") -> str:
    run_id = str(uuid.uuid4())[:8]
    run_dir = os.path.join(base_path, run_id)
    os.makedirs(run_dir, exist_ok=True)
    return run_id, run_dir

def main():
    parser = argparse.ArgumentParser(description="AI RFP Co-Pilot")
    parser.add_argument("pdf_path", help="Path to the RFP PDF file")
    args = parser.parse_args()

    pdf_path = args.pdf_path
    if not os.path.exists(pdf_path):
        print(f"Error: File not found at {pdf_path}")
        return

    # Setup Run
    run_id, run_dir = setup_run_directory()
    print(f"Starting Run ID: {run_id}")
    print(f"Artifacts will be saved to: {run_dir}")

    # Initial State
    initial_state = {
        "run_id": run_id,
        "run_folder": run_dir,
        "rfp_file_path": pdf_path,
        "catalog_path": "data/catalog/products.csv",
        # Other fields start as None/Empty, populated by agents
        "summary_path": "",
        "bom_path": "",
        "constraints_path": "",
        "commercial_path": "",
        "compliance_path": "",
        "matched_sku_path": None,
        "pricing_bid_path": None
    }

    # Run Graph
    app = create_graph()
    try:
        # invoke returns the final state
        final_state = app.invoke(initial_state)
        print("\n--- Run Complete ---")
        print(f"Final Bid generated at: {final_state.get('pricing_bid_path')}")
        print(f"All artifacts in: {run_dir}")
    except Exception as e:
        print(f"\nError during execution: {e}")

if __name__ == "__main__":
    main()