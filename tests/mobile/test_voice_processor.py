"""
Comprehensive tests for enhanced voice processor with advanced speech recognition.
"""

import asyncio
from unittest.mock import Mock, patch

import numpy as np
import pytest

from proxy_agent_platform.mobile.voice_processor import (
    HealthContext,
    VoiceCommand,
    VoiceContext,
    VoiceContextManager,
    VoiceEntity,
    VoiceEntityExtractor,
    VoiceIntent,
    VoiceIntentClassifier,
    VoiceProcessingConfig,
    VoiceProcessor,
    WorkflowTrigger,
    WorkflowVoiceRouter,
)


class TestVoiceCommand:
    """Test VoiceCommand dataclass and methods."""

    def test_voice_command_creation(self):
        """Test voice command creation with all fields."""
        command = VoiceCommand(
            id="cmd-123",
            text="Schedule a meeting for tomorrow",
            confidence=0.92,
            language="en-US",
            user_id="user-456"
        )

        assert command.id == "cmd-123"
        assert command.text == "Schedule a meeting for tomorrow"
        assert command.confidence == 0.92
        assert command.language == "en-US"
        assert command.user_id == "user-456"
        assert command.intent is None
        assert len(command.entities) == 0

    def test_voice_command_processing_metadata(self):
        """Test voice command with processing metadata."""
        command = VoiceCommand(
            id="cmd-456",
            text="Remind me to call John",
            confidence=0.88,
            metadata={
                "audio_length": 2.5,
                "noise_level": 0.1,
                "processing_time": 0.3
            }
        )

        assert command.metadata["audio_length"] == 2.5
        assert command.metadata["noise_level"] == 0.1

    def test_voice_command_with_entities(self):
        """Test voice command with extracted entities."""
        entities = [
            VoiceEntity(type="PERSON", value="John", confidence=0.95),
            VoiceEntity(type="TIME", value="tomorrow", confidence=0.87)
        ]

        command = VoiceCommand(
            id="cmd-789",
            text="Call John tomorrow",
            confidence=0.91,
            entities=entities
        )

        assert len(command.entities) == 2
        assert command.entities[0].type == "PERSON"
        assert command.entities[1].value == "tomorrow"


class TestVoiceIntentClassifier:
    """Test voice intent classification with TF-IDF."""

    def setup_method(self):
        """Set up test fixtures."""
        self.classifier = VoiceIntentClassifier()

    @patch('proxy_agent_platform.mobile.voice_processor.TfidfVectorizer')
    def test_classifier_initialization(self, mock_tfidf):
        """Test classifier initialization with TF-IDF."""
        classifier = VoiceIntentClassifier()

        mock_tfidf.assert_called_once()
        assert classifier.vectorizer is not None
        assert len(classifier.intent_patterns) > 0

    def test_preprocess_text(self):
        """Test text preprocessing for classification."""
        text = "Can you PLEASE schedule a Meeting for Tomorrow?"
        processed = self.classifier._preprocess_text(text)

        assert processed == "can you please schedule a meeting for tomorrow"
        assert processed.islower()

    def test_extract_features(self):
        """Test feature extraction from voice command."""
        command = VoiceCommand(
            id="test-123",
            text="Schedule a meeting",
            confidence=0.9,
            metadata={"audio_length": 2.0}
        )

        features = self.classifier._extract_features(command)

        assert "text_length" in features
        assert "confidence" in features
        assert "word_count" in features
        assert features["text_length"] == len("Schedule a meeting")
        assert features["confidence"] == 0.9
        assert features["word_count"] == 3

    @patch.object(VoiceIntentClassifier, '_calculate_similarity')
    def test_classify_intent_high_confidence(self, mock_similarity):
        """Test intent classification with high confidence."""
        mock_similarity.return_value = 0.95

        command = VoiceCommand(
            id="test-123",
            text="Schedule a meeting for tomorrow",
            confidence=0.9
        )

        intent = self.classifier.classify_intent(command)

        assert intent == VoiceIntent.SCHEDULE
        mock_similarity.assert_called()

    @patch.object(VoiceIntentClassifier, '_calculate_similarity')
    def test_classify_intent_low_confidence(self, mock_similarity):
        """Test intent classification with low confidence."""
        mock_similarity.return_value = 0.3

        command = VoiceCommand(
            id="test-123",
            text="Unclear mumbled speech",
            confidence=0.5
        )

        intent = self.classifier.classify_intent(command)

        assert intent == VoiceIntent.UNKNOWN

    def test_calculate_similarity(self):
        """Test similarity calculation between texts."""
        # Mock the vectorizer
        self.classifier.vectorizer.transform = Mock(return_value=np.array([[1, 0, 1], [1, 1, 0]]))

        text1 = "schedule meeting"
        text2 = "schedule appointment"

        similarity = self.classifier._calculate_similarity(text1, text2)

        assert 0 <= similarity <= 1
        self.classifier.vectorizer.transform.assert_called()

    def test_intent_patterns_coverage(self):
        """Test that intent patterns cover all intent types."""
        expected_intents = [intent for intent in VoiceIntent if intent != VoiceIntent.UNKNOWN]

        for intent in expected_intents:
            assert intent in self.classifier.intent_patterns
            assert len(self.classifier.intent_patterns[intent]) > 0


