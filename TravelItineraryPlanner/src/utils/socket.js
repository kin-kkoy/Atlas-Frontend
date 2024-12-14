import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  autoConnect: true,
  withCredentials: true
});

export const joinCalendar = (calendarId) => {
    socket.emit('joinCalendar', calendarId);
};

export const leaveCalendar = (calendarId) => {
    socket.emit('leaveCalendar', calendarId);
};

export const subscribeToCalendarUpdates = (callback) => {
    socket.on('calendarUpdate', callback);
    return () => socket.off('calendarUpdate', callback);
};

export default socket;