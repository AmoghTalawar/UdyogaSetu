import React from 'react';
import { CheckCircle, X, Phone, Mail, Clock } from 'lucide-react';

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  applicantName: string;
  applicationMethod: string;
  jobTitle: string;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({
  isOpen,
  onClose,
  applicantName,
  applicationMethod,
  jobTitle
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="success-modal" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Success content */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Close button */}
            <div className="absolute top-4 right-4">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success icon and message */}
            <div className="text-center">
              {/* Success animation */}
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
                <CheckCircle className="w-12 h-12 text-green-600 animate-pulse" />
              </div>

              {/* Main message */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                🎉 Application Submitted Successfully!
              </h3>

              <p className="text-lg text-gray-700 mb-4">
                Thank you, <span className="font-semibold text-green-600">{applicantName}</span>!
              </p>

              {/* Application details */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="text-sm text-green-800 space-y-2">
                  <p><strong>Position:</strong> {jobTitle}</p>
                  <p><strong>Application Method:</strong> {applicationMethod === 'voice' ? '🎤 Voice Application' : '📱 QR Upload'}</p>
                  <p><strong>Submitted:</strong> {new Date().toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>

              {/* Next steps */}
              <div className="text-left space-y-4">
                <h4 className="font-semibold text-gray-900 text-center mb-3">
                  📋 What happens next?
                </h4>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Application Review:</strong> Our HR team will review your {applicationMethod === 'voice' ? 'voice application and generated resume' : 'uploaded resume'} within 24-48 hours.
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Initial Contact:</strong> If your profile matches our requirements, we'll contact you within 2-3 business days.
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Interview Process:</strong> Selected candidates will be invited for interviews and further evaluation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact information */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2 flex items-center justify-center">
                  <Phone className="w-4 h-4 mr-2" />
                  We'll contact you via:
                </h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex items-center justify-center">
                    <Phone className="w-3 h-3 mr-2" />
                    Phone/WhatsApp
                  </p>
                  <p className="flex items-center justify-center">
                    <Mail className="w-3 h-3 mr-2" />
                    Email (if provided)
                  </p>
                </div>
              </div>

              {/* Important note */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-800">
                    <strong>Important:</strong> Please keep your phone available and check your messages regularly. We may call from different numbers for scheduling interviews.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-3 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              ✨ Perfect! Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPopup;