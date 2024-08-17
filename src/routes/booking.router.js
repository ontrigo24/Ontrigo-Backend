const {getHotels} = require("../controllers/booking.controller");
const auth = require("../middleware/auth.middleware");
const express = require("express");

const bookingRouter = express.Router();

bookingRouter.post("/hotel/querryHotels", auth, getHotels);

module.exports = bookingRouter;