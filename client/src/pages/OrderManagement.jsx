// // src/pages/OrderManagement.jsx
// import React from 'react';
// import { useSelector } from 'react-redux';

// // Import role-specific order management components
// import MerchantOrderManagement from '../components/merchant/OrderManagement/OrderManagement';
// import ManagerOrderManagement from '../components/manager/OrderManagement/OrderManagement';
// import SupervisorOrderManagement from '../components/supervisor/OrderManagement/OrderManagement';
// import StaffOrderManagement from '../components/staff/OrderManagement/OrderManagement';

// const OrderManagement = () => {
//   const { user } = useSelector(state => state.auth);

//   const renderOrderManagement = () => {
//     switch (user?.role) {
//       case 'merchant':
//         return <MerchantOrderManagement />;
//       case 'manager':
//         return <ManagerOrderManagement />;
//       case 'supervisor':
//         return <SupervisorOrderManagement />;
//       case 'staff':
//         return <StaffOrderManagement />;
//       default:
//         return <div>Unauthorized</div>;
//     }
//   };

//   return renderOrderManagement();
// };


// export default OrderManagement;








import React from 'react';
import { useSelector } from 'react-redux';

// Import role-specific order management components

import OrderManagementComponent from '../components/order/OrderManagement';

const OrderManagement = () => {
  const { user } = useSelector(state => state.auth);

  const renderOrderManagement = () => {
    switch (user?.role) {
      case 'merchant':
        return <OrderManagementComponent />;
      case 'manager':
        return <OrderManagementComponent />;
      case 'supervisor':
        return <OrderManagementComponent />;
      case 'staff':
        return <OrderManagementComponent />;
      default:
        return <div>Unauthorized</div>;
    }
  };

  return renderOrderManagement();
};

export default OrderManagement;

