"use client";
import React from 'react';
import TrainerBookingsList from '../components/TrainerBookingsList';

const BookingsPage: React.FC = () => {
    return (
        <div className="grid grid-cols-12 gap-6">
            <div className="xl:col-span-12 col-span-12">
                <TrainerBookingsList />
            </div>
        </div>
    );
};

export default BookingsPage;
