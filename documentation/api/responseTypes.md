# Response Types

## [<- Back](../api.md)

## Success: 
Status 200 OK
```
{
    'success': true,
    'data': {*}
}
```
## Failure:
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
