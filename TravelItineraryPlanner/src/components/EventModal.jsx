import React, { useState } from 'react';
import { Modal, Form, Button, ListGroup } from 'react-bootstrap';
import { BsClock, BsPeople, BsGeoAlt, BsTextLeft, BsPlus, BsTrash } from 'react-icons/bs';

function EventModal({ show, onHide, handleSave, selectedDate }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [activities, setActivities] = useState([]);
    const [currentActivity, setCurrentActivity] = useState({
        title: '',
        type: 'activity',
        startTime: '',
        endTime: '',
        location: '',
        isRecurring: false,
        recurrenceRule: ''
    });
    const [shareWithEmail, setShareWithEmail] = useState('');
    const [sharePermission, setSharePermission] = useState('view');
    const [showShareSection, setShowShareSection] = useState(false);

    const handleEventChange = (e) => {
        const { name, value } = e.target;
        setEventData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleActivityChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentActivity(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const addActivity = () => {
        if (currentActivity.title && currentActivity.startTime && currentActivity.endTime) {
            setActivities(prev => [...prev, { ...currentActivity }]);
            setCurrentActivity({
                title: '',
                description: '',
                startTime: '',
                endTime: '',
                location: '',
                isRecurring: false,
                recurrenceRule: ''
            });
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setActivities([]);
        setCurrentActivity({
            title: '',
            type: 'activity',
            startTime: '',
            endTime: '',
            location: '',
            isRecurring: false,
            recurrenceRule: ''
        });
        setShareWithEmail('');
        setSharePermission('view');
        setShowShareSection(false);
    };

    const removeActivity = (index) => {
        setActivities(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const eventData = {
            title,
            description,
            activities,
            date: selectedDate,
            sharing: showShareSection ? {
                recipientEmail: shareWithEmail,
                permission: sharePermission
            } : null
        };
        handleSave(eventData);
        resetForm();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Add Event</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Event Title</Form.Label>
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Event Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Form.Group>

                    <hr />
                    
                    <h5>Activities</h5>
                    
                    <div className="border p-3 mb-3">
                        <Form.Group className="mb-3">
                            <Form.Label>Activity Title</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={currentActivity.title}
                                onChange={handleActivityChange}
                                placeholder="Enter activity title"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                value={currentActivity.description}
                                onChange={handleActivityChange}
                            />
                        </Form.Group>

                        <div className="row">
                            <div className="col">
                                <Form.Group className="mb-3">
                                    <Form.Label>Start Time</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="startTime"
                                        value={currentActivity.startTime}
                                        onChange={handleActivityChange}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col">
                                <Form.Group className="mb-3">
                                    <Form.Label>End Time</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="endTime"
                                        value={currentActivity.endTime}
                                        onChange={handleActivityChange}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                type="text"
                                name="location"
                                value={currentActivity.location}
                                onChange={handleActivityChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Is Recurring"
                                checked={currentActivity.isRecurring}
                                onChange={(e) => handleActivityChange({
                                    target: {
                                        name: 'isRecurring',
                                        value: e.target.checked
                                    }
                                })}
                            />
                        </Form.Group>

                        {currentActivity.isRecurring && (
                            <Form.Group className="mb-3">
                                <Form.Label>Recurrence Rule</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="recurrenceRule"
                                    value={currentActivity.recurrenceRule}
                                    onChange={handleActivityChange}
                                    placeholder="e.g., FREQ=WEEKLY;INTERVAL=1"
                                />
                            </Form.Group>
                        )}

                        <Button variant="secondary" onClick={addActivity}>
                            <BsPlus /> Add Activity
                        </Button>
                    </div>

                    <ListGroup>
                        {activities.map((activity, index) => (
                            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6>{activity.title}</h6>
                                    <small>{new Date(activity.startTime).toLocaleString()} - {new Date(activity.endTime).toLocaleString()}</small>
                                </div>
                                <Button variant="danger" size="sm" onClick={() => removeActivity(index)}>
                                    <BsTrash />
                                </Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                    <div className="sharing-section mt-4">
                        <Form.Check
                            type="checkbox"
                            label="Share this event"
                            checked={showShareSection}
                            onChange={(e) => setShowShareSection(e.target.checked)}
                            className="mb-3"
                        />
                        
                        {showShareSection && (
                            <div className="sharing-options">
                                <Form.Group className="mb-3">
                                    <Form.Label>Share with (email)</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={shareWithEmail}
                                        onChange={(e) => setShareWithEmail(e.target.value)}
                                        placeholder="Enter recipient's email"
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Permission Level</Form.Label>
                                    <Form.Select
                                        value={sharePermission}
                                        onChange={(e) => setSharePermission(e.target.value)}
                                    >
                                        <option value="view">View only</option>
                                        <option value="modify">Can modify</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        )}
                    </div>

                    <div className="d-flex justify-content-end mt-3">
                        <Button variant="secondary" onClick={onHide} className="me-2">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Save Event
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default EventModal;