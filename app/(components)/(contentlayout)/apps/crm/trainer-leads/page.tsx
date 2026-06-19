"use client";

import React, { Fragment, useEffect, useState } from 'react';
import Seo from '@/shared/layout-components/seo/seo';
import Swal from 'sweetalert2';
import TrainerLeadService, {
  TrainerLead,
  TrainerLeadStatus,
  TRAINER_CATEGORY_OPTIONS,
  TRAINER_CITY_OPTIONS,
  TRAINER_LEAD_EXPERIENCE_OPTIONS,
  TRAINER_LEAD_STATUS_OPTIONS,
} from '@/services/trainerLeadService';
import { hasPermission } from '@/shared/utils/permissionUtils';

const STATUS_BADGE_CLASS: Record<string, string> = {
  New: 'bg-info/10 text-info',
  Contacted: 'bg-warning/10 text-warning',
  Converted: 'bg-success/10 text-success',
  Rejected: 'bg-danger/10 text-danger',
};

const TrainerLeadsPage = () => {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [leads, setLeads] = useState<TrainerLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterExperience, setFilterExperience] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setAdminUser(JSON.parse(userStr));
  }, []);

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, filterCity, filterSpecialization, filterExperience, filterStatus]);

  const buildFilterParams = () => {
    const params: any = {};
    if (searchTerm) params.name = searchTerm;
    if (filterCity) params.city = filterCity;
    if (filterSpecialization) params.specialization = filterSpecialization;
    if (filterExperience) params.experience = filterExperience;
    if (filterStatus) params.status = filterStatus;
    return params;
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await TrainerLeadService.getTrainerLeads({
        page,
        limit: 10,
        sortBy: 'createdAt:desc',
        ...buildFilterParams(),
      });
      setLeads(response.results || []);
      setTotalPages(response.totalPages || 1);
      setTotalResults(response.totalResults || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trainer leads');
      Swal.fire('Error!', err.message || 'Failed to fetch trainer leads', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await TrainerLeadService.exportTrainerLeads(buildFilterParams());
    } catch (err: any) {
      Swal.fire('Error!', err.message || 'Failed to export trainer leads', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleStatusChange = async (leadId: string, status: TrainerLeadStatus) => {
    try {
      await TrainerLeadService.updateTrainerLeadStatus(leadId, status);
      setLeads((prev) => prev.map((l) => ((l._id || l.id) === leadId ? { ...l, status } : l)));
    } catch (err: any) {
      Swal.fire('Error!', err.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (leadId: string) => {
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
        await TrainerLeadService.deleteTrainerLead(leadId);
        Swal.fire('Deleted!', 'Trainer lead has been deleted.', 'success');
        fetchLeads();
      } catch (err: any) {
        Swal.fire('Error!', err.message || 'Failed to delete trainer lead', 'error');
      }
    }
  };

  const canDelete = hasPermission(adminUser, 'userManagement.trainerLeads', 'delete');

  return (
    <Fragment>
      <Seo title="Trainer Leads" />

      <div className="md:flex block items-center justify-between my-[1.5rem] page-header-breadcrumb">
        <div>
          <p className="font-semibold text-[1.125rem] text-defaulttextcolor dark:text-defaulttextcolor/70 !mb-0">
            Trainer Leads
          </p>
          <p className="font-normal text-[#8c9097] dark:text-white/50 text-[0.813rem]">
            Quick/partial trainer registrations submitted from the public interest form
          </p>
        </div>
        <div className="btn-list md:mt-0 mt-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="ti-btn bg-success text-white btn-wave !font-medium !me-[0.45rem] !ms-0 !text-[0.85rem] !rounded-[0.35rem] !py-[0.51rem] !px-[0.86rem] shadow-none disabled:opacity-70"
          >
            {exporting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>Exporting...
              </>
            ) : (
              <>
                <i className="ri-file-excel-2-line inline-block me-1"></i>Export to Excel
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="box mb-4">
        <div className="box-body">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <div>
              <label className="form-label">Search by Name/Email/Mobile</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div>
              <label className="form-label">Filter by City</label>
              <select
                className="form-control"
                value={filterCity}
                onChange={(e) => {
                  setFilterCity(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Cities</option>
                {TRAINER_CITY_OPTIONS.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Filter by Specialization</label>
              <select
                className="form-control"
                value={filterSpecialization}
                onChange={(e) => {
                  setFilterSpecialization(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Specializations</option>
                {TRAINER_CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Filter by Experience</label>
              <select
                className="form-control"
                value={filterExperience}
                onChange={(e) => {
                  setFilterExperience(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Experience</option>
                {TRAINER_LEAD_EXPERIENCE_OPTIONS.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Filter by Status</label>
              <select
                className="form-control"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Status</option>
                {TRAINER_LEAD_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="box">
        <div className="box-body">
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading trainer leads...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-bordered table-hover whitespace-nowrap min-w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Mobile</th>
                      <th>Email</th>
                      <th>Specialization</th>
                      <th>City</th>
                      <th>PIN Code</th>
                      <th>Experience</th>
                      <th>LinkedIn</th>
                      <th>Instagram</th>
                      <th>Status</th>
                      <th>Submitted On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="text-center py-4">
                          No trainer leads found
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead) => {
                        const leadId = (lead._id || lead.id) as string;
                        return (
                          <tr key={leadId}>
                            <td className="font-semibold">{lead.name}</td>
                            <td>{lead.mobile}</td>
                            <td className="max-w-xs truncate">{lead.email}</td>
                            <td>{lead.specialization}</td>
                            <td>{lead.city}</td>
                            <td>{lead.pinCode}</td>
                            <td>{lead.experience}</td>
                            <td>
                              {lead.linkedin ? (
                                <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary">
                                  <i className="ri-linkedin-box-fill"></i>
                                </a>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td>
                              {lead.instagram ? (
                                <a href={lead.instagram} target="_blank" rel="noopener noreferrer" className="text-primary">
                                  <i className="ri-instagram-line"></i>
                                </a>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td>
                              <select
                                className={`form-control !w-auto !py-1 !text-xs badge ${STATUS_BADGE_CLASS[lead.status || 'New']}`}
                                value={lead.status || 'New'}
                                onChange={(e) => handleStatusChange(leadId, e.target.value as TrainerLeadStatus)}
                              >
                                {TRAINER_LEAD_STATUS_OPTIONS.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN') : '-'}</td>
                            <td>
                              {canDelete && (
                                <button
                                  onClick={() => handleDelete(leadId)}
                                  className="ti-btn ti-btn-sm ti-btn-danger"
                                  title="Delete"
                                >
                                  <i className="ri-delete-bin-line"></i>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-muted">
                    Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, totalResults)} of {totalResults} leads
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="ti-btn ti-btn-sm"
                    >
                      Previous
                    </button>
                    <span className="px-2">
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
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default TrainerLeadsPage;
