// // src/App.jsx
// import React, { Suspense, lazy } from 'react';
// import { BrowserRouter, Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';
// import { Provider } from 'react-redux';
// import store from './store/store';

// // Lazy load components (same as before)
// const MerchantPage = lazy(() => import('./pages/MerchantPage'));
// const MerchantDashboard = lazy(() => import('./components/merchant/Dashboard/MerchantDashboard'));
// const EmployeeManagement = lazy(() => import('./components/merchant/EmployeeManagement/EmployeeManagement'));
// const SpaceManagement = lazy(() => import('./components/merchant/SpaceManagement/SpaceManagement'));
// const TaskManagement = lazy(() => import('./components/merchant/TaskManagement/TaskManagement'));

// const HomePage = lazy(() => import('./pages/Home'));
// const Navbar = lazy(() => import('./components/Navbar'));
// const Footer = lazy(() => import('./components/Footer'));
// const LoginForm = lazy(() => import('./components/LoginForm'));

// // Loading component
// const LoadingSpinner = () => (
//   <div className="flex items-center justify-center h-64">
//     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//   </div>
// );

// // Updated MainLayout with Outlet
// const MainLayout = () => (
//   <div className="min-h-screen flex flex-col">
//     <Navbar />
//     <main className="flex-1 pt-16"> {/* Added pt-16 for fixed navbar */}
//       <Outlet /> {/* This renders the nested route components */}
//     </main>
//     <Footer />
//   </div>
// );

// function App() {
//   return (
//     <Provider store={store}>
//       <BrowserRouter>
//         <div className="App">
//           <Suspense fallback={<LoadingSpinner />}>
//             <Routes>
//               {/* Public Routes with Navbar & Footer */}
//               <Route path="/" element={<MainLayout />}>
//                 <Route index element={<HomePage />} />
//                 <Route path="login" element={<LoginForm />} /> {/* ✅ Fixed path */}
//               </Route>

//               {/* Merchant Routes (Separate Layout - No Navbar/Footer) */}
//               <Route path="/merchant" element={<MerchantPage />}>
//                 <Route index element={<Navigate to="/merchant/dashboard" replace />} />
//                 <Route path="dashboard" element={<MerchantDashboard />} />
//                 <Route path="employees" element={<EmployeeManagement />} />
//                 <Route path="spaces" element={<SpaceManagement />} />
//                 <Route path="tasks" element={<TaskManagement />} />
//               </Route>

//               {/* 404 Page */}
//               <Route path="*" element={
//                 <div className="min-h-screen flex flex-col">
//                   <Navbar />
//                   <main className="flex-1 pt-16 flex items-center justify-center">
//                     <div className="container mx-auto px-4 py-16 text-center">
//                       <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
//                       <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
//                       <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
//                         Go Home
//                       </Link>
//                     </div>
//                   </main>
//                   <Footer />
//                 </div>
//               } />
//             </Routes>
//           </Suspense>
//         </div>
//       </BrowserRouter>
//     </Provider>
//   );
// }

// export default App;

// import React, { Suspense, lazy } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Provider } from 'react-redux';
// import store from './store/store';

// // Lazy load role-based layout and pages
// const RoleBasedLayout = lazy(() => import('./pages/RoleBasedLayout'));
// const Login = lazy(() => import('./components/LoginForm'));

// // Lazy load role-specific page components
// const Dashboard = lazy(() => import('./pages/Dashboard'));
// const MenuManagement = lazy(() => import('./pages/MenuManagement'));
// const OrderManagement = lazy(() => import('./pages/OrderManagement'));
// const BillingManagement = lazy(() => import('./pages/BillingManagement'));
// const SpaceManagement = lazy(() => import('./pages/SpaceManagement'));
// const TaskManagement = lazy(() => import('./pages/TaskManagement'));
// const ExpenseManagement = lazy(() => import('./pages/ExpenseManagement'));
// const ReportsAnalytics = lazy(() => import('./pages/ReportsAnalytics'));
// const EmployeeManagement = lazy(() => import('./pages/EmployeeManagement'));
// const PermissionManagement = lazy(() => import('./pages/PermissionManagement'));

// // Lazy load public components (if you still need them)
// const HomePage = lazy(() => import('./pages/Home'));
// const Navbar = lazy(() => import('./components/Navbar'));
// const Footer = lazy(() => import('./components/Footer'));

// // Loading component
// const LoadingSpinner = () => (
//   <div className="flex items-center justify-center h-64">
//     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//   </div>
// );

// // Public Layout with Navbar & Footer (for public routes)
// const PublicLayout = () => (
//   <div className="min-h-screen flex flex-col">
//     <Navbar />
//     <main className="flex-1 pt-16">
//       <Outlet />
//     </main>
//     <Footer />
//   </div>
// );

