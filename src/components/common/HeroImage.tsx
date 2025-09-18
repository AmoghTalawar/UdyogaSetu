import React from 'react';

interface HeroImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  overlay?: boolean;
  overlayContent?: React.ReactNode;
  stats?: Array<{
    label: string;
    value: string;
    color?: string;
  }>;
}

const HeroImage: React.FC<HeroImageProps> = ({
  src,
  alt,
  fallbackSrc,
  className = "w-full h-80 object-cover rounded-2xl shadow-lg",
  overlay = false,
  overlayContent,
  stats = []
}) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (fallbackSrc) {
      target.src = fallbackSrc;
    } else {
      target.style.display = 'none';
    }
  };

  return (
    <div className="relative">
      <img
        src={src}
        alt={alt}
        className={className}
        onError={handleImageError}
      />
      
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl"></div>
      )}
      
      {overlayContent && (
        <div className="absolute inset-0 flex items-center justify-center">
          {overlayContent}
        </div>
      )}
      
      {stats.map((stat, index) => (
        <div 
          key={stat.label}
          className={`absolute bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/50 ${
            index === 0 ? 'top-4 right-4' : 'bottom-4 left-4'
          }`}
        >
          <div className="flex items-center space-x-2">
            <div 
              className={`w-3 h-3 rounded-full animate-pulse ${
                stat.color || 'bg-blue-500'
              }`}
              style={index === 1 ? { animationDelay: '0.5s' } : {}}
            ></div>
            <div>
              <div className="text-lg font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeroImage;