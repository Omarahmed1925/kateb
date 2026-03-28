import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function HomePage() {
  const arabicLetters = ['ك', 'ت', 'ب', 'ع', 'ل', 'غ', 'ف', 'ق', 'ث', 'ذ'];
  const features = [
    {
      icon: '🗣️',
      title: 'Multiple Dialects',
      description: 'Egyptian, Gulf, Levantine, and Modern Standard Arabic',
    },
    {
      icon: '🎯',
      title: 'Various Tones',
      description: 'Professional, Funny, Urgent, and Emotional',
    },
    {
      icon: '📱',
      title: 'Multiple Formats',
      description: 'Captions, Ads, WhatsApp, and Product Descriptions',
    },
    {
      icon: '👥',
      title: 'Team Collaboration',
      description: 'Invite team members and manage permissions',
    },
    {
      icon: '✅',
      title: 'Client Approval',
      description: 'Share for approval and collect feedback',
    },
    {
      icon: '💳',
      title: 'Flexible Billing',
      description: 'Pay-as-you-go or monthly plans',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black gradient-text">كاتب</div>
            <span className="hidden sm:inline text-sm font-semibold text-muted-foreground">
              Kateb
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground font-semibold rounded-xl"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="rounded-xl btn-modern-primary font-semibold px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 hero-gradient overflow-hidden">
        <div className="container-modern section-padding">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  AI-Powered Arabic Content
                </div>
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight">
                  Generate Arabic
                  <br />
                  <span className="gradient-text">Marketing Copy</span>
                  <br />
                  with AI
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                  Create compelling marketing content in Egyptian, Gulf, Levantine,
                  and Modern Standard Arabic. Perfect for social media, ads,
                  WhatsApp, and product descriptions.
                </p>
              </div>

              <div className="flex gap-4 flex-wrap">
                <Link href="/register">
                  <Button className="btn-modern btn-modern-primary text-lg px-8 py-6 rounded-xl">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="#features">
                  <Button className="btn-modern btn-modern-outline text-lg px-8 py-6 rounded-xl">
                    Learn More
                  </Button>
                </Link>
              </div>

              <div className="flex gap-10 pt-2">
                <div>
                  <p className="font-black text-2xl gradient-text">10K+</p>
                  <p className="text-sm text-muted-foreground">Content Generated</p>
                </div>
                <div>
                  <p className="font-black text-2xl gradient-text">500+</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
                <div>
                  <p className="font-black text-2xl gradient-text">99%</p>
                  <p className="text-sm text-muted-foreground">Uptime SLA</p>
                </div>
              </div>
            </div>

            {/* Right: Arabic Letters Grid – static, no hover */}
            <div className="grid grid-cols-2 gap-4 lg:gap-5">
              {arabicLetters.map((letter, i) => (
                <div
                  key={i}
                  className="arabic-letter-card"
                  style={{
                    animationDelay: `${i * 0.08}s`,
                    animation: `fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.08}s both`,
                  }}
                >
                  <p className="text-4xl font-black gradient-text select-none">
                    {letter}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-background section-padding gradient-mesh">
        <div className="container-modern">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary mb-3 tracking-wider uppercase">
              Features
            </p>
            <h2 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create amazing Arabic marketing content
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="card-modern rounded-3xl p-8 group">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm font-semibold text-primary">
                      Explore →
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-muted/30 section-padding">
        <div className="container-modern">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary mb-3 tracking-wider uppercase">
              Pricing
            </p>
            <h2 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight">
              Simple Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that works for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Free', price: '$0', gens: '10', users: '1' },
              {
                name: 'Starter',
                price: '$29',
                gens: '100',
                users: '3',
                popular: true,
              },
              { name: 'Pro', price: '$99', gens: '500', users: '10' },
            ].map((plan, i) => (
              <div
                key={i}
                className={`card-modern rounded-3xl p-8 relative ${
                  plan.popular
                    ? 'ring-2 ring-primary shadow-modern-lg transform lg:scale-105'
                    : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 gradient-primary text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                  </div>
                  <div>
                    <p className="text-5xl font-black tracking-tight">
                      {plan.price}
                      <span className="text-lg font-medium text-muted-foreground">
                        /month
                      </span>
                    </p>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold">
                        ✓
                      </span>
                      {plan.gens} generations/month
                    </li>
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold">
                        ✓
                      </span>
                      Up to {plan.users} team members
                    </li>
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold">
                        ✓
                      </span>
                      All dialects &amp; tones
                    </li>
                  </ul>
                  <Link href="/register" className="block">
                    <Button
                      className={`w-full rounded-xl font-semibold py-3 ${
                        plan.popular
                          ? 'btn-modern-primary'
                          : 'btn-modern-outline'
                      }`}
                    >
                      {plan.popular ? 'Get Started' : 'Choose Plan'}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-primary py-24 relative overflow-hidden noise-overlay">
        <div className="container-modern text-center space-y-6 relative z-10">
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
            Ready to transform your Arabic marketing?
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Start generating compelling Arabic content today. No credit card
            required.
          </p>
          <Link href="/register">
            <Button className="bg-white text-primary hover:bg-white/90 font-bold px-8 py-3 rounded-xl text-lg shadow-lg transition-all mt-4">
              Start for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-16">
        <div className="container-modern">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 pb-8 border-b border-border">
            <div>
              <h4 className="font-bold mb-4">Kateb</h4>
              <p className="text-sm text-muted-foreground">
                AI-powered Arabic content generation for modern marketing teams.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#pricing"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#features"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Features
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground gap-4">
            <p>&copy; 2026 Kateb. All rights reserved.</p>
            <p>Made with ❤️ for Arabic creators</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
