// Navbar.jsx (Enhanced)
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              EfficienSee
            </span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            {['Home', 'Features', 'Contact'].map((item, index) => (
              <motion.button
                key={item}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                {item}
              </motion.button>
            ))}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login?mode=login")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;