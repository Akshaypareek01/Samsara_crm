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
  userId?: string;
  startDate?: string;
  endDate?: string;
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
   * Get all transactions (Admin - fetches ALL transactions)
   */
  async getTransactions(params: GetTransactionsParams = {}): Promise<TransactionsResponse> {
    console.log('🔍 getTransactions called with params:', params);
    
    try {
      // Use the /all endpoint to get ALL transactions (not just user's transactions)
      const response = await ApiService.get('/payments/transactions/all', params);
      console.log('✅ Raw response from API:', response);
      console.log('📊 Response type:', typeof response);
      console.log('📊 Is Array?:', Array.isArray(response));
      
      let transactionsArray: Transaction[] = [];
      let total = 0;
      let page = params.page || 1;
      let limit = params.limit || 10;
      let totalPages = 1;

      
      // Handle different response structures
      if (Array.isArray(response)) {
        console.log('✅ Response is direct array');
        transactionsArray = response;
        total = response.length;
        totalPages = Math.ceil(response.length / limit);
      } else if (response && typeof response === 'object') {
        console.log('✅ Response is object, checking properties...');
        console.log('📦 Available keys:', Object.keys(response));
        
        // Check for various possible response structures
        if (Array.isArray(response.results)) {
          console.log('✅ Found response.results array');
          transactionsArray = response.results;
          total = response.total ?? response.results.length;
          page = response.page || page;
          limit = response.limit || limit;
          totalPages = response.totalPages || Math.ceil(total / limit);
        } else if (Array.isArray(response.data)) {
          console.log('✅ Found response.data array');
          transactionsArray = response.data;
          total = response.total ?? response.data.length;
          page = response.page || page;
          limit = response.limit || limit;
          totalPages = response.totalPages || Math.ceil(total / limit);
        } else if (Array.isArray(response.transactions)) {
          console.log('✅ Found response.transactions array');
          transactionsArray = response.transactions;
          total = response.total ?? response.transactions.length;
          page = response.page || page;
          limit = response.limit || limit;
          totalPages = response.totalPages || Math.ceil(total / limit);
        } else {
          console.warn('⚠️ Unknown response structure:', response);
        }
      }

      console.log(`📊 Processed ${transactionsArray.length} transactions`);
      
      if (transactionsArray.length === 0) {
        console.warn('⚠️ No transactions found! Backend returned empty array.');
        console.warn('⚠️ This could mean:');
        console.warn('   1. No transactions exist in the database');
        console.warn('   2. Backend query filters are too restrictive');
        console.warn('   3. Backend controller has an issue');
      }

      // Normalize _id field
      transactionsArray = transactionsArray.map((transaction) => {
        if (transaction.id && !transaction._id) {
          return { ...transaction, _id: transaction.id };
        }
        return transaction;
      });

      const result = {
        data: transactionsArray,
        total,
        page,
        limit,
        totalPages,
      };

      console.log('✅ Final result:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Get transactions error:', error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId: string): Promise<Transaction> {
    console.log('🔍 getTransactionById called with ID:', transactionId);
    
    try {
      const possibleEndpoints = [
        `/payment/transactions/${transactionId}`,
        `/payments/transactions/${transactionId}`,
        `/transaction/${transactionId}`,
        `/transactions/${transactionId}`,
      ];

      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`🔄 Trying endpoint: ${endpoint}`);
          const response = await ApiService.get(endpoint);
          console.log(`✅ Success with endpoint: ${endpoint}`);
          
          if (response.id && !response._id) {
            return { ...response, _id: response.id };
          }
          return response;
        } catch (error: any) {
          if (endpoint === possibleEndpoints[possibleEndpoints.length - 1]) {
            throw error;
          }
          continue;
        }
      }
      
      throw new Error('Transaction not found');
    } catch (error) {
      console.error('❌ Get transaction by ID error:', error);
      throw error;
    }
  }

  /**
   * Get user's transactions
   */
  async getUserTransactions(params: GetTransactionsParams = {}): Promise<TransactionsResponse> {
    console.log('🔍 getUserTransactions called');
    return this.getTransactions(params);
  }

  /**
   * Get transaction stats (summary) - Fetches all transactions with pagination
   */
  async getTransactionStats(): Promise<any> {
    console.log('🔍 getTransactionStats called');
    
    try {
      let allTransactions: Transaction[] = [];
      let currentPage = 1;
      const limit = 100; // Maximum allowed by backend
      let hasMorePages = true;

      console.log('📊 Fetching all transactions with pagination...');

      // Fetch all pages of transactions
      while (hasMorePages) {
        console.log(`📄 Fetching page ${currentPage}...`);
        const response = await this.getTransactions({ page: currentPage, limit });
        
        allTransactions = [...allTransactions, ...response.data];
        console.log(`✅ Fetched ${response.data.length} transactions from page ${currentPage}`);
        console.log(`📊 Total so far: ${allTransactions.length} of ${response.total}`);

        // Check if there are more pages
        if (response.data.length < limit || allTransactions.length >= response.total) {
          hasMorePages = false;
          console.log('✅ All pages fetched');
        } else {
          currentPage++;
        }
      }

      console.log(`📊 Calculating stats for ${allTransactions.length} total transactions`);

      const stats = {
        total: allTransactions.length,
        completed: allTransactions.filter(t => t.status === 'completed').length,
        pending: allTransactions.filter(t => t.status === 'pending').length,
        failed: allTransactions.filter(t => t.status === 'failed').length,
        refunded: allTransactions.filter(t => t.status === 'refunded').length,
        totalRevenue: allTransactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + (t.amount || 0), 0),
        totalRefunds: allTransactions
          .filter(t => t.status === 'refunded')
          .reduce((sum, t) => sum + (t.refundAmount || 0), 0),
      };

      console.log('✅ Stats calculated:', stats);
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