from anthropic import Anthropic
from backend.config import ANTHROPIC_API_KEY, MAX_CLAUDE_TOKENS

claude = Anthropic(api_key=ANTHROPIC_API_KEY)

def claude_ask(prompt: str, max_tokens: int = MAX_CLAUDE_TOKENS, model: str = "claude-3"):
    """
    Universal wrapper for Claude Messages API. Returns completion text.
    """
    messages = [
        {"role": "system", "content": "You are a VC analyst. Respond only with concise JSON."},
        {"role": "user", "content": prompt}
    ]
    resp = claude.chat(
        model=model,
        messages=messages,
        max_tokens_to_sample=max_tokens
    )
    return resp['completion']
