# Authentication

## [<- Back](../api.md)

# Register
Register will also log the user in unless requireVerifiedEmailToLogin is true.
#### **POST** `/api/auth/register`
#### BODY
Key | Description | Required
--- | --- | ---
username | Person's Username | *
email | Email to Login With | *
password | Password for Account |*

# Login
#### **POST** `/api/auth/login`
#### BODY
Key | Description | Required
--- | --- | ---
email | Email to Login With | *
password | Password for Account |*

# Login MFA
If the account that attempted login has MFA enabled, this verifies the MFA Token to complete login
### **POST** `/api/auth/login/mfa`
### BODY
Key | Description | Required
--- | --- | ---
token | MFA token to verify | *

# Logout
#### **POST** `/api/auth/logout`

# Change Password
#### **POST** `/api/auth/changePassword`
#### BODY
Key | Description | Required
--- | --- | ---
currentPassword | Current Password | *
newPassword | Password to change to |*

# Verify Email
#### **POST** `/api/auth/verifyEmail`
#### BODY
Key | Description | Required
--- | --- | ---
userId | Id of the user attempting to verify their email | *
verifyEmailCode | Code that verifies email |*

# Resend Email Verification Email
#### **POST** `/api/auth/verifyEmail/resendEmail`

# Setup MFA
Setup MFA for an account. Returns the MFA Secret as plaintext and as QR code data.
### **GET** `/api/auth/mfa`

# Complete MFA Setup
Verify token to complete setup.
### **POST** `/api/auth/login/mfa`
### BODY
Key | Description | Required
--- | --- | ---
token | MFA token to verify | *

# Disable MFA
Disable MFA login for currently logged in user.
### **DELETE** `/api/auth/login/mfa`