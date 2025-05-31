// components/icons/SoccerBallIcon.tsx
import { SVGProps } from 'react';

export const SoccerBallIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    {/* Itt helyezd el a kiválasztott SVG path-ját */}
    <path d="../../svg/ball"></path>
  </svg>
);
