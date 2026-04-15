import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, doc, updateDoc, getDocs, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Filter, Briefcase, Users, Calendar, CheckCircle, Clock, X, Loader2, MapPin, AlertCircle, Star, ArrowRight, ChevronDown, ShieldAlert, Phone, Home } from 'lucide-react';
import JobCard from '../components/JobCard';
import ReviewModal from '../components/ReviewModal';
import { cn } from '../lib/utils';
import { SKILLS_LIST, LOCATIONS_LIST } from '../constants';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import firebaseConfig from '../../firebase-applet-config.json';

export default function Dashboard({ user, userData }) {
  const projectId = firebaseConfig.projectId;
  const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
  
  console.log("Dashboard Render - Role:", userData?.role);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  
  // Job Post Form
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    location: '',
    salary: 0,
  });

  useEffect(() => {
    if (!user) return;
    
    // If userData is still loading, we can still show the basic dashboard
    // but we might need to wait for it for role-specific queries
    if (!userData) {
      setLoading(false);
      return;
    }

    let unsubJobs;
    let unsubApps;
    let unsubBookings;
    let unsubWorkers;

    if (userData.role === 'hirer') {
      // Hirer: View their own jobs
      const qJobs = query(
        collection(db, 'jobs'),
        where('hirerId', '==', user.uid)
      );
      unsubJobs = onSnapshot(qJobs, (snapshot) => {
        const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        console.log("Hirer jobs fetched:", jobsData);
        // Sort in memory
        jobsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setJobs(jobsData);
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'jobs');
        setLoading(false);
      });

      // Hirer: View applications for their jobs
      const qApps = query(
        collection(db, 'applications'),
        where('hirerId', '==', user.uid)
      );
      unsubApps = onSnapshot(qApps, (snapshot) => {
        const appsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        // Sort in memory
        appsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setApplications(appsData);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'applications');
      });

      // Hirer: View their bookings
      const qBookings = query(
        collection(db, 'bookings'),
        where('hirerId', '==', user.uid)
      );
      unsubBookings = onSnapshot(qBookings, (snapshot) => {
        const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        // Sort in memory
        bookingsData.sort((a, b) => (b.scheduledAt?.seconds || 0) - (a.scheduledAt?.seconds || 0));
        setBookings(bookingsData);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'bookings');
      });

      // Hirer: View all workers
      const qWorkers = query(
        collection(db, 'users'),
        where('role', '==', 'worker')
      );
      unsubWorkers = onSnapshot(qWorkers, (snapshot) => {
        setWorkers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
      });

    } else {
      // Worker: View all open jobs
      const qJobs = query(
        collection(db, 'jobs')
      );
      unsubJobs = onSnapshot(qJobs, (snapshot) => {
        console.log("Worker jobs snapshot size:", snapshot.docs.length);
        const jobsData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as any))
          .filter((job) => job.status === 'open'); // Filter in memory to be safe
        
        console.log("Worker jobs fetched (filtered for 'open'):", jobsData);
        // Sort in memory
        jobsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setJobs(jobsData);
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'jobs');
        setLoading(false);
      });

      // Worker: View their applications
      const qApps = query(
        collection(db, 'applications'),
        where('workerId', '==', user.uid)
      );
      unsubApps = onSnapshot(qApps, (snapshot) => {
        const appsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        // Sort in memory
        appsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setApplications(appsData);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'applications');
      });

      // Worker: View their bookings
      const qBookings = query(
        collection(db, 'bookings'),
        where('workerId', '==', user.uid)
      );
      unsubBookings = onSnapshot(qBookings, (snapshot) => {
        const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        // Sort in memory
        bookingsData.sort((a, b) => (b.scheduledAt?.seconds || 0) - (a.scheduledAt?.seconds || 0));
        setBookings(bookingsData);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'bookings');
      });
    }

    return () => {
      unsubJobs?.();
      unsubApps?.();
      unsubBookings?.();
      unsubWorkers?.();
    };
  }, [user, userData]);

  const handleAcceptJob = async (job: any) => {
    if (!user || userData?.role !== 'worker') return;
    try {
      // Check if already applied
      const alreadyApplied = applications.some(app => app.jobId === job.id);
      if (alreadyApplied) return;

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
    } catch (error) {
      console.error('Error accepting job:', error);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Posting job to database:", (db as any)._databaseId || '(default)');
      const docRef = await addDoc(collection(db, 'jobs'), {
        ...newJob,
        hirerId: user.uid,
        status: 'open',
        createdAt: serverTimestamp(),
      });
      console.log("Job posted successfully with ID:", docRef.id);
      setShowPostModal(false);
      setNewJob({ title: '', description: '', location: '', salary: 0 });
    } catch (error) {
      console.error('Error posting job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleUpdateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), { status: newStatus });
      console.log(`Job ${jobId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const handleApproveApplication = async (app: any) => {
    try {
      // Fetch worker details for contact info
      const workerDoc = await getDoc(doc(db, 'users', app.workerId));
      const workerData = workerDoc.exists() ? workerDoc.data() : {};

      await updateDoc(doc(db, 'applications', app.id), { status: 'accepted' });
      await addDoc(collection(db, 'bookings'), {
        jobId: app.jobId,
        jobTitle: app.jobTitle || 'Job',
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
      });
      await updateDoc(doc(db, 'jobs', app.jobId), { status: 'closed' });
      await addDoc(collection(db, 'notifications'), {
        userId: app.workerId,
        title: 'Application Accepted!',
        message: `Your application for "${app.jobTitle || 'a job'}" has been accepted. Check your bookings.`,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  const handleCompleteBooking = async (booking: any) => {
    try {
      await updateDoc(doc(db, 'bookings', booking.id), {
        status: 'completed',
        completedAt: serverTimestamp()
      });
      setSelectedBooking(booking);
      setShowReviewModal(true);
    } catch (error) {
      console.error('Error completing booking:', error);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const title = job.title || '';
    const description = job.description || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !filterLocation || job.location === filterLocation;
    const matchesSkill = !filterSkill || 
                        title.toLowerCase().includes(filterSkill.toLowerCase()) || 
                        description.toLowerCase().includes(filterSkill.toLowerCase());
    return matchesSearch && matchesLocation && matchesSkill;
  });

  console.log("Raw Jobs Count:", jobs.length);
  console.log("Filtered Jobs Count:", filteredJobs.length);

  const filteredWorkers = workers.filter(worker => {
    const name = worker.displayName?.toLowerCase() || '';
    const bio = worker.bio?.toLowerCase() || '';
    const skills = (worker.skills || []).join(' ').toLowerCase();
    const search = searchTerm.toLowerCase();
    
    const matchesSearch = name.includes(search) || bio.includes(search) || skills.includes(search);
    const matchesLocation = !filterLocation || worker.location === filterLocation;
    const matchesSkill = !filterSkill || worker.skills?.some((s: string) => s.toLowerCase().includes(filterSkill.toLowerCase()));
    return matchesSearch && matchesLocation && matchesSkill;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Database Status Banner for Owner */}
      {user?.email === 'jainakrati30@gmail.com' && (
        <div className="mb-8 bg-indigo-900 text-white p-4 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="h-6 w-6 text-yellow-400" />
            <div>
              <div className="font-bold text-sm">Database: <span className="text-indigo-300">{dbId}</span></div>
              <div className="text-[10px] text-indigo-200">Project: {projectId}</div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={async () => {
                const snap = await getDocs(collection(db, 'jobs'));
                alert(`Found ${snap.docs.length} jobs in '${dbId}' database.`);
              }}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              Check DB
            </button>
            <button 
              onClick={async () => {
                if (!window.confirm('Seed sample jobs?')) return;
                const sampleJobs = [
                  { title: 'Home Cleaning', description: 'Need help with deep cleaning a 3BHK apartment.', location: 'Delhi', salary: 400, status: 'open', hirerId: 'system', createdAt: serverTimestamp() },
                  { title: 'Garden Maintenance', description: 'Looking for someone to trim hedges and mow the lawn.', location: 'Mumbai', salary: 350, status: 'open', hirerId: 'system', createdAt: serverTimestamp() }
                ];
                for (const job of sampleJobs) {
                  await addDoc(collection(db, 'jobs'), job);
                }
                alert('Seeded successfully!');
              }}
              className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              Seed Data
            </button>
            <Link 
              to="/admin"
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative rounded-[3rem] p-8 md:p-12 mb-12 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=2000" 
            alt="Dashboard background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-purple-900/90" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2">
              Welcome, <span className="text-indigo-200">{userData?.displayName || 'User'}</span>
            </h1>
            <p className="text-indigo-100 font-medium">
              Manage your {userData?.role === 'hirer' ? 'job postings and hires' : 'work opportunities and applications'}.
            </p>
            <button 
              onClick={async () => {
                const snap = await getDocs(collection(db, 'jobs'));
                console.log("DEBUG: All jobs in DB:", snap.docs.map(d => ({id: d.id, ...d.data()})));
                alert(`Found ${snap.docs.length} jobs in total. Check console for details.`);
              }}
              className="mt-2 text-xs text-white/50 hover:text-white underline"
            >
              Debug: Check Jobs DB
            </button>
          </div>
          
          {userData?.role === 'hirer' && (
            <button 
              onClick={() => setShowPostModal(true)}
              className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold flex items-center space-x-2 hover:bg-indigo-50 transition-all shadow-xl transform active:scale-95"
            >
              <Plus className="h-6 w-6" />
              <span>Post New Job</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text"
            placeholder={userData?.role === 'hirer' ? "Search jobs or workers..." : "Search jobs by title or description..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium shadow-sm transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Skill Filter Dropdown */}
        <div className="relative w-full md:w-64">
          <button 
            onClick={() => setShowSkillDropdown(!showSkillDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium shadow-sm hover:border-indigo-300 transition-colors"
          >
            <span className="truncate">{filterSkill || 'All Skills'}</span>
            <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", showSkillDropdown && "rotate-180")} />
          </button>
          <AnimatePresence>
            {showSkillDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSkillDropdown(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 overflow-hidden max-h-80 overflow-y-auto"
                >
                  <button 
                    onClick={() => { setFilterSkill(''); setShowSkillDropdown(false); }}
                    className={cn(
                      "w-full text-left px-4 py-3 text-sm font-medium hover:bg-indigo-50 transition-colors flex items-center justify-between",
                      !filterSkill && "bg-emerald-600 text-white hover:bg-emerald-700"
                    )}
                  >
                    <span>All Skills</span>
                    {!filterSkill && <CheckCircle className="h-4 w-4" />}
                  </button>
                  {SKILLS_LIST.map(skill => (
                    <button 
                      key={skill}
                      onClick={() => { setFilterSkill(skill); setShowSkillDropdown(false); }}
                      className={cn(
                        "w-full text-left px-8 py-3 text-sm font-medium hover:bg-indigo-50 transition-colors flex items-center justify-between",
                        filterSkill === skill && "bg-indigo-50 text-indigo-600"
                      )}
                    >
                      <span>{skill}</span>
                      {filterSkill === skill && <CheckCircle className="h-4 w-4" />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Location Filter Dropdown */}
        <div className="relative w-full md:w-64">
          <button 
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium shadow-sm hover:border-indigo-300 transition-colors"
          >
            <span className="truncate">{filterLocation || 'All Locations'}</span>
            <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", showLocationDropdown && "rotate-180")} />
          </button>
          <AnimatePresence>
            {showLocationDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowLocationDropdown(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 overflow-hidden max-h-80 overflow-y-auto"
                >
                  <button 
                    onClick={() => { setFilterLocation(''); setShowLocationDropdown(false); }}
                    className={cn(
                      "w-full text-left px-4 py-3 text-sm font-medium hover:bg-indigo-50 transition-colors flex items-center justify-between",
                      !filterLocation && "bg-emerald-600 text-white hover:bg-emerald-700"
                    )}
                  >
                    <span>All Locations</span>
                    {!filterLocation && <CheckCircle className="h-4 w-4" />}
                  </button>
                  {LOCATIONS_LIST.map(loc => (
                    <button 
                      key={loc}
                      onClick={() => { setFilterLocation(loc); setShowLocationDropdown(false); }}
                      className={cn(
                        "w-full text-left px-8 py-3 text-sm font-medium hover:bg-indigo-50 transition-colors flex items-center justify-between",
                        filterLocation === loc && "bg-indigo-50 text-indigo-600"
                      )}
                    >
                      <span>{loc}</span>
                      {filterLocation === loc && <CheckCircle className="h-4 w-4" />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex items-center space-x-6">
          <div className="bg-blue-100 p-4 rounded-2xl">
            <Briefcase className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{jobs.length}</div>
            <div className="text-sm text-gray-500 font-medium">{userData?.role === 'hirer' ? 'Active Jobs' : 'Open Jobs'}</div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex items-center space-x-6">
          <div className="bg-purple-100 p-4 rounded-2xl">
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{applications.length}</div>
            <div className="text-sm text-gray-500 font-medium">Applications</div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex items-center space-x-6">
          <div className="bg-green-100 p-4 rounded-2xl">
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{bookings.length}</div>
            <div className="text-sm text-gray-500 font-medium">Bookings</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Jobs or Workers */}
        <div className="lg:col-span-2 space-y-8">
          {userData?.role === 'hirer' ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Find Workers</h2>
                <div className="flex items-center space-x-2 text-indigo-600 font-bold cursor-pointer hover:underline">
                  <span>View All Workers</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredWorkers.map((worker: any) => (
                  <div key={worker.id} className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
                    <div className="flex items-center space-x-4 mb-4">
                      <img 
                        src={worker.photoURL || `https://picsum.photos/seed/${worker.uid}/100/100`} 
                        alt={worker.displayName} 
                        className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{worker.displayName}</h3>
                        <div className="flex items-center text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="ml-1 text-sm font-bold">{worker.rating || '0.0'}</span>
                          <span className="ml-1 text-gray-400 text-xs">({worker.reviewCount || 0} reviews)</span>
                        </div>
                        {worker.location && (
                          <div className="flex items-center text-gray-500 text-xs mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {worker.location}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {worker.skills?.map((skill: string, idx: number) => (
                          <span key={idx} className="bg-indigo-50 text-indigo-600 text-[10px] px-2 py-1 rounded-full font-bold uppercase">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center text-gray-900 font-bold">
                          <span className="text-green-600 font-bold text-lg mr-1">₹</span>
                          <span>{worker.hourlyRate || 0}/hr</span>
                        </div>
                        <Link to={`/profile/${worker.uid}`} className="text-indigo-600 font-bold text-sm hover:underline">View Profile</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Your Job Postings</h2>
                </div>
                {filteredJobs.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                    <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                    <p className="text-gray-500">You haven't posted any jobs yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredJobs.map((job: any) => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        isHirer={true}
                        isAdmin={userData?.role === 'admin'}
                        isApplied={false}
                        onDelete={handleDeleteJob}
                        onStatusUpdate={handleUpdateJobStatus}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Available Jobs</h2>
                <button 
                  onClick={() => window.location.reload()}
                  className="flex items-center space-x-2 text-indigo-600 font-bold hover:underline"
                >
                  <Loader2 className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                  <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-500 mb-6">There are no open jobs at the moment.</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md"
                  >
                    Check Again
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredJobs.map((job: any) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      isHirer={false}
                      isAdmin={userData?.role === 'admin'}
                      isApplied={applications.some((app: any) => app.jobId === job.id)}
                      onApply={() => handleAcceptJob(job)}
                      onDelete={handleDeleteJob}
                      onStatusUpdate={handleUpdateJobStatus}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column: Activity/Applications */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {userData?.role === 'hirer' ? 'Recent Applications' : 'Your Applications'}
          </h2>
          
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-lg">
                <p className="text-gray-500 italic">No recent activity</p>
              </div>
            ) : (
              applications.slice(0, 5).map(app => (
                <div key={app.id} className="bg-white p-5 rounded-2xl shadow-md border border-gray-50 flex items-center justify-between hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      app.status === 'pending' ? "bg-yellow-50 text-yellow-600" : 
                      app.status === 'accepted' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    )}>
                      {app.status === 'pending' ? <Clock className="h-5 w-5" /> : 
                       app.status === 'accepted' ? <CheckCircle className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">
                        {userData?.role === 'hirer' ? `From: ${app.workerName || 'Worker'}` : `Job: ${app.jobTitle || app.jobId.slice(0, 8)}`}
                      </div>
                      <div className={cn(
                        "text-[10px] font-bold uppercase tracking-wider mt-0.5",
                        app.status === 'pending' ? "text-yellow-600" : 
                        app.status === 'accepted' ? "text-green-600" : "text-red-600"
                      )}>
                        {app.status}
                      </div>
                    </div>
                  </div>
                  {userData?.role === 'hirer' && app.status === 'pending' && (
                    <button 
                      onClick={() => handleApproveApplication(app)}
                      className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md font-bold text-xs flex items-center space-x-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Hire Now</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Recent Bookings</h2>
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-lg">
                <p className="text-gray-500 italic">No bookings yet</p>
              </div>
            ) : (
              bookings.slice(0, 5).map(booking => (
                <div key={booking.id} className="bg-white p-4 rounded-2xl shadow-md border border-gray-50 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-50 p-2 rounded-xl">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div 
                      className="cursor-pointer hover:opacity-70 transition-opacity"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowBookingDetailsModal(true);
                      }}
                    >
                      <div className="font-bold text-gray-900">
                        {userData?.role === 'hirer' ? `Worker: ${booking.workerName || 'Worker'}` : `Job: ${booking.jobTitle || 'Job'}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.scheduledAt?.toDate ? new Date(booking.scheduledAt.toDate()).toLocaleDateString() : 'Scheduled'}
                      </div>
                    </div>
                  </div>
                  {userData?.role === 'hirer' && booking.status === 'scheduled' && (
                    <button 
                      onClick={() => handleCompleteBooking(booking)}
                      className="text-indigo-600 hover:text-indigo-700 font-bold text-xs"
                    >
                      Complete
                    </button>
                  )}
                  {booking.status === 'completed' && (
                    <div className="flex items-center text-green-600 text-xs font-bold">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Done
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {showBookingDetailsModal && selectedBooking && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingDetailsModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-extrabold text-gray-900">Booking Details</h2>
                  <button onClick={() => setShowBookingDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-8 w-8" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                    <h3 className="text-indigo-600 font-bold uppercase tracking-wider text-xs mb-4">Job Information</h3>
                    <div className="text-xl font-bold text-gray-900 mb-1">{selectedBooking.jobTitle}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Scheduled for: {selectedBooking.scheduledTime || 'As soon as possible'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs">Contact Details</h3>
                    
                    {userData?.role === 'hirer' ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-100 p-3 rounded-2xl">
                            <Users className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Worker Name</div>
                            <div className="font-bold text-gray-900">{selectedBooking.workerName}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="bg-green-100 p-3 rounded-2xl">
                            <Phone className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Phone Number</div>
                            <div className="font-bold text-gray-900">{selectedBooking.workerPhone || 'Not provided'}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-3 rounded-2xl">
                            <Home className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Address</div>
                            <div className="font-bold text-gray-900">{selectedBooking.workerAddress || 'Not provided'}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-100 p-3 rounded-2xl">
                            <Briefcase className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Hirer Name</div>
                            <div className="font-bold text-gray-900">{selectedBooking.hirerName || 'Hirer'}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="bg-green-100 p-3 rounded-2xl">
                            <Phone className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Phone Number</div>
                            <div className="font-bold text-gray-900">{selectedBooking.hirerPhone || 'Not provided'}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-3 rounded-2xl">
                            <Home className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Address</div>
                            <div className="font-bold text-gray-900">{selectedBooking.hirerAddress || 'Not provided'}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-6">
                    <button 
                      onClick={() => setShowBookingDetailsModal(false)}
                      className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post Job Modal */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPostModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-extrabold text-gray-900">Post a Job</h2>
                  <button onClick={() => setShowPostModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-8 w-8" />
                  </button>
                </div>

                <form onSubmit={handlePostJob} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Job Title</label>
                    <input
                      type="text"
                      required
                      value={newJob.title}
                      onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. Skilled Carpenter for Furniture"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea
                      required
                      rows={4}
                      value={newJob.description}
                      onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      placeholder="Describe the job requirements, tools needed, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={newJob.location}
                          onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="e.g. Downtown, NY"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Salary (₹/hr)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                        <input
                          type="number"
                          required
                          min="0"
                          value={newJob.salary}
                          onChange={(e) => setNewJob({...newJob, salary: Number(e.target.value)})}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center space-x-2"
                  >
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <span>Post Job Now</span>}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedBooking && (
        <ReviewModal 
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          fromId={user.uid}
          toId={userData.role === 'hirer' ? selectedBooking.workerId : selectedBooking.hirerId}
        />
      )}
    </div>
  );
}
