import React, { useRef, useState } from 'react';

const IntroVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="w-full bg-black">
      <div className="max-w-[520px] mx-auto">
        <video
          ref={videoRef}
          src="/videos/intro.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full object-contain"
          onEnded={() => setEnded(true)}
        />
      </div>
    </div>
  );
};

export default IntroVideo;
