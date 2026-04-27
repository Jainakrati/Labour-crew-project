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
      id={`job-card-container-${job.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all relative"
    >
      <div id={`job-card-header-${job.id}`} className="flex justify-between items-start mb-4">
        <div id={`job-card-icon-${job.id}`} className="bg-indigo-50 p-3 rounded-2xl">
          <Briefcase className="h-6 w-6 text-indigo-600" />
        </div>
        <div id={`job-card-meta-${job.id}`} className="flex flex-col items-end space-y-2">
          <div id={`job-card-status-${job.id}`} className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
            job.status === 'open' ? "bg-green-100 text-green-600" : 
            job.status === 'completed' ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"
          )}>
            {job.status}
          </div>
          
          {canDelete && onStatusUpdate && (
            <div id={`job-card-status-dropdown-${job.id}`} className="relative">
              <button 
                id={`job-card-status-btn-${job.id}`}
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center space-x-1"
              >
                <span>Change Status</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {showStatusMenu && (
                <div id={`job-card-status-menu-${job.id}`} className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1">
                  {statuses.map(s => (
                    <button
                      id={`job-card-status-option-${job.id}-${s}`}
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

      <h3 id={`job-card-title-${job.id}`} className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{job.title}</h3>
      <p id={`job-card-desc-${job.id}`} className="text-gray-500 text-sm mb-6 line-clamp-2">{job.description}</p>

      <div id={`job-card-details-${job.id}`} className="grid grid-cols-2 gap-4 mb-6">
        <div id={`job-card-location-container-${job.id}`} className="flex items-center space-x-2 text-gray-600">
          <MapPin className="h-4 w-4 text-indigo-500" />
          <span id={`job-card-location-${job.id}`} className="text-sm font-medium">{job.location}</span>
        </div>
        <div id={`job-card-salary-container-${job.id}`} className="flex items-center space-x-2 text-gray-600">
          <span className="text-green-500 font-bold text-lg">₹</span>
          <span id={`job-card-salary-${job.id}`} className="text-sm font-bold text-gray-900">{job.salary}/hr</span>
        </div>
      </div>

      <div id={`job-card-footer-${job.id}`} className="flex items-center justify-between pt-6 border-t border-gray-50">
        <div id={`job-card-time-container-${job.id}`} className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span id={`job-card-time-${job.id}`} className="text-xs text-gray-500">
            {job.createdAt?.toDate ? new Date(job.createdAt.toDate()).toLocaleDateString() : 'Just now'}
          </span>
        </div>
        
        <div id={`job-card-actions-${job.id}`} className="flex items-center space-x-4">
          {canDelete && onDelete && (
            <button 
              id={`job-card-delete-btn-${job.id}`}
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
              id={`job-card-manage-link-${job.id}`}
              to={`/jobs/${job.id}`}
              className="text-indigo-600 font-bold text-sm hover:underline flex items-center space-x-1"
            >
              <span>Manage</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div id={`job-card-worker-actions-${job.id}`} className="flex items-center space-x-4">
              <Link 
                id={`job-card-details-link-${job.id}`}
                to={`/jobs/${job.id}`}
                className="text-indigo-600 font-bold text-sm hover:underline"
              >
                Details
              </Link>
              <button 
                id={`job-card-apply-btn-${job.id}`}
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
