#!/bin/bash
# Dogfooding Helper Script
# Makes it easy to use the app to build the app!

API_URL="http://localhost:8000"
DB="proxy_agents_enhanced.db"

case "$1" in
  start)
    echo "🚀 Starting API server..."
    .venv/bin/uvicorn src.api.main:app --reload --port 8000
    ;;

  tasks)
    echo "📋 Available Development Tasks:"
    echo ""
    sqlite3 $DB << 'EOF'
.mode column
.headers on
SELECT
    ROW_NUMBER() OVER (ORDER BY
        CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
        created_at
    ) as "#",
    SUBSTR(task_id, 1, 8) as task_id,
    SUBSTR(title, 1, 50) as task,
    delegation_mode,
    priority,
    CAST(estimated_hours AS INT) as hrs
FROM tasks
WHERE is_meta_task = 1 AND status = 'pending'
ORDER BY
    CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
    created_at
LIMIT 15;
EOF
    ;;

  register)
    AGENT_ID="${2:-$USER}"
    AGENT_NAME="${3:-$(whoami)}"
    AGENT_TYPE="${4:-general}"

    echo "👤 Registering: $AGENT_NAME ($AGENT_ID) as $AGENT_TYPE"
    curl -s -X POST $API_URL/api/v1/delegation/agents \
      -H "Content-Type: application/json" \
      -d "{
        \"agent_id\": \"$AGENT_ID\",
        \"agent_name\": \"$AGENT_NAME\",
        \"agent_type\": \"$AGENT_TYPE\",
        \"skills\": [\"python\", \"typescript\", \"react\", \"fastapi\"],
        \"max_concurrent_tasks\": 3
      }" | python3 -m json.tool
    echo ""
    ;;

  find)
    if [ -z "$2" ]; then
      echo "Usage: $0 find <search_term>"
      echo "Example: $0 find FE-02"
      exit 1
    fi

    echo "🔍 Finding task: $2"
    sqlite3 $DB "SELECT task_id, title FROM tasks WHERE title LIKE '%$2%' AND is_meta_task = 1 LIMIT 5;"
    ;;

  assign)
    if [ -z "$2" ] || [ -z "$3" ]; then
      echo "Usage: $0 assign <task_id> <assignee_id>"
      echo "Example: $0 assign abc123... shrenil"
      exit 1
    fi

    TASK_ID="$2"
    ASSIGNEE_ID="$3"
    EST_HOURS="${4:-6.0}"

    echo "📌 Assigning task to $ASSIGNEE_ID..."
    RESULT=$(curl -s -X POST $API_URL/api/v1/delegation/delegate \
      -H "Content-Type: application/json" \
      -d "{
        \"task_id\": \"$TASK_ID\",
        \"assignee_id\": \"$ASSIGNEE_ID\",
        \"assignee_type\": \"human\",
        \"estimated_hours\": $EST_HOURS
      }")

    echo "$RESULT" | python3 -m json.tool

    ASSIGNMENT_ID=$(echo "$RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('assignment_id', ''))" 2>/dev/null)

    if [ -n "$ASSIGNMENT_ID" ]; then
      echo ""
      echo "✅ Assignment ID: $ASSIGNMENT_ID"
      echo "📝 Next: $0 accept $ASSIGNMENT_ID"
    fi
    ;;

  accept)
    if [ -z "$2" ]; then
      echo "Usage: $0 accept <assignment_id>"
      exit 1
    fi

    echo "✅ Accepting assignment $2..."
    curl -s -X POST "$API_URL/api/v1/delegation/assignments/$2/accept" | python3 -m json.tool
    echo ""
    echo "🚀 Assignment accepted! Start working now."
    echo "📝 When done: $0 complete $2 <hours>"
    ;;

  complete)
    if [ -z "$2" ] || [ -z "$3" ]; then
      echo "Usage: $0 complete <assignment_id> <actual_hours>"
      echo "Example: $0 complete abc123... 5.5"
      exit 1
    fi

    echo "🎉 Completing assignment $2 with $3 hours..."
    curl -s -X POST "$API_URL/api/v1/delegation/assignments/$2/complete" \
      -H "Content-Type: application/json" \
      -d "{\"actual_hours\": $3}" | python3 -m json.tool
    echo ""
    echo "✅ Task completed! Great work! 🎉"
    ;;

  my-work)
    AGENT_ID="${2:-$USER}"
    STATUS="${3}"

    echo "📊 Assignments for: $AGENT_ID"
    echo ""

    if [ -n "$STATUS" ]; then
      curl -s "$API_URL/api/v1/delegation/assignments/agent/$AGENT_ID?status=$STATUS" | python3 -m json.tool
    else
      curl -s "$API_URL/api/v1/delegation/assignments/agent/$AGENT_ID" | python3 -m json.tool
    fi
    ;;

  stats)
    AGENT_ID="${2:-$USER}"

    echo "📈 Statistics for: $AGENT_ID"
    echo ""
    sqlite3 $DB << EOF
.mode column
.headers on
SELECT
    status,
    COUNT(*) as tasks,
    ROUND(SUM(COALESCE(actual_hours, estimated_hours)), 1) as total_hours,
    ROUND(AVG(COALESCE(actual_hours, estimated_hours)), 1) as avg_hours
FROM task_assignments
WHERE assignee_id = '$AGENT_ID'
GROUP BY status;
EOF
    ;;

  quickstart)
    echo "🚀 Quick Start Workflow"
    echo ""
    echo "Recommended first task: FE-02 MiniChevronNav (4 hours, quick win)"
    echo ""

    # Get task ID
    TASK_ID=$(sqlite3 $DB "SELECT task_id FROM tasks WHERE title LIKE 'FE-02%' LIMIT 1")
    echo "Task ID: $TASK_ID"
    echo ""

    read -p "Your name: " NAME
    read -p "Agent ID (default: $USER): " AGENT_ID
    AGENT_ID="${AGENT_ID:-$USER}"

    echo ""
    echo "1️⃣ Registering you..."
    $0 register "$AGENT_ID" "$NAME" "frontend"

    echo ""
    echo "2️⃣ Assigning task..."
    $0 assign "$TASK_ID" "$AGENT_ID" 4.0
    ;;

  *)
    echo "🐕 Dogfooding Helper - Use the app to build the app!"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start                              - Start API server"
    echo "  tasks                              - List available tasks"
    echo "  find <search>                      - Find task by title"
    echo "  register [id] [name] [type]        - Register as agent"
    echo "  assign <task_id> <agent_id> [hrs]  - Assign task"
    echo "  accept <assignment_id>             - Accept assignment"
    echo "  complete <assignment_id> <hours>   - Complete with hours"
    echo "  my-work [agent_id] [status]        - Show assignments"
    echo "  stats [agent_id]                   - Show statistics"
    echo "  quickstart                         - Guided quick start"
    echo ""
    echo "Quick workflow:"
    echo "  1. $0 register"
    echo "  2. $0 tasks"
    echo "  3. $0 find FE-02"
    echo "  4. $0 assign <task_id> <your_id>"
    echo "  5. $0 accept <assignment_id>"
    echo "  6. # Do the work"
    echo "  7. $0 complete <assignment_id> 4.5"
    echo ""
    echo "Or just run: $0 quickstart"
    ;;
esac
