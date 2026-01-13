import React from 'react';
import { Shield, Users, MapPin, Award } from 'lucide-react';

const TrustSection: React.FC = () => {
  const trustBadges = [
    {
      icon: Shield,
      title: 'Verified Employers',
      description: 'All companies are verified before posting jobs',
      stat: '500+ Verified'
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Local operators help with applications',
      stat: '24/7 Support'
    },
    {
      icon: MapPin,
      title: 'Local Presence',
      description: 'Kiosks in rural areas across Karnataka',
      stat: '150+ Locations'
    },
    {
      icon: Award,
      title: 'Success Stories',
      description: 'Thousands of successful job placements',
      stat: '850+ Hired'
    }
  ];

  const testimonials = [
    {
      name: 'Anita Devi',
      location: 'Dharwad',
      image: 'https://images.pexels.com/photos/3184434/pexels-photo-3184434.jpeg?auto=compress&cs=tinysrgb&w=100&h=100',
      quote: 'मैंने आवाज़ में अप्लाई किया और तुरंत नौकरी मिल गई। बहुत आसान प्रक्रिया है।'
    },
    {
      name: 'Rajesh Kumar',
      location: 'Mysore',
      image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=100&h=100',
      quote: 'ಯಾವುದೇ ರಿಜಿಸ್ಟ್ರೇಶನ್ ಇಲ್ಲದೆ ಜಾಬ್ ಹುಡುಕಬಹುದು. ತುಂಬಾ ಒಳ್ಳೆಯ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್.'
    },
    {
      name: 'Mohammed Ali',
      location: 'Hubli',
      image: 'https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=100&h=100',
      quote: 'The voice application feature helped me apply even though I don\'t have a resume.'
    }
  ];

  return (
    <div className="py-16 bg-[#F7FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why JobConnect is Trusted
          </h2>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto mb-12">
            We're committed to creating a safe, accessible platform for everyone
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {trustBadges.map((badge, index) => (
            <div key={index} className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-[#0B63E5]/10 text-[#0B63E5] rounded-full flex items-center justify-center mx-auto mb-4">
                <badge.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {badge.title}
              </h3>
              <p className="text-sm text-[#6B7280] mb-3">
                {badge.description}
              </p>
              <div className="text-[#0B63E5] font-semibold">
                {badge.stat}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Success Stories from Our Community
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-[#6B7280]">{testimonial.location}</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm italic">
                "{testimonial.quote}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustSection;