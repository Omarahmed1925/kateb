'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/firebase/auth-context';
import { ThemeToggle } from '@/components/theme-toggle';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Basic validation
      if (formData.password !== formData.confirmPassword) {
        setErrors({ confirmPassword: 'Passwords do not match' });
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setErrors({ password: 'Password must be at least 6 characters' });
        setLoading(false);
        return;
      }

      await signUp(formData.email, formData.password, formData.name);
      router.push('/dashboard');
    } catch (err: any) {
      setErrors({ form: err.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to sign up with Google' });
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background gradient-mesh px-4">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md p-8 card-modern rounded-3xl shadow-modern-lg animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black gradient-text mb-2">كاتب</h1>
          <p className="text-muted-foreground">Create your account</p>
        </div>

        {errors.form && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
              placeholder="John Doe"
              required
            />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
              placeholder="you@example.com"
              required
            />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
              placeholder="••••••••"
              required
            />
            {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
              placeholder="••••••••"
              required
            />
            {errors.confirmPassword && (
              <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full btn-modern-primary rounded-xl py-3 text-base font-semibold"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-border"></div>
          <span className="px-3 text-muted-foreground text-sm">Or</span>
          <div className="flex-1 border-t border-border"></div>
        </div>

        <Button
          onClick={handleGoogleSignUp}
          disabled={loading}
          variant="outline"
          className="w-full mb-6 rounded-xl py-3 border-border text-foreground hover:bg-muted"
        >
          Sign up with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

