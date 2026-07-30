"use client";

import React, { Fragment, useEffect, useState } from 'react';
import Seo from '@/shared/layout-components/seo/seo';
import CompanyService, { Company, CreateCompanyRequest, ContactPerson } from '@/services/companyService';
import { formatCompanyAddress, getCompanyContactName, getCompanyLogoUrl } from '@/shared/utils/companyDisplayUtils';
import { hasPermission } from '@/shared/utils/permissionUtils';
import Swal from 'sweetalert2';
import CompanyAppMembershipCells from './CompanyAppMembershipCells';
import membershipPlanService, { MembershipPlan } from '@/services/membershipPlanService';
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
  CrmBtnView,
  CrmBtnEdit,
  CrmBtnDelete,
  CrmActionGroup,
  CrmLoading,
  crmInputClass,
  crmSelectClass,
} from '../components';

const Companies = () => {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CreateCompanyRequest>({
    companyName: '',
    companyLogo: '',
    email: '',
    domain: '',
    numberOfEmployees: undefined,
    gstNumber: '',
    panNumber: '',
    address: '',
    city: '',
    pincode: '',
    country: '',
    contactPerson1: {
      name: '',
      email: '',
      mobileNumber: '',
      designation: '',
    },
    contactPerson2: {
      name: '',
      email: '',
      mobileNumber: '',
      designation: '',
    },
    status: true,
    appMembershipEnabled: false,
    appMembershipPlanId: null,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyIdFilter, setCompanyIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);

  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userStr) setAdminUser(JSON.parse(userStr));
  }, []);

  useEffect(() => {
    membershipPlanService
      .getMembershipPlans({ isActive: true, limit: 100, page: 1, sortBy: 'name:asc' })
      .then((response) => setMembershipPlans(response.data.filter((plan) => plan.name !== 'Trial Plan')))
      .catch((err) => console.error('Failed to load membership plans:', err));
  }, []);
  useEffect(() => {
    fetchCompanies();
  }, [page, searchTerm, companyIdFilter, statusFilter]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 10,
        sortBy: 'createdAt:desc',
      };
      
      if (searchTerm) {
        params.companyName = searchTerm;
      }

      if (companyIdFilter) {
        params.companyId = companyIdFilter.trim();
      }
      
      if (statusFilter !== undefined) {
        params.status = statusFilter;
      }

      const response = await CompanyService.getCompanies(params);
      
      setCompanies(response.results || []);
      setTotalPages(response.totalPages || 1);
      setTotalResults(response.totalResults || 0);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch companies');
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName?.trim()) {
      Swal.fire('Error!', 'Company name is required', 'error');
      return;
    }
    if (!formData.email?.trim()) {
      Swal.fire('Error!', 'Email is required', 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      Swal.fire('Error!', 'Please enter a valid email address', 'error');
      return;
    }
    if (!formData.contactPerson1?.name?.trim()) {
      Swal.fire('Error!', 'Primary contact name is required', 'error');
      return;
    }
    if (formData.appMembershipEnabled && !formData.appMembershipPlanId) {
      Swal.fire('Error!', 'Select a membership plan when app membership is enabled', 'error');
      return;
    }
    try {
      if (editingCompany) {
        const companyId = editingCompany._id || editingCompany.id;
        if (!companyId) {
          Swal.fire('Error!', 'Company ID not found', 'error');
          return;
        }
        await CompanyService.updateCompany(companyId, formData);
        Swal.fire('Success!', 'Company updated successfully', 'success');
      } else {
        await CompanyService.createCompany(formData);
        Swal.fire('Success!', 'Company created successfully', 'success');
      }
      setShowModal(false);
      setEditingCompany(null);
      resetForm();
      fetchCompanies();
    } catch (err: any) {
      Swal.fire('Error!', err.message || 'Failed to save company', 'error');
    }
  };

  const handleView = (company: Company) => {
    setViewingCompany(company);
    setShowViewModal(true);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      companyName: company.companyName || '',
      companyLogo: company.companyLogo || '',
      email: company.email || '',
      domain: company.domain || '',
      numberOfEmployees: company.numberOfEmployees,
      gstNumber: company.gstNumber || '',
      panNumber: company.panNumber || '',
      address: company.address || '',
      city: company.city || '',
      pincode: company.pincode || '',
      country: company.country || '',
      contactPerson1: company.contactPerson1 || {
        name: '',
        email: '',
        mobileNumber: '',
        designation: '',
      },
      contactPerson2: company.contactPerson2 || {
        name: '',
        email: '',
        mobileNumber: '',
        designation: '',
      },
      status: company.status !== undefined ? company.status : true,
      appMembershipEnabled: company.appMembershipEnabled === true,
      appMembershipPlanId: company.appMembershipPlanId || null,
    });
    setShowModal(true);
  };

  const handleDelete = async (companyId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await CompanyService.deleteCompany(companyId);
        Swal.fire('Deleted!', 'Company has been deleted.', 'success');
        fetchCompanies();
      } catch (err: any) {
        Swal.fire('Error!', err.message || 'Failed to delete company', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      companyLogo: '',
      email: '',
      domain: '',
      numberOfEmployees: undefined,
      gstNumber: '',
      panNumber: '',
      address: '',
      city: '',
      pincode: '',
      country: '',
      contactPerson1: {
        name: '',
        email: '',
        mobileNumber: '',
        designation: '',
      },
      contactPerson2: {
        name: '',
        email: '',
        mobileNumber: '',
        designation: '',
      },
      status: true,
      appMembershipEnabled: false,
      appMembershipPlanId: null,
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCompany(null);
    resetForm();
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingCompany(null);
  };

  const updateContactPerson = (
    personNumber: 1 | 2,
    field: keyof ContactPerson,
    value: string
  ) => {
    const contactPersonKey = personNumber === 1 ? 'contactPerson1' : 'contactPerson2';
    setFormData({
      ...formData,
      [contactPersonKey]: {
        ...formData[contactPersonKey],
        [field]: value,
      },
    });
  };

  return (
    <Fragment>
      <Seo title="Company Management" />
      <div className="p-[10px]">
        <CrmPageHeader
          title="Company Management"
          subtitle="Manage all companies in the system"
          actions={
            hasPermission(adminUser, 'companyManagement', 'create') ? (
              <CrmBtnPrimary onClick={() => setShowModal(true)}>
                <i className="ri-add-line text-xs" /> Add Company
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
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="text"
                className={crmInputClass}
                placeholder="Search by company name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                aria-label="Search companies by name"
              />
              <input
                type="text"
                className={crmInputClass}
                placeholder="Search by company ID..."
                value={companyIdFilter}
                onChange={(e) => {
                  setCompanyIdFilter(e.target.value.toUpperCase());
                  setPage(1);
                }}
                aria-label="Search companies by company ID"
              />
              <select
                className={crmSelectClass}
                value={statusFilter === undefined ? '' : statusFilter.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setStatusFilter(value === '' ? undefined : value === 'true');
                  setPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <div className="text-[11px] font-medium text-[#495057] flex items-center">
                Total: {totalResults} companies
              </div>
            </div>

            {loading ? (
              <CrmLoading label="Loading companies..." />
            ) : (
              <CrmTableWrapper>
                <table className={crmTableClass}>
                  <thead>
                    <tr className={crmTheadTrClass}>
                      <th className={crmThClass}>Company Name</th>
                      <th className={crmThClass}>Company ID</th>
                      <th className={crmThClass}>Contact Person</th>
                      <th className={crmThClass}>Email</th>
                      <th className={crmThClass}>Domain</th>
                      <th className={crmThClass}>Employees</th>
                      <th className={crmThClass}>App Membership</th>
                      <th className={crmThClass}>Plan</th>
                      <th className={crmThClass}>Seats</th>
                      <th className={crmThClass}>Status</th>
                      <th className={crmThActionsClass}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.length === 0 ? (
                      <tr className={crmTbodyTrClass}>
                        <td colSpan={11} className={`${crmTdClass} text-center text-[12px] font-medium text-gray-400 py-8`}>
                          No companies found
                        </td>
                      </tr>
                    ) : (
                      companies.map((company) => {
                        const companyId = company._id || company.id;
                        return (
                          <tr key={companyId} className={crmTbodyTrClass}>
                            <td className={crmTdClass}>
                              <div className="flex items-center gap-2">
                                {company.companyLogo ? (
                                  <img src={company.companyLogo} alt={company.companyName} className="w-10 h-10 rounded shrink-0" />
                                ) : (
                                  <div className="w-10 h-10 rounded bg-purple-100 flex items-center justify-center shrink-0">
                                    <i className="bx bx-building text-purple-600 text-lg" />
                                  </div>
                                )}
                                <span className="font-semibold text-gray-900 text-[12px]">{company.companyName || '-'}</span>
                              </div>
                            </td>
                            <td className={`${crmTdClass} text-gray-600 font-mono text-[11px] font-semibold tracking-wide`}>
                              {company.companyId || '-'}
                            </td>
                            <td className={`${crmTdClass} text-gray-600`}>{getCompanyContactName(company)}</td>
                            <td className={`${crmTdClass} text-gray-600`}>{company.email || '-'}</td>
                            <td className={`${crmTdClass} text-gray-600`}>{company.domain || '-'}</td>
                            <td className={`${crmTdClass} text-gray-600`}>{company.numberOfEmployees ?? '-'}</td>
                            <CompanyAppMembershipCells
                              company={company}
                              canEdit={hasPermission(adminUser, 'companyManagement', 'update')}
                              onUpdated={fetchCompanies}
                            />
                            <td className={crmTdClass}>
                              <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded ${company.status !== false ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                {company.status !== false ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className={crmTdActionsClass}>
                              <CrmActionGroup>
                                <CrmBtnView onClick={() => handleView(company)} title="View Details" />
                                {hasPermission(adminUser, 'companyManagement', 'update') && (
                                  <CrmBtnEdit onClick={() => handleEdit(company)} title="Edit" />
                                )}
                                {hasPermission(adminUser, 'companyManagement', 'delete') && (
                                  <CrmBtnDelete onClick={() => handleDelete(companyId!)} title="Delete" />
                                )}
                              </CrmActionGroup>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </CrmTableWrapper>
            )}

            {totalPages > 1 && (
              <div className="flex flex-wrap justify-between items-center gap-4 p-[10px] pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-[11px] font-bold text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-[11px] font-medium text-[#495057]">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-[11px] font-bold text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </CrmCard>

      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingCompany ? 'Edit Company' : 'Add New Company'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="ti-btn ti-btn-sm ti-btn-ghost"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Company Logo URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.companyLogo}
                    onChange={(e) =>
                      setFormData({ ...formData, companyLogo: e.target.value })
                    }
                  />
                  {formData.companyLogo ? (
                    <img
                      src={getCompanyLogoUrl({ companyLogo: formData.companyLogo } as Company) || formData.companyLogo}
                      alt="Company logo preview"
                      className="mt-2 w-16 h-16 rounded object-contain border border-defaultborder"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                </div>
                <div>
                  <label className="form-label">Domain</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.domain}
                    onChange={(e) =>
                      setFormData({ ...formData, domain: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Number of Employees</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.numberOfEmployees || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfEmployees: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">GST Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.gstNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, gstNumber: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">PAN Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.panNumber || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, panNumber: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={formData.status ? 'true' : 'false'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value === 'true',
                      })
                    }
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">App membership for registrants</label>
                  <select
                    className="form-control"
                    value={formData.appMembershipEnabled ? 'true' : 'false'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appMembershipEnabled: e.target.value === 'true',
                      })
                    }
                  >
                    <option value="false">Disabled</option>
                    <option value="true">Enabled</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Membership plan</label>
                  <select
                    className="form-control"
                    value={formData.appMembershipPlanId || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appMembershipPlanId: e.target.value || null,
                      })
                    }
                  >
                    <option value="">Select plan</option>
                    {membershipPlans.map((plan) => {
                      const planId = plan._id || plan.id || '';
                      return (
                        <option key={planId} value={planId}>
                          {plan.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-4">Contact Person 1</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.contactPerson1?.name || ''}
                      onChange={(e) =>
                        updateContactPerson(1, 'name', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.contactPerson1?.email || ''}
                      onChange={(e) =>
                        updateContactPerson(1, 'email', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.contactPerson1?.mobileNumber || ''}
                      onChange={(e) =>
                        updateContactPerson(1, 'mobileNumber', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="form-label">Designation</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.contactPerson1?.designation || ''}
                      onChange={(e) =>
                        updateContactPerson(1, 'designation', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-4">Contact Person 2</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.contactPerson2?.name || ''}
                      onChange={(e) =>
                        updateContactPerson(2, 'name', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.contactPerson2?.email || ''}
                      onChange={(e) =>
                        updateContactPerson(2, 'email', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.contactPerson2?.mobileNumber || ''}
                      onChange={(e) =>
                        updateContactPerson(2, 'mobileNumber', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="form-label">Designation</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.contactPerson2?.designation || ''}
                      onChange={(e) =>
                        updateContactPerson(2, 'designation', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="ti-btn ti-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="ti-btn ti-btn-primary">
                  {editingCompany ? 'Update' : 'Create'} Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Company Details</h3>
              <button
                onClick={handleCloseViewModal}
                className="ti-btn ti-btn-sm ti-btn-ghost"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-center pb-4 border-b border-defaultborder/60">
                {getCompanyLogoUrl(viewingCompany) ? (
                  <img
                    src={getCompanyLogoUrl(viewingCompany)!}
                    alt=""
                    className="w-20 h-20 rounded-xl mx-auto mb-3 object-contain border border-defaultborder bg-white p-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <h4 className="font-semibold text-lg mb-0">{viewingCompany.companyName || '-'}</h4>
                <p className="text-sm text-muted mt-1 mb-0">Contact: {getCompanyContactName(viewingCompany)}</p>
                <span
                  className={`badge mt-2 ${viewingCompany.status !== false ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}
                >
                  {viewingCompany.status !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-muted">Company ID</label>
                  <p className="text-defaulttextcolor">{viewingCompany.companyId}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted">Company Name</label>
                  <p className="text-defaulttextcolor">
                    {viewingCompany.companyName || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted">Email</label>
                  <p className="text-defaulttextcolor">{viewingCompany.email || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted">Domain</label>
                  <p className="text-defaulttextcolor">{viewingCompany.domain || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted">
                    Number of Employees
                  </label>
                  <p className="text-defaulttextcolor">
                    {viewingCompany.numberOfEmployees || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted">App membership</label>
                  <p className="text-defaulttextcolor">
                    {viewingCompany.appMembershipEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted">Membership plan</label>
                  <p className="text-defaulttextcolor">
                    {viewingCompany.appMembershipPlanName || 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted">Membership seats</label>
                  <p className="text-defaulttextcolor">
                    {viewingCompany.appMembershipEnabled
                      ? `${viewingCompany.membershipSlotsUsed ?? 0} / ${viewingCompany.numberOfEmployees ?? 0} used (${viewingCompany.membershipSlotsRemaining ?? 0} left)`
                      : '—'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted">GST Number</label>
                  <p className="text-defaulttextcolor">
                    {viewingCompany.gstNumber || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted">PAN Number</label>
                  <p className="text-defaulttextcolor">
                    {viewingCompany.panNumber || '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-semibold text-muted">Address</label>
                  <p className="text-defaulttextcolor">
                    {formatCompanyAddress(viewingCompany) || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted">Status</label>
                  <p className="text-defaulttextcolor">
                    <span
                      className={`badge ${
                        viewingCompany.status !== false
                          ? 'bg-success/10 text-success'
                          : 'bg-danger/10 text-danger'
                      }`}
                    >
                      {viewingCompany.status !== false ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>

              {viewingCompany.contactPerson1 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-4">Contact Person 1</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-muted">Name</label>
                      <p className="text-defaulttextcolor">
                        {viewingCompany.contactPerson1.name || '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted">Email</label>
                      <p className="text-defaulttextcolor">
                        {viewingCompany.contactPerson1.email || '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted">
                        Mobile Number
                      </label>
                      <p className="text-defaulttextcolor">
                        {viewingCompany.contactPerson1.mobileNumber || '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted">
                        Designation
                      </label>
                      <p className="text-defaulttextcolor">
                        {viewingCompany.contactPerson1.designation || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {viewingCompany.contactPerson2 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-4">Contact Person 2</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-muted">Name</label>
                      <p className="text-defaulttextcolor">
                        {viewingCompany.contactPerson2.name || '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted">Email</label>
                      <p className="text-defaulttextcolor">
                        {viewingCompany.contactPerson2.email || '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted">
                        Mobile Number
                      </label>
                      <p className="text-defaulttextcolor">
                        {viewingCompany.contactPerson2.mobileNumber || '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted">
                        Designation
                      </label>
                      <p className="text-defaulttextcolor">
                        {viewingCompany.contactPerson2.designation || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleCloseViewModal}
                  className="ti-btn ti-btn-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Companies;
