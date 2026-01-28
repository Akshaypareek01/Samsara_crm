export const hasPermission = (user: any, modulePath: string, action: string = "read") => {
    if (!user || !user.role) return false;

    // FALLBACK: If the user is the main Admin account, grant all permissions
    // This helps during transition to granular RBAC if the backend hasn't populated the role object yet
    if (user.name === "Admin" || user.email === "admin@samsarawellness.in" || user.username === "admin") {
        return true;
    }

    // If role is just a string ID (not populated yet), we can't check granular permissions
    // For safety, we return false unless they are the main admin (checked above)
    if (typeof user.role === "string") {
        return false;
    }

    // If role is an object, check for Super Admin by name
    if (user.role.name === "Super Admin") {
        return true;
    }

    const permissions = user.role.permissions;
    if (!permissions) return false;

    const parts = modulePath.split(".");
    let current = permissions;

    for (const part of parts) {
        if (current && current[part]) {
            current = current[part];
        } else {
            return false;
        }
    }

    return current[action] === true;
};

export const getPermissions = (user: any) => {
    if (!user || !user.role) return null;
    return user.role.permissions;
};

export const findFirstAuthorizedPath = (user: any, menuItems: any[]): string => {
    // Default fallback if everything fails
    const fallback = "/dashboards/analytics";

    if (!user) return fallback;

    // Super admins can go anywhere
    if (user.name === "Admin" || user.email === "admin@samsarawellness.in" || user.username === "admin") {
        return "/dashboards/analytics";
    }

    for (const item of menuItems) {
        if (item.menutitle) continue;

        if (item.permission && hasPermission(user, item.permission, 'read')) {
            if (item.path) return item.path;
            if (item.children && item.children.length > 0) {
                for (const child of item.children) {
                    if (child.permission && hasPermission(user, child.permission, 'read')) {
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
