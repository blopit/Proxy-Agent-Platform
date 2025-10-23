#!/bin/bash
curl -X POST http://localhost:8000/api/v1/mobile/quick-capture \
  -H "Content-Type: application/json" \
  -d '{"text": "Research competitors and write a summary report", "user_id": "test", "voice_input": false, "auto_mode": true, "ask_for_clarity": false}' \
  2>&1 | python3 -m json.tool
