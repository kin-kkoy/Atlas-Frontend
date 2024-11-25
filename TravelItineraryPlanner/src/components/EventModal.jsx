import React from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Modal } from 'react-bootstrap';

function EventModal({ show, handleClose, handleSave, selectedDate }) {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
    isRecurring: false,
    recurrenceRule: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      isRecurring: false,
      recurrenceRule: ''
    });
  };

  const handleCloseModal = () => {
    resetForm();
    handleClose();
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
    
    if (endDateTime <= startDateTime) {
      alert('End time must be after start time');
      return;
    }

    const eventData = {
        ...formData,
        startTime: startDateTime,
        endTime: endDateTime
    };
    handleSave(eventData);
    handleCloseModal();
  };

  return (
    <Modal show={show} onHide={handleCloseModal}>
      <Modal.Header closeButton>
        <Modal.Title>Add Event</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Event Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Location</Form.Label>
            <Form.Control
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Start Time</Form.Label>
            <Form.Control
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>End Time</Form.Label>
            <Form.Control
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Recurring Event"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={handleChange}
            />
          </Form.Group>

          {formData.isRecurring && (
            <Form.Group className="mb-3">
              <Form.Label>Recurrence Rule</Form.Label>
              <Form.Select
                name="recurrenceRule"
                value={formData.recurrenceRule}
                onChange={handleChange}
                >
                    <option value="">Select a rule</option>
                    <option value='daily'>Daily</option>
                    <option value='weekly'>Weekly</option>
                    <option value='monthly'>Monthly</option>
                </Form.Select>
            </Form.Group>
          )}

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleCloseModal}>
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

EventModal.propTypes = {
    show: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleSave: PropTypes.func.isRequired,
    selectedDate: PropTypes.instanceOf(Date)
  };


export default EventModal;