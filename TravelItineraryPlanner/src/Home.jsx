import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axiosInstance from './utils/axios';
import EventModal from './components/EventModal';

function Home() {
    const navigate = useNavigate();
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axiosInstance.get('/home')
            .catch(() => {
                localStorage.removeItem('token');
                navigate('/login');
            });
    }, [navigate]);
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleDateChange = (date) => {
        setDate(date);
    };

    const handleSaveEvent = async (eventData) => {
        try {
            const calendarId = localStorage.getItem('calendarId');
            const response = await axiosInstance.post('/api/events/add', {
                ...eventData,
                calendarId,
                startTime: eventData.startTime,
                endTime: eventData.endTime,
            });
            
            // Immediately fetch events after saving
            const formattedDate = eventData.startTime.toLocaleDateString('en-CA');
            const fetchResponse = await axiosInstance.get(`/api/events/by-date`, {
                params: {
                    calendarId,
                    date: formattedDate
                }
            });
            
            setEvents(prevEvents => ({
                ...prevEvents,
                [formattedDate]: fetchResponse.data
            }));
        } catch (error) {
            console.error('Failed to save event:', error);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) {
            return;
        }

        try {
            await axiosInstance.delete(`/api/events/delete/${eventId}`); // Updated path
            
            // Update the events state after successful deletion
            const formattedDate = date.toLocaleDateString('en-CA');
            setEvents(prevEvents => ({
                ...prevEvents,
                [formattedDate]: prevEvents[formattedDate].filter(event => event._id !== eventId)
            }));
        } catch (error) {
            console.error('Failed to delete event:', error);
            // Clear the error after a delay
            setTimeout(() => setError(''), 3000);
            setError('Failed to delete event');
        }
    };

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const formattedDate = date.toLocaleDateString('en-CA');
                const calendarId = localStorage.getItem('calendarId');
                console.log('Fetching events for date:', formattedDate); // Debug log
                
                const response = await axiosInstance.get(`/api/events/by-date`, {
                    params: {
                        calendarId,
                        date: formattedDate
                    }
                });
                
                console.log('Received events:', response.data); // Debug log
                
                setEvents(prevEvents => ({
                    ...prevEvents,
                    [formattedDate]: response.data
                }));
            } catch (error) {
                setError('Failed to fetch events');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [date]);

    // Add this function to get the current date's events
    const getCurrentDateEvents = () => {
        const formattedDate = date.toLocaleDateString('en-CA');
        return events[formattedDate] || [];
    };

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-12">
                    <h1>Travel Itinerary Planner</h1>
                    <button className="btn btn-danger float-end" onClick={handleLogout}>Logout</button>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col-md-8">
                    <Calendar
                        value={date}
                        onChange={handleDateChange}
                        className="w-100"
                    />
                    <button className="btn btn-primary mt-3" onClick={handleShowModal}>
                        Add Event
                    </button>
                </div>
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="mb-0">Events for {date.toDateString()}</h3>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <p>Loading events...</p>
                            ) : error ? (
                                <p className="text-danger">{error}</p>
                            ) : (
                                getCurrentDateEvents().length > 0 ? (
                                    getCurrentDateEvents().map((event, index) => (
                                        <div key={index} className="mb-3 p-2 border rounded">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <h5>{event.title}</h5>
                                                <button 
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDeleteEvent(event._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                            <p className="mb-1">{event.description}</p>
                                            <small className="text-muted">
                                                {new Date(event.startTime).toLocaleTimeString()} - {new Date(event.endTime).toLocaleTimeString()}
                                            </small>
                                            <br />
                                            <small className="text-muted">{event.location}</small>
                                        </div>
                                    ))
                                ) : (
                                    <p>No events for this day.</p>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <EventModal
                show={showModal}
                handleClose={handleCloseModal}
                handleSave={handleSaveEvent}
                selectedDate={date}
            />
        </div>
    );
}

export default Home;