'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-black gradient-text">
            كاتب
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="rounded-xl px-4"
            >
              Sign Out
            </Button>
            <Link href="/generate">
              <Button className="btn-modern-primary rounded-xl px-6 font-semibold">
                Generate Content
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Welcome back, {user?.displayName || user?.email}!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="card-modern rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
                📊
              </div>
              <h3 className="font-bold text-lg">Quick Stats</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Content generation stats coming soon
            </p>
          </div>

          <div className="card-modern rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
                📝
              </div>
              <h3 className="font-bold text-lg">Recent Generations</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Your recent content will appear here
            </p>
          </div>

          <div className="card-modern rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
                👥
              </div>
              <h3 className="font-bold text-lg">Team</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Manage your team members
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
