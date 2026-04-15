import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, Loader2, MessageSquare } from 'lucide-react';
import { addDoc, collection, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';

export default function ReviewModal({ isOpen, onClose, booking, fromId, toId }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;
    setLoading(true);
    try {
      // 1. Add review
      await addDoc(collection(db, 'reviews'), {
        bookingId: booking.id,
        fromId,
        toId,
        rating,
        comment,
        createdAt: serverTimestamp(),
      });

      // 2. Update user rating (simple average logic)
      const userRef = doc(db, 'users', toId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const currentRating = userData.rating || 0;
        const currentCount = userData.reviewCount || 0;
        const newCount = currentCount + 1;
        const newRating = ((currentRating * currentCount) + rating) / newCount;

        await updateDoc(userRef, {
          rating: Number(newRating.toFixed(1)),
          reviewCount: newCount
        });
      }

      // 3. Mark booking as reviewed (optional, could add a field to booking)
      
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 md:p-12 text-center">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">Rate Experience</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X className="h-8 w-8" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex flex-col items-center">
                  <p className="text-gray-500 font-medium mb-4">How was your experience with this {booking.workerId === toId ? 'worker' : 'hirer'}?</p>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star 
                          className={cn(
                            "h-10 w-10",
                            (hover || rating) >= star ? "text-yellow-400 fill-current" : "text-gray-200"
                          )} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-indigo-500" />
                    <span>Your Feedback</span>
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="Share your thoughts about the work..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || rating === 0}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <span>Submit Review</span>}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
