import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/Card';
import useFinanceStore from '../../store/financeStore';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, ShoppingCart } from 'lucide-react';

const Insights = () => {
  const {
    transactions,
    getTotalIncome,
    getTotalExpenses,
    getTransactionsByCategory,
    getMonthlyData
  } = useFinanceStore();

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const categoryData = getTransactionsByCategory();
  const monthlyData = getMonthlyData();

  const insights = useMemo(() => {
    const insights = [];

    const expenseCategories = categoryData
      .filter(item => item.expense > 0)
      .sort((a, b) => b.expense - a.expense);

    if (expenseCategories.length > 0) {
      const highest = expenseCategories[0];
      insights.push({
        type: 'warning',
        title: 'Highest Spending Category',
        description: `You spent $${highest.expense.toLocaleString()} on ${highest.category}`,
        icon: <TrendingUp className="h-5 w-5" />
      });
    }

    if (monthlyData.length >= 2) {
      const currentMonth = monthlyData[monthlyData.length - 1];
      const previousMonth = monthlyData[monthlyData.length - 2];
      
      const incomeChange = currentMonth.income - previousMonth.income;
      const expenseChange = currentMonth.expense - previousMonth.expense;
      
      if (incomeChange > 0) {
        insights.push({
          type: 'success',
          title: 'Income Increased',
          description: `Your income increased by $${incomeChange.toLocaleString()} this month`,
          icon: <TrendingUp className="h-5 w-5" />
        });
      }
      
      if (expenseChange > 0) {
        insights.push({
          type: 'warning',
          title: 'Expenses Increased',
          description: `Your expenses increased by $${expenseChange.toLocaleString()} this month`,
          icon: <TrendingDown className="h-5 w-5" />
        });
      }
    }

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    if (savingsRate < 10) {
      insights.push({
        type: 'danger',
        title: 'Low Savings Rate',
        description: `Your savings rate is ${savingsRate.toFixed(1)}%. Consider reducing expenses.`,
        icon: <AlertTriangle className="h-5 w-5" />
      });
    } else if (savingsRate > 20) {
      insights.push({
        type: 'success',
        title: 'Great Savings Rate',
        description: `Your savings rate is ${savingsRate.toFixed(1)}%. Keep it up!`,
        icon: <CheckCircle className="h-5 w-5" />
      });
    }

    const largeExpenses = transactions
      .filter(t => t.type === 'expense' && t.amount > 1000)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    if (largeExpenses.length > 0) {
      insights.push({
        type: 'info',
        title: 'Large Expenses',
        description: `You have ${largeExpenses.length} transactions over $1,000. Review these for potential savings.`,
        icon: <DollarSign className="h-5 w-5" />
      });
    }

    const smallPurchases = transactions
      .filter(t => t.type === 'expense' && t.amount < 50)
      .length;

    if (smallPurchases > 10) {
      insights.push({
        type: 'info',
        title: 'Frequent Small Purchases',
        description: `You made ${smallPurchases} small purchases under $50. These can add up quickly.`,
        icon: <ShoppingCart className="h-5 w-5" />
      });
    }

    return insights;
  }, [transactions, totalIncome, totalExpenses, categoryData, monthlyData]);

  const getInsightColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'danger':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getInsightIconColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'danger':
        return 'text-red-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const stats = useMemo(() => {
    const avgTransaction = transactions.length > 0 
      ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length 
      : 0;

    const transactionsThisMonth = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const currentDate = new Date();
      return transactionDate.getMonth() === currentDate.getMonth() &&
             transactionDate.getFullYear() === currentDate.getFullYear();
    }).length;

    const mostActiveDay = transactions.reduce((acc, t) => {
      const day = new Date(t.date).toLocaleDateString('en-US', { weekday: 'long' });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    const busiestDay = Object.entries(mostActiveDay)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      avgTransaction,
      transactionsThisMonth,
      busiestDay: busiestDay ? busiestDay[0] : 'N/A',
      totalTransactions: transactions.length
    };
  }, [transactions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              All time transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transactionsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Transactions this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgTransaction)}</div>
            <p className="text-xs text-muted-foreground">
              Average amount per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Busiest Day</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.busiestDay}</div>
            <p className="text-xs text-muted-foreground">
              Most active day of the week
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Insights</CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No insights available. Add more transactions to see financial insights.
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={getInsightIconColor(insight.type)}>
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <p className="text-sm mt-1 opacity-90">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Insights;
