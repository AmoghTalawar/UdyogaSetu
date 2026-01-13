import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { BookOpen, Users, Clock, Star } from 'lucide-react';

interface SkillPageProps {
  onNavigate: (page: string) => void;
}

const SkillPage: React.FC<SkillPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  const courses = [
    {
      id: 'electrician',
      title: 'Electrician',
      titleHi: 'बिजली मिस्त्री',
      titleKn: 'ವಿದ್ಯುತ್ ಕಾರ್ಮಿಕ',
      description: 'Learn electrical wiring, safety procedures, and maintenance skills for residential and commercial properties.',
      descriptionHi: 'आवासीय और व्यावसायिक संपत्तियों के लिए विद्युत वायरिंग, सुरक्षा प्रक्रियाओं और रखरखाव कौशल सीखें।',
      descriptionKn: 'ವಸತಿ ಮತ್ತು ವಾಣಿಜ್ಯಿಕ ಆಸ್ತಿಗಳಿಗೆ ವಿದ್ಯುತ್ ವೈರಿಂಗ್, ಸುರಕ್ಷತಾ ಕಾರ್ಯವಿಧಾನಗಳು ಮತ್ತು ನಿರ್ವಹಣೆ ಕೌಶಲ್ಯಗಳನ್ನು ಕಲಿಯಿರಿ.',
      duration: '3 months',
      students: '2,500+',
      rating: '4.8',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=250&fit=crop&auto=format&q=80',
      icon: '⚡'
    },
    {
      id: 'plumber',
      title: 'Plumber',
      titleHi: 'प्लंबर',
      titleKn: 'ಪ್ಲಂಬರ್',
      description: 'Master plumbing systems, pipe fitting, water supply, and drainage maintenance for homes and buildings.',
      descriptionHi: 'घरों और इमारतों के लिए प्लंबिंग सिस्टम, पाइप फिटिंग, जल आपूर्ति और निकासी रखरखाव में महारत हासिल करें।',
      descriptionKn: 'ಮನೆಗಳು ಮತ್ತು ಕಟ್ಟಡಗಳಿಗೆ ಪ್ಲಂಬಿಂಗ್ ಸಿಸ್ಟಮ್‌ಗಳು, ಪೈಪ್ ಫಿಟಿಂಗ್, ನೀರಿನ ಪೂರೈಕೆ ಮತ್ತು ಡ್ರೇನೇಜ್ ನಿರ್ವಹಣೆಯಲ್ಲಿ ಪ್ರಾವೀಣ್ಯ ಪಡೆಯಿರಿ.',
      duration: '3 months',
      students: '1,800+',
      rating: '4.7',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop&auto=format&q=80',
      icon: '🔧'
    },
    {
      id: 'carpenter',
      title: 'Carpenter',
      titleHi: 'बढ़ई',
      titleKn: 'ಮರಗಸ',
      description: 'Learn woodworking, furniture making, construction carpentry, and repair techniques for various projects.',
      descriptionHi: 'विभिन्न परियोजनाओं के लिए लकड़ी का काम, फर्नीचर निर्माण, निर्माण बढ़ईगीरी और मरम्मत तकनीकों को सीखें।',
      descriptionKn: 'ವಿವಿಧ ಯೋಜನೆಗಳಿಗೆ ಮರದ ಕೆಲಸ, ಫರ್ನಿಚರ್ ತಯಾರಿಕೆ, ನಿರ್ಮಾಣ ಕಾರ್ಪೆಂಟರಿ ಮತ್ತು ದುರಸ್ತಿ ತಂತ್ರಗಳನ್ನು ಕಲಿಯಿರಿ.',
      duration: '4 months',
      students: '2,200+',
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1503387837-b154d5074bd2?w=400&h=250&fit=crop&auto=format&q=80',
      icon: '🔨'
    }
  ];

  const handleCourseClick = (courseId: string) => {
    onNavigate(`course-detail/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
      <Header onNavigate={onNavigate} />

      <main className="relative overflow-hidden pt-20">
        {/* Hero Section */}
        <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Skill Development Courses
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Free vocational training programs to help you build a successful career in skilled trades.
                All courses are completely free and include hands-on training.
              </p>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, index) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-2"
                  onClick={() => handleCourseClick(course.id)}
                >
                  {/* Course Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop&auto=format&q=80';
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                      <span className="text-2xl">{course.icon}</span>
                    </div>
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      FREE
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {course.description}
                    </p>

                    {/* Course Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{course.students}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-semibold text-gray-900">{course.rating}</span>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <button
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseClick(course.id);
                      }}
                    >
                      <BookOpen className="w-5 h-5" />
                      <span>View Course Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Our Courses Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose Our Skill Courses?
              </h2>
              <p className="text-lg text-gray-600">
                Comprehensive training with practical experience and job placement assistance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎓</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Instructors</h3>
                <p className="text-gray-600">Learn from certified professionals with years of industry experience</p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💼</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Placement</h3>
                <p className="text-gray-600">Get assistance finding employment after course completion</p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🛠️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hands-on Training</h3>
                <p className="text-gray-600">Practical workshops and real-world project experience</p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📜</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Certification</h3>
                <p className="text-gray-600">Receive recognized certificates upon successful completion</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SkillPage;