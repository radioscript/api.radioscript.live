# Donations Feature

این ماژول قابلیت‌های مربوط به دونیت و کمک‌های مالی را فراهم می‌کند.

## قابلیت‌ها

### 1. ثبت دونیت

- کاربران ثبت‌نام شده و مهمان می‌توانند دونیت کنند
- امکان دونیت ناشناس
- ثبت اطلاعات کامل دونیت شامل مبلغ، ارز، روش پرداخت و پیام

### 2. مدیریت دونیت‌ها

- مشاهده لیست تمام دونیت‌ها (برای ادمین)
- به‌روزرسانی وضعیت پرداخت
- حذف دونیت‌ها

### 3. آمار و گزارش‌گیری

- آمار کلی دونیت‌ها
- مجموع مبالغ دریافتی
- نرخ موفقیت پرداخت‌ها
- دونیت‌های اخیر
- برترین دونورها

### 4. ردیابی اطلاعات

- ثبت IP و User Agent
- ردیابی نشست‌ها
- ثبت اطلاعات کاربر (در صورت ورود)

## API Endpoints

### ثبت دونیت (بدون نیاز به احراز هویت)

```http
POST /donations
Content-Type: application/json

 {
   "donorName": "نام اهداکننده",
   "donorEmail": "email@example.com",
   "amount": 100000,
   "currency": "IRR",
   "paymentMethod": "online",
   "message": "پیام اهداکننده",
   "isAnonymous": false,
   "sessionId": "session-123"
 }

 // مثال دونیت با دلار
 {
   "donorName": "John Doe",
   "donorEmail": "john@example.com",
   "amount": 50,
   "currency": "USD",
   "paymentMethod": "paypal",
   "message": "Support from abroad",
   "isAnonymous": false
 }
```

### مشاهده دونیت‌های اخیر (عمومی)

```http
GET /donations/recent?limit=10
```

### مشاهده برترین دونورها (عمومی)

```http
GET /donations/top-donors?limit=10
```

### مشاهده دونیت‌های کاربر (نیاز به احراز هویت)

```http
GET /donations/my-donations?page=1&limit=10
Authorization: Bearer <token>
```

### مشاهده تمام دونیت‌ها (فقط ادمین)

```http
GET /donations?page=1&limit=10&paymentStatus=completed&currency=IRR
Authorization: Bearer <token>
```

### مشاهده آمار دونیت‌ها (فقط ادمین)

```http
GET /donations/stats
Authorization: Bearer <token>
```

### مشاهده دونیت خاص (فقط ادمین)

```http
GET /donations/:id
Authorization: Bearer <token>
```

### به‌روزرسانی وضعیت پرداخت (فقط ادمین)

```http
PUT /donations/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentStatus": "completed",
  "transactionId": "txn_123456"
}
```

### حذف دونیت (فقط ادمین)

```http
DELETE /donations/:id
Authorization: Bearer <token>
```

## ساختار دیتابیس

### جدول donations

- `id`: شناسه یکتا
- `user_id`: شناسه کاربر (اختیاری)
- `donor_name`: نام اهداکننده
- `donor_email`: ایمیل اهداکننده
- `amount`: مبلغ دونیت
- `currency`: ارز (فقط IRR یا USD، پیش‌فرض: IRR)
- `payment_method`: روش پرداخت
- `transaction_id`: شناسه تراکنش
- `payment_status`: وضعیت پرداخت (pending, completed, failed, cancelled)
- `ip_address`: آدرس IP
- `user_agent`: مرورگر کاربر
- `session_id`: شناسه نشست
- `message`: پیام اهداکننده
- `is_anonymous`: آیا ناشناس است
- `created_at`: تاریخ ایجاد
- `updated_at`: تاریخ به‌روزرسانی
- `deleted_at`: تاریخ حذف (soft delete)

## نحوه استفاده

### در فرانت‌اند

```javascript
// ثبت دونیت (بدون نیاز به ورود)
const donation = await fetch('/donations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    donorName: 'علی احمدی',
    donorEmail: 'ali@example.com',
    amount: 50000,
    currency: 'IRR',
    paymentMethod: 'online',
    message: 'برای حمایت از پروژه',
    isAnonymous: false,
  }),
});

// مشاهده دونیت‌های اخیر
const recentDonations = await fetch('/donations/recent?limit=5');

// مشاهده برترین دونورها
const topDonors = await fetch('/donations/top-donors?limit=10');

// مشاهده دونیت‌های کاربر (با احراز هویت)
const myDonations = await fetch('/donations/my-donations', {
  headers: { Authorization: `Bearer ${token}` },
});
```

### برای ادمین

```javascript
// مشاهده آمار کلی
const stats = await fetch('/donations/stats', {
  headers: { Authorization: `Bearer ${adminToken}` },
});

// مشاهده تمام دونیت‌ها
const allDonations = await fetch('/donations?paymentStatus=completed', {
  headers: { Authorization: `Bearer ${adminToken}` },
});

// به‌روزرسانی وضعیت پرداخت
await fetch(`/donations/${donationId}`, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    paymentStatus: 'completed',
    transactionId: 'txn_123456',
  }),
});
```

## پاسخ‌های API

### آمار دونیت‌ها

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

### برترین دونورها

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

### دونیت‌های اخیر

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
