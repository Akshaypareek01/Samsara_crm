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
        appleProductId: '',
        availableFrom: '',
        availableUntil: '',
        taxConfig: {
            gst: {
                rate: 0,
                type: 'percentage',
                amount: 0
            },
            otherTaxes: []
        },
        discountConfig: {
            maxDiscountPercentage: 0,
            maxDiscountAmount: 0
        },
        metadata: {
            specialValidityEndDate: '',
            description: ''
        }
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
            name: plan.name || '',
            description: plan.description || '',
            basePrice: plan.basePrice || 0,
            currency: plan.currency || 'INR',
            validityDays: plan.validityDays || 30,
            features: plan.features || [],
            isActive: plan.isActive ?? true,
            planType: plan.planType || 'basic',
            maxUsers: plan.maxUsers || 1,
            appleProductId: plan.appleProductId || '',
            availableFrom: plan.availableFrom ? new Date(plan.availableFrom).toISOString().split('T')[0] : '',
            availableUntil: plan.availableUntil ? new Date(plan.availableUntil).toISOString().split('T')[0] : '',
            taxConfig: plan.taxConfig || {
                gst: { rate: 0, type: 'percentage', amount: 0 },
                otherTaxes: []
            },
            discountConfig: plan.discountConfig || {
                maxDiscountPercentage: 0,
                maxDiscountAmount: 0
            },
            metadata: plan.metadata || {
                specialValidityEndDate: '',
                description: ''
            }
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
            appleProductId: '',
            availableFrom: '',
            availableUntil: '',
            taxConfig: {
                gst: { rate: 0, type: 'percentage', amount: 0 },
                otherTaxes: []
            },
            discountConfig: {
                maxDiscountPercentage: 0,
                maxDiscountAmount: 0
            },
            metadata: {
                specialValidityEndDate: '',
                description: ''
            }
        });
        setFeatureInput('');
    };

    const addFeature = () => {
        if (featureInput.trim()) {
            setNewPlan({ ...newPlan, features: [...newPlan.features, featureInput.trim()] });
            setFeatureInput('');
        }
    };

    const removeFeature = (index: number) => {
        const updatedFeatures = newPlan.features.filter((_: any, i: number) => i !== index);
        setNewPlan({ ...newPlan, features: updatedFeatures });
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
                                                <th className="text-start !text-[0.75rem]">Plan Information</th>
                                                <th className="text-start !text-[0.75rem]">Type</th>
                                                <th className="text-start !text-[0.75rem]">Price</th>
                                                <th className="text-start !text-[0.75rem]">Validity</th>
                                                <th className="text-start !text-[0.75rem]">Status</th>
                                                <th className="text-start !text-[0.75rem]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {plans.map((plan) => (
                                                <tr key={plan._id} className="border-t border-inherit border-solid hover:bg-gray-100 dark:hover:bg-light dark:border-defaultborder/10">
                                                    <td className="!whitespace-normal min-w-[300px]">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-[0.85rem] text-primary">{plan.name}</span>
                                                                {plan.appleProductId && (
                                                                    <span className="text-[0.65rem] bg-light text-muted px-1 rounded border border-defaultborder/50">
                                                                        ID: {plan.appleProductId}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[0.725rem] text-muted leading-relaxed">
                                                                {plan.description}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${membershipPlanService.getPlanTypeBadgeClass(plan.planType)} !text-[0.65rem] !py-[0.15rem]`}>
                                                            {plan.planType}
                                                        </span>
                                                    </td>
                                                    <td className="font-semibold text-[0.8rem]">
                                                        {membershipPlanService.formatCurrency(plan.basePrice, plan.currency)}
                                                    </td>
                                                    <td className="text-[0.75rem]">{plan.validityDays} days</td>
                                                    <td>
                                                        <button onClick={() => handleToggleStatus(plan._id!)}
                                                            className={`badge ${plan.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'} cursor-pointer border-0 !text-[0.65rem] !py-[0.15rem]`}>
                                                            {plan.isActive ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <div className="flex gap-1">
                                                            <button onClick={() => openEditModal(plan)} className="ti-btn !px-1 !py-1 !mb-0 ti-btn-sm ti-btn-warning text-[0.75rem]" title="Edit">
                                                                <i className="ri-edit-line"></i>
                                                            </button>
                                                            <button onClick={() => setSelectedPlan(plan)} className="ti-btn !px-1 !py-1 !mb-0 ti-btn-sm ti-btn-info text-[0.75rem]" title="View">
                                                                <i className="ri-eye-line"></i>
                                                            </button>
                                                            <button onClick={() => handleDelete(plan._id!)} className="ti-btn !px-1 !py-1 !mb-0 ti-btn-sm ti-btn-danger text-[0.75rem]" title="Delete">
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

            {/* Create/Edit Side Modal */}
            <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${showCreateModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/50" onClick={() => { setShowCreateModal(false); setEditingPlan(null); }}></div>
                <div className={`relative w-full max-w-md bg-white dark:bg-bodybg h-full shadow-xl transform transition-transform duration-300 ease-in-out ${showCreateModal ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
                    <div className="flex items-center justify-between p-4 border-b dark:border-defaultborder/10">
                        <h6 className="text-[0.85rem] font-semibold">{editingPlan ? 'Edit Membership Plan' : 'Create New Membership Plan'}</h6>
                        <button onClick={() => { setShowCreateModal(false); setEditingPlan(null); }} className="text-gray-400 hover:text-gray-600">
                            <i className="ri-close-line text-lg"></i>
                        </button>
                    </div>

                    <form onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan} className="p-4 space-y-4">
                        <div className="space-y-3">
                            <div>
                                <label className="form-label text-[0.75rem] font-medium">Plan Name *</label>
                                <input type="text" className="ti-form-control form-control-sm !text-[0.75rem]" required value={newPlan.name}
                                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} placeholder="Enter plan name" />
                            </div>
                            <div>
                                <label className="form-label text-[0.75rem] font-medium">Description *</label>
                                <textarea className="ti-form-control form-control-sm !text-[0.75rem]" rows={4} required value={newPlan.description}
                                    onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })} placeholder="Enter detailed plan description..." />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="form-label text-[0.75rem] font-medium">Apple Product ID</label>
                                    <input type="text" className="ti-form-control form-control-sm !text-[0.75rem]" value={newPlan.appleProductId}
                                        onChange={(e) => setNewPlan({ ...newPlan, appleProductId: e.target.value })} placeholder="com.samsara.plan" />
                                </div>
                                <div>
                                    <label className="form-label text-[0.75rem] font-medium">Plan Type *</label>
                                    <select className="ti-form-control form-control-sm !text-[0.75rem]" required value={newPlan.planType}
                                        onChange={(e) => setNewPlan({ ...newPlan, planType: e.target.value })}>
                                        <option value="basic">Basic</option>
                                        <option value="premium">Premium</option>
                                        <option value="enterprise">Enterprise</option>
                                        <option value="trial">Trial</option>
                                        <option value="limited-time">Limited Time</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="form-label text-[0.75rem] font-medium">Currency</label>
                                    <select className="ti-form-control form-control-sm !text-[0.75rem]" value={newPlan.currency}
                                        onChange={(e) => setNewPlan({ ...newPlan, currency: e.target.value })}>
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label text-[0.75rem] font-medium">Max Users *</label>
                                    <input type="number" className="ti-form-control form-control-sm !text-[0.75rem]" required min="1" value={newPlan.maxUsers}
                                        onChange={(e) => setNewPlan({ ...newPlan, maxUsers: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="form-label text-[0.75rem] font-medium">Base Price *</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-2 py-1 ltr:border-r-0 rtl:border-l-0 border border-defaultborder dark:border-defaultborder/10 bg-light text-muted text-[0.75rem]">INR</span>
                                        <input type="number" className="ti-form-control form-control-sm !text-[0.75rem] ltr:rounded-l-none rtl:rounded-r-none" required min="0" value={newPlan.basePrice}
                                            onChange={(e) => setNewPlan({ ...newPlan, basePrice: Number(e.target.value) })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label text-[0.75rem] font-medium">Validity Days *</label>
                                    <input type="number" className="ti-form-control form-control-sm !text-[0.75rem]" required min="1" value={newPlan.validityDays}
                                        onChange={(e) => setNewPlan({ ...newPlan, validityDays: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="form-label text-[0.75rem] font-medium">Available From</label>
                                    <input type="date" className="ti-form-control form-control-sm !text-[0.75rem]" value={newPlan.availableFrom}
                                        onChange={(e) => setNewPlan({ ...newPlan, availableFrom: e.target.value })} />
                                </div>
                                <div>
                                    <label className="form-label text-[0.75rem] font-medium">Available Until</label>
                                    <input type="date" className="ti-form-control form-control-sm !text-[0.75rem]" value={newPlan.availableUntil}
                                        onChange={(e) => setNewPlan({ ...newPlan, availableUntil: e.target.value })} />
                                </div>
                            </div>

                            <div className="border rounded p-3 bg-light/30 dark:bg-black/10">
                                <h6 className="text-[0.7rem] font-semibold mb-2 uppercase text-muted">Tax Configuration (GST)</h6>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="form-label text-[0.7rem]">Rate (%)</label>
                                        <input type="number" className="ti-form-control form-control-sm !text-[0.7rem]" value={newPlan.taxConfig.gst.rate}
                                            onChange={(e) => setNewPlan({ ...newPlan, taxConfig: { ...newPlan.taxConfig, gst: { ...newPlan.taxConfig.gst, rate: Number(e.target.value) } } })} />
                                    </div>
                                    <div>
                                        <label className="form-label text-[0.7rem]">Type</label>
                                        <select className="ti-form-control form-control-sm !text-[0.7rem]" value={newPlan.taxConfig.gst.type}
                                            onChange={(e) => setNewPlan({ ...newPlan, taxConfig: { ...newPlan.taxConfig, gst: { ...newPlan.taxConfig.gst, type: e.target.value } } })}>
                                            <option value="percentage">Percentage</option>
                                            <option value="fixed">Fixed</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="border rounded p-3 bg-light/30 dark:bg-black/10">
                                <h6 className="text-[0.7rem] font-semibold mb-2 uppercase text-muted">Discount Configuration</h6>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="form-label text-[0.7rem]">Max Discount %</label>
                                        <input type="number" className="ti-form-control form-control-sm !text-[0.7rem]" value={newPlan.discountConfig.maxDiscountPercentage}
                                            onChange={(e) => setNewPlan({ ...newPlan, discountConfig: { ...newPlan.discountConfig, maxDiscountPercentage: Number(e.target.value) } })} />
                                    </div>
                                    <div>
                                        <label className="form-label text-[0.7rem]">Max Discount Amt</label>
                                        <input type="number" className="ti-form-control form-control-sm !text-[0.7rem]" value={newPlan.discountConfig.maxDiscountAmount}
                                            onChange={(e) => setNewPlan({ ...newPlan, discountConfig: { ...newPlan.discountConfig, maxDiscountAmount: Number(e.target.value) } })} />
                                    </div>
                                </div>
                            </div>

                            <div className="border rounded p-3 bg-light/30 dark:bg-black/10">
                                <h6 className="text-[0.7rem] font-semibold mb-2 uppercase text-muted">Additional Metadata</h6>
                                <div className="space-y-3">
                                    <div>
                                        <label className="form-label text-[0.7rem]">Special Validity End Date</label>
                                        <input type="date" className="ti-form-control form-control-sm !text-[0.7rem]"
                                            value={newPlan.metadata.specialValidityEndDate ? newPlan.metadata.specialValidityEndDate.split('T')[0] : ''}
                                            onChange={(e) => setNewPlan({ ...newPlan, metadata: { ...newPlan.metadata, specialValidityEndDate: e.target.value } })} />
                                    </div>
                                    <div>
                                        <label className="form-label text-[0.7rem]">Metadata Description</label>
                                        <textarea className="ti-form-control form-control-sm !text-[0.7rem]" rows={4}
                                            value={newPlan.metadata.description}
                                            onChange={(e) => setNewPlan({ ...newPlan, metadata: { ...newPlan.metadata, description: e.target.value } })}
                                            placeholder="Internal description or special notes (e.g. valid until dates)" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="form-label text-[0.75rem] font-medium">Features</label>
                                <div className="flex gap-2 mb-2">
                                    <input type="text" className="ti-form-control form-control-sm !text-[0.75rem]" placeholder="Add a feature" value={featureInput}
                                        onChange={(e) => setFeatureInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
                                    <button type="button" onClick={addFeature} className="ti-btn ti-btn-primary !py-1 !px-2 !m-0 !text-[0.75rem]">Add</button>
                                </div>
                                <div className="flex flex-wrap gap-1 max-h-[100px] overflow-y-auto">
                                    {newPlan.features.map((feature: string, index: number) => (
                                        <span key={index} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-[0.65rem]">
                                            {feature}
                                            <button type="button" onClick={() => removeFeature(index)} className="text-primary hover:text-primary-full">
                                                <i className="ri-close-line"></i>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input type="checkbox" className="ti-form-checkbox" id="isActive" checked={newPlan.isActive}
                                    onChange={(e) => setNewPlan({ ...newPlan, isActive: e.target.checked })} />
                                <label htmlFor="isActive" className="text-[0.75rem] font-medium">Is Active</label>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t dark:border-defaultborder/10">
                            <button type="button" onClick={() => { setShowCreateModal(false); setEditingPlan(null); }} className="ti-btn ti-btn-light !py-1 !px-3 !text-[0.75rem] flex-1">Cancel</button>
                            <button type="submit" className="ti-btn ti-btn-primary !py-1 !px-3 !text-[0.75rem] flex-1">{editingPlan ? 'Update Plan' : 'Create Plan'}</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* View Details Side Modal */}
            <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${selectedPlan ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedPlan(null)}></div>
                <div className={`relative w-full max-w-md bg-white dark:bg-bodybg h-full shadow-xl transform transition-transform duration-300 ease-in-out ${selectedPlan ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
                    <div className="flex items-center justify-between p-4 border-b dark:border-defaultborder/10">
                        <h6 className="text-[0.85rem] font-semibold">Plan Details</h6>
                        <button onClick={() => setSelectedPlan(null)} className="text-gray-400 hover:text-gray-600">
                            <i className="ri-close-line text-lg"></i>
                        </button>
                    </div>
                    {selectedPlan && (
                        <div className="p-4 space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[0.7rem] text-muted uppercase font-semibold">Plan Name</label>
                                    <p className="text-[0.85rem] font-bold">{selectedPlan.name}</p>
                                </div>
                                <div>
                                    <label className="text-[0.7rem] text-muted uppercase font-semibold">Description</label>
                                    <p className="text-[0.75rem]">{selectedPlan.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[0.7rem] text-muted uppercase font-semibold">Apple ID</label>
                                        <p className="text-[0.75rem] font-medium">{selectedPlan.appleProductId || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[0.7rem] text-muted uppercase font-semibold">Type</label>
                                        <p className="text-[0.75rem] capitalize">{selectedPlan.planType}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[0.7rem] text-muted uppercase font-semibold">Price</label>
                                        <p className="text-[0.75rem] font-bold text-primary">{membershipPlanService.formatCurrency(selectedPlan.basePrice, selectedPlan.currency)}</p>
                                    </div>
                                    <div>
                                        <label className="text-[0.7rem] text-muted uppercase font-semibold">Validity</label>
                                        <p className="text-[0.75rem]">{selectedPlan.validityDays} days</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[0.7rem] text-muted uppercase font-semibold">Available From</label>
                                        <p className="text-[0.75rem]">{selectedPlan.availableFrom ? formatDate(selectedPlan.availableFrom) : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[0.7rem] text-muted uppercase font-semibold">Available Until</label>
                                        <p className="text-[0.75rem]">{selectedPlan.availableUntil ? formatDate(selectedPlan.availableUntil) : 'N/A'}</p>
                                    </div>
                                </div>

                                {selectedPlan.taxConfig && (
                                    <div className="p-3 bg-light dark:bg-black/10 rounded">
                                        <label className="text-[0.65rem] text-muted uppercase font-bold mb-1 block">Tax Info</label>
                                        <div className="flex justify-between text-[0.75rem]">
                                            <span>GST ({selectedPlan.taxConfig.gst.rate}%)</span>
                                            <span className="font-semibold">{selectedPlan.taxConfig.gst.type}</span>
                                        </div>
                                    </div>
                                )}

                                {selectedPlan.discountConfig && (
                                    <div className="p-3 bg-light dark:bg-black/10 rounded">
                                        <label className="text-[0.65rem] text-muted uppercase font-bold mb-1 block">Discount Info</label>
                                        <div className="flex justify-between text-[0.75rem]">
                                            <span>Max Discount</span>
                                            <span className="font-semibold">{selectedPlan.discountConfig.maxDiscountPercentage}% / {selectedPlan.discountConfig.maxDiscountAmount || 0}</span>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-[0.7rem] text-muted uppercase font-semibold block mb-2">Features</label>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedPlan.features.map((feature, index) => (
                                            <span key={index} className="bg-success/10 text-success px-2 py-1 rounded text-[0.65rem]">
                                                <i className="ri-check-line me-1"></i>{feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[0.7rem] text-muted uppercase font-semibold block mb-1">Status</label>
                                    <span className={`badge ${selectedPlan.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'} !text-[0.65rem]`}>
                                        {selectedPlan.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <div className="pt-4 border-t dark:border-defaultborder/10">
                                <button type="button" onClick={() => setSelectedPlan(null)} className="ti-btn ti-btn-light w-full !text-[0.75rem]">Close</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Fragment>
    )
}

export default MembershipPlansPage