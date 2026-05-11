# BullMQ consumer via HTTP — triggered by worker process
# Listens for ORDER_CREATED events and captures RawOrderFeatures

def build_prompt(org_profile: dict, daily_payload: dict) -> list[dict]:
    """
    P-03: Prompt caching structure.
    Stable prefix first (system prompt + org profile) will be cached by OpenAI.
    Variable payload last (not cached).
    """
    system_msg = {
        "role": "system",
        "content": "You are UGZIO, an AI social commerce assistant for Tunisian sellers."
    }
    org_context = {
        "role": "user",
        "content": f"Seller profile:\n{org_profile}"
    }
    daily_context = {
        "role": "user",
        "content": f"Today's data:\n{daily_payload}"
    }
    return [system_msg, org_context, daily_context]
