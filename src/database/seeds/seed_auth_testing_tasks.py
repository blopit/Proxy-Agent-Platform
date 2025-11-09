"""
Seed file for authentication and onboarding testing tasks.
Creates trackable testing tasks in the dogfooding system.
"""

import json
import uuid
from datetime import UTC, datetime

from src.database.enhanced_adapter import get_enhanced_database


def seed_auth_testing_tasks():
    """
    Seed authentication and onboarding testing tasks.
    Creates 15 testable tasks that can be assigned and tracked through the delegation system.
    """
    db = get_enhanced_database()

    # Testing tasks with detailed acceptance criteria
    testing_tasks = [
        # Group 1: Authentication Components (4 tasks)
        {
            "task_id": str(uuid.uuid4()),
            "title": "AUTH-01: Test Landing Screen",
            "description": """Test landing screen rendering and navigation.

## What to Test:
1. Screen renders without errors
2. App branding displays correctly
3. Feature highlights are visible
4. CTA buttons work (Get Started, I have an account)

## Acceptance Criteria:
- [ ] Landing screen loads in < 1 second
- [ ] All text and emojis render correctly
- [ ] "Get Started" button navigates to signup
- [ ] "I have an account" button navigates to login
- [ ] Solarized Dark theme applied correctly

## Validation:
Launch: npx expo start
Verify navigation flows on device/simulator
            """,
            "tags": ["auth", "mobile", "ui", "navigation", "testing"],
            "priority": "high",
            "status": "todo",
            "is_meta_task": True,
            "delegation_mode": "delegate",
            "estimated_hours": 0.25,
        },
        {
            "task_id": str(uuid.uuid4()),
            "title": "AUTH-02: Test Login Screen",
            "description": "Test login screen with mock credentials and validation",
            "category": "testing",
            "tags": ["auth", "mobile", "forms", "validation"],
            "priority": "high",
            "status": "pending",
            "is_meta_task": True,
            "delegation_mode": "delegate",
            "estimated_hours": 0.3,
            "details": """
## Test Login Screen Functionality

### What to Test:
1. Email/password form validation
2. Error messages for invalid input
3. Loading states during login
4. Navigation after successful login
5. "Sign Up" link navigation

### Acceptance Criteria:
- [ ] Email validation catches invalid formats
- [ ] Password field is secure (hidden text)
- [ ] Empty fields show validation errors
- [ ] Loading spinner appears during API call
- [ ] Error messages are user-friendly
- [ ] Successful login navigates to onboarding

### Test Cases:
- Empty email and password
- Invalid email format
- Valid credentials (mock)
- Network error handling
            """,
        },
        {
            "task_id": str(uuid.uuid4()),
            "title": "AUTH-03: Test Signup Screen",
            "description": "Test signup screen validation and user creation flow",
            "category": "testing",
            "tags": ["auth", "mobile", "forms", "validation"],
            "priority": "high",
            "status": "pending",
            "is_meta_task": True,
            "delegation_mode": "delegate",
            "estimated_hours": 0.3,
            "details": """
## Test Signup Screen Validation

### What to Test:
1. Full name, email, password fields
2. Password confirmation matching
3. Password minimum length (8 characters)
4. Form validation before submission
5. Successful signup flow

### Acceptance Criteria:
- [ ] All fields required before submit
- [ ] Password and confirm password must match
- [ ] Password must be 8+ characters
- [ ] Validation errors show inline
- [ ] Successful signup navigates to onboarding welcome
- [ ] "Sign In" link navigates to login

### Test Cases:
- Mismatched passwords
- Password too short (< 8 chars)
- Invalid email format
- Valid signup data (mock)
            """,
        },
        {
            "task_id": str(uuid.uuid4()),
            "title": "AUTH-04: Test OAuth Buttons",
            "description": "Test social login button interactions",
            "category": "testing",
            "tags": ["auth", "mobile", "oauth", "social"],
            "priority": "medium",
            "status": "pending",
            "is_meta_task": True,
            "delegation_mode": "delegate",
            "estimated_hours": 0.2,
            "details": """
## Test OAuth Button Interactions

### What to Test:
1. Google OAuth button
2. Apple OAuth button
3. GitHub OAuth button
4. Button press handlers
5. Loading states

### Acceptance Criteria:
- [ ] All OAuth buttons render with correct icons
- [ ] Buttons are disabled during loading
- [ ] Button press triggers OAuth handler
- [ ] OAuth cancellation doesn't show error
- [ ] (Future) OAuth success navigates to onboarding

### Note:
Full OAuth flow requires configuration. For now, test that:
- Buttons exist and are clickable
- Handlers are triggered
- No crashes on button press
            """,
        },
        # Group 2: Onboarding Flow (7 tasks)
        {
            "task_id": str(uuid.uuid4()),
            "title": "OB-01: Test Welcome Screen",
            "description": "Test onboarding welcome screen with progress and navigation",
            "category": "testing",
            "tags": ["onboarding", "mobile", "navigation"],
            "priority": "high",
            "status": "pending",
            "is_meta_task": True,
            "delegation_mode": "delegate",
            "estimated_hours": 0.2,
            "details": """
## Test Onboarding Welcome Screen

### What to Test:
1. Progress indicator shows "Step 1 of 7"
2. Welcome message and benefits list
3. "Get Started" button navigation
4. "Skip for now" button navigation
5. Info box with time estimate

### Acceptance Criteria:
- [ ] Progress bar shows 14% (1/7)
- [ ] All 4 benefit items visible
- [ ] "Get Started" navigates to work-preferences
- [ ] "Skip for now" navigates to main app (tabs)
- [ ] Screen animations smooth

### Validation:
Check OnboardingContext marks WELCOME step complete
            """,
        },
        {
            "task_id": str(uuid.uuid4()),
            "title": "OB-02: Test Work Preferences",
            "description": "Test work preference selection screen",
            "category": "testing",
            "tags": ["onboarding", "mobile", "selection"],
            "priority": "high",
            "status": "pending",
            "is_meta_task": True,
            "delegation_mode": "delegate",
            "estimated_hours": 0.25,
            "details": """
## Test Work Preferences Selection

### What to Test:
1. 4 work mode options (Remote, Hybrid, Office, Flexible)
2. Visual selection feedback
3. Continue button enabled only when selected
4. Back button navigation
5. Data persistence

### Acceptance Criteria:
- [ ] Progress bar shows 28% (2/7)
- [ ] All 4 options render with icons
- [ ] Selection shows checkmark and color change
- [ ] Continue button disabled until selection
- [ ] Back button returns to welcome
- [ ] Selected preference saved to AsyncStorage

### Test Cases:
- Select each option and verify visual feedback
- Navigate forward and back
- Check AsyncStorage persistence
            """,
        },
        {
            "task_id": str(uuid.uuid4()),
            "title": "OB-03: Test ADHD Support Screen",
            "description": "Test ADHD support level slider and challenges selection",
            "category": "testing",
            "tags": ["onboarding", "mobile", "slider", "selection"],
            "priority": "high",
            "status": "pending",
            "is_meta_task": True,
            "delegation_mode": "delegate",
            "estimated_hours": 0.3,
            "details": """
## Test ADHD Support Screen

### What to Test:
1. Slider functionality (1-10 scale)
2. Dynamic color-coded feedback
3. Description updates based on slider
4. Challenge chips selection
5. Data persistence

### Acceptance Criteria:
- [ ] Progress bar shows 42% (3/7)
- [ ] Slider moves smoothly from 1-10
- [ ] Color changes based on level (green → yellow → orange → red)
- [ ] Description text updates dynamically
- [ ] Challenge chips toggle on/off
- [ ] Multiple challenges can be selected
- [ ] Data saved to AsyncStorage

### Test Cases:
- Move slider to different positions
- Select multiple challenges
- Verify color coding: 1-3 (green), 4-6 (yellow), 7-8 (orange), 9-10 (red)
            """,
        },
        {
            "task_id": str(uuid.uuid4()),
            "title": "OB-04: Test Daily Schedule Screen",
            "description": "Test daily schedule and availability selection",
            "category": "testing",
            "tags": ["onboarding", "mobile", "calendar", "schedule"],
            "priority": "high",
            "status": "pending",
            "is_meta_task": True,
            "delegation_mode": "delegate",
            "estimated_hours": 0.25,
            "details": """
## Test Daily Schedule Screen

### What to Test:
1. Time preference chips (6 options)
2. Weekly availability buttons (7 days)
3. Flexible schedule toggle
4. Data persistence

### Acceptance Criteria:
- [ ] Progress bar shows 57% (4/7)
- [ ] All 6 time preferences selectable
- [ ] All 7 day buttons toggle on/off
- [ ] Multiple days can be selected
- [ ] Flexible schedule toggle works
- [ ] Info box displays guidance
- [ ] All data saved to AsyncStorage

### Test Cases:
- Select different time preferences
- Toggle each day of week
- Enable flexible schedule toggle
- Verify persistence across app restart
            """,
        },
        {
            "task_id": str(uuid.uuid4()),
            "title": "OB-05: Test Productivity Goals Screen",
            "description": "Test productivity goals creation and management",
            "category": "testing",
            "tags": ["onboarding", "mobile", "modal", "goals"],
            "priority": "high",
            "status": "pending",
            "is_meta_task": True,
            "delegation_mode": "delegate",
            "estimated_hours": 0.35,
            "details": """
## Test Productivity Goals Screen

### What to Test:
1. Add goal button opens modal
2. Goal type selection (8 types)
3. Goal text input
4. Add goal to list
5. Remove goal functionality
6. Continue button requires >= 1 goal

### Acceptance Criteria:
- [ ] Progress bar shows 71% (5/7)
- [ ] "Add Goal" button opens modal
- [ ] All 8 goal types selectable
- [ ] Text input placeholder updates per type
- [ ] Goals appear in list with emoji/label
- [ ] Remove (X) button deletes goal
- [ ] Continue disabled until 1+ goals added
- [ ] Goals saved to AsyncStorage

### Test Cases:
- Add goal of each type
- Add multiple goals
- Remove goals
- Try to continue with 0 goals (should be disabled)
- Verify persistence
            """,
        },
        {
            "task_id": str(uuid.uuid4()),
            "title": "OB-06: Test ChatGPT Export Screen",
            "description": "Test ChatGPT prompt generation and copy functionality",
            "category": "testing",
            "tags": ["onboarding", "mobile", "clipboard", "innovation"],
            "priority": "critical",
            "status": "pending",
            "is_meta_task": True,
            "delegation_mode": "delegate",
            "estimated_hours": 0.3,
            "details": """
## Test ChatGPT Export Feature ⭐ INNOVATION

### What to Test:
1. Prompt generation from onboarding data
2. Prompt preview display
3. Copy to clipboard functionality
4. Success feedback
5. Prompt format and content

### Acceptance Criteria:
- [ ] Progress bar shows 85% (6/7)
- [ ] Prompt includes ALL onboarding data:
  - Work preference
  - ADHD support level
  - ADHD challenges
  - Daily schedule (time preference, days)
  - Productivity goals (all listed)
- [ ] Prompt is well-formatted and readable
- [ ] Copy button works on device
- [ ] Success alert appears after copy
- [ ] Button changes to "Copied!" with checkmark
- [ ] 3-step usage instructions visible

### Test Cases:
- Complete onboarding with varied data
- Verify prompt dynamically includes all fields
- Test copy to clipboard
- Paste into notes app to verify
- Check button visual feedback
            """,
        },
        {
            "task_id": str(uuid.uuid4()),
            "title": "OB-07: Test Completion Screen",
            "description": "Test onboarding completion screen and animations",
            "category": "testing",
            "tags": ["onboarding", "mobile", "animations", "completion"],
            "priority": "high",
            "status": "pending",
            "is_meta_task": True,
            "delegation_mode": "delegate",
            "estimated_hours": 0.2,
            "details": """
## Test Onboarding Completion Screen

### What to Test:
1. Animations on screen load
2. Progress shows 100%
3. Feature previews display
4. Launch button navigation
5. Completion data save

### Acceptance Criteria:
- [ ] Progress bar shows 100% (7/7)
- [ ] Success icon animates on load
- [ ] All 4 feature previews visible
- [ ] Personal note displays
- [ ] "Launch Proxy Agent" button navigates to main app
- [ ] OnboardingContext.completeOnboarding() called
- [ ] AsyncStorage marked as completed
- [ ] Backend submission attempted (can fail gracefully)

### Test Cases:
- Observe animations on screen load
- Verify all feature previews render
- Press launch button
- Confirm navigation to /(tabs)
- Check AsyncStorage has completedAt timestamp
            """,
        },
        # Group 3: State Management (3 tasks)
        {
            "task_id": str(uuid.uuid4()),
            "title": "STATE-01: Test OnboardingContext CRUD",
            "description": "Test OnboardingContext state management operations",
            "category": "testing",
            "tags": ["state", "context", "mobile"],
            "priority": "high",
            "status": "pending",
            "is_meta_task": True,
            "delegation_mode": "delegate",
            "estimated_hours": 0.3,
            "details": """
## Test OnboardingContext Operations

### What to Test:
1. setWorkPreference() updates state
2. setADHDSupportLevel() updates state
3. setDailySchedule() updates state
4. setProductivityGoals() updates state
5. markStepComplete() updates progress
6. nextStep() / previousStep() navigation
7. completeOnboarding() / skipOnboarding()

### Acceptance Criteria:
- [ ] All setter methods update context state
- [ ] State changes persist to AsyncStorage immediately
- [ ] Progress tracking updates correctly
- [ ] completedSteps array grows
- [ ] hasCompletedOnboarding becomes true on complete
- [ ] Data structure matches OnboardingData type

### Test Approach:
Use React DevTools or console.log to verify:
- State updates after each method call
- AsyncStorage contains expected data
- Re-renders happen when state changes
            """,
        },
        {
            "task_id": str(uuid.uuid4()),
            "title": "STATE-02: Test AuthContext Token Management",
            "description": "Test AuthContext authentication state management",
            "category": "testing",
            "tags": ["auth", "state", "context", "mobile"],
            "priority": "high",
            "status": "pending",
            "is_meta_task": True,
            "delegation_mode": "delegate",
            "estimated_hours": 0.25,
            "details": """
## Test AuthContext Token Management

### What to Test:
1. login() saves token and user data
2. logout() clears token and user data
3. Token persistence across app restarts
4. User object structure

### Acceptance Criteria:
- [ ] login() saves token to AsyncStorage
- [ ] login() updates user state
- [ ] logout() clears all auth data
- [ ] Token persists after app close/reopen
- [ ] isLoading state works correctly
- [ ] user object matches expected shape

### Test Cases:
- Mock login with token and user data
- Verify AsyncStorage has @proxy_agent:auth_token
- Close and reopen app
- Verify token still exists
- Call logout
- Verify token removed
            """,
        },
        {
            "task_id": str(uuid.uuid4()),
            "title": "STATE-03: Test AsyncStorage Persistence",
            "description": "Test AsyncStorage data persistence across sessions",
            "category": "testing",
            "tags": ["storage", "persistence", "mobile"],
            "priority": "medium",
            "status": "pending",
            "is_meta_task": True,
            "delegation_mode": "delegate",
            "estimated_hours": 0.2,
            "details": """
## Test AsyncStorage Persistence

### What to Test:
1. Onboarding data persists
2. Auth token persists
3. User data persists
4. Progress tracking persists

### Acceptance Criteria:
- [ ] Complete onboarding → Close app → Reopen
- [ ] Onboarding data still exists
- [ ] Auth token still exists
- [ ] hasCompletedOnboarding remains true
- [ ] No re-navigation to onboarding

### Test Cases:
1. Complete onboarding
2. Force quit app
3. Relaunch app
4. Verify immediate navigation to main app
5. Check AsyncStorage keys exist:
   - @proxy_agent:onboarding_data
   - @proxy_agent:onboarding_progress
   - @proxy_agent:auth_token
            """,
        },
        # Integration Tasks (1 task representing all E2E flows)
        {
            "task_id": str(uuid.uuid4()),
            "title": "E2E: Test Complete User Journeys",
            "description": "Test end-to-end user flows: new user, returning user, skip flow",
            "category": "testing",
            "tags": ["e2e", "integration", "mobile", "flows"],
            "priority": "critical",
            "status": "pending",
            "is_meta_task": True,
            "delegation_mode": "delegate",
            "estimated_hours": 0.75,
            "details": """
## End-to-End User Journey Testing

### Flow 1: New User Journey (30 min)
**Test:** Signup → Onboarding → Main App
```
1. Clear all app data
2. Launch app
3. Tap "Get Started"
4. Fill signup form
5. Complete all 7 onboarding screens
6. Verify redirect to /(tabs)
7. Verify data in AsyncStorage
```

**Validation:**
- [ ] No navigation errors
- [ ] All data saved correctly
- [ ] Main app loads successfully

### Flow 2: Returning User Journey (15 min)
**Test:** Login → Check Onboarding → Main App
```
1. Fresh app install (or clear data)
2. Mock existing user with completed onboarding
3. Navigate to login
4. Enter credentials
5. Verify immediate redirect to /(tabs) (skip onboarding)
```

**Validation:**
- [ ] No onboarding screens shown
- [ ] Direct navigation to main app
- [ ] User data loaded

### Flow 3: Skip Functionality (15 min)
**Test:** Signup → Skip Onboarding → Main App
```
1. Create new account
2. On onboarding welcome screen, tap "Skip for now"
3. Verify redirect to /(tabs)
4. Verify skipped=true in AsyncStorage
```

**Validation:**
- [ ] Skip works from any onboarding screen
- [ ] App allows main feature access
- [ ] Can complete onboarding later (future)

### All Flows Must:
- [ ] Have no crashes
- [ ] Show proper loading states
- [ ] Handle errors gracefully
- [ ] Persist data correctly
            """,
        },
    ]

    # Insert tasks into database
    print(f"🌱 Seeding {len(testing_tasks)} auth/onboarding testing tasks...")

    conn = db.get_connection()
    cursor = conn.cursor()

    # Create auth-testing project
    project_id = "auth-testing"
    cursor.execute(
        """
        INSERT OR REPLACE INTO projects (
            project_id, name, description, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            project_id,
            "Auth & Onboarding Testing",
            "Testing tasks for authentication and onboarding implementation",
            True,
            datetime.now(UTC),
            datetime.now(UTC),
        ),
    )

    for task_data in testing_tasks:
        # Convert tags list to JSON string
        tags_json = json.dumps(task_data.get("tags", []))

        # Insert task
        cursor.execute(
            """
            INSERT INTO tasks (
                task_id, title, description, project_id, priority,
                delegation_mode, estimated_hours, is_meta_task,
                status, tags, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                task_data["task_id"],
                task_data["title"],
                task_data["description"],
                project_id,
                task_data["priority"],
                task_data["delegation_mode"],
                task_data["estimated_hours"],
                task_data["is_meta_task"],
                task_data.get("status", "todo"),
                tags_json,
                datetime.now(UTC),
                datetime.now(UTC),
            ),
        )

        print(f"  ✅ {task_data['title']}")

    conn.commit()

    print(f"\n🎉 Successfully seeded {len(testing_tasks)} testing tasks!")
    print("\nTask Summary:")
    print("  - Authentication: 4 tasks (0.25-0.3h each)")
    print("  - Onboarding Flow: 7 tasks (0.2-0.35h each)")
    print("  - State Management: 3 tasks (0.2-0.3h each)")
    print("  - End-to-End Integration: 1 task (0.75h)")
    print(f"\n  Total Estimated: ~{sum(t['estimated_hours'] for t in testing_tasks):.1f} hours")
    print("\nNext Steps:")
    print("  1. Register auth-tester agent:")
    print("     curl -X POST http://localhost:8000/api/v1/delegation/agents ...")
    print("  2. View tasks:")
    print(
        "     sqlite3 proxy_agents_enhanced.db \"SELECT title FROM tasks WHERE title LIKE 'AUTH-%' OR title LIKE 'OB-%'\""
    )
    print("  3. Assign and start testing!")


if __name__ == "__main__":
    seed_auth_testing_tasks()
