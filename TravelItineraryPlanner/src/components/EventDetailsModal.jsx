import React from "react";
import { Modal, Button } from "react-bootstrap";
import { BsClock, BsGeoAlt } from "react-icons/bs";

function EventDetailsModal({ show, handleClose, event, handleDelete, handleShare }) {
  if (!event) return null;

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{event.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <BsClock className="me-2" />
          {new Date(event.startTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          -{" "}
          {new Date(event.endTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        {event.location && (
          <div className="mb-3">
            <BsGeoAlt className="me-2" />
            {event.location}
          </div>
        )}
        {event.description && (
          <div className="mb-3">
            <p>{event.description}</p>
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
