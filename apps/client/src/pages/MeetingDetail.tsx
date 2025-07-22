import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Volume2, } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';

const MeetingDetail = () => {
    const meetingId = window.location.pathname.split('/').pop() || '';
    const [activeTab, setActiveTab] = useState<'video' | 'transcript' | 'downloads'>('video');
    const [transcript, setTrascript] = useState<string>('Not available');
    const [videoURL, setVideoURL] = useState<string>('https://storage.googleapis.com/portfoilio/portfolio/sample.mp4');
    const [AudioURL, setAudioURL] = useState<string>('https://storage.googleapis.com/portfoilio/portfolio/sample.mp3');
    const [duration, setDuration] = useState<string>('45:22');
    const [date, setDate] = useState<string>(new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }));
    const [participants, setParticipants] = useState<number>(0);
    const downloadRef = useRef<HTMLAnchorElement>(null);

    const handleDownload = async (videoUrl: string, fileName = 'video.mp4') => {
        try {
            const response = await fetch(videoUrl);
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
        
            setTimeout(() => {
                if (downloadRef.current) {
                downloadRef.current.href = url;
                downloadRef.current.download = fileName;
                downloadRef.current.click();
                URL.revokeObjectURL(url); // Clean up after click
                }
            }, 100); // Ensure the DOM updates first
        } catch (error) {
        console.error('Error downloading video:', error);
        }
    };

    const downloadFormats = [
        { name: 'High Quality Video' },
        { name: 'MP3 Audio' },
    ];
    const navigate = useNavigate();

    const fetchMeetingDetails = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/meeting/get/${meetingId}`);
            setTrascript(res.data.finalRecording.transcript);
            setVideoURL(res.data.finalRecording.bucketLink);
            setAudioURL(res.data.finalRecording.audioLink);
            setDate(new Date(res.data.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }));
            setDuration((res.data.EndTime - res.data.StartTime).toString());
            setParticipants(res.data.participants.length);

        } catch (error) {
            console.error("Error fetching meeting data:", error);
        }
    }

    useEffect(() => {
        fetchMeetingDetails();
    },[])


    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 mt-14">
            <div className="flex items-center justify-between">
                <motion.button
                    whileHover={{ x: -4 }}
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-primary-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back to Dashboard</span>
                </motion.button>
                
                <h1 className="text-2xl font-light">{date}</h1>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-primary-900/50 rounded-xl overflow-hidden">
                <video
                    src={videoURL}
                    controls
                    className="w-full h-full"
                />
            </div>

            {/* Tabs */}
            <div className="border-b border-primary-800">
                <div className="flex gap-8">
                {(['video', 'transcript', 'downloads'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-sm font-medium transition-colors relative ${
                            activeTab === tab ? 'text-white' : 'text-primary-400 hover:text-white'
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                            />
                        )}
                    </button>
                ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
                {activeTab === 'video' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <h3 className="text-sm text-primary-400">Duration</h3>
                                <p className="text-lg">{duration}</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-sm text-primary-400">Participants</h3>
                                <p className="text-lg">{participants} people</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'transcript' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-primary-900/30 rounded-lg p-6">
                            <pre className="whitespace-pre-wrap font-sans text-primary-200">
                                {transcript}
                            </pre>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'downloads' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {downloadFormats.map((format, index) => (
                            <motion.div
                                key={format.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-4 bg-primary-900/30 rounded-lg"
                            >
                                <div className="flex items-center gap-4">
                                    {format.name.includes('Audio') ? (
                                        <Volume2 className="h-5 w-5 text-primary-400" />
                                    ) : (
                                        <Download className="h-5 w-5 text-primary-400" />
                                    )}
                                    <div>
                                        <p className="font-medium">{format.name}</p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn-primary text-sm"
                                    onClick={() => handleDownload(format.name.includes('Audio') ? AudioURL : videoURL, format.name)}
                                >
                                    Download
                                </motion.button>
                            </motion.div>
                        ))}
                        <a ref={downloadRef} style={{ display: 'none' }} />
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default MeetingDetail;