import React from 'react';

const OrderBill = ({ order, onClose }) => {
  if (!order) return null;

  const printBill = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6 text-center">
          <h1 className="text-2xl font-bold">RESTAURANT BILL</h1>
          <p className="text-sm mt-2">Order #{order.orderId}</p>
        </div>

        {/* Bill Content */}
        <div className="p-6 space-y-4">
          {/* Table Info */}
          <div className="border-b-2 border-gray-300 pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Table</p>
                <p className="text-lg font-bold">{order.tableName}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Space Type</p>
                <p className="text-lg font-bold">{order.spaceType}</p>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-gray-600 text-sm">Date & Time</p>
              <p className="font-semibold">{new Date(order.completedAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Items */}
          <div className="border-b-2 border-gray-300 pb-4">
            <h3 className="font-bold text-lg mb-3">Items</h3>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-gray-600">x{item.quantity}</p>
                  </div>
                  <p className="font-semibold">₹{(item.subtotal || item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Details */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-semibold">₹{order.totalBill?.toFixed(2)}</span>
            </div>
            


            <div className="flex justify-between border-t-2 border-gray-300 pt-2 mt-2">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-lg text-green-600">₹{order.finalAmount?.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-gray-100 p-3 rounded text-center">
            <p className="text-sm text-gray-600">Payment Method</p>
            <p className="font-bold text-lg capitalize">{order.paymentMethod}</p>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
              <p className="text-sm font-semibold text-gray-700">Notes:</p>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t-2 border-gray-300 pt-4 text-center">
            <p className="text-sm text-gray-600">Thank You!</p>
            <p className="text-xs text-gray-500 mt-1">Please visit again</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 bg-gray-50 border-t">
          <button
            onClick={printBill}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            🖨️ Print
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderBill;
