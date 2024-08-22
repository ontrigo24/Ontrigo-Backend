const {asyncHandler, ApiError, ApiResponse, mailSender} = require("../utils");
const {User, Otp} = require("../models");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const admin = require("../config/firebase.config");

// signup using facebook

exports.firebaseSignup = asyncHandler(async(req, res, next)=>{

    let {provider, providerToken} = req.body;

    console.log(provider, "\n", providerToken);

    if(!providerToken || !provider){    
        const notFound = !providerToken ? "providerToken" : "provider";
        throw new ApiError(400, `Please provide required fields, ${notFound} not found`);
    } 

    if(provider !== "google" && provider !== "facebook"){
        throw new ApiError(400, "Invalid provider");
    }

    // get details from provierToken
    let firstName = null, lastName = null, email = null, avatarUrl = null, password = null;

    if(provider === "google"){
        const googleUser = await admin.auth().verifyIdToken(providerToken);

        console.log(googleUser);

        if(!googleUser){
            throw new ApiError(404, "google user not found");
        }

        if(!googleUser.email_verified){
            throw new ApiError(400, "email verification failed");
        }
        const email = googleUser.email;

        const {name} = googleUser;

        firstName = name.split(" ")[0];
        lastName = name.split(" ")[1];

        avatarUrl = googleUser.picture;
    }
            
    // check if user already registered
    const existedUser = await User.findOne({email});
    if(existedUser){
        throw new ApiError(409, "Email already in use");
    }

    // create entry in db
    const user = await User.create({
        email,
        firstName,
        lastName,
        password,
        avatarUrl,
        provider,
    });

    user.password = undefined;
    user.previousIternaries = undefined;

    // generate jwt token
    const token = user.generateAccessToken();

    // return response
    res.header("x-auth-token", token);
    
    return res.status(200).json(
        new ApiResponse(200, {...user._doc, token}, "User signup via firebase successful")
    )

})

exports.firebaseSignin = asyncHandler(async(req, res, next)=>{
    const {provider, providerToken} = req.body;

    console.log(provider, "\n", providerToken);

    if(!provider || !providerToken){
        const notFound = !providerToken ? "providerToken" : "provider";
        throw new ApiError(400, `Please provide required fields, ${notFound} not found`);
    } 

    let email = null;

    if(provider === "google"){
        const googleUser = await admin.auth().verifyIdToken(providerToken);

        if(!googleUser){
            throw new ApiError(404, "google user not found");
        }
    
        const googleData = googleUser.providerData.filter((data)=> data.providerId === "google.com")[0];

        email = googleData.email;
    
    }
            
    if(!email){
        throw new ApiError(404, "User email not found");
    }

    const user = await User.findOne({email}).select("-password -previousIternaries");

    if(!user){
        throw new ApiError(409, "User not registered");
    }

    // generate jwt token
    const token = user.generateAccessToken();

    // return response
    res.header("x-auth-token", token);
    
    return res.status(200).json(
        new ApiResponse(200, {...user._doc, token}, "User signin via firebase successful")
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

    if(sentOtp.length == 0){
        throw new ApiError(410, "Otp was not generated");
    }

    if(sentOtp[0].otp !== otp){
        throw new ApiError(400, "Incorrect OTP");
    }

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
    createdUser.previousIternaries = undefined;
    return res.status(200).json(
        new ApiResponse(200, {...createdUser._doc, token}, "User signup successful")
    )

})

exports.sendOtp = asyncHandler( async(req, res, next)=>{
    
    // take input
    const {email, type} = req.body;                                 // type tells that being used for singup or forgot password

    // verify input
    if(!email) throw new ApiError(400, "Email field required");

    if(type !== "signup" && type !== "forgotPassword"){
        throw new ApiError(400, "Ivalid otp type requested");
    }

    // check if user for this email exists
    const existedUser = await User.findOne({email});

    if(existedUser && type === "signup"){
        throw new ApiError(409, "Provided email already in use");
    } 
    if(!existedUser && type === "forgotPassword"){
        throw new ApiError(409, "User not registered");
    } 
    
    // generate new otp
    const otp = otpGenerator.generate( 4, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars:false
    });

    // send email
    const emailResponse = await mailSender(email, "Your Ontrigo verification code is: ", otp);

    if(!emailResponse){
        throw new ApiError(500, "Otp verification email couldn't be sent");
    }

    // create entry for otp in db
    const createdOtp = await Otp.create({otp, email, type});

    // return response
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

    const registeredUser = await User.findOne({email}).select("-previousIternaries");
    if(!registeredUser){
        throw new ApiError(409, "User with provided email doesn't exist")
    } 
    const isCorrect = await registeredUser.verifyPassword(password);

    const provider = registeredUser.provider;

    if(!isCorrect && provider === "local"){
        throw new ApiError(400, "Incorrect Password");
    } 
    
    const token = await registeredUser.generateAccessToken();

    registeredUser.password = undefined;

    res.header('x-auth-token', token);

    return res.status(200).json( 
        new ApiResponse(200, { ...registeredUser._doc, token}, "User login successfull")
    )

})

exports.forgotPassword = asyncHandler(async(req, res, next)=>{

    const {email, password, confirmPassword, otp} = req.body;

    if(!password || !confirmPassword || !email || !otp){
        throw new ApiError(400, "Please provide the required details");
    }

    // verify Otp
    const sentOtp = await Otp.find({email, type:"forgotPassword"}).sort({createdAt : -1}).limit(1);

    console.log(sentOtp);

    if(sentOtp.length == 0){
        throw new ApiError(410, "Otp was not generated");
    }

    if(sentOtp[0].otp !== otp){
        throw new ApiError(400, "Incorrect OTP");
    }


    if(password !== confirmPassword){
        throw new ApiError(400, "Password and Confirm passwrod doesn't match");
    }

    const isWeak =  passSteangth(password);
    
    if(isWeak){
        throw new ApiError(400, isWeak);
    }

    const encryptedPass = await bcrypt.hash(password, 10);

    const user = await User.findOneAndUpdate({email}, {password:encryptedPass}, {new:true}).select("-password -previousIternaries");


    return res.status(200).json(
        new ApiResponse(200, user._doc, "Password reset successful")
    )

})

exports.getUser = asyncHandler(async(req, res, next)=>{

    const user = req.user;

    user.password = undefined;

    return res.status(200).json(
        new ApiResponse(200, user._doc, "user details fetched successfully")
    )
})

exports.changePassword = asyncHandler(async(req, res, next)=>{
    const {currentPassword, newPassword, confirmPassword} = req.body;

    const user = req.user;

    if(!currentPassword || !newPassword || !confirmPassword){
        throw new ApiError(400, "Please provide all required fields");
    }

    const passVerified = await user.verifyPassword(currentPassword);

    if(!passVerified){
        throw new ApiError(400, "Incorrect password");
    }

    if(newPassword !== confirmPassword){
        throw new ApiError(400, "Password and confirm passwrod doesn't match");
    }

    const isWeak =  passSteangth(newPassword);
    
    if(isWeak){
        throw new ApiError(400, isWeak);
    }

    const encryptedPassword = await bcrypt.hash(newPassword, 10);

    user.password = encryptedPassword;

    const savedUser = await user.save();

    savedUser.password = undefined;

    return res.status(200).json(
        new ApiResponse(200, savedUser._doc, "Password changed successfully")
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

