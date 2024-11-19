const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("No token provided");
    return res.status(403).json({ error: "Forbidden: No token provided!" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token extracted:", token);

  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) {
      console.log("JWT verification failed:", err);
      return res.status(401).json({ error: "Unauthorized!" });
    }

    console.log("Decoded payload:", payload);

    try {
      const user = await User.findOne({ _id: payload._id }).select("-password");
      if (!user) {
        console.log("User not found");
        return res.status(401).json({ error: "Unauthorized!" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.log("Error while finding user:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
};