class TestVoiceEntityExtractor:
    """Test voice entity extraction functionality."""

    def setup_method(self):
        """Set up test fixtures."""
        self.extractor = VoiceEntityExtractor()

    def test_extract_entities_basic(self):
        """Test basic entity extraction."""
        command = VoiceCommand(
            id="test-123",
            text="Call John Smith at 5 PM tomorrow",
            confidence=0.9
        )

        entities = self.extractor.extract_entities(command)

        # Should extract person and time entities
        person_entities = [e for e in entities if e.type == "PERSON"]
        time_entities = [e for e in entities if e.type == "TIME"]

        assert len(person_entities) >= 1
        assert len(time_entities) >= 1

    def test_extract_person_entities(self):
        """Test person entity extraction."""
        text = "Call John Smith and Mary Johnson"
        entities = self.extractor._extract_person_entities(text)

        assert len(entities) >= 2
        names = [e.value for e in entities]
        assert "John Smith" in names or "John" in names
        assert "Mary Johnson" in names or "Mary" in names

    def test_extract_time_entities(self):
        """Test time entity extraction."""
        text = "Schedule for tomorrow at 3 PM"
        entities = self.extractor._extract_time_entities(text)

        assert len(entities) >= 1
        time_values = [e.value for e in entities]
        assert any("tomorrow" in value.lower() for value in time_values)

    def test_extract_task_entities(self):
        """Test task entity extraction."""
        text = "Remind me to buy groceries and call the dentist"
        entities = self.extractor._extract_task_entities(text)

        assert len(entities) >= 2
        task_values = [e.value for e in entities]
        assert any("buy groceries" in value for value in task_values)
        assert any("call the dentist" in value for value in task_values)

    def test_extract_location_entities(self):
        """Test location entity extraction."""
        text = "Meet at the office in San Francisco"
        entities = self.extractor._extract_location_entities(text)

        assert len(entities) >= 1
        locations = [e.value for e in entities]
        assert any("office" in value for value in locations)

    def test_confidence_scoring(self):
        """Test entity confidence scoring."""
        command = VoiceCommand(
            id="test-123",
            text="Call John at 5 PM",
            confidence=0.95
        )

        entities = self.extractor.extract_entities(command)

        for entity in entities:
            assert 0 <= entity.confidence <= 1
            # High input confidence should boost entity confidence
            assert entity.confidence > 0.5


