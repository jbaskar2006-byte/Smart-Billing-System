import React, { useState, useEffect } from 'react';
import { checkBackendHealth } from '../services/api';
import { Server, WifiOff } from 'lucide-react';

export default function ConnectionBadge() {
  const [connected, setConnected] = useState(false);
  const [dbStatus, setDbStatus] = useState('Disconnected');
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    const res = await checkBackendHealth();
    if (res.isOnline) {
      setConnected(true);
      setDbStatus(res.data.database || 'Connected');
    } else {
      setConnected(false);
      setDbStatus('Offline');
    }
    setLoading(false);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`connection-badge ${connected ? 'connected' : 'disconnected'}`}>
      <span className="pulse-dot"></span>
      {connected ? <Server size={14} /> : <WifiOff size={14} />}
      <span>
        {loading
          ? 'Checking Backend...'
          : connected
          ? `Golang Backend Live ${dbStatus === 'Connected' ? '(MySQL Connected)' : '(Mock DB)'}`
          : 'Backend Offline (Mock Mode)'}
      </span>
    </div>
  );
}
