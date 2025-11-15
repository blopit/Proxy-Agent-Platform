"""
TDD Tests for Task Delegation System (BE-00).

Following RED-GREEN-REFACTOR workflow.
These tests define the expected behavior before implementation.
"""

from uuid import uuid4


class TestTaskDelegation:
    """Test task delegation operations."""

    def test_delegate_task_to_agent_success(self, test_client, valid_task_id):
        """RED: Should delegate a task to an agent successfully."""
        agent_id = "backend-agent-1"

        payload = {
            "task_id": valid_task_id,
            "assignee_id": agent_id,
            "assignee_type": "agent",
            "estimated_hours": 6.0,
        }

        response = test_client.post("/api/v1/delegation/delegate", json=payload)

        assert response.status_code == 201
        data = response.json()
        assert data["task_id"] == valid_task_id
        assert data["assignee_id"] == agent_id
        assert data["assignee_type"] == "agent"
        assert data["status"] == "pending"
        assert "assignment_id" in data

    def test_delegate_task_to_human_success(self, test_client, valid_task_id):
        """RED: Should delegate a task to a human successfully."""
        human_id = "user@example.com"

        payload = {
            "task_id": valid_task_id,
            "assignee_id": human_id,
            "assignee_type": "human",
            "estimated_hours": 4.0,
        }

        response = test_client.post("/api/v1/delegation/delegate", json=payload)

        assert response.status_code == 201
        data = response.json()
        assert data["assignee_type"] == "human"

    def test_delegate_task_missing_task_id_fails(self, test_client):
        """RED: Should fail when task_id is missing."""
        payload = {
            "assignee_id": "agent-1",
            "assignee_type": "agent",
        }

        response = test_client.post("/api/v1/delegation/delegate", json=payload)

        assert response.status_code == 422  # Validation error

    def test_delegate_task_invalid_assignee_type_fails(self, test_client):
        """RED: Should fail when assignee_type is invalid."""
        payload = {
            "task_id": str(uuid4()),
            "assignee_id": "someone",
            "assignee_type": "robot",  # Invalid
        }

        response = test_client.post("/api/v1/delegation/delegate", json=payload)

        assert response.status_code == 422


class TestAgentAssignments:
    """Test agent assignment queries."""

    def test_get_agent_assignments_pending(self, test_client):
        """RED: Should retrieve pending assignments for an agent."""
        agent_id = "backend-agent-1"

        response = test_client.get(
            f"/api/v1/delegation/assignments/agent/{agent_id}?status=pending"
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All assignments should be pending
        for assignment in data:
            assert assignment["status"] == "pending"
            assert assignment["assignee_id"] == agent_id

    def test_get_agent_assignments_all_statuses(self, test_client):
        """RED: Should retrieve all assignments for an agent."""
        agent_id = "backend-agent-1"

        response = test_client.get(f"/api/v1/delegation/assignments/agent/{agent_id}")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_agent_assignments_nonexistent_agent(self, test_client):
        """RED: Should return empty list for nonexistent agent."""
        response = test_client.get("/api/v1/delegation/assignments/agent/nonexistent-agent")

        assert response.status_code == 200
        assert response.json() == []


class TestAssignmentLifecycle:
    """Test assignment lifecycle (accept, complete)."""

    def test_accept_assignment_success(self, test_client, valid_task_id):
        """RED: Should accept a pending assignment."""
        # First create an assignment
        payload = {
            "task_id": valid_task_id,
            "assignee_id": "agent-1",
            "assignee_type": "agent",
        }
        create_response = test_client.post("/api/v1/delegation/delegate", json=payload)
        assignment_id = create_response.json()["assignment_id"]

        # Accept the assignment
        response = test_client.post(f"/api/v1/delegation/assignments/{assignment_id}/accept")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "in_progress"
        assert data["accepted_at"] is not None

    def test_accept_already_accepted_assignment_fails(self, test_client, valid_task_id):
        """RED: Should fail when accepting already accepted assignment."""
        # Create and accept assignment
        payload = {
            "task_id": valid_task_id,
            "assignee_id": "agent-1",
            "assignee_type": "agent",
        }
        create_response = test_client.post("/api/v1/delegation/delegate", json=payload)
        assignment_id = create_response.json()["assignment_id"]
        test_client.post(f"/api/v1/delegation/assignments/{assignment_id}/accept")

        # Try to accept again
        response = test_client.post(f"/api/v1/delegation/assignments/{assignment_id}/accept")

        assert response.status_code == 400
        assert "already accepted" in response.json()["detail"].lower()

    def test_complete_assignment_success(self, test_client, valid_task_id):
        """RED: Should complete an accepted assignment."""
        # Create and accept assignment
        payload = {
            "task_id": valid_task_id,
            "assignee_id": "agent-1",
            "assignee_type": "agent",
        }
        create_response = test_client.post("/api/v1/delegation/delegate", json=payload)
        assignment_id = create_response.json()["assignment_id"]
        test_client.post(f"/api/v1/delegation/assignments/{assignment_id}/accept")

        # Complete the assignment
        completion_payload = {"actual_hours": 5.5}
        response = test_client.post(
            f"/api/v1/delegation/assignments/{assignment_id}/complete",
            json=completion_payload,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"
        assert data["completed_at"] is not None
        assert data["actual_hours"] == 5.5

    def test_complete_pending_assignment_fails(self, test_client, valid_task_id):
        """RED: Should fail when completing unaccepted assignment."""
        # Create but don't accept
        payload = {
            "task_id": valid_task_id,
            "assignee_id": "agent-1",
            "assignee_type": "agent",
        }
        create_response = test_client.post("/api/v1/delegation/delegate", json=payload)
        assignment_id = create_response.json()["assignment_id"]

        # Try to complete without accepting
        response = test_client.post(
            f"/api/v1/delegation/assignments/{assignment_id}/complete",
            json={"actual_hours": 3.0},
        )

        assert response.status_code == 400
        assert "must be accepted" in response.json()["detail"].lower()


class TestAgentCapabilities:
    """Test agent capability management."""

    def test_register_agent_capability_success(self, test_client):
        """RED: Should register a new agent capability."""
        payload = {
            "agent_id": "backend-agent-1",
            "agent_name": "Backend TDD Agent",
            "agent_type": "backend",
            "skills": ["python", "fastapi", "tdd", "sqlalchemy"],
            "max_concurrent_tasks": 2,
        }

        response = test_client.post("/api/v1/delegation/agents", json=payload)

        assert response.status_code == 201
        data = response.json()
        assert data["agent_id"] == "backend-agent-1"
        assert data["is_available"] is True
        assert data["current_task_count"] == 0
        assert "capability_id" in data

    def test_get_available_agents_by_type(self, test_client):
        """RED: Should get available agents filtered by type."""
        response = test_client.get("/api/v1/delegation/agents?agent_type=backend")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All agents should be backend type
        for agent in data:
            assert agent["agent_type"] == "backend"

    def test_get_all_available_agents(self, test_client):
        """RED: Should get all available agents."""
        response = test_client.get("/api/v1/delegation/agents?available_only=true")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All agents should be available
        for agent in data:
            assert agent["is_available"] is True
