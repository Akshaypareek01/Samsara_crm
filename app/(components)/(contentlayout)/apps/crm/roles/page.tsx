"use client";

import React, { Fragment, useEffect, useState } from 'react';
import Seo from '@/shared/layout-components/seo/seo';
import roleService, { Role } from '@/services/roleService';
import { hasPermission } from '@/shared/utils/permissionUtils';
import {
  CrmPageHeader,
  CrmCard,
  CrmTableWrapper,
  crmTableClass,
  crmTheadTrClass,
  crmThClass,
  crmTbodyTrClass,
  crmTdClass,
  crmThActionsClass,
  crmTdActionsClass,
  CrmBtnPrimary,
  CrmBtnEdit,
  CrmBtnDelete,
  CrmActionGroup,
  CrmModal,
  CrmLoading,
  crmInputClass,
  crmLabelClass,
} from '../components';

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
            <div className="p-[10px]">
                <CrmPageHeader
                    title="Role Management"
                    subtitle="Define granular permissions for CRM roles"
                    actions={
                        hasPermission(user, 'roleManagement', 'create') ? (
                            <CrmBtnPrimary
                                onClick={() => {
                                    setEditingRole(null);
                                    setFormData({ name: '', permissions: roleService.getDefaultPermissions() });
                                    setShowModal(true);
                                }}
                            >
                                <i className="ri-add-line text-xs" /> Create New Role
                            </CrmBtnPrimary>
                        ) : null
                    }
                />

                {error && (
                    <div className="mb-4 p-3 rounded bg-red-50 border border-red-100 text-red-600 text-[11px] font-medium" role="alert">
                        {error}
                    </div>
                )}

                <CrmCard>
                    <div className="p-[10px]">
                        {loading ? (
                            <CrmLoading label="Loading roles..." />
                        ) : (
                            <CrmTableWrapper>
                                <table className={crmTableClass}>
                                    <thead>
                                        <tr className={crmTheadTrClass}>
                                            <th className={crmThClass}>Role Name</th>
                                            <th className={crmThActionsClass}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(roles) && roles.map((role) => (
                                            <tr key={role.id || role._id} className={crmTbodyTrClass}>
                                                <td className={`${crmTdClass} font-semibold text-gray-900`}>{role.name}</td>
                                                <td className={crmTdActionsClass}>
                                                    <CrmActionGroup>
                                                        {hasPermission(user, 'roleManagement', 'update') && (
                                                            <CrmBtnEdit onClick={() => handleEdit(role)} title="Edit Permissions" />
                                                        )}
                                                        {hasPermission(user, 'roleManagement', 'delete') && role.name !== 'Super Admin' && (
                                                            <CrmBtnDelete onClick={() => handleDelete(role.id || role._id!)} title="Delete Role" />
                                                        )}
                                                    </CrmActionGroup>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CrmTableWrapper>
                        )}
                    </div>
                </CrmCard>

                <CrmModal
                    open={showModal}
                    onClose={() => { setShowModal(false); setEditingRole(null); }}
                    title={editingRole ? 'Edit Role' : 'Create New Role'}
                    maxWidth="max-w-4xl"
                    footer={
                        <>
                            <button type="button" onClick={() => setShowModal(false)} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded bg-white border border-gray-200 text-[#495057] hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" form="role-form" className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded bg-purple-600 text-white hover:bg-purple-700 shadow-sm">
                                {editingRole ? 'Update Role' : 'Create Role'}
                            </button>
                        </>
                    }
                >
                    <form id="role-form" onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className={crmLabelClass}>Role Name</label>
                            <input
                                type="text"
                                className={crmInputClass}
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

                    </form>
                </CrmModal>
            </div>
        </Fragment>
    );
};

export default Roles;
