import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // can remove this
import axios from "axios";

const InteractableCalendar = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    timeStart: "",
    timeEnd: "",
    dateStart: "",
    dateEnd: "",
    reOccur: false,
  });
  const [successMessage, setSuccessMessage] = useState("");

  const handleDateChange = async (selectedDate) => {
    setDate(selectedDate);

    const calendarId = localStorage.getItem('calendarId');
    if (!calendarId) {
        alert("Calendar ID not found! Please log in again.");
        return;
    }

    try {
        const response = await axios.get(`/api/events/by-date`, {
            params: { 
                calendarId, 
                date: selectedDate.toISOString().split("T")[0] 
            },
        });
        setEvents(response.data);
    } catch (error) {
        console.error("Error fetching events:", error);
        alert("Failed to fetch events. Check the console for details.");
    }
  };


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const calendarId = localStorage.getItem('calendarId');
      const token = localStorage.getItem('token');
      
      console.log('Sending event data:', {
        calendarId,
        token: token ? 'exists' : 'missing',
        eventData: {
          title: formData.title,
          description: formData.description,
          startTime: `${formData.dateStart}T${formData.timeStart}:00`,
          endTime: `${formData.dateEnd}T${formData.timeEnd}:00`,
          location: formData.location,
          isRecurring: formData.reOccur,
        }
      });

      const response = await axios.post(
        `http://localhost:5000/calendar/${calendarId}/events`,
        {
          title: formData.title,
          description: formData.description,
          startTime: `${formData.dateStart}T${formData.timeStart}:00`,
          endTime: `${formData.dateEnd}T${formData.timeEnd}:00`,
          location: formData.location,
          isRecurring: formData.reOccur,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Server response:', response.data);
      
      // Ensure we're adding the event object, not just the response
      const newEvent = response.data.event || response.data;
      setEvents(prevEvents => Array.isArray(prevEvents) ? [...prevEvents, newEvent] : [newEvent]);

      // Clear form and show success message
      setFormData({
        title: "",
        description: "",
        location: "",
        timeStart: "",
        timeEnd: "",
        dateStart: "",
        dateEnd: "",
        reOccur: false,
      });
      setSuccessMessage("Event added successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Refresh events for the selected date
      handleDateChange(date);
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(`Failed to add event: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div>
      <h2>Interactive Calendar</h2>
      <Calendar value={date} onChange={handleDateChange} />

      <h3>Events on {date.toDateString()}:</h3>
      <ul>
        {Array.isArray(events) && events.length > 0 ? (
          events
            .filter(
              (event) =>
                new Date(event.startTime).toDateString() === date.toDateString()
            )
            .map((event, index) => (
              <li key={index}>
                <strong>{event.title}</strong>: {event.description} @ {event.location}
              </li>
            ))
        ) : (
          <p>No events for this day.</p>
        )}
      </ul>

      <h3>Add New Event</h3>
      {successMessage && (
        <div style={{ color: 'green', marginBottom: '10px' }}>
          {successMessage}
        </div>
      )}
      <form onSubmit={handleAddEvent}>
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
          Location:
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <label>
          Start Time:
          <input
            type="time"
            name="timeStart"
            value={formData.timeStart}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <label>
          End Time:
          <input
            type="time"
            name="timeEnd"
            value={formData.timeEnd}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <label>
          Start Date:
          <input
            type="date"
            name="dateStart"
            value={formData.dateStart}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <label>
          End Date:
          <input
            type="date"
            name="dateEnd"
            value={formData.dateEnd}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <label>
          Recurring:
          <input
            type="checkbox"
            name="reOccur"
            checked={formData.reOccur}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <button type="submit">Add Event</button>
      </form>

      <br />
      <button onClick={() => navigate("/home")}>Back Home</button>
    </div>
  );
};

export default InteractableCalendar;
