import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import logger from "./utils/logger";
import userRoutes from './routes/userRoutes';
import cors from "./config/cors";

// Admin Routes
import adminUserRoutes from './routes/admin/userRoutes';
import buildingRoutes from './routes/admin/buildingRoutes';
import visitorRoutes from './routes/admin/visitorRoutes';
import visitRoutes from './routes/admin/visitRoutes';

// User Routes
import profileRoutes from './routes/profileRoutes';
import planRoutes from './routes/admin/planRoutes';
import activePlanRoutes from './routes/activePlanRoutes';
import creditTransactionRoutes from './routes/creditTransactionRoutes';
import userBuildingRoutes from './routes/buildingRoutes';
import doormanRoutes from "./routes/doormanRoutes";
import userVisitorRoutes from './routes/visitorRoutes';
import userVisitRoutes from './routes/visitRoutes';
dotenv.config();

const app = express();
const APP_PORT = process.env.APP_PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors);

// Connect to MongoDB
connectDB();

// Register the user routes
app.use('/api/user', userRoutes);

// Register the admin routes
app.use('/api/admin', adminUserRoutes);
app.use('/api/admin', buildingRoutes);
app.use('/api/admin', visitorRoutes);
app.use('/api/admin', visitRoutes);
app.use('/api/admin', planRoutes);

// Profile routes for admin and user
app.use('/api', profileRoutes);

// App Routes
app.use('/api', planRoutes);
app.use('/api', activePlanRoutes);
app.use('/api', creditTransactionRoutes);
app.use('/api/app', userBuildingRoutes);
app.use('/api/app/doorman', doormanRoutes);
app.use('/api/app', userVisitorRoutes);
app.use('/api/app', userVisitRoutes);

// Sample route
app.get("/", (req, res) => {
  logger.info("Root route accessed");
  res.send("Welcome to HalaDesk API");
});

app.listen(APP_PORT, () => {
  logger.info(`Server is running on port ${APP_PORT}`);
});