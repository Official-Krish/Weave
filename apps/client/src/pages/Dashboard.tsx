import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, X } from 'lucide-react';
import MeetingActions from '../components/MeetingActions';
import RecordingsList from '../components/RecordingList';

const Dashboard: React.FC = () => {
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12 mt-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        <h1 className="text-5xl font-light">RiverSide Pro</h1>
        <p className="text-primary-400 max-w-2xl mx-auto">
          Experience crystal-clear video meetings with automatic local recording. 
          No lag, no quality loss, no compromises.
        </p>
        <button 
          onClick={() => setShowMeetingModal(true)}
          className="bg-white text-black inline-flex items-center gap-2 py-3 px-6 rounded-xl"
        >
          <Video className="h-5 w-5" />
          Start or Join Meeting
        </button>
      </motion.div>

      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-light">Recent Recordings</h2>
        </div>
        <RecordingsList />
      </div>

      {/* Meeting Modal */}
      <AnimatePresence>
        {showMeetingModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                  onClick={() => setShowMeetingModal(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative max-w-lg w-full bg-primary-900/80 backdrop-blur-xl p-6 rounded-2xl z-50"
                >
                  <button 
                      onClick={() => setShowMeetingModal(false)}
                      className="absolute top-4 right-4 p-2 hover:bg-primary-800 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <MeetingActions onClose={() => setShowMeetingModal(false)} />
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;