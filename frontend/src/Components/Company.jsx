// Company.jsx (Enhanced Hero Section)
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Company = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-indigo-900/80 z-10"></div>
      
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover object-center animate-kenburns"
          src="/src/Components/Assets/company.jpg"
          alt="Workplace collaboration"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 space-y-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400"
        >
          EfficienSee
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl sm:text-2xl text-blue-100 max-w-2xl mx-auto"
        >
          Transform your workforce productivity with AI-powered analytics and real-time insights
        </motion.p>

        {/* <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/login")} 
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-lg px-8 py-3 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/20"
        >
          Get Started Free
        </motion.button> */}
      </div>
    </div>
  );
};

export default Company;