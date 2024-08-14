const jwt = require("jsonwebtoken");
const {ApiError, ApiResponse, asyncHandler} = require("../utils/index")
const {User} = require("../models")

const auth = asyncHandler( async function(req, res, next){

    const token = 
    req.header('x-auth-token') ||
    req.body.token;

    if(!token){
        throw new ApiError(400, "User not authorised, token not found")
    }

    const verifiedUser = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if(!verifiedUser){
        throw new ApiError(400, "Authorisation failed, token provided is not valid");
    }

    const user = await User.findById(verifiedUser._id);

    if(!user){
        throw new ApiError(400, "Authorisation failed, no valid user with this token found")
    }

    req.user = user;

    next();
})
module.exports = auth;