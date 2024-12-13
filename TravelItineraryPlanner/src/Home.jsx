import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axiosInstance from "./utils/axios";
import EventModal from "./components/EventModal";
import "./styles/Calendar.css";
import ShareEventModal from "./components/ShareEventModal";
import CalendarSidebar from "./components/CalendarSidebar";
import {
  joinCalendar,
  leaveCalendar,
  subscribeToCalendarUpdates,
} from "./utils/socket";
import EventDetailsModal from "./components/EventDetailsModal";
import NotificationBell from "./components/NotificationBell";

function Home() {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showShareEventModal, setShowShareEventModal] = useState(false);
  const [eventToShare, setEventToShare] = useState(null);
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

  const handleShowEventDetails = async (event) => {
    try {
      const calendarId = localStorage.getItem("calendarId");
      const response = await axiosInstance.get(`/api/events/${calendarId}/events/${event._id}/activities`);
      setSelectedEvent({
        ...event,
        activities: response.data
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
        // First save the event
        const response = await axiosInstance.post(`/api/events/${calendarId}/add`, eventData);
        const savedEvent = response.data.event;

        // If event is marked for sharing, share it
        if (eventData.isShared && eventData.shareWithEmail) {
            await axiosInstance.post('/api/events/share', {
                eventId: savedEvent._id,
                recipientEmail: eventData.shareWithEmail,
                permission: eventData.sharePermission
            });
        }

        // Update allEvents state with the new event
        setAllEvents(prevEvents => [...prevEvents, savedEvent]);

        // If it's a shared event, update sharedEvents state
        if (eventData.isShared) {
            const sharedEventResponse = await axiosInstance.get(`/api/events/${calendarId}/shared`);
            setSharedEvents(sharedEventResponse.data);
        }

    } catch (error) {
        console.error("Error saving/sharing event:", error);
        setError(error.response?.data?.error || "Failed to save/share event");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
        const calendarId = localStorage.getItem("calendarId");
        if (!calendarId) {
            throw new Error("Calendar ID not found");
        }

        await axiosInstance.delete(`/api/events/${calendarId}/events/${eventId}`);

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

        setAllEvents((prevAllEvents) => 
            prevAllEvents.filter(event => event._id !== eventId)
        );

        setShowEventDetails(false);
        setSelectedEventFilter(null);
    } catch (error) {
        console.error("Failed to delete event:", error);
        setError(error.response?.data?.error || "Failed to delete event");
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
                                    handleShowEventDetails(event);
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

  const handleShareEvent = (event) => {
    setEventToShare(event);
    setShowShareEventModal(true);
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

  return (
    <div className="container-fluid p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <h1 className="mb-2 mb-md-0">Travel Itinerary Planner</h1>
        <div className="d-flex gap-2 align-items-center">
            <NotificationBell />
            <button
                className="btn btn-info"
                onClick={() => setShowShareEventModal(true)}
            >
                Share Event
            </button>
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
        <div className="calendar-main">
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
        handleShare={handleShareEvent}
      />
      <ShareEventModal
        show={showShareEventModal}
        handleClose={() => setShowShareEventModal(false)}
        event={eventToShare}
      />
    </div>
  );
}

export default Home;
