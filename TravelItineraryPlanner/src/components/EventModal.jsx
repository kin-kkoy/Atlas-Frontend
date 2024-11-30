import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { BsClock, BsPeople, BsGeoAlt, BsTextLeft } from 'react-icons/bs';

function EventModal({ show, handleClose, handleSave, selectedDate }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        startTime: '',
        endTime: '',
        isRecurring: false,
        recurrenceRule: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
        const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
        
        handleSave({
            ...formData,
            startTime: startDateTime,
            endTime: endDateTime
        });
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setFormData({
            title: '',
            description: '',
            location: '',
            date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
            startTime: '',
            endTime: '',
            isRecurring: false,
            recurrenceRule: ''
        });
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleCloseModal} className="event-modal">
            <Modal.Header closeButton className="border-0">
                <Form.Control
                    type="text"
                    placeholder="Add title and time"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="border-0 h4"
                />
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <div className="d-flex align-items-center mb-3">
                        <BsClock className="me-2" />
                        <div className="d-flex align-items-center">
                            <Form.Control
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                className="me-2"
                            />
                            <Form.Control
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                                className="me-2"
                            />
                            <span>-</span>
                            <Form.Control
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                className="ms-2"
                            />
                        </div>
                    </div>

                    <div className="d-flex align-items-center mb-3">
                        <BsGeoAlt className="me-2" />
                        <Form.Control
                            type="text"
                            placeholder="Add location"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                        />
                    </div>

                    <div className="d-flex align-items-center mb-3">
                        <BsTextLeft className="me-2" />
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Add description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="d-flex justify-content-end">
                        <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Save
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default EventModal;