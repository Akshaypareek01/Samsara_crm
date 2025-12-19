"use client"
import Pageheader from '@/shared/layout-components/page-header/pageheader'
import Seo from '@/shared/layout-components/seo/seo'
import React, { Fragment, useState, useEffect } from 'react'
import membershipPlanService, { MembershipPlan } from '@/services/membershipPlanService'

const MembershipPlansPage = () => {
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalPlans, setTotalPlans] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
    const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [newPlan, setNewPlan] = useState<any>({
        name: '',
        description: '',
        basePrice: 0,
        currency: 'INR',
        validityDays: 30,
        features: [],
        isActive: true,
        planType: 'basic',
        maxUsers: 1,
    });
    const [featureInput, setFeatureInput] = useState<string>('');
    const limit = 10;

    useEffect(() => {
        fetchPlans();
    }, [currentPage, filterStatus, filterType]);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const params: any = { page: currentPage, limit: limit };
            
            if (filterStatus !== 'all') {
                params.isActive = filterStatus === 'active';
            }
            if (filterType !== 'all') {
                params.planType = filterType;
            }
            
            const response = await membershipPlanService.getMembershipPlans(params);
            setPlans(response.data);
            setTotalPlans(response.total);
        } catch (error) {
            console.error('❌ Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (planId: string) => {
        try {
            await membershipPlanService.toggleMembershipPlanStatus(planId);
            fetchPlans();
        } catch (error) {
            console.error('❌ Error toggling plan status:', error);
            alert('Failed to toggle plan status');
        }
    };

    const handleDelete = async (planId: string) => {
        if (confirm('Are you sure you want to delete this plan?')) {
            try {
                await membershipPlanService.deleteMembershipPlan(planId);
                fetchPlans();
            } catch (error) {
                console.error('❌ Error deleting plan:', error);
                alert('Failed to delete plan');
            }
        }
    };

    const handleCreatePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await membershipPlanService.createMembershipPlan(newPlan);
            setShowCreateModal(false);
            resetForm();
            fetchPlans();
            alert('Plan created successfully!');
        } catch (error: any) {
            console.error('❌ Error creating plan:', error);
            alert('Failed to create plan: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleUpdatePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPlan?._id) return;
        
        try {
            await membershipPlanService.updateMembershipPlan(editingPlan._id, newPlan);
            setShowCreateModal(false);
            setEditingPlan(null);
            resetForm();
            fetchPlans();
            alert('Plan updated successfully!');
        } catch (error: any) {
            console.error('❌ Error updating plan:', error);
            alert('Failed to update plan: ' + (error.response?.data?.message || error.message));
        }
    };

    const openEditModal = (plan: MembershipPlan) => {
        setEditingPlan(plan);
        setNewPlan({
            name: plan.name,
            description: plan.description,
            basePrice: plan.basePrice,
            currency: plan.currency,
            validityDays: plan.validityDays,
            features: plan.features,
            isActive: plan.isActive,
            planType: plan.planType,
            maxUsers: plan.maxUsers,
        });
        setShowCreateModal(true);
    };

    const resetForm = () => {
        setNewPlan({
            name: '',
            description: '',
            basePrice: 0,
            currency: 'INR',
            validityDays: 30,
            features: [],
            isActive: true,
            planType: 'basic',
            maxUsers: 1,
        });
        setFeatureInput('');
    };

    const addFeature = () => {
        if (featureInput.trim()) {
            setNewPlan({...newPlan, features: [...newPlan.features, featureInput.trim()]});
            setFeatureInput('');
        }
    };

    const removeFeature = (index: number) => {
        const updatedFeatures = newPlan.features.filter((_: any, i: number) => i !== index);
        setNewPlan({...newPlan, features: updatedFeatures});
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Fragment>
            <Seo title="Membership Plans" />
            <Pageheader currentpage="Membership Plans" activepage="Membership Management" mainpage="Membership Plans" />
            
            <div className="grid grid-cols-12 gap-x-6">
                <div className="xl:col-span-12 col-span-12">
                    <div className="box">
                        <div className="box-header">
                            <div className="box-title">Membership Plans Management</div>
                            <div className="flex flex-wrap gap-2 items-center">
                                <select className="ti-form-control form-control-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <select className="ti-form-control form-control-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                    <option value="all">All Types</option>
                                    <option value="basic">Basic</option>
                                    <option value="premium">Premium</option>
                                    <option value="enterprise">Enterprise</option>
                                    <option value="trial">Trial</option>
                                </select>
                                <button type="button" className="ti-btn ti-btn-primary !py-1 !px-2 !text-[0.75rem] !m-0 !font-medium"
                                    onClick={() => { setEditingPlan(null); resetForm(); setShowCreateModal(true); }}>
                                    <i className="ri-add-line me-1"></i>Create Plan
                                </button>
                            </div>
                        </div>

                        <div className="box-body">
                            {loading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : plans.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No plans found.</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover whitespace-nowrap table-bordered min-w-full">
                                        <thead>
                                            <tr>
                                                <th className="text-start">Plan Name</th>
                                                <th className="text-start">Type</th>
                                                <th className="text-start">Price</th>
                                                <th className="text-start">Validity</th>
                                                <th className="text-start">Features</th>
                                                <th className="text-start">Status</th>
                                                <th className="text-start">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {plans.map((plan) => (
                                                <tr key={plan._id} className="border-t border-inherit border-solid hover:bg-gray-100 dark:hover:bg-light dark:border-defaultborder/10">
                                                    <td>
                                                        <div>
                                                            <span className="font-semibold">{plan.name}</span>
                                                            <p className="text-[0.75rem] text-muted">{plan.description}</p>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${membershipPlanService.getPlanTypeBadgeClass(plan.planType)}`}>
                                                            {plan.planType}
                                                        </span>
                                                    </td>
                                                    <td className="font-semibold">
                                                        {membershipPlanService.formatCurrency(plan.basePrice, plan.currency)}
                                                    </td>
                                                    <td>{plan.validityDays} days</td>
                                                    <td>
                                                        <span className="text-[0.75rem]">{plan.features.length} features</span>
                                                    </td>
                                                    <td>
                                                        <button onClick={() => handleToggleStatus(plan._id!)}
                                                            className={`badge ${plan.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'} cursor-pointer border-0`}>
                                                            {plan.isActive ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => openEditModal(plan)} className="ti-btn ti-btn-sm ti-btn-warning" title="Edit">
                                                                <i className="ri-edit-line"></i>
                                                            </button>
                                                            <button onClick={() => setSelectedPlan(plan)} className="ti-btn ti-btn-sm ti-btn-info" title="View">
                                                                <i className="ri-eye-line"></i>
                                                            </button>
                                                            <button onClick={() => handleDelete(plan._id!)} className="ti-btn ti-btn-sm ti-btn-danger" title="Delete">
                                                                <i className="ri-delete-bin-line"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="box-footer">
                            <div className="sm:flex items-center">
                                <div className="dark:text-defaulttextcolor/70">Showing {plans.length} of {totalPlans} Entries</div>
                                <div className="ms-auto">
                                    <nav className="pagination-style-4">
                                        <ul className="ti-pagination mb-0">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
                                            </li>
                                            <li className="page-item"><span className="page-link active">{currentPage}</span></li>
                                            <li className={`page-item ${plans.length < limit ? 'disabled' : ''}`}>
                                                <button className="page-link !text-primary" onClick={() => setCurrentPage(currentPage + 1)} disabled={plans.length < limit}>Next</button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-bodybg rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h3>
                            <button onClick={() => { setShowCreateModal(false); setEditingPlan(null); }} className="ti-btn ti-btn-sm ti-btn-icon ti-btn-danger">
                                <i className="ri-close-line"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="form-label">Plan Name *</label>
                                    <input type="text" className="ti-form-control" required value={newPlan.name}
                                        onChange={(e) => setNewPlan({...newPlan, name: e.target.value})} />
                                </div>
                                <div className="col-span-2">
                                    <label className="form-label">Description *</label>
                                    <textarea className="ti-form-control" rows={2} required value={newPlan.description}
                                        onChange={(e) => setNewPlan({...newPlan, description: e.target.value})} />
                                </div>
                                <div>
                                    <label className="form-label">Base Price *</label>
                                    <input type="number" className="ti-form-control" required min="0" value={newPlan.basePrice}
                                        onChange={(e) => setNewPlan({...newPlan, basePrice: Number(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="form-label">Validity Days *</label>
                                    <input type="number" className="ti-form-control" required min="1" value={newPlan.validityDays}
                                        onChange={(e) => setNewPlan({...newPlan, validityDays: Number(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="form-label">Plan Type *</label>
                                    <select className="ti-form-control" required value={newPlan.planType}
                                        onChange={(e) => setNewPlan({...newPlan, planType: e.target.value})}>
                                        <option value="basic">Basic</option>
                                        <option value="premium">Premium</option>
                                        <option value="enterprise">Enterprise</option>
                                        <option value="trial">Trial</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Max Users *</label>
                                    <input type="number" className="ti-form-control" required min="1" value={newPlan.maxUsers}
                                        onChange={(e) => setNewPlan({...newPlan, maxUsers: Number(e.target.value)})} />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Features</label>
                                <div className="flex gap-2 mb-2">
                                    <input type="text" className="ti-form-control" placeholder="Add a feature" value={featureInput}
                                        onChange={(e) => setFeatureInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
                                    <button type="button" onClick={addFeature} className="ti-btn ti-btn-primary">Add</button>
                                </div>
                                <div className="space-y-1">
                                    {newPlan.features.map((feature: string, index: number) => (
                                        <div key={index} className="flex items-center gap-2 bg-gray-100 dark:bg-bodybg p-2 rounded">
                                            <span className="flex-grow">{feature}</span>
                                            <button type="button" onClick={() => removeFeature(index)} className="ti-btn ti-btn-sm ti-btn-danger">
                                                <i className="ri-close-line"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => { setShowCreateModal(false); setEditingPlan(null); }} className="ti-btn ti-btn-secondary">Cancel</button>
                                <button type="submit" className="ti-btn ti-btn-primary">{editingPlan ? 'Update Plan' : 'Create Plan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {selectedPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-bodybg rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Plan Details</h3>
                            <button onClick={() => setSelectedPlan(null)} className="ti-btn ti-btn-sm ti-btn-icon ti-btn-danger">
                                <i className="ri-close-line"></i>
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div><label className="font-semibold">Name:</label><p className="text-lg">{selectedPlan.name}</p></div>
                            <div><label className="font-semibold">Description:</label><p>{selectedPlan.description}</p></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="font-semibold">Price:</label><p>{membershipPlanService.formatCurrency(selectedPlan.basePrice, selectedPlan.currency)}</p></div>
                                <div><label className="font-semibold">Validity:</label><p>{selectedPlan.validityDays} days</p></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="font-semibold">Type:</label><p className="capitalize">{selectedPlan.planType}</p></div>
                                <div><label className="font-semibold">Max Users:</label><p>{selectedPlan.maxUsers}</p></div>
                            </div>
                            <div>
                                <label className="font-semibold">Features:</label>
                                <ul className="list-disc list-inside mt-2">
                                    {selectedPlan.features.map((feature, index) => (
                                        <li key={index}>{feature}</li>
                                    ))}
                                </ul>
                            </div>
                            <div><label className="font-semibold">Status:</label>
                                <p><span className={`badge ${selectedPlan.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                    {selectedPlan.isActive ? 'Active' : 'Inactive'}
                                </span></p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    )
}

export default MembershipPlansPage