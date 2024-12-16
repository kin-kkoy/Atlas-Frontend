import React, { useState, useEffect } from 'react';
import { Badge, Dropdown } from 'react-bootstrap';
import { BsBell } from 'react-icons/bs';
import axiosInstance from '../utils/axios';
import '../styles/NotificationBell.css';

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const [notificationsResponse, unreadResponse] = await Promise.all([
                    axiosInstance.get('/api/notifications'),
                    axiosInstance.get('/api/notifications/unread-count')
                ]);
                setNotifications(notificationsResponse.data);
                setUnreadCount(unreadResponse.data.count);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.isRead) {
                await axiosInstance.put(`/api/notifications/${notification._id}/read`);
                setNotifications(prev => 
                    prev.map(n => 
                        n._id === notification._id 
                            ? { ...n, isRead: true } 
                            : n
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    return (
        <Dropdown 
            show={isOpen} 
            onToggle={(isOpen) => setIsOpen(isOpen)}
        >
            <div 
                className="notification-bell" 
                onClick={() => setIsOpen(!isOpen)}
            >
                <BsBell 
                    size={20}
                    className="bell-icon"
                />
                {unreadCount > 0 && (
                    <Badge bg="danger">{unreadCount}</Badge>
                )}
            </div>

            <Dropdown.Menu className="notification-menu">
                <div className="notification-list">
                    {notifications.length === 0 ? (
                        <Dropdown.Item>No notifications</Dropdown.Item>
                    ) : (
                        notifications.map(notification => (
                            <Dropdown.Item 
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                            >
                                <div className="notification-content">
                                    <p className="notification-text">{notification.content}</p>
                                    <small className="notification-time">
                                        {formatTimestamp(notification.createdAt)}
                                    </small>
                                </div>
                            </Dropdown.Item>
                        ))
                    )}
                </div>
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default NotificationBell;
