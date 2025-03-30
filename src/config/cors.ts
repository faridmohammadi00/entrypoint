import cors from 'cors';

// Configure CORS options
const corsOptions = {
    origin: 'http://localhost:5000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Export the configured CORS middleware
export default cors(corsOptions);
