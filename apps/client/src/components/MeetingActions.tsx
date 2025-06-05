import React, { useState } from 'react';
import { Video, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface MeetingActionsProps {
  onClose: () => void;
}

const MeetingActions: React.FC<MeetingActionsProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleStartMeeting = () => {
    navigate("/meeting/create");
    onClose();
  };

  const handleJoinMeeting = () => {
    navigate(`/meeting/join`);
    onClose();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-light mb-4">Start or Join Meeting</h2>
        <p className="text-primary-400 text-sm">
          Create a new meeting or join an existing one with a code
        </p>
      </div>

      <div className="space-y-6">
        <button
          onClick={handleStartMeeting}
          className="w-full p-4 rounded-xl bg-primary-800 hover:bg-primary-700 
            transition-colors flex items-center gap-3"
        >
          <Video className="h-5 w-5" />
          <span>Start New Meeting</span>
        </button>

        <div className="space-y-3">
          <button 
            onClick={handleJoinMeeting}
            className="bg-white text-black w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl"
          >
            <UserPlus className="h-5 w-5" />
            Join Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingActions;