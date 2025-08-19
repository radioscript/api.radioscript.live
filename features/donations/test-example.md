# Test Examples for Donations Feature

## Prerequisites

1. Run the database migration: `migrations/donations.sql`
2. Start the application: `npm run serve`

## Test Scenarios

### 1. Create a Donation (No Authentication Required)

```bash
# Create a donation as a guest user
curl -X POST http://localhost:3000/donations \
  -H "Content-Type: application/json" \
  -d '{
    "donorName": "علی احمدی",
    "donorEmail": "ali@example.com",
    "amount": 100000,
    "currency": "IRR",
    "paymentMethod": "online",
    "message": "برای حمایت از پروژه",
    "isAnonymous": false,
    "sessionId": "session-123"
  }'

# Create an anonymous donation
curl -X POST http://localhost:3000/donations \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "currency": "IRR",
    "paymentMethod": "online",
    "message": "حمایت ناشناس",
    "isAnonymous": true
  }'
```

### 2. Create a Donation as Authenticated User

```bash
# First, get a JWT token by logging in
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use the token to create a donation
curl -X POST http://localhost:3000/donations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 200000,
    "currency": "IRR",
    "paymentMethod": "online",
    "message": "حمایت از کاربر ثبت‌نام شده"
  }'
```

### 3. View Recent Donations (Public)

```bash
# Get recent donations
curl -X GET "http://localhost:3000/donations/recent?limit=5"
```

### 4. View Top Donors (Public)

```bash
# Get top donors
curl -X GET "http://localhost:3000/donations/top-donors?limit=10"
```

### 5. View User's Donations (Authenticated)

```bash
# Get current user's donations
curl -X GET "http://localhost:3000/donations/my-donations?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Admin Operations

```bash
# Get donation statistics (Admin only)
curl -X GET http://localhost:3000/donations/stats \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Get all donations with filters (Admin only)
curl -X GET "http://localhost:3000/donations?paymentStatus=completed&currency=IRR&page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Get specific donation (Admin only)
curl -X GET http://localhost:3000/donations/donation-uuid-here \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Update donation status (Admin only)
curl -X PUT http://localhost:3000/donations/donation-uuid-here \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentStatus": "completed",
    "transactionId": "txn_123456"
  }'

# Delete donation (Admin only)
curl -X DELETE http://localhost:3000/donations/donation-uuid-here \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

## Expected Responses

### Create Donation Response

```json
{
  "id": "uuid",
  "donorName": "علی احمدی",
  "donorEmail": "ali@example.com",
  "amount": 100000,
  "currency": "IRR",
  "paymentMethod": "online",
  "paymentStatus": "pending",
  "message": "برای حمایت از پروژه",
  "isAnonymous": false,
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "created_at": "2024-01-01T10:00:00Z"
}
```

### Donation Statistics Response

```json
{
  "totalDonations": 150,
  "completedDonations": 120,
  "pendingDonations": 20,
  "failedDonations": 10,
  "totalAmount": 15000000,
  "totalAmountIRR": 12000000,
  "totalAmountUSD": 3000,
  "totalDonationsIRR": 100,
  "totalDonationsUSD": 20,
  "successRate": 80
}
```

### Recent Donations Response

```json
[
  {
    "id": "uuid",
    "donorName": "علی احمدی",
    "amount": 100000,
    "currency": "IRR",
    "paymentStatus": "completed",
    "message": "برای حمایت از پروژه",
    "isAnonymous": false,
    "created_at": "2024-01-01T10:00:00Z"
  }
]
```

### Top Donors Response

```json
[
  {
    "donorName": "علی احمدی",
    "donorEmail": "ali@example.com",
    "totalAmount": "5000000",
    "donationCount": "5"
  }
]
```

## Testing Different Scenarios

### 1. Anonymous Donation

```bash
curl -X POST http://localhost:3000/donations \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 75000,
    "currency": "IRR",
    "paymentMethod": "online",
    "isAnonymous": true
  }'
```

### 2. Currency Examples (تومان و دلار فقط)

```bash
# Donation in USD
curl -X POST http://localhost:3000/donations \
  -H "Content-Type: application/json" \
  -d '{
    "donorName": "John Doe",
    "donorEmail": "john@example.com",
    "amount": 50,
    "currency": "USD",
    "paymentMethod": "paypal",
    "message": "Support from abroad"
  }'

# Donation in IRR (Toman)
curl -X POST http://localhost:3000/donations \
  -H "Content-Type: application/json" \
  -d '{
    "donorName": "علی احمدی",
    "donorEmail": "ali@example.com",
    "amount": 1000000,
    "currency": "IRR",
    "paymentMethod": "online",
    "message": "حمایت با تومان"
  }'
```

### 3. Search Donations (Admin)

```bash
curl -X GET "http://localhost:3000/donations?search=علی&paymentStatus=completed" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 4. Filter by Currency (Admin)

```bash
curl -X GET "http://localhost:3000/donations?currency=USD" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```
