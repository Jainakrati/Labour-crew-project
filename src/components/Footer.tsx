import { Hammer, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="main-footer" className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div id="footer-grid" className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div id="footer-brand-section" className="space-y-6">
            <Link id="footer-logo-link" to="/" className="flex items-center space-x-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Hammer className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Labour Crew</span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Connecting skilled daily laborers with reliable hirers. Building a community of trust and opportunity.
            </p>
            <div id="footer-social-links" className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div id="footer-quick-links">
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/auth" className="text-gray-400 hover:text-white transition-colors">Get Started</Link></li>
              <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div id="footer-user-links">
            <h3 className="text-lg font-bold mb-6">For Users</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Find Work</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Post a Job</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Safety Guidelines</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support Center</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div id="footer-contact-section">
            <h3 className="text-lg font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 text-gray-400">
                <Mail className="h-5 w-5 text-indigo-500" />
                <span>support@labourcrew.com</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Phone className="h-5 w-5 text-indigo-500" />
                <span>+1 (555) 000-0000</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <MapPin className="h-5 w-5 text-indigo-500" />
                <span>123 Labour St, Work City</span>
              </li>
            </ul>
          </div>
        </div>

        <div id="footer-bottom" className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Labour Crew. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
