"use client";

import React, { Fragment, useEffect, useState } from 'react';
import Seo from '@/shared/layout-components/seo/seo';
import teamService, { TeamMember } from '@/services/teamService';
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
  crmSelectClass,
  crmLabelClass,
} from '../components';

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
        const roleObj = member.role;
        const roleId =
            (member as any).roleId ??
            (typeof roleObj === 'object' && roleObj && ((roleObj as any)._id || (roleObj as any).id)) ??
            '';
        setFormData({
            name: member.name,
            email: member.email,
            password: '',
            roleId: roleId || ''
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

    /** Resolve role name: from populated role object, or by roleId/role ref using roles list */
    const getMemberRoleName = (member: TeamMember): string => {
        const roleObj = member.role;
        if (roleObj && typeof roleObj === 'object' && 'name' in roleObj && roleObj.name) {
            return roleObj.name;
        }
        const roleId = (member as any).roleId ?? (typeof roleObj === 'string' ? roleObj : (roleObj as any)?._id ?? (roleObj as any)?.id);
        if (roleId && Array.isArray(roles)) {
            const found = roles.find((r) => (r.id || r._id) === roleId);
            if (found) return found.name;
        }
        return 'No Role';
    };

    return (
        <Fragment>
            <Seo title="Team Management" />
            <div className="p-[10px]">
                <CrmPageHeader
                    title="CRM Team Members"
                    subtitle="Manage internal CRM team and their roles"
                    actions={
                        hasPermission(user, 'teamManagement', 'create') ? (
                            <CrmBtnPrimary
                                onClick={() => {
                                    setEditingMember(null);
                                    setFormData({ name: '', email: '', password: '', roleId: '' });
                                    setShowModal(true);
                                }}
                            >
                                <i className="ri-add-line text-xs" /> Add Team Member
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
                            <CrmLoading label="Loading team..." />
                        ) : (
                            <CrmTableWrapper>
                                <table className={crmTableClass}>
                                    <thead>
                                        <tr className={crmTheadTrClass}>
                                            <th className={crmThClass}>Name</th>
                                            <th className={crmThClass}>Email</th>
                                            <th className={crmThClass}>Role</th>
                                            <th className={crmThClass}>Joined Date</th>
                                            <th className={crmThActionsClass}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!Array.isArray(members) || members.length === 0 ? (
                                            <tr className={crmTbodyTrClass}>
                                                <td colSpan={5} className={`${crmTdClass} text-center text-[12px] font-medium text-gray-400 py-8`}>
                                                    No team members found
                                                </td>
                                            </tr>
                                        ) : (
                                            members.map((member) => (
                                                <tr key={member.id || member._id} className={crmTbodyTrClass}>
                                                    <td className={crmTdClass}>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                                                <span className="text-purple-600 text-xs font-semibold">
                                                                    {member.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <span className="font-semibold text-gray-900 text-[12px]">{member.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className={`${crmTdClass} text-gray-600`}>{member.email}</td>
                                                    <td className={crmTdClass}>
                                                        <span className="inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded bg-purple-50 text-purple-600 border border-purple-100">
                                                            {getMemberRoleName(member)}
                                                        </span>
                                                    </td>
                                                    <td className={`${crmTdClass} text-gray-600`}>
                                                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '—'}
                                                    </td>
                                                    <td className={crmTdActionsClass}>
                                                        <CrmActionGroup>
                                                            {hasPermission(user, 'teamManagement', 'update') && (
                                                                <CrmBtnEdit onClick={() => handleEdit(member)} title="Edit" />
                                                            )}
                                                            {hasPermission(user, 'teamManagement', 'delete') && getMemberRoleName(member) !== 'Super Admin' && (
                                                                <CrmBtnDelete onClick={() => handleDelete(member.id || member._id!)} title="Delete" />
                                                            )}
                                                        </CrmActionGroup>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </CrmTableWrapper>
                        )}
                    </div>
                </CrmCard>

                <CrmModal
                    open={showModal}
                    onClose={() => { setShowModal(false); setEditingMember(null); }}
                    title={editingMember ? 'Edit Team Member' : 'Add Team Member'}
                    footer={
                        <>
                            <button type="button" onClick={() => setShowModal(false)} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded bg-white border border-gray-200 text-[#495057] hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" form="team-member-form" className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded bg-purple-600 text-white hover:bg-purple-700 shadow-sm">
                                {editingMember ? 'Update Member' : 'Add Member'}
                            </button>
                        </>
                    }
                >
                    <form id="team-member-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className={crmLabelClass}>Full Name</label>
                            <input type="text" className={crmInputClass} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div>
                            <label className={crmLabelClass}>Email Address</label>
                            <input type="email" className={crmInputClass} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required disabled={!!editingMember} />
                        </div>
                        <div>
                            <label className={crmLabelClass}>{editingMember ? 'New Password (optional)' : 'Password'}</label>
                            <input type="password" className={crmInputClass} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editingMember} />
                        </div>
                        <div>
                            <label className={crmLabelClass}>Assign Role</label>
                            <select className={crmSelectClass} value={formData.roleId} onChange={(e) => setFormData({ ...formData, roleId: e.target.value })} required>
                                <option value="">Select a Role</option>
                                {Array.isArray(roles) && roles.map((role) => (
                                    <option key={role.id || role._id} value={role.id || role._id}>{role.name}</option>
                                ))}
                            </select>
                        </div>
                    </form>
                </CrmModal>
            </div>
        </Fragment>
    );
};

export default Team;
