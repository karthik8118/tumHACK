from anthropic import Anthropic
from backend.config import ANTHROPIC_API_KEY, MAX_CLAUDE_TOKENS

claude_client = Anthropic(api_key=ANTHROPIC_API_KEY)

def claude_ask(prompt: str, max_tokens: int = MAX_CLAUDE_TOKENS, model: str = "claude-3"):
    """
    Wrapper for Claude completion.
    Returns completion text as string.
    """
    from anthropic import HumanMessage, SystemMessage, ChatCompletion

    messages = [
        SystemMessage(content="You are a VC analyst. Respond only with concise JSON."),
        HumanMessage(content=prompt)
    ]
    try:
        resp = claude_client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens_to_sample=max_tokens
        )
        # Return content of first assistant message
        return resp.choices[0].message.content
    except Exception as e:
        return f"CLAUDE request failed: {str(e)}"
