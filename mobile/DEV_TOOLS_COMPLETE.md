# Developer Tools - Complete ✅

## What Was Created

A comprehensive developer tools screen for testing, debugging, and development workflows.

## Access Methods

### 1. Direct URL
Navigate to: **http://localhost:8081/dev**

### 2. From You Tab
1. Go to the **You** tab
2. Scroll to bottom
3. Click **"Developer Tools"** (yellow icon, only visible in dev mode)

### 3. Browser Console
```javascript
window.location.href = '/dev';
```

## Features

### 📊 Current State Dashboard
- **Authentication Status** (Yes/No with green/red indicator)
- **Onboarding Status** (Yes/No with green/orange indicator)
- **Active Profile** (current profile name)
- **User Details** (User ID, email, username)

### 🔧 Quick Actions

1. **Refresh State** (Cyan)
   - Reloads all storage data
   - Updates dashboard display

2. **Reset Onboarding** (Orange)
   - Clears onboarding data
   - Shows onboarding flow again
   - Disabled if not onboarded

3. **Clear Auth Data** (Orange)
   - Logs you out
   - Removes tokens
   - Disabled if not authenticated

4. **Clear All Storage** (Red)
   - ⚠️ Nuclear option
   - Clears everything
   - Reloads app

5. **Go to Capture Tab** (Blue)
   - Quick navigation to capture/add
   - Test post-login flow

### 🔍 AsyncStorage Inspector

Tap any item with a green checkmark to view its JSON data:
- `TOKEN` - Access token
- `REFRESH_TOKEN` - Refresh token
- `USER` - User object
- `ONBOARDING_DATA` - Onboarding preferences
- `ONBOARDING_PROGRESS` - Step tracking

### 🌍 Environment Info
- Platform (Web/Native)
- Current URL

## Common Workflows

### Test as New User
```
1. Go to /dev
2. Click "Clear All Storage"
3. App reloads to login
4. Sign in with Google
5. See onboarding flow ✓
```

### Test as Returning User
```
1. Complete onboarding once
2. Go to /dev
3. Click "Clear Auth Data" (NOT "Clear All")
4. Sign in with Google
5. Skip onboarding, go to capture/add ✓
```

### Debug OAuth Redirect
```
1. After login, go to /dev
2. Check "Authenticated" and "Onboarded" status
3. Tap "ONBOARDING_DATA" to view JSON
4. Check completedAt and skipped fields
```

## Files Created

1. **`/mobile/app/dev.tsx`** - Main dev tools screen
   - Full-featured developer dashboard
   - Quick actions for common testing scenarios
   - AsyncStorage inspector
   - Environment info display

2. **`/mobile/DEV_TOOLS_GUIDE.md`** - Complete user guide
   - Feature descriptions
   - Testing workflows
   - Keyboard shortcuts
   - Troubleshooting

3. **`/mobile/DEV_TOOLS_COMPLETE.md`** - This summary

## Files Modified

1. **`/mobile/app/(tabs)/you.tsx`** - Added link to dev tools
   - Shows in "Help & Support" section
   - Only visible when `__DEV__ === true`
   - Yellow highlighted with Settings icon
   - Separated from other items with top border

## Design Decisions

### Why a separate route?
- Clean, dedicated space for all dev tools
- Doesn't clutter main app UI
- Easy to bookmark
- Can be hidden in production builds

### Why add link in You tab?
- Easy access during testing
- Discoverable for team members
- Only shows in dev mode (`__DEV__`)
- Visually distinct (yellow color)

### Why confirm destructive actions?
- Prevent accidental data loss
- Clear about what will happen
- Safe to click around

### Why show storage inspector?
- Debug auth issues (check if token exists)
- Debug onboarding issues (check completedAt)
- Verify data is being saved correctly
- Educational for team members

## Usage Tips

1. **Keep it bookmarked**: Add `http://localhost:8081/dev` to browser bookmarks

2. **Two-tab workflow**:
   - Tab 1: Main app
   - Tab 2: Dev tools (for quick state checks)

3. **Console + Dev Tools**: Keep browser console open when using dev tools for full logs

4. **Always test both flows**:
   - New user flow (Clear All Storage)
   - Returning user flow (Clear Auth only)

## Safety Features

✅ Confirmation dialogs on destructive actions
✅ Only visible in development mode (`__DEV__`)
✅ Can always "Clear All Storage" to recover
✅ Logout uses proper AuthContext methods
✅ Reset onboarding uses proper OnboardingContext methods

## Future Enhancements

Potential additions:
- Export/Import storage data (save/load test scenarios)
- API call history viewer
- Network request inspector
- Performance metrics
- Mock backend responses
- Quick login with test credentials
- View/edit AsyncStorage in real-time
- Clear specific storage keys

## Production Build

When building for production, the dev tools:
- Won't be accessible (route exists but no navigation to it)
- Link in You tab is hidden (`__DEV__ === false`)
- Zero impact on bundle size if properly tree-shaken
- Consider removing `/dev` route entirely in production builds

---

**Ready to use! 🚀**

Navigate to **http://localhost:8081/dev** or click "Developer Tools" in the You tab.
