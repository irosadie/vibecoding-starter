# API Contract: Account Access

## Base URL
`/api/v1`

## Endpoints

### POST /auth/register

Register akun user baru dengan `email + password`.

**Request Body**
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| name | string | ✅ | 1-120 karakter |
| email | string | ✅ | format email valid, unique |
| password | string | ✅ | minimal 8 karakter |

**Response 201**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "name": "Baim",
      "email": "baim@example.com",
      "role": "USER",
      "status": "ACTIVE",
      "photo": null
    }
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 409 | CONFLICT | Email sudah terdaftar |
| 422 | VALIDATION | Payload tidak valid |
| 500 | INTERNAL | Internal server error |

---

### POST /auth/login

Login dengan `email + password` dan membuat session aktif.

**Request Body**
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| email | string | ✅ | format email valid |
| password | string | ✅ | password plaintext |

**Response 200**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "name": "Baim",
      "email": "baim@example.com",
      "role": "USER",
      "status": "ACTIVE",
      "photo": null
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token",
      "expiresIn": 3600
    }
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | Email atau password salah |
| 403 | FORBIDDEN | Akun suspended |
| 422 | VALIDATION | Payload tidak valid |
| 500 | INTERNAL | Internal server error |

---

### POST /auth/logout

Logout dan menonaktifkan session aktif.

**Headers**
| Header | Required | Notes |
| --- | --- | --- |
| Authorization | ✅ | `Bearer {accessToken}` |

**Response 200**
```json
{
  "data": {
    "success": true
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | Token tidak valid/expired |
| 500 | INTERNAL | Internal server error |

---

### GET /auth/me

Ambil profil user aktif dari access token.

**Headers**
| Header | Required | Notes |
| --- | --- | --- |
| Authorization | ✅ | `Bearer {accessToken}` |

**Response 200**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "name": "Baim",
      "email": "baim@example.com",
      "role": "USER",
      "status": "ACTIVE",
      "photo": null
    },
    "session": {
      "expiresAt": "2026-03-18T07:00:00.000Z"
    }
  }
}
```

**Error Responses**
| Status | Code | Deskripsi |
| --- | --- | --- |
| 401 | UNAUTHORIZED | Token tidak valid/expired |
| 403 | FORBIDDEN | Akun tidak aktif |
| 500 | INTERNAL | Internal server error |

## Enum

### `role`
- `USER`
- `CREATOR`
- `ADMIN`

### `status`
- `ACTIVE`
- `SUSPENDED`
