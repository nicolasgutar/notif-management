import React, { useState, useEffect } from 'react';
import { API_BASE_URL, API_TOKEN } from '../config';

const EmailMock: React.FC = () => {
    const [emailHtml, setEmailHtml] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEmail = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/email-mock/latest`, {
                    headers: {
                        'ngrok-skip-browser-warning': 'true',
                        'x-api-token': API_TOKEN
                    }
                });
                if (!response.ok) {
                    if (response.status === 404) {
                        setError('No emails generated yet.');
                    } else {
                        throw new Error('Failed to fetch email');
                    }
                } else {
                    const html = await response.text();
                    setEmailHtml(html);
                }
            } catch (err) {
                setError('Error fetching email');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEmail();
    }, []);

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

    if (error) return (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            <h2>{error}</h2>
            <p>Generate some email notifications to see them here.</p>
        </div>
    );

    return (
        <div className="email-mock-container">
            <div className="email-frame">
                <iframe
                    srcDoc={emailHtml}
                    title="Email Preview"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                />
            </div>
            <style>{`
                .email-mock-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: #f3f4f6;
                    padding: 20px;
                }
                .email-frame {
                    width: 100%;
                    max-width: 800px;
                    height: 800px;
                    background-color: #ffffff;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    border-radius: 8px;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default EmailMock;
