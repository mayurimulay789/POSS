// // src/components/dashboard/ManagerDashboard.jsx
// import React from 'react';
// import { useDashboard } from '../../hooks/useDashboard';
// import StatsCard from './common/StatsCard';
// import ChartCard from './common/ChartCard';

// const ManagerDashboard = () => {
//   const { data, loading, refreshDashboard } = useDashboard();

//   if (!data) {
//     return (
//       <div className="text-center py-12 bg-white rounded-xl border">
//         <div className="text-gray-500 mb-4">No dashboard data available</div>
//         <button 
//           onClick={refreshDashboard}
//           className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//         >
//           Load Dashboard
//         </button>
//       </div>
//     );
//   }

//   const {
//     overview,
//     customerStats,
//     teamStats,
//     taskStats,
//     expenseStats,
//     upcomingDeadlines = []
//   } = data;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-xl font-bold text-gray-800">Manager Dashboard</h2>
//           <p className="text-gray-600">Team and operations overview</p>
//         </div>
//         <button 
//           onClick={refreshDashboard}
//           className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
//         >
//           <span>↻</span> Refresh
//         </button>
//       </div>

//       {/* Quick Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatsCard 
//           title="Total Customers" 
//           value={customerStats?.totalCustomers || 0} 
//           icon="👥"
//           color="blue"
//           isLoading={loading}
//         />
//         <StatsCard 
//           title="Team Size" 
//           value={teamStats?.teamSize || 0} 
//           icon="👨‍💼"
//           color="green"
//           isLoading={loading}
//         />
//         <StatsCard 
//           title="Total Expenses" 
//           value={expenseStats?.totalExpenses || 0} 
//           icon="💰"
//           color="red"
//           format="currency"
//           isLoading={loading}
//         />
//         <StatsCard 
//           title="Team Performance" 
//           value={parseFloat(teamStats?.teamPerformance || '0')} 
//           icon="📈"
//           color="purple"
//           format="percent"
//           isLoading={loading}
//         />
//       </div>

//       {/* Week Performance */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//         <StatsCard 
//           title="This Week Customers" 
//           value={customerStats?.customersAddedThisWeek || 0} 
//           icon="📅"
//           color="indigo"
//           isLoading={loading}
//         />
//         <StatsCard 
//           title="Week Expenses" 
//           value={overview?.expensesThisWeek || 0} 
//           icon="💸"
//           color="yellow"
//           format="currency"
//           isLoading={loading}
//         />
//         <StatsCard 
//           title="Tasks Completed" 
//           value={teamStats?.tasksCompleted || 0} 
//           icon="✅"
//           color="green"
//           isLoading={loading}
//         />
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <ChartCard title="Expense by Payment Method" isLoading={loading}>
//           {expenseStats?.expensesByPaymentMethod && (
//             <div className="space-y-3">
//               {Object.entries(expenseStats.expensesByPaymentMethod).map(([method, amount]) => (
//                 <div key={method} className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <span className="capitalize">{method.replace('_', ' ')}:</span>
//                   </div>
//                   <div className="font-semibold">₹{amount}</div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </ChartCard>
        
//         <ChartCard title="Task Overview" isLoading={loading}>
//           <div className="space-y-4">
//             <div className="flex justify-between">
//               <span>My Assigned Tasks:</span>
//               <span className="font-semibold">{taskStats?.myAssignedTasks || 0}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>Team Tasks:</span>
//               <span className="font-semibold">{taskStats?.teamTasks || 0}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>Pending Tasks:</span>
//               <span className="font-semibold">{taskStats?.pendingTasks || 0}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>Due Today:</span>
//               <span className="font-semibold">{taskStats?.dueToday || 0}</span>
//             </div>
//           </div>
//         </ChartCard>
//       </div>

//       {/* Upcoming Deadlines */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold text-gray-800">Upcoming Deadlines</h3>
//           <span className="text-sm text-gray-500">{upcomingDeadlines.length} items</span>
//         </div>
//         {upcomingDeadlines.length > 0 ? (
//           <div className="space-y-3">
//             {upcomingDeadlines.slice(0, 5).map((deadline, index) => (
//               <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <div className="flex items-center gap-3">
//                   <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                     deadline.type === 'membership_expiry' ? 'bg-red-100' : 'bg-blue-100'
//                   }`}>
//                     <span className={deadline.type === 'membership_expiry' ? 'text-red-600' : 'text-blue-600'}>
//                       {deadline.type === 'membership_expiry' ? '⏰' : '📝'}
//                     </span>
//                   </div>
//                   <div>
//                     <p className="text-gray-800 font-medium">
//                       {deadline.type === 'membership_expiry' ? deadline.customer : deadline.task}
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       {deadline.type === 'membership_expiry' ? 'Membership expiry' : 'Task due'} in {deadline.daysLeft} days
//                     </p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <div className="text-sm text-gray-600">
//                     {new Date(deadline.date).toLocaleDateString()}
//                   </div>
//                   {deadline.assignee && (
//                     <div className="text-xs text-gray-500">Assigned to: {deadline.assignee}</div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-8 text-gray-500">
//             No upcoming deadlines
//           </div>
//         )}
//       </div>

