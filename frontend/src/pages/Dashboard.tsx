import React from 'react';
import Card from '../components/Card';
import NotificationTable from '../components/NotificationTable';
import { mockNotifications, mockSchedules } from '../services/mockData';
import { Bell, CheckCircle, AlertTriangle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const activeNotifications = mockNotifications.length;
  const activeSchedules = mockSchedules.filter(s => s.enabled).length;

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-icon bg-primary">
            <Bell size={24} color="white" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{activeNotifications}</span>
            <span className="stat-label">Notification Types</span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon bg-success">
            <CheckCircle size={24} color="white" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{activeSchedules}</span>
            <span className="stat-label">Active Schedules</span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon bg-warning">
            <AlertTriangle size={24} color="white" />
          </div>
          <div className="stat-info">
            <span className="stat-value">0</span>
            <span className="stat-label">Errors (Last 24h)</span>
          </div>
        </Card>
      </div>

      <NotificationTable />

      <style>{`
        .page-title {
          font-size: var(--font-size-2xl);
          margin-bottom: var(--space-xl);
          color: var(--color-text-primary);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--space-lg);
          margin-bottom: var(--space-xl);
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bg-primary { background-color: var(--color-primary); }
        .bg-success { background-color: var(--color-success); }
        .bg-warning { background-color: #f59e0b; }
        
        .stat-info {
          display: flex;
          flex-direction: column;
        }
        .stat-value {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          color: var(--color-text-primary);
        }
        .stat-label {
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
