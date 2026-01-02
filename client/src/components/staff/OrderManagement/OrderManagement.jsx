import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, createOrder, deleteOrder, cancelOrder } from '../../../store/slices/orderSlice';
import { useSelector as useTableSelector } from 'react-redux';
import { fetchTables } from '../../../store/slices/tableSlice';
import { fetchMenuItems } from '../../../store/slices/menuSlice';

const OrderManagement = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [createOrderStep, setCreateOrderStep] = useState('selectTable');
  const [selectedTable, setSelectedTable] = useState(null);
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {activeOrders.map((order) => (
        <div key={order._id} className="border rounded-xl p-5 bg-white shadow-sm border-l-4 border-l-yellow-500">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-bold text-slate-800">{order.tableName}</h3>
              <p className="text-xs text-slate-400 uppercase font-bold">{order.spaceType}</p>
            </div>
            <span className="px-2 py-1 text-[10px] rounded-full font-bold uppercase bg-yellow-100 text-yellow-700 border border-yellow-200">
              {order.status}
            </span>
          </div>
          <div className="space-y-2 mb-4 max-h-32 overflow-y-auto pr-2">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm text-slate-600">
                <span>{item.name} <span className="text-slate-400">x{item.quantity}</span></span>
                <span className="font-medium text-slate-800">₹{item.subtotal}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t flex justify-between items-center">
            <span className="text-slate-400 text-sm font-bold">Total Bill</span>
            <span className="text-lg font-black text-slate-900">₹{order.totalBill}</span>
          </div>
          {/* Cancel button for non-served/cancelled orders */}
          {order.status !== 'served' && order.status !== 'cancelled' && (
            <button
              onClick={() => handleCancelOrder(order._id)}
              className="mt-4 w-full py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700"
            >
              Cancel Order
            </button>
          )}
          {/* Print Bill button only if payment is completed */}
          {order.status === 'completed' && (
            <button
              className="mt-2 w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700"
              onClick={() => window.print && window.print()}
            >
              Print Bill
            </button>
          )}
        </div>
      ))}
    </div>
  );

  const renderCompletedTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {completedOrders.map((order) => (
        <div key={order._id} className="border rounded-xl p-5 bg-white shadow-sm opacity-80 grayscale-[0.5]">
          <div className="flex justify-between mb-2">
            <h3 className="font-bold text-lg text-slate-700">{order.tableName}</h3>
            <span className="text-green-600 text-[10px] font-bold px-2 py-1 bg-green-50 rounded uppercase border border-green-100">COMPLETED</span>
          </div>
          <p className="text-2xl font-black text-slate-900">₹{order.totalBill}</p>
          <p className="text-[10px] text-slate-400 mt-2">Order ID: {order.orderId}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black text-slate-900">Order Management</h1>
        <button 
          onClick={() => { setCreateOrderStep('selectTable'); setShowCreateOrderModal(true); setSelectedMenuItems([]); }} 
          className="px-6 py-3 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-all"
        >
          + New Order
        </button>
      </div>

      <div className="flex gap-4 mb-8">
        <button onClick={() => setActiveTab('active')} className={`px-8 py-3 rounded-2xl font-bold transition-all ${activeTab === 'active' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-white text-slate-400 hover:bg-slate-100'}`}>
          🔄 Active ({activeOrders.length})
        </button>
        <button onClick={() => setActiveTab('completed')} className={`px-8 py-3 rounded-2xl font-bold transition-all ${activeTab === 'completed' ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-white text-slate-400 hover:bg-slate-100'}`}>
          ✅ Completed ({completedOrders.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 font-bold animate-pulse">Syncing data...</div>
      ) : (
        activeTab === 'active' ? renderActiveTab() : renderCompletedTab()
      )}

      {/* CREATE ORDER MODAL */}
      {showCreateOrderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-green-600 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{createOrderStep === 'selectTable' ? 'Select Table' : 'Add Menu Items'}</h2>
                {selectedTable && <p className="text-green-100 text-sm">Table: {selectedTable.tableName}</p>}
              </div>
              <button onClick={() => setShowCreateOrderModal(false)} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">✕</button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              {createOrderStep === 'selectTable' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {availableTables.map((table) => (
                    <button key={table._id} onClick={() => { setSelectedTable(table); setCreateOrderStep('selectMenu'); }} 
                            className="p-5 border-2 border-slate-100 rounded-2xl hover:border-green-600 hover:bg-green-50 text-left transition-all">
                      <h3 className="font-bold text-xl text-slate-800">{table.tableName}</h3>
                      <p className="text-xs text-slate-400 uppercase font-bold mt-1">{table.spaceType}</p>
                    </button>
                  ))}
                  {availableTables.length === 0 && <p className="col-span-full text-center py-10 text-slate-400">No tables available.</p>}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Menu Search */}
                  <input 
                    type="text" 
                    placeholder="Search menu..." 
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)} 
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 outline-none" 
                  />
                  
                  {/* Menu List */}
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {menuItems
                      .filter(mi => (mi.name || mi.itemName).toLowerCase().includes(menuSearch.toLowerCase()))
                      .map(item => (
                      <div key={item._id} className="flex justify-between items-center p-4 border border-slate-100 rounded-2xl bg-white shadow-sm">
                        <div className="font-bold text-slate-800">{item.name || item.itemName} <span className="text-green-600 ml-2">₹{item.price}</span></div>
                        <button onClick={() => handleAddMenuItem(item)} className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-600 transition-colors">Add</button>
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  {selectedMenuItems.length > 0 && (
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <h3 className="font-bold mb-4 text-slate-500 uppercase text-xs tracking-widest">Order Summary</h3>
                      <div className="space-y-3">
                        {selectedMenuItems.map(item => (
                          <div key={item._id} className="flex justify-between items-center text-sm">
                            <span className="font-medium text-slate-700">{item.name || item.itemName}</span>
                            <div className="flex items-center gap-3">
                              <button onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center border shadow-sm">-</button>
                              <span className="font-bold">{item.quantity}</span>
                              <button onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center border shadow-sm">+</button>
                              <span className="font-bold text-slate-900 w-16 text-right">₹{item.price * item.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between items-center">
                        <span className="font-bold text-slate-500 text-lg uppercase">Total</span>
                        <span className="text-2xl font-black text-green-700">₹{calculateTotal()}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setCreateOrderStep('selectTable')} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200">Go Back</button>
                    <button onClick={handleSubmitOrder} className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-bold shadow-xl shadow-green-100" disabled={selectedMenuItems.length === 0}>Place Order</button>
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