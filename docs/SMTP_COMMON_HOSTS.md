# Common SMTP Host Settings

## Brevo (formerly Sendinblue)
- **Host:** `smtp-relay.brevo.com`
- **Port:** `587` (TLS) or `465` (SSL)
- **Username:** Your Brevo SMTP login (usually your email or SMTP key)
- **Password:** Your Brevo SMTP password

## Gmail
- **Host:** `smtp.gmail.com`
- **Port:** `587` (TLS) or `465` (SSL)
- **Username:** Your Gmail address
- **Password:** App Password (if 2FA enabled)

## Outlook/Hotmail
- **Host:** `smtp-mail.outlook.com`
- **Port:** `587` (TLS)
- **Username:** Your Outlook email
- **Password:** Your Outlook password

## Yahoo
- **Host:** `smtp.mail.yahoo.com`
- **Port:** `587` (TLS) or `465` (SSL)
- **Username:** Your Yahoo email
- **Password:** App Password

## Zoho
- **Host:** `smtp.zoho.com`
- **Port:** `587` (TLS) or `465` (SSL)
- **Username:** Your Zoho email
- **Password:** Your Zoho password

## Mailgun
- **Host:** `smtp.mailgun.org`
- **Port:** `587` (TLS) or `465` (SSL)
- **Username:** Your Mailgun SMTP username
- **Password:** Your Mailgun SMTP password

## SendGrid
- **Host:** `smtp.sendgrid.net`
- **Port:** `587` (TLS)
- **Username:** `apikey`
- **Password:** Your SendGrid API key

## Amazon SES
- **Host:** `email-smtp.[region].amazonaws.com` (e.g., `email-smtp.us-east-1.amazonaws.com`)
- **Port:** `587` (TLS) or `465` (SSL)
- **Username:** Your SES SMTP username
- **Password:** Your SES SMTP password

## Important Notes

1. **Host vs Username:**
   - **Host** = The SMTP server domain (e.g., `smtp-relay.brevo.com`)
   - **Username** = Your login credentials (e.g., `81abe7001` or your email)

2. **Common Mistake:**
   - ❌ **Wrong:** Host = `81abe7001@smtp-brevo.com`
   - ✅ **Correct:** Host = `smtp-relay.brevo.com`, Username = `81abe7001`

3. **Port Selection:**
   - Port `587` = TLS (STARTTLS) - Most common
   - Port `465` = SSL (SMTPS) - Legacy but still used
   - Port `25` = Usually blocked by ISPs

4. **TLS/SSL:**
   - Port 587 = `secure: false` (uses STARTTLS)
   - Port 465 = `secure: true` (uses SSL)

