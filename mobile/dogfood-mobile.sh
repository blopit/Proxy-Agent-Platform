#!/bin/bash

# 🐕 Mobile App Dogfooding Helper Script
# Makes testing the auth/onboarding flow super easy!

API="http://localhost:8000"
AGENT_ID="shrenil"

case "$1" in
  register)
    echo "👤 Registering you as a mobile tester..."
    curl -X POST "$API/api/v1/delegation/agents" \
      -H "Content-Type: application/json" \
      -d "{
        \"agent_id\": \"$AGENT_ID\",
        \"agent_name\": \"Shrenil Patel\",
        \"agent_type\": \"frontend\",
        \"skills\": [\"react-native\", \"expo\", \"typescript\", \"testing\", \"mobile\"],
        \"max_concurrent_tasks\": 3
      }" 2>/dev/null | python3 -m json.tool
    echo ""
    ;;

  tasks)
    echo "📋 Available testing tasks:"
    sqlite3 ../proxy_agents_enhanced.db << 'EOF'
.mode column
.headers on
SELECT
    ROW_NUMBER() OVER (ORDER BY title) as num,
    SUBSTR(task_id, 1, 8) as id,
    title,
    ROUND(estimated_hours, 2) as hours,
    status
FROM tasks
WHERE project_id = 'auth-testing'
ORDER BY title;
EOF
    ;;

  next)
    echo "🎯 Next available task:"
    TASK=$(sqlite3 ../proxy_agents_enhanced.db "
      SELECT task_id
      FROM tasks
      WHERE project_id = 'auth-testing'
      AND status = 'todo'
      ORDER BY title
      LIMIT 1
    ")

    if [ -z "$TASK" ]; then
      echo "❌ No pending tasks found. All done! 🎉"
      exit 0
    fi

    TITLE=$(sqlite3 ../proxy_agents_enhanced.db "
      SELECT title FROM tasks WHERE task_id = '$TASK'
    ")

    echo "Task ID: $TASK"
    echo "Title: $TITLE"
    echo ""
    echo "To assign: ./dogfood-mobile.sh assign $TASK"
    ;;

  assign)
    if [ -z "$2" ]; then
      echo "Usage: ./dogfood-mobile.sh assign <task_id>"
      echo "Hint: Use './dogfood-mobile.sh next' to get the next task"
      exit 1
    fi

    echo "📌 Assigning task to you..."
    RESPONSE=$(curl -s -X POST "$API/api/v1/delegation/delegate" \
      -H "Content-Type: application/json" \
      -d "{
        \"task_id\": \"$2\",
        \"assignee_id\": \"$AGENT_ID\",
        \"assignee_type\": \"human\",
        \"estimated_hours\": 0.3
      }")

    ASSIGNMENT_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; d = json.load(sys.stdin); print(d.get('assignment_id', ''))" 2>/dev/null)

    if [ -z "$ASSIGNMENT_ID" ]; then
      echo "❌ Assignment failed. Response:"
      echo "$RESPONSE" | python3 -m json.tool
      exit 1
    fi

    echo "✅ Assigned! Assignment ID: $ASSIGNMENT_ID"
    echo ""
    echo "Next: ./dogfood-mobile.sh accept $ASSIGNMENT_ID"
    ;;

  accept)
    if [ -z "$2" ]; then
      echo "Usage: ./dogfood-mobile.sh accept <assignment_id>"
      exit 1
    fi

    echo "✅ Accepting assignment..."
    curl -s -X POST "$API/api/v1/delegation/assignments/$2/accept" | python3 -m json.tool
    echo ""
    echo "✅ Started! Now do the testing work, then:"
    echo "   ./dogfood-mobile.sh complete $2 0.3"
    ;;

  complete)
    if [ -z "$2" ] || [ -z "$3" ]; then
      echo "Usage: ./dogfood-mobile.sh complete <assignment_id> <hours>"
      echo "Example: ./dogfood-mobile.sh complete abc123 0.25"
      exit 1
    fi

    echo "🎉 Completing assignment..."
    curl -s -X POST "$API/api/v1/delegation/assignments/$2/complete" \
      -H "Content-Type: application/json" \
      -d "{\"actual_hours\": $3}" | python3 -m json.tool
    echo ""
    echo "🎉 Done! Get next task: ./dogfood-mobile.sh next"
    ;;

  progress)
    echo "📊 Your testing progress:"
    echo ""
    sqlite3 ../proxy_agents_enhanced.db << 'EOF'
.mode column
.headers on
SELECT
    status,
    COUNT(*) as count,
    ROUND(SUM(estimated_hours), 1) as est_hours
FROM tasks
WHERE project_id = 'auth-testing'
GROUP BY status;
EOF
    echo ""
    echo "Assignments:"
    sqlite3 ../proxy_agents_enhanced.db "
      SELECT
        status,
        COUNT(*) as count,
        ROUND(SUM(actual_hours), 1) as actual_hours
      FROM task_assignments
      WHERE assignee_id = 'shrenil'
      GROUP BY status
    " 2>/dev/null || echo "No assignments yet"
    ;;

  info)
    if [ -z "$2" ]; then
      echo "Usage: ./dogfood-mobile.sh info <task_id>"
      exit 1
    fi

    echo "📋 Task Information:"
    sqlite3 ../proxy_agents_enhanced.db << EOF
.mode line
SELECT
    task_id,
    title,
    description,
    status,
    priority,
    estimated_hours,
    delegation_mode
FROM tasks
WHERE task_id LIKE '$2%';
EOF
    ;;

  *)
    echo "🐕 Mobile App Dogfooding Helper"
    echo ""
    echo "Usage:"
    echo "  ./dogfood-mobile.sh register            - Register yourself as a tester"
    echo "  ./dogfood-mobile.sh tasks               - List all testing tasks"
    echo "  ./dogfood-mobile.sh next                - Get next available task"
    echo "  ./dogfood-mobile.sh assign <task_id>    - Assign task to yourself"
    echo "  ./dogfood-mobile.sh accept <assign_id>  - Accept assignment"
    echo "  ./dogfood-mobile.sh complete <id> <hrs> - Complete with actual hours"
    echo "  ./dogfood-mobile.sh progress            - Show your progress"
    echo "  ./dogfood-mobile.sh info <task_id>      - Show task details"
    echo ""
    echo "Quick workflow:"
    echo "  1. ./dogfood-mobile.sh register"
    echo "  2. ./dogfood-mobile.sh next"
    echo "  3. ./dogfood-mobile.sh assign <task_id>"
    echo "  4. ./dogfood-mobile.sh accept <assignment_id>"
    echo "  5. # Do the testing work in the app"
    echo "  6. ./dogfood-mobile.sh complete <assignment_id> 0.25"
    echo "  7. Repeat from step 2!"
    echo ""
    echo "Example (full flow):"
    echo "  ./dogfood-mobile.sh register"
    echo "  ./dogfood-mobile.sh next  # Shows task ID"
    echo "  ./dogfood-mobile.sh assign xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    echo "  ./dogfood-mobile.sh accept yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy"
    echo "  # Test AUTH-01 in the app..."
    echo "  ./dogfood-mobile.sh complete yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy 0.2"
    ;;
esac
