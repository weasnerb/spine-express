# API Documentation!

## [<- Back](../README.md)

## Response Types
### Success: 
Status 200 OK
```
{
    'success': true,
    'data': {}
}
```
### Failure:
Status 401 Unauthorized
```
{
    'success': false,
    'message': 'This is a message to display to users.'
}
```

Status 400 Bad Request
```
{
    'success': false,
    'message': 'This is a message to display to users.'
}
```


## Routes
* [Authentication](./api/auth.md)
* [User](./api/user.md)