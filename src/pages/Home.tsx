import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Hammer, 
  Users, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Star, 
  Briefcase, 
  MapPin, 
  CheckCircle 
} from 'lucide-react';

const features = [
  {
    title: "Quick Hiring",
    description: "Find skilled daily laborers in minutes for your urgent tasks.",
    icon: Clock,
    color: "bg-blue-500"
  },
  {
    title: "Verified Workers",
    description: "Every worker on our platform is verified for safety and trust.",
    icon: ShieldCheck,
    color: "bg-green-500"
  },
  {
    title: "Real-time Tracking",
    description: "Track your job applications and bookings in real-time.",
    icon: Users,
    color: "bg-purple-500"
  },
  {
    title: "Secure Payments",
    description: "Transparent and secure payment system for both parties.",
    icon: ShieldCheck,
    color: "bg-orange-500"
  }
];

const testimonials = [
  {
    name: "John Doe",
    role: "Contractor",
    content: "Labour Crew has completely changed how I find help for my construction projects. Fast and reliable!",
    rating: 5,
    image: "https://picsum.photos/seed/john/100/100"
  },
  {
    name: "Sarah Smith",
    role: "Homeowner",
    content: "I needed help with gardening and found a great worker within an hour. Highly recommended!",
    rating: 5,
    image: "https://picsum.photos/seed/sarah/100/100"
  },
  {
    name: "Mike Johnson",
    role: "Worker",
    content: "This platform helps me find consistent work and ensures I get paid fairly. Thank you!",
    rating: 5,
    image: "https://picsum.photos/seed/mike/100/100"
  }
];

export default function Home() {
  return (
    <div id="home-page" className="overflow-hidden">
      {/* Hero Section */}
      <section id="hero-section" className="relative min-h-[90vh] flex items-center pt-20 pb-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=2000" 
            alt="Domestic help background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-900/80 to-indigo-900/90" />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-3xl" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              rotate: [0, -90, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] bg-indigo-300/20 rounded-full blur-3xl" 
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              id="hero-content"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 id="hero-title" className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
                Connecting <span className="text-yellow-300">Skilled Hands</span> with Urgent Needs
              </h1>
              <p className="text-xl text-indigo-100 mb-10 leading-relaxed max-w-xl">
                The most trusted platform for daily labor hiring. Fast, secure, and reliable connections for every task.
              </p>
              <div id="hero-cta-buttons" className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link 
                  to="/auth" 
                  className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 hover:text-indigo-800 transition-all transform hover:scale-105 shadow-2xl flex items-center justify-center space-x-2"
                >
                  <span>Post a Job</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link 
                  to="/auth" 
                  className="bg-indigo-700/30 backdrop-blur-md border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center"
                >
                  Find Work
                </Link>
              </div>
              
              <div className="mt-12 flex items-center space-x-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <img 
                      key={i}
                      src={`https://picsum.photos/seed/user${i}/100/100`} 
                      className="w-12 h-12 rounded-full border-2 border-white object-cover"
                      referrerPolicy="no-referrer"
                      alt="User"
                    />
                  ))}
                </div>
                <div className="text-white">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-300 fill-current" />
                    <span className="font-bold">4.9/5</span>
                  </div>
                  <p className="text-sm text-indigo-100">Trusted by 10k+ users</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
                <div className="space-y-6">
                  {/* Mock Job Card */}
                  <div className="bg-white rounded-2xl p-4 shadow-lg transform -rotate-2 hover:rotate-0 transition-transform">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Briefcase className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">Skilled Carpenter</h3>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>Downtown</span>
                      </div>
                      <div className="font-bold text-green-600">₹500/hr</div>
                    </div>
                    <div className="flex space-x-2">
                      <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-1 rounded-full font-bold uppercase">Woodwork</span>
                      <span className="bg-purple-50 text-purple-600 text-[10px] px-2 py-1 rounded-full font-bold uppercase">Urgent</span>
                    </div>
                  </div>

                  {/* Mock Worker Card */}
                  <div className="bg-white rounded-2xl p-4 shadow-lg transform translate-x-12 rotate-3 hover:rotate-0 transition-transform">
                    <div className="flex items-center space-x-4">
                      <img src="https://picsum.photos/seed/worker/100/100" className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" alt="Worker" />
                      <div>
                        <h3 className="font-bold text-gray-800">Robert Fox</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs font-bold">4.8 (120 reviews)</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-gray-600">Verified Expert</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div id="features-header" className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Labour Crew?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide a seamless experience for both hirers and workers with our advanced features.
            </p>
          </div>

          <div id="features-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-2xl transition-all border border-transparent hover:border-gray-100"
              >
                <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats-section" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=2000" 
            alt="Housework background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-indigo-900/90" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">10k+</div>
              <div className="text-indigo-100 font-medium">Active Workers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">5k+</div>
              <div className="text-indigo-100 font-medium">Happy Hirers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">20k+</div>
              <div className="text-indigo-100 font-medium">Jobs Completed</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">4.9/5</div>
              <div className="text-indigo-100 font-medium">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials-section" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div id="testimonials-header" className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Community Says</h2>
            <p className="text-xl text-gray-600">Real stories from real people using Labour Crew.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <img src={t.image} alt={t.name} className="w-14 h-14 rounded-full object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-bold text-gray-900">{t.name}</h4>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 italic leading-relaxed">"{t.content}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta-section" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div id="cta-banner" className="relative rounded-[3rem] p-12 md:p-20 text-center overflow-hidden shadow-2xl">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=2000" 
                alt="Helping background" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/95 to-purple-900/95" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to Build Something Great?</h2>
              <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
                Join thousands of users who are already finding work and hiring skilled labor on Labour Crew.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link 
                  to="/auth" 
                  className="bg-white text-indigo-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 hover:text-indigo-800 transition-all transform hover:scale-105 shadow-xl"
                >
                  Join as a Hirer
                </Link>
                <Link 
                  to="/auth" 
                  className="bg-indigo-800 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-indigo-900 transition-all transform hover:scale-105 shadow-xl border border-white/20"
                >
                  Join as a Worker
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
