import React from "react";
import { Modal } from "react-bootstrap";
import { BsClock, BsGeoAlt, BsX, BsPencil, BsTrash } from "react-icons/bs";
import "../styles/Calendar.css";

function EventDetailsModal({ show, handleClose, event, handleDelete, handleShare }) {
  if (!event) return null;

  const activity = event.selectedActivity;

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <Modal show={show} onHide={handleClose} className="event-details-modal">
      <div className="event-details-header">
        <h3>{activity ? activity.title : event.title}</h3>
        <div className="header-actions">
          <button className="icon-button" onClick={() => handleShare(event)}>
            <BsPencil />
          </button>
          <button className="icon-button delete" onClick={() => handleDelete(event._id)}>
            <BsTrash />
          </button>
          <button className="icon-button" onClick={handleClose}>
            <BsX />
          </button>
        </div>
      </div>

      <Modal.Body className="event-details-content">
        {activity ? (
          // Single activity view
          <>
            <div className="time-section">
              <BsClock className="icon" />
              <div>
                <div className="date">
                  {new Date(activity.startTime).toLocaleDateString([], {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="time">
                  {new Date(activity.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })} - {new Date(activity.endTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>
              </div>
            </div>

            {activity.location && (
              <div className="location-section">
                <BsGeoAlt className="icon" />
                <span>{activity.location}</span>
              </div>
            )}

            {activity.description && (
              <div className="description-section">
                <p>{activity.description}</p>
              </div>
            )}
          </>
        ) : (
          // All activities view
          <div className="activities-section">
            <h4>Activities</h4>
            {event.activities?.map((activity, index) => (
              <div key={index} className="activity-item">
                <h5>{activity.title}</h5>
                <div className="activity-time">
                  <BsClock className="icon-small" />
                  {formatDateTime(activity.startTime)} - {formatDateTime(activity.endTime)}
                </div>
                {activity.location && (
                  <div className="activity-location">
                    <BsGeoAlt className="icon-small" />
                    {activity.location}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default EventDetailsModal;
