import dynamic from 'next/dynamic';

const ImvoApp = dynamic(() => import('../components/ImvoApp'), { ssr: false });

export default function Home() {
  return <ImvoApp />;
}
