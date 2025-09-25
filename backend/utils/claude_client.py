# Simple wrapper around Anthropic API to standardize calls
from anthropic import Anthropic
from backend.config import ANTHROPIC_API_KEY

claude = Anthropic(api_key=ANTHROPIC_API_KEY)

def claude_ask(prompt: str, max_tokens: int = 500) -> str:
    """
    Sends a prompt to Claude and returns the text output.
    Handles different Anthropic SDK versions gracefully.
    """
    resp = claude.completions.create(model="claude-2.1", prompt=prompt, max_tokens_to_sample=max_tokens)
    # Check possible attributes for compatibility
    return getattr(resp, "completion", "") or getattr(resp, "response", "") or ""
