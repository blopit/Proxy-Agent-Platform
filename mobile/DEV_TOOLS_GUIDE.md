# Developer Tools Guide

## Access Dev Tools

Navigate to: **http://localhost:8081/dev**

Or from anywhere in the app (in browser console):
```javascript
window.location.href = '/dev';
```

## Features

### 📊 Current State Dashboard

Instantly see:
- **Authentication Status**: Whether you're logged in
- **Onboarding Status**: Whether onboarding is complete
- **Active Profile**: Current profile selection
- **User Details**: User ID, email, username

### 🔧 Quick Actions

#### 1. Refresh State
- Reloads all storage data
- Updates the dashboard
- Use after manual storage changes

#### 2. Reset Onboarding
- Clears onboarding data from AsyncStorage
- Clears backend onboarding records
- Shows onboarding flow on next navigation
- **Only enabled if onboarding is complete**

#### 3. Clear Auth Data
- Logs you out
- Removes tokens from AsyncStorage
- Clears user data
- **Only enabled if authenticated**

#### 4. Clear All Storage
- ⚠️ **DANGER**: Clears everything
- Removes all AsyncStorage data
- Resets app to fresh install state
- Reloads the app automatically

#### 5. Go to Capture Tab
- Quick navigation to `/(tabs)/capture/add`
- Useful for testing post-login flow

### 🔍 AsyncStorage Inspector

View what's stored in AsyncStorage:
- **TOKEN** - Access token (tap to view)
- **REFRESH_TOKEN** - Refresh token
- **USER** - User data object
- **ONBOARDING_DATA** - Onboarding preferences
- **ONBOARDING_PROGRESS** - Onboarding step tracking

**Green checkmark** = Data exists (tap to view JSON)
**Red X** = No data stored

### 🌍 Environment Info

Shows:
- Current platform (Web/Native)
- Current URL
- Useful for debugging redirect issues

## Common Testing Workflows

### Test as New User

1. Go to **http://localhost:8081/dev**
2. Click **"Clear All Storage"**
3. App reloads to login screen
4. Sign in with Google
5. Should see onboarding flow ✓

### Test as Returning User

1. Complete onboarding once
2. Go to **http://localhost:8081/dev**
3. Click **"Clear Auth Data"** (NOT "Clear All Storage")
4. Sign in with Google again
5. Should skip onboarding and go to capture/add ✓

### Test Onboarding Changes

1. Go to **http://localhost:8081/dev**
2. Click **"Reset Onboarding"**
3. Navigate to home or refresh
4. Should see onboarding flow again ✓

### Debug OAuth Redirect

1. After OAuth login, if app goes to wrong place
2. Go to **http://localhost:8081/dev**
3. Check **Current State** dashboard:
   - Is "Authenticated" = Yes?
   - Is "Onboarded" = Yes/No?
4. Tap **ONBOARDING_DATA** in Storage Inspector
5. Check `completedAt` and `skipped` fields

### View Stored Tokens

1. Go to **http://localhost:8081/dev**
2. Tap **TOKEN** or **REFRESH_TOKEN**
3. View the full JWT token in alert dialog
4. Useful for debugging auth issues

## Keyboard Shortcuts (Browser)

While on dev tools page, open browser console and run:

```javascript
// Clear all data
await AsyncStorage.clear();

// View specific key
const token = await AsyncStorage.getItem('@auth_token');
console.log('Token:', token);

// Set test data
await AsyncStorage.setItem('@auth_token', 'test-token');

// Remove specific key
await AsyncStorage.removeItem('@auth_token');

// List all keys
const keys = await AsyncStorage.getAllKeys();
console.log('All keys:', keys);
```

## Pro Tips

1. **Bookmark the dev tools**: Add `http://localhost:8081/dev` to bookmarks for quick access

2. **Keep it open in a second tab**: Have dev tools in one tab, app in another

3. **Watch the console**: Keep browser console open when using dev tools to see debug logs

4. **Use before reporting bugs**: Check current state and storage data before reporting issues

5. **Test both flows**: Always test both "new user" and "returning user" flows when making auth/onboarding changes

## Safety

- Dev tools page is **development only**
- Should not be accessible in production builds
- All destructive actions have confirmation dialogs
- Can always "Clear All Storage" to start fresh

## Troubleshooting

### "Dev tools not loading"
- Make sure you're running the dev server
- Check URL is exactly `http://localhost:8081/dev`
- Check browser console for errors

### "Can't see storage data"
- Click "Refresh State" button
- Check browser console for AsyncStorage errors
- Try "Clear All Storage" and start fresh

### "Actions not working"
- Check that buttons are enabled (not disabled/grayed out)
- Some actions require specific state (e.g., must be authenticated to clear auth)
- Check browser console for error messages

## Future Enhancements

Planned features:
- [ ] Export/Import storage data (for testing specific scenarios)
- [ ] View API call history
- [ ] Network request inspector
- [ ] Performance metrics
- [ ] Mock backend responses
- [ ] Quick login with test accounts

---

**Happy Testing! 🚀**
