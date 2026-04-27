import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { 
  MapPin, 
  Clock, 
  Briefcase, 
  User, 
  Users,
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Star, 
  Send,
  Loader2,
  Trash2,
  AlertCircle,
  ChevronDown,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function JobDetails({ user, userData }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [hirer, setHirer] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', id));
        if (jobDoc.exists()) {
          const jobData = jobDoc.data();
          setJob({ id: jobDoc.id, ...jobData });
          
          // Fetch hirer info
          const hirerDoc = await getDoc(doc(db, 'users', jobData.hirerId));
          if (hirerDoc.exists()) {
            setHirer(hirerDoc.data());
          }
        } else {
          setError('Job not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();

    // Real-time applications for this job (if hirer)
    if (user) {
      const q = query(collection(db, 'applications'), where('jobId', '==', id));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const appsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setApplications(appsData);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'applications');
      });
      return () => unsubscribe();
    }
  }, [id, user]);

  const handleApply = async () => {
    if (!user || !job) return;
    setApplying(true);
    try {
      // Check if already applied
      const alreadyApplied = applications.some(app => app.workerId === user.uid);
      if (alreadyApplied) {
        setError('You have already applied for this job.');
        return;
      }

      await addDoc(collection(db, 'applications'), {
        jobId: job.id,
        jobTitle: job.title,
        workerId: user.uid,
        workerName: userData.displayName || 'Worker',
        hirerId: job.hirerId,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // Notify hirer
      await addDoc(collection(db, 'notifications'), {
        userId: job.hirerId,
        title: 'New Application!',
        message: `${userData.displayName || 'A worker'} has accepted your job: ${job.title}`,
        read: false,
        createdAt: serverTimestamp(),
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  };

  const [selectedAppForApproval, setSelectedAppForApproval] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('');

  const handleApprove = async (app, time) => {
    try {
      // Fetch worker details for contact info
      const workerDoc = await getDoc(doc(db, 'users', app.workerId));
      const workerData = workerDoc.exists() ? workerDoc.data() : {};

      await updateDoc(doc(db, 'applications', app.id), { status: 'accepted' });
      await addDoc(collection(db, 'bookings'), {
        jobId: job.id,
        jobTitle: job.title,
        workerId: app.workerId,
        workerName: app.workerName || 'Worker',
        workerPhone: workerData.phoneNumber || 'Not provided',
        workerAddress: workerData.address || 'Not provided',
        hirerId: user.uid,
        hirerName: userData.displayName || 'Hirer',
        hirerPhone: userData.phoneNumber || 'Not provided',
        hirerAddress: userData.address || 'Not provided',
        status: 'scheduled',
        scheduledAt: serverTimestamp(),
        scheduledTime: time || 'As soon as possible',
      });
      await updateDoc(doc(db, 'jobs', job.id), { status: 'closed' });
      
      // Notify worker
      await addDoc(collection(db, 'notifications'), {
        userId: app.workerId,
        title: 'Application Accepted!',
        message: `Your application for "${job.title}" has been accepted. Scheduled for: ${time || 'As soon as possible'}`,
        read: false,
        createdAt: serverTimestamp(),
      });
      setSelectedAppForApproval(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (app) => {
    try {
      await updateDoc(doc(db, 'applications', app.id), { status: 'rejected' });
      
      // Notify worker
      await addDoc(collection(db, 'notifications'), {
        userId: app.workerId,
        title: 'Application Rejected',
        message: `Your application for "${job.title}" was not selected.`,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const handleUpdateStatus = async (newStatus) => {
    try {
      await updateDoc(doc(db, 'jobs', job.id), { status: newStatus });
      setJob({ ...job, status: newStatus });
      setShowStatusMenu(false);
    } catch (err) {
      setError(err.message);
    }
  };
  const handleDeleteJob = async () => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await deleteDoc(doc(db, 'jobs', job.id));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/dashboard" className="text-indigo-600 font-bold hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.uid === job?.hirerId;
  const isAdminUser = userData?.role === 'admin';
  const canDelete = isOwner || isAdminUser;
  const hasApplied = applications.some(app => app.workerId === user?.uid);

  return (
    <div id="job-details-page-container" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        id="back-to-previous-btn"
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 font-bold mb-8 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>

      <div id="job-details-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Job Info */}
        <div id="job-info-column" className="lg:col-span-2 space-y-8">
          <div id="job-info-card" className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100">
            <div id="job-header" className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-indigo-100 p-2 rounded-xl">
                    <Briefcase className="h-6 w-6 text-indigo-600" />
                  </div>
                  <span id="job-details-label" className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Job Details</span>
                </div>
                <h1 id="job-title-heading" className="text-4xl font-extrabold text-gray-900 mb-4">{job.title}</h1>
                <div id="job-badges" className="flex flex-wrap gap-4">
                  <div id="job-badge-location" className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-bold">{job.location}</span>
                  </div>
                  <div id="job-badge-salary" className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
                    <span className="text-green-500 font-bold text-lg">₹</span>
                    <span className="text-sm font-bold text-gray-900">{job.salary}/hr</span>
                  </div>
                  <div id="job-badge-time" className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-bold">
                      {job.createdAt?.toDate ? new Date(job.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <div id="job-badge-status" className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-full",
                    job.status === 'open' ? "bg-green-100 text-green-600" : 
                    job.status === 'completed' ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"
                  )}>
                    <span className="text-sm font-bold uppercase tracking-wider">{job.status}</span>
                    {canDelete && (
                      <div className="relative">
                        <button 
                          id="status-menu-toggle"
                          onClick={() => setShowStatusMenu(!showStatusMenu)}
                          className="ml-2 hover:bg-white/50 rounded-full p-0.5 transition-colors"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        {showStatusMenu && (
                          <div id="status-dropdown" className="absolute left-0 mt-2 w-32 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 py-1 overflow-hidden">
                            {['open', 'closed', 'completed'].map(s => (
                              <button
                                id={`status-option-${s}`}
                                key={s}
                                onClick={() => handleUpdateStatus(s)}
                                className={cn(
                                  "w-full text-left px-4 py-2 text-xs font-bold capitalize hover:bg-indigo-50 transition-colors",
                                  job.status === s ? "text-indigo-600 bg-indigo-50" : "text-gray-600"
                                )}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {canDelete && (
                <button 
                  id="delete-job-btn"
                  onClick={handleDeleteJob}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-bold text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>

            <div id="job-description-section" className="prose prose-indigo max-w-none">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
              <p id="job-description-text" className="text-gray-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>

            {userData?.role === 'worker' && job.status === 'open' && (
              <div id="job-apply-section" className="mt-12">
                <button
                  id="apply-job-btn"
                  onClick={handleApply}
                  disabled={applying || hasApplied}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2 shadow-xl",
                    hasApplied 
                      ? "bg-gray-100 text-gray-500 cursor-default" 
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  )}
                >
                  {applying ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : hasApplied ? (
                    <>
                      <CheckCircle className="h-6 w-6" />
                      <span>Already Applied</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-6 w-6" />
                      <span>Accept this Job</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Hirer Section: Applications List */}
          {isOwner && (
            <div id="hirer-applications-section" className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center space-x-3">
                <Users className="h-7 w-7 text-indigo-600" />
                <span>Applications ({applications.length})</span>
              </h2>
              
              {applications.length === 0 ? (
                <div id="no-applications-view" className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No applications yet.</p>
                </div>
              ) : (
                <div id="applications-list" className="space-y-6">
                  {applications.map(app => (
                    <div id={`app-item-${app.id}`} key={app.id} className="bg-gray-50 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <Link to={`/profile/${app.workerId}`} className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
                        <div id={`app-avatar-${app.id}`} className="bg-white p-3 rounded-2xl shadow-sm">
                          <User className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div>
                          <div id={`app-worker-name-${app.id}`} className="font-bold text-gray-900">{app.workerName || 'Worker'}</div>
                          <div id={`app-applied-time-${app.id}`} className="text-sm text-gray-500">Applied on {app.createdAt?.toDate ? new Date(app.createdAt.toDate()).toLocaleDateString() : 'Just now'}</div>
                        </div>
                      </Link>
                      
                      <div className="flex items-center space-x-4">
                        <div id={`app-status-${app.id}`} className={cn(
                          "px-4 py-2 rounded-full text-xs font-bold uppercase",
                          app.status === 'pending' ? "bg-yellow-100 text-yellow-600" : 
                          app.status === 'accepted' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        )}>
                          {app.status}
                        </div>
                        {app.status === 'pending' && (
                          <div id={`app-actions-${app.id}`} className="flex space-x-2">
                            <button 
                              id={`approve-app-${app.id}`}
                              onClick={() => {
                                setSelectedAppForApproval(app);
                                setScheduledTime('');
                              }}
                              className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-colors shadow-md flex items-center space-x-2"
                            >
                              <CheckCircle className="h-5 w-5" />
                              <span className="font-bold text-sm">Hire Now</span>
                            </button>
                            <button 
                              id={`reject-app-${app.id}`}
                              onClick={() => handleReject(app)}
                              className="bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 transition-colors shadow-md"
                              title="Reject Application"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Hirer Info */}
        <div id="hirer-sidebar" className="space-y-8">
          <div id="hirer-card" className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 text-center">
            <h3 id="hirer-card-title" className="text-lg font-bold text-gray-900 mb-6">About the Hirer</h3>
            <div id="hirer-avatar-container" className="mb-6">
              {hirer?.photoURL ? (
                <img id="hirer-avatar-img" src={hirer.photoURL} className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-indigo-50 shadow-lg" referrerPolicy="no-referrer" alt="Hirer" />
              ) : (
                <div id="hirer-avatar-placeholder" className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mx-auto border-4 border-indigo-50 shadow-lg">
                  <User className="h-12 w-12 text-indigo-600" />
                </div>
              )}
            </div>
            <h4 id="hirer-name" className="text-xl font-bold text-gray-900 mb-2">{hirer?.displayName || 'Anonymous Hirer'}</h4>
            <div id="hirer-rating" className="flex items-center justify-center space-x-1 mb-4">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span id="hirer-rating-value" className="font-bold text-gray-900">{hirer?.rating || '0.0'}</span>
              <span id="hirer-review-count" className="text-gray-500 text-sm">({hirer?.reviewCount || 0} reviews)</span>
            </div>
            <p id="hirer-bio" className="text-gray-600 text-sm leading-relaxed mb-8">{hirer?.bio || 'No bio provided.'}</p>
            <Link 
              id="view-hirer-profile-btn"
              to={`/profile/${job.hirerId}`}
              className="block w-full py-3 bg-gray-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors"
            >
              View Profile
            </Link>
          </div>

          <div id="safety-tips-card" className="bg-indigo-600 rounded-[2.5rem] p-8 shadow-xl text-white">
            <h3 id="safety-tips-title" className="text-xl font-bold mb-6">Safety Tips</h3>
            <ul id="safety-tips-list" className="space-y-4">
              <li className="flex items-start space-x-3 text-sm">
                <CheckCircle className="h-5 w-5 text-yellow-300 flex-shrink-0" />
                <span>Always meet in a public place for the first time.</span>
              </li>
              <li className="flex items-start space-x-3 text-sm">
                <CheckCircle className="h-5 w-5 text-yellow-300 flex-shrink-0" />
                <span>Verify identity documents before starting work.</span>
              </li>
              <li className="flex items-start space-x-3 text-sm">
                <CheckCircle className="h-5 w-5 text-yellow-300 flex-shrink-0" />
                <span>Keep all communications within the platform.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Approval Confirmation Modal */}
      <AnimatePresence>
        {selectedAppForApproval && (
          <div id="approval-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              id="approval-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAppForApproval(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              id="approval-modal-card"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[2.5rem] p-8 md:p-10 w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div id="approval-modal-top-bar" className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600" />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 id="approval-modal-title" className="text-2xl font-extrabold text-gray-900">Confirm Booking</h2>
                  <p id="approval-modal-subtitle" className="text-gray-500 font-medium">Set the schedule for {selectedAppForApproval.workerName}</p>
                </div>
                <button 
                  id="close-approval-modal"
                  onClick={() => setSelectedAppForApproval(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              <div id="approval-modal-form" className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Scheduled Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      id="scheduled-time-input"
                      type="text"
                      placeholder="e.g., Tomorrow at 10:00 AM"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-medium transition-all"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-400 italic">Leave empty for "As soon as possible"</p>
                </div>

                <div id="approval-modal-warning" className="bg-green-50 p-4 rounded-2xl border border-green-100">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-green-800 leading-relaxed">
                      By confirming, you are hiring <strong>{selectedAppForApproval.workerName}</strong> for <strong>{job.title}</strong>. A booking will be created and the worker will be notified.
                    </p>
                  </div>
                </div>

                <div id="approval-modal-footer" className="flex space-x-4 pt-4">
                  <button 
                    id="cancel-approval-btn"
                    onClick={() => setSelectedAppForApproval(null)}
                    className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    id="confirm-hire-btn"
                    onClick={() => handleApprove(selectedAppForApproval, scheduledTime)}
                    className="flex-2 py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Confirm & Hire</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
