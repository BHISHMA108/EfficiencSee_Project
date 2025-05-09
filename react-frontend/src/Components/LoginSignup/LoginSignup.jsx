import { useState } from "react";
import { motion } from "framer-motion"; // Added motion import
import { auth, db } from "../../Firebase/Firebase";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; 
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, User, Briefcase } from "react-feather";

const LoginSignup = () => {
  const [action, setAction] = useState("Sign up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("employee");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Keep all your existing auth logic here
  const handleLogout = () => {
    localStorage.clear();
    auth.signOut();
    window.location.href = `/login?ts=${Date.now()}`;
  };
  
  const handleSignup = async () => {
    try {
      setError("");

      if (!name || !email || !password || !role) {
        throw new Error("All fields are required");
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role: role.toLowerCase(),
        createdAt: new Date(),
      });

      const sanitizedEmail = sanitizeEmail(email); 
      localStorage.setItem("email", email);
      localStorage.setItem("sanitizedEmail", sanitizedEmail);

      if (role.toLowerCase() === "employee") {
        try {
          const response = await fetch("https://efficiensee-back-end.onrender.com/api/employees/create-collection", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || "Failed to create collection");
          }

          console.log("MongoDB Response:", result);
          if (result.collection) {
            localStorage.setItem("sanitizedCollectionName", result.collection);
          }
        } catch (err) {
          console.error("Collection error:", err);
          throw new Error("Failed to initialize employee storage");
        }
      }

      alert(`Successfully signed up as ${role}!`);
      setAction("Login");
      setEmail("");
      setPassword("");
      setName("");

      // Navigate to the login page after successful signup
      navigate("/login?mode=login");

    } catch (error) {
      let message = error.message;
      if (error.code === "auth/email-already-in-use") {
        message = "Email is already registered. Please login instead.";
      }
      setError(message.replace("Firebase:", ""));
    }
  };
  
  const sanitizeEmail = (email) => {
    return email.toLowerCase().replace(/@/g, '_at_').replace(/\./g, '_dot_');
  };
  
  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get fresh Firebase token
      const token = await user.getIdToken(); //c
      localStorage.setItem("token", token); // Add this line //c

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) throw new Error("User data not found");

      // Clear previous data
      localStorage.removeItem("employeeData"); //c

      const userRole = userDoc.data().role.toLowerCase();
      const sanitizedEmail = sanitizeEmail(email);

      localStorage.setItem('email', email);
      localStorage.setItem('sanitizedEmail', sanitizedEmail);
      
      navigate(userRole === "manager" ? "/manager" : "/employee");

    } catch (error) {
      setError(error.message.replace("Firebase:", ""));
    }
  };
  
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 relative flex items-center justify-center">
      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogout}
        className="absolute top-6 left-6 z-20 text-white flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Home</span>
      </motion.button>

      {/* Form Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 15.5, y: 0 }}
        className="relative bg-white/15 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl w-full max-w-md mx-4 p-8"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block mb-4"
          >
            <div className="w-12 h-12 bg-blue-600/30 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-blue-400" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {action === "Sign up" ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-blue-200">
            {action === "Sign up" 
              ? "Get started with EfficienSee" 
              : "Sign in to continue"}
          </p>
        </div>

        <div className="space-y-6">
          {action === "Sign up" && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-1"
              >
                <label className="text-sm font-medium text-blue-200">Full Name</label>
                <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                  <User className="w-5 h-5 text-blue-400" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-blue-300 outline-none"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-1"
              >
                <label className="text-sm font-medium text-blue-200">Role</label>
                <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-transparent text-white outline-none"
                  >
                    <option value="employee" className="bg-gray-800">Employee</option>
                    <option value="manager" className="bg-gray-800">Manager</option>
                  </select>
                </div>
              </motion.div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-blue-200">Email</label>
            <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 border border-white/10">
              <Mail className="w-5 h-5 text-blue-400" />
              <input
                type="email"
                placeholder="john@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-white placeholder-blue-300 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-blue-200">Password</label>
            <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 border border-white/10">
              <Lock className="w-5 h-5 text-blue-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-white placeholder-blue-300 outline-none"
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-500/20 text-red-300 rounded-lg flex items-center gap-2"
            >
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action === "Sign up" ? handleSignup : handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {action === "Sign up" ? "Create Account" : "Sign In"}
            </motion.button>

            <button
              onClick={() => setAction(action === "Sign up" ? "Login" : "Sign up")}
              className="w-full text-center text-blue-300 hover:text-blue-200 text-sm"
            >
              {action === "Sign up" 
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginSignup;