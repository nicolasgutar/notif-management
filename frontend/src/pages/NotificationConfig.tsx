
import React, { useState } from 'react';
import { API_BASE_URL, API_TOKEN } from '../config';
import Card from '../components/Card';
import Button from '../components/Button';
import { mockNotifications, mockChannels } from '../services/mockData';
import type { NotificationType } from '../services/mockData';
import { Edit2, Save, Mail, Smartphone, MessageSquare, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

const NotificationConfig: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<NotificationType>>({});
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState<NotificationType | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<string>('IN_APP');
    const { showToast } = useToast();

    // Fetch Notification Templates on mount
    React.useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/notification-templates`, {
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                    'x-api-token': API_TOKEN
                }
            });
            if (res.ok) {
                const data = await res.json();
                // Merge with mock details if description/queryDescription are missing from DB or use defaults
                // For now, we assume DB has what we need or we map it.
                // Since our DB started from mockData, it should match.
                // However, queryDescription is not in DB. We can keep it in mock or just hardcode map.
                const enrichedData = data.map((t: any) => ({
                    ...t,
                    queryDescription: mockNotifications.find(m => m.id === t.id)?.queryDescription || 'Custom Query'
                }));
                setNotifications(enrichedData);
            } else {
                console.error("Failed to fetch templates");
                // Fallback to mock if API fails? Or show error.
                // setNotifications(mockNotifications);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (notif: NotificationType) => {
        setEditingId(notif.id);
        setEditForm(notif);
    };

    const handleSave = async () => {
        if (editingId && editForm) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/notification-templates/${editingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true',
                        'x-api-token': API_TOKEN
                    },
                    body: JSON.stringify({
                        name: editForm.name,
                        template: editForm.template,
                        channels: editForm.channels
                    })
                });

                if (res.ok) {
                    const updated = await res.json();
                    setNotifications(prev => prev.map(n => n.id === editingId ? { ...n, ...updated, queryDescription: n.queryDescription } : n));
                    showToast('Template updated successfully!', 'success');
                    setEditingId(null);
                    setEditForm({});
                } else {
                    showToast('Failed to update template', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Error updating template', 'error');
            }
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleChannelToggle = (channelId: string) => {
        if (editForm.channels) {
            const newChannels = editForm.channels.includes(channelId)
                ? editForm.channels.filter(c => c !== channelId)
                : [...editForm.channels, channelId];
            setEditForm({ ...editForm, channels: newChannels });
        } else {
            setEditForm({ ...editForm, channels: [channelId] });
        }
    };

    const getChannelIcon = (type: string) => {
        switch (type) {
            case 'email': return <Mail size={14} />;
            case 'apn': return <Smartphone size={14} />;
            case 'in-app': return <MessageSquare size={14} />;
            case 'EMAIL': return <Mail size={14} />;
            case 'APN': return <Smartphone size={14} />;
            case 'IN_APP': return <MessageSquare size={14} />;
            default: return null;
        }
    };

    const handleCreateClick = (notif: NotificationType) => {
        setSelectedNotif(notif);
        // Default to first available channel or IN_APP
        const defaultChannel = notif.channels && notif.channels.length > 0 ? notif.channels[0] : 'IN_APP';
        setSelectedChannel(defaultChannel);
        setCreateModalOpen(true);
    };

    const confirmCreate = async () => {
        if (selectedNotif) {
            try {
                console.log('Sending create request:', {
                    type: selectedNotif.id,
                    channel: selectedChannel
                });

                const response = await fetch(`${API_BASE_URL}/api/create-notification`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true',
                        'x-api-token': API_TOKEN
                    },
                    body: JSON.stringify({
                        type: selectedNotif.id, // Assuming ID maps to backend type
                        channel: selectedChannel
                    }),
                });

                if (response.ok) {
                    await response.json(); // Consume body
                    showToast(`Notification "${selectedNotif.name}" created successfully!`, 'success');
                } else {
                    const errorData = await response.json();
                    console.error('Create notification failed:', errorData);
                    showToast(`Failed to create notification: ${errorData.error}`, 'error');
                }
            } catch (error) {
                console.error('Error creating notification:', error);
                showToast('An error occurred while creating the notification.', 'error');
            } finally {
                setCreateModalOpen(false);
                setSelectedNotif(null);
            }
        }
    };

    return (
        <div className="notif-config">
            <h1 className="page-title">Notification Configuration</h1>

            <Modal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title="Create Notification"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
                        <Button onClick={confirmCreate}>Create</Button>
                    </>
                }
            >
                <p>
                    Create <strong>{selectedNotif?.name}</strong> notifications for all applicable users?
                </p>
                <div className="form-group" style={{ marginTop: '20px' }}>
                    <label>Select Channel</label>
                    <select
                        value={selectedChannel}
                        onChange={(e) => setSelectedChannel(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                    >
                        <option value="IN_APP">In-App</option>
                        <option value="EMAIL">Email</option>
                        <option value="APN">Mobile Push (APN)</option>
                    </select>
                </div>
            </Modal>

            <div className="notif-list">
                {notifications.map(notif => (
                    <Card key={notif.id} className="notif-card">
                        {editingId === notif.id ? (
                            <div className="edit-form">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Template Message</label>
                                    <textarea
                                        value={editForm.template}
                                        onChange={e => setEditForm({ ...editForm, template: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Channels</label>
                                    <div className="channel-selector">
                                        {mockChannels.map(channel => (
                                            <button
                                                key={channel.id}
                                                className={`channel-toggle ${editForm.channels?.includes(channel.id) ? 'selected' : ''}`}
                                                onClick={() => handleChannelToggle(channel.id)}
                                            >
                                                {getChannelIcon(channel.type)}
                                                <span>{channel.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <Button onClick={handleSave} size="sm"><Save size={16} /> Save</Button>
                                    <Button onClick={handleCancel} variant="secondary" size="sm">Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="view-mode">
                                <div className="notif-header">
                                    <h3 className="notif-name">{notif.name}</h3>
                                    <Button onClick={() => handleEdit(notif)} variant="secondary" size="sm">
                                        <Edit2 size={16} /> Edit
                                    </Button>
                                </div>
                                <p className="notif-desc">{notif.description}</p>
                                <div className="notif-details">
                                    <div className="detail-item">
                                        <span className="label">Query:</span>
                                        <span className="value">{notif.queryDescription}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Template:</span>
                                        <span className="value code">{notif.template}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Channels:</span>
                                        <div className="tags">
                                            {notif.channels.map(c => {
                                                const channelDef = mockChannels.find(mc => mc.id === c);
                                                return (
                                                    <span key={c} className="tag">
                                                        {channelDef && getChannelIcon(channelDef.type)}
                                                        {c}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="send-now-container">
                                    <Button onClick={() => handleCreateClick(notif)} size="sm">
                                        <Plus size={16} /> Create
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            <style>{`
        .notif-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }
        .notif-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-sm);
        }
        .notif-name {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .notif-desc {
          color: var(--color-text-secondary);
          margin-bottom: var(--space-md);
        }
        .detail-item {
          margin-bottom: var(--space-sm);
        }
        .label {
          color: var(--color-text-secondary);
          font-weight: 500;
          margin-right: var(--space-sm);
        }
        .value {
          color: var(--color-text-primary);
        }
        .value.code {
          font-family: monospace;
          background: var(--color-bg-primary);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .tags {
          display: inline-flex;
          gap: var(--space-xs);
        }
        .tag {
          background: var(--color-bg-tertiary);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: var(--font-size-sm);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .channel-selector {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
        }
        .channel-toggle {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-bg-primary);
          color: var(--color-text-secondary);
          transition: all 0.2s;
        }
        .channel-toggle:hover {
          border-color: var(--color-primary);
        }
        .channel-toggle.selected {
          background: rgba(59, 130, 246, 0.1);
          border-color: var(--color-primary);
          color: var(--color-primary);
        }
        .form-group {
          margin-bottom: var(--space-md);
        }
        .form-group label {
          display: block;
          margin-bottom: var(--space-xs);
          color: var(--color-text-secondary);
        }
        .form-group input, .form-group textarea {
          width: 100%;
          padding: var(--space-sm);
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-family: inherit;
        }
        .form-actions {
          display: flex;
          gap: var(--space-sm);
        }
        .send-now-container {
          display: flex;
          justify-content: flex-end;
          margin-top: var(--space-md);
          padding-top: var(--space-md);
          border-top: 1px solid var(--color-border);
        }
        .channel-list-confirm {
          display: flex;
          gap: var(--space-sm);
          margin-top: var(--space-md);
          flex-wrap: wrap;
        }
        .channel-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
        }
      `}</style>
        </div>
    );
};

export default NotificationConfig;