class TestVoiceContextManager:
    """Test voice context management and state tracking."""

    def setup_method(self):
        """Set up test fixtures."""
        self.context_manager = VoiceContextManager()

    async def test_get_context_basic(self):
        """Test basic context retrieval."""
        context = await self.context_manager.get_context("user-123")

        assert isinstance(context, VoiceContext)
        assert context.user_id == "user-123"
        assert context.current_intent is None
        assert len(context.conversation_history) == 0

    async def test_update_context(self):
        """Test context updates with new commands."""
        command = VoiceCommand(
            id="cmd-123",
            text="Schedule a meeting",
            confidence=0.9,
            user_id="user-123",
            intent=VoiceIntent.SCHEDULE
        )

        await self.context_manager.update_context(command)

        context = await self.context_manager.get_context("user-123")
        assert context.current_intent == VoiceIntent.SCHEDULE
        assert len(context.conversation_history) == 1
        assert context.conversation_history[0].id == "cmd-123"

    async def test_context_history_management(self):
        """Test conversation history management."""
        user_id = "user-456"

        # Add multiple commands
        for i in range(15):  # Exceed default history limit
            command = VoiceCommand(
                id=f"cmd-{i}",
                text=f"Command {i}",
                confidence=0.8,
                user_id=user_id
            )
            await self.context_manager.update_context(command)

        context = await self.context_manager.get_context(user_id)

        # Should maintain only last 10 commands (default limit)
        assert len(context.conversation_history) == 10
        assert context.conversation_history[-1].id == "cmd-14"  # Most recent

    async def test_clear_context(self):
        """Test clearing user context."""
        user_id = "user-789"

        # Add some context
        command = VoiceCommand(
            id="cmd-clear",
            text="Test command",
            confidence=0.8,
            user_id=user_id,
            intent=VoiceIntent.TASK
        )
        await self.context_manager.update_context(command)

        # Clear context
        await self.context_manager.clear_context(user_id)

        context = await self.context_manager.get_context(user_id)
        assert context.current_intent is None
        assert len(context.conversation_history) == 0

    async def test_context_with_health_data(self):
        """Test context integration with health data."""
        health_context = HealthContext(
            stress_level=0.3,
            energy_level=0.8,
            focus_level=0.9
        )

        context = await self.context_manager.get_context("user-health", health_context)

        assert context.health_context is not None
        assert context.health_context.stress_level == 0.3
        assert context.health_context.energy_level == 0.8


class TestWorkflowVoiceRouter:
    """Test workflow integration and voice command routing."""

    def setup_method(self):
        """Set up test fixtures."""
        self.router = WorkflowVoiceRouter()

    async def test_route_schedule_command(self):
        """Test routing schedule voice commands to workflows."""
        command = VoiceCommand(
            id="schedule-cmd",
            text="Schedule a team meeting for tomorrow at 2 PM",
            confidence=0.92,
            intent=VoiceIntent.SCHEDULE,
            entities=[
                VoiceEntity(type="TASK", value="team meeting", confidence=0.9),
                VoiceEntity(type="TIME", value="tomorrow at 2 PM", confidence=0.85)
            ]
        )

        context = VoiceContext(user_id="user-123")

        with patch.object(self.router, '_create_schedule_workflow') as mock_create:
            mock_create.return_value = WorkflowTrigger(
                workflow_id="schedule-workflow",
                trigger_type="voice_command",
                parameters={"task": "team meeting", "time": "tomorrow at 2 PM"}
            )

            trigger = await self.router.route_to_workflow(command, context)

            assert trigger is not None
            assert trigger.workflow_id == "schedule-workflow"
            mock_create.assert_called_once_with(command, context)

    async def test_route_reminder_command(self):
        """Test routing reminder commands to workflows."""
        command = VoiceCommand(
            id="reminder-cmd",
            text="Remind me to call the dentist",
            confidence=0.88,
            intent=VoiceIntent.REMINDER,
            entities=[
                VoiceEntity(type="TASK", value="call the dentist", confidence=0.9)
            ]
        )

        context = VoiceContext(user_id="user-456")

        with patch.object(self.router, '_create_reminder_workflow') as mock_create:
            mock_create.return_value = WorkflowTrigger(
                workflow_id="reminder-workflow",
                trigger_type="voice_command",
                parameters={"task": "call the dentist"}
            )

            trigger = await self.router.route_to_workflow(command, context)

            assert trigger is not None
            assert trigger.workflow_id == "reminder-workflow"

    async def test_route_unknown_command(self):
        """Test handling unknown voice commands."""
        command = VoiceCommand(
            id="unknown-cmd",
            text="Unclear mumbled speech",
            confidence=0.4,
            intent=VoiceIntent.UNKNOWN
        )

        context = VoiceContext(user_id="user-789")

        trigger = await self.router.route_to_workflow(command, context)

        assert trigger is None

    async def test_context_aware_routing(self):
        """Test context-aware workflow routing."""
        # Set up context with previous scheduling intent
        context = VoiceContext(
            user_id="user-context",
            current_intent=VoiceIntent.SCHEDULE,
            conversation_history=[]
        )

        # Follow-up command without explicit intent
        command = VoiceCommand(
            id="followup-cmd",
            text="Make it for 3 PM instead",
            confidence=0.85,
            intent=VoiceIntent.UNKNOWN  # Classifier couldn't determine intent
        )

        with patch.object(self.router, '_handle_followup_command') as mock_followup:
            mock_followup.return_value = WorkflowTrigger(
                workflow_id="update-schedule-workflow",
                trigger_type="voice_followup",
                parameters={"update": "time", "new_value": "3 PM"}
            )

            trigger = await self.router.route_to_workflow(command, context)

            assert trigger is not None
            mock_followup.assert_called_once()

    def test_create_schedule_workflow(self):
        """Test schedule workflow creation."""
        command = VoiceCommand(
            id="test-schedule",
            text="Schedule daily standup",
            confidence=0.9,
            entities=[
                VoiceEntity(type="TASK", value="daily standup", confidence=0.95)
            ]
        )

        context = VoiceContext(user_id="user-schedule")

        trigger = self.router._create_schedule_workflow(command, context)

        assert trigger.workflow_id.startswith("schedule_")
        assert trigger.trigger_type == "voice_command"
        assert "task" in trigger.parameters

    def test_create_reminder_workflow(self):
        """Test reminder workflow creation."""
        command = VoiceCommand(
            id="test-reminder",
            text="Remind me about the presentation",
            confidence=0.87,
            entities=[
                VoiceEntity(type="TASK", value="presentation", confidence=0.9),
                VoiceEntity(type="TIME", value="in 1 hour", confidence=0.8)
            ]
        )

        context = VoiceContext(user_id="user-reminder")

        trigger = self.router._create_reminder_workflow(command, context)

        assert trigger.workflow_id.startswith("reminder_")
        assert "task" in trigger.parameters
        assert "time" in trigger.parameters


