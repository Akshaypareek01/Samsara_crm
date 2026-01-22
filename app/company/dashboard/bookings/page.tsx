"use client";
import React, { useState } from 'react';
import CompanyBookingsList from '../components/CompanyBookingsList';

const BookingsPage: React.FC = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <div className="grid grid-cols-12 gap-6">
            <div className="xl:col-span-12 col-span-12">
                <CompanyBookingsList refreshTrigger={refreshTrigger} />
            </div>
        </div>
    );
};

export default BookingsPage;
