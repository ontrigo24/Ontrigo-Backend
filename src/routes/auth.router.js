const express = require("express");
const authRouter = express.Router();
const {signUp, sendOtp, signIn, forgotPassword} = require("../controllers/auth.controller");


authRouter.post("/signup", signUp);
authRouter.post("/signin", signIn);
authRouter.post("/sendOtp", sendOtp);
authRouter.post("/forgotPassword", forgotPassword);

module.exports = authRouter;

