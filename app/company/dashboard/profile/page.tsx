"use client"
import Pageheader from '@/shared/layout-components/page-header/pageheader'
import Seo from '@/shared/layout-components/seo/seo'
import React, { Fragment, useState } from 'react'
import { useEffect } from "react";
import CompanyService from "@/services/companyService";
//import { Base_url } from "@/Config/BaseUrl";

const CompanyProfile = () => {
    const [activeContact, setActiveContact] = useState<1 | 2>(1);
    const [activeView, setActiveView] = useState<'profile' | 'form'>('profile');
    const [company, setCompany] = useState<any>(null);
const [contactsData, setContactsData] = useState<any>({});
const [formData, setFormData] = useState<any>({});



useEffect(() => {
  const fetchCompany = async () => {
    try {
      const res = await CompanyService.getCompanyProfile();
      const data = res;

      console.log("DATA:", data);
      console.log("FULL DATA:", JSON.stringify(data, null, 2));
        console.log("CONTACT1:", data?.contactPerson1);
        console.log("CONTACT2:", data?.contactPerson2);

      if (!data) throw new Error("No data");

      setCompany(data);

 const contacts = {
  1: {
    fullName:
      data.contactPerson1?.name ||
      "N/A",

    designation: data.contactPerson1?.designation,

    mobile:
      data.contactPerson1?.mobileNumber ||
      "N/A",

    email: data.contactPerson1?.email,
    contact1: "",
    contact2: "",
  },
  2: {
    fullName:
      data.contactPerson2?.name ||
      "N/A",

    designation: data.contactPerson2?.designation,

    mobile:
      data.contactPerson2?.mobileNumber ||
      "N/A",

    email: data.contactPerson2?.email,
    contact1: "",
    contact2: "",
  },
};

      setContactsData(contacts);
      setFormData(contacts[1]);

    } catch (err) {
      console.error("ERROR:", err);
      setCompany({}); // prevent loading stuck
    }
  };

  fetchCompany();
}, []);

    const handleContactSwitch = (num: 1 | 2) => {
        setActiveContact(num);
        setFormData({ ...contactsData[num] });
    };

    const handleSave = () => {
        setContactsData({ ...contactsData, [activeContact]: { ...formData } });
        setActiveView('profile');
    };

    const currentContact = activeView === 'form' ? formData : contactsData[activeContact];

   if(!company) return <div>Loading...</div>;

    return (
        <Fragment>
            <Seo title={"Company Profile"} />
            <Pageheader currentpage="Company Overview" activepage="Company Profile" mainpage="Company Overview" />

            <div className="grid grid-cols-12 gap-x-6">
                {/* Main Content */}
                <div className="col-span-12 xl:col-span-8">
                    <div className="box">
                        <div className="box-body">
                            {/* Company Header */}
                            <div className="flex flex-wrap items-start gap-6 mb-6">
                                <div className="flex-shrink-0">
                                    <div className="avatar avatar-xxl !rounded-full bg-orange-100 flex items-center justify-center"
                                        style={{ width: '5rem', height: '5rem' }}>
                                        <i className="bx bxs-leaf text-[2rem] text-orange-500"></i>
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-bold text-[1.25rem] mb-4">{company?.companyName}</h4>
                                    <div className="grid grid-cols-12 gap-4">
                                        <div className="col-span-12 sm:col-span-6">
                                            <p className="text-[#8c9097] dark:text-white/50 text-[0.8125rem] mb-1">Primary Contact</p>
                                            <p className="font-semibold text-[0.9375rem]">{company?.contactPerson1?.name}</p>
                                        </div>
                                        <div className="col-span-12 sm:col-span-6">
                                            <p className="text-[#8c9097] dark:text-white/50 text-[0.8125rem] mb-1">Contact Number</p>
                                            <p className="font-semibold text-[0.9375rem]">{company?.contactPerson1?.mobileNumber}</p>
                                        </div>
                                        <div className="col-span-12">
                                            <p className="text-[#8c9097] dark:text-white/50 text-[0.8125rem] mb-1">Location</p>
                                            <p className="font-semibold text-[0.9375rem]">{company?.address}, {company?.city}, {company?.country}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* View Toggle + View Details */}
                            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveView('profile')}
                                        className={`ti-btn !py-2 !px-4 !text-[0.875rem] !font-medium ti-btn-wave ${
                                            activeView === 'profile'
                                                ? '!bg-orange-500 !text-white border-orange-500'
                                                : 'ti-btn-outline-light !text-defaulttextcolor'
                                        }`}
                                    >
                                        Profile View
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...contactsData[activeContact] });
                                            setActiveView('form');
                                        }}
                                        className={`ti-btn !py-2 !px-4 !text-[0.875rem] !font-medium ti-btn-wave ${
                                            activeView === 'form'
                                                ? '!bg-orange-500 !text-white border-orange-500'
                                                : 'ti-btn-outline-light !text-defaulttextcolor'
                                        }`}
                                    >
                                        Form View
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    className="ti-btn !py-2 !px-4 !text-[0.875rem] !font-medium ti-btn-wave border border-orange-300 !text-orange-500 bg-transparent hover:!bg-orange-50"
                                >
                                    <i className="ri-external-link-line me-1"></i>
                                    View Details
                                </button>
                            </div>

                            {/* Contact Tabs */}
                            <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-black/20 rounded-lg w-fit">
                                <button
                                    type="button"
                                    onClick={() => handleContactSwitch(1)}
                                    className={`flex items-center gap-2 !py-2 !px-4 rounded-md text-[0.875rem] font-medium transition-all ${
                                        activeContact === 1
                                            ? 'bg-orange-500 text-white shadow-sm'
                                            : 'text-[#8c9097] hover:text-defaulttextcolor'
                                    }`}
                                >
                                    <i className="bx bx-user"></i>
                                    Contact 1
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleContactSwitch(2)}
                                    className={`flex items-center gap-2 !py-2 !px-4 rounded-md text-[0.875rem] font-medium transition-all ${
                                        activeContact === 2
                                            ? 'bg-orange-500 text-white shadow-sm'
                                            : 'text-[#8c9097] hover:text-defaulttextcolor'
                                    }`}
                                >
                                    <i className="bx bx-user"></i>
                                    Contact 2
                                </button>
                            </div>

                            {/* Contact Details */}
                            <div className="grid grid-cols-12 gap-6">
                                <div className="col-span-12 sm:col-span-6">
                                    <p className="text-[#8c9097] dark:text-white/50 text-[0.8125rem] mb-1">Full Name</p>
                                    {activeView === 'profile' ? (
                                        <p className="font-bold text-[1rem]">{currentContact.fullName}</p>
                                    ) : (
                                        <input type="text" className="ti-form-control" value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                                    )}
                                </div>
                                <div className="col-span-12 sm:col-span-6">
                                    <p className="text-[#8c9097] dark:text-white/50 text-[0.8125rem] mb-1">Designation</p>
                                    {activeView === 'profile' ? (
                                        <p className="font-bold text-[1rem]">{currentContact.designation}</p>
                                    ) : (
                                        <input type="text" className="ti-form-control" value={formData.designation}
                                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })} />
                                    )}
                                </div>
                                <div className="col-span-12 sm:col-span-6">
                                    <p className="text-[#8c9097] dark:text-white/50 text-[0.8125rem] mb-1">Mobile Number</p>
                                    {activeView === 'profile' ? (
                                        <p className="font-bold text-[1rem]">{currentContact.mobile}</p>
                                    ) : (
                                        <input type="text" className="ti-form-control" value={formData.mobile}
                                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />
                                    )}
                                </div>
                                <div className="col-span-12 sm:col-span-6">
                                    <p className="text-[#8c9097] dark:text-white/50 text-[0.8125rem] mb-1">Email ID</p>
                                    {activeView === 'profile' ? (
                                        <p className="font-bold text-[1rem]">{currentContact.email}</p>
                                    ) : (
                                        <input type="text" className="ti-form-control" value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                    )}
                                </div>
                                <div className="col-span-12 sm:col-span-6">
                                    <p className="text-[#8c9097] dark:text-white/50 text-[0.8125rem] mb-1">Contact 1</p>
                                    {activeView === 'profile' ? (
                                        <p className="font-bold text-[1rem]">{currentContact.contact1}</p>
                                    ) : (
                                        <input type="text" className="ti-form-control" value={formData.contact1}
                                            onChange={(e) => setFormData({ ...formData, contact1: e.target.value })} />
                                    )}
                                </div>
                                <div className="col-span-12 sm:col-span-6">
                                    <p className="text-[#8c9097] dark:text-white/50 text-[0.8125rem] mb-1">Contact 2</p>
                                    {activeView === 'profile' ? (
                                        <p className="font-bold text-[1rem]">{currentContact.contact2}</p>
                                    ) : (
                                        <input type="text" className="ti-form-control" value={formData.contact2}
                                            onChange={(e) => setFormData({ ...formData, contact2: e.target.value })} />
                                    )}
                                </div>

                                {/* Cancel/Save — only in Form View */}
                                {activeView === 'form' && (
                                    <div className="col-span-12 flex justify-end gap-3 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setActiveView('profile')}
                                            className="ti-btn ti-btn-outline-light !text-defaulttextcolor !font-medium ti-btn-wave"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            className="ti-btn !bg-orange-500 !text-white !font-medium ti-btn-wave"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="col-span-12 xl:col-span-4">
                    {/* Quick Actions */}
                    <div className="box mb-6">
                        <div className="box-header">
                            <div className="box-title">Quick Actions</div>
                        </div>
                        <div className="box-body !pt-2 flex flex-col gap-3">
                            <button
                                type="button"
                                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-defaultborder/10 hover:bg-gray-50 dark:hover:bg-light transition-all text-start w-full"
                            >
                                <span className="avatar avatar-sm bg-primary/10 text-primary rounded-lg">
                                    <i className="ri-file-download-line text-[1.125rem]"></i>
                                </span>
                                <div>
                                    <p className="font-semibold text-[0.875rem] mb-0">Download Company Report</p>
                                    <p className="text-[#8c9097] dark:text-white/50 text-[0.75rem] mb-0">Export organizational metrics</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-defaultborder/10 hover:bg-gray-50 dark:hover:bg-light transition-all text-start w-full"
                            >
                                <span className="avatar avatar-sm bg-success/10 text-success rounded-lg">
                                    <i className="ri-share-line text-[1.125rem]"></i>
                                </span>
                                <div>
                                    <p className="font-semibold text-[0.875rem] mb-0">Share Overview</p>
                                    <p className="text-[#8c9097] dark:text-white/50 text-[0.75rem] mb-0">Send to stakeholders</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Recent Updates */}
                    <div className="box mb-6">
                        <div className="box-header">
                            <div className="box-title">Recent Updates</div>
                        </div>
                        <div className="box-body !pt-2">
                            <ul className="list-none mb-0 flex flex-col gap-3">
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 w-2 h-2 rounded-full bg-success flex-shrink-0"></span>
                                    <div>
                                        <p className="font-medium text-[0.875rem] mb-0">New Yoga Program Launched</p>
                                        <p className="text-[#8c9097] dark:text-white/50 text-[0.75rem] mb-0">2 hours ago</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                                    <div>
                                        <p className="font-medium text-[0.875rem] mb-0">Monthly Health Report Published</p>
                                        <p className="text-[#8c9097] dark:text-white/50 text-[0.75rem] mb-0">1 day ago</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 w-2 h-2 rounded-full bg-warning flex-shrink-0"></span>
                                    <div>
                                        <p className="font-medium text-[0.875rem] mb-0">Employee Feedback Survey Completed</p>
                                        <p className="text-[#8c9097] dark:text-white/50 text-[0.75rem] mb-0">3 days ago</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="box">
                        <div className="box-header">
                            <div className="box-title">Upcoming Events</div>
                        </div>
                        <div className="box-body !pt-2 flex flex-col gap-3">
                            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                                <p className="font-semibold text-[0.875rem] mb-1">Wellness Workshop</p>
                                <p className="text-[#8c9097] dark:text-white/50 text-[0.75rem] mb-0">Tomorrow, 2:00 PM</p>
                            </div>
                            <div className="p-3 rounded-lg bg-success/5 border border-success/10">
                                <p className="font-semibold text-[0.875rem] mb-1">Health Screening Camp</p>
                                <p className="text-[#8c9097] dark:text-white/50 text-[0.75rem] mb-0">Next Week, Monday</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default CompanyProfile