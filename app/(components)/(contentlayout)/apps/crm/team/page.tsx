"use client";

import React, { Fragment, useEffect, useState } from 'react';
import Seo from '@/shared/layout-components/seo/seo';
import teamService, { TeamMember } from '@/services/teamService';
import roleService, { Role } from '@/services/roleService';
import { hasPermission } from '@/shared/utils/permissionUtils';

const Team = () => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [user, setUser] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roleId: ''
    });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [membersData, rolesData] = await Promise.all([
                teamService.getTeamMembers(),
                roleService.getAllRoles()
            ]);
            setMembers(membersData);
            setRoles(rolesData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingMember) {
                // For editing, we might only update role or name
                const updateData: any = {
                    name: formData.name,
                    roleId: formData.roleId
                };
                if (formData.password) updateData.password = formData.password;

                await teamService.updateTeamMember(editingMember.id || editingMember._id!, updateData);
            } else {
                await teamService.createTeamMember(formData);
            }
            setShowModal(false);
            setEditingMember(null);
            setFormData({ name: '', email: '', password: '', roleId: '' });
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to save team member');
        }
    };

    const handleEdit = (member: TeamMember) => {
        setEditingMember(member);
        setFormData({
            name: member.name,
            email: member.email,
            password: '', // Don't show password
            roleId: (member.role as any)._id || (member.role as any).id || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this team member?')) return;
        try {
            await teamService.deleteTeamMember(id);
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to delete team member');
        }
    };

    return (
        <Fragment>
            <Seo title="Team Management" />

            <div className="md:flex block items-center justify-between my-[1.5rem] page-header-breadcrumb">
                <div>
                    <h1 className="font-semibold text-[1.125rem] text-defaulttextcolor dark:text-defaulttextcolor/70 !mb-0">
                        CRM Team Members
                    </h1>
                    <p className="font-normal text-[#8c9097] dark:text-white/50 text-[0.813rem]">
                        Manage internal CRM team and their roles
                    </p>
                </div>
                <div className="btn-list md:mt-0 mt-2">
                    {hasPermission(user, 'teamManagement', 'create') && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingMember(null);
                                setFormData({ name: '', email: '', password: '', roleId: '' });
                                setShowModal(true);
                            }}
                            className="ti-btn bg-primary text-white btn-wave !font-medium !me-[0.45rem] !ms-0 !text-[0.85rem] !rounded-[0.35rem] !py-[0.51rem] !px-[0.86rem] shadow-none"
                        >
                            <i className="ri-add-line inline-block me-1"></i>Add Team Member
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
                        <div className="text-center py-4">Loading team...</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover whitespace-nowrap min-w-full">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Joined Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(members) && members.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4">No team members found</td>
                                        </tr>
                                    ) : (
                                        Array.isArray(members) && members.map((member) => (
                                            <tr key={member.id || member._id}>
                                                <td>
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center me-2">
                                                            <span className="text-primary text-xs font-semibold">
                                                                {member.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <span className="font-semibold">{member.name}</span>
                                                    </div>
                                                </td>
                                                <td>{member.email}</td>
                                                <td>
                                                    <span className="badge bg-primary/10 text-primary">
                                                        {member.role?.name || 'No Role'}
                                                    </span>
                                                </td>
                                                <td>{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '-'}</td>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        {hasPermission(user, 'teamManagement', 'update') && (
                                                            <button
                                                                onClick={() => handleEdit(member)}
                                                                className="ti-btn ti-btn-sm ti-btn-primary"
                                                            >
                                                                <i className="ri-edit-line"></i>
                                                            </button>
                                                        )}
                                                        {hasPermission(user, 'teamManagement', 'delete') && member.role?.name !== 'Super Admin' && (
                                                            <button
                                                                onClick={() => handleDelete(member.id || member._id!)}
                                                                className="ti-btn ti-btn-sm ti-btn-danger"
                                                            >
                                                                <i className="ri-delete-bin-line"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">{editingMember ? 'Edit Team Member' : 'Add Team Member'}</h3>
                            <button onClick={() => setShowModal(false)} className="ti-btn ti-btn-sm ti-btn-ghost">
                                <i className="ri-close-line"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        disabled={!!editingMember}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">{editingMember ? 'New Password (optional)' : 'Password'}</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required={!editingMember}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Assign Role</label>
                                    <select
                                        className="form-control"
                                        value={formData.roleId}
                                        onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select a Role</option>
                                        {Array.isArray(roles) && roles.map(role => (
                                            <option key={role.id || role._id} value={role.id || role._id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="ti-btn ti-btn-secondary">Cancel</button>
                                <button type="submit" className="ti-btn ti-btn-primary">
                                    {editingMember ? 'Update Member' : 'Add Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Fragment>
    );
};

export default Team;
