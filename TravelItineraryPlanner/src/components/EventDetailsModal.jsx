import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { BsClock, BsGeoAlt, BsX, BsPencil, BsTrash } from "react-icons/bs";
import "../styles/Calendar.css";

function EventDetailsModal({ show, handleClose, event, handleDelete, handleUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(null);

  useEffect(() => {
    if (event) {
      setEditedEvent({
        ...event,
        activities: event.activities.map(activity => ({...activity}))
      });
    }
  }, [event]);

  if (!event) return null;

  const canEdit = !event.isShared || (event.isShared && event.sharedPermission === 'edit');
  const handleEditClick = () => {
    if (!canEdit) {
      return;
    }
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editedEvent) return;

    try {
      const eventToUpdate = {
        ...editedEvent,
        activities: editedEvent.activities.map(activity => ({
          ...activity,
          startTime: activity.startTime instanceof Date 
            ? activity.startTime.toISOString() 
            : new Date(activity.startTime).toISOString(),
          endTime: activity.endTime instanceof Date 
            ? activity.endTime.toISOString() 
            : new Date(activity.endTime).toISOString(),
          _id: activity._id?.toString()
        }))
      };

      await handleUpdate(eventToUpdate);
      setIsEditing(false);
    } catch (error) {
      alert('Failed to update event. Please try again.');
    }
  };

  const handleActivityChange = (index, field, value) => {
    setEditedEvent(prev => {
      if (!prev) return prev;
      
      const updatedActivities = [...prev.activities];
      const activity = { ...updatedActivities[index] };
      
      if (field === 'startTime' || field === 'endTime') {
        activity[field] = new Date(value).toISOString();
      } else {
        activity[field] = value;
      }
      
      updatedActivities[index] = activity;

      return {
        ...prev,
        activities: updatedActivities
      };
    });
  };

  const handleEventChange = (field, value) => {
    setEditedEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isEditing) {
    return (
      <div className={`event-details-sidebar ${show ? 'show' : ''}`}>
        <div className="event-details-header">
          <Form.Control
            type="text"
            value={editedEvent.title}
            onChange={(e) => handleEventChange('title', e.target.value)}
          />
          <div className="header-actions">
            <Button variant="success" onClick={handleSaveEdit}>Save</Button>
            <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </div>

        <div className="event-details-content">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Event Description</Form.Label>
              <Form.Control
                as="textarea"
                value={editedEvent.description || ''}
                onChange={(e) => handleEventChange('description', e.target.value)}
              />
            </Form.Group>

            <h4>Activities</h4>
            {editedEvent.activities.map((activity, index) => (
              <div key={index} className="activity-edit-form mb-3">
                <Form.Group className="mb-2">
                  <Form.Label>Activity Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={activity.title}
                    onChange={(e) => handleActivityChange(index, 'title', e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={activity.description}
                    onChange={(e) => handleActivityChange(index, 'description', e.target.value)}
                  />
                </Form.Group>

                <div className="row">
                  <div className="col">
                    <Form.Group className="mb-2">
                      <Form.Label>Start Time</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={new Date(activity.startTime).toISOString().slice(0, 16)}
                        onChange={(e) => handleActivityChange(index, 'startTime', e.target.value)}
                      />
                    </Form.Group>
                  </div>
                  <div className="col">
                    <Form.Group className="mb-2">
                      <Form.Label>End Time</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={new Date(activity.endTime).toISOString().slice(0, 16)}
                        onChange={(e) => handleActivityChange(index, 'endTime', e.target.value)}
                      />
                    </Form.Group>
                  </div>
                </div>

                <Form.Group className="mb-2">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    value={activity.location}
                    onChange={(e) => handleActivityChange(index, 'location', e.target.value)}
                  />
                </Form.Group>
              </div>
            ))}
          </Form>
        </div>
      </div>
    );
  }

  return (
    <div className={`event-details-sidebar ${show ? 'show' : ''}`}>
      <div className="event-details-header">
        <h3>{event.selectedActivity ? event.selectedActivity.title : event.title}</h3>
        <div className="header-actions">
          {canEdit && (
            <button className="icon-button" onClick={handleEditClick}>
              <BsPencil />
            </button>
          )}
          {canEdit && (
            <button className="icon-button delete" onClick={() => handleDelete(event._id)}>
              <BsTrash />
            </button>
          )}
          <button className="icon-button" onClick={handleClose}>
            <BsX />
          </button>
        </div>
      </div>

      <div className="event-details-content">
        {event.selectedActivity ? (
          <>
            <div className="time-section">
              <BsClock className="icon" />
              <div>
                <div className="date">
                  {new Date(event.selectedActivity.startTime).toLocaleDateString([], {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="time">
                  {new Date(event.selectedActivity.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })} - {new Date(event.selectedActivity.endTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>
              </div>
            </div>

            {event.selectedActivity.location && (
              <div className="location-section">
                <BsGeoAlt className="icon" />
                <span>{event.selectedActivity.location}</span>
              </div>
            )}

            {event.selectedActivity.description && (
              <div className="description-section">
                <p>{event.selectedActivity.description}</p>
              </div>
            )}
          </>
        ) : (
          <div className="activities-section">
            <h4>Activities</h4>
            {event.activities?.map((activity, index) => (
              <div key={index} className="activity-item">
                <h5>{activity.title}</h5>
                <div className="activity-time">
                  <BsClock className="icon-small" />
                  {new Date(activity.startTime).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })} - {new Date(activity.endTime).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
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
