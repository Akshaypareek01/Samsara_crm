"use client";
import React from 'react';
import { getStatusColor } from '../utils/bookingUtils';

interface StatusBadgeProps {
    status: 'pending_approval' | 'approved' | 'confirmed' | 'completed' | 'rejected' | 'cancelled';
    className?: string;
    showIcon?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', showIcon = true }) => {
    const config = getStatusColor(status);

    return (
        <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${className}`}
            style={{
                backgroundColor: config.bg,
                color: config.text,
            }}
        >
            {showIcon && config.icon && <span>{config.icon}</span>}
            <span>{config.label}</span>
        </span>
    );
};

export default StatusBadge;
