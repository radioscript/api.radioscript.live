# Post Interactions Feature

این ماژول قابلیت‌های لایک و مشاهده پست‌ها را فراهم می‌کند.

## قابلیت‌ها

### 1. لایک کردن پست‌ها

- کاربران می‌توانند پست‌ها را لایک/آنلایک کنند
- هر کاربر فقط یک بار می‌تواند یک پست را لایک کند
- تعداد لایک‌ها برای هر پست محاسبه می‌شود

### 2. ثبت مشاهده پست‌ها

- ثبت بازدید از پست‌ها (برای کاربران ثبت‌نام شده و مهمان)
- ردیابی مدت زمان مشاهده برای پادکست‌ها
- ثبت تکمیل پخش پادکست‌ها

### 3. آمار و گزارش‌گیری

- تعداد لایک‌ها
- تعداد بازدیدها
- تعداد پخش‌های کامل پادکست‌ها
- تعداد بازدیدکنندگان منحصر به فرد

## API Endpoints

### لایک کردن پست

```http
POST /post-interactions/like
Authorization: Bearer <token>
Content-Type: application/json

{
  "postId": "uuid"
}
```

### بررسی لایک کاربر

```http
GET /post-interactions/like/:postId
Authorization: Bearer <token>
```

### ثبت بازدید

```http
POST /post-interactions/view
Content-Type: application/json

{
  "postId": "uuid",
  "sessionId": "optional-session-id",
  "viewDuration": 120,
  "isCompleted": false
}
```

### به‌روزرسانی مدت زمان مشاهده

```http
POST /post-interactions/view/:postId/duration
Content-Type: application/json

{
  "viewDuration": 300,
  "isCompleted": true
}
```

### دریافت آمار پست

```http
GET /post-interactions/stats/:postId
```

### دریافت پست‌های لایک شده کاربر

```http
GET /post-interactions/liked-posts?page=1&limit=10
Authorization: Bearer <token>
```

## ساختار دیتابیس

### جدول post_likes

- `id`: شناسه یکتا
- `user_id`: شناسه کاربر
- `post_id`: شناسه پست
- `created_at`: تاریخ ایجاد
- `updated_at`: تاریخ به‌روزرسانی
- `deleted_at`: تاریخ حذف (soft delete)

### جدول post_views

- `id`: شناسه یکتا
- `user_id`: شناسه کاربر (اختیاری)
- `post_id`: شناسه پست
- `ip_address`: آدرس IP
- `user_agent`: مرورگر کاربر
- `session_id`: شناسه نشست (برای کاربران مهمان)
- `view_duration`: مدت زمان مشاهده (ثانیه)
- `is_completed`: آیا پادکست تا انتها شنیده شده
- `created_at`: تاریخ ایجاد
- `updated_at`: تاریخ به‌روزرسانی
- `deleted_at`: تاریخ حذف (soft delete)

## نحوه استفاده

### در سرویس پست‌ها

آمار لایک و بازدید به صورت خودکار در پاسخ‌های API پست‌ها اضافه می‌شود:

```typescript
// در پاسخ findOne و findAll
{
  id: "uuid",
  title: "عنوان پست",
  content: "محتوای پست",
  likeCount: 15,
  viewCount: 120,
  playCount: 45 // برای پادکست‌ها
}
```

### در فرانت‌اند

```javascript
// لایک کردن پست
const response = await fetch('/post-interactions/like', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ postId: 'uuid' }),
});

// ثبت بازدید
await fetch('/post-interactions/view', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    postId: 'uuid',
    sessionId: 'session-123',
  }),
});

// برای پادکست‌ها - به‌روزرسانی مدت زمان
setInterval(async () => {
  await fetch(`/post-interactions/view/${postId}/duration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      viewDuration: currentTime,
      isCompleted: false,
    }),
  });
}, 30000); // هر 30 ثانیه

// هنگام اتمام پادکست
await fetch(`/post-interactions/view/${postId}/duration`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    viewDuration: totalDuration,
    isCompleted: true,
  }),
});
```
