import React, { useState, useEffect } from 'react';
import { Badge, Dropdown } from 'react-bootstrap';
import { BsBell } from 'react-icons/bs';
import axiosInstance from '../utils/axios';

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axiosInstance.get('/api/notifications');
                setNotifications(response.data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
        // Poll for new notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleNotificationClick = async (notification) => {
        try {
            await axiosInstance.put(`/api/notifications/${notification._id}/read`);
            setNotifications(prev => 
                prev.filter(n => n._id !== notification._id)
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return (
        <Dropdown>
            <Dropdown.Toggle variant="link" className="notification-bell">
                <BsBell size={20} />
                {notifications.length > 0 && (
                    <Badge bg="danger">{notifications.length}</Badge>
                )}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {notifications.length === 0 ? (
                    <Dropdown.Item>No new notifications</Dropdown.Item>
                ) : (
                    notifications.map(notification => (
                        <Dropdown.Item 
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            {notification.content}
                        </Dropdown.Item>
                    ))
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default NotificationBell;
