"""
Mobile integration package for iOS and Android platforms.

Provides seamless integration with mobile devices, wearables,
and voice assistants for productivity capture and management.
"""

from .android_integration import AndroidAPI

try:
    from .notification_manager import NotificationManager
except ImportError:
    from .notification_manager_stub import NotificationManager

try:
    from .offline_manager import OfflineManager
except ImportError:
    class OfflineManager:
        def __init__(self, *args, **kwargs):
            pass

try:
    from .voice_processor import VoiceProcessor
except ImportError:
    class VoiceProcessor:
        def __init__(self, *args, **kwargs):
            pass

try:
    from .wearable_integration import WearableAPI
except ImportError:
    class WearableAPI:
        def __init__(self, *args, **kwargs):
            pass

__all__ = ["AndroidAPI", "WearableAPI", "VoiceProcessor", "OfflineManager", "NotificationManager"]
