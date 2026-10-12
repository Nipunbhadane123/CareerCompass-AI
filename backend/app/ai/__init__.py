from app.ai.base import AIProviderInterface
from app.ai.deterministic_provider import DeterministicProvider
from app.ai.gemini_provider import GeminiProvider
from app.config import settings

def get_ai_provider(provider_type: str = None) -> AIProviderInterface:
    ptype = (provider_type or settings.AI_PROVIDER).lower()
    if ptype == "gemini" and settings.GEMINI_API_KEY:
        return GeminiProvider()
    return DeterministicProvider()

__all__ = ["AIProviderInterface", "DeterministicProvider", "GeminiProvider", "get_ai_provider"]
