import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockTransactions } from '../data/mockData';

const useFinanceStore = create(
  persist(
    (set, get) => ({
      transactions: mockTransactions,
      role: 'viewer',
      searchQuery: '',
      filterType: 'all',
      sortBy: 'date',
      sortOrder: 'desc',
      darkMode: false,
      addTransaction: (transaction) => {
        set((state) => ({
          transactions: [...state.transactions, { ...transaction, id: Date.now() }]
        }));
      },

      updateTransaction: (id, updatedTransaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updatedTransaction } : t
          )
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id)
        }));
      },

      setRole: (role) => {
        set({ role });
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      setFilterType: (type) => {
        set({ filterType: type });
      },

      setSortBy: (sortBy) => {
        set({ sortBy });
      },

      setSortOrder: (order) => {
        set({ sortOrder: order });
      },

      toggleDarkMode: () => {
        set((state) => ({ darkMode: !state.darkMode }));
      },
      getFilteredTransactions: () => {
        const { transactions, searchQuery, filterType, sortBy, sortOrder } = get();
        
        let filtered = transactions;

        if (searchQuery) {
          filtered = filtered.filter(
            (t) =>
              t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.amount.toString().includes(searchQuery)
          );
        }

        if (filterType !== 'all') {
          filtered = filtered.filter((t) => t.type === filterType);
        }

        filtered.sort((a, b) => {
          let aValue = a[sortBy];
          let bValue = b[sortBy];

          if (sortBy === 'date') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
          }

          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });

        return filtered;
      },

      getTotalBalance: () => {
        const { transactions } = get();
        return transactions.reduce((acc, t) => {
          return t.type === 'income' ? acc + t.amount : acc - t.amount;
        }, 0);
      },

      getTotalIncome: () => {
        const { transactions } = get();
        return transactions
          .filter((t) => t.type === 'income')
          .reduce((acc, t) => acc + t.amount, 0);
      },

      getTotalExpenses: () => {
        const { transactions } = get();
        return transactions
          .filter((t) => t.type === 'expense')
          .reduce((acc, t) => acc + t.amount, 0);
      },

      getTransactionsByCategory: () => {
        const { transactions } = get();
        const categoryData = {};

        transactions.forEach((t) => {
          if (!categoryData[t.category]) {
            categoryData[t.category] = { income: 0, expense: 0 };
          }
          if (t.type === 'income') {
            categoryData[t.category].income += t.amount;
          } else {
            categoryData[t.category].expense += t.amount;
          }
        });

        return Object.entries(categoryData).map(([category, data]) => ({
          category,
          income: data.income,
          expense: data.expense,
          total: data.income - data.expense
        }));
      },

      getMonthlyData: () => {
        const { transactions } = get();
        const monthlyData = {};

        transactions.forEach((t) => {
          const date = new Date(t.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { income: 0, expense: 0, balance: 0 };
          }
          
          if (t.type === 'income') {
            monthlyData[monthKey].income += t.amount;
            monthlyData[monthKey].balance += t.amount;
          } else {
            monthlyData[monthKey].expense += t.amount;
            monthlyData[monthKey].balance -= t.amount;
          }
        });

        return Object.entries(monthlyData)
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => a.month.localeCompare(b.month));
      }
    }),
    {
      name: 'finance-storage',
    }
  )
);

export default useFinanceStore;
