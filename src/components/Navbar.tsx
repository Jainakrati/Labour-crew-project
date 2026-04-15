import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Bell, 
  Hammer, 
  Info, 
  Home as HomeIcon,
  ShieldAlert
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { collection, query, where, onSnapshot, orderBy, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Navbar({ user, userData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        where('read', '==', false),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach(notif => {
        batch.update(doc(db, 'notifications', notif.id), { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  return (
    <nav id="main-navbar" className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div id="navbar-container" className="flex justify-between h-16">
          <div id="navbar-logo-section" className="flex items-center">
            <Link id="navbar-logo-link" to="/" className="flex-shrink-0 flex items-center space-x-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Hammer className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Labour Crew
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div id="desktop-menu" className="hidden md:flex items-center space-x-8">
            <Link id="nav-home" to="/" className="text-gray-700 hover:text-indigo-600 font-medium flex items-center space-x-1">
              <HomeIcon className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link id="nav-about" to="/about" className="text-gray-700 hover:text-indigo-600 font-medium flex items-center space-x-1">
              <Info className="h-4 w-4" />
              <span>About</span>
            </Link>
            
            {user ? (
              <>
                <Link id="nav-dashboard" to="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium flex items-center space-x-1">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                
                {userData?.role === 'admin' && (
                  <Link id="nav-admin" to="/admin" className="text-gray-700 hover:text-red-600 font-medium flex items-center space-x-1">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
                
                <div id="notifications-dropdown-container" className="relative">
                  <button 
                    id="notifications-toggle-btn"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    <Bell className="h-6 w-6" />
                    {notifications.length > 0 && (
                      <span id="notifications-badge" className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div id="notifications-dropdown" className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
                      <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                        <span className="font-bold text-gray-800">Notifications</span>
                        {notifications.length > 0 && (
                          <button 
                            id="mark-all-read-btn"
                            onClick={markAllAsRead}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div id="notifications-list" className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div id="no-notifications-msg" className="px-4 py-6 text-center text-gray-500">
                            No new notifications
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                              <div className="font-semibold text-sm text-gray-800">{notif.title}</div>
                              <div className="text-xs text-gray-600 mt-1">{notif.message}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div id="user-menu" className="flex items-center space-x-4">
                  <Link id="profile-link" to={`/profile/${user.uid}`} className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">
                    {userData?.photoURL ? (
                      <img id="user-avatar" src={userData.photoURL} alt="Profile" className="h-8 w-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="h-5 w-5 text-gray-600" />
                    )}
                    <span id="user-display-name" className="text-sm font-medium text-gray-700">{userData?.displayName || user?.displayName || 'User'}</span>
                  </Link>
                  <button 
                    id="logout-btn"
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-6 w-6" />
                  </button>
                </div>
              </>
            ) : (
              <Link 
                id="get-started-btn"
                to="/auth" 
                className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-md"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn("md:hidden bg-white border-t border-gray-100", isOpen ? "block" : "hidden")}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">Home</Link>
          <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">About</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">Dashboard</Link>
              <Link to={`/profile/${user.uid}`} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">Profile</Link>
              <button 
                onClick={handleLogout}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50">Login / Sign Up</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
