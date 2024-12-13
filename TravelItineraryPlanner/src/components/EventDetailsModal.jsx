import React from "react";
import { Modal, Button } from "react-bootstrap";
import { BsClock, BsGeoAlt } from "react-icons/bs";

function EventDetailsModal({ show, handleClose, event, handleDelete, handleShare }) {
  if (!event) return null;

  // Use the selected activity instead of first activity
  const activity = event.selectedActivity;

  if (!activity) return null;

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{activity.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <BsClock className="me-2" />
          {formatDateTime(activity.startTime)} - {formatDateTime(activity.endTime)}
        </div>
        {activity.location && (
          <div className="mb-3">
            <BsGeoAlt className="me-2" />
            {activity.location}
          </div>
        )}
        {activity.description && (
          <div className="mb-3">
            <p>{activity.description}</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="info" onClick={() => handleShare(event)}>
          Share
        </Button>
        <Button variant="danger" onClick={() => handleDelete(event._id)}>
          Delete
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EventDetailsModal;
