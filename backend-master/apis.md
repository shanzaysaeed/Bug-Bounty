# Authentication

## User

### POST /api/users/register

Request body

```ts
{
	"name": string
	"email": string
	"password": string
}
```

Response

```ts
set-cookie: session_id, httponly=True, secure=True
response 200 {
	"message": "Registered"
}

response 400 {
	"error": "Error registering"
}
```

### POST /api/users/register-mfa

- generates a new MFA secret for the user, update the user's status to `mfa_pending`
- returns the uri for the QR code

Request

```ts
cookie: session_id
```

Response

```ts
response 200 {
  "uri": string
}
```

### POST /api/users/login-password

Request

```ts
{
	"email": string
	"password": string
}
```

Response

```ts
set-cookie: session_id, httponly=True, secure=True
response 200 {
	"message": "Logged in"
}

response 401 {
	"error": "Error logging in"
}
```

### POST /api/users/login-mfa

- Updates the session object to be post MFA, long lived session
- If it's the first time the user logs in with MFA, it will change the user's status to `mfa_verified`

Request

```ts
cookie: session_id
request body {
	"code": number
}
```

Response

```ts
set-cookie: session_id, httponly=True, secure=True
response 200 {
	"message": "Logged in"
}

response 401 {
	"error": "Error logging in"
}
```

### GET /api/users/me

Request

```ts
cookie: session_id
```

Response

```ts
{
  "name": string 
  "email": string
  "role": "admin" | "researcher" | "organization"
  "auth_stage": "password" | "mfa_pending" | "mfa_verified" | "email_verified"
}
```

### POST /api/users/logout

Request

```ts
cookie: session_id
```

Response

```ts
{"message": "Logged out"}
```

## Admin

### POST /api/admin/delete-user

Request

```ts
cookie: session_id

Request {
	"user_id": int
}
```

Response

```ts
400 - no email provided
404 - user doesn't exist
200 - {"message": "User deleted"}
```

### GET /api/admin/researchers

- Returns a list of all researchers

Request

```ts
cookie: session_id
```

Response

```ts
{
	"name": string
	"email": string
	"id": int
}[]
```

### GET /api/admin/organizations

- Returns a list of all organizations

Request

```ts
cookie: session_id
```

Response

```ts
{
	"name": string
	"email": string
	"id": int
}[]
```

### GET /api/admin/user

- Returns details about a specific user / organization

Request

```ts
cookie: session_id
{
  "user_id": int
}
```

Response

```ts
{
	"name": string
	"email": string
	"id": int
  "auth_stage": "password" | "mfa_pending" | "mfa_verified" | "email_verified"
}[]
```

### /api/admin/approve-organization
- Manually approving an organization

Request

```ts
cookie: session_id
{
  "organization_id": int
}
```

Response

```ts
404 - User not found
400 - User is not an organization
200 - {"message": "Organization approved"}
```



## Organization

### /auth/org/register

### /auth/org/login

# Admin Controls

## Job request management

### POST /api/admin/approve-request

Request

```ts
Request {
    "request_id": int
}
```

Response

```ts
400 - {"error": "Error approving request"}
404 - {"error": "Error finding report"} or {"error": "Error report in invalid state"}
200 - {"message": "Request approved"}
```

### POST /api/admin/reject-request

Request

```ts
Request {
    "request_id": int
}
```

Response

```ts
400 - {"error": "Error rejecting request"}
404 - {"error": "Error finding report"} or {"error": "Error report in invalid state"}
200 - {"message": "Request rejected"}
```

### POST /api/admin/delete-request

Request

```ts
Request {
    "request_id": int
}
```

Response

```ts
400 - {"error": "Error deleting request"}
404 - {"error": "Error finding report"}
200 - {"message": "Request deleted"}
```

# Pentest Request

## Organization

### POST /api/requests/create-request

Request

```ts
cookie: session_id

Request {
    "title": string
    "summary": string
    "description": string
    "disclosure_policy_url": string
    "tags": string[]
}
```

Response

```ts
400 - {"error": "Error creating request"}
200 - {"message": "Request created"}
```

