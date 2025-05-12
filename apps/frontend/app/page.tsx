"use client";

import dynamic from 'next/dynamic';
const JitsiComponent = dynamic(() => import('../components/test'), {
  ssr: false,
});

export default function Home() {
  return (
    <div>
      <JitsiComponent />
    </div>
  );
}
