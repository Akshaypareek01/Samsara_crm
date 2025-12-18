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
  const limit = 10;

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [currentPage, filterStatus]);

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

      const response = await transactionService.getTransactions(params);
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
      const statsData = await transactionService.getTransactionStats();
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-12 gap-x-6 mb-6">
          <div className="xl:col-span-3 lg:col-span-6 col-span-12">
            <div className="box">
              <div className="box-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h6 className="font-semibold mb-2 text-[1rem]">
                      Total Revenue
                    </h6>
                    <span className="text-[1.5rem] font-semibold text-success">
                      {transactionService.formatCurrency(stats.totalRevenue)}
                    </span>
                  </div>
                  <div>
                    <span className="avatar avatar-md bg-success text-white">
                      <i className="ri-money-dollar-circle-line"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="xl:col-span-3 lg:col-span-6 col-span-12">
            <div className="box">
              <div className="box-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h6 className="font-semibold mb-2 text-[1rem]">
                      Completed
                    </h6>
                    <span className="text-[1.5rem] font-semibold">
                      {stats.completed}
                    </span>
                  </div>
                  <div>
                    <span className="avatar avatar-md bg-primary text-white">
                      <i className="ri-check-line"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="xl:col-span-3 lg:col-span-6 col-span-12">
            <div className="box">
              <div className="box-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h6 className="font-semibold mb-2 text-[1rem]">Pending</h6>
                    <span className="text-[1.5rem] font-semibold text-warning">
                      {stats.pending}
                    </span>
                  </div>
                  <div>
                    <span className="avatar avatar-md bg-warning text-white">
                      <i className="ri-time-line"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="xl:col-span-3 lg:col-span-6 col-span-12">
            <div className="box">
              <div className="box-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h6 className="font-semibold mb-2 text-[1rem]">Failed</h6>
                    <span className="text-[1.5rem] font-semibold text-danger">
                      {stats.failed}
                    </span>
                  </div>
                  <div>
                    <span className="avatar avatar-md bg-danger text-white">
                      <i className="ri-close-line"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-x-6">
        <div className="xl:col-span-12 col-span-12">
          <div className="box">
            <div className="box-header">
              <div className="box-title">All Transactions</div>
              <div className="flex flex-wrap gap-2 items-center">
                <select
                  className="ti-form-control form-control-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            <div className="box-body">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No transactions found.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover whitespace-nowrap table-bordered min-w-full">
                    <thead>
                      <tr>
                        <th scope="col" className="text-start">
                          Transaction ID
                        </th>
                        <th scope="col" className="text-start">
                          Plan
                        </th>
                        <th scope="col" className="text-start">
                          Amount
                        </th>
                        <th scope="col" className="text-start">
                          Discount
                        </th>
                        <th scope="col" className="text-start">
                          Final Amount
                        </th>
                        <th scope="col" className="text-start">
                          Status
                        </th>
                        <th scope="col" className="text-start">
                          Date
                        </th>
                        <th scope="col" className="text-start">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr
                          key={transaction._id}
                          className="border-t border-inherit border-solid hover:bg-gray-100 dark:hover:bg-light dark:border-defaultborder/10"
                        >
                          <td>
                            <span className="font-semibold text-primary text-[0.75rem]">
                              {transaction.transactionId}
                            </span>
                          </td>
                          <td>
                            <span className="font-semibold">
                              {transaction.planName}
                            </span>
                          </td>
                          <td>
                            {transactionService.formatCurrency(
                              transaction.originalAmount,
                              transaction.currency
                            )}
                          </td>
                          <td>
                            {transaction.discountAmount &&
                            transaction.discountAmount > 0 ? (
                              <span className="text-success">
                                -
                                {transactionService.formatCurrency(
                                  transaction.discountAmount,
                                  transaction.currency
                                )}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <span className="font-semibold">
                              {transactionService.formatCurrency(
                                transaction.amount,
                                transaction.currency
                              )}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${getStatusBadgeClass(
                                transaction.status
                              )}`}
                            >
                              {transaction.status}
                            </span>
                          </td>
                          <td className="text-[0.75rem]">
                            {formatDate(transaction.createdAt!)}
                          </td>
                          <td>
                            <button
                              onClick={() =>
                                setSelectedTransaction(transaction)
                              }
                              className="ti-btn ti-btn-sm ti-btn-info"
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

            <div className="box-footer">
              <div className="sm:flex items-center">
                <div className="dark:text-defaulttextcolor/70">
                  Showing {transactions.length} of {totalTransactions} Entries
                </div>
                <div className="ms-auto">
                  <nav
                    aria-label="Page navigation"
                    className="pagination-style-4"
                  >
                    <ul className="ti-pagination mb-0">
                      <li
                        className={`page-item ${
                          currentPage === 1 ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Prev
                        </button>
                      </li>
                      <li className="page-item">
                        <span className="page-link active">{currentPage}</span>
                      </li>
                      <li
                        className={`page-item ${
                          transactions.length < limit ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link !text-primary"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={transactions.length < limit}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-bodybg rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Transaction Details</h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="ti-btn ti-btn-sm ti-btn-icon ti-btn-danger"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Transaction ID:</label>
                  <p className="text-primary">
                    {selectedTransaction.transactionId}
                  </p>
                </div>
                <div>
                  <label className="font-semibold">Status:</label>
                  <p>
                    <span
                      className={`badge ${getStatusBadgeClass(
                        selectedTransaction.status
                      )}`}
                    >
                      {selectedTransaction.status}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <label className="font-semibold">Plan:</label>
                <p>{selectedTransaction.planName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Original Amount:</label>
                  <p>
                    {transactionService.formatCurrency(
                      selectedTransaction.originalAmount,
                      selectedTransaction.currency
                    )}
                  </p>
                </div>
                <div>
                  <label className="font-semibold">Discount:</label>
                  <p className="text-success">
                    {selectedTransaction.discountAmount
                      ? `-${transactionService.formatCurrency(
                          selectedTransaction.discountAmount,
                          selectedTransaction.currency
                        )}`
                      : "No discount"}
                  </p>
                </div>
              </div>

              <div>
                <label className="font-semibold">Final Amount Paid:</label>
                <p className="text-lg font-semibold text-primary">
                  {transactionService.formatCurrency(
                    selectedTransaction.amount,
                    selectedTransaction.currency
                  )}
                </p>
              </div>

              {selectedTransaction.couponCodeString && (
                <div>
                  <label className="font-semibold">Coupon Code Used:</label>
                  <p className="text-success">
                    {selectedTransaction.couponCodeString}
                  </p>
                </div>
              )}

              {selectedTransaction.razorpayPaymentId && (
                <div>
                  <label className="font-semibold">Payment ID:</label>
                  <p className="text-sm font-mono">
                    {selectedTransaction.razorpayPaymentId}
                  </p>
                </div>
              )}

              {selectedTransaction.razorpayOrderId && (
                <div>
                  <label className="font-semibold">Order ID:</label>
                  <p className="text-sm font-mono">
                    {selectedTransaction.razorpayOrderId}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Created At:</label>
                  <p>{formatDate(selectedTransaction.createdAt!)}</p>
                </div>
                {selectedTransaction.paidAt && (
                  <div>
                    <label className="font-semibold">Paid At:</label>
                    <p>{formatDate(selectedTransaction.paidAt)}</p>
                  </div>
                )}
              </div>

              {selectedTransaction.status === "refunded" &&
                selectedTransaction.refundAmount && (
                  <div className="border-t pt-3">
                    <label className="font-semibold">Refund Amount:</label>
                    <p className="text-lg text-info">
                      {transactionService.formatCurrency(
                        selectedTransaction.refundAmount,
                        selectedTransaction.currency
                      )}
                    </p>
                    {selectedTransaction.refundDate && (
                      <p className="text-sm text-muted">
                        Refunded on:{" "}
                        {formatDate(selectedTransaction.refundDate)}
                      </p>
                    )}
                  </div>
                )}

              {selectedTransaction.errorDetails && (
                <div className="border-t pt-3 bg-danger/10 p-3 rounded">
                  <label className="font-semibold text-danger">
                    Error Details:
                  </label>
                  <p className="text-sm">
                    {selectedTransaction.errorDetails.description}
                  </p>
                  <p className="text-xs text-muted">
                    Code: {selectedTransaction.errorDetails.code}
                  </p>
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
