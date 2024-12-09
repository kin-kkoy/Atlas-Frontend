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

  const handleShowEventDetails = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
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

  const handleSaveEvent = async (eventData) => {
    try {
      const calendarId = localStorage.getItem("calendarId");
      if (!calendarId) {
        throw new Error("Calendar ID not found");
      }

      // Format the activities with proper date objects
      const formattedActivities = eventData.activities.map((activity) => ({
        ...activity,
        startTime: new Date(activity.startTime).toISOString(),
        endTime: new Date(activity.endTime).toISOString(),
      }));

      const response = await axiosInstance.post(
        `/api/events/${calendarId}/add`,
        {
          ...eventData,
          activities: formattedActivities,
          date: new Date(eventData.date).toISOString(),
        }
      );

      const formattedDate = new Date(eventData.date).toLocaleDateString(
        "en-CA"
      );
      setEvents((prevEvents) => ({
        ...prevEvents,
        [formattedDate]: [
          ...(prevEvents[formattedDate] || []),
          response.data.event,
        ],
      }));
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save event:", error);
      setError(error.response?.data?.error || "Failed to save event");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
        await axiosInstance.delete(`/api/events/${eventId}`);

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

        setShowEventDetails(false);
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
    const dayEvents = events[formattedDate] || [];

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
        {dayEvents.length > 0 && (
          <div className="calendar-events-container">
            {dayEvents.map((event) =>
              event.activities.map((activity, index) => (
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

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Travel Itinerary Planner</h1>
        <div>
          <button
            className="btn btn-info me-2"
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
              {getCurrentDateEvents().map((event) => (
                <div key={event._id} className="event-list-item">
                  <div className="event-title">{event.title}</div>
                  {event.activities.map((activity, index) => (
                    <div
                      key={index}
                      className={`activity-item ${getEventClass(activity)}`}
                      onClick={() => handleShowEventDetails(event)}
                    >
                      {activity.title}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="sidebar-section">
            <h5>Shared</h5>
            <div className="sidebar-list">
              {/* Shared calendars will be added dynamically */}
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
        handleSave={handleSaveEvent}
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
