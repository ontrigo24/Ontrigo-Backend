const {asyncHandler, apiResponse, ApiError, ApiResponse} = require("../utils");
const {User, Otp} = require("../models");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");

// signup using email pasword
// signup using gmail
// signup using facebook
// forgot password
// signin

exports.registerViaEmail = asyncHandler(async(req, res, next)=>{

    // STEPS
    // take data
    // check if all fields are provided
    // check if email is already in use
    // check password streangth
    // OTP verification of email

    const {email, firstName, lastName, password} = req.body;

    if([email, firstName, lastName, password].some((field)=> field.trim() === "")){
        throw new ApiError(400, "Please provide all required fields");
    }

    const existedUser = await User.findOne({email});

    if(existedUser){
        throw new ApiError(409, "email already registered");
    }

    const isWeak =  passSteangth(password);

    if(isWeak){
        throw new ApiError(400, isWeak);
    }

    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false
    });

    const createdOtp = await Otp.create({otp, email});

    return res.status(200).json(
        new ApiResponse(200, "otp sent successfully")
    )
 
})

exports.otpVerify = asyncHandler(async(req, res, next)=>{
    
})

const passSteangth = (pass)=>{

    // Criteria
    // minLen of 8 characters
    // both upper and lowercase characters
    // atleast one speacial character

    let uppercase = false, lowercase = false, specialChar = false;

    for(let i = 0; i < pass.length; i++){
        if(checkChar(pass.charAt(i)) === 0) lowercase = true;
        else if(checkChar(pass.charAt(i)) === 1) uppercase = true;
        else if(checkChar(pass.charAt(i)) === 2) specialChar = true;
    }

    if(!lowercase) return "lowercase character requried";
    else if(!uppercase) return "uppercase character required";
    else if(!specialChar) return "special character required";
    else if(pass.length < 8) return "password length should not be less than 8"

    return null;

}
const checkChar = (char)=>{
    if(char === char.toLowerCase() && char !== char.toUpperCase()) return 0;        // lowercase
    else if(char === char.toUpperCase() && char !== char.toLowerCase()) return 1;   // uppercase
    else if(char === char.toUpperCase() && char === char.toLowerCase()) return 2;   // special character

}