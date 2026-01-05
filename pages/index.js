import dynamic from 'next/dynamic';

const ImvoApp = dynamic(() => import('../app/page'), { ssr: false });

export default function Home() {
  return <ImvoApp />;
}