//       {/* Membership Status */}
//       <div className="bg-white p-6 rounded-xl border border-gray-200">
//         <h3 className="text-lg font-semibold text-gray-800 mb-4">Membership Status</h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="text-center p-4 bg-blue-50 rounded-lg">
//             <div className="text-2xl font-bold text-blue-600">
//               {customerStats?.membershipStats?.totalWithMembership || 0}
//             </div>
//             <div className="text-sm text-gray-600">Total with Membership</div>
//           </div>
//           <div className="text-center p-4 bg-yellow-50 rounded-lg">
//             <div className="text-2xl font-bold text-yellow-600">
//               {customerStats?.membershipStats?.expiringThisWeek || 0}
//             </div>
//             <div className="text-sm text-gray-600">Expiring This Week</div>
//           </div>
//           <div className="text-center p-4 bg-red-50 rounded-lg">
//             <div className="text-2xl font-bold text-red-600">
//               {customerStats?.membershipStats?.renewalsNeeded || 0}
//             </div>
//             <div className="text-sm text-gray-600">Renewals Needed</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ManagerDashboard;


// src/components/dashboard/ManagerDashboard.jsx - UPDATED
import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import StatsCard from './common/StatsCard';
import ChartCard from './common/ChartCard';
  import LineChartComponent from './common/lineChartComponent';
import BarChartComponent from './common/BarChartComponent';
import PieChartComponent from './common/PieChartComponent';

const ManagerDashboard = () => {
  const { data, loading, refreshDashboard } = useDashboard();

  
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
  


  const generateTaskStatusData = () => {
    const tasks = data?.taskStats || {};
    return [
      { name: 'Completed', value: tasks.myAssignedTasks - (tasks.pendingTasks || 0) },
      { name: 'Pending', value: tasks.pendingTasks || 0 },
      { name: 'Overdue', value: 0 },
    ];
  };

  const generateCustomerMembershipData = () => {
    const stats = data?.customerStats?.membershipStats || {};
    return [
      { name: 'With Membership', value: stats.totalWithMembership || 0 },
      { name: 'Without Membership', value: (data?.customerStats?.totalCustomers || 0) - (stats.totalWithMembership || 0) },
    ];
  };

  if (!data) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border">
        <div className="text-gray-500 mb-4">No dashboard data available</div>
        <button 
          onClick={refreshDashboard}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Load Dashboard
        </button>
      </div>
    );
  }

  const {
    overview,
    customerStats,
    orderStats,
    teamStats,
    expenseStats,
  } = data;

  return (
    <div className="space-y-6 px-4 py-2">
      {/* Header */}
      <div className="flex justify-between items-center ">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Manager Dashboard</h2>
        </div>
        <button 
          onClick={refreshDashboard}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <span>↻</span> Refresh
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <StatsCard 
          title="Total Orders" 
          value={orderStats?.totalOrders || 0} 
          icon="📦"
          color="blue"
          isLoading={loading}
        />
        <StatsCard 
          title="Today's Orders" 
          value={orderStats?.todaysOrders || 0} 
          icon="📅"
          color="blue"
          isLoading={loading}
        />
        <StatsCard 
          title="Total Customers" 
          value={customerStats?.totalCustomers || 0} 
          icon="👥"
          color="blue"
          isLoading={loading}
        />
        <StatsCard 
          title="Active Employees" 
          value={teamStats?.teamSize || 0} 
          icon="👨‍💼"
          color="green"
          isLoading={loading}
        />
        
      </div>


      {/* Week Performance */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
       <StatsCard 
          title="Total Expenses" 
          value={expenseStats?.totalExpenses || 0} 
          icon="💰"
          color="red"
          format="currency"
          isLoading={loading}
        />
        <StatsCard 
          title="Week Expenses" 
          value={overview?.expensesThisWeek || 0} 
          icon="💸"
          color="yellow"
          format="currency"
          isLoading={loading}
        />
         <StatsCard 
          title="Team Performance" 
          value={parseFloat(teamStats?.teamPerformance || '0')} 
          icon="📈"
          color="purple"
          format="percent"
          isLoading={loading}
        />
        <StatsCard 
          title="Tasks Completed" 
          value={teamStats?.tasksCompleted || 0} 
          icon="✅"
          color="green"
          isLoading={loading}
        />
      </div>

           {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Customer Growth Trend">
          <LineChartComponent data={generateCustomerGrowthData()} dataKey="customers" height={260} />
        </ChartCard>

        <ChartCard title="Order Growth Trend">
          <LineChartComponent data={generateOrderGrowthData()} dataKey="orders" height={260} />
        </ChartCard>
      </div>

     

      {/* More Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Task Status Distribution" isLoading={loading}>
          <PieChartComponent 
            data={generateTaskStatusData()}
            title="Task Status"
            colors={['#10b981', '#f59e0b', '#ef4444']}
          />
        </ChartCard>
        
        <ChartCard title="Customer Membership Status" isLoading={loading}>
          <PieChartComponent 
            data={generateCustomerMembershipData()}
            title="Membership vs Non-Membership"
            colors={['#3b82f6', '#9ca3af']}
          />
        </ChartCard>
      </div>

      {/* Expense by Payment Method */}
      {expenseStats?.expensesByPaymentMethod && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Expense by Payment Method</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(expenseStats.expensesByPaymentMethod).map(([method, amount]) => (
              <div key={method} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800">
                  ₹{typeof amount === 'object' ? amount.amount : amount}
                </div>
                <div className="text-sm text-gray-600 capitalize mt-1">
                  {method.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;