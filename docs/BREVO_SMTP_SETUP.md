# Brevo SMTP Setup Guide

## Getting Your Brevo SMTP Credentials

### Step 1: Log into Brevo Dashboard
1. Go to https://app.brevo.com/
2. Log in with your Brevo account

### Step 2: Navigate to SMTP Settings
1. Click on your profile icon (top right)
2. Go to **"SMTP & API"** in the menu
3. Click on **"SMTP"** tab

### Step 3: Get Your SMTP Credentials
You'll see:
- **SMTP Server:** `smtp-relay.brevo.com`
- **Port:** `587` (recommended) or `465`
- **Login:** Your SMTP login (usually your email or a specific SMTP key)
- **Password:** Your SMTP password (different from your account password)

### Step 4: Configure in Veer
1. **SMTP Host:** `smtp-relay.brevo.com`
2. **SMTP Port:** `587` (or `465` for SSL)
3. **SMTP Username:** Your Brevo SMTP login
4. **SMTP Password:** Your Brevo SMTP password

## Common Issues

### "Authentication failed" Error

**Problem:** Error 535 - Authentication failed

**Solutions:**
1. **Wrong Password:**
   - Make sure you're using the **SMTP password**, not your Brevo account password
   - SMTP password is different from your login password

2. **Wrong Username:**
   - Use your **SMTP login** (shown in Brevo dashboard)
   - This might be your email or a specific SMTP key ID
   - Don't use your account email if it's different

3. **Credentials Expired:**
   - Regenerate your SMTP password in Brevo dashboard
   - Update the password in Veer

4. **Using API Key Instead:**
   - SMTP uses different credentials than API keys
   - Make sure you're in the "SMTP" section, not "API Keys"

### How to Regenerate SMTP Password

1. Go to Brevo Dashboard > SMTP & API > SMTP
2. Click on **"Generate a new password"** or **"Reset password"**
3. Copy the new password
4. Update it in Veer integration settings

## Testing

After configuring:
1. Click "Send Test Email" in Veer
2. Check your email inbox
3. If you get authentication error, double-check credentials

## Important Notes

- **SMTP Password ≠ Account Password:** They are different!
- **SMTP Login ≠ Email:** Sometimes your SMTP login is different from your email
- **Port 587 vs 465:** 
  - Port 587 = TLS (recommended)
  - Port 465 = SSL (legacy)
- **Rate Limits:** Brevo has sending limits based on your plan

## Still Having Issues?

1. Verify credentials in Brevo dashboard
2. Try regenerating SMTP password
3. Check if your Brevo account is active
4. Verify you're using SMTP credentials, not API keys
5. Make sure port 587 is not blocked by firewall

