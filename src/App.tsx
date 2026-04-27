import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, getDocFromServer, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { ErrorBoundary } from './components/ErrorBoundary';
import { handleFirestoreError, OperationType } from './lib/firestoreErrorHandler';

// Pages (to be created)
import Home from './pages/Home';
import About from './pages/About';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import JobDetails from './pages/JobDetails';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';

async function testConnection(retries = 3) {
  console.log(`Testing connection to Firestore (Attempt ${4 - retries}/3)...`);
  try {
    // Specifically use getDocFromServer to test real connectivity and bypass cache
    await getDocFromServer(doc(db, 'jobs', 'connection-test'));
    console.log("Firestore connection successful");
  } catch (error) {
    if (error instanceof Error) {
      // Check for 'the client is offline' or 'unavailable' which indicates connection issues
      if (error.message.includes('the client is offline') || error.message.includes('unavailable') || error.message.includes('Failed to get document')) {
        if (retries > 0) {
          console.warn(`Firestore backend unavailable, retrying in 3s... (${retries} retries left)`);
          setTimeout(() => testConnection(retries - 1), 3000);
        } else {
          console.error("Could not reach Cloud Firestore backend. Please check your Firebase configuration and internet connection.");
        }
      } else if (error.message.includes('permission')) {
        // Permission errors are technically successful connections
        console.log("Firestore connection successful (Permission check received)");
      } else {
        console.error("Firestore connection test error:", error.message);
      }
    }
  }
}

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Real-time user data
        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubUser = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Auto-upgrade to admin if email matches owner
            if (currentUser.email === 'jainakrati30@gmail.com' && data.role !== 'admin') {
              await updateDoc(userDocRef, { role: 'admin' });
            }
            setUserData(data);
          } else {
            // Fallback for users without a document
            setUserData({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || 'User',
              role: currentUser.email === 'jainakrati30@gmail.com' ? 'admin' : 'worker',
              createdAt: new Date(),
            });
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
          // Don't block the app on error, just use auth data
          setUserData({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || 'User',
            role: 'worker',
          });
          setLoading(false);
        });
        return () => unsubUser();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div id="loading-screen" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div id="loading-spinner" className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div id="app-root" className="min-h-screen flex flex-col bg-gray-50">
          <Navbar user={user} userData={userData} />
          <main id="main-content" className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/auth" element={<Auth user={user} />} />
              <Route 
                path="/dashboard" 
                element={user ? <Dashboard user={user} userData={userData} /> : <Navigate to="/auth" />} 
              />
              <Route 
                path="/profile/:uid" 
                element={<Profile user={user} userData={userData} />} 
              />
              <Route 
                path="/jobs/:id" 
                element={<JobDetails user={user} userData={userData} />} 
              />
              <Route 
                path="/admin" 
                element={userData?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} 
              />
            </Routes>
          </main>
          <Footer />
          <ChatBot />
        </div>
      </Router>
    </ErrorBoundary>
  );
}
