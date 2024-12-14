import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axiosInstance from "./utils/axios";
import EventModal from "./components/EventModal";
import "./styles/Calendar.css";
import CalendarSidebar from "./components/CalendarSidebar";
import {
  joinCalendar,
  leaveCalendar,
  subscribeToCalendarUpdates,
} from "./utils/socket";
import EventDetailsModal from "./components/EventDetailsModal";
import NotificationBell from "./components/NotificationBell";
import socket from './utils/socket';

function Home() {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleCalendars, setVisibleCalendars] = useState(
    new Set(["primary"])
  );
  const [userName, setUserName] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [allEvents, setAllEvents] = useState([]);
  const [selectedEventFilter, setSelectedEventFilter] = useState(null);
  const [sharedEvents, setSharedEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchAllEvents = async () => {
        try {
            const calendarId = localStorage.getItem("calendarId");
            if (!calendarId) {
                throw new Error("Calendar ID not found");
            }
            
            // Fetch regular events
            const response = await axiosInstance.get(`/api/events/${calendarId}/all`);
            // Filter out shared events from regular events
            const regularEvents = response.data.filter(event => !event.isShared);
            setAllEvents(regularEvents);
            
            // Fetch shared events
            const sharedResponse = await axiosInstance.get(`/api/events/${calendarId}/shared`);
            setSharedEvents(sharedResponse.data);
            
        } catch (error) {
            console.error("Failed to fetch all events:", error);
            setError(error.response?.data?.error || "Failed to fetch events");
        }
    };
    fetchAllEvents();
  }, []);

  const handleEventFilter = async (eventId) => {
    setSelectedEventFilter(selectedEventFilter === eventId ? null : eventId);
    
    try {
        const calendarId = localStorage.getItem("calendarId");
        const formattedDate = date.toLocaleDateString("en-CA");
        
        const response = await axiosInstance.get(
            `/api/events/${calendarId}/by-date`,
            {
                params: {
                    date: formattedDate,
                },
            }
        );

        setEvents((prevEvents) => ({
            ...prevEvents,
            [formattedDate]: response.data,
        }));
    } catch (error) {
        console.error("Error fetching events:", error);
        setError("Failed to fetch events");
    }
  };

  const handleShowEventDetails = async (event, clickedActivity) => {
    try {
      const calendarId = localStorage.getItem("calendarId");
      const response = await axiosInstance.get(`/api/events/${calendarId}/events/${event._id}/activities`);
      setSelectedEvent({
        ...event,
        activities: response.data,
        selectedActivity: clickedActivity // Add the clicked activity
      });
      setShowEventDetails(true);
    } catch (error) {
      console.error("Error fetching event details:", error);
      setError("Failed to fetch event details");
    }
  };

  useEffect(() => {
    axiosInstance
      .get("/api/user/profile")
      .then((response) => {
        setUserName(response.data.userName);
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  useEffect(() => {
    const calendarId = localStorage.getItem("calendarId");

    if (calendarId) {
      joinCalendar(calendarId);
      const unsubscribe = subscribeToCalendarUpdates((update) => {
        setEvents((prevEvents) => ({
          ...prevEvents,
          [update.date]: update.events,
        }));
      });

      return () => {
        leaveCalendar(calendarId);
        unsubscribe();
      };
    }
  }, []);

  const handleToggleCalendar = (calendarId, isVisible) => {
    setVisibleCalendars((prev) => {
      const newSet = new Set(prev);
      if (isVisible) {
        newSet.add(calendarId);
      } else {
        newSet.delete(calendarId);
      }
      return newSet;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDateChange = (date) => {
    setDate(date);
  };

  const handleSave = async (eventData) => {
    try {
      const calendarId = localStorage.getItem("calendarId");
      
      // Prepare the event data including sharing information
      const eventPayload = {
        ...eventData,
        isShared: eventData.isShared, // Changed from showShareSection
        shareWithEmail: eventData.shareWithEmail,
        sharePermission: eventData.sharePermission
      };

      // Save the event with sharing information included
      const response = await axiosInstance.post(
        `/api/events/${calendarId}/add`, 
        eventPayload
      );
      
      const savedEvent = response.data.event;

      // Update allEvents state with the new event
      setAllEvents(prevEvents => [...prevEvents, savedEvent]);

      // If it's a shared event, update sharedEvents state
      if (eventData.isShared) {
        const sharedEventResponse = await axiosInstance.get(`/api/events/${calendarId}/shared`);
        setSharedEvents(sharedEventResponse.data);
      }

      // Close the modal
      handleCloseModal();

    } catch (error) {
      console.error("Error saving event:", error);
      setError(error.response?.data?.error || "Failed to save event");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
        const calendarId = localStorage.getItem("calendarId");
        const response = await axiosInstance.delete(`/api/events/${calendarId}/events/${eventId}`);

        // Remove from events state
        const formattedDate = date.toLocaleDateString("en-CA");
        setEvents((prevEvents) => {
            const updatedEvents = {
                ...prevEvents,
                [formattedDate]: (prevEvents[formattedDate] || []).filter(
                    (event) => event._id !== eventId
                )
            };
            if (updatedEvents[formattedDate].length === 0) {
                delete updatedEvents[formattedDate];
            }
            return updatedEvents;
        });

        // Remove from allEvents state
        setAllEvents((prevAllEvents) => 
            prevAllEvents.filter(event => event._id !== eventId)
        );

        // Remove from sharedEvents state if it exists there
        setSharedEvents((prevSharedEvents) =>
            prevSharedEvents.filter(event => event._id !== eventId)
        );

        setShowEventDetails(false);
        setSelectedEventFilter(null);
    } catch (error) {
        console.error("Failed to delete event:", error);
        setError("Failed to delete event");
    }
};

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const calendarId = localStorage.getItem("calendarId");
        const formattedDate = date.toLocaleDateString("en-CA");

        const response = await axiosInstance.get(
          `/api/events/${calendarId}/by-date`,
          {
            params: {
              date: formattedDate,
            },
          }
        );

        setEvents((prevEvents) => ({
          ...prevEvents,
          [formattedDate]: response.data,
        }));
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [date]);

  // Add this function to get the current date's events
  const getCurrentDateEvents = () => {
    const formattedDate = date.toLocaleDateString("en-CA");
    return events[formattedDate] || [];
  };

  const getEventClass = (activity) => {
    const type = activity.type?.toLowerCase() || "activity";
    return `event-${type}`;
  };

  const tileContent = ({ date }) => {
    const formattedDate = date.toLocaleDateString("en-CA");
    const displayEvents = selectedEventFilter
        ? [...allEvents, ...sharedEvents].filter(event => {
            return event._id === selectedEventFilter && 
                   event.activities?.some(activity => {
                       const activityDate = new Date(activity.startTime).toLocaleDateString("en-CA");
                       return activityDate === formattedDate;
                   });
        })
        : [...allEvents, ...sharedEvents].filter(event => 
            event.activities?.some(activity => {
                const activityDate = new Date(activity.startTime).toLocaleDateString("en-CA");
                return activityDate === formattedDate;
            })
        );

    return (
        <div className="calendar-tile-content">
            <div
                className="add-event-button"
                onClick={(e) => {
                    e.stopPropagation();
                    setDate(date);
                    handleShowModal();
                }}
                role="button"
                tabIndex={0}
            >
                +
            </div>
            {displayEvents.length > 0 && (
                <div className="calendar-events-container">
                    {displayEvents.map((event) =>
                        event.activities?.filter(activity => {
                            const activityDate = new Date(activity.startTime).toLocaleDateString("en-CA");
                            return activityDate === formattedDate;
                        }).map((activity, index) => (
                            <div
                                key={`${event._id}-${index}`}
                                className={`calendar-event-item ${getEventClass(activity)}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleShowEventDetails(event, activity); // Pass the clicked activity
                                }}
                                role="button"
                                tabIndex={0}
                            >
                                {activity.title}
                                {event.sharedBy && <small className="shared-by">Shared by: {event.sharedBy}</small>}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
  };

  const handleEventClick = async (event) => {
    try {
        const calendarId = localStorage.getItem("calendarId");
        // Fetch activities for the selected event
        const response = await axiosInstance.get(`/api/events/${calendarId}/events/${event._id}/activities`);
        
        if (event.isShared) {
            // Update shared events
            setSharedEvents(prevSharedEvents => 
                prevSharedEvents.map(e => 
                    e._id === event._id 
                        ? { ...e, activities: response.data }
                        : e
                )
            );
        } else {
            // Update regular events
            setAllEvents(prevAllEvents => 
                prevAllEvents.map(e => 
                    e._id === event._id 
                        ? { ...e, activities: response.data }
                        : e
                )
            );
        }

        setSelectedEventFilter(event._id);
    } catch (error) {
        console.error("Error fetching event activities:", error);
        setError("Failed to fetch event activities");
    }
  };

  const handleUpdateEvent = async (updatedEvent) => {
    try {
      const calendarId = localStorage.getItem("calendarId");
      
      const eventPayload = {
        ...updatedEvent,
        title: updatedEvent.title,
        description: updatedEvent.description,
        date: new Date(updatedEvent.date),
        isShared: updatedEvent.isShared,
        sharedFrom: updatedEvent.sharedFrom,
        sharedPermission: updatedEvent.sharedPermission,
        activities: updatedEvent.activities.map(activity => ({
          ...activity,
          startTime: new Date(activity.startTime),
          endTime: new Date(activity.endTime)
        }))
      };

      const response = await axiosInstance.put(
        `/api/events/${calendarId}/events/${updatedEvent._id}`, 
        eventPayload
      );
      
      const updatedEventData = response.data;

      // Update both shared and regular events states
      const updateEventInList = (events, updatedEvent) => {
        return events.map(event => {
          if (event._id === updatedEvent._id || 
              (event.sharedFrom && 
               (event.sharedFrom._id === updatedEvent._id || 
                event.sharedFrom._id === updatedEvent.sharedFrom))) {
            return updatedEvent;
          }
          return event;
        });
      };

      setSharedEvents(prevEvents => updateEventInList(prevEvents, updatedEventData));
      setAllEvents(prevEvents => updateEventInList(prevEvents, updatedEventData));
      
      setShowEventDetails(false);

      // Refresh current date's events
      const formattedDate = date.toLocaleDateString("en-CA");
      const eventsResponse = await axiosInstance.get(
        `/api/events/${calendarId}/by-date`,
        {
          params: { date: formattedDate }
        }
      );

      setEvents(prevEvents => ({
        ...prevEvents,
        [formattedDate]: eventsResponse.data
      }));

    } catch (error) {
      console.error("Error updating event:", error);
      setError(error.response?.data?.error || "Failed to update event");
    }
  };

  useEffect(() => {
    socket.on('eventUpdated', (updatedEventData) => {
      // Update shared events
      setSharedEvents(prevEvents =>
        prevEvents.map(event =>
          event._id === updatedEventData._id || 
          (event.sharedFrom && event.sharedFrom._id === updatedEventData._id) ? 
          updatedEventData : event
        )
      );

      // Update regular events
      setAllEvents(prevEvents =>
        prevEvents.map(event =>
          event._id === updatedEventData._id || 
          (event.sharedFrom && event.sharedFrom._id === updatedEventData._id) ? 
          updatedEventData : event
        )
      );
    });

    socket.on('eventNotification', (notification) => {
      // Add notification handling logic here
      setNotifications(prev => [...prev, notification]);
    });

    return () => {
      socket.off('eventUpdated');
      socket.off('eventNotification');
    };
  }, []);

  return (
    <div className="container-fluid p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <h1 className="mb-2 mb-md-0">Travel Itinerary Planner</h1>
        <div className="d-flex gap-2 align-items-center">
            <NotificationBell />
            <button className="btn btn-danger" onClick={handleLogout}>
                Logout
            </button>
        </div>
      </div>
      <div className="calendar-layout">
        <div className="calendar-sidebar">
          <div className="sidebar-section">
            <h5>Favorites</h5>
            <div className="sidebar-list">
              {/* Favorites will be added dynamically */}
            </div>
          </div>
          <div className="sidebar-section">
            <h5>My Events</h5>
            <div className="sidebar-list">
                {allEvents.map((event) => (
                    <div 
                        key={event._id} 
                        className={`event-list-item ${selectedEventFilter === event._id ? 'selected' : ''}`}
                        onClick={() => handleEventClick(event)}
                    >
                        <div className="event-title">{event.title}</div>
                    </div>
                ))}
            </div>
          </div>
          <div className="sidebar-section">
            <h5>Shared Events</h5>
            <div className="sidebar-list">
                {sharedEvents.map((event) => (
                    <div 
                        key={event._id} 
                        className={`event-list-item ${selectedEventFilter === event._id ? 'selected' : ''}`}
                        onClick={() => handleEventClick(event)}
                    >
                        <div className="event-title">
                            {event.title}
                            <small className="d-block text-muted">
                                Shared by: {event.sharedBy}
                            </small>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
        <div className={`calendar-main ${showEventDetails ? 'with-details' : ''}`}>
          <Calendar
            value={date}
            onChange={handleDateChange}
            className="w-100"
            tileContent={tileContent}
            onClickDay={(date) => setDate(date)}
          />
        </div>
      </div>

      <EventModal
        show={showModal}
        onHide={handleCloseModal}
        handleSave={handleSave}
        selectedDate={date}
      />
      <EventDetailsModal
        show={showEventDetails}
        handleClose={() => setShowEventDetails(false)}
        event={selectedEvent}
        handleDelete={handleDeleteEvent}
        handleUpdate={handleUpdateEvent}
      />
    </div>
  );
}

export default Home;
