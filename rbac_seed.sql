-- RBAC Seed Script for Radio Script API (Safe Version)
-- Run this script in PostgreSQL to populate roles and permissions
-- This version handles duplicates gracefully

-- Clear existing data (optional - uncomment if you want to reset everything)
-- DELETE FROM role_permissions;
-- DELETE FROM user_roles;
-- DELETE FROM permissions;
-- DELETE FROM roles;

-- Insert Permissions (using ON CONFLICT to avoid duplicates)
INSERT INTO permissions (name, display_name, description, resource, action, is_active, created_at, updated_at) VALUES
-- User Management Permissions
('users.create', 'Create Users', 'Can create new users', 'users', 'create', true, NOW(), NOW()),
('users.read', 'Read Users', 'Can view user information', 'users', 'read', true, NOW(), NOW()),
('users.update', 'Update Users', 'Can edit user information', 'users', 'update', true, NOW(), NOW()),
('users.delete', 'Delete Users', 'Can delete users', 'users', 'delete', true, NOW(), NOW()),
('users.ban', 'Ban Users', 'Can ban users from the system', 'users', 'ban', true, NOW(), NOW()),
('users.unban', 'Unban Users', 'Can unban users', 'users', 'unban', true, NOW(), NOW()),
('users.assign-roles', 'Assign User Roles', 'Can assign roles to users', 'users', 'assign-roles', true, NOW(), NOW()),

-- Posts Management Permissions
('posts.create', 'Create Posts', 'Can create new posts', 'posts', 'create', true, NOW(), NOW()),
('posts.read', 'Read Posts', 'Can view posts', 'posts', 'read', true, NOW(), NOW()),
('posts.update', 'Update Posts', 'Can edit posts', 'posts', 'update', true, NOW(), NOW()),
('posts.delete', 'Delete Posts', 'Can delete posts', 'posts', 'delete', true, NOW(), NOW()),
('posts.publish', 'Publish Posts', 'Can publish posts', 'posts', 'publish', true, NOW(), NOW()),
('posts.unpublish', 'Unpublish Posts', 'Can unpublish posts', 'posts', 'unpublish', true, NOW(), NOW()),
('posts.feature', 'Feature Posts', 'Can feature posts', 'posts', 'feature', true, NOW(), NOW()),
('posts.moderate', 'Moderate Posts', 'Can moderate posts', 'posts', 'moderate', true, NOW(), NOW()),

-- Categories Management Permissions
('categories.create', 'Create Categories', 'Can create new categories', 'categories', 'create', true, NOW(), NOW()),
('categories.read', 'Read Categories', 'Can view categories', 'categories', 'read', true, NOW(), NOW()),
('categories.update', 'Update Categories', 'Can edit categories', 'categories', 'update', true, NOW(), NOW()),
('categories.delete', 'Delete Categories', 'Can delete categories', 'categories', 'delete', true, NOW(), NOW()),

-- Tags Management Permissions
('tags.create', 'Create Tags', 'Can create new tags', 'tags', 'create', true, NOW(), NOW()),
('tags.read', 'Read Tags', 'Can view tags', 'tags', 'read', true, NOW(), NOW()),
('tags.update', 'Update Tags', 'Can edit tags', 'tags', 'update', true, NOW(), NOW()),
('tags.delete', 'Delete Tags', 'Can delete tags', 'tags', 'delete', true, NOW(), NOW()),

-- Comments Management Permissions
('comments.create', 'Create Comments', 'Can create comments', 'comments', 'create', true, NOW(), NOW()),
('comments.read', 'Read Comments', 'Can view comments', 'comments', 'read', true, NOW(), NOW()),
('comments.update', 'Update Comments', 'Can edit comments', 'comments', 'update', true, NOW(), NOW()),
('comments.delete', 'Delete Comments', 'Can delete comments', 'comments', 'delete', true, NOW(), NOW()),
('comments.moderate', 'Moderate Comments', 'Can moderate comments', 'comments', 'moderate', true, NOW(), NOW()),
('comments.approve', 'Approve Comments', 'Can approve comments', 'comments', 'approve', true, NOW(), NOW()),
('comments.reject', 'Reject Comments', 'Can reject comments', 'comments', 'reject', true, NOW(), NOW()),

-- Media Management Permissions
('media.upload', 'Upload Media', 'Can upload media files', 'media', 'upload', true, NOW(), NOW()),
('media.read', 'Read Media', 'Can view media files', 'media', 'read', true, NOW(), NOW()),
('media.update', 'Update Media', 'Can edit media information', 'media', 'update', true, NOW(), NOW()),
('media.delete', 'Delete Media', 'Can delete media files', 'media', 'delete', true, NOW(), NOW()),
('media.organize', 'Organize Media', 'Can organize media library', 'media', 'organize', true, NOW(), NOW()),

-- Radio Script Specific Permissions
('scripts.create', 'Create Scripts', 'Can create radio scripts', 'scripts', 'create', true, NOW(), NOW()),
('scripts.read', 'Read Scripts', 'Can view radio scripts', 'scripts', 'read', true, NOW(), NOW()),
('scripts.update', 'Update Scripts', 'Can edit radio scripts', 'scripts', 'update', true, NOW(), NOW()),
('scripts.delete', 'Delete Scripts', 'Can delete radio scripts', 'scripts', 'delete', true, NOW(), NOW()),
('scripts.schedule', 'Schedule Scripts', 'Can schedule radio scripts', 'scripts', 'schedule', true, NOW(), NOW()),
('scripts.broadcast', 'Broadcast Scripts', 'Can broadcast radio scripts', 'scripts', 'broadcast', true, NOW(), NOW()),

