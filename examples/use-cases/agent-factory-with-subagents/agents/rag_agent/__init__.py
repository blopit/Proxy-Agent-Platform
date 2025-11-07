"""Semantic Search Agent Package."""

from dependencies import AgentDependencies
from providers import get_embedding_model, get_llm_model
from settings import Settings, load_settings

from agent import search_agent

__version__ = "1.0.0"

__all__ = [
    "search_agent",
    "AgentDependencies",
    "Settings",
    "load_settings",
    "get_llm_model",
    "get_embedding_model",
]
