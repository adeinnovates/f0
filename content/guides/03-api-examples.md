---
title: API Examples
description: Example API documentation using markdown syntax
order: 3
---

# API Documentation Examples

This page demonstrates how to document APIs using f0's markdown syntax.

## Basic Endpoint Documentation

:::api GET /users
List all users

Returns a paginated list of all users in the system.
:::

:::api GET /users/{id}
Get user by ID

Retrieves a specific user by their unique identifier.

**Parameters:**
- `id` (path, required) — The user's unique ID

**Response:** `200 OK`
:::

:::api POST /users
Create user

Creates a new user account.
:::

```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "role": "user"
}
```

:::api PUT /users/{id}
Update user

Updates an existing user's information.
:::

:::api DELETE /users/{id}
Delete user

Permanently removes a user account. This action cannot be undone.
:::

## Authentication Endpoints

:::api POST /auth/login
Login

Authenticates a user and returns a JWT token.
:::

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "secretpassword"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

:::api POST /auth/logout
Logout

Invalidates the current user's session.
:::

## Error Responses

All endpoints may return these error responses:

| Status | Description |
|--------|-------------|
| 400 | Bad Request — Invalid parameters |
| 401 | Unauthorized — Missing or invalid token |
| 403 | Forbidden — Insufficient permissions |
| 404 | Not Found — Resource doesn't exist |
| 500 | Server Error — Something went wrong |

:::warning
Rate limiting is enforced at 100 requests per minute per API key.
:::

## Code Examples

### JavaScript/Node.js

```javascript
const response = await fetch('https://api.example.com/users', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const users = await response.json();
console.log(users);
```

### Python

```python
import requests

response = requests.get(
    'https://api.example.com/users',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)

users = response.json()
print(users)
```

### cURL

```bash
curl -X GET "https://api.example.com/users" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

:::success
All code examples include a copy button — click to copy!
:::
