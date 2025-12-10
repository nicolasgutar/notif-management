import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE_URL, API_TOKEN } from '../config';
import Card from './Card';
import ColumnFilter from './ColumnFilter';

interface Notification {
    id: string;
    userId: string;
    user: {
        email: string;
        firstName: string | null;
        lastName: string | null;
    };
    notificationType: string;
    channel: 'APN' | 'EMAIL' | 'IN_APP';
    status: 'CREATED' | 'SENT' | 'FAILED' | 'READ' | 'PUBLISHED';
    title: string | null;
    message: string;
    createdAt: string;
}

interface Meta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const NotificationTable: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const [filters, setFilters] = useState({
        status: '',
        type: '',
        channel: '',
        userId: '',
        message: ''
    });

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', meta.page.toString());
            params.append('limit', meta.limit.toString());

            if (filters.status) params.append('status', filters.status);
            if (filters.type) params.append('type', filters.type);
            if (filters.channel) params.append('channel', filters.channel);
            if (filters.userId) params.append('userId', filters.userId);
            if (filters.message) params.append('message', filters.message);

            const response = await fetch(`${API_BASE_URL}/api/get-notifications?${params.toString()}`, {
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                    'x-api-token': API_TOKEN
                }
            });
            const data = await response.json();

            setNotifications(data.data);
            setMeta(data.meta);
            setSelectedIds(new Set()); // Clear selection on fetch/filter change
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [meta.page, meta.limit, filters]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setMeta(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= meta.totalPages) {
            setMeta(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = new Set(notifications.map(n => n.id));
            setSelectedIds(allIds);
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectRow = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const processResponse = (data: any) => {
        const stats = data.stats;
        alert(`Success: ${data.message}.\nPublished: ${stats.published}\nSent: ${stats.sent}\nFailed: ${stats.failed}`);
        fetchNotifications();
    };

    const handleSendMatching = async () => {
        if (!confirm('Are you sure you want to send/publish all matching notifications?')) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/send-matching-notifications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                    'x-api-token': API_TOKEN
                },
                body: JSON.stringify(filters)
            });
            const data = await response.json();

            if (response.ok) {
                processResponse(data);
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Failed to send matching notifications:', error);
            alert('Failed to send matching notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleSendSelected = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Are you sure you want to send/publish ${selectedIds.size} selected notifications?`)) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/send-matching-notifications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                    'x-api-token': API_TOKEN
                },
                body: JSON.stringify({ notificationIds: Array.from(selectedIds) })
            });
            const data = await response.json();

            if (response.ok) {
                processResponse(data);
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Failed to send selected notifications:', error);
            alert('Failed to send selected notifications');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="notification-table-card">
            <div className="table-header">
                <h3>All Notifications</h3>
                <div className="header-actions">
                    <button
                        className="btn-secondary"
                        onClick={handleSendSelected}
                        disabled={loading || selectedIds.size === 0}
                    >
                        Send Selected ({selectedIds.size})
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleSendMatching}
                        disabled={loading}
                    >
                        Send Matching
                    </button>
                    <div className="pagination-controls">
                        <span className="page-info">
                            Page {meta.page} of {meta.totalPages} ({meta.total} items)
                        </span>
                        <button
                            onClick={() => handlePageChange(meta.page - 1)}
                            disabled={meta.page === 1 || loading}
                            className="btn-icon"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => handlePageChange(meta.page + 1)}
                            disabled={meta.page === meta.totalPages || loading}
                            className="btn-icon"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th className="checkbox-col">
                                <input
                                    type="checkbox"
                                    checked={notifications.length > 0 && selectedIds.size === notifications.length}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th>
                                <div className="th-content">
                                    Status
                                    <ColumnFilter
                                        value={filters.status}
                                        onChange={(val) => handleFilterChange('status', val)}
                                        options={[
                                            { label: 'Created', value: 'CREATED' },
                                            { label: 'Sent', value: 'SENT' },
                                            { label: 'Failed', value: 'FAILED' },
                                            { label: 'Read', value: 'READ' },
                                            { label: 'Published', value: 'PUBLISHED' }
                                        ]}
                                    />
                                </div>
                            </th>
                            <th>
                                <div className="th-content">
                                    Type
                                    <ColumnFilter
                                        value={filters.type}
                                        onChange={(val) => handleFilterChange('type', val)}
                                        placeholder="Filter Type"
                                    />
                                </div>
                            </th>
                            <th>
                                <div className="th-content">
                                    Channel
                                    <ColumnFilter
                                        value={filters.channel}
                                        onChange={(val) => handleFilterChange('channel', val)}
                                        options={[
                                            { label: 'In App', value: 'IN_APP' },
                                            { label: 'Email', value: 'EMAIL' },
                                            { label: 'APN', value: 'APN' }
                                        ]}
                                    />
                                </div>
                            </th>
                            <th>
                                <div className="th-content">
                                    User
                                    <ColumnFilter
                                        value={filters.userId}
                                        onChange={(val) => handleFilterChange('userId', val)}
                                        placeholder="Filter User ID"
                                    />
                                </div>
                            </th>
                            <th>
                                <div className="th-content">
                                    Message
                                    <ColumnFilter
                                        value={filters.message}
                                        onChange={(val) => handleFilterChange('message', val)}
                                        placeholder="Filter Message"
                                    />
                                </div>
                            </th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="text-center">Loading...</td>
                            </tr>
                        ) : notifications.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center">No notifications found</td>
                            </tr>
                        ) : (
                            notifications.map(notification => (
                                <tr key={notification.id} className={selectedIds.has(notification.id) ? 'selected-row' : ''}>
                                    <td className="checkbox-col">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(notification.id)}
                                            onChange={() => handleSelectRow(notification.id)}
                                        />
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${notification.status.toLowerCase()}`}>
                                            {notification.status}
                                        </span>
                                    </td>
                                    <td>{notification.notificationType}</td>
                                    <td>{notification.channel}</td>
                                    <td>
                                        <div className="user-info">
                                            <span className="user-name">{notification.user.firstName} {notification.user.lastName}</span>
                                            <span className="user-email">{notification.user.email}</span>
                                        </div>
                                    </td>
                                    <td className="message-cell" title={notification.message}>
                                        {notification.message}
                                    </td>
                                    <td>{new Date(notification.createdAt).toLocaleString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .notification-table-card {
                    margin-top: var(--space-xl);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .table-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-md);
                    padding: 0 var(--space-sm);
                }
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                }
                .pagination-controls {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                }
                .btn-primary {
                    background-color: #4f46e5;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: var(--radius-sm);
                    font-size: var(--font-size-sm);
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .btn-primary:hover {
                    background-color: #4338ca;
                }
                .btn-primary:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .btn-secondary {
                    background-color: white;
                    color: #374151;
                    border: 1px solid #d1d5db;
                    padding: 6px 12px;
                    border-radius: var(--radius-sm);
                    font-size: var(--font-size-sm);
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-secondary:hover {
                    background-color: #f9fafb;
                    border-color: #9ca3af;
                }
                .btn-secondary:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .btn-icon {
                    background: none;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-sm);
                    padding: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .btn-icon:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .table-container {
                    overflow-x: auto;
                    width: 100%;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 800px; /* Ensure table doesn't squash too much */
                }
                th, td {
                    padding: var(--space-md);
                    text-align: left;
                    border-bottom: 1px solid var(--color-border);
                }
                th {
                    font-weight: 600;
                    color: var(--color-text-secondary);
                    background-color: var(--color-bg-secondary);
                    white-space: nowrap;
                }
                .th-content {
                    display: flex;
                    align-items: center;
                }
                .checkbox-col {
                    width: 40px;
                    text-align: center;
                }
                .selected-row {
                    background-color: #f0f9ff;
                }
                .status-badge {
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: var(--font-size-xs);
                    font-weight: 500;
                }
                .status-created { background-color: #e0f2fe; color: #0369a1; }
                .status-sent { background-color: #dcfce7; color: #15803d; }
                .status-failed { background-color: #fee2e2; color: #b91c1c; }
                .status-read { background-color: #f3f4f6; color: #374151; }
                .status-published { background-color: #fef3c7; color: #92400e; }
                
                .user-info {
                    display: flex;
                    flex-direction: column;
                }
                .user-email {
                    font-size: var(--font-size-xs);
                    color: var(--color-text-secondary);
                }
                .message-cell {
                    max-width: 250px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .text-center { text-align: center; }
            `}</style>
        </Card>
    );
};

export default NotificationTable;
