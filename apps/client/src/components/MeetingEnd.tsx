import { CheckCircle, Home, RotateCcw, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from './hooks/use-toast';
import { useState } from 'react';

interface MeetingEndProps {
    Duration: string;
    Participants: number;
    MeetingId: string;
}

export const MeetingEnd = ({ Duration, Participants, MeetingId }: MeetingEndProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [rating, setRating] = useState<number | null>(null);
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);

    const handleRating = (value: number) => {
        setRating(value);
        toast({
          title: "Thank you for your feedback!",
          description: `You rated your meeting experience ${value} out of 5 stars.`,
        });
    }

    return (
        <div className="min-h-screen bg-videochat-bg flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                <CardTitle className="text-2xl font-bold text-white">
                    Meeting Ended
                </CardTitle>
                    <p className="text-videochat-accent mt-2">
                        Thanks for joining! Your meeting has ended successfully.
                    </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h3 className="text-white font-medium mb-2">Meeting Summary</h3>
                        <div className="space-y-1 text-sm text-videochat-accent">
                            <p>Duration: {Duration === null ? "Less than 1 minute" : Duration} minutes</p>
                            <p>Participants: {Participants}</p>
                            <p>Meeting ID: {MeetingId}</p>
                        </div>
                    </div>
                
                    <div className="space-y-3">
                        <Button 
                            onClick={() => {
                                navigate('/meeting/create');
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Join New Meeting
                        </Button>
                        
                        <Button 
                            onClick={() => {
                                navigate('/');
                            }}
                            variant="outline"
                            className="w-full border-white/20 text-white hover:bg-white/10"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Go to Home
                        </Button>
                    </div>
                    
                    <div className="text-center pt-4">
                        <p className="text-xs text-videochat-accent">
                            Rate your meeting experience
                        </p>
                        <div className="flex justify-center mt-2 space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                    onClick={() => handleRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(null)}
                                >
                                    <Star
                                        className={`w-6 h-6 ${
                                        (hoveredRating !== null ? star <= hoveredRating : star <= (rating || 0))
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-gray-400"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating && (
                            <p className="text-xs text-videochat-accent mt-2">
                                You rated this meeting {rating} out of 5 stars
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}