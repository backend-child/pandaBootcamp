const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const colors = require("colors");
const errorHandler = require("./middleware/error");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const fileUpload = require("express-fileupload");
//load our env variables
dotenv.config({ path: "./config/config.env" });

//connect to database
connectDB();

//routes files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");

const app = express();

//Body parser
app.use(express.json());

// cookie Parser to parse the token
app.use(cookieParser());

//dev login middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//file uploading
app.use(fileUpload());

//sanitie our database
app.use(mongoSanitize());

// sanitize our headers for us
app.use(helmet());

// sanitize our input text in our database
app.use(xss());

// rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

app.use(limiter);

// prevent http param pollution
app.use(hpp());

//make our api public to other api using CORS
app.use(cors());

// set static folder
app.use(express.static(path.join(__dirname, "public")));

//mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

//Handle unhandled promise rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  //close server and exist process
  server.close(() => process.exit(1));
});
