'''import anthropic

client = anthropic.Client(api_key="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")
models = client.models.list()
print(models)'''


import os
print(os.getenv("ANTHROPIC_API_KEY"))

'''from dotenv import load_dotenv
import os

load_dotenv(dotenv_path="/Users/karthikgudibanda/Desktop/tumHACK/.env")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
print(ANTHROPIC_API_KEY)'''