// // 404 Page Component
// const NotFoundPage = () => (
//   <div className="min-h-screen flex flex-col">
//     <Navbar />
//     <main className="flex-1 pt-16 flex items-center justify-center">
//       <div className="container mx-auto px-4 py-16 text-center">
//         <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
//         <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
//         <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
//           Go Home
//         </Link>
//       </div>
//     </main>
//     <Footer />
//   </div>
// );

// function App() {
//   return (
//     <Provider store={store}>
//       <Router>
//         <div className="App">
//           <Suspense fallback={<LoadingSpinner />}>
//             <Routes>
//               {/* Public Routes with Navbar & Footer */}
//               <Route path="/" element={<PublicLayout />}>
//                 <Route index element={<HomePage />} />
//                 <Route path="home" element={<HomePage />} />
//                 <Route path="about" element={<div className="container mx-auto px-4 py-8"><h1>About Us</h1></div>} />
//                 <Route path="contact" element={<div className="container mx-auto px-4 py-8"><h1>Contact Us</h1></div>} />
//               </Route>

//               {/* Login Route (Separate from public layout) */}
//               <Route path="/login" element={<Login />} />

//               {/* Role-Based Protected Routes */}
//               <Route path="/" element={<RoleBasedLayout />}>
//                 <Route index element={<Navigate to="/dashboard" replace />} />
//                 <Route path="dashboard" element={<Dashboard />} />
//                 <Route path="menu" element={<MenuManagement />} />
//                 <Route path="orders" element={<OrderManagement />} />
//                 <Route path="billing" element={<BillingManagement />} />
//                 <Route path="spaces" element={<SpaceManagement />} />
//                 <Route path="tasks" element={<TaskManagement />} />
//                 <Route path="expenses" element={<ExpenseManagement />} />
//                 <Route path="reports" element={<ReportsAnalytics />} />
//                 <Route path="employees" element={<EmployeeManagement />} />
//                 <Route path="permission-management" element={<PermissionManagement />} />
//               </Route>

//               {/* Catch all route */}
//               <Route path="*" element={<NotFoundPage />} />
//             </Routes>
//           </Suspense>
//         </div>
//       </Router>
//     </Provider>
//   );
// }

// // You'll need to import Link for the 404 page
// import { Link, Outlet } from 'react-router-dom';

// export default App;





// import React, { Suspense, lazy } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Provider } from 'react-redux';
// import store from './store/store';

// // Lazy load components
// const RoleBasedLayout = lazy(() => import('./pages/RoleBasedLayout'));
// const Login = lazy(() => import('./components/LoginForm'));
// const Dashboard = lazy(() => import('./pages/Dashboard'));
// const MenuManagement = lazy(() => import('./pages/MenuManagement'));
// const OrderManagement = lazy(() => import('./pages/OrderManagement'));
// const BillingManagement = lazy(() => import('./pages/BillingManagement'));
// const SpaceManagement = lazy(() => import('./pages/SpaceManagement'));
// const TaskManagement = lazy(() => import('./pages/TaskManagement'));
// const ExpenseManagement = lazy(() => import('./pages/ExpenseManagement'));
// const ReportsAnalytics = lazy(() => import('./pages/ReportsAnalytics'));
// const EmployeeManagement = lazy(() => import('./pages/EmployeeManagement'));
// const PermissionManagement = lazy(() => import('./pages/PermissionManagement'));

// // Public components
// const HomePage = lazy(() => import('./pages/Home'));
// const Navbar = lazy(() => import('./components/Navbar'));
// const Footer = lazy(() => import('./components/Footer'));

// // Loading component
// const LoadingSpinner = () => (
//   <div className="flex items-center justify-center h-64">
//     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//   </div>
// );

// // Public Layout
// const PublicLayout = () => (
//   <div className="min-h-screen flex flex-col">
//     <Navbar />
//     <main className="flex-1 pt-16">
//       <Outlet />
//     </main>
//     <Footer />
//   </div>
// );

// // 404 Page
// const NotFoundPage = () => (
//   <div className="min-h-screen flex flex-col">
//     <Navbar />
//     <main className="flex-1 pt-16 flex items-center justify-center">
//       <div className="container mx-auto px-4 py-16 text-center">
//         <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
//         <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
//         <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
//           Go Home
//         </Link>
//       </div>
//     </main>
//     <Footer />
//   </div>
// );

// function App() {
//   return (
//     <Provider store={store}>
//       <Router>
//         <div className="App">
//           <Suspense fallback={<LoadingSpinner />}>
//             <Routes>
//               {/* Redirect old merchant routes to new routes */}
//               <Route path="/merchant/dashboard" element={<Navigate to="/dashboard" replace />} />
//               <Route path="/merchant/employees" element={<Navigate to="/employees" replace />} />
//               <Route path="/merchant/spaces" element={<Navigate to="/spaces" replace />} />
//               <Route path="/merchant/tasks" element={<Navigate to="/tasks" replace />} />
//               <Route path="/merchant" element={<Navigate to="/dashboard" replace />} />

