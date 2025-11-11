# Logout Debugging - Complete

## Changes Made

Added comprehensive debug logging throughout the entire logout flow to identify where the issue occurs.

## Modified Files

### 1. `/mobile/app/(tabs)/you.tsx`

**Changes:**
- Extracted logout logic into separate `performLogout()` function
- Added platform detection logging (web vs mobile)
- Added confirmation dialog tracking
- Separated web (window.confirm) and mobile (Alert) flows
- Logs user's confirmation choice

**Expected Logs:**
```
[You Tab] Logout button clicked!
[You Tab] User: {...}
[You Tab] Logout function available: function
[You Tab] Running on web: true/false
[You Tab] window.confirm exists: true/false
[You Tab] Showing web confirmation dialog...
[You Tab] User confirmed: true/false
[You Tab] Performing logout...
```

### 2. `/mobile/src/contexts/AuthContext.tsx`

**Changes:**
- Added logging at each step of the logout process
- Tracks token existence
- Logs backend call
- Logs data clearing
- Logs completion

**Expected Logs:**
```
[AuthContext] Logout called
[AuthContext] Current token exists: true/false
[AuthContext] Calling authService.logout()...
[AuthContext] Backend logout successful, clearing local data...
[AuthContext] Logout complete - all data cleared
[AuthContext] Logout finished, isLoading set to false
```

### 3. `/mobile/src/services/authService.ts`

**Changes:**
- Added logging for backend logout API call
- Tracks token presence
- Logs HTTP response status
- Logs success/failure

**Expected Logs:**
```
[AuthService] Logout called, token provided: true/false
[AuthService] Sending logout request to backend...
[AuthService] Backend logout response status: 200
[AuthService] Backend logout successful
```

## Complete Logout Flow

When a user clicks the logout button, you should see these logs in order:

### On Web:
1. `[You Tab] Logout button clicked!`
2. `[You Tab] Running on web: true`
3. `[You Tab] window.confirm exists: true`
4. `[You Tab] Showing web confirmation dialog...`
5. **Browser shows native confirm dialog**
6. `[You Tab] User confirmed: true` (if user clicks OK)
7. `[You Tab] Performing logout...`
8. `[AuthContext] Logout called`
9. `[AuthContext] Calling authService.logout()...`
10. `[AuthService] Sending logout request to backend...`
11. `[AuthService] Backend logout response status: 200`
12. `[AuthContext] Logout complete - all data cleared`
13. App redirects to login screen

### On Mobile:
1. `[You Tab] Logout button clicked!`
2. `[You Tab] Running on web: false`
3. `[You Tab] Showing mobile Alert dialog...`
4. **Alert dialog appears**
5. `[You Tab] Logout confirmed via Alert` (if user clicks "Log Out")
6. `[You Tab] Performing logout...`
7. (Same as web from step 8 onwards)

## Debugging Guide

### If you see logs stop at "Logout button clicked":
- The button event handler is working
- Issue is likely with platform detection or confirmation dialog

### If you see "User confirmed: false":
- User clicked Cancel on the confirmation dialog
- This is expected behavior

### If logs stop after "Showing web confirmation dialog":
- The confirmation dialog might not be displaying
- Check browser console for errors
- Try clicking directly on the dialog if it appears

### If you see "Performing logout" but no AuthContext logs:
- The logout() function from AuthContext is not being called
- Check that useAuth() is returning the correct logout function

### If backend call fails:
- Logout will still proceed with local data clearing
- Check network tab for the logout API call
- Verify backend is running

## Next Steps

1. **Click the logout button**
2. **Copy all console logs** from the browser console
3. **Share the logs** to identify exactly where the flow breaks

The logs will reveal whether the issue is:
- Confirmation dialog not showing
- User cancelling the dialog
- Logout function not being called
- Backend API issue
- Redirect not working
