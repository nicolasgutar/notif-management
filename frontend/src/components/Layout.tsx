import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Calendar, Bell, Mail } from 'lucide-react';
import '../styles/index.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/schedules', icon: Calendar, label: 'Schedules' },
    { path: '/email-mock', icon: Mail, label: 'Email Mock' },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">
          <Settings className="logo-icon" />
          <span>NotifyManager</span>
        </div>
        <nav>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="content">
        {children}
      </main>
      <style>{`
        .layout {
          display: flex;
          min-height: 100vh;
        }
        .sidebar {
          width: 260px;
          background-color: var(--color-bg-secondary);
          border-right: 1px solid var(--color-border);
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: var(--font-size-xl);
          font-weight: 700;
          color: var(--color-primary);
          margin-bottom: var(--space-xl);
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          transition: all 0.2s;
          margin-bottom: var(--space-xs);
        }
        .nav-item:hover {
          background-color: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }
        .nav-item.active {
          background-color: var(--color-primary);
          color: white;
        }
        .content {
          flex: 1;
          padding: var(--space-xl);
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default Layout;
