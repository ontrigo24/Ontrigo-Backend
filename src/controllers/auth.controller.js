const {asyncHandler, ApiError, ApiResponse, mailSender} = require("../utils");
const {User, Otp} = require("../models");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const admin = require("../config/firebase.config");

// signup using gmail
// signup using facebook


exports.firebaseSignup = asyncHandler(async(req, res, next)=>{

    let {provider, providerToken} = req.body;

    if(!providerToken || !provider){    
        throw new ApiError(400, "Please provide required fields");
    } 

    if(provider !== "google" && provider !== "facebook"){
        throw new ApiError(400, "Invalid provider");
    }

    // get details from provierToken
    let firstName = null, lastName = null, email = null, avatarUrl = null, password = null;

    if(provider === "google"){
        const googleUser = await admin.auth().verifyIdToken(providerToken);

        if(!googleUser){
            throw new ApiError(400, "google user not found");
        }

        const googleData = googleUser.providerData.filter((data)=> data.providerId === "google.com")[0];

        const {displayName} = googleData;

        firstName = displayName.split(" ")[0];
        lastName = displayName.split(" ")[1];

        email = googleData.email;
        avatarUrl = googleData.photoURL;
    }
            
    // check if user already registered
    const existedUser = await User.findOne({email});
    if(existedUser){
        throw new ApiError(400, "Email already in use");
    }

    // create entry in db
    const user = await User.create({
        email,
        firstName,
        lastName,
        password,
        photoUrl,
        provider,
    });

    // generate jwt token
    const token = createdUser.generateAccessToken();

    // return response
    res.header("x-auth-token", token);

    return res.status(201).json(
        new ApiResponse(201, {...user._doc, token}, "User signup via firebase successful")
    )

})

exports.firebaseSignin = asyncHandler(async(req, res, next)=>{
    const {provider, providerToken} = req.body;

    if(!provider || !providerToken){
        throw new ApiError(400, "Please provide required fields")
    } 

    let email = null;

    if(provider === "google"){
        const googleUser = await admin.auth().verifyIdToken(providerToken);

        if(!googleUser){
            throw new ApiError(400, "google user not found");
        }
    
        const googleData = googleUser.providerData.filter((data)=> data.providerId === "google.com")[0];

        email = googleData.email;
    
    }
            
    if(!email){
        throw new ApiError(400, "User email not found");
    }

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(400, "User not registered");
    }

    user.password = undefined;

    return res.status(200).json(
        new ApiResponse(200, user, "User successfully singed in")
    )

    
})

exports.signUp = asyncHandler(async(req, res, next)=>{

    // STEPS
    // after email verification
    // take data
    // check if all fields are provided
    // check if email is already in use
    // check password streangth
    // creat entry in db
    // generate jwt
    // send response in header and body

    let {email, firstName, lastName, password, otp} = req.body;

    // check if all fields are present
    if([email, firstName, lastName, password, otp].some((field)=> field.trim() === "")){
        throw new ApiError(400, "Please provide all required fields");
    }

    // verify Otp
    const sentOtp = await Otp.find({email, type:"signup"}).sort({createdAt : -1}).limit(1);

    if(!sentOtp){
        throw new ApiError(400, "Otp was genereated");
    }

    if(sentOtp[0].otp !== otp){
        throw new ApiError(400, "Incorrect OTP");
    }

    await Otp.findByIdAndDelete(sentOtp._id);

    // check if user already existed
    const existedUser = await User.findOne({email});
    if(existedUser){
        throw new ApiError(409, "email already registered");
    }

    // check password streangth
    const isWeak =  passSteangth(password);
    if(isWeak){
        throw new ApiError(400, isWeak);
    }
    // ecrypt password
    password = await bcrypt.hash(password, 10);



    // create entry in db
    const createdUser = await User.create({email, password, firstName, lastName});
    if(!createdUser){
        throw new ApiError(500, "User registeration failed");
    }
    // generate jwt token
    const token = createdUser.generateAccessToken();

    // return response
    res.header("x-auth-token", token);
    createdUser.password = undefined;
    return res.status(201).json(
        new ApiResponse(201, {...createdUser._doc, token}, "User signup successful")
    )

})

exports.sendOtp = asyncHandler( async(req, res, next)=>{
    
    const {email, type} = req.body;                                 // type tells that being used for singup or forgot password

    if(!email) throw new ApiError(400, "Email field required");

    if(type !== "signup" && type !== "forgotPassword"){
        throw new ApiError(400, "Otp type incorrect");
    }

    const existedUser = await User.findOne({email});

    if(type === "signup" && existedUser){
        throw new ApiError(409, "Provided email already in use");
    } 

    else if(type === "forgotPassword" && !existedUser){
        throw new ApiError(409, "Email not registered");
    }
    
    const otp = otpGenerator.generate( type === "signup" ? 4 : 6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars:false
    });

    const emailResponse = await mailSender(email, "Your Ontrigo verification code is: ", otp);

    if(!emailResponse){
        throw new ApiError(500, "Otp verification email couldn't be sent");
    }

    const createdOtp = await Otp.create({otp, email, type});

    return res.status(200).json( new ApiResponse(200, "otp sent successfully"));

})

exports.signIn = asyncHandler(async(req, res, next)=>{
     
    // STEPS
    // get email and password from the user
    // check if all fields are provided
    // check if user exists
    // verify password
    // generate jwt
    // return response

    const {email, password} = req.body;

    if(!email || !password){
        throw new ApiError(400, "Provide required fields");
    } 

    const registeredUser = await User.findOne({email});
    if(!registeredUser){
        throw new ApiError(400, "User with provided email doesn't exist")
    } 

    const isCorrect = await registeredUser.verifyPassword(password);
    const provider = registeredUser.provider;
    if(!isCorrect && provider === "local"){
        throw new ApiError(400, "Incorrect Password");
    } 
    

    const token = await registeredUser.generateAccessToken();

    res.header('x-auth-token', token);

    registeredUser.password = undefined;
    
    return res.status(200).json( 
        new ApiResponse(200, { ...registeredUser._doc, token}, "User login successfull")
    )

})

exports.forgotPassword = asyncHandler(async(req, res, next)=>{

    const {email, password, confirmPassword} = req.body;

    if(!password || !confirmPassword){
        throw new ApiError(400, "Please provide the required details");
    }

    if(password !== confirmPassword){
        throw new ApiError(400, "Password and Confirm passwrod doesn't match");
    }

    const isWeak =  passSteangth(password);
    if(isWeak){
        throw new ApiError(400, isWeak);
    }

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(400, "Password can't be reset, user not found")
    }

    user.password = await bcrypt.hash(password, 10);

    await user.save();

    user.password = undefined;

    return res.status(200).json(
        new ApiResponse(200, user, "Password reset successful")
    )

})

exports.getUser = asyncHandler(async(req, res, next)=>{

    const user = req.user;

    user.password = undefined;

    return res.status(200).json(
        new ApiResponse(200, user._doc, "user details fetched successfully")
    )
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

