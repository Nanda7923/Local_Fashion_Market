const sendErrorResponse = (res, err, statusCode = 500) => {
    const errMessage = typeof err === 'object' ? err.message : err;

    return res.status(statusCode).json({
        message: errMessage || "An unexpected error occurred",
    });
};

module.exports = sendErrorResponse;