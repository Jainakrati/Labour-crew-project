import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { 
  User, 
  Star, 
  Mail, 
  Calendar, 
  Edit3, 
  CheckCircle, 
  Hammer, 
  Briefcase, 
  Loader2,
  MapPin,
  MessageSquare,
  X,
  Phone,
  Home
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SKILLS_LIST, LOCATIONS_LIST } from '../constants';

export default function Profile({ user, userData: currentUserData }) {
  const { uid } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: '',
    bio: '',
    selectedSkills: [],
    location: '',
    hourlyRate: '',
    phoneNumber: '',
    address: ''
  });

  useEffect(() => {
    if (!uid) return;

    const unsubProfile = onSnapshot(doc(db, 'users', uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData(data);
        setEditData({
          displayName: data.displayName || '',
          bio: data.bio || '',
          selectedSkills: data.skills || [],
          location: data.location || '',
          hourlyRate: data.hourlyRate?.toString() || '',
          phoneNumber: data.phoneNumber || '',
          address: data.address || ''
        });
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      setLoading(false);
    });

    const qReviews = query(collection(db, 'reviews'), where('toId', '==', uid));
    const unsubReviews = onSnapshot(qReviews, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reviews');
    });

    return () => {
      unsubProfile();
      unsubReviews();
    };
  }, [uid]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user || user.uid !== uid) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', uid), {
        displayName: editData.displayName,
        bio: editData.bio,
        skills: editData.selectedSkills,
        location: editData.location,
        hourlyRate: Number(editData.hourlyRate) || 0,
        phoneNumber: editData.phoneNumber,
        address: editData.address
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  const isOwnProfile = user?.uid === uid;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Profile Card */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000" 
                alt="Profile cover" 
                className="w-full h-full object-cover opacity-30"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="relative z-10 pt-8">
              <div className="mb-6 relative inline-block">
                {profileData?.photoURL ? (
                  <img 
                    src={profileData.photoURL} 
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-2xl" 
                    referrerPolicy="no-referrer" 
                    alt="Profile" 
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center mx-auto border-4 border-white shadow-2xl">
                    <User className="h-16 w-16 text-indigo-600" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-green-500 border-4 border-white w-6 h-6 rounded-full" />
              </div>

              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{profileData?.displayName || 'Anonymous'}</h1>
              <div className={cn(
                "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6",
                profileData?.role === 'hirer' ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
              )}>
                {profileData?.role === 'hirer' ? <Briefcase className="h-3 w-3 mr-2" /> : <Hammer className="h-3 w-3 mr-2" />}
                {profileData?.role}
              </div>

              <div className="flex items-center justify-center space-x-2 mb-8">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="text-xl font-bold text-gray-900">{profileData?.rating || '0.0'}</span>
                <span className="text-gray-500">({profileData?.reviewCount || 0} reviews)</span>
              </div>

              <div className="space-y-4 text-left border-t border-gray-50 pt-8">
                {(isOwnProfile || currentUserData?.role === 'admin') && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Mail className="h-5 w-5 text-indigo-500" />
                    <span className="text-sm font-medium">
                      {isOwnProfile ? user.email : "Email hidden for privacy"}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-3 text-gray-600">
                  <Calendar className="h-5 w-5 text-indigo-500" />
                  <span className="text-sm font-medium">Joined {profileData?.createdAt?.toDate ? new Date(profileData.createdAt.toDate()).toLocaleDateString() : 'Recently'}</span>
                </div>
                {profileData?.location && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <MapPin className="h-5 w-5 text-indigo-500" />
                    <span className="text-sm font-medium">{profileData.location}</span>
                  </div>
                )}
                {isOwnProfile && profileData?.phoneNumber && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Phone className="h-5 w-5 text-indigo-500" />
                    <span className="text-sm font-medium">{profileData.phoneNumber}</span>
                  </div>
                )}
                {isOwnProfile && profileData?.address && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Home className="h-5 w-5 text-indigo-500" />
                    <span className="text-sm font-medium">{profileData.address}</span>
                  </div>
                )}
                {profileData?.role === 'worker' && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <span className="text-indigo-500 font-bold text-lg">₹</span>
                    <span className="text-sm font-medium">{profileData.hourlyRate || 0}/hr</span>
                  </div>
                )}
              </div>

              {isOwnProfile && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="mt-8 w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Edit3 className="h-5 w-5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </motion.div>

          {/* Skills Card - Only for Workers */}
          {profileData?.role === 'worker' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span>Skills & Expertise</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {profileData?.skills && profileData.skills.length > 0 ? (
                  profileData.skills.map((skill: string, i: number) => (
                    <span key={i} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-sm">No skills listed yet.</p>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Bio & Reviews */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <MessageSquare className="h-7 w-7 text-indigo-600" />
              <span>About Me</span>
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
              {profileData?.bio || "This user hasn't written a bio yet."}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center space-x-3">
              <Star className="h-7 w-7 text-yellow-400" />
              <span>Reviews & Feedback</span>
            </h2>

            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No reviews yet.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 last:border-0 pb-8 last:pb-0">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-indigo-50 p-2 rounded-full">
                          <User className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">User {review.fromId.slice(0, 6)}</div>
                          <div className="text-xs text-gray-500">{review.createdAt?.toDate ? new Date(review.createdAt.toDate()).toLocaleDateString() : 'Just now'}</div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "h-4 w-4",
                              i < review.rating ? "text-yellow-400 fill-current" : "text-gray-200"
                            )} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsEditing(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">Edit Profile</h2>
                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-8 w-8" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editData.displayName}
                    onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
                  <textarea
                    rows={4}
                    value={editData.bio}
                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {profileData?.role === 'worker' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Skills & Expertise</label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-100">
                      {SKILLS_LIST.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => {
                            if (editData.selectedSkills.includes(skill)) {
                              setEditData({
                                ...editData,
                                selectedSkills: editData.selectedSkills.filter(s => s !== skill)
                              });
                            } else {
                              setEditData({
                                ...editData,
                                selectedSkills: [...editData.selectedSkills, skill]
                              });
                            }
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                            editData.selectedSkills.includes(skill)
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                              : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
                          )}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {profileData?.role === 'worker' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                    <select
                      value={editData.location}
                      onChange={(e) => setEditData({...editData, location: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    >
                      <option value="">Select Location</option>
                      {LOCATIONS_LIST.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                )}

                {profileData?.role === 'worker' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Hourly Rate (₹)</label>
                    <input
                      type="number"
                      value={editData.hourlyRate}
                      onChange={(e) => setEditData({...editData, hourlyRate: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. 500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={editData.phoneNumber}
                      onChange={(e) => setEditData({...editData, phoneNumber: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. +91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Address</label>
                    <input
                      type="text"
                      value={editData.address}
                      onChange={(e) => setEditData({...editData, address: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. 123, Main St, City"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <span>Save Changes</span>}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
