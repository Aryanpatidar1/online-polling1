import express from 'express'
import http from 'http'
import {Server as SocketIOServer} from 'socket.io'
import cors from "cors"
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import pollRoutes from './routes/pollRoutes.js'
import voteRoutes from './routes/voteRoutes.js'
import resultsRoutes from './routes/resultsRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import helmet from "helmet";
import rateLimit from "express-rate-limit";



//.env file load karna 
dotenv.config();

const app = express();      //? creating express app


//? middleware

app.use(express.json())     // json body parse karega
const allowedOrigins = [
    process.env.CLIENT_ORIGIN,
    "http://localhost:5173",
    "http://localhost:5174",
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
}));

app.use(helmet());


// protect server from spam requests
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
  message: "Too many requests. Try again later."
});
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use("/api/poll", pollRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/results", resultsRoutes);
app.use("/api/admin", adminRoutes);
app.use(errorHandler);


// routes
app.get("/", (req, res) => {
    res.send("Backend makkhan chal rha hai 👍👍👍");
})


// database connectino
connectDB();


// http server for socket.io
const server = http.createServer(app);

const ioInstance = new SocketIOServer(server, {
    cors: {
        origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});


// socket events
ioInstance.on("connection", (socket) => {
    console.log("User Connected: ", socket.id);
    
    socket.on("joinTest", (data) => {
        console.log("joinTest event data: ", data);
        socket.emit("Server Message", "Hello bro, this message is from server via socket❤️❤️");    
    });

    
    socket.on("joinPoll", (pollId) => {
        socket.join(pollId);
        console.log(`User joined poll room: ${pollId}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id);
    });
});

export const io = ioInstance;

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log("Server makkhan ki tarah chal rha hai🏃‍♂️🏃‍♂️🏃‍♂️");
})
