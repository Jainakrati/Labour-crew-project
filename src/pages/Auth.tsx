import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Hammer, 
  Briefcase, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  MapPin
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SKILLS_LIST, LOCATIONS_LIST } from '../constants';
import { Link } from 'react-router-dom';

const googleProvider = new GoogleAuthProvider();

export default function Auth({ user }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('worker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [location, setLocation] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      try {
        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          console.log("Creating new user document in Firestore...");
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: role, // Use selected role for new users
            createdAt: serverTimestamp(),
            rating: 0,
            reviewCount: 0,
            bio: '',
            skills: role === 'worker' ? selectedSkills : [],
            location: location,
            hourlyRate: role === 'worker' ? (hourlyRate ? Number(hourlyRate) : 0) : 0
          });

          // Save private data
          await setDoc(doc(db, 'users', user.uid, 'private', 'profile'), {
            email: user.email
          });
          console.log("User document and private profile created successfully");
        } else {
          console.log("User document already exists");
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        console.log("Attempting email login...");
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Email login successful");
      } else {
        console.log("Attempting email signup...");
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Update Auth profile
        await updateProfile(result.user, { displayName: displayName });
        
      try {
        console.log("Creating user document in Firestore...");
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          displayName: displayName,
          role: role,
          createdAt: serverTimestamp(),
          rating: 0,
          reviewCount: 0,
          bio: '',
          skills: role === 'worker' ? selectedSkills : [],
          location: location,
          hourlyRate: role === 'worker' ? (hourlyRate ? Number(hourlyRate) : 0) : 0
        });

        // Save private data
        await setDoc(doc(db, 'users', result.user.uid, 'private', 'profile'), {
          email: result.user.email
        });
        console.log("User document and private profile created successfully");
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${result.user.uid}`);
      }
      }
      navigate('/dashboard');
    } catch (err) {
      console.error("Email Auth Error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError("Email/Password authentication is not enabled in the Firebase Console. Please enable it under Authentication > Sign-in method.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Side - Visuals */}
        <div className="md:w-1/2 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000" 
              alt="Auth background" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-indigo-600/90" />
          </div>
          
          <div className="relative z-10">
            <Link to="/" className="flex items-center space-x-2 mb-12">
              <div className="bg-white p-2 rounded-lg">
                <Hammer className="h-6 w-6 text-indigo-600" />
              </div>
              <span className="text-2xl font-bold">Labour Crew</span>
            </Link>
            
            <h2 className="text-4xl font-bold mb-6">
              {isLogin ? "Welcome Back!" : "Join Our Community"}
            </h2>
            <p className="text-indigo-100 text-lg leading-relaxed mb-8">
              {isLogin 
                ? "Sign in to access your dashboard and manage your jobs or applications."
                : "Create an account to start hiring skilled labor or finding work opportunities."}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="h-5 w-5 text-yellow-300" />
                <span>Verified Profiles</span>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldCheck className="h-5 w-5 text-yellow-300" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldCheck className="h-5 w-5 text-yellow-300" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-12 pt-8 border-t border-white/20">
            <p className="text-sm text-indigo-200">
              © {new Date().getFullYear()} Labour Crew. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center mb-8">
              <div className="inline-flex p-1 bg-gray-100 rounded-xl">
                <button
                  onClick={() => setIsLogin(true)}
                  className={cn(
                    "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                    isLogin ? "bg-white text-indigo-600 shadow-md" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Login
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={cn(
                    "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                    !isLogin ? "bg-white text-indigo-600 shadow-md" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Sign Up
                </button>
              </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-5">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => setRole('worker')}
                      className={cn(
                        "flex flex-col items-center p-4 rounded-2xl border-2 transition-all",
                        role === 'worker' 
                          ? "border-indigo-600 bg-indigo-50 text-indigo-600" 
                          : "border-gray-100 hover:border-gray-200 text-gray-500"
                      )}
                    >
                      <Hammer className="h-6 w-6 mb-2" />
                      <span className="font-bold text-sm">Worker</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('hirer')}
                      className={cn(
                        "flex flex-col items-center p-4 rounded-2xl border-2 transition-all",
                        role === 'hirer' 
                          ? "border-indigo-600 bg-indigo-50 text-indigo-600" 
                          : "border-gray-100 hover:border-gray-200 text-gray-500"
                      )}
                    >
                      <Briefcase className="h-6 w-6 mb-2" />
                      <span className="font-bold text-sm">Hirer</span>
                    </button>
                  </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    {role === 'worker' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-5"
                      >
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">Select Your Skills</label>
                          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-100">
                            {SKILLS_LIST.map((skill) => (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => {
                                  if (selectedSkills.includes(skill)) {
                                    setSelectedSkills(selectedSkills.filter(s => s !== skill));
                                  } else {
                                    setSelectedSkills([...selectedSkills, skill]);
                                  }
                                }}
                                className={cn(
                                  "px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                                  selectedSkills.includes(skill)
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                                    : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
                                )}
                              >
                                {skill}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <select
                              required
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none appearance-none"
                            >
                              <option value="">Select Location</option>
                              {LOCATIONS_LIST.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Expected Hourly Rate (₹)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                            <input
                              type="number"
                              required
                              value={hourlyRate}
                              onChange={(e) => setHourlyRate(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                              placeholder="500"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                </>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center space-x-2 text-sm">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? "Sign In" : "Create Account"}</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center space-x-3"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />
              <span>Google Account</span>
            </button>

            <p className="mt-8 text-center text-gray-500 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-600 font-bold hover:underline"
              >
                {isLogin ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
