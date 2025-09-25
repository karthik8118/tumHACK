# backend/utils/claude_client.py
import logging
from anthropic import Anthropic
from backend.config import ANTHROPIC_API_KEY

claude = Anthropic(api_key=ANTHROPIC_API_KEY)


def claude_ask(prompt: str, model: str = "claude-opus-4-1-20250805", max_tokens: int = 800) -> str:
    """
    Send a prompt to Claude using the completions API.
    """
    try:
        resp = claude.completions.create(
            model=model,
            prompt=prompt,
            max_tokens_to_sample=max_tokens
        )
        return resp.completion
    except Exception as e:
        logging.error("Claude API error: %s", e)
        raise
