import React from 'react';

const NexusFlowIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="nexusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="50%" stopColor="#059669" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#0891B2" />
      </linearGradient>
    </defs>
    
    {/* Background Circle */}
    <circle
      cx="50"
      cy="50"
      r="45"
      fill="url(#nexusGradient)"
      opacity="0.1"
    />
    
    {/* Main Flow Symbol */}
    <g transform="translate(50, 50)">
      {/* Central Circle */}
      <circle
        cx="0"
        cy="0"
        r="8"
        fill="url(#nexusGradient)"
      >
        <animate
          attributeName="r"
          values="8;12;8"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* Flow Lines */}
      <path
        d="M-25,0 Q0,-15 25,0 Q0,15 -25,0"
        stroke="url(#nexusGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      >
        <animate
          attributeName="stroke-dasharray"
          values="0,100;50,50;100,0"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>
      
      {/* Secondary Flow */}
      <path
        d="M-20,-15 Q0,0 20,-15 Q0,-30 -20,-15"
        stroke="url(#accentGradient)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      >
        <animate
          attributeName="stroke-dasharray"
          values="0,80;40,40;80,0"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </path>
      
      {/* Connection Dots */}
      <circle cx="-25" cy="0" r="3" fill="url(#nexusGradient)" opacity="0.8">
        <animate
          attributeName="opacity"
          values="0.8;1;0.8"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="25" cy="0" r="3" fill="url(#nexusGradient)" opacity="0.8">
        <animate
          attributeName="opacity"
          values="0.8;1;0.8"
          dur="2s"
          repeatCount="indefinite"
          begin="1s"
        />
      </circle>
    </g>
  </svg>
);

export default NexusFlowIcon;
