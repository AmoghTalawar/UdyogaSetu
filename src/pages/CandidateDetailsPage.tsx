import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { 
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Star,
  Download,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface CandidateDetailsPageProps {
  onNavigate: (page: string) => void;
  candidateId?: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  appliedFor: string;
  appliedDate: string;
  score: number;
  status: 'new' | 'reviewed' | 'interview' | 'hired' | 'rejected';
  avatar: string;
  resumeUrl: string;
  voiceRecordingUrl: string;
  transcript: string;
  tags: string[];
  skills: string[];
  experience: string;
  aiSummary: string[];
}

const CandidateDetailsPage: React.FC<CandidateDetailsPageProps> = ({ 
  onNavigate, 
  candidateId = 'ethan-harper' 
}) => {
  const { user } = useUser();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(163); // 2:43 in seconds
  const [notes, setNotes] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  // Mock candidate data - replace with real data from Supabase
  const candidate: Candidate = {
    id: 'ethan-harper',
    name: 'Ethan Harper',
    email: 'ethan.harper@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    appliedFor: 'Senior Software Engineer',
    appliedDate: '2h ago',
    score: 95,
    status: 'new',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    resumeUrl: '/resume-ethan-harper.pdf',
    voiceRecordingUrl: '/voice-ethan-harper.mp3',
    transcript: `Interviewer: Can you describe your experience with React?
Ethan: I have extensive experience with React, having used it in several projects to build dynamic and responsive user interfaces. I'm proficient in state management, component lifecycle, and integrating with APIs.`,
    tags: ['Frontend', 'Backend', 'Full-Stack'],
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS'],
    experience: '5+ years',
    aiSummary: [
      'Experienced software engineer with a strong background in full-stack development.',
      'Proven ability to lead teams and deliver high-quality software solutions.',
      'Expertise in Java, Python, and React frameworks.'
    ]
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-purple-100 text-purple-800';
      case 'interview': return 'bg-orange-100 text-orange-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleStatusChange = (newStatus: string) => {
    // Here you would update the candidate status in Supabase
    console.log(`Updating candidate ${candidate.id} status to ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('company-dashboard')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Candidates</span>
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">{candidate.name}</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleStatusChange('rejected')}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 flex items-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Schedule Interview</span>
              </button>
              <button
                onClick={() => handleStatusChange('hired')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Accept</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Candidate Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center">
                <img
                  src={candidate.avatar}
                  alt={candidate.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <h2 className="text-xl font-bold text-gray-900">{candidate.name}</h2>
                <p className="text-gray-600 mb-2">Applied for {candidate.appliedFor}</p>
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(candidate.status)}`}>
                  {candidate.status}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{candidate.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{candidate.phone}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{candidate.location}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Applied {candidate.appliedDate}</span>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Summary</h3>
              <div className="space-y-3">
                {candidate.aiSummary.map((point, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Star className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span className="text-sm text-gray-700">{point}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">AI Match Score</span>
                  <span className={`text-2xl font-bold ${getScoreColor(candidate.score)}`}>
                    {candidate.score}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${candidate.score}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
                <button className="px-3 py-1 border border-gray-300 text-gray-600 rounded-full text-sm hover:bg-gray-50">
                  + Add Tag
                </button>
              </div>
            </div>

            {/* Private Notes */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Private Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                Save Notes
              </button>
            </div>
          </div>

          {/* Right Column - Resume & Voice */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resume */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Resume</h3>
                <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
              
              <div className="bg-teal-600 rounded-lg p-8 flex items-center justify-center">
                <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                  <div className="text-center">
                    <h4 className="font-bold text-lg mb-2">ETHAN HARPER</h4>
                    <p className="text-sm text-gray-600 mb-4">Senior Software Engineer</p>
                    
                    <div className="text-left space-y-2 text-sm">
                      <div>
                        <h5 className="font-semibold">EXPERIENCE</h5>
                        <p className="text-gray-600">• Senior Software Engineer at TechCorp (2020-Present)</p>
                        <p className="text-gray-600">• Full Stack Developer at StartupXYZ (2018-2020)</p>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold">EDUCATION</h5>
                        <p className="text-gray-600">• BS Computer Science, Stanford University</p>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold">SKILLS</h5>
                        <p className="text-gray-600">• React, Node.js, TypeScript, Python, AWS</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Voice Answers */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Answers</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={togglePlayback}
                      className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <div>
                      <div className="text-sm text-gray-600">{formatTime(currentTime)}</div>
                      <div className="text-xs text-gray-500">{formatTime(duration)}</div>
                    </div>
                  </div>
                  <Volume2 className="w-5 h-5 text-gray-400" />
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  ></div>
                </div>
                
                <audio
                  ref={audioRef}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                  onEnded={() => setIsPlaying(false)}
                >
                  <source src={candidate.voiceRecordingUrl} type="audio/mpeg" />
                </audio>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Transcript</span>
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-blue-600">Interviewer:</span>
                    <span className="text-gray-700 ml-2">Can you describe your experience with React?</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-600">Ethan:</span>
                    <span className="text-gray-700 ml-2">I have extensive experience with React, having used it in several projects to build dynamic and responsive user interfaces. I'm proficient in state management, component lifecycle, and integrating with APIs.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Experience */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Experience</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Technical Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Experience Level</h4>
                  <p className="text-gray-600">{candidate.experience}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsPage;