# Simple OAuth Fix - Use Existing Client

You're right! Let's just use your existing OAuth client and add the web redirect URIs to it.

## Quick Fix (2 minutes)

### Step 1: Edit Existing OAuth Client

1. **Go to Google Cloud Console:**
   - URL: https://console.cloud.google.com/apis/credentials

2. **Find your OAuth client:**
   - Look for Client ID: `765534073366-98ffgpadh021rmhktv4l16lbnaih12t6`
   - Click the **pencil/edit icon** next to it

3. **Check Application Type:**
   - Look at the top where it says "Application type"
   - Note what it says (Web, iOS, Android, Desktop, etc.)

4. **Add Redirect URIs:**

   Under **"Authorized redirect URIs"**, click **"+ ADD URI"** and add:
   ```
   http://localhost:8081
   http://localhost:8081/
   http://localhost:19006
   http://localhost:19006/
   ```

   **Important Notes:**
   - If the client type is **"Web application"** - This will work!
   - If the client type is **"iOS"** or **"Desktop"** - You might get an error saying localhost URIs aren't allowed for this type
   - If the client type is **"Android"** - Same issue

5. **Try to Save:**
   - Click **"SAVE"** at the bottom
   - If it saves successfully → You're done! Skip to testing below.
   - If it gives an error → We need to create a separate web client (see GOOGLE_OAUTH_WEB_CLIENT_SETUP.md)

### Step 2: Test (If Save Worked)

1. **Refresh the web app:**
   ```bash
   # Just refresh browser or restart Expo
   cd mobile
   npx expo start
   ```

2. **Try Google Sign In:**
   - Go to http://localhost:8081
   - Click "Continue with Google"
   - Should work now!

---

## If You Get an Error When Saving

If Google Cloud Console shows an error like:
- "Invalid redirect URI for this client type"
- "http URIs are not allowed for this application type"
- Similar message about localhost not being allowed

**This means your existing client is an iOS/Android/Desktop type**, which doesn't support localhost redirect URIs.

**Solution:** You'll need to create a separate Web Application client - follow the instructions in `GOOGLE_OAUTH_WEB_CLIENT_SETUP.md`

---

## What to Check

When you click Edit on your OAuth client, check:

**Application type:** `________________` (fill this in)

**Current redirect URIs:** `________________` (what's already there)

**Can you add localhost URIs?** ☐ Yes ☐ No

---

## Quick Decision Tree

```
Does your OAuth client type say "Web application"?
├─ YES → Just add localhost redirect URIs and save ✅
└─ NO (iOS/Android/Desktop) → Need to create separate web client ❌
```

---

## TL;DR

**Try This First:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Edit your existing OAuth client (765534073366-...)
3. Add redirect URIs: `http://localhost:8081/` and `http://localhost:19006/`
4. Click Save

**If it saves successfully:**
- You're done! Restart Expo and test.

**If you get an error:**
- The client type doesn't support localhost
- Follow GOOGLE_OAUTH_WEB_CLIENT_SETUP.md to create a web client

---

**Status:** Try adding URIs to existing client first
**Estimated Time:** 2 minutes
