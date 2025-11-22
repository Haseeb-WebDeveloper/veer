# How to Enable Gmail API

## Issue
You're getting this error when testing Gmail integration:
```
Gmail API has not been used in project [PROJECT_ID] before or it is disabled
```

## Solution: Enable Gmail API

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Make sure you're logged in with the same Google account used for OAuth setup
3. Select your project (the one with ID: 59291653516)

### Step 2: Enable Gmail API
1. In the left sidebar, click **"APIs & Services"** > **"Library"**
2. Search for **"Gmail API"**
3. Click on **"Gmail API"** from the results
4. Click the **"ENABLE"** button
5. Wait a few seconds for it to enable

### Step 3: Verify It's Enabled
1. Go to **"APIs & Services"** > **"Enabled APIs"**
2. You should see **"Gmail API"** in the list
3. If you see it, you're good to go!

### Step 4: Wait a Few Minutes
- Sometimes it takes 2-5 minutes for the API to propagate
- If you still get errors, wait a bit and try again

### Step 5: Test Again
1. Go back to your integrations page
2. Click "Send Test Email" again
3. It should work now!

## Quick Link
If you have the project ID, you can use this direct link:
```
https://console.cloud.google.com/apis/api/gmail.googleapis.com/overview?project=59291653516
```

## Alternative: Enable via OAuth Consent Screen
Sometimes you can also enable it when setting up OAuth:
1. Go to **"APIs & Services"** > **"OAuth consent screen"**
2. Make sure your app has the Gmail API scopes
3. The API might auto-enable when you add the scopes

## Troubleshooting

### Still Getting 403 Error?
1. **Check project selection**: Make sure you're in the correct Google Cloud project
2. **Check OAuth credentials**: Verify your OAuth Client ID is from the same project
3. **Wait longer**: Sometimes it takes up to 10 minutes to propagate
4. **Check billing**: Some APIs require billing to be enabled (Gmail API is free though)

### Can't Find the Project?
1. Check your `.env.local` file for `GOOGLE_OAUTH_CLIENT_ID`
2. The project ID is usually in the OAuth Client ID format: `xxxxx.apps.googleusercontent.com`
3. Or check the error message - it should show the project ID

## What This Does
Enabling Gmail API allows your application to:
- Send emails via Gmail API
- Access Gmail on behalf of users (with their permission)
- Use OAuth tokens to send emails

This is required even if you've set up OAuth - OAuth gives you permission, but the API itself must be enabled.

