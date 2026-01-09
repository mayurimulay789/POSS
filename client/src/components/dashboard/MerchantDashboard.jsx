import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import StatsCard from './common/StatsCard';
import ChartCard from './common/ChartCard';
import LineChartComponent from './common/lineChartComponent';
import BarChartComponent from './common/BarChartComponent';
import PieChartComponent from './common/PieChartComponent';

const MerchantDashboard = () => {
  const { data, refreshDashboard } = useDashboard();

  const generateCustomerGrowthData = () => {
    if (!data) return [];
    const { customerStats } = data;
    const totalCustomers = customerStats?.totalCustomers || 0;
    const weeklyGrowth = customerStats?.newCustomersThisWeek || 0;
    const monthlyEstimate = weeklyGrowth * 4;

    return [
      { name: '3 Months Ago', customers: Math.max(0, totalCustomers - monthlyEstimate * 3) },
      { name: '2 Months Ago', customers: Math.max(0, totalCustomers - monthlyEstimate * 2) },
      { name: 'Last Month', customers: Math.max(0, totalCustomers - monthlyEstimate) },
      { name: 'Current', customers: totalCustomers },
      { name: 'Projected', customers: totalCustomers + weeklyGrowth },
    ];
  };

  const generateOrderGrowthData = () => {
    if (!data) return [];
    const { orderStats } = data;
    const totalOrders = orderStats?.totalOrders || 0;
    const weeklyGrowth = orderStats?.todaysOrders * 7 || 0;
    const monthlyEstimate = weeklyGrowth * 4;

    return [
      { name: '3 Months Ago', orders: Math.max(0, totalOrders - monthlyEstimate * 3) },
      { name: '2 Months Ago', orders: Math.max(0, totalOrders - monthlyEstimate * 2) },
      { name: 'Last Month', orders: Math.max(0, totalOrders - monthlyEstimate) },
      { name: 'Current', orders: totalOrders },
      { name: 'Projected', orders: totalOrders + weeklyGrowth },
    ];
  };

  const generateExpenseDistributionData = () => {
    if (!data) return [];
    const paymentMethods = data.financialStats?.expensesByPaymentMethod || {};
    console.log('Expense Payment Methods:', paymentMethods);
    return Object.entries(paymentMethods).map(([method, amountObj]) => ({
      name: method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' '),
      amount: typeof amountObj === 'object' ? amountObj.amount || 0 : amountObj || 0,
    }));
  };

  const generateMembershipDistributionData = () => {
    if (!data) return [];
    const breakdown = data.customerStats?.membershipStats?.membershipBreakdown || {};
    return Object.entries(breakdown)
      .map(([type, count]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: count,
      }))
      .filter(item => item.name !== 'None');
  };

 

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white p-6 rounded-xl border w-full max-w-md">
          <p className="text-gray-500 mb-4">No dashboard data available</p>
          <button
            onClick={refreshDashboard}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg w-full"
          >
            Load Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { customerStats,orderStats, employeeStats, financialStats, taskStats, recentActivity = [] } = data;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-1  space-y-8 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Merchant Dashboard</h2>
        </div>
        <button
          onClick={refreshDashboard}
          className="px-4 py-2 bg-gray-100 rounded-lg w-full sm:w-auto"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Total Customers" value={customerStats?.totalCustomers || 0} icon="👥" color="blue" />
        <StatsCard title="Active Employees" value={employeeStats?.activeEmployees || 0} icon="👨‍💼" color="green" />
        <StatsCard title="Total Expenses" value={financialStats?.totalExpenses || 0} icon="💰" color="red" format="currency" />
        <StatsCard title="Task Completion" value={parseFloat(taskStats?.completionRate || '0')} icon="✅" color="purple" format="percent" />
      </div>

      {/* Membership Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="With Membership" value={customerStats?.membershipStats?.totalWithMembership || 0} icon="🎫" />
        <StatsCard title="Total Order" value={orderStats?.totalOrders || 0} icon="📦" />
        <StatsCard title="Today's Orders" value={orderStats?.todaysOrders || 0} icon="📅" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 ">
        <ChartCard title="Customer Growth Trend">
          <LineChartComponent data={generateCustomerGrowthData()} dataKey="customers" height={260} />
        </ChartCard>

        <ChartCard title="Order Growth Trend">
          <LineChartComponent data={generateOrderGrowthData()} dataKey="orders" height={260} />
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <ChartCard title="Membership Distribution">
          <PieChartComponent data={generateMembershipDistributionData()} height={260} />
        </ChartCard>
        <ChartCard title="Expense Distribution">
          <BarChartComponent data={generateExpenseDistributionData()} dataKey="amount" height={260} />
        </ChartCard>
        

      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        {recentActivity.length ? (
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((a, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:justify-between gap-2 bg-gray-50 p-3 rounded-lg">
                <div>
                  <p className="text-gray-800">{a.message}</p>
                  <p className="text-xs text-gray-500">{new Date(a.timestamp).toLocaleString()}</p>
                </div>
                <span className="text-xs text-gray-500 capitalize">{a.type.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-6">No recent activity</p>
        )}
      </div>

      {/* Bottom Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border">
          <h4 className="font-semibold mb-2">Today</h4>
          <p>New Customers: {customerStats?.newCustomersToday || 0}</p>
          <p>Expenses: ₹{financialStats?.expensesToday || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <h4 className="font-semibold mb-2">This Week</h4>
          <p>New Customers: {customerStats?.newCustomersThisWeek || 0}</p>
          <p>Expenses: ₹{(financialStats?.expensesThisMonth || 0) / 4}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <h4 className="font-semibold mb-2">Membership Types</h4>
          {Object.entries(customerStats?.membershipStats?.membershipBreakdown || {}).map(([t, c]) => (
            <div key={t} className="flex justify-between text-sm">
              <span className="capitalize">{t}</span>
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;
