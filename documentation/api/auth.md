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