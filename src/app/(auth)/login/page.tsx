'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/firebase/auth-context';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background gradient-mesh px-4">
      {/* Floating theme toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md p-8 card-modern rounded-3xl shadow-modern-lg animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black gradient-text mb-2">كاتب</h1>
          <p className="text-muted-foreground">Sign in to Kateb</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
              placeholder="Enter your password"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full btn-modern-primary rounded-xl py-3 text-base font-semibold"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-border"></div>
          <span className="px-3 text-muted-foreground text-sm">Or</span>
          <div className="flex-1 border-t border-border"></div>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          variant="outline"
          className="w-full mb-6 rounded-xl py-3 border-border text-foreground hover:bg-muted"
        >
          Sign in with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-primary hover:underline font-medium"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
