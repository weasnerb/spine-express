# Role
## [<- Back](../api.md)

# Get Role By Id
Requires user performing request to have admin role
#### **Get** `/api/role/:roleId`

# Get All Roles
Requires user performing request to have admin role
#### **Get** `/api/role/all`

# Add Role
Requires user performing request to have admin role
#### **POST** `/api/role`
#### BODY
Key | Description | Required
--- | --- | ---
roleName | Name of role to add | *

# Update Role
Requires user performing request to have admin role
#### **PUT** `/api/role`
#### BODY
Key | Description | Required
--- | --- | ---
roleId | Name of role to add | *
roleName | Name of role to add | *

# Delete Role
Requires user performing request to have admin role
#### **Delete** `/api/role`
#### BODY
Key | Description | Required
--- | --- | ---
roleId | Id of role to delete | *