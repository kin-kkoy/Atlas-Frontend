import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axiosInstance from './utils/axios';
import EventModal from './components/EventModal';
import './styles/Calendar.css';
import ShareCalendarModal from './components/ShareCalendarModal';
import CalendarSidebar from './components/CalendarSidebar';
import { joinCalendar, leaveCalendar, subscribeToCalendarUpdates } from './utils/socket';
import EventDetailsModal from './components/EventDetailsModal';

function Home() {
    const navigate = useNavigate();
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [visibleCalendars, setVisibleCalendars] = useState(new Set(['primary']));
    const [userName, setUserName] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventDetails, setShowEventDetails] = useState(false);

    const handleShowEventDetails = (event) => {
        setSelectedEvent(event);
        setShowEventDetails(true);
    }

    useEffect(() => {
        axiosInstance.get('/api/user/profile')
            .then(response => {
                setUserName(response.data.userName);
            })
            .catch(() => {
                localStorage.removeItem('token');
                navigate('/login');
            });
    }, [navigate]);

    useEffect(() => {
        const calendarId = localStorage.getItem('calendarId');
    
        if(calendarId) {
            joinCalendar(calendarId);
            const unsubscribe = subscribeToCalendarUpdates((update) => {
                setEvents(prevEvents => ({
                    ...prevEvents,
                    [update.date]: update.events
                }));
            });
    
            return () => {
                leaveCalendar(calendarId);
                unsubscribe();
            };
        }
    }, []);

    const handleToggleCalendar = (calendarId, isVisible) => {
        setVisibleCalendars(prev => {
            const newSet = new Set(prev);
            if(isVisible) {
                newSet.add(calendarId);
            } else {
                newSet.delete(calendarId);
            }
            return newSet;
        });
    }
    
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
            await axiosInstance.delete(`/api/events/delete/${eventId}`);
            
            const formattedDate = date.toLocaleDateString('en-CA');
            setEvents(prevEvents => ({
                ...prevEvents,
                [formattedDate]: prevEvents[formattedDate].filter(event => event._id !== eventId)
            }));
        } catch (error) {
            console.error('Failed to delete event:', error);
            setTimeout(() => setError(''), 3000);
            setError('Failed to delete event');
        }
    };

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const formattedDate = date.toLocaleDateString('en-CA');
                console.log('Fetching events for date:', formattedDate);
                
                const response = await axiosInstance.get('/calendar/accessible', {
                    params: {
                        date: formattedDate
                    }
                });
                
                console.log('Received events:', response.data);
                
                setEvents(prevEvents => ({
                    ...prevEvents,
                    [formattedDate]: response.data
                }));
            } catch (error) {
                console.error('Error fetching events:', error);
                setError('Failed to fetch events');
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

    const tileContent = ({ date }) => {
        const formattedDate = date.toLocaleDateString('en-CA');
        const dayEvents = events[formattedDate] || [];
        
        const getEventClass = (event) => {
            const title = event.title.toLowerCase();
            if (title.includes('breakfast')) return 'event-breakfast';
            if (title.includes('lunch')) return 'event-lunch';
            if (title.includes('palace') || title.includes('park')) return 'event-attraction';
            return 'event-activity';
        };
    
        return (
            <div className="calendar-tile-content">
                <button 
                    className="add-event-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setDate(date);
                        handleShowModal();
                    }}
                >
                    +
                </button>
                {dayEvents.length > 0 && (
                    <div className="calendar-events-container">
                        {dayEvents
                            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                            .map((event, index) => (
                                <div 
                                    key={index} 
                                    className={`calendar-event-item ${getEventClass(event)}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleShowEventDetails(event);
                                    }}
                                >
                                    {event.title}
                                </div>
                            ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="container-fluid p-4">
            <div className="row">
                <div className="col-2">
                    <CalendarSidebar onToggleCalendar={handleToggleCalendar} userName={userName} />
                </div>
                <div className="col-10">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1>Travel Itinerary Planner</h1>
                        <div>
                            <button className="btn btn-info me-2" onClick={() => setShowShareModal(true)}>
                                Share Calendar
                            </button>
                            <button className="btn btn-danger" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </div>
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
                handleClose={handleCloseModal}
                handleSave={handleSaveEvent}
                selectedDate={date}
            />
            <ShareCalendarModal
                show={showShareModal}
                handleClose={() => setShowShareModal(false)}
                calendarId={localStorage.getItem('calendarId')}
            />
            <EventDetailsModal
                show={showEventDetails}
                handleClose={() => setShowEventDetails(false)}
                event={selectedEvent}
                handleDelete={handleDeleteEvent}
            />
        </div>
    );
}

export default Home;