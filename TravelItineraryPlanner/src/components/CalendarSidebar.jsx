import React, { useState, useEffect } from 'react';
import { Offcanvas, Form, Button, ListGroup } from 'react-bootstrap';
import { FaBars } from 'react-icons/fa';
import axiosInstance from '../utils/axios';

function CalendarSidebar({ onToggleCalendar, userName }) {
    const [show, setShow] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [sharedCalendars, setSharedCalendars] = useState([]);
    const [error, setError] = useState('');
    const [checkedCalendars, setCheckedCalendars] = useState(new Set(['primary']));

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleImportCalendar = async (e) => {
        e.preventDefault();
        try {
            const urlParts = shareLink.split('/');
            const token = urlParts[urlParts.length - 1];
            
            // Change from /api/calendar/join/${token} to /calendar/join/${token}
            const response = await axiosInstance.post(`/calendar/join/${token}`);
            
            if (response.data.calendar) {
                setSharedCalendars(prev => [...prev, response.data.calendar]);
                setShareLink('');
                setError('');
            } else {
                setError('Invalid response from server');
            }
        } catch (error) {
            console.error('Import error:', error);
            setError('Failed to import calendar. Please check the link.');
        }
    };

    const handleToggleCalendar = (calendarId, isChecked) => {
        setCheckedCalendars(prev => {
            const newSet = new Set(prev);
            if(isChecked) {
                newSet.add(calendarId);
            } else {
                newSet.delete(calendarId);
            }
            return newSet;
        });
        onToggleCalendar(calendarId, isChecked);
    };

    const handleRemoveCalendar = async (calendarId) => {
        try {
            await axiosInstance.delete(`/calendar/${calendarId}/permission`);
            
            setSharedCalendars(prev => prev.filter(cal => cal._id !== calendarId));
            setCheckedCalendars(prev => {
                const newSet = new Set(prev);
                newSet.delete(calendarId);
                return newSet;
            });
            
            onToggleCalendar(calendarId, false);
            
            window.location.reload();
            setError('');
        } catch (error) {
            console.error('Error removing calendar:', error);
            setError('Failed to remove calendar. Please try again.');
        }
    };

    useEffect(() => {
        const loadSharedCalendars = async () => {
            try {
                const response = await axiosInstance.get('/calendar/shared');
                if (response.data && response.data.calendars) {
                    setSharedCalendars(response.data.calendars);
                } else {
                    setSharedCalendars([]);
                }
            } catch (error) {
                console.error('Error loading shared calendars:', error);
                setSharedCalendars([]);
            }
        };

        loadSharedCalendars();
    }, [show]);

    return (
        <>
            <Button 
                variant="light" 
                onClick={handleShow} 
                className="position-fixed" 
                style={{ left: '10px', top: '10px' }}
            >
                <FaBars />
            </Button>

            <Offcanvas show={show} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Calendars</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Form onSubmit={handleImportCalendar} className="mb-4">
                        <Form.Group className="mb-3">
                            <Form.Label>Import Calendar</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Paste share link here"
                                value={shareLink}
                                onChange={(e) => setShareLink(e.target.value)}
                            />
                        </Form.Group>
                        <Button type="submit" variant="primary" size="sm">
                            Import
                        </Button>
                        {error && <div className="text-danger mt-2">{error}</div>}
                    </Form>

                    <div>
                        <h6>My Calendars</h6>
                        <Form.Check
                            type="checkbox"
                            label={userName ? `${userName}'s Calendar` : 'My Calendar'}
                            checked={checkedCalendars.has('primary')}
                            onChange={(e) => handleToggleCalendar('primary', e.target.checked)}
                        />
                    </div>

                    {sharedCalendars.length > 0 && (
                        <div className="mt-4">
                            <h6>Shared Calendars</h6>
                            <ListGroup variant="flush">
                                {sharedCalendars.map((calendar, index) => (
                                    <ListGroup.Item key={`${calendar._id}-${index}`}>
                                        <Form.Check
                                            type="checkbox"
                                            label={`${calendar.title} (Shared by ${calendar.ownerName})`}
                                            checked={checkedCalendars.has(calendar._id)}
                                            onChange={(e) => handleToggleCalendar(calendar._id, e.target.checked)}
                                        />
                                        <Button variant="danger" size="sm" onClick={() => handleRemoveCalendar(calendar._id)}>Remove</Button>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Calendar Color</Form.Label>
                                            <Form.Control
                                                type="color"
                                                value={calendar.color || '#007bff'}
                                                onChange={(e) => handleColorChange(calendar._id, e.target.value)}
                                            />
                                        </Form.Group>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </div>
                    )}
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}

export default CalendarSidebar;