"use client";
import React from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import type { TrainerChartData } from "@/hooks/useTrainerDashboardStats";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface TrainerAnalyticsChartsProps {
    charts: TrainerChartData;
    loading: boolean;
}

const PRIMARY = "#ed662e";
const STATUS_COLORS = ["#0EA5E9", "#8B5CF6", "#10B981", "#EF4444", "#EAB308", "#94A3B8"];

/**
 * Shared empty-state block shown when a chart has no data yet.
 * @param message - Text to display in the placeholder.
 */
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-[260px] text-center">
        <i className="bx bx-bar-chart-alt-2 text-4xl text-muted/50 mb-2"></i>
        <p className="text-sm text-muted mb-0">{message}</p>
    </div>
);

/**
 * Analytics charts for the trainer dashboard: booking trend, status split, and
 * the most-requested training programs.
 *
 * @param charts - Chart-ready datasets derived from bookings.
 * @param loading - Whether the source data is still loading.
 */
const TrainerAnalyticsCharts: React.FC<TrainerAnalyticsChartsProps> = ({ charts, loading }) => {
    const hasTrend = charts.trendCounts.some((c) => c > 0);
    const hasStatus = charts.statusValues.length > 0;
    const hasTraining = charts.trainingCounts.length > 0;

    const trendOptions: ApexOptions = {
        chart: { type: "area", toolbar: { show: false }, fontFamily: "inherit" },
        colors: [PRIMARY],
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 3 },
        fill: {
            type: "gradient",
            gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] },
        },
        grid: { borderColor: "rgba(148,163,184,0.18)", strokeDashArray: 4 },
        xaxis: { categories: charts.trendLabels, axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { formatter: (v) => `${Math.round(v)}` } },
        tooltip: { y: { formatter: (v) => `${v} booking${v === 1 ? "" : "s"}` } },
    };

    const statusOptions: ApexOptions = {
        chart: { type: "donut", fontFamily: "inherit" },
        labels: charts.statusLabels,
        colors: STATUS_COLORS,
        legend: { position: "bottom", fontSize: "12px" },
        dataLabels: { enabled: true, formatter: (val: number) => `${Math.round(val)}%` },
        plotOptions: {
            pie: {
                donut: {
                    size: "68%",
                    labels: {
                        show: true,
                        total: { show: true, label: "Total", fontSize: "13px", fontWeight: 600 },
                    },
                },
            },
        },
        stroke: { width: 0 },
    };

    const trainingOptions: ApexOptions = {
        chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
        colors: [PRIMARY],
        plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: "55%" } },
        dataLabels: { enabled: false },
        grid: { borderColor: "rgba(148,163,184,0.18)", strokeDashArray: 4 },
        xaxis: { categories: charts.trainingLabels, labels: { formatter: (v) => `${Math.round(Number(v))}` } },
        tooltip: { y: { formatter: (v) => `${v} booking${v === 1 ? "" : "s"}` } },
    };

    return (
        <div className="grid grid-cols-12 gap-6 mb-6">
            {/* Booking trend */}
            <div className="xl:col-span-8 col-span-12">
                <div className="box h-full mb-0">
                    <div className="box-header flex items-center justify-between">
                        <h5 className="box-title">Booking Trend</h5>
                        <span className="text-xs text-muted">Last 6 months</span>
                    </div>
                    <div className="box-body">
                        {loading ? (
                            <EmptyState message="Loading trend…" />
                        ) : hasTrend ? (
                            <ReactApexChart
                                options={trendOptions}
                                series={[{ name: "Bookings", data: charts.trendCounts }]}
                                type="area"
                                height={280}
                            />
                        ) : (
                            <EmptyState message="No bookings in the last 6 months" />
                        )}
                    </div>
                </div>
            </div>

            {/* Status distribution */}
            <div className="xl:col-span-4 col-span-12">
                <div className="box h-full mb-0">
                    <div className="box-header">
                        <h5 className="box-title">Status Breakdown</h5>
                    </div>
                    <div className="box-body">
                        {loading ? (
                            <EmptyState message="Loading…" />
                        ) : hasStatus ? (
                            <ReactApexChart
                                options={statusOptions}
                                series={charts.statusValues}
                                type="donut"
                                height={300}
                            />
                        ) : (
                            <EmptyState message="No bookings yet" />
                        )}
                    </div>
                </div>
            </div>

            {/* Top training programs */}
            <div className="col-span-12">
                <div className="box mb-0">
                    <div className="box-header">
                        <h5 className="box-title">Most Requested Training Programs</h5>
                    </div>
                    <div className="box-body">
                        {loading ? (
                            <EmptyState message="Loading…" />
                        ) : hasTraining ? (
                            <ReactApexChart
                                options={trainingOptions}
                                series={[{ name: "Bookings", data: charts.trainingCounts }]}
                                type="bar"
                                height={Math.max(220, charts.trainingLabels.length * 56)}
                            />
                        ) : (
                            <EmptyState message="No training programs booked yet" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerAnalyticsCharts;
