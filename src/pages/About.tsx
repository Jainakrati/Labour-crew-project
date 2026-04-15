import { motion } from 'motion/react';
import { 
  Hammer, 
  Target, 
  Users, 
  ShieldCheck, 
  Heart, 
  Globe, 
  Award, 
  Zap 
} from 'lucide-react';

const values = [
  {
    title: "Trust & Safety",
    description: "We prioritize the safety of our community through rigorous verification and secure systems.",
    icon: ShieldCheck,
    color: "bg-blue-500"
  },
  {
    title: "Empowerment",
    description: "Providing workers with consistent opportunities and hirers with skilled talent.",
    icon: Zap,
    color: "bg-yellow-500"
  },
  {
    title: "Community",
    description: "Building a supportive network where everyone can thrive and grow together.",
    icon: Users,
    color: "bg-purple-500"
  },
  {
    title: "Excellence",
    description: "Committed to delivering the highest quality service and platform experience.",
    icon: Award,
    color: "bg-pink-500"
  }
];

export default function About() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=2000" 
            alt="About background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-sm font-bold mb-8"
            >
              <Heart className="h-4 w-4" />
              <span>Our Mission</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 leading-tight"
            >
              Revolutionizing the <span className="text-indigo-600">Daily Labour</span> Market
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 leading-relaxed"
            >
              Labour Crew was born from a simple idea: to create a bridge between skilled daily laborers and those who need their expertise, built on a foundation of trust, transparency, and technology.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Stats/Impact */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-8">Why We Started</h2>
              <div className="space-y-6">
                <p className="text-gray-600 text-lg leading-relaxed">
                  For too long, the daily labor market has been fragmented and unreliable. Workers struggled to find consistent work, and hirers found it difficult to find verified, skilled talent quickly.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  We built Labour Crew to solve these problems. Our platform provides a centralized hub where skills are recognized, work is fairly compensated, and safety is never compromised.
                </p>
              </div>
              <div className="mt-12 grid grid-cols-2 gap-8">
                <div>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">2024</div>
                  <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Founded</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">100k+</div>
                  <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Connections</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-indigo-600 rounded-[3rem] overflow-hidden shadow-2xl relative">
                <img 
                  src="https://picsum.photos/seed/team/800/800" 
                  alt="Team" 
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent flex items-end p-12">
                  <div className="text-white">
                    <div className="text-2xl font-bold mb-2">Our Vision</div>
                    <p className="text-indigo-100">To become the world's most trusted platform for on-demand skilled labor.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-2xl transition-all border border-transparent hover:border-gray-100"
              >
                <div className={`${value.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
