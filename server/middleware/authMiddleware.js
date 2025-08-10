import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "express-async-handler";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401);
        throw new Error("Not authorized, user not found");
      }

      next();
    } catch (error) {
      console.error("Token verification error:", error.message);
      res
        .status(401)
        .json({
          success: false,
          message: "Not authorized, token failed",
          code: "AUTH_FAILED",
        });
    }
  }

  if (!token) {
    res
      .status(401)
      .json({
        success: false,
        message: "Not authorized, no token",
        code: "NO_TOKEN",
      });
  }
});

export default protect;
