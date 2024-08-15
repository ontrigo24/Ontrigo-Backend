const express = require("express");
const authRouter = express.Router();
const {signUp, sendOtp, signIn, forgotPassword, firebaseSignin, firebaseSignup, getUser, changePassword} = require("../controllers/auth.controller");
const auth = require("../middleware/auth.middleware");

authRouter.post("/signup", signUp);
authRouter.post("/signin", signIn);
authRouter.post("/sendOtp", sendOtp);
authRouter.post("/forgotPassword", forgotPassword);
authRouter.post("/fb/signin", firebaseSignin);
authRouter.post("/fb/signup", firebaseSignup);

// secured
authRouter.get("/", auth, getUser);
authRouter.get("/changePassword", auth, changePassword);

module.exports = authRouter;

