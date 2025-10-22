
import { AppLogo } from '@/components/icons';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
       <header className="bg-white border-b">
        <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-6">
            <Link href="/adminaM4pLw5ph1cAxbFScVwtaJNGw" className="flex items-center gap-2 w-40 h-auto">
                <AppLogo />
            </Link>
        </div>
      </header>
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
