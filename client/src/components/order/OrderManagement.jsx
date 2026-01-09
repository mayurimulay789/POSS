import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, createOrder,cancelOrder } from '../../store/slices/orderSlice';
import { useSelector as useTableSelector } from 'react-redux';
import { fetchTables } from '../../store/slices/tableSlice';
import { fetchMenuItems } from '../../store/slices/menuSlice';

const OrderManagement = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [createOrderStep, setCreateOrderStep] = useState('selectTable');
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedMenuItems, setSelectedMenuItems] = useState([]);
  const [menuSearch, setMenuSearch] = useState('');

  // Redux selectors
  const orders = useSelector(state => state.order.items) || [];
  const loading = useSelector(state => state.order.loading);
  const tables = useTableSelector(state => state.table.items) || [];
  const menuItems = useSelector(state => state.menu.items) || [];

  // Logic to separate orders for the two tabs
  const activeOrders = orders.filter(o => 
    ['pending', 'served', 'payment_pending', 'occupied'].includes(o.status)
  );
  const completedOrders = orders.filter(o => o.status === 'completed');

  useEffect(() => {
    dispatch(fetchOrders()); 
    dispatch(fetchTables());
    dispatch(fetchMenuItems());
  }, [dispatch]);

  // Tables are available if status is 'available'
  const availableTables = tables.filter(t => 
    t.status === 'available' && !(t.spaceType || '').toLowerCase().includes('spa')
  );

  const calculateTotal = () => selectedMenuItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await dispatch(cancelOrder(orderId)).unwrap();
        dispatch(fetchOrders());
        dispatch(fetchTables());
        alert('Order cancelled and table cleared!');
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order: ' + (error || 'Unknown error'));
      }
    }
  };

  const handleAddMenuItem = (item) => {
    const existingItem = selectedMenuItems.find(i => i._id === item._id);
    if (existingItem) {
      setSelectedMenuItems(selectedMenuItems.map(i => 
        i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setSelectedMenuItems([...selectedMenuItems, { ...item, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (id, newQty) => {
    if (newQty < 1) {
      setSelectedMenuItems(selectedMenuItems.filter(item => item._id !== id));
    } else {
      setSelectedMenuItems(selectedMenuItems.map(item => 
        item._id === id ? { ...item, quantity: newQty } : item
      ));
    }
  };

  const handleSubmitOrder = () => {
    if (selectedMenuItems.length === 0) return alert('Please select menu items');
    
    const orderData = {
      tableId: selectedTable._id,
      tableName: selectedTable.tableName,
      spaceType: selectedTable.spaceType || 'Tables',
      items: selectedMenuItems.map(item => ({
        id: item._id, // Matches backend schema
        name: item.name || item.itemName,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      })),
      totalBill: calculateTotal()
    };

    dispatch(createOrder(orderData)).then(() => {
      dispatch(fetchOrders()); 
      dispatch(fetchTables()); 
      setShowCreateOrderModal(false);
      alert("Order Created Successfully!");
    });
  };

 const renderActiveTab = () => (
  <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
    {activeOrders.map((order) => (
      <div
        key={order._id}
        className="relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
      >
        {/* Left Accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />

        {/* HEADER */}
        <div className="px-6 py-4 flex items-center justify-between border-b bg-gray-50">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {order.tableName || "Table —"}
            </div>
            <div className="text-xs text-gray-400 uppercase">
              {order.spaceType}
            </div>
          </div>

          <span className="text-xs font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            {order.status}
          </span>
        </div>

        {/* BODY */}
        <div className="px-4 py-5 space-y-4">

          {/* ITEMS (SCROLLABLE) */}
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">
              Items
            </div>

            {order.items && order.items.length > 0 ? (
              <div className="max-h-32 overflow-y-auto border rounded-lg">
                <ul className="divide-y text-sm">
                  {order.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 flex justify-between"
                    >
                      <span className="text-gray-700">
                        {item.name}
                        <span className="text-gray-400 ml-1">
                          ×{item.quantity}
                        </span>
                      </span>
                      <span className="font-medium text-gray-900">
                        ₹{item.subtotal}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-xs text-gray-400">
                No items
              </div>
            )}
          </div>

          {/* BILL */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">
                Total Bill
              </span>
              <span className="text-xl font-bold text-emerald-600">
                ₹{order.totalBill}
              </span>
            </div>
          </div>

          {/* ACTIONS */}
          {order.status !== "served" && order.status !== "cancelled" && (
            <button
              onClick={() => handleCancelOrder(order._id)}
              className="w-full py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
            >
              Cancel Order
            </button>
          )}

          {order.status === "completed" && (
            <button
              onClick={() => window.print && window.print()}
              className="w-full py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Print Bill
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
);





const renderCompletedTab = () => (
  <>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 ">
      {completedOrders.map((order) => (
        <div
          key={order._id}
          className="relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
        >
          {/* Left Accent */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />

          {/* HEADER */}
          <div className="px-6 py-4 flex items-center justify-between border-b bg-gray-50">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {order.tableName || "Table —"}
              </div>
              <div className="text-xs text-gray-400">
                ORD-{order.orderId || order._id}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                COMPLETED
              </span>
              <div className="text-[11px] text-gray-400 mt-1">
                {order.completedAt
                  ? new Date(order.completedAt).toLocaleString()
                  : "-"}
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="px-4 py-5 space-y-4">

            {/* BILL SUMMARY (NOW ON TOP) */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                Bill Summary
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">
                    ₹{order.totalBill?.toFixed(2) ?? "0.00"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="font-medium text-red-500">
                    −₹{order.discountApplied?.toFixed(2) ?? "0.00"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium">
                    ₹{order.taxAmount?.toFixed(2) ?? "0.00"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Other</span>
                  <span className="font-medium">
                    ₹{order.optionalcharge?.toFixed(2) ?? "0.00"}
                  </span>
                </div>

                <div className="border-t pt-3 mt-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">
                    TOTAL
                  </span>
                  <span className="text-xl font-bold text-emerald-600">
                    ₹
                    {order.finalAmount?.toFixed(2) ??
                      order.totalBill?.toFixed(2) ??
                      "0.00"}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500 text-right">
                Payment:{" "}
                <span className="font-medium text-gray-800">
                  {order.paymentMethod || order.paymentType || "-"}
                </span>
              </div>
            </div>

            {/* ITEMS BUTTON */}
            <div className="flex justify-between items-center">
              <div className="text-xs uppercase tracking-wide text-gray-400">
                Items
              </div>
              <button
                onClick={() => setSelectedOrder(order)}
                className="text-sm font-medium text-emerald-600 hover:underline"
              >
                View Items ({order.items?.length ?? 0})
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* ITEMS MODAL */}
    {selectedOrder && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-xl">
          
          {/* Modal Header */}
          <div className="px-5 py-4 border-b flex justify-between items-center">
            <div className="font-semibold text-gray-900">
              Items – {selectedOrder.tableName || "Order"}
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto max-h-[60vh]">
            {selectedOrder.items && selectedOrder.items.length > 0 ? (
              <ul className="divide-y text-sm">
                {selectedOrder.items.map((item, idx) => (
                  <li
                    key={idx}
                    className="px-5 py-3 flex justify-between"
                  >
                    <span className="text-gray-700">
                      {item.name}
                      <span className="text-gray-400 ml-1">
                        ×{item.quantity}
                      </span>
                    </span>
                    <span className="font-medium">
                      ₹
                      {(
                        item.subtotal ||
                        item.price * item.quantity ||
                        0
                      ).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-5 text-xs text-gray-400">
                No items
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </>
);







return (
  <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">

    {/* HEADER */}
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
      <h1 className="text-xl sm:text-2xl font-black text-slate-900">
        Order Management
      </h1>

      <button
        onClick={() => {
          setCreateOrderStep('selectTable');
          setShowCreateOrderModal(true);
          setSelectedMenuItems([]);
        }}
        className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-all"
      >
        + New Order
      </button>
    </div>

    {/* TABS */}
    <div className="flex gap-3 mb-6">
      <button
        onClick={() => setActiveTab('active')}
        className={`flex-1 sm:flex-none px-6 py-3 rounded-2xl font-bold transition-all
          ${activeTab === 'active'
            ? 'bg-amber-500 text-white shadow-lg shadow-amber-100'
            : 'bg-white text-slate-400 hover:bg-slate-100'}
        `}
      >
        🔄 Active ({activeOrders.length})
      </button>

      <button
        onClick={() => setActiveTab('completed')}
        className={`flex-1 sm:flex-none px-6 py-3 rounded-2xl font-bold transition-all
          ${activeTab === 'completed'
            ? 'bg-green-600 text-white shadow-lg shadow-green-100'
            : 'bg-white text-slate-400 hover:bg-slate-100'}
        `}
      >
        ✅ Completed ({completedOrders.length})
      </button>
    </div>

    {/* CONTENT */}
    {loading ? (
      <div className="text-center py-20 text-slate-400 font-bold animate-pulse">
        Syncing data...
      </div>
    ) : (
      activeTab === 'active' ? renderActiveTab() : renderCompletedTab()
    )}

    {/* CREATE ORDER MODAL */}
   {showCreateOrderModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">

    {/* MODAL */}
    <div
      className="
        bg-white w-full h-full sm:h-auto
        sm:max-w-2xl sm:max-h-[92vh]
        rounded-t-3xl sm:rounded-3xl
        shadow-[0_25px_60px_rgba(0,0,0,0.15)]
        flex flex-col overflow-hidden
      "
    >
      {/* HEADER */}
      <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-green-600 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            {createOrderStep === 'selectTable'
              ? 'Select Table'
              : 'Add Menu Items'}
          </h2>
          {selectedTable && (
            <p className="text-green-100 text-sm mt-1">
              Table · {selectedTable.tableName}
            </p>
          )}
        </div>

        <button
          onClick={() => setShowCreateOrderModal(false)}
          className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
        >
          ✕
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-6 bg-slate-50">

        {/* STEP 1 : SELECT TABLE */}
        {createOrderStep === 'selectTable' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {availableTables.map((table) => (
              <button
                key={table._id}
                onClick={() => {
                  setSelectedTable(table);
                  setCreateOrderStep('selectMenu');
                }}
                className="
                  bg-white border border-slate-200
                  rounded-2xl p-5 text-left
                  hover:border-emerald-500 hover:shadow-md
                  transition-all
                "
              >
                <h3 className="text-lg font-semibold text-slate-800">
                  {table.tableName}
                </h3>
                <p className="text-xs uppercase tracking-wide text-slate-400 mt-1">
                  {table.spaceType}
                </p>
              </button>
            ))}

            {availableTables.length === 0 && (
              <p className="col-span-full text-center py-12 text-slate-400">
                No tables available
              </p>
            )}
          </div>
        ) : (
          /* STEP 2 : MENU */
          <div className="space-y-6">

            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search menu items…"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              className="
                w-full px-5 py-4 rounded-2xl
                bg-white border border-slate-200
                focus:ring-2 focus:ring-emerald-500 outline-none
              "
            />

            {/* MENU LIST */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {menuItems
                .filter(mi =>
                  (mi.name || mi.itemName)
                    .toLowerCase()
                    .includes(menuSearch.toLowerCase())
                )
                .map(item => (
                  <div
                    key={item._id}
                    className="
                      flex justify-between items-center
                      bg-white rounded-2xl
                      border border-slate-200
                      px-5 py-4
                      hover:shadow-sm transition
                    "
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        {item.name || item.itemName}
                      </p>
                      <p className="text-sm text-emerald-600 font-semibold">
                        ₹{item.price}
                      </p>
                    </div>

                    <button
                      onClick={() => handleAddMenuItem(item)}
                      className="
                        px-4 py-2 rounded-xl
                        bg-slate-900 text-white
                        text-sm font-semibold
                        hover:bg-emerald-600 transition
                      "
                    >
                      Add
                    </button>
                  </div>
                ))}
            </div>

            {/* CART (RECEIPT STYLE) */}
            {selectedMenuItems.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                  Order Summary
                </h3>

                <div className="space-y-4">
                  {selectedMenuItems.map(item => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-slate-700 font-medium">
                        {item.name || item.itemName}
                      </span>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item._id, item.quantity - 1)
                          }
                          className="w-7 h-7 rounded-full border bg-slate-50"
                        >
                          −
                        </button>

                        <span className="font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            handleUpdateQuantity(item._id, item.quantity + 1)
                          }
                          className="w-7 h-7 rounded-full border bg-slate-50"
                        >
                          +
                        </button>

                        <span className="w-16 text-right font-semibold">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-5 pt-4 flex justify-between items-center">
                  <span className="uppercase text-slate-400 text-sm font-semibold">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-emerald-600">
                    ₹{calculateTotal()}
                  </span>
                </div>
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-6 pt-2">
              <button
                onClick={() => setCreateOrderStep('selectTable')}
                className="py-4 rounded-2xl bg-slate-200 text-slate-600 font-semibold px-4 hover:bg-red-300"
              >
                Back
              </button>

              <button
                onClick={handleSubmitOrder}
                disabled={selectedMenuItems.length === 0}
                className="
                  py-4 rounded-2xl px-3
                  bg-emerald-600 text-white
                  font-bold
                  shadow-lg shadow-emerald-200
                  disabled:opacity-50
                  hover:bg-red-500  
                "
              >
                Place Order
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  </div>
)}

  </div>
);







};

export default OrderManagement;