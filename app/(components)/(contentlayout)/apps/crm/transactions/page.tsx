"use client";
import Pageheader from "@/shared/layout-components/page-header/pageheader";
import Seo from "@/shared/layout-components/seo/seo";
import React, { Fragment, useState, useEffect } from "react";
import transactionService, { Transaction } from "@/services/transactionService";

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const limit = 10;

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filterStatus]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: limit,
      };

      if (filterStatus !== "all") {
        params.status = filterStatus;
      }

      console.log("🔍 Fetching transactions with params:", params);
      const response = await transactionService.getTransactions(params);
      console.log("✅ Transactions response:", response);
      console.log("📊 Transactions data:", response.data);

      setTransactions(response.data);
      setTotalTransactions(response.total);
    } catch (error) {
      console.error("❌ Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      console.log("📊 Fetching stats...");
      const statsData = await transactionService.getTransactionStats();
      console.log("✅ Stats received:", statsData);
      setStats(statsData);
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      // Set default stats on error
      setStats({
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0,
        refunded: 0,
        totalRevenue: 0,
        totalRefunds: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: { [key: string]: string } = {
      completed: "bg-success/10 text-success",
      pending: "bg-warning/10 text-warning",
      failed: "bg-danger/10 text-danger",
      cancelled: "bg-secondary/10 text-secondary",
      refunded: "bg-info/10 text-info",
    };
    return classes[status] || "bg-secondary/10 text-secondary";
  };

  return (
    <Fragment>
      <Seo title="Transactions" />
      <Pageheader
        currentpage="Transactions"
        activepage="Membership Management"
        mainpage="Transactions"
      />

      {/* Enhanced Stats Cards with Loading State */}
      <div className="grid grid-cols-12 gap-x-6 mb-6">
        {statsLoading ? (
          // Loading skeleton
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="xl:col-span-3 lg:col-span-6 col-span-12">
                <div className="box animate-pulse">
                  <div className="box-body">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : stats ? (
          <>
            <div className="xl:col-span-3 lg:col-span-6 col-span-12">
              <div className="box overflow-hidden">
                <div className="box-body">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="avatar avatar-sm bg-success/10 !text-success">
                          <i className="ri-money-dollar-circle-line text-[1rem]"></i>
                        </span>
                        <h6 className="font-semibold text-[0.875rem] text-gray-500 dark:text-white/70">
                          Total Revenue
                        </h6>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-[1.75rem] font-bold text-gray-900 dark:text-white leading-none">
                          {transactionService.formatCurrency(stats.totalRevenue)}
                        </span>
                      </div>
                      <div className="text-[0.75rem] text-gray-500 mt-1">
                        From {stats.completed} completed transactions
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:col-span-3 lg:col-span-6 col-span-12">
              <div className="box overflow-hidden">
                <div className="box-body">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="avatar avatar-sm bg-primary/10 !text-primary">
                          <i className="ri-check-double-line text-[1rem]"></i>
                        </span>
                        <h6 className="font-semibold text-[0.875rem] text-gray-500 dark:text-white/70">
                          Completed
                        </h6>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-[1.75rem] font-bold text-primary leading-none">
                          {stats.completed}
                        </span>
                        <span className="text-[0.75rem] text-gray-500 mb-1">
                          / {stats.total} total
                        </span>
                      </div>
                      <div className="text-[0.75rem] text-gray-500 mt-1">
                        {stats.total > 0
                          ? `${((stats.completed / stats.total) * 100).toFixed(1)}% success rate`
                          : "No data"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:col-span-3 lg:col-span-6 col-span-12">
              <div className="box overflow-hidden">
                <div className="box-body">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="avatar avatar-sm bg-warning/10 !text-warning">
                          <i className="ri-time-line text-[1rem]"></i>
                        </span>
                        <h6 className="font-semibold text-[0.875rem] text-gray-500 dark:text-white/70">
                          Pending
                        </h6>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-[1.75rem] font-bold text-warning leading-none">
                          {stats.pending}
                        </span>
                      </div>
                      <div className="text-[0.75rem] text-gray-500 mt-1">
                        Awaiting confirmation
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:col-span-3 lg:col-span-6 col-span-12">
              <div className="box overflow-hidden">
                <div className="box-body">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="avatar avatar-sm bg-danger/10 !text-danger">
                          <i className="ri-close-circle-line text-[1rem]"></i>
                        </span>
                        <h6 className="font-semibold text-[0.875rem] text-gray-500 dark:text-white/70">
                          Failed
                        </h6>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-[1.75rem] font-bold text-danger leading-none">
                          {stats.failed}
                        </span>
                      </div>
                      <div className="text-[0.75rem] text-gray-500 mt-1">
                        Need attention
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Enhanced Transactions Table */}
      <div className="grid grid-cols-12 gap-x-6">
        <div className="xl:col-span-12 col-span-12">
          <div className="box">
            <div className="box-header flex items-center justify-between flex-wrap gap-4">
              <div className="box-title">All Transactions</div>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 dark:text-white/70">
                    Filter:
                  </label>
                  <select
                    className="ti-form-select !py-2 !px-3 !text-sm rounded-md"
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1); // Reset to first page on filter change
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <button
                  onClick={fetchTransactions}
                  className="ti-btn ti-btn-primary-full !py-2 !px-3 !text-sm"
                  disabled={loading}
                >
                  <i className="ri-refresh-line"></i>
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            <div className="box-body">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  <p className="mt-3 text-gray-500">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <i className="ri-file-list-3-line text-3xl text-gray-400"></i>
                  </div>
                  <h6 className="font-semibold text-gray-700 dark:text-white mb-2">
                    No transactions found
                  </h6>
                  <p className="text-gray-500 text-sm">
                    {filterStatus !== "all"
                      ? `No ${filterStatus} transactions available.`
                      : "There are no transactions to display."}
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover whitespace-nowrap min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-white/10">
                        <th scope="col" className="text-start !py-3">
                          Transaction ID
                        </th>
                        <th scope="col" className="text-start !py-3">
                          Plan
                        </th>
                        <th scope="col" className="text-start !py-3">
                          Amount
                        </th>
                        <th scope="col" className="text-start !py-3">
                          Discount
                        </th>
                        <th scope="col" className="text-start !py-3">
                          Final Amount
                        </th>
                        <th scope="col" className="text-start !py-3">
                          Status
                        </th>
                        <th scope="col" className="text-start !py-3">
                          Date
                        </th>
                        <th scope="col" className="text-start !py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr
                          key={transaction._id}
                          className="border-t border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <td className="!py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[0.75rem] font-semibold text-primary">
                                {transaction.transactionId}
                              </span>
                            </div>
                          </td>
                          <td className="!py-3">
                            <span className="font-semibold text-gray-800 dark:text-white">
                              {transaction.planName}
                            </span>
                          </td>
                          <td className="!py-3">
                            <span className="text-gray-600 dark:text-white/70">
                              {transactionService.formatCurrency(
                                transaction.originalAmount,
                                transaction.currency
                              )}
                            </span>
                          </td>
                          <td className="!py-3">
                            {transaction.discountAmount &&
                            transaction.discountAmount > 0 ? (
                              <span className="text-success font-medium">
                                -
                                {transactionService.formatCurrency(
                                  transaction.discountAmount,
                                  transaction.currency
                                )}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="!py-3">
                            <span className="font-bold text-gray-900 dark:text-white">
                              {transactionService.formatCurrency(
                                transaction.amount,
                                transaction.currency
                              )}
                            </span>
                          </td>
                          <td className="!py-3">
                            <span
                              className={`badge ${getStatusBadgeClass(
                                transaction.status
                              )} !text-[0.75rem] !px-3 !py-1`}
                            >
                              {transaction.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="!py-3 text-[0.75rem] text-gray-600 dark:text-white/70">
                            {formatDate(transaction.createdAt!)}
                          </td>
                          <td className="!py-3">
                            <button
                              onClick={() =>
                                setSelectedTransaction(transaction)
                              }
                              className="ti-btn ti-btn-sm ti-btn-info-full !px-3 !py-1"
                              title="View Details"
                            >
                              <i className="ri-eye-line"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Enhanced Footer with Better Pagination */}
            {!loading && transactions.length > 0 && (
              <div className="box-footer border-t border-gray-200 dark:border-white/10">
                <div className="sm:flex items-center justify-between">
                  <div className="text-gray-600 dark:text-white/70 text-sm">
                    Showing <span className="font-semibold">{transactions.length}</span> of{" "}
                    <span className="font-semibold">{totalTransactions}</span> Entries
                    {filterStatus !== "all" && (
                      <span className="ml-1 text-gray-500">
                        (filtered by {filterStatus})
                      </span>
                    )}
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <nav
                      aria-label="Page navigation"
                      className="pagination-style-4"
                    >
                      <ul className="ti-pagination mb-0 flex items-center gap-1">
                        <li
                          className={`page-item ${
                            currentPage === 1 ? "disabled opacity-50" : ""
                          }`}
                        >
                          <button
                            className="page-link !px-3 !py-2 rounded"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <i className="ri-arrow-left-s-line"></i>
                            Prev
                          </button>
                        </li>
                        <li className="page-item">
                          <span className="page-link active !px-4 !py-2">
                            {currentPage}
                          </span>
                        </li>
                        <li
                          className={`page-item ${
                            transactions.length < limit
                              ? "disabled opacity-50"
                              : ""
                          }`}
                        >
                          <button
                            className="page-link !text-primary !px-3 !py-2 rounded"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={transactions.length < limit}
                          >
                            Next
                            <i className="ri-arrow-right-s-line"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-bodybg rounded-xl shadow-2xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-white/10">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Transaction Details
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Complete transaction information
                </p>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="ti-btn ti-btn-sm ti-btn-icon ti-btn-danger-full rounded-full"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            <div className="space-y-5">
              {/* Status Badge */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-white/5">
                <span className="text-sm font-medium text-gray-600 dark:text-white/70">
                  Status
                </span>
                <span
                  className={`badge ${getStatusBadgeClass(
                    selectedTransaction.status
                  )} !text-sm !px-4 !py-2`}
                >
                  {selectedTransaction.status.toUpperCase()}
                </span>
              </div>

              {/* Transaction IDs */}
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-lg border border-gray-200 dark:border-white/10">
                  <label className="text-sm font-medium text-gray-500 dark:text-white/50 block mb-1">
                    Transaction ID
                  </label>
                  <p className="font-mono text-sm font-semibold text-primary">
                    {selectedTransaction.transactionId}
                  </p>
                </div>
              </div>

              {/* Plan Info */}
              <div className="p-4 rounded-lg border border-gray-200 dark:border-white/10">
                <label className="text-sm font-medium text-gray-500 dark:text-white/50 block mb-1">
                  Membership Plan
                </label>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedTransaction.planName}
                </p>
              </div>

              {/* Amount Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                  <label className="text-sm font-medium text-blue-600 dark:text-blue-400 block mb-1">
                    Original Amount
                  </label>
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                    {transactionService.formatCurrency(
                      selectedTransaction.originalAmount,
                      selectedTransaction.currency
                    )}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-500/10">
                  <label className="text-sm font-medium text-green-600 dark:text-green-400 block mb-1">
                    Discount Applied
                  </label>
                  <p className="text-xl font-bold text-green-700 dark:text-green-300">
                    {selectedTransaction.discountAmount
                      ? `-${transactionService.formatCurrency(
                          selectedTransaction.discountAmount,
                          selectedTransaction.currency
                        )}`
                      : "No discount"}
                  </p>
                </div>
              </div>

              {/* Final Amount */}
              <div className="p-5 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
                <label className="text-sm font-medium text-primary block mb-1">
                  Final Amount Paid
                </label>
                <p className="text-3xl font-bold text-primary">
                  {transactionService.formatCurrency(
                    selectedTransaction.amount,
                    selectedTransaction.currency
                  )}
                </p>
              </div>

              {/* Coupon Code */}
              {selectedTransaction.couponCodeString && (
                <div className="p-4 rounded-lg border-2 border-dashed border-success">
                  <label className="text-sm font-medium text-gray-500 dark:text-white/50 block mb-1">
                    Coupon Code Used
                  </label>
                  <p className="text-lg font-bold text-success">
                    {selectedTransaction.couponCodeString}
                  </p>
                </div>
              )}

              {/* Payment IDs */}
              {(selectedTransaction.razorpayPaymentId ||
                selectedTransaction.razorpayOrderId) && (
                <div className="grid grid-cols-1 gap-4">
                  {selectedTransaction.razorpayPaymentId && (
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-white/5">
                      <label className="text-sm font-medium text-gray-500 dark:text-white/50 block mb-1">
                        Payment ID
                      </label>
                      <p className="font-mono text-xs text-gray-700 dark:text-white/70 break-all">
                        {selectedTransaction.razorpayPaymentId}
                      </p>
                    </div>
                  )}
                  {selectedTransaction.razorpayOrderId && (
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-white/5">
                      <label className="text-sm font-medium text-gray-500 dark:text-white/50 block mb-1">
                        Order ID
                      </label>
                      <p className="font-mono text-xs text-gray-700 dark:text-white/70 break-all">
                        {selectedTransaction.razorpayOrderId}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-white/5">
                  <label className="text-sm font-medium text-gray-500 dark:text-white/50 block mb-1">
                    Created At
                  </label>
                  <p className="text-sm font-medium text-gray-700 dark:text-white/70">
                    {formatDate(selectedTransaction.createdAt!)}
                  </p>
                </div>
                {selectedTransaction.paidAt && (
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-white/5">
                    <label className="text-sm font-medium text-gray-500 dark:text-white/50 block mb-1">
                      Paid At
                    </label>
                    <p className="text-sm font-medium text-gray-700 dark:text-white/70">
                      {formatDate(selectedTransaction.paidAt)}
                    </p>
                  </div>
                )}
              </div>

              {/* Refund Info */}
              {selectedTransaction.status === "refunded" &&
                selectedTransaction.refundAmount && (
                  <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                    <div className="p-4 rounded-lg bg-info/10">
                      <label className="text-sm font-medium text-info block mb-1">
                        Refund Amount
                      </label>
                      <p className="text-2xl font-bold text-info">
                        {transactionService.formatCurrency(
                          selectedTransaction.refundAmount,
                          selectedTransaction.currency
                        )}
                      </p>
                      {selectedTransaction.refundDate && (
                        <p className="text-sm text-gray-600 dark:text-white/60 mt-2">
                          Refunded on:{" "}
                          {formatDate(selectedTransaction.refundDate)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

              {/* Error Details */}
              {selectedTransaction.errorDetails && (
                <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                  <div className="p-4 rounded-lg bg-danger/10 border border-danger/20">
                    <div className="flex items-start gap-3">
                      <i className="ri-error-warning-line text-danger text-xl mt-1"></i>
                      <div className="flex-1">
                        <label className="text-sm font-bold text-danger block mb-2">
                          Error Details
                        </label>
                        <p className="text-sm text-gray-700 dark:text-white/70 mb-1">
                          {selectedTransaction.errorDetails.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-white/50">
                          Code: {selectedTransaction.errorDetails.code}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default TransactionsPage;