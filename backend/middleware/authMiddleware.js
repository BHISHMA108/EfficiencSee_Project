const admin = require("../firebaseAdmin");
const User = require("../models/User");
const sanitize = require("mongo-sanitize");


const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decodedToken = await admin.auth().verifyIdToken(token);

    const user = await User.findOne({
      firebaseUid: decodedToken.uid
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;               // Mongo user
    req.firebaseUser = decodedToken; // Firebase user

    next();
  } catch (err) {
    console.error("❌ Firebase Auth Error:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * 🔒 Role-based access control (RBAC)
 */
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};

module.exports = {
  verifyFirebaseToken,
  authorizeRole
};
