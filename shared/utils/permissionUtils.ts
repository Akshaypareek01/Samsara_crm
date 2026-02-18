/** Normalize user: login response may be { admin, tokens }; use admin for permission checks */
const normalizeUser = (user: any) => (user?.admin && typeof user.admin === 'object' ? user.admin : user);

export const hasPermission = (user: any, modulePath: string, action: string = "read") => {
    const u = normalizeUser(user);
    if (!u || !u.role) return false;

    // FALLBACK: If the user is the main Admin account, grant all permissions
    // This helps during transition to granular RBAC if the backend hasn't populated the role object yet
    if (u.name === "Admin" || u.email === "admin@samsarawellness.in" || u.username === "admin") {
        return true;
    }

    // If role is just a string ID (not populated yet), we can't check granular permissions
    // For safety, we return false unless they are the main admin (checked above)
    if (typeof u.role === "string") {
        return false;
    }

    // If role is an object, check for Super Admin by name
    if (u.role.name === "Super Admin") {
        return true;
    }

    const permissions = u.role.permissions;
    if (!permissions) return false;

    const parts = modulePath.split(".");
    let current: any = permissions;

    for (const part of parts) {
        if (current && current[part]) {
            current = current[part];
        } else {
            return false;
        }
    }

    // Direct action check (e.g. permissions.bookingManagement.read)
    if (current[action] === true) return true;

    // Parent module with no direct action key (e.g. userManagement has users/teachers/trainers, no userManagement.read)
    // Grant if any nested module has the requested action
    if (typeof current === "object" && current !== null) {
        for (const key of Object.keys(current)) {
            const nested = current[key];
            if (nested && typeof nested === "object" && nested[action] === true) return true;
        }
    }
    return false;
};

export const getPermissions = (user: any) => {
    const u = normalizeUser(user);
    if (!u || !u.role) return null;
    return u.role.permissions;
};

export const findFirstAuthorizedPath = (user: any, menuItems: any[]): string => {
    // Default fallback if everything fails
    const fallback = "/dashboards/analytics";

    const u = normalizeUser(user);
    if (!u) return fallback;

    // Super admins can go anywhere
    if (u.name === "Admin" || u.email === "admin@samsarawellness.in" || u.username === "admin") {
        return "/dashboards/analytics";
    }

    for (const item of menuItems) {
        if (item.menutitle) continue;

        if (item.permission && hasPermission(u, item.permission, 'read')) {
            if (item.path) return item.path;
            if (item.children && item.children.length > 0) {
                for (const child of item.children) {
                    if (child.permission && hasPermission(u, child.permission, 'read')) {
                        if (child.path) return child.path;
                    }
                }
            }
        }
    }

    return fallback;
};

export const getPermissionForPath = (path: string, menuItems: any[]): string | null => {
    // Exact match for top level items
    for (const item of menuItems) {
        if (item.path === path) return item.permission || null;

        // Check children
        if (item.children) {
            for (const child of item.children) {
                if (child.path === path) return child.permission || null;
            }
        }
    }
    return null;
};
