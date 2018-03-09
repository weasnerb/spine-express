# User
## [<- Back](../api.md)

# Get Current User
#### **GET** `/api/user`

# Get User By Id
Requires user performing request to have admin role
#### **GET** `/api/user/:userId`

# Get All Users
Requires user performing request to have admin role
#### **GET** `/api/user/all`

# Delete Current User
#### **DELETE** `/api/user`

# Get Current User Roles
#### **GET** `/api/user/roles`

# Give Role to user
Requires user performing request to have admin role
#### **POST** `/api/user/role`
#### BODY
Key | Description | Required
--- | --- | ---
userId | id of user to give role to | *
roleId | Id of role to give to user | *

# Remove Role from user
Requires user performing request to have admin role
#### **Delete** `/api/user/role`
#### BODY
Key | Description | Required
--- | --- | ---
userId | id of user to remove role from | *
roleId | Id of role to remove from user | *