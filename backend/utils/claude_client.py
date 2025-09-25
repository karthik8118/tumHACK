from anthropic import Anthropic
from backend.config import ANTHROPIC_API_KEY

claude = Anthropic(api_key=ANTHROPIC_API_KEY)

def claude_ask(prompt: str, max_tokens: int = 800, model: str = "claude-opus-4.1") -> str:
    """
    Sends a prompt to Claude Opus 4.1 and returns the text output.
    Handles differences in SDK output formats.
    """
    resp = claude.completions.create(
        model=model,
        prompt=prompt,
        max_tokens_to_sample=max_tokens
    )
    return getattr(resp, "completion", "") or getattr(resp, "response", "") or ""
