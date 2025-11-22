# Test Email Feature - Setup & Debugging

## What We've Implemented

✅ **Test Email Button** - Added to integration sheet when integration is connected
✅ **Debug Logging** - Detailed step-by-step logging to identify issues
✅ **Error Handling** - Better error messages with context
✅ **Support for All Providers**:
   - Gmail (OAuth via Gmail API)
   - Outlook (OAuth via Microsoft Graph API)
   - Custom SMTP (via nodemailer)

## How to Test

1. **Connect an integration** (Gmail, Outlook, or Custom SMTP)
2. **Open the integration sheet** by clicking on the integration card
3. **Click "Send Test Email"** button
4. **Check browser console** (F12) for detailed debug logs
5. **Check server terminal** for additional error details

## What to Check When Testing Fails

### 1. Browser Console (F12)
Look for debug logs that show:
- ✅ Authentication check
- ✅ User lookup
- ✅ Integration found
- ✅ Token/credentials status
- ❌ Where it fails

### 2. Server Terminal
Look for:
- Console.error messages
- API response errors
- Detailed error stacks

### 3. Common Issues

#### For OAuth (Gmail/Outlook):
- **Token missing**: Reconnect the integration
- **Token expired**: Should auto-refresh, but if fails, reconnect
- **API not enabled**: Enable Gmail API or Microsoft Graph API in cloud console
- **Wrong scopes**: Check OAuth scopes include send permissions

#### For SMTP:
- **Connection failed**: Check host/port/credentials
- **TLS/SSL issues**: Try different port (587 vs 465)
- **Gmail SMTP**: Need App Password if 2FA enabled
- **Firewall**: Port 587/465 might be blocked

## Debug Information

The test function now logs:
1. Authentication status
2. User lookup
3. Integration data
4. Token/credential status
5. API request details
6. API response details
7. Error details (if any)

All this information appears in:
- **Browser console** (grouped logs)
- **Server terminal** (console.log/error)

## Next Steps

1. **Run the test** and check console logs
2. **Identify the failing step** from debug output
3. **Check the debugging guide** (`EMAIL_TEST_DEBUGGING.md`)
4. **Apply fixes** based on the error
5. **Re-test** after fixes

## Files Changed

- `src/actions/test-email.ts` - Main test function with improved error handling
- `src/actions/test-email-debug.ts` - Debug version with detailed logging
- `src/components/integrations/email-integration-sheet.tsx` - Added test button
- `src/lib/integrations/get-oauth-token.ts` - OAuth token management

## Environment Variables Needed

Make sure these are set:
- `ENCRYPTION_KEY` - For encrypting/decrypting tokens and passwords
- `GOOGLE_OAUTH_CLIENT_ID` & `GOOGLE_OAUTH_CLIENT_SECRET` - For Gmail
- `MICROSOFT_OAUTH_CLIENT_ID` & `MICROSOFT_OAUTH_CLIENT_SECRET` - For Outlook
- `NEXT_PUBLIC_APP_URL` - For OAuth redirects