-- Dashboard & Analytics Permissions
('dashboard.access', 'Access Dashboard', 'Can access admin dashboard', 'dashboard', 'access', true, NOW(), NOW()),
('analytics.view', 'View Analytics', 'Can view analytics data', 'analytics', 'view', true, NOW(), NOW()),
('reports.generate', 'Generate Reports', 'Can generate reports', 'reports', 'generate', true, NOW(), NOW()),
('reports.export', 'Export Reports', 'Can export reports', 'reports', 'export', true, NOW(), NOW()),

-- System Management Permissions
('system.settings', 'System Settings', 'Can manage system settings', 'system', 'settings', true, NOW(), NOW()),
('system.backup', 'System Backup', 'Can create system backups', 'system', 'backup', true, NOW(), NOW()),
('system.restore', 'System Restore', 'Can restore system from backup', 'system', 'restore', true, NOW(), NOW()),
('system.logs', 'View System Logs', 'Can view system logs', 'system', 'logs', true, NOW(), NOW()),
('rbac.manage', 'Manage RBAC', 'Can manage roles and permissions', 'rbac', 'manage', true, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    resource = EXCLUDED.resource,
    action = EXCLUDED.action,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Insert Roles (using ON CONFLICT to avoid duplicates)
INSERT INTO roles (name, display_name, description, is_active, created_at, updated_at) VALUES
('super-admin', 'Super Administrator', 'Full system access - can manage everything including system settings', true, NOW(), NOW()),
('admin', 'Administrator', 'Can manage users, content, and most system features except critical system settings', true, NOW(), NOW()),
('editor', 'Content Editor', 'Can create, edit and manage all content including posts, categories, tags', true, NOW(), NOW()),
('writer', 'Content Writer', 'Can create and edit own content, limited publishing permissions', true, NOW(), NOW()),
('manager', 'Manager', 'Can manage radio scripts, upload media, create show content', true, NOW(), NOW()),
('moderator', 'Content Moderator', 'Can moderate comments, review content, manage user interactions', true, NOW(), NOW()),
('user', 'Regular User', 'Basic user permissions - can view content and interact', true, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Clear existing role-permission assignments
DELETE FROM role_permissions WHERE role_id IN (
    SELECT id FROM roles WHERE name IN ('super-admin', 'admin', 'editor', 'writer', 'manager', 'moderator', 'user')
);

-- Assign Permissions to Roles
-- Super Admin - All permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'super-admin'),
    id
FROM permissions;

-- Admin - Most permissions except critical system ones
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'admin'),
    id
FROM permissions
WHERE name NOT IN ('system.settings', 'system.backup', 'system.restore', 'rbac.manage');

-- Editor - Content management permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'editor'),
    id
FROM permissions
WHERE name IN (
    'posts.create', 'posts.read', 'posts.update', 'posts.publish', 'posts.unpublish', 'posts.feature',
    'categories.create', 'categories.read', 'categories.update', 'categories.delete',
    'tags.create', 'tags.read', 'tags.update', 'tags.delete',
    'comments.moderate', 'comments.approve', 'comments.reject',
    'media.upload', 'media.read', 'media.update', 'media.organize',
    'scripts.create', 'scripts.read', 'scripts.update',
    'dashboard.access'
);

-- Writer - Limited content creation permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'writer'),
    id
FROM permissions
WHERE name IN (
    'posts.create', 'posts.read', 'posts.update',
    'categories.read',
    'tags.read', 'tags.create',
    'media.upload', 'media.read',
    'scripts.create', 'scripts.read', 'scripts.update'
);

-- Manager - Radio script and media management
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'manager'),
    id
FROM permissions
WHERE name IN (
    'scripts.create', 'scripts.read', 'scripts.update', 'scripts.delete', 'scripts.schedule', 'scripts.broadcast',
    'media.upload', 'media.read', 'media.update', 'media.delete', 'media.organize',
    'posts.create', 'posts.read', 'posts.update',
    'categories.read',
    'tags.read',
    'dashboard.access',
    'analytics.view'
);

-- Moderator - Comment and content moderation
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'moderator'),
    id
FROM permissions
WHERE name IN (
    'comments.create', 'comments.read', 'comments.update', 'comments.delete', 'comments.moderate', 'comments.approve', 'comments.reject',
    'posts.read', 'posts.moderate',
    'users.read',
    'media.read'
);

-- User - Basic read permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'user'),
    id
FROM permissions
WHERE name IN (
    'posts.read',
    'categories.read',
    'tags.read',
    'comments.create', 'comments.read',
    'media.read'
);

-- Display summary
SELECT 'RBAC Setup Complete!' as message;

-- Show created roles
SELECT 'Created Roles:' as info;
SELECT name, display_name, description FROM roles ORDER BY name;

-- Show permission count per role
SELECT 'Permission Count per Role:' as info;
SELECT 
    r.name as role_name,
    r.display_name,
    COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name, r.display_name
ORDER BY permission_count DESC;
