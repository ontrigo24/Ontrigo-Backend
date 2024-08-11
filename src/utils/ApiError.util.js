class ApiError extends Error{

    constructor(
        statusCode,
        message = "Something went wrong",
        error = [],
        stack = "",
    ){
        super(message);                         // message property of Error class will be overriden
        this.statusCode = statusCode;           // custom properties
        this.data = null;
        this.message = message;
        this.success = false;
        this.error = error;

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = ApiError;