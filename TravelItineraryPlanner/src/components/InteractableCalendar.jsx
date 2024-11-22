import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // can remove this

const InteractableCalendar = () => {
    const navigate = useNavigate();
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState([]); // Year month day

    const handleDateChange = (date) => {
        setDate(date);
    };

    const addEvent = () => {
        const eventDescription = prompt('Add event description');
        if(eventDescription) {
            const formattedDate = date.toISOString().split('T')[0];
            setEvents((prevEvents) => ({
                ...prevEvents,
                [formattedDate]: [...Calendar(prevEvents[formattedDate] || [], eventDescription)],
            }));
        }
    };

    return (
        <div>
      <h2>Interactive Calendar</h2>
      <Calendar
        value={date}
        onChange={handleDateChange}
      />
      <button onClick={addEvent}>Add Event</button>
      <div>
        <h3>Events on {date.toDateString()}:</h3>
        <ul>
          {events[date.toISOString().split("T")[0]]?.map((event, index) => (
            <li key={index}>{event}</li>
          )) || <p>No events for this day.</p>}
        </ul>
      </div>
      <br /> <br />
      <button onClick={() => navigate('/home')}>Back Home</button>

    </div>
  );
};

export default InteractableCalendar;