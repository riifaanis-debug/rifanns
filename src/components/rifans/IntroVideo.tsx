import React, { useRef, useState } from 'react';

const IntroVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ended, setEnded] = useState(false);

  return (
    <div className={`w-full bg-black ${ended ? 'hidden' : ''}`}>
      <div className="max-w-[520px] mx-auto">
        <video
          ref={videoRef}
          src="/videos/intro.mp4"
          autoPlay
          muted
          playsInline
          className="w-full object-contain"
          onEnded={() => setEnded(true)}
        />
      </div>
    </div>
  );
};

export default IntroVideo;
