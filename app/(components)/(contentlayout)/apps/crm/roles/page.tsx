"use client";

import React, { Fragment, useEffect, useState } from 'react';
import Seo from '@/shared/layout-components/seo/seo';
import roleService, { Role } from '@/services/roleService';
import { hasPermission } from '@/shared/utils/permissionUtils';

const Roles = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [user, setUser] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: '',
        permissions: roleService.getDefaultPermissions()
    });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const data = await roleService.getAllRoles();
            setRoles(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch roles');
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionChange = (module: string, subModule: string | null, action: string, checked: boolean) => {
        setFormData(prev => {
            const newPermissions = JSON.parse(JSON.stringify(prev.permissions));
            if (subModule) {
                newPermissions[module][subModule][action] = checked;
            } else {
                newPermissions[module][action] = checked;
            }
            return { ...prev, permissions: newPermissions };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRole) {
                await roleService.updateRole(editingRole.id || editingRole._id!, formData);
            } else {
                await roleService.createRole(formData);
            }
            setShowModal(false);
            setEditingRole(null);
            setFormData({ name: '', permissions: roleService.getDefaultPermissions() });
            fetchRoles();
        } catch (err: any) {
            setError(err.message || 'Failed to save role');
        }
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        // Merge with default permissions to ensure all keys exist
        const mergedPermissions = {
            ...roleService.getDefaultPermissions(),
            ...(role.permissions || {})
        };
        setFormData({
            name: role.name,
            permissions: mergedPermissions as any
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this role?')) return;
        try {
            await roleService.deleteRole(id);
            fetchRoles();
        } catch (err: any) {
            setError(err.message || 'Failed to delete role');
        }
    };

    const modules = [
        { key: 'dashboard', label: 'Dashboard', actions: ['read'] },
        {
            key: 'userManagement', label: 'User Management', subModules: [
                { key: 'users', label: 'Users' },
                { key: 'teachers', label: 'Teachers' },
                { key: 'trainers', label: 'Trainers' }
            ], actions: ['create', 'read', 'update', 'delete']
        },
        { key: 'companyManagement', label: 'Company Management', actions: ['create', 'read', 'update', 'delete'] },
        { key: 'bookingManagement', label: 'Booking Management', actions: ['create', 'read', 'update', 'delete'] },
        { key: 'membershipManagement', label: 'Membership Management', actions: ['create', 'read', 'update', 'delete'] },
        { key: 'classManagement', label: 'Class Management', actions: ['create', 'read', 'update', 'delete'] },
        { key: 'eventManagement', label: 'Event Management', actions: ['create', 'read', 'update', 'delete'] },
        { key: 'support', label: 'Support', actions: ['create', 'read', 'update', 'delete'] },
        { key: 'roleManagement', label: 'Role Management', actions: ['create', 'read', 'update', 'delete'] },
        { key: 'teamManagement', label: 'Team Management', actions: ['create', 'read', 'update', 'delete'] },
    ];

    return (
        <Fragment>
            <Seo title="Role Management" />

            <div className="md:flex block items-center justify-between my-[1.5rem] page-header-breadcrumb">
                <div>
                    <h1 className="font-semibold text-[1.125rem] text-defaulttextcolor dark:text-defaulttextcolor/70 !mb-0">
                        Role Management
                    </h1>
                    <p className="font-normal text-[#8c9097] dark:text-white/50 text-[0.813rem]">
                        Define granular permissions for CRM roles
                    </p>
                </div>
                <div className="btn-list md:mt-0 mt-2">
                    {hasPermission(user, 'roleManagement', 'create') && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingRole(null);
                                setFormData({ name: '', permissions: roleService.getDefaultPermissions() });
                                setShowModal(true);
                            }}
                            className="ti-btn bg-primary text-white btn-wave !font-medium !me-[0.45rem] !ms-0 !text-[0.85rem] !rounded-[0.35rem] !py-[0.51rem] !px-[0.86rem] shadow-none"
                        >
                            <i className="ri-add-line inline-block me-1"></i>Create New Role
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="alert alert-danger mb-4" role="alert">
                    {error}
                </div>
            )}

            <div className="box">
                <div className="box-body">
                    {loading ? (
                        <div className="text-center py-4">Loading roles...</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover whitespace-nowrap min-w-full">
                                <thead>
                                    <tr>
                                        <th>Role Name</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(roles) && roles.map((role) => (
                                        <tr key={role.id || role._id}>
                                            <td className="font-semibold">{role.name}</td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    {hasPermission(user, 'roleManagement', 'update') && (
                                                        <button
                                                            onClick={() => handleEdit(role)}
                                                            className="ti-btn ti-btn-sm ti-btn-primary"
                                                            title="Edit Permissions"
                                                        >
                                                            <i className="ri-edit-line"></i>
                                                        </button>
                                                    )}
                                                    {hasPermission(user, 'roleManagement', 'delete') && role.name !== 'Super Admin' && (
                                                        <button
                                                            onClick={() => handleDelete(role.id || role._id!)}
                                                            className="ti-btn ti-btn-sm ti-btn-danger"
                                                            title="Delete Role"
                                                        >
                                                            <i className="ri-delete-bin-line"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">{editingRole ? 'Edit Role' : 'Create New Role'}</h3>
                            <button onClick={() => setShowModal(false)} className="ti-btn ti-btn-sm ti-btn-ghost">
                                <i className="ri-close-line"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label">Role Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g. Support Manager"
                                />
                            </div>

                            <div className="permissions-grid">
                                <h4 className="font-semibold mb-3 border-b pb-2">Permissions</h4>
                                {modules.map(mod => (
                                    <div key={mod.key} className="mb-6 p-3 bg-gray-50 dark:bg-black/10 rounded">
                                        <h5 className="font-medium mb-2 text-primary">{mod.label}</h5>

                                        {mod.subModules ? (
                                            <div className="space-y-4">
                                                {mod.subModules.map(sub => (
                                                    <div key={sub.key} className="ml-4">
                                                        <p className="text-sm font-medium mb-1">{sub.label}</p>
                                                        <div className="flex flex-wrap gap-4">
                                                            {mod.actions.map(action => (
                                                                <label key={action} className="flex items-center text-xs cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-checkbox me-1"
                                                                        checked={(formData.permissions as any)?.[mod.key]?.[sub.key]?.[action] || false}
                                                                        onChange={(e) => handlePermissionChange(mod.key, sub.key, action, e.target.checked)}
                                                                    />
                                                                    {action.toUpperCase()}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-4 ml-4">
                                                {mod.actions.map(action => (
                                                    <label key={action} className="flex items-center text-xs cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="form-checkbox me-1"
                                                            checked={(formData.permissions as any)?.[mod.key]?.[action] || false}
                                                            onChange={(e) => handlePermissionChange(mod.key, null, action, e.target.checked)}
                                                        />
                                                        {action.toUpperCase()}
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2 justify-end mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="ti-btn ti-btn-secondary">Cancel</button>
                                <button type="submit" className="ti-btn ti-btn-primary">
                                    {editingRole ? 'Update Role' : 'Create Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Fragment>
    );
};

export default Roles;
