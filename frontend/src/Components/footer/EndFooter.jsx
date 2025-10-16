import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Users } from "react-feather";

const Footer = () => {
  const contactItems = [
    {
      icon: <Mail className="w-6 h-6 text-blue-600" />,
      title: "Email Us",
      content: [
        "bhishmadandekar@gmail.com",
        "adityadhakane@gmail.com",
        "prathamdattawade@gmail.com"
      ]
    },
    {
      icon: <MapPin className="w-6 h-6 text-green-600" />,
      title: "Visit Us",
      content: ["Vishwakarma Institute of Technology", "Pune, 411037"]
    },
    {
      icon: <Phone className="w-6 h-6 text-purple-600" />,
      title: "Call Us",
      content: ["724962727", "820888878", "8766903584"]
    }
  ];

  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative bg-gradient-to-b from-slate-900 to-blue-900 text-white pt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            className="inline-block mb-8"
          >
            <Users className="w-12 h-12 text-cyan-400 p-2 bg-cyan-900/30 rounded-lg" />
          </motion.div>
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
            About EfficienSee
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Revolutionizing workforce productivity through AI-powered analytics and intelligent automation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pb-16">
          {contactItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 p-8 rounded-xl backdrop-blur-sm border border-white/10"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/10 rounded-lg">{item.icon}</div>
                <h3 className="text-2xl font-semibold">{item.title}</h3>
              </div>
              <ul className="space-y-3">
                {item.content.map((line, lineIndex) => (
                  <li 
                    key={lineIndex}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="border-t border-white/10 py-8 text-center">
          <p className="text-slate-400">
            © {new Date().getFullYear()} EfficienSee. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;