const asyncHandler = (func) => async(req, res, next) => {
    try{
        await func(req, res, next);
    }
    catch(err){
        console.log(err);
        res.status(err.statusCode || 500).json({
            success:false,
            message: `${err}`
        })
    } 
};
module.exports = asyncHandler;


