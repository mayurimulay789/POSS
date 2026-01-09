import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrder } from '../../../store/slices/orderSlice';
import { fetchTables } from '../../../store/slices/tableSlice';
import {
  getSystemCharges,
  getOptionalCharges,
  getSystemChargesSummary,
} from '../../../store/slices/chargeSlice';

const BillingManagement = () => {
  const dispatch = useDispatch();
  const { items: orders, loading } = useSelector(state => state.order);
  const [activeTab, setActiveTab] = useState('kot');
  const [selectedPayment, setSelectedPayment] = useState({});
  const [discountVisible, setDiscountVisible] = useState({});
  const [discounts, setDiscounts] = useState({});
  // const [optionalcharge, setOptionalcharge] = useState({});
  const [optionalChargesVisible, setOptionalChargesVisible] = useState({});
  const [selectedOptionalCharges, setSelectedOptionalCharges] = useState({});




  const {
    optionalCharges,
    systemChargesSummary,
  } = useSelector((state) => state.charges);

  // Filter orders based on status
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const servedOrders = orders.filter(o => o.status === 'payment_pending' || o.status === 'served');
  const completedOrders = orders.filter(o => o.status === 'completed');


  useEffect(() => {
    dispatch(getSystemCharges());
    dispatch(getOptionalCharges());
    dispatch(getSystemChargesSummary());
  }, [dispatch]);

  useEffect(() => {
    if (activeTab === 'completed') {
      dispatch(fetchOrders('completed'));
    } else if (activeTab === 'print-bill') {
      dispatch(fetchOrders('payment_pending'));
    } else {
      dispatch(fetchOrders('pending'));
    }
  }, [activeTab, dispatch]);
  // All data is now managed via Redux thunks/selectors. No direct API calls here.


  const calculateChargeAmount = (charge, orderTotal) => {
    if (charge.chargeType === 'percentage') {
      // Calculate percentage of order total
      return (orderTotal * charge.value) / 100;
    } else {
      // Fixed amount
      return charge.value;
    }
  };



  const calculateOptionalChargesTotal = (orderId, orderTotal) => {
    const selectedCharges = selectedOptionalCharges[orderId] || [];
    return selectedCharges.reduce((total, charge) => {
      return total + calculateChargeAmount(charge, orderTotal);
    }, 0);
  };


  const markServed = async (order) => {
    try {
      await dispatch(updateOrder({
        id: order._id,
        data: { status: 'payment_pending' }
      })).unwrap();
      dispatch(fetchOrders('pending'));
    } catch (error) {
      console.error('Error marking order as served:', error);
      alert('Failed to mark order as served');
    }
  };

  const toggleOptionalCharge = (orderId, charge, orderTotal) => {
    setSelectedOptionalCharges(prev => {
      const currentCharges = prev[orderId] || [];
      const isAlreadySelected = currentCharges.some(c => c._id === charge._id);

      if (isAlreadySelected) {
        // Remove charge
        return {
          ...prev,
          [orderId]: currentCharges.filter(c => c._id !== charge._id)
        };
      } else {
        // Add charge with calculated amount
        const calculatedAmount = calculateChargeAmount(charge, orderTotal);
        const chargeWithAmount = {
          ...charge,
          amount: calculatedAmount
        };

        return {
          ...prev,
          [orderId]: [...currentCharges, chargeWithAmount]
        };
      }
    });
  };

  const markCompleted = async (order) => {
    try {
      const paymentMethod = selectedPayment[order._id] || 'cash';
      await dispatch(updateOrder({
        id: order._id,
        data: {
          status: 'completed',
          paymentMethod: paymentMethod,
          discountApplied: parseFloat(discounts[order._id]) || 0,
          systemChargeTax: systemChargesSummary?.totalSystemChargeRate || 0,
          systemChargeAmmount: systemChargesSummary?.totalSystemChargesAmount || 0,
          optionalcharge: calculateOptionalChargesTotal(order._id, order.totalBill || 0),
          completedAt: new Date()
        }
      })).unwrap();
      dispatch(fetchOrders('payment_pending'));
      dispatch(fetchTables());
      alert('Payment completed successfully!');
    } catch (error) {
      console.error('Error completing payment:', error);
      alert('Failed to complete payment');
    }
  };

  const handlePrint = async (order) => {
    const paymentMethod = selectedPayment[order._id] || 'cash';
    const printOrder = await dispatch(updateOrder({
      id: order._id,
      data: {
        status: 'payment_pending',
        paymentMethod: paymentMethod,
        discountApplied: parseFloat(discounts[order._id]) || 0,
        systemChargeTax: systemChargesSummary?.totalSystemChargeRate || 0,
        systemChargeAmmount: systemChargesSummary?.totalSystemChargesAmount || 0,
        optionalcharge: calculateOptionalChargesTotal(order._id, order.totalBill || 0),
        completedAt: new Date()
      }
    })).unwrap();

    console.log("order in print", printOrder.data);
    order = printOrder.data;



    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Bill - ${order.tableName}</title>
    <style>
      body { 
        font-family: Arial, sans-serif; 
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
        background: #fff;
      }
      .header { 
        text-align: center; 
        margin-bottom: 30px; 
        border-bottom: 2px solid #000; 
        padding-bottom: 15px;
      }
      .restaurant-name {
        font-size: 28px;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 5px;
      }
      .restaurant-address {
        font-size: 14px;
        color: #666;
        margin-bottom: 10px;
      }
      .bill-details { 
        margin-bottom: 25px;
        background: #f8f9fa;
        padding: 15px;
        border-radius: 5px;
        display: flex;
        justify-content: space-between;
        border: 1px solid #ddd;
      }
      .bill-info {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      table { 
        width: 100%; 
        border-collapse: collapse; 
        margin-bottom: 20px;
        border: 1px solid #ddd;
      }
      th { 
        background-color: #2c3e50; 
        color: white;
        font-weight: bold;
        padding: 12px 8px;
        text-align: left;
        border: 1px solid #444;
      }
      td { 
        padding: 10px 8px; 
        border: 1px solid #ddd;
        text-align: left;
      }
      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      .subtotal-row {
        background-color: #f2f2f2;
        font-weight: bold;
      }
      .discount-row {
        background-color: #f8f9fa;
        color: #27ae60;
      }
      .tax-row {
        background-color: #f8f9fa;
      }
      .charges-row {
        background-color: #f8f9fa;
      }
      .total-row {
        background-color: #2c3e50;
        color: white;
        font-weight: bold;
        font-size: 16px;
      }
      .final-row {
        background-color: #27ae60;
        color: white;
        font-weight: bold;
        font-size: 18px;
      }
      .empty-row {
        background-color: white;
        border: none;
      }
      .section-title {
        background-color: #34495e;
        color: white;
        font-weight: bold;
        text-align: center;
        padding: 8px;
        font-size: 16px;
        border: 1px solid #34495e;
      }
      .payment-method {
        background-color: #e8f4fc;
        font-weight: bold;
      }
      .thank-you {
        text-align: center;
        margin-top: 30px;
        padding: 20px;
        border-top: 2px dashed #ddd;
        color: #666;
      }
      .thank-you h2 {
        color: #2c3e50;
        margin-bottom: 10px;
      }
      .print-btn {
        padding: 12px 30px;
        font-size: 16px;
        cursor: pointer;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        margin: 20px auto;
        display: block;
        font-weight: bold;
      }
      .print-btn:hover {
        background-color: #45a049;
      }
      @media print { 
        .print-btn { display: none; } 
        body { padding: 10px; }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="restaurant-name">Discount Feast</div>
      <div class="restaurant-address">123 Restaurant Street, Pune, Maharashtra - 411017</div>
    </div>

    <div class="bill-details">
      <div class="bill-info">
        <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
        <div><strong>Time:</strong> ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
      <div class="bill-info">
        <div><strong>Table No:</strong> ${order.tableName}</div>
        <div><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</div>
         
        
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40%;">Item Description</th>
          <th style="width: 15%; text-align: center;">Qty</th>
          <th style="width: 20%; text-align: right;">Price (₹)</th>
          <th style="width: 25%; text-align: right;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        <!-- Order Items -->
        ${(order.items || order.orderedMenu || []).map(item => `
          <tr>
            <td>${item.name}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">₹${item.price?.toFixed(2) || '0.00'}</td>
            <td style="text-align: right;">₹${((item.price || 0) * item.quantity).toFixed(2)}</td>
          </tr>
        `).join('')}
        
        <!-- Subtotal -->
        <tr class="subtotal-row">
          <td colspan="3" style="text-align: right;"><strong>Sub Total:</strong></td>
          <td style="text-align: right;"><strong>₹${order.totalBill?.toFixed(2) || '0.00'}</strong></td>
        </tr>
        
        <!-- Discount Row -->
        <tr class="discount-row">
          <td colspan="3" style="text-align: right;">Discount:</td>
          <td style="text-align: right;">- ₹${order.discountApplied?.toFixed(2) || '0.00'}</td>
        </tr>
        
        <!-- Optional Charges -->
        <tr class="charges-row">
          <td colspan="3" style="text-align: right;">Optional Charges:</td>
          <td style="text-align: right;">+ ₹${order.optionalcharge?.toFixed(2) || '0.00'}</td>
        </tr>
        
        <!-- Tax Amount -->
        <tr class="tax-row">
          <td colspan="3" style="text-align: right;">CGST & SGST (${systemChargesSummary?.totalSystemChargeRate || 0}%)</td>

          <td style="text-align: right;">+ ₹${order.taxAmount?.toFixed(2) || '0.00'}</td>
        </tr>
        
    
        <!-- Final Amount -->
        <tr class="final-row" style='margin-top:10px;'>
          <td colspan="3" style="text-align: right; ">TOTAL:</td>
          <td style="text-align: right;">₹${order.finalAmount?.toFixed(2) || order.totalBill?.toFixed(2) || '0.00'}</td>
        </tr>        
        <!-- Final Amount -->
        <tr class="final-row" style='margin-top:10px;'>
          <td colspan="3" style="text-align: right; ">TOTAL:</td>
          <td style="text-align: right;">₹${order.finalAmount?.toFixed(2) || order.totalBill?.toFixed(2) || '0.00'}</td>
        </tr>        
      </tbody>
    </table>
  </body>
  </html>
`);
    printWindow.document.close();
  };

  return (
    <div className="p-6">

      <button
        onClick={() => setActiveTab('completed')}
        className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'completed'
          ? 'border-b-2 border-blue-600 text-blue-600'
          : 'text-gray-600 hover:text-gray-800'
          }`}
      >
        Completed Bills
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Billing Management

      </h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('kot')}
          className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'kot'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          KOT
        </button>
        <button
          onClick={() => setActiveTab('print-bill')}
          className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'print-bill'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          Print Bill
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">

        {activeTab === 'kot' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">KOT (Kitchen Order Ticket)</h2>
            </div>
            {loading ? (
              <p className="text-gray-600">Loading orders...</p>
            ) : (pendingOrders && pendingOrders.length === 0) ? (
              <p className="text-gray-600">No pending orders right now.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingOrders && pendingOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border rounded-lg p-4 bg-slate-50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-500">{order.spaceType}</p>
                        <h3 className="text-lg font-semibold text-gray-800">{order.tableName}</h3>
                      </div>
                      <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800 font-semibold">
                        Pending
                      </span>
                    </div>
                    <div className="mb-2">
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Items</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {(order.items || order.orderedMenu || []).map((item, idx) => (
                          <div
                            key={`${order._id}-item-${idx}`}
                            className="flex justify-between text-sm bg-white rounded px-2 py-1 border"
                          >
                            <span className="truncate">{item.name}</span>
                            <span className="font-medium">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => markServed(order)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Mark as Served
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'print-bill' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Print Bill</h2>
            </div>
            {loading ? (
              <p className="text-gray-600">Loading served orders...</p>
            ) : (servedOrders && servedOrders.length === 0) ? (
              <p className="text-gray-600">No served orders available for billing.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {servedOrders && servedOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border rounded-lg p-4 bg-slate-50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-500">{order.spaceType}</p>
                        <h3 className="text-lg font-semibold text-gray-800">{order.tableName}</h3>
                      </div>
                      <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 font-semibold">
                        Served
                      </span>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm font-semibold text-gray-800">Total: ₹{order.totalBill?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Items</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {(order.items || order.orderedMenu || []).map((item, idx) => (
                          <div
                            key={`${order._id}-item-${idx}`}
                            className="flex justify-between text-sm bg-white rounded px-2 py-1 border"
                          >
                            <span className="truncate">{item.name}</span>
                            <span className="font-medium">x{item.quantity} - ₹{((item.price || 0) * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                      <select
                        value={selectedPayment[order._id] || 'cash'}
                        onChange={(e) => setSelectedPayment({ ...selectedPayment, [order._id]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="card">Card</option>
                        <option value="online">Online</option>
                      </select>
                    </div>
                    <div className="mb-1">
                      {!discountVisible[order._id] ? (
                        <button
                          type="button"
                          onClick={() => setDiscountVisible({ ...discountVisible, [order._id]: true })}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
                        >
                          + Apply Discount
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-semibold text-gray-700">Discount (%)</label>
                            <button
                              type="button"
                              onClick={() => {
                                setDiscountVisible({ ...discountVisible, [order._id]: false });
                                setDiscounts({ ...discounts, [order._id]: '' });
                              }}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={discounts[order._id] || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                setDiscounts({ ...discounts, [order._id]: value });
                              } else {
                                const numValue = Math.min(100, Math.max(0, parseInt(value, 10) || 0));
                                setDiscounts({ ...discounts, [order._id]: numValue });
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter discount percentage"
                            autoFocus
                          />
                          {discounts[order._id] && (
                            <p className="text-xs text-green-600">
                              Discount amount: ₹{((order.totalBill || 0) * (parseFloat(discounts[order._id]) / 100)).toFixed(2)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    {!optionalChargesVisible[order._id] ? (
                      <button
                        type="button"
                        onClick={() => setOptionalChargesVisible({ ...optionalChargesVisible, [order._id]: true })}
                        className="inline-flex items-center   text-sm font-medium rounded-lg text-blue-600 transition-colors pb-2"
                      >

                        +  Add Charges
                      </button>
                    ) : (
                      <div className="flex-1 min-w-[250px]">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-semibold text-gray-700">Optional Charges</label>
                            <button
                              type="button"
                              onClick={() => {
                                setOptionalChargesVisible({ ...optionalChargesVisible, [order._id]: false });
                              }}
                              className="text-xs text-red-600 hover:text-red-800 font-medium"
                            >
                              Close
                            </button>
                          </div>

                          {optionalCharges && optionalCharges.length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md bg-gray-50">
                              {optionalCharges.map((charge) => {
                                const isSelected = (selectedOptionalCharges[order._id] || [])
                                  .some(c => c._id === charge._id);
                                const calculatedAmount = calculateChargeAmount(charge, order.totalBill || 0);

                                return (
                                  <div
                                    key={charge._id}
                                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${isSelected
                                      ? 'bg-blue-50 border border-blue-200 shadow-sm'
                                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                                      }`}
                                    onClick={() => toggleOptionalCharge(order._id, charge, order.totalBill || 0)}
                                  >
                                    <div className="flex items-center">
                                      <div className={`w-4 h-4 flex items-center justify-center mr-2 border rounded ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                        }`}>
                                        {isSelected && (
                                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-800 block">
                                          {charge.chargeName}
                                        </span>
                                        {charge.chargeType === 'percentage' && (
                                          <span className="text-xs text-gray-500">
                                            {charge.value}% of ₹{(order.totalBill || 0).toFixed(2)} = ₹{calculatedAmount.toFixed(2)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className={`text-sm font-semibold px-2 py-1 rounded ${charge.chargeType === 'percentage'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-green-100 text-green-800'
                                        }`}>
                                        {charge.chargeType === 'percentage'
                                          ? `${charge.value}%`
                                          : `₹${charge.value}`}
                                      </span>
                                      {isSelected && (
                                        <div className="text-xs text-gray-600 mt-1">
                                          ₹{calculatedAmount.toFixed(2)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No optional charges available</p>
                          )}

                          {/* Selected Optional Charges Summary */}
                          {selectedOptionalCharges[order._id]?.length > 0 && (
                            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold text-blue-800">Selected Charges</p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedOptionalCharges(prev => {
                                      const newState = { ...prev };
                                      delete newState[order._id];
                                      return newState;
                                    });
                                  }}
                                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                                >
                                  Clear All
                                </button>
                              </div>
                              <div className="space-y-1.5">
                                {selectedOptionalCharges[order._id].map((charge) => (
                                  <div key={charge._id} className="flex justify-between items-center text-sm py-1.5 px-2 bg-white rounded border border-gray-100">
                                    <div className="flex items-center">
                                      <svg className="w-3 h-3 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      <div>
                                        <span className="text-gray-700">{charge.name}</span>
                                        {charge.chargeType === 'percentage' && (
                                          <div className="text-xs text-gray-500">
                                            {charge.value}% of ₹{(order.totalBill || 0).toFixed(2)}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <span className="font-semibold text-gray-800">₹{charge.amount?.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="border-t border-blue-200 mt-2 pt-2">
                                <div className="flex justify-between items-center text-sm font-bold">
                                  <span className="text-blue-900">Charges Total:</span>
                                  <span className="text-blue-900">₹{calculateOptionalChargesTotal(order._id, order.totalBill || 0).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePrint(order)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Print Bills
                      </button>
                      <button
                        onClick={() => markCompleted(order)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Payment Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Completed Bills</h2>
            </div>
            {loading ? (
              <p className="text-gray-600">Loading completed bills...</p>
            ) : (completedOrders && completedOrders.length === 0) ? (
              <p className="text-gray-600">No completed bills yet.</p>
            ) : (
              <div className="space-y-3">
                {completedOrders && completedOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border rounded-lg p-4 bg-green-50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-800">{order.tableName}</h3>
                          <span className="px-2 py-1 text-xs rounded bg-green-600 text-white font-semibold">
                            Completed
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{order.spaceType}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.completedAt || order.createdAt).toLocaleDateString()} {new Date(order.completedAt || order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-700">₹{order.totalBill?.toFixed(2) || order.finalAmount?.toFixed(2) || '0.00'}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          <span className="font-semibold">Payment:</span> {order.paymentMethod || 'cash'}
                        </p>
                      </div>
                    </div>
                    <div className="border-t pt-2">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Items:</p>
                      <div className="space-y-1">
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm text-gray-600"
                          >
                            <span>{item.name}</span>
                            <span>x{item.quantity} - ₹{(item.subtotal || (item.price * item.quantity))?.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-gray-600">
          {/* This is the BillingManagement component for merchant role. */}
        </p>
        {/* Add your BillingManagement content here */}

      </div>
    </div>
  );
};

export default BillingManagement;
