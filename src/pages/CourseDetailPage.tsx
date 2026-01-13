import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import VoiceRecorder from '../components/voice/VoiceRecorder';
import AudioTranscription from '../components/voice/AudioTranscription';
import { useLanguage } from '../contexts/LanguageContext';
import {
  BookOpen,
  Users,
  Clock,
  Star,
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
  Mic,
  Send,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

interface CourseDetailPageProps {
  onNavigate: (page: string) => void;
  courseId?: string;
}

const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ onNavigate, courseId }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'apply'>('overview');
  const [applicationData, setApplicationData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    experience: '',
    motivation: '',
    voiceRecording: null as Blob | null,
    voiceDuration: 0
  });
  const [transcribedText, setTranscribedText] = useState('');
  const [showTranscription, setShowTranscription] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Course data - in a real app, this would come from an API
  const courses = {
    electrician: {
      title: 'Electrician',
      titleHi: 'बिजली मिस्त्री',
      titleKn: 'ವಿದ್ಯುತ್ ಕಾರ್ಮಿಕ',
      description: 'Master electrical wiring, safety procedures, and maintenance skills for residential and commercial properties.',
      duration: '3 months',
      students: '2,500+',
      rating: '4.8',
      price: 'FREE',
      instructor: 'Rajesh Kumar',
      location: 'Multiple Centers',
      images: [
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&h=400&fit=crop&auto=format&q=80'
      ],
      curriculum: [
        'Basic Electrical Theory',
        'Wiring and Installation',
        'Safety Procedures',
        'Circuit Troubleshooting',
        'Maintenance and Repair',
        'Certification Preparation'
      ],
      requirements: [
        'Basic literacy',
        'Interest in technical work',
        'Physical fitness',
        'Age 18+'
      ]
    },
    plumber: {
      title: 'Plumber',
      titleHi: 'प्लंबर',
      titleKn: 'ಪ್ಲಂಬರ್',
      description: 'Learn plumbing systems, pipe fitting, water supply, and drainage maintenance for homes and buildings.',
      duration: '3 months',
      students: '1,800+',
      rating: '4.7',
      price: 'FREE',
      instructor: 'Suresh Patel',
      location: 'Multiple Centers',
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop&auto=format&q=80'
      ],
      curriculum: [
        'Plumbing Fundamentals',
        'Pipe Fitting Techniques',
        'Water Supply Systems',
        'Drainage Systems',
        'Leak Detection and Repair',
        'Safety Standards'
      ],
      requirements: [
        'Basic literacy',
        'Interest in technical work',
        'Physical fitness',
        'Age 18+'
      ]
    },
    carpenter: {
      title: 'Carpenter',
      titleHi: 'बढ़ई',
      titleKn: 'ಮರಗಸ',
      description: 'Learn woodworking, furniture making, construction carpentry, and repair techniques for various projects.',
      duration: '4 months',
      students: '2,200+',
      rating: '4.9',
      price: 'FREE',
      instructor: 'Mohan Singh',
      location: 'Multiple Centers',
      images: [
        'https://images.unsplash.com/photo-1503387837-b154d5074bd2?w=600&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=600&h=400&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop&auto=format&q=80'
      ],
      curriculum: [
        'Woodworking Basics',
        'Furniture Design',
        'Construction Carpentry',
        'Finishing Techniques',
        'Repair and Restoration',
        'Tool Maintenance'
      ],
      requirements: [
        'Basic literacy',
        'Interest in technical work',
        'Physical fitness',
        'Age 18+'
      ]
    }
  };

  const course = courseId && courses[courseId as keyof typeof courses] ? courses[courseId as keyof typeof courses] : courses.electrician;

  const handleInputChange = (field: string, value: string) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVoiceRecordingComplete = useCallback((audioBlob: Blob, duration: number, transcript?: string) => {
    setApplicationData(prev => ({
      ...prev,
      voiceRecording: audioBlob,
      voiceDuration: duration
    }));

    // If we have a transcript from speech recognition, use it directly
    if (transcript && transcript.trim()) {
      setTranscribedText(transcript);
      setShowTranscription(true);
      setIsTranscribing(false);
    } else {
      // Fallback to transcription process
      setShowTranscription(true);
      setIsTranscribing(true);
    }
  }, []);

  const handleTranscriptionComplete = useCallback((transcript: string) => {
    setTranscribedText(transcript);
    setIsTranscribing(false);
    // Just store the transcript for display, don't auto-populate form fields
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setApplicationData({
        name: '',
        email: '',
        phone: '',
        location: '',
        experience: '',
        motivation: '',
        voiceRecording: null,
        voiceDuration: 0
      });
      setTranscribedText('');
      setShowTranscription(false);
      setIsTranscribing(false);
      setActiveTab('overview');
    }, 3000);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <button
            onClick={() => onNavigate('skill')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center mb-6">
              <button
                onClick={() => onNavigate('skill')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Courses</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Course Images */}
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={course.images[0]}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {course.images.slice(1).map((image, index) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`${course.title} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">{course.students} students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm text-gray-600">{course.rating} rating</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">{course.location}</span>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{course.price}</div>
                  <div className="text-sm text-green-700">No fees required</div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === 'overview'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('curriculum')}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === 'curriculum'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Curriculum
                  </button>
                  <button
                    onClick={() => setActiveTab('apply')}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === 'apply'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {activeTab === 'overview' && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll Learn</h3>
                  <ul className="space-y-2">
                    {course.curriculum.map((item, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
                  <ul className="space-y-2">
                    {course.requirements.map((item, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Curriculum</h2>
              <div className="space-y-4">
                {course.curriculum.map((module, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{module}</h3>
                      <p className="text-sm text-gray-600">Hands-on training and practical exercises</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'apply' && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Apply for {course.title} Course</h2>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Submitted!</h3>
                  <p className="text-gray-600">We'll contact you within 2-3 business days with next steps.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={applicationData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your full name (optional)"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={applicationData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your email (optional)"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={applicationData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your phone number (optional)"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={applicationData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="City/District (optional)"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Previous Experience (Optional)
                    </label>
                    <textarea
                      value={applicationData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about any relevant work experience or skills you have..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Why do you want to take this course?
                    </label>
                    <textarea
                      value={applicationData.motivation}
                      onChange={(e) => handleInputChange('motivation', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Share your motivation and goals (optional)..."
                    />
                  </div>

                  {/* Voice Recording Section */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Mic className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Voice Application (Optional)</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Instead of typing, you can record your motivation and experience using voice.
                      This is especially helpful if you prefer speaking over writing.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-800">
                        <strong>📋 Instructions:</strong> Complete your voice recording below, then scroll down and click "Submit Application" when you're ready.
                      </p>
                    </div>

                    <VoiceRecorder
                      onRecordingComplete={handleVoiceRecordingComplete}
                      maxDuration={180} // 3 minutes
                      className="mb-4"
                    />

                    {applicationData.voiceRecording && (
                      <div className="mt-4 space-y-4">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2 text-green-700">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">
                              Voice recording saved ({formatDuration(applicationData.voiceDuration)})
                            </span>
                          </div>
                        </div>

                        {showTranscription && applicationData.voiceRecording && (
                          <div className="space-y-4">
                            {isTranscribing && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                <p className="text-sm text-blue-700">Converting your voice to text...</p>
                              </div>
                            )}

                            <AudioTranscription
                              audioBlob={applicationData.voiceRecording}
                              onTranscriptionComplete={handleTranscriptionComplete}
                              initialTranscript={transcribedText}
                            />

                            <div className="flex justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setApplicationData(prev => ({
                                    ...prev,
                                    voiceRecording: null,
                                    voiceDuration: 0
                                  }));
                                  setTranscribedText('');
                                  setShowTranscription(false);
                                  setIsTranscribing(false);
                                }}
                                className="text-blue-600 hover:text-blue-700 text-sm underline"
                              >
                                Record Again
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-6">
                    <div className="text-sm text-gray-600">
                      <p>💡 Voice recording is optional. You can submit your application anytime.</p>
                      <p className="mt-1">Complete your voice recording first, then click "Submit Application" when ready.</p>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Submit Application</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CourseDetailPage;