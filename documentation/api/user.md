# User
## [<- Back](../API.md)

# User Object
```
{ 
    'username': 'Bob',
    'email': 'bob@gmail.com',
    'created': '2017-12-05T22:39:28.197Z'
}
```

# Get User
#### **GET** `/api/user`

#### HEADERS
Key | Description
--- | ---- 
Authorization | JWT Token from login

#### RESPONSE
* Success: `{'user': {USER OBJECT} }`
* Fail: 401 Unauthorized `{'message': 'ERR MSG}`


# Delete User
#### **DELETE** `/api/user`

#### HEADERS
Key | Description
--- | ---- 
Authorization | JWT Token from login

#### BODY
Key | Description | Required
--- | --- | ---

#### RESPONSE
* Success: `{ Something? }`
* Fail: 401 Unauthorized `{'message': 'ERR MSG}`