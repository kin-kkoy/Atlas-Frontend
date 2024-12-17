import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsCalendar3 } from "react-icons/bs";
import { FiTrash2 } from "react-icons/fi";
import { FaBars, FaTimes } from "react-icons/fa";
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
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };

  useEffect(() => {
    const fetchAllEvents = async () => {
        try {
            const calendarId = localStorage.getItem("calendarId");
            if (!calendarId) {
                throw new Error("Calendar ID not found");
            }
            
            const response = await axiosInstance.get(`/api/events/${calendarId}/all`);
            const regularEvents = response.data.filter(event => !event.isShared);
            setAllEvents(regularEvents);
            
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
        selectedActivity: clickedActivity
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
    navigate("/landingPage");
  };

  const handleDateChange = (date) => {
    setDate(date);
  };

  const handleSave = async (eventData) => {
    try {
      const calendarId = localStorage.getItem("calendarId");
      
      const eventPayload = {
        ...eventData,
        isShared: eventData.isShared,
        shareWithEmail: eventData.shareWithEmail,
        sharePermission: eventData.sharePermission
      };

      const response = await axiosInstance.post(
        `/api/events/${calendarId}/add`, 
        eventPayload
      );
      
      const savedEvent = response.data.event;

      setAllEvents(prevEvents => [...prevEvents, savedEvent]);

      if (eventData.isShared) {
        const sharedEventResponse = await axiosInstance.get(`/api/events/${calendarId}/shared`);
        setSharedEvents(sharedEventResponse.data);
      }

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
                                    handleShowEventDetails(event, activity);
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
        const response = await axiosInstance.get(`/api/events/${calendarId}/events/${event._id}/activities`);
        
        if (event.isShared) {
            setSharedEvents(prevSharedEvents => 
                prevSharedEvents.map(e => 
                    e._id === event._id 
                        ? { ...e, activities: response.data }
                        : e
                )
            );
        } else {
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
        activities: updatedEvent.activities.map(activity => ({
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

      const response = await axiosInstance.put(
        `/api/events/${calendarId}/update/${updatedEvent._id}`,
        eventPayload
      );
      
      if (response.data) {
        const updateEventInList = (events, updatedEvent) => 
          events.map(event => 
            event._id === updatedEvent._id ? updatedEvent : event
          );

        setAllEvents(prev => updateEventInList(prev, response.data));
        setSharedEvents(prev => updateEventInList(prev, response.data));
        
        const formattedDate = date.toLocaleDateString("en-CA");
        const eventsResponse = await axiosInstance.get(
          `/api/events/${calendarId}/by-date`,
          { params: { date: formattedDate } }
        );

        setEvents(prev => ({
          ...prev,
          [formattedDate]: eventsResponse.data
        }));

        setShowEventDetails(false);
      }
    } catch (error) {
      alert("Failed to update event: " + (error.response?.data?.error || "Unknown error"));
    }
  };

  useEffect(() => {
    socket.on('eventUpdated', (updatedEventData) => {
      setSharedEvents(prevEvents =>
        prevEvents.map(event =>
          event._id === updatedEventData._id || 
          (event.sharedFrom && event.sharedFrom._id === updatedEventData._id) ? 
          updatedEventData : event
        )
      );

      setAllEvents(prevEvents =>
        prevEvents.map(event =>
          event._id === updatedEventData._id || 
          (event.sharedFrom && event.sharedFrom._id === updatedEventData._id) ? 
          updatedEventData : event
        )
      );
    });

    socket.on('eventNotification', (notification) => {
      setNotifications(prev => [...prev, notification]);
    });

    return () => {
      socket.off('eventUpdated');
      socket.off('eventNotification');
    };
  }, []);

  return (
    <div className="container-fluid d-flex p-0">
      <div className="body-section p-3">
        <div className="top-section d-flex flex-wrap justify-content-between align-items-center mb-4">
          <h3 className="mb-2 mb-md-0">Travel Itinerary Planner</h3>
          <div className="d-flex gap-2 align-items-center">
              <NotificationBell />
              <button className="logout-button btn ms-3" onClick={handleLogout}>
                  Logout
              </button>
          </div>
        </div>
        <div className="calendar-layout">
          <div className="calendar-sidebar">
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
