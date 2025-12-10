import React, { useState, useEffect } from 'react';
import { Bell, ChevronLeft, Filter } from 'lucide-react';
import { API_BASE_URL, API_TOKEN } from '../config';

interface Notification {
    id: string;
    title: string | null;
    message: string;
    createdAt: string;
    status: string;
}

const MobileMock: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/get-notifications?status=PUBLISHED&channel=IN_APP`, {
                    headers: {
                        'ngrok-skip-browser-warning': 'true',
                        'x-api-token': API_TOKEN
                    }
                });
                const data = await response.json();
                setNotifications(data.data);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    return (
        <div className="mobile-container">
            <div className="mobile-frame">
                <div className="mobile-header">
                    <div className="status-bar">
                        <span>9:41</span>
                        <div className="status-icons">
                            <div className="signal-icon"></div>
                            <div className="wifi-icon"></div>
                            <div className="battery-icon"></div>
                        </div>
                    </div>
                    <div className="app-header">
                        <button className="icon-btn"><ChevronLeft size={24} /></button>
                        <h1>Notifications</h1>
                        <button className="icon-btn"><Filter size={20} /></button>
                    </div>
                </div>

                <div className="mobile-content">
                    {loading ? (
                        <div className="loading-state">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="empty-state">
                            <Bell size={48} className="text-gray-300" />
                            <p>No new notifications</p>
                        </div>
                    ) : (
                        <div className="notification-list">
                            {notifications.map(notification => (
                                <div key={notification.id} className="notification-item">
                                    <div className="notification-icon">
                                        <Bell size={20} color="white" />
                                    </div>
                                    <div className="notification-details">
                                        {notification.title && <h3>{notification.title}</h3>}
                                        <p>{notification.message}</p>
                                        <span className="time">
                                            {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mobile-nav">
                    <div className="nav-item active">
                        <Bell size={24} />
                    </div>
                    <div className="nav-indicator"></div>
                </div>
            </div>

            <style>{`
                .mobile-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: #f3f4f6;
                    padding: 20px;
                }
                .mobile-frame {
                    width: 375px;
                    height: 812px;
                    background-color: #ffffff;
                    border-radius: 40px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    overflow: hidden;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    border: 8px solid #1f2937;
                }
                .mobile-header {
                    background-color: #ffffff;
                    padding-top: 10px;
                    border-bottom: 1px solid #f3f4f6;
                    z-index: 10;
                }
                .status-bar {
                    display: flex;
                    justify-content: space-between;
                    padding: 0 20px 10px;
                    font-size: 14px;
                    font-weight: 600;
                }
                .app-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 20px 20px;
                }
                .app-header h1 {
                    font-size: 20px;
                    font-weight: 700;
                    margin: 0;
                }
                .icon-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                }
                .mobile-content {
                    flex: 1;
                    overflow-y: auto;
                    background-color: #f9fafb;
                }
                .notification-list {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .notification-item {
                    background-color: white;
                    padding: 16px;
                    border-radius: 16px;
                    display: flex;
                    gap: 16px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
                .notification-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .notification-details {
                    flex: 1;
                }
                .notification-details h3 {
                    margin: 0 0 4px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #111827;
                }
                .notification-details p {
                    margin: 0 0 8px;
                    font-size: 14px;
                    color: #4b5563;
                    line-height: 1.4;
                }
                .time {
                    font-size: 12px;
                    color: #9ca3af;
                }
                .mobile-nav {
                    height: 80px;
                    background-color: white;
                    border-top: 1px solid #f3f4f6;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                }
                .nav-item.active {
                    color: #4f46e5;
                }
                .loading-state, .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #9ca3af;
                    gap: 16px;
                }
            `}</style>
        </div>
    );
};

export default MobileMock;
