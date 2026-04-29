import { motion } from "framer-motion";

const technologies = [
  { name: "React", category: "Frontend UI", color: "text-blue-500", bg: "bg-blue-50 border border-blue-200" },
  { name: "Tailwind CSS", category: "Styling", color: "text-cyan-500", bg: "bg-cyan-50 border border-cyan-200" },
  { name: "Node.js", category: "Backend Runtime", color: "text-green-600", bg: "bg-green-50 border border-green-200" },
  { name: "Express", category: "API Framework", color: "text-slate-700", bg: "bg-slate-100 border border-slate-300" },
  { name: "MongoDB", category: "Database", color: "text-emerald-500", bg: "bg-emerald-50 border border-emerald-200" },
  { name: "Socket.io", category: "Real-time Events", color: "text-zinc-800", bg: "bg-zinc-100 border border-zinc-300" },
  { name: "Redis", category: "In-memory Cache", color: "text-red-700", bg: "bg-red-50 border border-red-200" },
  { name: "Python", category: "Desktop Agent", color: "text-yellow-600", bg: "bg-yellow-50 border border-yellow-200" }
];

const TechStack = () => {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-800 mb-4">Powered by a Modern Tech Stack</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Built with scalable, secure, and high-performance technologies
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-2xl flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow ${tech.bg}`}
            >
              <span className={`font-bold text-xl mb-2 ${tech.color}`}>{tech.name}</span>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{tech.category}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechStack;
