# Authentication
## [<- Back](../API.md)

# Register
Register will also log the user in

#### **POST** `/api/auth/register`

#### HEADERS
Key | Description
--- | ---- 

#### BODY
Key | Description | Required
--- | --- | ---
username | Person's Username | *
email | Email to Login With | *
password | Password for Account |*

#### RESPONSE
* Success: `{'token': 'JWT *****', 'user': {USER OBJECT} }`
* Fail: 401 Unauthorized `{'message': 'ERR MSG}`
* Fail: 400 


# Login
#### **POST** `/api/auth/login`

#### HEADERS
Key | Description
--- | ---- 

#### BODY
Key | Description | Required
--- | --- | ---
email | Email to Login With | *
password | Password for Account |*

#### RESPONSE
* Success: `{'token': 'JWT *****', 'user': {USER OBJECT} }`
* Fail: 401 Unauthorized `{'message': 'ERR MSG}`


# Change Password
#### **POST** `/api/auth/changePassword`

#### HEADERS
Key | Description
--- | ---- 
Authorization | JWT Token from login

#### BODY
Key | Description | Required
--- | --- | ---
currentPassword | Current Password | *
newPassword | Password to change to |*

#### RESPONSE
* Success: `{'user': {USER OBJECT} }`
* Fail: 401 Unauthorized `{'message': 'ERR MSG}`