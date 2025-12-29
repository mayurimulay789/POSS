
import React, { Suspense, lazy } from 'react';


import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  Link,
  Outlet,
  useLocation
} from 'react-router-dom';

import { Provider } from 'react-redux';
import store from './store/store';


// Lazy load components
const RoleBasedLayout = lazy(() => import('./pages/RoleBasedLayout'));
const Login = lazy(() => import('./components/LoginForm'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MenuManagement = lazy(() => import('./pages/MenuManagement'));
const AddMenu = lazy(() => import('./components/merchant/MenuManagement/AddMenu'));
const MenuList = lazy(() => import('./components/merchant/MenuManagement/MenuList'));
const OrderManagement = lazy(() => import('./pages/OrderManagement'));
const BillingManagement = lazy(() => import('./pages/BillingManagement'));
const SpaceManagement = lazy(() => import('./pages/SpaceManagement'));
const TaskManagement = lazy(() => import('./pages/TaskManagement'));
const ExpenseManagement = lazy(() => import('./pages/ExpenseManagement'));
const ReportsAnalytics = lazy(() => import('./pages/ReportsAnalytics'));
const EmployeeManagement = lazy(() => import('./pages/EmployeeManagement'));
const CustomerManagement = lazy(() => import('./pages/CustomerManagement'));
const PermissionManagement = lazy(() => import('./pages/PermissionManagement'));
const HotelImages = lazy(() => import('./pages/HotelImages'));
const AttendanceManagement = lazy(() => import('./pages/AttendanceManagement'));
const MerchantAttendanceDashboard = lazy(() => import('./pages/MerchantAttendanceDashboard'));

// Public components
const HomePage = lazy(() => import('./pages/Home'));
const ContactUsPage = lazy(() => import('./pages/ContactUs'));
const Navbar = lazy(() => import('./components/Navbar'));
const Footer = lazy(() => import('./components/Footer'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);


// Public Layout (remove top padding on home so banner sits at very top under overlay nav)
const PublicLayout = () => {
  const location = useLocation();
  const topPad = location.pathname === '/' ? 'pt-0' : 'pt-16';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={`flex-1 ${topPad}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};


// Public Layout
// const PublicLayout = () => (
//   <div className="min-h-screen flex flex-col">
//     <Navbar />
//     <main className="flex-1 pt-16">
//       <Outlet />
//     </main>
//     <Footer />
//   </div>
// );




// 404 Page
const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 pt-16 flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Go Home
        </Link>
      </div>
    </main>
    <Footer />
  </div>
);


function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Redirect ALL old role-based routes to new unified routes */}
              <Route path="/merchant/dashboard" element={<Navigate to="/dashboard" replace />} />
              <Route path="/merchant/employees" element={<Navigate to="/employees" replace />} />
              <Route path="/merchant/spaces" element={<Navigate to="/spaces" replace />} />
              <Route path="/merchant/tasks" element={<Navigate to="/tasks" replace />} />
              <Route path="/merchant/expenses" element={<Navigate to="/expenses" replace />} />
              <Route path="/merchant/reports" element={<Navigate to="/reports" replace />} />
              <Route path="/merchant/menu" element={<Navigate to="/menu" replace />} />
              <Route path="/merchant/orders" element={<Navigate to="/orders" replace />} />
              <Route path="/merchant/billing" element={<Navigate to="/billing" replace />} />
              <Route path="/merchant/customers" element={<Navigate to="/customers" replace />} />
              <Route path="/merchant" element={<Navigate to="/dashboard" replace />} />
              
              {/* Add redirects for other roles too */}
              <Route path="/supervisor/dashboard" element={<Navigate to="/dashboard" replace />} />
              <Route path="/supervisor/orders" element={<Navigate to="/orders" replace />} />
              <Route path="/supervisor/billing" element={<Navigate to="/billing" replace />} />
              <Route path="/supervisor" element={<Navigate to="/dashboard" replace />} />
              <Route path="/supervisor/spaces" element={<Navigate to="/spaces" replace />} />
              <Route path="/supervisor/tasks" element={<Navigate to="/tasks" replace />} />
              <Route path="/supervisor/expenses" element={<Navigate to="/expenses" replace />} />
              <Route path="/supervisor/reports" element={<Navigate to="/reports" replace />} />
              <Route path="/supervisor/employees" element={<Navigate to="/employees" replace />} />
              <Route path="/supervisor/customers" element={<Navigate to="/customers" replace />} />

              <Route path="/manager/orders" element={<Navigate to="/orders" replace />} />
              <Route path="/manager/menu" element={<Navigate to="/menu" replace />} />
              <Route path="/manager/billing" element={<Navigate to="/billing" replace />} />
              <Route path="/manager/dashboard" element={<Navigate to="/dashboard" replace />} />
              <Route path="/manager/employees" element={<Navigate to="/employees" replace />} />
              <Route path="/manager" element={<Navigate to="/dashboard" replace />} />
              <Route path="/manager/spaces" element={<Navigate to="/spaces" replace />} />
              <Route path="/manager/tasks" element={<Navigate to="/tasks" replace />} />
              <Route path="/manager/expenses" element={<Navigate to="/expenses" replace />} />
              <Route path="/manager/reports" element={<Navigate to="/reports" replace />} />
              <Route path="/manager/customers" element={<Navigate to="/customers" replace />} />
              
              <Route path="/staff/dashboard" element={<Navigate to="/dashboard" replace />} />
              <Route path="/staff/menu" element={<Navigate to="/menu" replace />} />
              <Route path="/staff/customers" element={<Navigate to="/customers" replace />} />
              <Route path="/staff/tasks" element={<Navigate to="/tasks" replace />} />
              <Route path="/staff/spaces" element={<Navigate to="/spaces" replace />} />
              <Route path="/staff/expenses" element={<Navigate to="/expenses" replace />} />
              <Route path="/staff/reports" element={<Navigate to="/reports" replace />} />
              <Route path="/staff/orders" element={<Navigate to="/orders" replace />} />
              <Route path="/staff" element={<Navigate to="/dashboard" replace />} />
              <Route path="/staff/billing" element={<Navigate to="/billing" replace />} />
              <Route path="/staff" element={<Navigate to="/dashboard" replace />} />
              
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="home" element={<HomePage />} />
                <Route path="about" element={<div className="container mx-auto px-4 py-8"><h1>About Us</h1></div>} />
                <Route path="contact" element={<ContactUsPage />} />
              </Route>

              {/* Login Route */}
              <Route path="/login" element={<Login />} />

              {/* Role-Based Protected Routes - UNIFIED PATHS */}
              <Route path="/" element={<RoleBasedLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="menu" element={<MenuManagement />} />
                <Route path="menu/add" element={<AddMenu />} />
                <Route path="menu/list" element={<MenuList />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="billing" element={<BillingManagement />} />
                <Route path="hotel-images" element={<HotelImages />} />
                <Route path="spaces" element={<SpaceManagement />} />
                <Route path="tasks" element={<TaskManagement />} />
                <Route path="expenses" element={<ExpenseManagement />} />
                <Route path="reports" element={<ReportsAnalytics />} />
                <Route path="employees" element={<EmployeeManagement />} />
                <Route path="customers" element={<CustomerManagement />} />
                <Route path="permission-management" element={<PermissionManagement />} />
                <Route path="attendance" element={<AttendanceManagement />} />
                <Route path="attendance-dashboard" element={<MerchantAttendanceDashboard />} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </Provider>
  );
}



export default App;

