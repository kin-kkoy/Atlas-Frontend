import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import axiosInstance from '../utils/axios';

function ShareEventModal({ show, handleClose, event }) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [sharePermission, setSharePermission] = useState('view');

    const handleShare = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/api/events/share', {
                eventId: event._id,
                recipientEmail: email,
                permission: sharePermission
            });
            setSuccess('Event shared successfully!');
            setEmail('');
            setTimeout(() => {
                setSuccess('');
                handleClose();
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to share event');
            setTimeout(() => setError(''), 3000);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Share Event: {event?.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form onSubmit={handleShare}>
                    <Form.Group className="mb-3">
                        <Form.Label>Recipient's Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Share Permission</Form.Label>
                        <Form.Select
                            value={sharePermission}
                            onChange={(e) => setSharePermission(e.target.value)}
                        >
                            <option value="view">View only</option>
                            <option value="edit">Can edit</option>
                        </Form.Select>
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Share Event
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default ShareEventModal;
