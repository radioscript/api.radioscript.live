# 🔐 RBAC Complete Guide | راهنمای کامل سیستم کنترل دسترسی

## 📖 Table of Contents | فهرست مطالب

- [Overview | نمای کلی](#overview--نمای-کلی)
- [Database Schema | ساختار پایگاه داده](#database-schema--ساختار-پایگاه-داده)
- [Roles | نقش‌ها](#roles--نقشها)
- [Permissions | مجوزها](#permissions--مجوزها)
- [Role-Permission Mapping | نگاشت نقش‌ها و مجوزها](#role-permission-mapping--نگاشت-نقشها-و-مجوزها)
- [Installation | نصب](#installation--نصب)
- [Usage Examples | نمونه‌های استفاده](#usage-examples--نمونههای-استفاده)
- [API Endpoints | نقاط انتهایی API](#api-endpoints--نقاط-انتهایی-api)

---

## Overview | نمای کلی

This project implements a comprehensive Role-Based Access Control (RBAC) system for the Radio Script API. The system provides dynamic, database-driven permission management with fine-grained control over user access.

این پروژه یک سیستم جامع کنترل دسترسی مبتنی بر نقش (RBAC) برای API Radio Script پیاده‌سازی می‌کند. سیستم مدیریت مجوزهای پویا و مبتنی بر پایگاه داده با کنترل دقیق دسترسی کاربران را فراهم می‌کند.

### Key Features | ویژگی‌های کلیدی

- **Dynamic Role Management** | مدیریت پویا نقش‌ها
- **Granular Permissions** | مجوزهای جزئی
- **Runtime Permission Changes** | تغییر مجوزها در زمان اجرا
- **Backward Compatibility** | سازگاری با نسخه‌های قبلی
- **Multi-level Access Control** | کنترل دسترسی چندسطحی

---

## Database Schema | ساختار پایگاه داده

### Tables Created | جداول ایجاد شده

```sql
-- Roles table | جدول نقش‌ها
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(64) UNIQUE NOT NULL,
    display_name VARCHAR(128),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Permissions table | جدول مجوزها
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) UNIQUE NOT NULL,
    display_name VARCHAR(128),
    description TEXT,
    resource VARCHAR(64),
    action VARCHAR(32),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User-Role relationship | رابطه کاربر-نقش
CREATE TABLE user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    PRIMARY KEY (user_id, role_id)
);

-- Role-Permission relationship | رابطه نقش-مجوز
CREATE TABLE role_permissions (
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);
```

---

## Roles | نقش‌ها

### 1. Super Administrator | مدیر ارشد

```json
{
  "name": "super-admin",
  "display_name": "Super Administrator | مدیر ارشد",
  "description": "Full system access - can manage everything including system settings | دسترسی کامل سیستم - می‌تواند همه چیز از جمله تنظیمات سیستم را مدیریت کند"
}
```

### 2. Administrator | مدیر

```json
{
  "name": "admin",
  "display_name": "Administrator | مدیر",
  "description": "Can manage users, content, and most system features except critical system settings | می‌تواند کاربران، محتوا و اکثر ویژگی‌های سیستم را به جز تنظیمات حیاتی سیستم مدیریت کند"
}
```

### 3. Content Editor | ویراستار محتوا

```json
{
  "name": "editor",
  "display_name": "Content Editor | ویراستار محتوا",
  "description": "Can create, edit and manage all content including posts, categories, tags | می‌تواند تمام محتوا شامل پست‌ها، دسته‌بندی‌ها، برچسب‌ها را ایجاد، ویرایش و مدیریت کند"
}
```

### 4. Content Writer | نویسنده محتوا

```json
{
  "name": "writer",
  "display_name": "Content Writer | نویسنده محتوا",
  "description": "Can create and edit own content, limited publishing permissions | می‌تواند محتوای خود را ایجاد و ویرایش کند، مجوزهای انتشار محدود"
}
```

### 5. Manager | مدیر

```json
{
  "name": "manager",
  "display_name": "Manager | مدیر",
  "description": "Can manage radio scripts, upload media, create show content | می‌تواند اسکریپت‌های رادیویی را مدیریت کند، رسانه آپلود کند، محتوای برنامه ایجاد کند"
}
```

### 6. Content Moderator | ناظر محتوا

```json
{
  "name": "moderator",
  "display_name": "Content Moderator | ناظر محتوا",
  "description": "Can moderate comments, review content, manage user interactions | می‌تواند نظرات را نظارت کند، محتوا را بررسی کند، تعاملات کاربران را مدیریت کند"
}
```

### 7. Regular User | کاربر عادی

```json
{
  "name": "user",
  "display_name": "Regular User | کاربر عادی",
  "description": "Basic user permissions - can view content and interact | مجوزهای کاربر پایه - می‌تواند محتوا را مشاهده و تعامل کند"
}
```

---

## Permissions | مجوزها

### User Management | مدیریت کاربران

| Permission           | English Description   | Persian Description         |
| -------------------- | --------------------- | --------------------------- |
| `users.create`       | Create new users      | ایجاد کاربران جدید          |
| `users.read`         | View user information | مشاهده اطلاعات کاربران      |
| `users.update`       | Edit user information | ویرایش اطلاعات کاربران      |
| `users.delete`       | Delete users          | حذف کاربران                 |
| `users.ban`          | Ban users from system | محروم کردن کاربران از سیستم |
| `users.unban`        | Unban users           | رفع محرومیت کاربران         |
| `users.assign-roles` | Assign roles to users | اختصاص نقش به کاربران       |

### Content Management | مدیریت محتوا

| Permission        | English Description | Persian Description |
| ----------------- | ------------------- | ------------------- |
| `posts.create`    | Create new posts    | ایجاد پست‌های جدید  |
| `posts.read`      | View posts          | مشاهده پست‌ها       |
| `posts.update`    | Edit posts          | ویرایش پست‌ها       |
| `posts.delete`    | Delete posts        | حذف پست‌ها          |
| `posts.publish`   | Publish posts       | انتشار پست‌ها       |
| `posts.unpublish` | Unpublish posts     | لغو انتشار پست‌ها   |
| `posts.feature`   | Feature posts       | ویژه کردن پست‌ها    |
| `posts.moderate`  | Moderate posts      | نظارت بر پست‌ها     |

### Categories & Tags | دسته‌بندی‌ها و برچسب‌ها

| Permission          | English Description | Persian Description |
| ------------------- | ------------------- | ------------------- |
| `categories.create` | Create categories   | ایجاد دسته‌بندی‌ها  |
| `categories.read`   | View categories     | مشاهده دسته‌بندی‌ها |
| `categories.update` | Edit categories     | ویرایش دسته‌بندی‌ها |
| `categories.delete` | Delete categories   | حذف دسته‌بندی‌ها    |
| `tags.create`       | Create tags         | ایجاد برچسب‌ها      |
| `tags.read`         | View tags           | مشاهده برچسب‌ها     |
| `tags.update`       | Edit tags           | ویرایش برچسب‌ها     |
| `tags.delete`       | Delete tags         | حذف برچسب‌ها        |

### Comments Management | مدیریت نظرات

| Permission          | English Description | Persian Description |
| ------------------- | ------------------- | ------------------- |
| `comments.create`   | Create comments     | ایجاد نظرات         |
| `comments.read`     | View comments       | مشاهده نظرات        |
| `comments.update`   | Edit comments       | ویرایش نظرات        |
| `comments.delete`   | Delete comments     | حذف نظرات           |
| `comments.moderate` | Moderate comments   | نظارت بر نظرات      |
| `comments.approve`  | Approve comments    | تأیید نظرات         |
| `comments.reject`   | Reject comments     | رد نظرات            |

### Media Management | مدیریت رسانه

| Permission       | English Description    | Persian Description      |
| ---------------- | ---------------------- | ------------------------ |
| `media.upload`   | Upload media files     | آپلود فایل‌های رسانه     |
| `media.read`     | View media files       | مشاهده فایل‌های رسانه    |
| `media.update`   | Edit media information | ویرایش اطلاعات رسانه     |
| `media.delete`   | Delete media files     | حذف فایل‌های رسانه       |
| `media.organize` | Organize media library | سازماندهی کتابخانه رسانه |

### Radio Script Management | مدیریت اسکریپت رادیویی

| Permission          | English Description     | Persian Description           |
| ------------------- | ----------------------- | ----------------------------- |
| `scripts.create`    | Create radio scripts    | ایجاد اسکریپت‌های رادیویی     |
| `scripts.read`      | View radio scripts      | مشاهده اسکریپت‌های رادیویی    |
| `scripts.update`    | Edit radio scripts      | ویرایش اسکریپت‌های رادیویی    |
| `scripts.delete`    | Delete radio scripts    | حذف اسکریپت‌های رادیویی       |
| `scripts.schedule`  | Schedule radio scripts  | زمان‌بندی اسکریپت‌های رادیویی |
| `scripts.broadcast` | Broadcast radio scripts | پخش اسکریپت‌های رادیویی       |

### Dashboard & Analytics | داشبورد و تحلیل‌ها

| Permission         | English Description    | Persian Description      |
| ------------------ | ---------------------- | ------------------------ |
| `dashboard.access` | Access admin dashboard | دسترسی به داشبورد مدیریت |
| `analytics.view`   | View analytics data    | مشاهده داده‌های تحلیلی   |
| `reports.generate` | Generate reports       | تولید گزارش‌ها           |
| `reports.export`   | Export reports         | صادرات گزارش‌ها          |

### System Management | مدیریت سیستم

| Permission        | English Description        | Persian Description    |
| ----------------- | -------------------------- | ---------------------- |
| `system.settings` | Manage system settings     | مدیریت تنظیمات سیستم   |
| `system.backup`   | Create system backups      | ایجاد پشتیبان سیستم    |
| `system.restore`  | Restore from backup        | بازیابی از پشتیبان     |
| `system.logs`     | View system logs           | مشاهده لاگ‌های سیستم   |
| `rbac.manage`     | Manage roles & permissions | مدیریت نقش‌ها و مجوزها |

---

## Role-Permission Mapping | نگاشت نقش‌ها و مجوزها

### Super Admin | مدیر ارشد

```javascript
// All permissions | همه مجوزها
[
  '*', // All system permissions | همه مجوزهای سیستم
];
```

### Admin | مدیر

```javascript
[
  // User Management | مدیریت کاربران
  'users.create',
  'users.read',
  'users.update',
  'users.delete',
  'users.ban',
  'users.unban',
  'users.assign-roles',

  // Content Management | مدیریت محتوا
  'posts.create',
  'posts.read',
  'posts.update',
  'posts.delete',
  'posts.publish',
  'posts.unpublish',
  'posts.feature',
  'posts.moderate',

  // Categories & Tags | دسته‌بندی‌ها و برچسب‌ها
  'categories.create',
  'categories.read',
  'categories.update',
  'categories.delete',
  'tags.create',
  'tags.read',
  'tags.update',
  'tags.delete',

  // Comments | نظرات
  'comments.create',
  'comments.read',
  'comments.update',
  'comments.delete',
  'comments.moderate',
  'comments.approve',
  'comments.reject',

  // Media | رسانه
  'media.upload',
  'media.read',
  'media.update',
  'media.delete',
  'media.organize',

  // Scripts | اسکریپت‌ها
  'scripts.create',
  'scripts.read',
  'scripts.update',
  'scripts.delete',
  'scripts.schedule',
  'scripts.broadcast',

  // Dashboard & Analytics | داشبورد و تحلیل‌ها
  'dashboard.access',
  'analytics.view',
  'reports.generate',
  'reports.export',
];
```

### Editor | ویراستار

```javascript
[
  // Content Creation & Management | ایجاد و مدیریت محتوا
  'posts.create',
  'posts.read',
  'posts.update',
  'posts.publish',
  'posts.unpublish',
  'posts.feature',

  // Categories & Tags | دسته‌بندی‌ها و برچسب‌ها
  'categories.create',
  'categories.read',
  'categories.update',
  'categories.delete',
  'tags.create',
  'tags.read',
  'tags.update',
  'tags.delete',

  // Comment Moderation | نظارت بر نظرات
  'comments.moderate',
  'comments.approve',
  'comments.reject',

  // Media Management | مدیریت رسانه
  'media.upload',
  'media.read',
  'media.update',
  'media.organize',

  // Script Management | مدیریت اسکریپت
  'scripts.create',
  'scripts.read',
  'scripts.update',

  // Dashboard Access | دسترسی داشبورد
  'dashboard.access',
];
```

### Writer | نویسنده

```javascript
[
  // Limited Content Creation | ایجاد محتوای محدود
  'posts.create',
  'posts.read',
  'posts.update',

  // Read-only Categories | دسته‌بندی‌های فقط خواندنی
  'categories.read',

  // Tag Management | مدیریت برچسب
  'tags.read',
  'tags.create',

  // Media Upload | آپلود رسانه
  'media.upload',
  'media.read',

  // Script Creation | ایجاد اسکریپت
  'scripts.create',
  'scripts.read',
  'scripts.update',
];
```

### Manager | مدیر

```javascript
[
  // Full Script Management | مدیریت کامل اسکریپت
  'scripts.create',
  'scripts.read',
  'scripts.update',
  'scripts.delete',
  'scripts.schedule',
  'scripts.broadcast',

  // Full Media Management | مدیریت کامل رسانه
  'media.upload',
  'media.read',
  'media.update',
  'media.delete',
  'media.organize',

  // Content Creation | ایجاد محتوا
  'posts.create',
  'posts.read',
  'posts.update',

  // Read Access | دسترسی خواندن
  'categories.read',
  'tags.read',

  // Dashboard & Analytics | داشبورد و تحلیل‌ها
  'dashboard.access',
  'analytics.view',
];
```

### Moderator | ناظر

```javascript
[
  // Comment Management | مدیریت نظرات
  'comments.create',
  'comments.read',
  'comments.update',
  'comments.delete',
  'comments.moderate',
  'comments.approve',
  'comments.reject',

  // Content Moderation | نظارت بر محتوا
  'posts.read',
  'posts.moderate',

  // User Information | اطلاعات کاربران
  'users.read',

  // Media Viewing | مشاهده رسانه
  'media.read',
];
```

### User | کاربر

```javascript
[
  // Basic Read Access | دسترسی خواندن پایه
  'posts.read',
  'categories.read',
  'tags.read',
  'media.read',

  // Comment Interaction | تعامل نظرات
  'comments.create',
  'comments.read',
];
```

---

## Installation | نصب

### 1. Run SQL Script | اجرای اسکریپت SQL

Execute the following script in your PostgreSQL database:

اسکریپت زیر را در پایگاه داده PostgreSQL خود اجرا کنید:

```bash
psql -U your_username -d your_database_name -f rbac_seed.sql
```

### 2. Update NestJS Modules | به‌روزرسانی ماژول‌های NestJS

Ensure all modules using `RolesGuard` import required entities:

اطمینان حاصل کنید که تمام ماژول‌های استفاده‌کننده از `RolesGuard` انتیتی‌های مورد نیاز را import می‌کنند:

```typescript
import { User, Role, Permission } from '@/entities';
import { JwtAuthGuard, RolesGuard } from '@/guards';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission /*...other entities*/])],
  providers: [, /*...other providers*/ JwtAuthGuard, RolesGuard, JwtService],
})
export class YourModule {}
```

---

## Usage Examples | نمونه‌های استفاده

### 1. Using @Roles Decorator | استفاده از تزئین‌گر @Roles

```typescript
import { Controller, Post, UseGuards } from '@nestjs/common';
import { Roles } from '@/decorators';
import { UserRole } from '@/enums';
import { JwtAuthGuard, RolesGuard } from '@/guards';

@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostsController {
  // Using legacy enum roles | استفاده از نقش‌های enum قدیمی
  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createPost() {
    // Only users with ADMIN or SUPER_ADMIN enum role can access
    // فقط کاربران با نقش ADMIN یا SUPER_ADMIN می‌توانند دسترسی داشته باشند
  }

  // Using new string-based roles | استفاده از نقش‌های جدید مبتنی بر رشته
  @Post('advanced')
  @Roles('manager', 'editor')
  createAdvancedPost() {
    // Only users with manager or editor roles can access
    // فقط کاربران با نقش manager یا editor می‌توانند دسترسی داشته باشند
  }
}
```

### 2. Using @Permissions Decorator | استفاده از تزئین‌گر @Permissions

```typescript
import { Controller, Post, UseGuards } from '@nestjs/common';
import { Permissions } from '@/decorators';
import { JwtAuthGuard, RolesGuard } from '@/guards';

@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostsController {
  @Post()
  @Permissions('posts.create')
  createPost() {
    // Only users with posts.create permission can access
    // فقط کاربران با مجوز posts.create می‌توانند دسترسی داشته باشند
  }

  @Delete(':id')
  @Permissions('posts.delete', 'admin.override')
  deletePost() {
    // Users with either posts.delete OR admin.override permission can access
    // کاربران با مجوز posts.delete یا admin.override می‌توانند دسترسی داشته باشند
  }
}
```

### 3. Combining @Roles and @Permissions | ترکیب @Roles و @Permissions

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Post('users')
  @Roles('admin')
  @Permissions('users.create')
  createUser() {
    // User must have admin role OR users.create permission
    // کاربر باید نقش admin یا مجوز users.create داشته باشد
    // (OR logic - either condition satisfies access)
    // (منطق OR - هر یک از شرایط دسترسی را برآورده می‌کند)
  }
}
```

### 4. Using RbacService | استفاده از RbacService

```typescript
import { Injectable } from '@nestjs/common';
import { RbacService } from '@/roles';

@Injectable()
export class SomeService {
  constructor(private rbacService: RbacService) {}

  async checkUserAccess(userId: string) {
    // Check specific permission | بررسی مجوز خاص
    const canCreatePosts = await this.rbacService.checkUserPermission(userId, 'posts.create');

    // Check specific role | بررسی نقش خاص
    const isAdmin = await this.rbacService.checkUserRole(userId, 'admin');

    // Get all user permissions | دریافت همه مجوزهای کاربر
    const permissions = await this.rbacService.getUserPermissions(userId);

    // Get all user roles | دریافت همه نقش‌های کاربر
    const roles = await this.rbacService.getUserRoles(userId);

    return { canCreatePosts, isAdmin, permissions, roles };
  }
}
```

---

## API Endpoints | نقاط انتهایی API

### Role Management | مدیریت نقش‌ها

| Method   | Endpoint          | Description               | توضیحات             |
| -------- | ----------------- | ------------------------- | ------------------- |
| `POST`   | `/rbac/roles`     | Create a new role         | ایجاد نقش جدید      |
| `GET`    | `/rbac/roles`     | Get all roles             | دریافت همه نقش‌ها   |
| `GET`    | `/rbac/roles/:id` | Get role by ID            | دریافت نقش با شناسه |
| `PUT`    | `/rbac/roles/:id` | Update role               | به‌روزرسانی نقش     |
| `DELETE` | `/rbac/roles/:id` | Delete role (soft delete) | حذف نقش (حذف نرم)   |

### Permission Management | مدیریت مجوزها

| Method   | Endpoint                | Description                     | توضیحات              |
| -------- | ----------------------- | ------------------------------- | -------------------- |
| `POST`   | `/rbac/permissions`     | Create a new permission         | ایجاد مجوز جدید      |
| `GET`    | `/rbac/permissions`     | Get all permissions             | دریافت همه مجوزها    |
| `GET`    | `/rbac/permissions/:id` | Get permission by ID            | دریافت مجوز با شناسه |
| `PUT`    | `/rbac/permissions/:id` | Update permission               | به‌روزرسانی مجوز     |
| `DELETE` | `/rbac/permissions/:id` | Delete permission (soft delete) | حذف مجوز (حذف نرم)   |

### Role-Permission Assignment | اختصاص نقش-مجوز

| Method   | Endpoint                                        | Description                 | توضیحات            |
| -------- | ----------------------------------------------- | --------------------------- | ------------------ |
| `POST`   | `/rbac/roles/:roleId/permissions/:permissionId` | Assign permission to role   | اختصاص مجوز به نقش |
| `DELETE` | `/rbac/roles/:roleId/permissions/:permissionId` | Remove permission from role | حذف مجوز از نقش    |
| `GET`    | `/rbac/roles/:roleId/permissions`               | Get role permissions        | دریافت مجوزهای نقش |

### User-Role Assignment | اختصاص کاربر-نقش

| Method   | Endpoint                            | Description           | توضیحات              |
| -------- | ----------------------------------- | --------------------- | -------------------- |
| `POST`   | `/rbac/users/:userId/roles/:roleId` | Assign role to user   | اختصاص نقش به کاربر  |
| `DELETE` | `/rbac/users/:userId/roles/:roleId` | Remove role from user | حذف نقش از کاربر     |
| `GET`    | `/rbac/users/:userId/roles`         | Get user roles        | دریافت نقش‌های کاربر |
| `GET`    | `/rbac/users/:userId/permissions`   | Get user permissions  | دریافت مجوزهای کاربر |

---

## Security Benefits | مزایای امنیتی

### English

1. **Granular Control**: Permissions allow fine-grained access control beyond simple roles
2. **Flexible Assignment**: Users can have custom permissions without changing roles
3. **Dynamic Management**: Roles and permissions can be managed at runtime
4. **Audit Trail**: All permission changes are tracked in the database
5. **Principle of Least Privilege**: Users get only the minimum permissions needed
6. **Scalability**: Easy to add new roles and permissions as the system grows

### فارسی

1. **کنترل جزئی**: مجوزها امکان کنترل دسترسی دقیق‌تر از نقش‌های ساده را فراهم می‌کنند
2. **اختصاص انعطاف‌پذیر**: کاربران می‌توانند مجوزهای سفارشی بدون تغییر نقش داشته باشند
3. **مدیریت پویا**: نقش‌ها و مجوزها در زمان اجرا قابل مدیریت هستند
4. **ردیابی عملیات**: تمام تغییرات مجوزها در پایگاه داده ردیابی می‌شوند
5. **اصل کمترین مجوز**: کاربران فقط حداقل مجوزهای مورد نیاز را دریافت می‌کنند
6. **مقیاس‌پذیری**: اضافه کردن نقش‌ها و مجوزهای جدید با رشد سیستم آسان است

---

## Troubleshooting | عیب‌یابی

### Common Issues | مسائل رایج

#### 1. UnknownDependenciesException for RoleRepository

**English**: This error occurs when a module uses `RolesGuard` but doesn't import the required entities.

**فارسی**: این خطا زمانی رخ می‌دهد که ماژولی از `RolesGuard` استفاده می‌کند اما انتیتی‌های مورد نیاز را import نمی‌کند.

**Solution | راه‌حل**:

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission, /*other entities*/])],
  providers: [/*other providers*/, JwtAuthGuard, RolesGuard, JwtService],
})
```

#### 2. Permission Not Working After Database Change

**English**: Permission changes in database don't take effect immediately due to caching.

**فارسی**: تغییرات مجوزها در پایگاه داده به دلیل کش کردن فوراً اعمال نمی‌شوند.

**Solution | راه‌حل**: Restart the application or implement cache invalidation.

#### 3. Multiple Guards Conflict

**English**: Using multiple guards in wrong order can cause authentication issues.

**فارسی**: استفاده از چندین guard به ترتیب اشتباه می‌تواند مشکلات احراز هویت ایجاد کند.

**Solution | راه‌حل**:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard) // Correct order | ترتیب صحیح
```

---

## Conclusion | نتیجه‌گیری

This RBAC system provides a robust, scalable, and flexible solution for managing user permissions in the Radio Script API. It combines the simplicity of role-based access with the power of fine-grained permissions, enabling administrators to create sophisticated access control policies that can evolve with the application's needs.

این سیستم RBAC راه‌حل قدرتمند، مقیاس‌پذیر و انعطاف‌پذیری برای مدیریت مجوزهای کاربران در API Radio Script فراهم می‌کند. این سیستم سادگی دسترسی مبتنی بر نقش را با قدرت مجوزهای جزئی ترکیب می‌کند و به مدیران امکان ایجاد سیاست‌های کنترل دسترسی پیچیده‌ای را می‌دهد که می‌توانند با نیازهای برنامه تکامل یابند.

---

## License | مجوز

This RBAC implementation is part of the Radio Script API project and follows the same licensing terms.

این پیاده‌سازی RBAC بخشی از پروژه API Radio Script است و از همان شرایط مجوز پیروی می‌کند.