//               {/* Public Routes */}
//               <Route path="/" element={<PublicLayout />}>
//                 <Route index element={<HomePage />} />
//                 <Route path="home" element={<HomePage />} />
//                 <Route path="about" element={<div className="container mx-auto px-4 py-8"><h1>About Us</h1></div>} />
//                 <Route path="contact" element={<div className="container mx-auto px-4 py-8"><h1>Contact Us</h1></div>} />
//               </Route>

//               {/* Login Route */}
//               <Route path="/login" element={<Login />} />

//               {/* Role-Based Protected Routes */}
//               <Route path="/" element={<RoleBasedLayout />}>
//                 <Route index element={<Navigate to="/dashboard" replace />} />
//                 <Route path="dashboard" element={<Dashboard />} />
//                 <Route path="menu" element={<MenuManagement />} />
//                 <Route path="orders" element={<OrderManagement />} />
//                 <Route path="billing" element={<BillingManagement />} />
//                 <Route path="spaces" element={<SpaceManagement />} />
//                 <Route path="tasks" element={<TaskManagement />} />
//                 <Route path="expenses" element={<ExpenseManagement />} />
//                 <Route path="reports" element={<ReportsAnalytics />} />
//                 <Route path="employees" element={<EmployeeManagement />} />
//                 <Route path="permission-management" element={<PermissionManagement />} />
//               </Route>

//               {/* Catch all route */}
//               <Route path="*" element={<NotFoundPage />} />
//             </Routes>
//           </Suspense>
//         </div>
//       </Router>
//     </Provider>
//   );
// }

// import { Link, Outlet } from 'react-router-dom';
// export default App;




import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';

// Lazy load components
const RoleBasedLayout = lazy(() => import('./pages/RoleBasedLayout'));
const Login = lazy(() => import('./components/LoginForm'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MenuManagement = lazy(() => import('./pages/MenuManagement'));
const OrderManagement = lazy(() => import('./pages/OrderManagement'));
const BillingManagement = lazy(() => import('./pages/BillingManagement'));
const SpaceManagement = lazy(() => import('./pages/SpaceManagement'));
const TaskManagement = lazy(() => import('./pages/TaskManagement'));
const ExpenseManagement = lazy(() => import('./pages/ExpenseManagement'));
const ReportsAnalytics = lazy(() => import('./pages/ReportsAnalytics'));
const EmployeeManagement = lazy(() => import('./pages/EmployeeManagement'));
const PermissionManagement = lazy(() => import('./pages/PermissionManagement'));

// Public components
const HomePage = lazy(() => import('./pages/Home'));
const Navbar = lazy(() => import('./components/Navbar'));
const Footer = lazy(() => import('./components/Footer'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Public Layout
const PublicLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 pt-16">
      <Outlet />
    </main>
    <Footer />
  </div>
);

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
              <Route path="/merchant" element={<Navigate to="/dashboard" replace />} />
              
              {/* Add redirects for other roles too */}
              <Route path="/supervisor/dashboard" element={<Navigate to="/dashboard" replace />} />
              <Route path="/supervisor/orders" element={<Navigate to="/orders" replace />} />
              <Route path="/supervisor/billing" element={<Navigate to="/billing" replace />} />
              <Route path="/supervisor" element={<Navigate to="/dashboard" replace />} />
              
              <Route path="/manager/dashboard" element={<Navigate to="/dashboard" replace />} />
              <Route path="/manager/employees" element={<Navigate to="/employees" replace />} />
              <Route path="/manager" element={<Navigate to="/dashboard" replace />} />
              
              <Route path="/staff/dashboard" element={<Navigate to="/dashboard" replace />} />
              <Route path="/staff/orders" element={<Navigate to="/orders" replace />} />
              <Route path="/staff" element={<Navigate to="/dashboard" replace />} />

              {/* Public Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="home" element={<HomePage />} />
                <Route path="about" element={<div className="container mx-auto px-4 py-8"><h1>About Us</h1></div>} />
                <Route path="contact" element={<div className="container mx-auto px-4 py-8"><h1>Contact Us</h1></div>} />
              </Route>

              {/* Login Route */}
              <Route path="/login" element={<Login />} />

              {/* Role-Based Protected Routes - UNIFIED PATHS */}
              <Route path="/" element={<RoleBasedLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="menu" element={<MenuManagement />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="billing" element={<BillingManagement />} />
                <Route path="spaces" element={<SpaceManagement />} />
                <Route path="tasks" element={<TaskManagement />} />
                <Route path="expenses" element={<ExpenseManagement />} />
                <Route path="reports" element={<ReportsAnalytics />} />
                <Route path="employees" element={<EmployeeManagement />} />
                <Route path="permission-management" element={<PermissionManagement />} />
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

import { Link, Outlet } from 'react-router-dom';
export default App;