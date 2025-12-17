import os
import time
import random
import threading
from typing import Any, List, Optional
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from src.state import AgentState
from src.prompts import PERSONA_RFP_ANALYST

# Configuration
MODEL_NAME = "gemini-flash-latest"

# --- API Key Rotation Manager ---
class APIKeyManager:
    """
    Thread-safe API key manager with automatic rotation on rate limit errors.
    Loads all GOOGLE_API_KEY* environment variables and rotates through them.
    """
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self._keys: List[str] = []
        self._current_index = 0
        self._key_lock = threading.Lock()
        self._load_keys()
        self._initialized = True
    
    def _load_keys(self):
        """Load all API keys from environment variables matching GOOGLE_API_KEY*"""
        # First, add the main key if it exists
        main_key = os.environ.get("GOOGLE_API_KEY")
        if main_key:
            self._keys.append(main_key)
        
        # Then add numbered keys (GOOGLE_API_KEY_1, GOOGLE_API_KEY_2, etc.)
        i = 1
        while True:
            key = os.environ.get(f"GOOGLE_API_KEY_{i}")
            if key:
                if key not in self._keys:  # Avoid duplicates
                    self._keys.append(key)
                i += 1
            else:
                break
        
        if not self._keys:
            raise ValueError("No GOOGLE_API_KEY environment variables found.")
        
        print(f"[APIKeyManager] Loaded {len(self._keys)} API key(s)")
    
    def get_current_key(self) -> str:
        """Get the current API key."""
        with self._key_lock:
            return self._keys[self._current_index]
    
    def rotate_key(self) -> str:
        """Rotate to the next API key and return it."""
        with self._key_lock:
            old_index = self._current_index
            self._current_index = (self._current_index + 1) % len(self._keys)
            new_index = self._current_index
            print(f"[APIKeyManager] Rotating API key: {old_index + 1} -> {new_index + 1}")
            return self._keys[self._current_index]
    
    def get_key_count(self) -> int:
        """Return the total number of available keys."""
        return len(self._keys)


# Global key manager instance
_key_manager: Optional[APIKeyManager] = None

def get_key_manager() -> APIKeyManager:
    """Get or create the global API key manager."""
    global _key_manager
    if _key_manager is None:
        _key_manager = APIKeyManager()
    return _key_manager


def is_rate_limit_error(error: Exception) -> bool:
    """Check if an exception is a rate limit error."""
    error_str = str(error).lower()
    rate_limit_indicators = [
        "rate limit",
        "rate_limit", 
        "ratelimit",
        "429",
        "quota",
        "resource exhausted",
        "resourceexhausted",
        "too many requests",
    ]
    return any(indicator in error_str for indicator in rate_limit_indicators) 

def get_llm(api_key: Optional[str] = None):
    """Returns the configured LLM instance with the specified or current API key."""
    key_manager = get_key_manager()
    key = api_key or key_manager.get_current_key()
    # Disable LangChain's internal retry (max_retries=0) so our rotation logic handles retries
    return ChatGoogleGenerativeAI(
        model=MODEL_NAME, 
        temperature=0.1, 
        google_api_key=key,
        max_retries=0  # Disable internal retries to allow our key rotation to work
    )

def get_structured_llm(schema: Any, api_key: Optional[str] = None):
    """Returns an LLM instance configured with structured output."""
    llm = get_llm(api_key=api_key)
    # Use method="json_schema" to ensure proper parsing of nested Pydantic models
    return llm.with_structured_output(schema, method="json_schema")


def invoke_with_retry(invoke_fn, max_retries: int = 3, base_delay: float = 5.0):
    """
    Invoke a function with automatic retry and API key rotation on rate limit errors.
    
    Args:
        invoke_fn: A callable that takes an api_key parameter and returns the result
        max_retries: Maximum number of retries per key before giving up
        base_delay: Base delay between retries (will increase exponentially)
    
    Returns:
        The result from invoke_fn
    """
    key_manager = get_key_manager()
    total_keys = key_manager.get_key_count()
    total_attempts = max_retries * total_keys
    
    last_error = None
    keys_tried = 0
    
    for attempt in range(total_attempts):
        current_key = key_manager.get_current_key()
        
        try:
            return invoke_fn(api_key=current_key)
        except Exception as e:
            last_error = e
            
            if is_rate_limit_error(e):
                print(f"[Rate Limit] Hit rate limit on attempt {attempt + 1}")
                
                # Rotate to next key
                key_manager.rotate_key()
                keys_tried += 1
                
                # If we've tried all keys, wait before cycling through again
                if keys_tried >= total_keys:
                    wait_time = base_delay * (2 ** (attempt // total_keys))
                    wait_time = min(wait_time, 60)  # Cap at 60 seconds
                    print(f"[Rate Limit] All keys exhausted. Waiting {wait_time:.1f}s before retry...")
                    time.sleep(wait_time)
                    keys_tried = 0
                else:
                    # Small delay before trying next key
                    time.sleep(1.0)
            else:
                # Non-rate-limit error, re-raise immediately
                raise e
    
    # All retries exhausted
    raise last_error

def invoke_extraction_agent(state: AgentState, schema: Any, prompt_text: str, role: str, agent_name: str) -> Any:

    # Random delay to avoid hitting rate limits with parallel requests
    delay = random.uniform(3.0, 8.0)
    time.sleep(delay)

    print(f"--- {agent_name}: Extracting ... ---")
    
    # Read PDF data - treating as binary, so separate from read_text_file
    with open(state["rfp_file_path"], "rb") as f:
        pdf_data = f.read()

    # Check for feedback (Reflexion Loop)
    feedback = state.get("review_feedback")
    final_prompt = prompt_text
    if feedback:
        print(f"!!! {agent_name} Retrying with Feedback: {feedback[:100]}...")
        final_prompt += f"\n\nIMPORTANT REVISION INSTRUCTION:\nPrevious attempt failed quality review. \nFeedback: {feedback}\nPlease fix these issues in your new extraction."

    system_msg = SystemMessage(content=PERSONA_RFP_ANALYST.format(role=role))
    
    human_msg = HumanMessage(
        content=[
            {
                "type": "text",
                "text": final_prompt,
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
        structured_llm = get_structured_llm(schema, api_key=api_key)
        result = structured_llm.invoke([system_msg, human_msg])
        if result is None:
            raise ValueError(f"{agent_name} returned None. Extraction failed.")
        return result

    try:
        return invoke_with_retry(do_invoke)
    except Exception as e:
        print(f"Error in {agent_name}: {e}")
        raise e
