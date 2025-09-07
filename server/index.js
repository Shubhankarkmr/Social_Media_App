import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import path from "path";
import helmet from "helmet";

import dbConnection from "./dbConfig/index.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

// Import central router
import router from "./routes/index.js";

const __dirname = path.resolve();
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8800;

// Connect DB
dbConnection();

// Security & middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Static files
app.use(express.static(path.join(__dirname, "views/build")));

// ✅ Use routes (this already includes /auth, /users, /posts)
app.use("/", router);

// Error handler
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port: ${PORT}`);
});

