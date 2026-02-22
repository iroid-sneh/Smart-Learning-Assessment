import dotenv from "dotenv";
dotenv.config({ quiet: true });
import express from "express";
import path from "path";
import routes from "./routes/index.js";
import { mongoConnection } from "./models/connection.js";
import errorHandler from "./src/common/middleware/errorHandler.js";
import swagger from "./src/common/config/swagger.js";
import "./seeder/index.js";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

// Suppress MaxListenersExceededWarning during development
if (process.env.NODE_ENV !== "production") {
    process.setMaxListeners(20);
}

const app = express();
const PORT = process.env.PORT || 5001;
mongoConnection();

const __dirname = import.meta.dirname;

// Security Middlewares
app.use(helmet());
app.use(cors({
    origin: "*", // Or specific domain in production
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Rate limiting (Global, but we could make a specific one for auth)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", routes);
app.use("/api/documentation", swagger);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Listening on ${process.env.BASE_URL}:${PORT}`);
});
