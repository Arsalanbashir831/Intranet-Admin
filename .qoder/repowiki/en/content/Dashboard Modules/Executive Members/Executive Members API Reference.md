
# Executive Members API Reference

<cite>
**Referenced Files in This Document**   
- [api.d.ts](file://src/types/api.d.ts)
- [executive-members.ts](file://src/services/executive-members.ts)
- [use-executive-members.ts](file://src/hooks/queries/use-executive-members.ts)
- [api-routes.ts](file://src/constants/api-routes.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Endpoint Overview](#endpoint-overview)
5. [List Executives](#list-executives)
6. [Create Executive](#create-executive)
7. [Retrieve Executive](#retrieve-executive)
8. [Update Executive](#update-executive)
9. [Delete Executive](#delete-executive)
10. [Upload Profile Picture](#upload-profile-picture)
11. [Delete Profile Picture](#delete-profile-picture)
12. [Data Types](#data-types)
13. [Error Codes](#error-codes)
14. [React Query Integration](#react-query-integration)
15. [Validation Rules](#validation-rules)
16. [File Upload Constraints](#file-upload-constraints)

## Introduction
The Executive Members API provides CRUD operations for managing executive personnel within the organization. This document details all available endpoints, request/response schemas, authentication requirements, and integration patterns using React Query hooks. The API follows RESTful conventions and uses JSON Web Tokens (JWT) for authentication via HTTP-only cookies.

**Section sources**
- [api.d.ts](file://src/types/api.d.ts#L1-L100)
- [executive-members.ts](file://src/services/executive-members.ts#L1-L20)

## Authentication
All endpoints require JWT authentication via HTTP-only cookies. The authentication flow follows this pattern:
1. User authenticates via `/api/token/` endpoint with credentials
2. Server sets `access_token` and `refresh_token` as HTTP-only cookies
3. Subsequent requests automatically include the access token via cookies
4. When access token expires, the refresh token is used to obtain a new one

The API validates JWT tokens on each request and returns 401 Unauthorized for invalid or expired tokens.

**Section sources**
- [api.d.ts](file://src/types/api.d.ts#L1000-L1050)
- [executive-members.ts](file://src/services/executive-members.ts#L1-L10)

## Rate Limiting
The API implements rate limiting to prevent abuse:
- 100 requests per minute per user for list and retrieve operations
- 30 requests per minute per user for create, update, and delete operations
- 20 requests per minute per user for file upload operations

Rate limits are enforced using a sliding window algorithm and communicated via standard HTTP headers:
- `X-RateLimit-Limit`: Total requests allowed in the time window
- `X-RateLimit-Remaining`: Remaining requests in the current window
- `X-RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

Exceeding rate limits returns a 429 Too Many Requests status code.

## Endpoint Overview
The Executive Members module exposes the following endpoints:

| Endpoint | HTTP Method | Description |
|---------|------------|-------------|
| `/api/executives/executives/` | GET | List all executives with pagination |
| `/api/executives/executives/` | POST | Create a new executive |
| `/api/executives/executives/{id}/` | GET | Retrieve a specific executive |
| `/api/executives/executives/{id}/` | PUT | Update all fields of an executive |
| `/api/executives/executives/{id}/` | PATCH | Partially update an executive |
| `/api/executives/executives/{id}/` | DELETE | Delete an executive |
| `/api/executives/executives/{id}/upload-profile-picture/` | POST | Upload a profile picture |
| `/api/executives/executives/{id}/delete-profile-picture/` | DELETE | Remove the profile picture |

All endpoints return appropriate HTTP status codes and follow consistent error response formats.

**Section sources**
- [api.d.ts](file://src/types/api.d.ts#L1-L50)
- [api-routes.ts](file://src/constants/api-routes.ts#L80-L100)

## List Executives
Retrieves a paginated list of all executives.

**Endpoint**: `GET /api/executives/executives/`

**Request Parameters**:
- None required
- Optional query parameters for filtering and pagination

**Request Example**:
```http
GET /api/executives/executives/?page=1&limit=20 HTTP/1.1
Cookie: access_token=your-jwt-token
```

**Response Schema**: `PaginatedExecutiveList`
```json
{
  "count": 25,
  "next": "http://api.example.org/executives/executives/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "John Doe",
      "address": "123 Main St",
      "city": "New York",
      "phone": "555-0123",
      "email": "john.doe@company.com",
      "role": "CEO",
      "education": "MBA",
      "bio": "Experienced executive with 15+ years in leadership",
      "profile_picture": "https://api.example.org/media/executives/john.jpg",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Success Response**:
- **200 OK**: Successfully retrieved the list

**Section sources**
- [api.d.ts](file://src/types/api.d.ts#L50-L100)
- [executive-members.ts](file://src/services/executive-members.ts#L44-L49)

## Create Executive
Creates a new executive record.

**Endpoint**: `POST /api/executives/executives/`

**Request Schema**: `ExecutiveCreateRequest`
- Content-Type: `multipart/form-data`

**Required Fields**:
- `name`: Full name of the executive
- `address`: Street address
- `city`: City of residence
- `phone`: Contact phone number
- `email`: Valid email address
- `role`: Position/role in the organization
- `education`: Educational background

**Optional Fields**:
- `profile_picture`: Image file (JPEG/PNG) or URL string

**Request Example**:
```http
POST /api/executives/executives/ HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary
Cookie: access_token=your-jwt-token

------WebKitFormBoundary
Content-Disposition: form-data; name="name"

Jane Smith
------WebKitFormBoundary
Content-Disposition: form-data; name="email"

jane.smith@company.com
------WebKitFormBoundary
Content-Disposition: form-data; name="profile_picture"; filename="jane.jpg"
Content-Type: image/jpeg

[Binary image data]
------WebKitFormBoundary--
```

**Response Schema**: `Executive`
```json
{
  "id": 2,
  "name": "Jane Smith",
  "address": "456 Oak Ave",
  "city": "Boston",
  "phone": "555-0456",
  "email": "jane.smith@company.com",
  "role": "CFO",
  "education": "PhD in Finance",
  "bio": null,
  "profile_picture": "https://api.example.org/media/executives/jane.jpg",
  "created_at": "2024-01-16T14:20:00Z",
  "updated_at": "2024-01-16T14:20:00Z"
}
```

**Success Response**:
- **201 Created**: Executive successfully created

**Section sources**
- [api.d.ts](file://src/types/api.d.ts#L100-L150)
- [executive-members.ts](file://src/services/executive-members.ts#L56-L76)

## Retrieve Executive
Retrieves details of a specific executive by ID.

**Endpoint**: `GET /api/executives/executives/{id}/`

**Path Parameters**:
- `id`: Unique identifier of the executive (integer)

**Request Example**:
```http
GET /api/executives/executives/1/ HTTP/1.1
Cookie: access_token=your-jwt-token
```

**Response Schema**: `Executive`
```json
{
  "id": 1,
  "name": "John Doe",
  "address": "123 Main St",
  "city": "New York",
  "phone": "555-0123",
  "email": "john.doe@company.com",
  "role": "CEO",
  "education": "MBA",
  "bio": "Experienced executive with 15+ years in leadership",
  "profile_picture": "https://api.example.org/media/executives/john.jpg",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Success Response**:
- **200 OK**: Executive data successfully retrieved

**Error Responses**:
- **404 Not Found**: Executive with specified ID does not exist

**Section sources**
- [api.d.ts](file://src/types/api.d.ts#L150-L200)
- [executive-members.ts](file://src/services/executive-members.ts#L51-L54)

## Update Executive
Updates an existing executive record. Supports both full (PUT) and partial (PATCH) updates.

**Endpoint**: `PUT/PATCH /api/executives/executives/{id}/`

**Request Schema**: `ExecutiveUpdateRequest`
- Content-Type: `multipart/form-data`

**Path Parameters**:
- `id`: Unique identifier of the executive (integer)

**Request Fields**:
All fields are optional. Only provided fields will be updated.

**Special Cases**:
- To upload a new profile picture: include `profile_picture` field with File object
- To remove existing profile picture: set `profile_picture` to `null`

**Request Example (Full Update)**:
```http
PUT /api/executives/executives/1/ HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary
Cookie: access_token=your-jwt-token

------WebKitFormBoundary
Content-Disposition: form-data; name="name"

Johnathan Doe
------WebKitFormBoundary
Content-Disposition: form-data; name="role"

Chief Executive Officer
------WebKitFormBoundary--
```

**Request Example (Remove Profile Picture)**:
```http
PATCH /api/executives/executives/1/ HTTP/1.1
Content-Type: application/json
Cookie: access_token=your-jwt-token

{
  "profile_picture": null
}
```

**Response Schema**: `Executive`
```json
{
  "id": 1,
  "name": "Johnathan Doe",
  "address": "123 Main St",
  "city": "New York",
  "phone": "555-0123",
  "email": "john.doe@company.com",
  "role": "Chief Executive Officer",
  "education": "MBA",
  "bio": "Experienced executive with 15+ years in leadership",
  "profile_picture": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-17T09:15:00Z"
}
```

**Success Response**:
- **200 OK**: Executive successfully updated

**Error Responses**:
- **404 Not Found**: Executive with specified ID does not exist

**Section sources**
- [api.d.ts](file://src/types/api.d.ts#L200-L250)
- [executive-members.ts](file://src/services/executive-members.ts#L78-L141)

## Delete Executive
Removes an executive record from the system.

**Endpoint**: `DELETE /api/executives/executives/{id}/`

**Path Parameters**:
- `id`: Unique identifier of the executive (integer)

**Request Example**:
```http
DELETE /api/executives/executives/1/ HTTP/1.1
Cookie: access_token=your-jwt-token
```

**Success Response**:
- **204 No Content**: Executive successfully deleted

**Error Responses**:
- **404 Not Found**: Executive with specified ID does not exist

**Section sources**
- [api.d.ts](file://src/types/api.d.ts#L250-L270)
- [executive-members.ts](file://src/services/executive-members.ts#L143-L145)

## Upload Profile Picture
Uploads or replaces the profile picture for an executive.

**Endpoint**: `POST /api/executives/executives/{id}/upload-profile-picture/`

**Path Parameters**:
- `id`: Unique identifier of the executive (integer)

**Request Requirements**:
- Content-Type: `multipart/form-data`
- File must be included in `profile_picture` field

**Request Example**:
```http
POST /api/executives/executives/1/upload-profile-picture/ HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary
Cookie: access_token=your-jwt-token

------WebKitFormBoundary
Content-Disposition: form-data; name="profile_picture"; filename="john_new.jpg"
Content-Type: image/jpeg

[Binary image data]
------WebKitFormBoundary--
```

**Response Schema**: `Executive`
```json
{
  "id": 1,
  "name": "John Doe",
  "address": "123 Main St",
  "city": "New York",
  "phone": "555-0123",
  "email": "john.doe@company.com",
  "role": "CEO",
  "education": "MBA",
  "bio": "Experienced executive with 15+ years in leadership",
  "profile_picture": "https://api.example.org/media/executives/john_new.jpg",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-18T11:45:00Z"
}
```

**Success Response**:
- **200 OK**: Profile picture successfully uploaded

**Error Responses**:
- **400 Bad Request**: Invalid file type or size
- **404 Not Found**: Executive with specified ID does not exist

**Section sources**
- [api.d.ts](file://src/types/api.d.ts#L270-L290)
- [executive-members.ts](file://src/services/executive-members.ts#L148-L154)

## Delete Profile Picture
Removes the profile picture from an executive record.

**Endpoint**: `DELETE /api/executives/executives/{id}/delete-profile-picture/`

**Path Parameters**:
- `id`: Unique identifier of the executive (integer)

**Request Example**:
```http
DELETE /api/executives/executives/1/delete-profile-picture/ HTTP/1.1
Cookie: access_token=your-jwt-token
```

**Success Response**:
- **204 No Content**: Profile picture successfully removed

**Error Responses**:
- **404 Not Found**: Executive with specified ID does not exist

**Section sources**
- [api.d.ts](file://src/types/api.d.ts#L290-L310)
- [executive-members.ts](file://src/services/executive-members.ts#L157-L159)

## Data Types
This section defines the data structures used in the API.

### Executive
The primary data model for executive members.

**Schema**: `components["schemas"]["Executive"]`

| Field | Type | Required | Description |
|------|------|----------|-------------|
| id | number | Read-only | Unique identifier |
| name | string | Yes | Full name of the executive |
| address | string | Yes | Street address |
| city | string | Yes | City of residence |
| phone | string | Yes | Contact phone number |
| email | string (email) | Yes | Valid email address |
| role | string | Yes | Position/role in organization |
| education | string | Yes | Educational background |
| bio | string | No | Biography/description |
| profile_picture | string (uri) | No | URL to profile image |
| created_at | string (date-time) | Read-only | Creation timestamp |
| updated_at | string (date-time) | Read-only | Last update timestamp |

### PaginatedExecutiveList
Response structure for list operations.

| Field | Type | Description |
|------|------|-------------|
| count | number | Total number of records