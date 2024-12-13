import React from "react";
import { Modal } from "react-bootstrap";
import { BsClock, BsGeoAlt, BsX, BsPencil, BsTrash } from "react-icons/bs";
import "../styles/Calendar.css";

function EventDetailsModal({ show, handleClose, event, handleDelete, handleShare }) {
  if (!event) return null;

  return (
    <div className={`event-details-popup ${show ? 'show' : ''}`}>
      <div className="event-details-header">
        <h3>{event.title}</h3>
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

      <div className="event-details-content">
        <div className="time-section">
          <BsClock className="icon" />
          <div>
            <div className="date">
              {new Date(event.startTime).toLocaleDateString([], {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="time">
              {new Date(event.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })} - {new Date(event.endTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>
          </div>
        </div>

        {event.location && (
          <div className="location-section">
            <BsGeoAlt className="icon" />
            <span>{event.location}</span>
          </div>
        )}

        {event.description && (
          <div className="description-section">
            <p>{event.description}</p>
          </div>
        )}

        {event.activities && event.activities.length > 0 && (
          <div className="activities-section">
            <h4>Activities</h4>
            {event.activities.map((activity, index) => (
              <div key={index} className="activity-item">
                <h5>{activity.title}</h5>
                <div className="activity-time">
                  <BsClock className="icon-small" />
                  {new Date(activity.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })} - {new Date(activity.endTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
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
      </div>
    </div>
  );
}

export default EventDetailsModal;
