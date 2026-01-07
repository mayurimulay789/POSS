// src/hooks/useDashboard.js
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData, clearDashboardData } from '../store/slices/dashboardSlice';

export const useDashboard = () => {
  const dispatch = useDispatch();
  const { data, loading, error, role, lastFetched } = useSelector((state) => state.dashboard);
  const { user } = useSelector((state) => state.auth);

  // const loadDashboard = useCallback(() => {
  //   if (user?.role) {
  //     dispatch(fetchDashboardData(user.role));
  //   }
  // }, [dispatch, user?.role]);

  const loadDashboard = useCallback(() => {
    if (user?.role) {
      console.log("Loading dashboard for role:", user.role);
      dispatch(fetchDashboardData(user.role));
    }
  }, [dispatch, user?.role]);

  const refreshDashboard = useCallback(() => {
    dispatch(clearDashboardData());
    loadDashboard();
  }, [dispatch, loadDashboard]);

  useEffect(() => {
    // Load dashboard when user changes or component mounts
    if (user?.role) {
      const isStale = lastFetched && Date.now() - lastFetched > 5 * 60 * 1000; // 5 minutes
      
      if (!data || role !== user.role || isStale) {
        loadDashboard();
      }
    }
  }, [user, data, role, lastFetched, loadDashboard]);

  return {
    data,
    loading,
    error,
    refreshDashboard,
    userRole: user?.role,
  };
};

