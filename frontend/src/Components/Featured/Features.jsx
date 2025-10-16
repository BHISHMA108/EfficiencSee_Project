// Features.jsx (Enhanced)
import { motion } from "framer-motion";
import { BarChart, Users, Activity } from "react-feather";

const features = [
  {
    icon: <BarChart size={48} className="text-cyan-500" />,
    title: "Productivity Dashboard",
    description: "Real-time tracking of work patterns with intelligent time management insights"
  },
  {
    icon: <Users size={48} className="text-purple-500" />,
    title: "Team Analytics",
    description: "Comprehensive workforce analytics with performance benchmarking"
  },
  {
    icon: <Activity size={48} className="text-pink-500" />,
    title: "AI Evaluation",
    description: "Machine learning powered insights for optimal resource allocation"
  }
];

const Features = () => {
  return (
    <div className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-800 mb-4">Enterprise-Grade Features</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Empower your organization with cutting-edge workforce optimization tools
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;