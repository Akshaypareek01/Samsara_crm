"use client";

import React, { Fragment, useEffect, useState } from 'react';
import Seo from '@/shared/layout-components/seo/seo';
import CompanyService, { Company, CreateCompanyRequest, ContactPerson } from '@/services/companyService';
import Swal from 'sweetalert2';

const Companies = () => {
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
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    fetchCompanies();
  }, [page, searchTerm, statusFilter]);

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
      
      <div className="md:flex block items-center justify-between my-[1.5rem] page-header-breadcrumb">
        <div>
          <p className="font-semibold text-[1.125rem] text-defaulttextcolor dark:text-defaulttextcolor/70 !mb-0">
            Company Management
          </p>
          <p className="font-normal text-[#8c9097] dark:text-white/50 text-[0.813rem]">
            Manage all companies in the system
          </p>
        </div>
        <div className="btn-list md:mt-0 mt-2">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="ti-btn bg-primary text-white btn-wave !font-medium !me-[0.45rem] !ms-0 !text-[0.85rem] !rounded-[0.35rem] !py-[0.51rem] !px-[0.86rem] shadow-none"
          >
            <i className="ri-add-line inline-block me-1"></i>Add Company
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="box">
        <div className="box-body">
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search by company name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
            <select
              className="form-control"
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
            <div className="text-sm text-muted flex items-center">
              Total: {totalResults} companies
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover whitespace-nowrap min-w-full">
                <thead>
                  <tr>
                    <th>Company ID</th>
                    <th>Company Name</th>
                    <th>Email</th>
                    <th>Domain</th>
                    <th>Employees</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        No companies found
                      </td>
                    </tr>
                  ) : (
                    companies.map((company) => {
                      const companyId = company._id || company.id;
                      return (
                        <tr key={companyId}>
                          <td>
                            <span className="font-semibold text-primary">
                              {company.companyId}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center">
                              {company.companyLogo ? (
                                <img
                                  src={company.companyLogo}
                                  alt={company.companyName}
                                  className="w-10 h-10 rounded me-2"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center me-2">
                                  <i className="bx bx-building text-primary text-lg"></i>
                                </div>
                              )}
                              <span className="font-semibold">
                                {company.companyName || '-'}
                              </span>
                            </div>
                          </td>
                          <td>{company.email || '-'}</td>
                          <td>{company.domain || '-'}</td>
                          <td>{company.numberOfEmployees || '-'}</td>
                          <td>
                            <span
                              className={`badge ${
                                company.status !== false
                                  ? 'bg-success/10 text-success'
                                  : 'bg-danger/10 text-danger'
                              }`}
                            >
                              {company.status !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleView(company)}
                                className="ti-btn ti-btn-sm ti-btn-info"
                                title="View Details"
                              >
                                <i className="ri-eye-line"></i>
                              </button>
                              <button
                                onClick={() => handleEdit(company)}
                                className="ti-btn ti-btn-sm ti-btn-primary"
                                title="Edit"
                              >
                                <i className="ri-edit-line"></i>
                              </button>
                              <button
                                onClick={() => handleDelete(companyId!)}
                                className="ti-btn ti-btn-sm ti-btn-danger"
                                title="Delete"
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="ti-btn ti-btn-sm"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="ti-btn ti-btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
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
                  <label className="text-sm font-semibold text-muted">GST Number</label>
                  <p className="text-defaulttextcolor">
                    {viewingCompany.gstNumber || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted">Address</label>
                  <p className="text-defaulttextcolor">{viewingCompany.address || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted">City</label>
                  <p className="text-defaulttextcolor">{viewingCompany.city || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted">Pincode</label>
                  <p className="text-defaulttextcolor">{viewingCompany.pincode || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted">Country</label>
                  <p className="text-defaulttextcolor">{viewingCompany.country || '-'}</p>
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
