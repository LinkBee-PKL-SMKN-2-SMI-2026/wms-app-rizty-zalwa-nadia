# API Documentation

**Base URL:** `http://localhost:3000/api`

---

## Example API

### `POST /api/example` — Create Example

Membuat satu data Example baru.

**Request Body:**

```json
{
  "name": "Laptop Gaming",
  "description": "Laptop untuk gaming",
  "isActive": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Min 3 karakter |
| `description` | string | ❌ | |
| `isActive` | boolean | ❌ | Default: `true` |

**Response (201):**

```json
{
  "success": true,
  "message": "Example created successfully",
  "data": {
    "id": "a1b2c3d4-...",
    "name": "Laptop Gaming",
    "description": "Laptop untuk gaming",
    "isActive": true,
    "createdAt": "2026-07-30T10:00:00.000Z",
    "updatedAt": "2026-07-30T10:00:00.000Z"
  }
}
```

**Error (409):** `name` sudah dipakai.

---

### `GET /api/example` — Get All Examples

Mengambil daftar Example dengan pagination, search, filter, dan sort.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Halaman |
| `limit` | integer | `10` | Data per halaman (max 100) |
| `search` | string | — | Cari berdasarkan nama (case-insensitive) |
| `sort` | `asc` / `desc` | `asc` | Urutkan berdasarkan nama |
| `isActive` | boolean | — | Filter berdasarkan status aktif |

**Response (200):**

```json
{
  "success": true,
  "message": "Examples retrieved successfully",
  "data": [
    {
      "id": "a1b2c3d4-...",
      "name": "Laptop Gaming",
      "description": "Laptop untuk gaming",
      "isActive": true,
      "items": [
        {
          "id": "item-1-...",
          "productName": "Mouse",
          "quantity": 10,
          "price": 150000,
          "exampleId": "a1b2c3d4-..."
        }
      ],
      "createdAt": "2026-07-30T10:00:00.000Z",
      "updatedAt": "2026-07-30T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### `GET /api/example/:id` — Get Example by ID

Mengambil satu Example berdasarkan UUID.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID (string) | ID Example |

**Response (200):**

```json
{
  "success": true,
  "message": "Example retrieved successfully",
  "data": {
    "id": "a1b2c3d4-...",
    "name": "Laptop Gaming",
    "isActive": true,
    "items": [
      { "id": "...", "productName": "Mouse", "quantity": 10, "price": 150000, "exampleId": "..." }
    ],
    "createdAt": "2026-07-30T10:00:00.000Z",
    "updatedAt": "2026-07-30T10:00:00.000Z"
  }
}
```

**Error (404):** ID tidak ditemukan.

---

### `PUT /api/example/:id` — Full Update Example

Mengupdate seluruh data Example. Semua field required harus dikirim.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID (string) | ID Example |

**Request Body:**

```json
{
  "name": "Laptop Baru",
  "description": "Deskripsi baru",
  "isActive": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Min 3 karakter |
| `description` | string | ❌ | |
| `isActive` | boolean | ✅ | |

**Response (200):** Sama seperti POST.

**Error (404):** ID tidak ditemukan.
**Error (409):** `name` sudah dipakai data lain.

---

### `PATCH /api/example/:id` — Partial Update Example

Mengupdate sebagian data Example. Hanya kirim field yang ingin diubah.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID (string) | ID Example |

**Request Body:**

```json
{
  "description": "Deskripsi yang diubah"
}
```

Minimal harus ada 1 field.

**Response (200):** Sama seperti POST.

**Error (400):** Tidak ada field yang dikirim.
**Error (404):** ID tidak ditemukan.
**Error (409):** `name` sudah dipakai data lain.

---

### `DELETE /api/example/:id` — Delete Example

Menghapus satu Example berdasarkan ID.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID (string) | ID Example |

**Response (200):**

```json
{
  "success": true,
  "message": "Example deleted successfully",
  "data": {
    "id": "a1b2c3d4-...",
    "name": "Laptop Gaming",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error (404):** ID tidak ditemukan.

---

### `POST /api/example/bulk` — Bulk Create Examples

Membuat banyak Example sekaligus. Setiap item diproses satu-satu — yang berhasil masuk `data`, yang gagal masuk `failed`.

**Request Body:**

```json
{
  "items": [
    { "name": "Item 1", "description": "A" },
    { "name": "Item 2", "description": "B" },
    { "name": "Item 3" }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `items` | array | ✅ | 1–50 items |

**Response (201):**

```json
{
  "success": true,
  "message": "2 item berhasil dibuat, 1 item gagal",
  "data": [
    { "id": "...", "name": "Item 1", "isActive": true, ... },
    { "id": "...", "name": "Item 2", "isActive": true, ... }
  ],
  "failed": [
    { "index": 2, "name": "Item 3", "reason": "Nama Item 3 sudah ada" }
  ]
}
```

---

### `POST /api/example/with-items` — Create Example with Items

Membuat Example beserta item-item di dalamnya.

**Request Body:**

```json
{
  "name": "Toko Elektronik",
  "category": "Elektronik",
  "items": [
    { "productName": "Kabel HDMI", "quantity": 50, "price": 25000 },
    { "productName": "Adaptor", "quantity": 30, "price": 75000 }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Min 3 karakter |
| `category` | string | ✅ | |
| `items` | array | ✅ | 1–20 items |

**Response (201):**

```json
{
  "success": true,
  "message": "Example with items created successfully",
  "data": {
    "id": "a1b2c3d4-...",
    "name": "Toko Elektronik",
    "category": "Elektronik",
    "items": [
      { "id": "...", "productName": "Kabel HDMI", "quantity": 50, "price": 25000, "exampleId": "..." },
      { "id": "...", "productName": "Adaptor", "quantity": 30, "price": 75000, "exampleId": "..." }
    ],
    "totalItems": 80,
    "totalValue": 3500000
  }
}
```

**Error (400):** Nama produk duplikat dalam satu request.
**Error (409):** Nama Example sudah ada.

---

## Error Response Format

Semua endpoint mengembalikan error dengan format:

```json
{
  "success": false,
  "message": "Deskripsi error",
  "errors": {
    "name": ["Name must be at least 3 characters"]
  }
}
```

| Field | Description |
|-------|-------------|
| `message` | Pesan error umum |
| `errors` | (optional) Error per field untuk validation |

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error / Bad request |
| 404 | Resource not found |
| 409 | Conflict (duplicate name) |
| 500 | Internal server error |

---

## Common Response Envelope

Semua response sukses dibungkus dengan format:

```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

Untuk list dengan pagination:

```json
{
  "success": true,
  "message": "...",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```
