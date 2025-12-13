"use client"
import Pageheader from '@/shared/layout-components/page-header/pageheader'
import Seo from '@/shared/layout-components/seo/seo'
import React, { Fragment, useState, useEffect } from 'react'
import couponService, { Coupon } from '@/services/couponService'

const CouponsPage = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalCoupons, setTotalCoupons] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [newCoupon, setNewCoupon] = useState<any>({
        code: '',
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        startDate: '',
        endDate: '',
        minOrderAmount: 0,
        usageLimit: undefined,
        isActive: true
    });
    const limit = 10;

    useEffect(() => {
        fetchCoupons();
    }, [currentPage, filterStatus, filterType]);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage,
                limit: limit,
            };
            
            if (filterStatus !== 'all') {
                params.isActive = filterStatus === 'active';
            }
            if (filterType !== 'all') {
                params.discountType = filterType;
            }
            
            const response = await couponService.getCoupons(params);
            setCoupons(response.data);
            setTotalCoupons(response.total);
        } catch (error) {
            console.error('❌ Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (couponId: string) => {
        try {
            await couponService.toggleCouponStatus(couponId);
            fetchCoupons();
        } catch (error) {
            console.error('❌ Error toggling coupon status:', error);
            alert('Failed to toggle coupon status');
        }
    };

    const handleDelete = async (couponId: string) => {
        if (confirm('Are you sure you want to delete this coupon?')) {
            try {
                await couponService.deleteCoupon(couponId);
                fetchCoupons();
            } catch (error) {
                console.error('❌ Error deleting coupon:', error);
                alert('Failed to delete coupon');
            }
        }
    };

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log('📝 Creating coupon with data:', newCoupon);
            await couponService.createCoupon(newCoupon);
            setShowCreateModal(false);
            setNewCoupon({
                code: '',
                name: '',
                description: '',
                discountType: 'percentage',
                discountValue: 0,
                startDate: '',
                endDate: '',
                minOrderAmount: 0,
                usageLimit: undefined,
                isActive: true
            });
            fetchCoupons();
            alert('Coupon created successfully!');
        } catch (error: any) {
            console.error('❌ Error creating coupon:', error);
            alert('Failed to create coupon: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleUpdateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCoupon?._id) return;
        
        try {
            console.log('✏️ Updating coupon:', editingCoupon);
            await couponService.updateCoupon(editingCoupon._id, newCoupon);
            setShowCreateModal(false);
            setEditingCoupon(null);
            setNewCoupon({
                code: '',
                name: '',
                description: '',
                discountType: 'percentage',
                discountValue: 0,
                startDate: '',
                endDate: '',
                minOrderAmount: 0,
                usageLimit: undefined,
                isActive: true
            });
            fetchCoupons();
            alert('Coupon updated successfully!');
        } catch (error: any) {
            console.error('❌ Error updating coupon:', error);
            alert('Failed to update coupon: ' + (error.response?.data?.message || error.message));
        }
    };

    const openEditModal = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setNewCoupon({
            code: coupon.code,
            name: coupon.name,
            description: coupon.description || '',
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            startDate: coupon.startDate.split('T')[0],
            endDate: coupon.endDate.split('T')[0],
            minOrderAmount: coupon.minOrderAmount || 0,
            usageLimit: coupon.usageLimit,
            isActive: coupon.isActive
        });
        setShowCreateModal(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDiscountDisplay = (coupon: Coupon) => {
        if (coupon.discountType === 'percentage') {
            return `${coupon.discountValue}%`;
        }
        return `₹${coupon.discountValue}`;
    };

    return (
        <Fragment>
            <Seo title="Coupons" />
            <Pageheader currentpage="Coupons" activepage="Membership Management" mainpage="Coupons" />
            
            <div className="grid grid-cols-12 gap-x-6">
                <div className="xl:col-span-12 col-span-12">
                    <div className="box">
                        <div className="box-header">
                            <div className="box-title">
                                Coupon Codes Management
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                                <select
                                    className="ti-form-control form-control-sm"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <select
                                    className="ti-form-control form-control-sm"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    <option value="percentage">Percentage</option>
                                    <option value="fixed">Fixed</option>
                                </select>
                                <button
                                    type="button"
                                    className="ti-btn ti-btn-primary !py-1 !px-2 !text-[0.75rem] !m-0 !font-medium"
                                    onClick={() => {
                                        setEditingCoupon(null);
                                        setNewCoupon({
                                            code: '',
                                            name: '',
                                            description: '',
                                            discountType: 'percentage',
                                            discountValue: 0,
                                            startDate: '',
                                            endDate: '',
                                            minOrderAmount: 0,
                                            usageLimit: undefined,
                                            isActive: true
                                        });
                                        setShowCreateModal(true);
                                    }}
                                >
                                    <i className="ri-add-line me-1"></i>Create Coupon
                                </button>
                            </div>
                        </div>

                        <div className="box-body">
                            {loading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : coupons.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No coupons found. Create your first coupon to get started.
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover whitespace-nowrap table-bordered min-w-full">
                                        <thead>
                                            <tr>
                                                <th scope="col" className="text-start">Code</th>
                                                <th scope="col" className="text-start">Name</th>
                                                <th scope="col" className="text-start">Discount</th>
                                                <th scope="col" className="text-start">Type</th>
                                                <th scope="col" className="text-start">Valid Period</th>
                                                <th scope="col" className="text-start">Usage</th>
                                                <th scope="col" className="text-start">Status</th>
                                                <th scope="col" className="text-start">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {coupons.map((coupon) => (
                                                <tr
                                                    key={coupon._id}
                                                    className="border-t border-inherit border-solid hover:bg-gray-100 dark:hover:bg-light dark:border-defaultborder/10"
                                                >
                                                    <td>
                                                        <span className="font-semibold text-primary">
                                                            {coupon.code}
                                                        </span>
                                                    </td>
                                                    <td>{coupon.name}</td>
                                                    <td>
                                                        <span className="font-semibold">
                                                            {getDiscountDisplay(coupon)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${
                                                            coupon.discountType === 'percentage' 
                                                                ? 'bg-info/10 text-info' 
                                                                : 'bg-success/10 text-success'
                                                        }`}>
                                                            {coupon.discountType}
                                                        </span>
                                                    </td>
                                                    <td className="text-[0.75rem]">
                                                        {formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}
                                                    </td>
                                                    <td>
                                                        <span className="text-[0.75rem]">
                                                            {coupon.usedCount || 0}
                                                            {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleToggleStatus(coupon._id!)}
                                                            className={`badge ${
                                                                coupon.isActive
                                                                    ? 'bg-success/10 text-success hover:bg-success/20'
                                                                    : 'bg-danger/10 text-danger hover:bg-danger/20'
                                                            } cursor-pointer border-0`}
                                                        >
                                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => openEditModal(coupon)}
                                                                className="ti-btn ti-btn-sm ti-btn-warning"
                                                                title="Edit"
                                                            >
                                                                <i className="ri-edit-line"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedCoupon(coupon)}
                                                                className="ti-btn ti-btn-sm ti-btn-info"
                                                                title="View Details"
                                                            >
                                                                <i className="ri-eye-line"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(coupon._id!)}
                                                                className="ti-btn ti-btn-sm ti-btn-danger"
                                                                title="Delete"
                                                            >
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
                                <div className="dark:text-defaulttextcolor/70">
                                    Showing {coupons.length} of {totalCoupons} Entries
                                </div>
                                <div className="ms-auto">
                                    <nav aria-label="Page navigation" className="pagination-style-4">
                                        <ul className="ti-pagination mb-0">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => setCurrentPage(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    Prev
                                                </button>
                                            </li>
                                            <li className="page-item">
                                                <span className="page-link active">{currentPage}</span>
                                            </li>
                                            <li className={`page-item ${coupons.length < limit ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link !text-primary"
                                                    onClick={() => setCurrentPage(currentPage + 1)}
                                                    disabled={coupons.length < limit}
                                                >
                                                    Next
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            {selectedCoupon && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-bodybg rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Coupon Details</h3>
                            <button
                                onClick={() => setSelectedCoupon(null)}
                                className="ti-btn ti-btn-sm ti-btn-icon ti-btn-danger"
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="font-semibold">Code:</label>
                                <p className="text-lg text-primary">{selectedCoupon.code}</p>
                            </div>
                            <div>
                                <label className="font-semibold">Name:</label>
                                <p>{selectedCoupon.name}</p>
                            </div>
                            {selectedCoupon.description && (
                                <div>
                                    <label className="font-semibold">Description:</label>
                                    <p>{selectedCoupon.description}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-semibold">Discount:</label>
                                    <p>{getDiscountDisplay(selectedCoupon)}</p>
                                </div>
                                <div>
                                    <label className="font-semibold">Type:</label>
                                    <p className="capitalize">{selectedCoupon.discountType}</p>
                                </div>
                            </div>
                            {selectedCoupon.minOrderAmount && selectedCoupon.minOrderAmount > 0 && (
                                <div>
                                    <label className="font-semibold">Minimum Order:</label>
                                    <p>₹{selectedCoupon.minOrderAmount}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-semibold">Start Date:</label>
                                    <p>{formatDate(selectedCoupon.startDate)}</p>
                                </div>
                                <div>
                                    <label className="font-semibold">End Date:</label>
                                    <p>{formatDate(selectedCoupon.endDate)}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-semibold">Usage:</label>
                                    <p>
                                        {selectedCoupon.usedCount || 0}
                                        {selectedCoupon.usageLimit && ` / ${selectedCoupon.usageLimit}`}
                                    </p>
                                </div>
                                <div>
                                    <label className="font-semibold">Status:</label>
                                    <p>
                                        <span className={`badge ${
                                            selectedCoupon.isActive
                                                ? 'bg-success/10 text-success'
                                                : 'bg-danger/10 text-danger'
                                        }`}>
                                            {selectedCoupon.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Coupon Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-bodybg rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">
                                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingCoupon(null);
                                }}
                                className="ti-btn ti-btn-sm ti-btn-icon ti-btn-danger"
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={editingCoupon ? handleUpdateCoupon : handleCreateCoupon} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Coupon Code *</label>
                                    <input
                                        type="text"
                                        className="ti-form-control"
                                        placeholder="e.g., SAVE20"
                                        required
                                        value={newCoupon.code}
                                        onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Coupon Name *</label>
                                    <input
                                        type="text"
                                        className="ti-form-control"
                                        placeholder="e.g., Summer Sale"
                                        required
                                        value={newCoupon.name}
                                        onChange={(e) => setNewCoupon({...newCoupon, name: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Description</label>
                                <textarea
                                    className="ti-form-control"
                                    rows={2}
                                    placeholder="Coupon description..."
                                    value={newCoupon.description}
                                    onChange={(e) => setNewCoupon({...newCoupon, description: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Discount Type *</label>
                                    <select
                                        className="ti-form-control"
                                        required
                                        value={newCoupon.discountType}
                                        onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value as 'percentage' | 'fixed'})}
                                    >
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Discount Value *</label>
                                    <input
                                        type="number"
                                        className="ti-form-control"
                                        placeholder="e.g., 20"
                                        required
                                        min="0"
                                        value={newCoupon.discountValue}
                                        onChange={(e) => setNewCoupon({...newCoupon, discountValue: Number(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Start Date *</label>
                                    <input
                                        type="date"
                                        className="ti-form-control"
                                        required
                                        value={newCoupon.startDate}
                                        onChange={(e) => setNewCoupon({...newCoupon, startDate: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">End Date *</label>
                                    <input
                                        type="date"
                                        className="ti-form-control"
                                        required
                                        value={newCoupon.endDate}
                                        onChange={(e) => setNewCoupon({...newCoupon, endDate: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Min Order Amount</label>
                                    <input
                                        type="number"
                                        className="ti-form-control"
                                        placeholder="0"
                                        min="0"
                                        value={newCoupon.minOrderAmount}
                                        onChange={(e) => setNewCoupon({...newCoupon, minOrderAmount: Number(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Usage Limit</label>
                                    <input
                                        type="number"
                                        className="ti-form-control"
                                        placeholder="Unlimited"
                                        min="1"
                                        value={newCoupon.usageLimit || ''}
                                        onChange={(e) => setNewCoupon({...newCoupon, usageLimit: e.target.value ? Number(e.target.value) : undefined})}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setEditingCoupon(null);
                                    }}
                                    className="ti-btn ti-btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="ti-btn ti-btn-primary"
                                >
                                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Fragment>
    )
}

export default CouponsPage