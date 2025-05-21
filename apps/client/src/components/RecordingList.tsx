import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Users } from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '../config';


interface Recording {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: number;
  thumbnail: string;
}

const RecordingsList = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);

  useEffect(() => {
    const fetchRecordings = async () => {
      const response = await axios.get(`${BACKEND_URL}/meeting/getAll`, {
        headers: {
          "Authorization": `${localStorage.getItem("token")}`,
        }
      })
      setRecordings(response.data);
    };

    fetchRecordings();
  }
  , []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recordings.length === 0 && (
        <div className="col-span-3 text-center h-48 flex items-center justify-center">
          <p className="text-primary-400">No recordings available, Start a meeting to record.</p>
        </div>
      )}
      {recordings.length > 0 && recordings.map((recording, index) => (
        <motion.div
          key={recording.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card group cursor-pointer overflow-hidden"
        >
          <div className="relative h-48">
            <img 
              src={recording.thumbnail} 
              alt={recording.title}
              className="w-full h-full object-cover"
            />
            {/* <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
              transition-opacity flex items-center justify-center gap-4"
            >
              <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm
                transition-colors"
              >
                <Play className="h-5 w-5" />
              </button>
              <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm
                transition-colors"
              >
                <Download className="h-5 w-5" />
              </button>
            </div> */}
          </div>
          
          <div className="p-4">
            <h3 className="text-lg mb-2">{recording.title}</h3>
            <div className="flex items-center gap-4 text-sm text-primary-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(recording.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{new Date(recording.startTime).toLocaleTimeString()} - {new Date(recording.endTime).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{recording.participants}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RecordingsList;