@pytest.mark.asyncio
class TestVoiceProcessor:
    """Test the main VoiceProcessor class."""

    def setup_method(self):
        """Set up test fixtures."""
        config = VoiceProcessingConfig(
            language="en-US",
            confidence_threshold=0.7,
            max_processing_time=5.0,
            enable_health_context=True
        )
        self.processor = VoiceProcessor(config=config)

    async def test_process_voice_command_success(self):
        """Test successful voice command processing."""
        command = VoiceCommand(
            id="process-test",
            text="Schedule a meeting for tomorrow",
            confidence=0.9,
            user_id="user-process"
        )

        # Mock the internal components
        with patch.object(self.processor.intent_classifier, 'classify_intent') as mock_intent, \
             patch.object(self.processor.entity_extractor, 'extract_entities') as mock_entities, \
             patch.object(self.processor.workflow_router, 'route_to_workflow') as mock_route:

            mock_intent.return_value = VoiceIntent.SCHEDULE
            mock_entities.return_value = [
                VoiceEntity(type="TIME", value="tomorrow", confidence=0.85)
            ]
            mock_route.return_value = WorkflowTrigger(
                workflow_id="schedule-workflow",
                trigger_type="voice_command",
                parameters={}
            )

            result = await self.processor.process_voice_command(command)

            assert result is not None
            assert result.workflow_id == "schedule-workflow"
            assert command.intent == VoiceIntent.SCHEDULE
            assert len(command.entities) == 1

            # Verify all components were called
            mock_intent.assert_called_once_with(command)
            mock_entities.assert_called_once_with(command)
            mock_route.assert_called_once()

    async def test_process_voice_command_low_confidence(self):
        """Test processing voice command with low confidence."""
        command = VoiceCommand(
            id="low-confidence",
            text="Unclear audio",
            confidence=0.3,  # Below threshold
            user_id="user-low"
        )

        result = await self.processor.process_voice_command(command)

        assert result is None

    async def test_process_voice_command_with_health_context(self):
        """Test processing with health context integration."""
        command = VoiceCommand(
            id="health-test",
            text="I'm feeling stressed, remind me to take a break",
            confidence=0.9,
            user_id="user-health"
        )

        health_context = HealthContext(
            stress_level=0.8,  # High stress
            energy_level=0.3,  # Low energy
            focus_level=0.4    # Low focus
        )

        with patch.object(self.processor.context_manager, 'get_context') as mock_context:
            mock_context.return_value = VoiceContext(
                user_id="user-health",
                health_context=health_context
            )

            result = await self.processor.process_voice_command(command)

            # Should consider health context in processing
            mock_context.assert_called_once()

    async def test_generate_voice_response(self):
        """Test voice response generation."""
        trigger = WorkflowTrigger(
            workflow_id="test-workflow",
            trigger_type="voice_command",
            parameters={"task": "meeting", "time": "tomorrow"}
        )

        context = VoiceContext(user_id="user-response")

        response = await self.processor.generate_voice_response(trigger, context)

        assert isinstance(response, str)
        assert len(response) > 0
        # Should contain relevant information
        assert "meeting" in response.lower() or "schedule" in response.lower()

    async def test_health_aware_response_generation(self):
        """Test health-aware response generation."""
        trigger = WorkflowTrigger(
            workflow_id="stress-workflow",
            trigger_type="voice_command",
            parameters={"action": "break_reminder"}
        )

        health_context = HealthContext(
            stress_level=0.9,
            energy_level=0.2,
            focus_level=0.3
        )

        context = VoiceContext(
            user_id="user-stressed",
            health_context=health_context
        )

        response = await self.processor.generate_voice_response(trigger, context)

        # Should adapt response based on high stress
        assert "stress" in response.lower() or "relax" in response.lower() or "break" in response.lower()

    async def test_start_listening(self):
        """Test starting voice listening mode."""
        with patch.object(self.processor, '_initialize_audio_capture') as mock_init:
            await self.processor.start_listening("user-listen")

            assert self.processor.is_listening
            mock_init.assert_called_once()

    async def test_stop_listening(self):
        """Test stopping voice listening mode."""
        # Start listening first
        self.processor.is_listening = True

        with patch.object(self.processor, '_cleanup_audio_capture') as mock_cleanup:
            await self.processor.stop_listening()

            assert not self.processor.is_listening
            mock_cleanup.assert_called_once()

    @patch('proxy_agent_platform.mobile.voice_processor.asyncio.sleep')
    async def test_continuous_listening_loop(self, mock_sleep):
        """Test continuous listening loop."""
        self.processor.is_listening = True

        # Mock audio processing
        with patch.object(self.processor, '_process_audio_chunk') as mock_process:
            mock_process.return_value = None  # No command detected

            # Start the listening loop
            listen_task = asyncio.create_task(self.processor._continuous_listening_loop())

            # Let it run briefly
            await asyncio.sleep(0.1)
            self.processor.is_listening = False  # Stop the loop
            await asyncio.sleep(0.1)

            listen_task.cancel()

            # Verify it was processing audio
            mock_process.assert_called()


@pytest.mark.integration
class TestVoiceProcessorIntegration:
    """Integration tests for voice processor with external dependencies."""

    @pytest.fixture
    def processor_with_mocks(self):
        """Create processor with mocked external dependencies."""
        config = VoiceProcessingConfig(
            language="en-US",
            confidence_threshold=0.7,
            enable_health_context=True
        )
        processor = VoiceProcessor(config=config)

        # Mock external services
        processor._speech_service = Mock()
        processor._workflow_service = Mock()
        processor._health_service = Mock()

        return processor

    async def test_end_to_end_voice_processing(self, processor_with_mocks):
        """Test complete voice processing flow."""
        processor = processor_with_mocks

        # Configure mocks
        processor._speech_service.transcribe.return_value = {
            "text": "Schedule a team meeting for tomorrow",
            "confidence": 0.92
        }
        processor._workflow_service.trigger_workflow.return_value = True
        processor._health_service.get_current_state.return_value = HealthContext(
            stress_level=0.2,
            energy_level=0.8,
            focus_level=0.9
        )

        # Simulate audio input
        audio_data = b"mock_audio_data"

        result = await processor.process_audio_input(audio_data, "user-e2e")

        assert result is not None
        # Verify external service calls
        processor._speech_service.transcribe.assert_called_once()
        processor._workflow_service.trigger_workflow.assert_called_once()

    async def test_multi_turn_conversation(self, processor_with_mocks):
        """Test multi-turn conversation handling."""
        processor = processor_with_mocks
        user_id = "user-conversation"

        # First command
        command1 = VoiceCommand(
            id="turn-1",
            text="Schedule a meeting",
            confidence=0.9,
            user_id=user_id,
            intent=VoiceIntent.SCHEDULE
        )

        result1 = await processor.process_voice_command(command1)

        # Follow-up command
        command2 = VoiceCommand(
            id="turn-2",
            text="Make it for 3 PM",
            confidence=0.85,
            user_id=user_id
        )

        result2 = await processor.process_voice_command(command2)

        # Should handle follow-up based on context
        context = await processor.context_manager.get_context(user_id)
        assert len(context.conversation_history) == 2


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
