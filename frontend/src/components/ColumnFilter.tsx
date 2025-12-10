import React, { useState, useRef, useEffect } from 'react';
import { Filter, X } from 'lucide-react';

interface ColumnFilterProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    options?: { label: string; value: string }[];
}

const ColumnFilter: React.FC<ColumnFilterProps> = ({ value, onChange, placeholder, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isActive = value !== '';

    return (
        <div className="column-filter-container" ref={containerRef}>
            <button
                className={`filter-trigger ${isActive ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title={isActive ? `Filter: ${value}` : 'Filter'}
            >
                <Filter size={14} />
            </button>

            {isOpen && (
                <div className="filter-popover">
                    <div className="filter-header">
                        <span>Filter</span>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>
                            <X size={14} />
                        </button>
                    </div>
                    <div className="filter-body">
                        {options ? (
                            <select
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                className="filter-select"
                                autoFocus
                            >
                                <option value="">All</option>
                                {options.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                placeholder={placeholder || 'Search...'}
                                className="filter-input"
                                autoFocus
                            />
                        )}
                    </div>
                    {isActive && (
                        <div className="filter-footer">
                            <button className="clear-btn" onClick={() => { onChange(''); setIsOpen(false); }}>
                                Clear Filter
                            </button>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .column-filter-container {
                    position: relative;
                    display: inline-block;
                    margin-left: 8px;
                }
                .filter-trigger {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    color: #9ca3af;
                    transition: all 0.2s;
                }
                .filter-trigger:hover {
                    background-color: #f3f4f6;
                    color: #4b5563;
                }
                .filter-trigger.active {
                    color: #4f46e5;
                    background-color: #eef2ff;
                }
                .filter-popover {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    margin-top: 4px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    border: 1px solid #e5e7eb;
                    width: 200px;
                    z-index: 50;
                }
                .filter-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    border-bottom: 1px solid #f3f4f6;
                    font-size: 12px;
                    font-weight: 600;
                    color: #374151;
                }
                .close-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 2px;
                    color: #9ca3af;
                }
                .close-btn:hover {
                    color: #6b7280;
                }
                .filter-body {
                    padding: 12px;
                }
                .filter-input, .filter-select {
                    width: 100%;
                    padding: 6px 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 13px;
                }
                .filter-input:focus, .filter-select:focus {
                    outline: none;
                    border-color: #4f46e5;
                    ring: 2px solid #eef2ff;
                }
                .filter-footer {
                    padding: 8px 12px;
                    border-top: 1px solid #f3f4f6;
                    text-align: right;
                }
                .clear-btn {
                    background: none;
                    border: none;
                    color: #ef4444;
                    font-size: 12px;
                    cursor: pointer;
                    font-weight: 500;
                }
                .clear-btn:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
};

export default ColumnFilter;
