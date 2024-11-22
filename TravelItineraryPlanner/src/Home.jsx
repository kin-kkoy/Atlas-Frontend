import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './utils/axios';

function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        // Pang verify nako kung token valid or dili
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

    // To calendar boi
    const handleCalendar = () => {
        navigate('/calendar');
    }

    return (
        <div>
            <h1>This the home page</h1>
            <button onClick={handleCalendar}>Calendar</button>
            <br /> <br />
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default Home;