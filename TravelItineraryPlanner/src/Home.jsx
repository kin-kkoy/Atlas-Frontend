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

    return (
        <div>
            <h1>Welcome to the Home Page</h1>
        </div>
    );
}

export default Home;