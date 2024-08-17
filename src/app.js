const express =  require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors =  require("cors");

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true,
}))

app.use(express.json());

app.use(express.urlencoded({
    extended:true,
}))

app.use(cookieParser());

app.use("/api/auth/", require("./routes/auth.router"));

app.use("/api/q", require("./routes/booking.router"));


module.exports = app;