### POST /api/requests/update-request

Request

```ts
cookie: session_id

Request {
    "title": string
    "summary": string
    "description": string
    "disclosure_policy_url": string
    "tags": string[]
	"request_id": int
}
```

Response

```ts
404 - {"error": "Error finding report or invalid credentials"}
400 - {"error": "Error updating request"}
200 - {"message": "Request updated"}
```

### POST /api/requests/submit-for-approval

Request

```ts
cookie: session_id

Request {
    "request_id": int
}
```

Response

```ts
400 - {"error": "Error submitting request for approval"} or {"error": "Error report in invalid state"}
404 - {"error": "Error finding report or invalid credentials"}
200 - {"message": "Request submitted for approval"}
```

### POST /api/requests/archive

Request

```ts
cookie: session_id

Request {
    "request_id": int
}
```

Response

```ts
400 - {"error": "Error archiving request"}
404 - {"error": "Error finding request or invalid credentials"}
200 - {"message": "Request archived"}
```

### POST /api/reports/accept-report

Request

```ts
cookie: session_id

Request {
    "report_id": int
}
```

Response

```ts
400 - {"error": "Error accepting report"}
404 - {"error": "Error finding report or invalid credentials"}
200 - {"message": "Request accepted"}
```

### POST /api/reports/reject-report

Request

```ts
cookie: session_id

Request {
    "report_id": int
}
```

Response

```ts
400 - {"error": "Error rejecting report"}
404 - {"error": "Error finding report or invalid credentials"}
200 - {"message": "Request rejected"}
```

## User

### get_orgs

### POST /api/reports/create-report

Request

```ts
cookie: session_id

Request {
    "content": string
	"request_id": int
}
```

Response

```ts
400 - {"error": "Error creating reqport"}
200 - {"message": "Report created"}
```

## Shared

### GET /api/requests/get-all

Depending on user role:

- `Researcher` - returns all approved requests
- `Organization` - returns all requests by the org
- `Admin` - returns all requests

Request

```ts
cookie: session_id
```

Response

```ts
{
	"id": int
	"state": "created" | "submitted" | "rejected" | "approved" | "archived"
	"title": string
	"company": string
	"datePoasted": Date
	"previewDescription": string
	"detailedDescription": string
	"logo": string
	"tags": string[]
	"responsibleDisclosureUrl": string
}[]
```

### GET /api/requests/get-by-id

Depending on user role:

- `Researcher` - returns request if approved
- `Organization/Admin` - returns request

Request

```ts
cookie: session_id

Request {
    "request_id": int
}
```

Response

```ts
{
	"id": int
	"state": "created" | "submitted" | "rejected" | "approved" | "archived"
	"title": string
	"company": string
	"datePoasted": Date
	"previewDescription": string
	"detailedDescription": string
	"logo": string
	"tags": string[]
	"responsibleDisclosureUrl": string
}
```

### GET /api/reports/get-all

Depending on user role:

- `Researcher` - returns reports if they created them
- `Organization` - returns reports if they own the request

`unread` is set to the requesting users unread status

Request

```ts
cookie: session_id
```

Response

```ts
{
	"id": int
	"unread": bool
	"status": "submitted" | "rejected" | "accepted"
	"commentCount": int
	"organization": string
	"logo": string
	"user": string
}[]
```

### GET /api/reports/get-by-id

Depending on user role:

- `Researcher` - returns report if they created it
- `Organization` - returns report if they own the request

`unread` is set to the requesting users unread status

Request

```ts
cookie: session_id
```

Response

```ts
{
	"id": int
	"unread": bool
	"status": "submitted" | "rejected" | "accepted"
	"commentCount": int
	"comments": [{
		"message": string
		"senderName": string
		"timestamp": Date
	}]
	"organization": string
	"logo": string
	"user": string
}
```

### POST /api/reports/comment

Request

```ts
cookie: session_id

Request {
    "report_id": int
	"content": string
}
```

Response

```ts
400 - {"error": "Error adding comment"}
404 - {"error": "Error finding report or invalid credentials"}
200 - {"message": "Comment added"}
```
