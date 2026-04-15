import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Users, 
  Briefcase, 
  ShieldAlert, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Search,
  Filter,
  BarChart3
} from 'lucide-react';
import { cn } from '../lib/utils';
import firebaseConfig from '../../firebase-applet-config.json';

export default function AdminDashboard() {
  const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubJobs = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubJobs();
    };
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleSeedData = async () => {
    if (!window.confirm('This will add sample jobs and workers to the database. Continue?')) return;
    setLoading(true);
    try {
      // Add some sample jobs
      const sampleJobs = [
        { title: 'Home Cleaning', description: 'Need help with deep cleaning a 3BHK apartment.', location: 'Delhi', salary: 400, status: 'open', hirerId: 'system', createdAt: serverTimestamp() },
        { title: 'Garden Maintenance', description: 'Looking for someone to trim hedges and mow the lawn.', location: 'Mumbai', salary: 350, status: 'open', hirerId: 'system', createdAt: serverTimestamp() },
        { title: 'Furniture Assembly', description: 'Need help assembling IKEA furniture.', location: 'Bangalore', salary: 500, status: 'open', hirerId: 'system', createdAt: serverTimestamp() }
      ];

      console.log("Starting to seed data to database:", (db as any)._databaseId || '(default)');
      for (const job of sampleJobs) {
        const docRef = await addDoc(collection(db, 'jobs'), job);
        console.log("Added job with ID:", docRef.id);
      }

      alert('Sample data added successfully!');
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('Error seeding data. Check console.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 space-y-6 md:space-y-0">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center space-x-3">
            <ShieldAlert className="h-10 w-10 text-red-600" />
            <span>Admin Control Panel</span>
          </h1>
          <p className="text-gray-500 font-medium">
            Manage users, jobs, and platform statistics. 
            <span className="ml-2 text-indigo-600 font-bold">DB: {dbId}</span>
          </p>
        </div>
        <button 
          onClick={handleSeedData}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg flex items-center space-x-2"
        >
          <BarChart3 className="h-5 w-5" />
          <span>Seed Sample Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-12 bg-white p-2 rounded-2xl shadow-lg border border-gray-100 inline-flex">
        <button
          onClick={() => setActiveTab('users')}
          className={cn(
            "px-8 py-3 rounded-xl font-bold transition-all flex items-center space-x-2",
            activeTab === 'users' ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <Users className="h-5 w-5" />
          <span>Users</span>
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={cn(
            "px-8 py-3 rounded-xl font-bold transition-all flex items-center space-x-2",
            activeTab === 'jobs' ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <Briefcase className="h-5 w-5" />
          <span>Jobs</span>
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={cn(
            "px-8 py-3 rounded-xl font-bold transition-all flex items-center space-x-2",
            activeTab === 'stats' ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <BarChart3 className="h-5 w-5" />
          <span>Stats</span>
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-6 font-bold text-gray-900">User</th>
                  <th className="px-8 py-6 font-bold text-gray-900">Role</th>
                  <th className="px-8 py-6 font-bold text-gray-900">Email</th>
                  <th className="px-8 py-6 font-bold text-gray-900">Joined</th>
                  <th className="px-8 py-6 font-bold text-gray-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="bg-indigo-100 p-2 rounded-full">
                          <Users className="h-5 w-5 text-indigo-600" />
                        </div>
                        <span className="font-bold text-gray-900">{user.displayName || 'Anonymous'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                        user.role === 'hirer' ? "bg-blue-100 text-blue-600" : 
                        user.role === 'worker' ? "bg-purple-100 text-purple-600" : "bg-red-100 text-red-600"
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-gray-600 italic text-sm">Private (Moved to subcollection)</td>
                    <td className="px-8 py-6 text-gray-500 text-sm">
                      {user.createdAt?.toDate ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-6 font-bold text-gray-900">Job Title</th>
                  <th className="px-8 py-6 font-bold text-gray-900">Hirer ID</th>
                  <th className="px-8 py-6 font-bold text-gray-900">Status</th>
                  <th className="px-8 py-6 font-bold text-gray-900">Salary</th>
                  <th className="px-8 py-6 font-bold text-gray-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6 font-bold text-gray-900">{job.title}</td>
                    <td className="px-8 py-6 text-gray-500 text-sm">{job.hirerId.slice(0, 8)}...</td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                        job.status === 'open' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      )}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-bold text-gray-900">₹{job.salary}/hr</td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">User Distribution</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span>Workers</span>
                      <span>{users.filter(u => u.role === 'worker').length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-purple-600 h-3 rounded-full" 
                        style={{ width: `${(users.filter(u => u.role === 'worker').length / users.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span>Hirers</span>
                      <span>{users.filter(u => u.role === 'hirer').length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full" 
                        style={{ width: `${(users.filter(u => u.role === 'hirer').length / users.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Platform Activity</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="text-3xl font-bold text-indigo-600">{jobs.length}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase mt-1">Total Jobs</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="text-3xl font-bold text-green-600">
                      {jobs.filter(j => j.status === 'completed').length}
                    </div>
                    <div className="text-xs text-gray-500 font-bold uppercase mt-1">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
