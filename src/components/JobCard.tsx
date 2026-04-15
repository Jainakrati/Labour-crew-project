import { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Star, 
  CheckCircle,
  AlertCircle,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function JobCard({ job, onApply, onDelete, onStatusUpdate, isApplied, isHirer, isAdmin }: any) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const statuses = ['open', 'closed', 'completed'];
  const canDelete = isHirer || isAdmin;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all relative"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="bg-indigo-50 p-3 rounded-2xl">
          <Briefcase className="h-6 w-6 text-indigo-600" />
        </div>
        <div className="flex flex-col items-end space-y-2">
          <div className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
            job.status === 'open' ? "bg-green-100 text-green-600" : 
            job.status === 'completed' ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"
          )}>
            {job.status}
          </div>
          
          {canDelete && onStatusUpdate && (
            <div className="relative">
              <button 
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center space-x-1"
              >
                <span>Change Status</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {showStatusMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1">
                  {statuses.map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        onStatusUpdate(job.id, s);
                        setShowStatusMenu(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-xs font-bold capitalize hover:bg-gray-50 transition-colors",
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

      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{job.title}</h3>
      <p className="text-gray-500 text-sm mb-6 line-clamp-2">{job.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-2 text-gray-600">
          <MapPin className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-medium">{job.location}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <span className="text-green-500 font-bold text-lg">₹</span>
          <span className="text-sm font-bold text-gray-900">{job.salary}/hr</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-500">
            {job.createdAt?.toDate ? new Date(job.createdAt.toDate()).toLocaleDateString() : 'Just now'}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {canDelete && onDelete && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                onDelete(job.id);
              }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="Delete Job"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          
          {isHirer ? (
            <Link 
              to={`/jobs/${job.id}`}
              className="text-indigo-600 font-bold text-sm hover:underline flex items-center space-x-1"
            >
              <span>Manage</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                to={`/jobs/${job.id}`}
                className="text-indigo-600 font-bold text-sm hover:underline"
              >
                Details
              </Link>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  if (!isApplied && onApply) onApply(job.id);
                }}
                className={cn(
                  "px-6 py-2 rounded-xl font-bold text-sm transition-all",
                  isApplied 
                    ? "bg-gray-100 text-gray-500 cursor-default" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transform active:scale-95"
                )}
              >
                {isApplied ? "Accepted" : "Accept Job"}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
