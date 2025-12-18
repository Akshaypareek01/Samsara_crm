import ApiService from './ApiService';

export interface Transaction {
  _id?: string;
  id?: string;
  userId: string;
  membershipId?: string;
  transactionId: string;
  orderId: string;
  amount: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod?: string;
  couponCode?: string;
  couponCodeString?: string;
  discountAmount?: number;
  originalAmount: number;
  planId: string;
  planName: string;
  metadata?: any;
  errorDetails?: {
    code: string;
    description: string;
    source: string;
    step: string;
  };
  refundAmount?: number;
  refundId?: string;
  refundStatus?: 'none' | 'requested' | 'processed' | 'failed';
  refundDate?: string;
  paidAt?: string;
  failedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetTransactionsParams {
  sortBy?: string;
  limit?: number;
  page?: number;
  status?: string;
}

export interface TransactionsResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class TransactionService {
  /**
   * Get all transactions - try both endpoints
   */
  async getTransactions(params: GetTransactionsParams = {}): Promise<TransactionsResponse> {
    try {
      // Try the /payment/transactions endpoint first
      let response;
      try {
        response = await ApiService.get('/payments/transactions', params);
      } catch (error: any) {
        // If 404, the route might not be registered, return empty data
        if (error.message?.includes('404') || error.message?.includes('not found')) {
          console.warn('⚠️ Transaction endpoint not found, returning empty data');
          return {
            data: [],
            total: 0,
            page: params.page || 1,
            limit: params.limit || 10,
            totalPages: 0,
          };
        }
        throw error;
      }
      
      let transactionsArray: Transaction[] = [];
      let total = 0;
      let page = params.page || 1;
      let limit = params.limit || 10;
      let totalPages = 1;

      if (Array.isArray(response)) {
        transactionsArray = response;
        total = response.length;
        totalPages = Math.ceil(response.length / limit);
      } else if (response && typeof response === 'object') {
        if (Array.isArray(response.results)) {
          transactionsArray = response.results;
          total = (response.total !== undefined && response.total !== null) 
            ? response.total 
            : response.results.length;
          page = response.page || page;
          limit = response.limit || limit;
          totalPages = response.totalPages || Math.ceil(total / limit);
        } else if (Array.isArray(response.data)) {
          transactionsArray = response.data;
          total = (response.total !== undefined && response.total !== null) 
            ? response.total 
            : response.data.length;
          page = response.page || page;
          limit = response.limit || limit;
          totalPages = response.totalPages || Math.ceil(total / limit);
        }
      }

      transactionsArray = transactionsArray.map((transaction) => {
        if (transaction.id && !transaction._id) {
          return { ...transaction, _id: transaction.id };
        }
        return transaction;
      });

      return {
        data: transactionsArray,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error('❌ Get transactions error:', error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId: string): Promise<Transaction> {
    try {
      const response = await ApiService.get(`/payments/transactions/${transactionId}`);
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Get transaction by ID error:', error);
      throw error;
    }
  }

  /**
   * Get user's transactions
   */
  async getUserTransactions(params: GetTransactionsParams = {}): Promise<TransactionsResponse> {
    return this.getTransactions(params);
  }

  /**
   * Get transaction stats (summary)
   */
  async getTransactionStats(): Promise<any> {
    try {
      const response = await this.getTransactions({ limit: 100 });
      const transactions = response.data;

      const stats = {
        total: transactions.length,
        completed: transactions.filter(t => t.status === 'completed').length,
        pending: transactions.filter(t => t.status === 'pending').length,
        failed: transactions.filter(t => t.status === 'failed').length,
        refunded: transactions.filter(t => t.status === 'refunded').length,
        totalRevenue: transactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0),
        totalRefunds: transactions
          .filter(t => t.status === 'refunded')
          .reduce((sum, t) => sum + (t.refundAmount || 0), 0),
      };

      return stats;
    } catch (error) {
      console.error('❌ Get transaction stats error:', error);
      // Return default stats if error
      return {
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0,
        refunded: 0,
        totalRevenue: 0,
        totalRefunds: 0,
      };
    }
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      completed: 'success',
      pending: 'warning',
      failed: 'danger',
      cancelled: 'secondary',
      refunded: 'info',
    };
    return colors[status] || 'secondary';
  }
}

export default new TransactionService();