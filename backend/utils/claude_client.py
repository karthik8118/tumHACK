import os
from anthropic import Anthropic
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key from environment
MAX_CLAUDE_TOKENS = 1000

def get_claude_client():
    """Get Claude client with current API key"""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key or api_key == "test_key" or api_key == "your_claude_api_key_here":
        return None
    try:
        return Anthropic(api_key=api_key)
    except Exception:
        return None

def claude_ask(prompt: str, max_tokens: int = MAX_CLAUDE_TOKENS, model: str = "claude-3-haiku-20240307"):
    """
    Wrapper for Claude completion.
    Returns completion text as string.
    """
    claude_client = get_claude_client()
    if not claude_client:
        api_key = os.getenv("ANTHROPIC_API_KEY", "not_set")
        return f"CLAUDE request failed: Claude client not available (API key: {api_key[:10]}...)"

    try:
        # Use the correct Anthropic API format
        response = claude_client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system="You are a SPRIND analyst evaluating research for unicorn potential. Respond with concise, accurate analysis.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Return the content from the response
        return response.content[0].text
    except Exception as e:
        return f"CLAUDE request failed: {str(e)}"

def claude_summarize_novelty(prompt: str, max_tokens: int = MAX_CLAUDE_TOKENS, model: str = "claude-3-haiku-20240307"):
    """
    Summarize and analyze novelty using Claude.
    This is an alias for claude_ask for backward compatibility.
    """
    return claude_ask(prompt, max_tokens, model)
