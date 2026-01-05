import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchLogo } from '../store/slices/logoSlice';
import { LogoManagement } from '../components/merchant';

const LogoManagementPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchLogo());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <LogoManagement />
    </div>
  );
};

export default LogoManagementPage;
