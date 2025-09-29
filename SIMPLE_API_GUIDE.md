# Simple School Store API

## Routes

### Public Routes

- `GET /api/v1/items` - Get all items with filters
- `GET /api/v1/items/:id` - Get specific item

### Admin Routes (require authentication)

**Items:**

- `GET /api/v1/admin/items` - Get all items (admin view)
- `POST /api/v1/admin/items` - Create new item
- `PATCH /api/v1/admin/items/:id` - Update item
- `DELETE /api/v1/admin/items/:id` - Delete item

**Users:**

- `GET /api/v1/admin/users` - Get all users with filters
- `POST /api/v1/admin/users` - Create new user
- `GET /api/v1/admin/users/:id` - Get specific user
- `DELETE /api/v1/admin/users/:id` - Delete user

**Admin Profile:**

- `PATCH /api/v1/admin/profile/updateMe` - Update admin profile data
- `PATCH /api/v1/admin/profile/updateImage` - Update admin profile image
- `PATCH /api/v1/admin/profile/updatePassword` - Update admin password

** Dangerous Operations:**

- `DELETE /api/v1/admin/nuclear-clear` - Clear EVERYTHING (including current admin)

## URL Parameters for `/api/v1/items`

### Basic Examples

```bash
# Get all items
GET /api/v1/items

# Search by keyword
GET /api/v1/items?keyword=math

# Filter by category
GET /api/v1/items?category=books
GET /api/v1/items?category=tools

# Filter books by branch
GET /api/v1/items?category=books&branch=preparatory

# Filter books by branch and level
GET /api/v1/items?category=books&branch=preparatory&level=Prep1

# Price range
GET /api/v1/items?price[gte]=20&price[lte]=100

# Sort by price
GET /api/v1/items?sort=price
GET /api/v1/items?sort=-price

# Pagination
GET /api/v1/items?page=2&limit=10

# Combined filters
GET /api/v1/items?category=books&branch=middle&keyword=science&sort=price&page=1&limit=5
```

### Available Parameters

- `keyword` - Search in item name and description
- `category` - Filter by "tools" or "books"
- `branch` - Filter books by "kindergarten", "preparatory", "middle", "secondary"
- `level` - Filter books by level (KG1, KG2, Prep1, Prep2, etc.)
- `price[gte]` - Minimum price
- `price[lte]` - Maximum price
- `sort` - Sort by any field (use - for descending)
- `page` - Page number
- `limit` - Items per page
- `fields` - Select specific fields only

### Response Format

```json
{
  "message": "success",
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "numberOfPages": 5,
    "totalDocuments": 48
  },
  "results": 10,
  "data": [...]
}
```

That's it! Simple and clean. 🚀
