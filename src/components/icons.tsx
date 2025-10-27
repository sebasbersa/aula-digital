
import type { SVGProps } from 'react';
import Image from 'next/image';

export function AppLogo(props: SVGProps<SVGSVGElement> & { priority?: boolean }) {
  return (
    <Image
      src="/logo.png"
      alt="Aula Digital Plus Logo"
      width={500} // Request a high-quality image
      height={125} // Set proportional height
      style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
      className={props.className?.toString()}
      priority={props.priority}
    />
  );
}

export function FaviconIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Image
      src="/favicon.ico"
      alt="Favicon"
      width={30}
      height={30}
      className={props.className?.toString()}
    />
  );
}


export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path fill="currentColor" fillRule="evenodd" d="M10 2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1 5 5 0 0 0 5 5 1 1 0 0 1 1 1v3a1 1 0 0 1-1 1 9.957 9.957 0 0 1-5-1.338V16a7 7 0 1 1-7-7 1 1 0 0 1 1 1v3a1 1 0 0 1-1 1 2 2 0 1 0 2 2V2Zm2 1v13a4 4 0 1 1-5-3.874V11.1A5.002 5.002 0 0 0 8 21a5 5 0 0 0 5-5V8.708a1 1 0 0 1 1.667-.745A7.965 7.965 0 0 0 19 9.938V8.93A7.004 7.004 0 0 1 13.07 3H12Z" clipRule="evenodd"></path>
    </svg>
  );
}

export function TrophyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
