class ApiResponse {
  static success(res, data, message = "success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res, message = "error", statusCode = 500, error = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
    });
  }
}

module.exports = ApiResponse;
