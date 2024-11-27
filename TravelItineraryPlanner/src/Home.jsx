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

    useEffect(() => {
        axiosInstance.get('/home')
            .catch(() => {
                localStorage.removeItem('token');
                navigate('/login');
            });
    }, [navigate]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axiosInstance.get('/events', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const eventsByDate = response.data.re   duce((acc, event) => {
                    const date = new Date(event.startTime).toISOString().split('T')[0];
                    if (!acc[date]) {
                        acc[date] = [];
                    }
                    acc[date].push(event);
                    return acc;
                }, {});
                
                setEvents(eventsByDate);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            }
        };
    
        fetchEvents();
    }, []);
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleDateChange = (date) => {
        setDate(date);
    };

    const handleSaveEvent = async (eventData) => {
        try {
            const token = localStorage.getItem('token');
            const formattedEventData = {
                title: eventData.title,
                description: eventData.description,
                location: eventData.location,
                startTime: eventData.startTime,
                endTime: eventData.endTime,
                isRecurring: eventData.isRecurring,
                recurrenceRule: eventData.recurrenceRule
            };
    
            const response = await axiosInstance.post('/events', formattedEventData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            const newEvent = response.data;
            const formattedDate = new Date(eventData.startTime).toISOString().split('T')[0];
            setEvents(prevEvents => ({
                ...prevEvents,
                [formattedDate]: [...(prevEvents[formattedDate] || []), newEvent],
            }));
        } catch (error) {
            console.error('Failed to save event:', error);
        }
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
                            {events[date.toISOString().split("T")[0]]?.map((event, index) => (
                                <div key={index} className="mb-3 p-2 border rounded">
                                    <h5>{event.title}</h5>
                                    <p className="mb-1">{event.description}</p>
                                    <small className="text-muted">
                                        {event.startTime} - {event.endTime}
                                    </small>
                                    <br />
                                    <small className="text-muted">{event.location}</small>
                                </div>
                            )) || <p>No events for this day.</p>}
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