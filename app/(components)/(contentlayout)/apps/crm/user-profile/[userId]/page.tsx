"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import UserService, { User } from '@/services/userService';
import AdminUserService from '@/services/adminUserService';
import TrackerService, { TrackerDashboard, WaterEntry, HydrationStatus } from '@/services/trackerService';
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import React, { Fragment } from 'react';

const UserProfile = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [trackerData, setTrackerData] = useState<TrackerDashboard | null>(null);
  const [todayWater, setTodayWater] = useState<WaterEntry | null>(null);
  const [hydrationStatus, setHydrationStatus] = useState<HydrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      console.log('📊 Fetching data for user:', userId);

      // Fetch all user data in parallel
      const [userData, dashboard, waterToday, hydration] = await Promise.allSettled([
        AdminUserService.getUserById(userId),
        TrackerService.getUserTrackerDashboard(userId), //fetches user data to the admin dashboard
        TrackerService.getUserTodayWaterData(userId),
        TrackerService.getUserHydrationStatus(userId)
      ]);

      if (userData.status === 'fulfilled') {
        console.log('✅ User data received');
        setUser(userData.value);
      } else {
        console.error('❌ Failed to fetch user data:', userData.reason);
      }

      if (dashboard.status === 'fulfilled') {
        console.log('✅ Dashboard data received:', dashboard.value);
        setTrackerData(dashboard.value);
      } else {
        console.error('❌ Failed to fetch tracker dashboard:', dashboard.reason);
      }

      if (waterToday.status === 'fulfilled') {
        console.log('✅ Water today data received:', waterToday.value);
        setTodayWater(waterToday.value);
      } else {
        console.error('❌ Failed to fetch today water data:', waterToday.reason);
      }

      if (hydration.status === 'fulfilled') {
        console.log('✅ Hydration status data received:', hydration.value);
        setHydrationStatus(hydration.value);
      } else {
        console.error('❌ Failed to fetch hydration status:', hydration.reason);
      }

    } catch (err: any) {
      console.error('❌ Error fetching user data:', err);
      setError(err.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood?: string) => {
    if (!mood) return '😐';
    switch (mood.toLowerCase()) {
      case 'very_happy': return '😄';
      case 'happy': return '😊';
      case 'neutral': return '😐';
      case 'sad': return '😢';
      case 'very_sad': return '😭';
      case 'angry': return '😠';
      case 'excited': return '🤩';
      case 'relaxed': return '😌';
      case 'confident': return '😎';
      case 'anxious': return '😰';
      case 'exhausted': return '😴';
      case 'depressed': return '😞';
      case 'in_love': return '😍';
      case 'bored': return '😑';
      default: return '😐';
    }
  };

  const getHydrationColor = (status?: string) => {
    if (!status) return 'text-muted';
    switch (status) {
      case 'Hydrated': return 'text-success';
      case 'Mildly dehydrated': return 'text-warning';
      case 'Dehydrated': return 'text-danger';
      default: return 'text-muted';
    }
  };

  const getHydrationBgColor = (status?: string) => {
    if (!status) return 'bg-gray-200';
    switch (status) {
      case 'Hydrated': return 'bg-success';
      case 'Mildly dehydrated': return 'bg-warning';
      case 'Dehydrated': return 'bg-danger';
      default: return 'bg-gray-200';
    }
  };

  if (loading) {
    return (
      <Fragment>
        <Seo title="User Profile" />
        <Pageheader currentpage="User Profile" activepage="CRM" mainpage="User Profile" />
        <div className="text-center py-8">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading user profile...</p>
        </div>
      </Fragment>
    );
  }

  if (error || !user) {
    return (
      <Fragment>
        <Seo title="User Profile" />
        <Pageheader currentpage="User Profile" activepage="CRM" mainpage="User Profile" />
        <div className="alert alert-danger">{error || 'User not found'}</div>
        <Link href="/apps/crm/users" className="ti-btn ti-btn-primary">
          <i className="ri-arrow-left-line me-1"></i>Back to Users
        </Link>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Seo title={`${user.name} - Profile`} />
      <Pageheader currentpage={user.name} activepage="CRM" mainpage="User Profile" />

      <div className="grid grid-cols-12 gap-x-6">
        {/* Left Sidebar - Profile Info */}
        <div className="xxl:col-span-4 xl:col-span-12 col-span-12">
          <div className="box overflow-hidden">
            <div className="box-body !p-0">
              <div className="sm:flex items-start p-6 main-profile-cover">
                <div>
                  {user.profileImage ? (
                    <span className="avatar avatar-xxl avatar-rounded online me-4">
                      <img src={user.profileImage} alt={user.name} />
                    </span>
                  ) : (
                    <span className="avatar avatar-xxl avatar-rounded online me-4 bg-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-grow main-profile-info">
                  <div className="flex items-center !justify-between">
                    <h6 className="font-semibold mb-1 text-white text-[1rem]">{user.name}</h6>
                    <div className="flex gap-2">
                      <button type="button" className="ti-btn ti-btn-light !font-medium !gap-0">
                        <i className="ri-edit-line me-1 align-middle inline-block"></i>Edit
                      </button>
                      <Link href="/apps/crm/users" className="ti-btn ti-btn-outline-light !font-medium !gap-0">
                        <i className="ri-arrow-left-line me-1 align-middle inline-block"></i>Back
                      </Link>
                    </div>
                  </div>
                  <p className="mb-1 !text-white opacity-[0.7]">{user.userCategory || 'User'}</p>
                  <p className="text-[0.75rem] text-white mb-6 opacity-[0.5]">
                    <span className="me-4 inline-flex">
                      <i className="ri-mail-line me-1 align-middle"></i>{user.email}
                    </span>
                    {user.mobile && (
                      <span className="inline-flex">
                        <i className="ri-phone-line me-1 align-middle"></i>{user.mobile}
                      </span>
                    )}
                  </p>
                  
                  {/* Health Stats */}
                  <div className="flex mb-0">
                    <div className="me-6">
                      <p className="font-bold text-[1.25rem] text-white text-shadow mb-0">
                        {trackerData?.weight?.currentWeight ? 
                          `${trackerData.weight.currentWeight.value} ${trackerData.weight.currentWeight.unit}` : 
                          user.weight || '-'
                        }
                      </p>
                      <p className="mb-0 text-[.6875rem] opacity-[0.5] text-white">Weight</p>
                    </div>
                    <div className="me-6">
                      <p className="font-bold text-[1.25rem] text-white text-shadow mb-0">
                        {todayWater?.totalIntake || 0}ml
                      </p>
                      <p className="mb-0 text-[.6875rem] opacity-[0.5] text-white">Water Today</p>
                    </div>
                    <div className="me-6">
                      <p className="font-bold text-[1.25rem] text-white text-shadow mb-0">
                        {getMoodEmoji(trackerData?.mood?.mood)}
                      </p>
                      <p className="mb-0 text-[.6875rem] opacity-[0.5] text-white">Latest Mood</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="p-6 border-b border-dashed dark:border-defaultborder/10">
                <div className="mb-6">
                  <p className="text-[.9375rem] mb-2 font-semibold">About</p>
                  <p className="text-[0.75rem] text-[#8c9097] dark:text-white/50 opacity-[0.7] mb-0">
                    {user.description || user.AboutMe || 'No description available.'}
                  </p>
                </div>
                
                {/* Health Goals */}
                {user.goal && user.goal.length > 0 && (
                  <div className="mb-0">
                    <p className="text-[.9375rem] mb-2 font-semibold">Health Goals</p>
                    <div className="flex flex-wrap gap-1">
                      {user.goal.map((goal, idx) => (
                        <span key={idx} className="badge bg-primary/10 text-primary m-1">{goal}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="p-6 border-b border-dashed dark:border-defaultborder/10">
                <p className="text-[.9375rem] mb-2 me-6 font-semibold">Contact Information</p>
                <div className="text-[#8c9097] dark:text-white/50">
                  <p className="mb-2">
                    <span className="avatar avatar-sm avatar-rounded me-2 bg-light text-[#8c9097] dark:text-white/50">
                      <i className="ri-mail-line align-middle text-[.875rem]"></i>
                    </span>
                    {user.email}
                  </p>
                  {user.mobile && (
                    <p className="mb-2">
                      <span className="avatar avatar-sm avatar-rounded me-2 bg-light text-[#8c9097] dark:text-white/50">
                        <i className="ri-phone-line align-middle text-[.875rem]"></i>
                      </span>
                      {user.mobile}
                    </p>
                  )}
                  {(user.Address || user.city) && (
                    <p className="mb-0">
                      <span className="avatar avatar-sm avatar-rounded me-2 bg-light text-[#8c9097] dark:text-white/50">
                        <i className="ri-map-pin-line align-middle text-[.875rem]"></i>
                      </span>
                      {[user.Address, user.city, user.pincode].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Focus Areas */}
              {user.focusarea && user.focusarea.length > 0 && (
                <div className="p-6">
                  <p className="text-[.9375rem] mb-2 me-6 font-semibold">Focus Areas</p>
                  <div>
                    {user.focusarea.map((area, idx) => (
                      <Link href="#!" scroll={false} key={idx}>
                        <span className="badge bg-light text-[#8c9097] dark:text-white/50 m-1">{area}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="xxl:col-span-8 xl:col-span-12 col-span-12">
          <div className="grid grid-cols-12 gap-x-6">
            <div className="xl:col-span-12 col-span-12">
              <div className="box">
                <div className="box-body !p-0">
                  <div className="!p-4 border-b dark:border-defaultborder/10 border-dashed md:flex items-center justify-between">
                    <nav className="-mb-0.5 sm:flex md:space-x-4 rtl:space-x-reverse pb-2" role='tablist'>
                      <button 
                        className={`w-full sm:w-auto flex ${activeTab === 'overview' ? 'active hs-tab-active:font-semibold hs-tab-active:text-white hs-tab-active:bg-primary' : ''} rounded-md py-2 px-4 text-primary text-sm`}
                        onClick={() => setActiveTab('overview')}
                      >
                        <i className="ri-dashboard-line align-middle inline-block me-1"></i>Overview
                      </button>
                      <button 
                        className={`w-full sm:w-auto flex ${activeTab === 'health' ? 'active hs-tab-active:font-semibold hs-tab-active:text-white hs-tab-active:bg-primary' : ''} rounded-md py-2 px-4 text-primary text-sm`}
                        onClick={() => setActiveTab('health')}
                      >
                        <i className="ri-heart-line me-1 align-middle inline-block"></i>Health
                      </button>
                      <button 
                        className={`w-full sm:w-auto flex ${activeTab === 'mood' ? 'active hs-tab-active:font-semibold hs-tab-active:text-white hs-tab-active:bg-primary' : ''} rounded-md py-2 px-4 text-primary text-sm`}
                        onClick={() => setActiveTab('mood')}
                      >
                        <i className="ri-emotion-line me-1 align-middle inline-block"></i>Mood
                      </button>
                      <button 
                        className={`w-full sm:w-auto flex ${activeTab === 'period' ? 'active hs-tab-active:font-semibold hs-tab-active:text-white hs-tab-active:bg-primary' : ''} rounded-md py-2 px-4 text-primary text-sm`}
                        onClick={() => setActiveTab('period')}
                      >
                        <i className="ri-calendar-line me-1 align-middle inline-block"></i>Period
                      </button>
                    </nav>
                  </div>

                  <div className="!p-4">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                      <div className="grid grid-cols-12 gap-4">
                        {/* Health Summary */}
                        <div className="xl:col-span-6 col-span-12">
                          <div className="box">
                            <div className="box-header">
                              <h5 className="box-title">Health Summary</h5>
                            </div>
                            <div className="box-body">
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-muted">Current Weight</span>
                                  <span className="font-semibold">
                                    {trackerData?.weight?.currentWeight ? 
                                      `${trackerData.weight.currentWeight.value} ${trackerData.weight.currentWeight.unit}` : 
                                      'Not tracked'
                                    }
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-muted">Water Today</span>
                                  <span className="font-semibold">
                                    {todayWater?.totalIntake || 0}ml / {todayWater?.targetMl || 2000}ml
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-muted">Hydration Status</span>
                                  <span className={`font-semibold ${getHydrationColor(hydrationStatus?.status)}`}>
                                    {hydrationStatus?.status || 'Not tracked'}
                                  </span>
                                </div>
                                {hydrationStatus && (
                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="text-muted">Progress</span>
                                      <span className="font-medium">{Math.round(hydrationStatus.percentage)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full ${getHydrationBgColor(hydrationStatus.status)}`}
                                        style={{ width: `${Math.min(hydrationStatus.percentage, 100)}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Mood Summary */}
                        <div className="xl:col-span-6 col-span-12">
                          <div className="box">
                            <div className="box-header">
                              <h5 className="box-title">Mood Summary</h5>
                            </div>
                            <div className="box-body">
                              {trackerData?.mood ? (
                                <div className="space-y-3">
                                  <div className="text-center">
                                    <div className="text-4xl mb-2">
                                      {getMoodEmoji(trackerData.mood.mood)}
                                    </div>
                                    <p className="font-semibold capitalize">
                                      {trackerData.mood.mood?.replace(/_/g, ' ') || 'Unknown'}
                                    </p>
                                    <p className="text-muted text-sm">
                                      {trackerData.mood.createdAt ? 
                                        new Date(trackerData.mood.createdAt).toLocaleDateString() : 
                                        'Recent'
                                      }
                                    </p>
                                  </div>
                                  {trackerData.mood.comments && (
                                    <p className="text-center text-muted text-sm italic">
                                      "{trackerData.mood.comments}"
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center text-muted py-4">
                                  <p>No mood entries yet</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Water Intake Timeline */}
                        {todayWater && todayWater.intakeTimeline && todayWater.intakeTimeline.length > 0 && (
                          <div className="xl:col-span-12 col-span-12">
                            <div className="box">
                              <div className="box-header">
                                <h5 className="box-title">Today's Water Intake Timeline</h5>
                              </div>
                              <div className="box-body">
                                <div className="space-y-2">
                                  {todayWater.intakeTimeline.map((intake, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 border rounded">
                                      <div className="flex items-center">
                                        <i className="ri-drop-line text-info me-2"></i>
                                        <span className="font-medium">{intake.amountMl}ml</span>
                                      </div>
                                      <span className="text-sm text-muted">{intake.time}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Health Tab */}
                    {activeTab === 'health' && (
                      <div className="grid grid-cols-12 gap-4">
                        {/* Weight Tracking */}
                        <div className="xl:col-span-6 col-span-12">
                          <div className="box">
                            <div className="box-header">
                              <h5 className="box-title">Weight Tracking</h5>
                            </div>
                            <div className="box-body">
                              {trackerData?.weight ? (
                                <div className="text-center">
                                  <p className="text-3xl font-bold text-primary mb-2">
                                    {trackerData.weight.currentWeight?.value || '-'} {trackerData.weight.currentWeight?.unit || 'kg'}
                                  </p>
                                  <p className="text-muted">Current Weight</p>
                                  {trackerData.weight.measurementDate && (
                                    <p className="text-sm text-muted mt-2">
                                      Last updated: {new Date(trackerData.weight.measurementDate).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-muted text-center">No weight data available</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Water Tracking */}
                        <div className="xl:col-span-6 col-span-12">
                          <div className="box">
                            <div className="box-header">
                              <h5 className="box-title">Water Intake Today</h5>
                            </div>
                            <div className="box-body">
                              <div className="text-center">
                                <p className="text-3xl font-bold text-info mb-2">
                                  {todayWater?.totalIntake || 0}ml
                                </p>
                                <p className="text-muted">
                                  Goal: {todayWater?.targetMl || 2000}ml 
                                  ({todayWater?.targetGlasses || 8} glasses)
                                </p>
                              </div>

                              {hydrationStatus && (
                                <div className="mt-4">
                                  <div className="flex justify-between text-sm mb-2">
                                    <span>Hydration Level</span>
                                    <span className={`font-medium ${getHydrationColor(hydrationStatus.status)}`}>
                                      {hydrationStatus.status} ({Math.round(hydrationStatus.percentage)}%)
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                      className={`h-2.5 rounded-full ${getHydrationBgColor(hydrationStatus.status)}`}
                                      style={{ width: `${Math.min(hydrationStatus.percentage, 100)}%` }}
                                    ></div>
                                  </div>
                                  <div className="mt-3 text-sm text-muted">
                                    <p>Remaining: {hydrationStatus.remainingMl}ml ({hydrationStatus.remainingGlasses} glasses)</p>
                                  </div>
                                </div>
                              )}

                              {todayWater?.intakeTimeline && todayWater.intakeTimeline.length > 0 && (
                                <div className="mt-4">
                                  <h6 className="text-sm font-semibold mb-2">Recent Intakes</h6>
                                  <div className="space-y-1">
                                    {todayWater.intakeTimeline.slice(-5).reverse().map((intake, idx) => (
                                      <div key={idx} className="flex justify-between text-xs">
                                        <span>{intake.time}</span>
                                        <span className="font-medium">{intake.amountMl}ml</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Weekly Summary */}
                        {todayWater && (
                          <div className="xl:col-span-12 col-span-12">
                            <div className="box">
                              <div className="box-header">
                                <h5 className="box-title">Water Tracking Stats</h5>
                              </div>
                              <div className="box-body">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                  <div>
                                    <p className="text-2xl font-bold text-primary">
                                      {todayWater.dailyAverage || 0}ml
                                    </p>
                                    <p className="text-sm text-muted">Daily Average</p>
                                  </div>
                                  <div>
                                    <p className="text-2xl font-bold text-success">
                                      {todayWater.bestDay || 0}ml
                                    </p>
                                    <p className="text-sm text-muted">Best Day</p>
                                  </div>
                                  <div>
                                    <p className="text-2xl font-bold text-warning">
                                      {todayWater.streak || 0}
                                    </p>
                                    <p className="text-sm text-muted">Day Streak</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mood Tab */}
                    {activeTab === 'mood' && (
                      <div className="box">
                        <div className="box-header">
                          <h5 className="box-title">Latest Mood</h5>
                        </div>
                        <div className="box-body">
                          {trackerData?.mood ? (
                            <div className="text-center">
                              <div className="text-4xl mb-2">
                                {getMoodEmoji(trackerData.mood.mood)}
                              </div>
                              <p className="font-semibold capitalize">
                                {trackerData.mood.mood?.replace(/_/g, ' ')}
                              </p>
                              {trackerData.mood.comments && (
                                <p className="text-muted italic mt-2">
                                  "{trackerData.mood.comments}"
                                </p>
                              )}
                              {trackerData.mood.createdAt && (
                                <p className="text-sm text-muted mt-2">
                                  Logged on {new Date(trackerData.mood.createdAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-muted text-center">No mood data available</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Period Tab */}
                    {activeTab === 'period' && (
                      <div>
                        <div className="text-center py-8">
                          <div className="text-4xl mb-4">📅</div>
                          <p className="text-muted">
                            Period tracking admin endpoints coming soon!
                          </p>
                          <p className="text-sm text-muted mt-2">
                            Backend admin-period.controller.js needs to be created
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default UserProfile;