import React from 'react';
import { Search, Mic, Upload, Bell } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: Search,
      title: 'Browse Jobs',
      description: 'Find opportunities in your preferred language without any registration required.',
      color: 'bg-[#0B63E5]/10 text-[#0B63E5]'
    },
    {
      icon: Mic,
      title: 'Apply with Voice',
      description: 'Record your responses in your local language - we\'ll create a resume for you.',
      color: 'bg-[#FF7A18]/10 text-[#FF7A18]'
    },
    {
      icon: Upload,
      title: 'Upload Resume',
      description: 'Already have a resume? Upload it directly or scan QR code at nearby kiosks.',
      color: 'bg-[#16A34A]/10 text-[#16A34A]'
    },
    {
      icon: Bell,
      title: 'Get Notified',
      description: 'Receive SMS updates on your application status and interview schedules.',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
            Simple, accessible job application process designed for everyone
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Kiosk Info */}
        <div className="mt-16 bg-[#F6EFE6] rounded-2xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Offline Kiosks Available
              </h3>
              <p className="text-[#6B7280] mb-6">
                Can't access online? Visit one of our community kiosks in rural areas. 
                Get help from trained operators and apply for jobs even without a smartphone.
              </p>
              <div className="flex items-center space-x-4">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold text-[#0B63E5]">150+</div>
                  <div className="text-xs text-[#6B7280]">Kiosks Active</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold text-[#16A34A]">98%</div>
                  <div className="text-xs text-[#6B7280]">Uptime</div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=500&h=300"
                alt="Community kiosk"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;