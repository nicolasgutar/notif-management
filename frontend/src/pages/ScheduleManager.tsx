
import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { mockNotifications, mockChannels } from '../services/mockData';
import { Clock, Play, Pause, Plus, X, Save, Trash2 } from 'lucide-react';
import { API_BASE_URL, API_TOKEN } from '../config';

const ScheduleManager: React.FC = () => {
    const [schedules, setSchedules] = useState<any[]>([]); // Use appropriate type if available, using any for now to match backend response structure
    const [isAdding, setIsAdding] = useState(false);
    const [scheduleMode, setScheduleMode] = useState<'simple' | 'cron'>('simple');
    const [simpleSchedule, setSimpleSchedule] = useState({ value: 1, unit: 'day' });
    const [newSchedule, setNewSchedule] = useState({
        notificationId: '',
        cronExpression: '',
        channelId: ''
    });

    // Fetch Schedules
    React.useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        console.log("api-token", API_TOKEN);
        try {
            const res = await fetch(`${API_BASE_URL}/api/schedules`, {
                headers: {
                    'x-api-token': API_TOKEN,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            const data = await res.json();
            console.log("data", data.data);
            if (data.data) setSchedules(data.data);
        } catch (error) {
            console.error('Failed to fetch schedules', error);
        }
    };

    const toggleSchedule = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setSchedules(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));

            await fetch(`${API_BASE_URL}/api/schedules/${id}/toggle`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-token': API_TOKEN,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ enabled: !currentStatus })
            });
            // Re-fetch to ensure sync
            fetchSchedules();
        } catch (error) {
            console.error('Failed to toggle schedule', error);
            fetchSchedules(); // Revert on error
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this schedule?')) return;
        try {
            await fetch(`${API_BASE_URL}/api/schedules/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-api-token': API_TOKEN,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            fetchSchedules();
        } catch (error) {
            console.error('Error deleting schedule:', error);
        }
    };

    const getNotificationName = (id: string) => {
        return mockNotifications.find(n => n.id === id)?.name || id;
    };

    const handleAddSchedule = async () => {
        let cron = newSchedule.cronExpression;

        if (scheduleMode === 'simple') {
            const { value, unit } = simpleSchedule;
            if (unit === 'day') cron = `0 9 */${value} * *`;
            else if (unit === 'week') cron = `0 9 * * 1`; // Simplified: Weekly on Monday
            else if (unit === 'month') cron = `0 9 1 */${value} *`;
        }

        if (newSchedule.notificationId && cron) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/schedules`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-token': API_TOKEN,
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify({
                        notificationId: newSchedule.notificationId,
                        cronExpression: cron,
                        channelId: newSchedule.channelId
                    })
                });

                if (response.ok) {
                    setIsAdding(false);
                    setNewSchedule({ notificationId: '', cronExpression: '', channelId: '' });
                    setSimpleSchedule({ value: 1, unit: 'day' });
                    fetchSchedules();
                } else {
                    alert('Failed to create schedule');
                }
            } catch (error) {
                console.error('Error creating schedule:', error);
                alert('Error creating schedule');
            }
        }
    };

    return (
        <div className="schedule-manager">
            <h1 className="page-title">Schedule Manager</h1>

            <div className="schedule-grid">
                {schedules.map(schedule => (
                    <Card key={schedule.id} className="schedule-card">
                        <div className="schedule-header">
                            <div className="schedule-info">
                                <h3 className="schedule-notif">{getNotificationName(schedule.notificationId)}</h3>
                                <div className="cron-display">
                                    <Clock size={16} />
                                    <span>{schedule.cronExpression}</span>
                                </div>
                            </div>
                            <Button
                                onClick={() => toggleSchedule(schedule.id, schedule.enabled)}
                                variant={schedule.enabled ? 'secondary' : 'primary'}
                                size="sm"
                            >
                                {schedule.enabled ? <Pause size={16} /> : <Play size={16} />}
                                {schedule.enabled ? 'Pause' : 'Activate'}
                            </Button>
                            <Button
                                onClick={() => handleDelete(schedule.id)}
                                variant="danger"
                                size="sm"
                                style={{ marginLeft: '8px' }}
                            >
                                <Trash2 size={16} />
                            </Button>
                        </div>

                        <div className="schedule-details">
                            <div className="detail-row">
                                <span className="label">Last Run:</span>
                                <span className="value">{new Date(schedule.lastRun!).toLocaleString()}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Next Run:</span>
                                <span className="value">{new Date(schedule.nextRun!).toLocaleString()}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Status:</span>
                                <span className={`status-badge ${schedule.enabled ? 'active' : 'inactive'}`}>
                                    {schedule.enabled ? 'Active' : 'Paused'}
                                </span>
                            </div>
                        </div>
                    </Card>
                ))}

                {/* Add Schedule Card */}
                {isAdding ? (
                    <Card className="schedule-card add-form-card">
                        <div className="add-form">
                            <div className="form-header">
                                <h3>New Schedule</h3>
                                <button className="close-btn" onClick={() => setIsAdding(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="form-group">
                                <label>Notification Type</label>
                                <select
                                    value={newSchedule.notificationId}
                                    onChange={e => setNewSchedule({ ...newSchedule, notificationId: e.target.value })}
                                >
                                    <option value="">Select Notification...</option>
                                    {mockNotifications.map(n => (
                                        <option key={n.id} value={n.id}>{n.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Schedule Mode</label>
                                <div className="mode-toggle">
                                    <button
                                        className={`toggle-btn ${scheduleMode === 'simple' ? 'active' : ''}`}
                                        onClick={() => setScheduleMode('simple')}
                                    >
                                        Simple
                                    </button>
                                    <button
                                        className={`toggle-btn ${scheduleMode === 'cron' ? 'active' : ''}`}
                                        onClick={() => setScheduleMode('cron')}
                                    >
                                        Advanced (Cron)
                                    </button>
                                </div>
                            </div>

                            {scheduleMode === 'simple' ? (
                                <div className="form-group">
                                    <label>Repeat Every</label>
                                    <div className="simple-inputs">
                                        <input
                                            type="number"
                                            min="1"
                                            value={simpleSchedule.value}
                                            onChange={e => setSimpleSchedule({ ...simpleSchedule, value: parseInt(e.target.value) || 1 })}
                                        />
                                        <select
                                            value={simpleSchedule.unit}
                                            onChange={e => setSimpleSchedule({ ...simpleSchedule, unit: e.target.value })}
                                        >
                                            <option value="day">Days</option>
                                            <option value="week">Weeks</option>
                                            <option value="month">Months</option>
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Cron Expression</label>
                                    <input
                                        type="text"
                                        placeholder="0 9 * * 1"
                                        value={newSchedule.cronExpression}
                                        onChange={e => setNewSchedule({ ...newSchedule, cronExpression: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Channel (Optional Override)</label>
                                <select
                                    value={newSchedule.channelId}
                                    onChange={e => setNewSchedule({ ...newSchedule, channelId: e.target.value })}
                                >
                                    <option value="">Default Channels</option>
                                    {mockChannels.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <Button onClick={handleAddSchedule} className="w-full">
                                <Save size={16} /> Create Schedule
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <button className="add-schedule-btn" onClick={() => setIsAdding(true)}>
                        <Plus size={48} />
                        <span>Add Schedule</span>
                    </button>
                )}
            </div>

            <style>{`
        .schedule-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-lg);
        }
        .schedule-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-lg);
        }
        .schedule-notif {
          font-size: var(--font-size-lg);
          font-weight: 600;
          margin-bottom: var(--space-xs);
        }
        .cron-display {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          color: var(--color-text-secondary);
          font-family: monospace;
          background: var(--color-bg-primary);
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-flex;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--space-sm);
          font-size: var(--font-size-sm);
        }
        .status-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 500;
        }
        .status-badge.active {
          background-color: rgba(34, 197, 94, 0.2);
          color: var(--color-success);
        }
        .status-badge.inactive {
          background-color: var(--color-bg-tertiary);
          color: var(--color-text-secondary);
        }
        
        /* Add Schedule Styles */
        .add-schedule-btn {
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-md);
          color: var(--color-text-secondary);
          transition: all 0.2s;
          min-height: 200px;
        }
        .add-schedule-btn:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
          background-color: rgba(59, 130, 246, 0.05);
        }
        
        .add-form-card {
          border-color: var(--color-primary);
        }
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-md);
        }
        .close-btn {
          color: var(--color-text-secondary);
        }
        .close-btn:hover {
          color: var(--color-text-primary);
        }
        .form-group {
          margin-bottom: var(--space-md);
        }
        .form-group label {
          display: block;
          margin-bottom: var(--space-xs);
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
        }
        .form-group input, .form-group select {
          width: 100%;
          padding: var(--space-sm);
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-family: inherit;
        }
        .w-full {
          width: 100%;
        }
        .mode-toggle {
          display: flex;
          background: var(--color-bg-tertiary);
          padding: 4px;
          border-radius: var(--radius-md);
          gap: 4px;
        }
        .toggle-btn {
          flex: 1;
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        }
        .toggle-btn.active {
          background: var(--color-bg-primary);
          color: var(--color-text-primary);
          font-weight: 500;
          box-shadow: var(--shadow-sm);
        }
        .simple-inputs {
          display: flex;
          gap: var(--space-sm);
        }
        .simple-inputs input {
          width: 80px;
        }
        .simple-inputs select {
          flex: 1;
        }
      `}</style>
        </div>
    );
};

export default ScheduleManager;
