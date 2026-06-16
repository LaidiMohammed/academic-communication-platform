import { CheckCircle2, BookOpen, Users, Award, Zap, GraduationCap, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-primary">Bendella</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground hover:text-primary transition">Features</a>
            <a href="#process" className="text-foreground hover:text-primary transition">How it Works</a>
            <a href="#testimonials" className="text-foreground hover:text-primary transition">Testimonials</a>
            <a href="#pricing" className="text-foreground hover:text-primary transition">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
            <Link href="/signup" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              The platform for modern education
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Transform your school with our all-in-one collaboration platform. Connect teachers, students, and parents seamlessly.
            </p>
            <div className="flex gap-4">
              <Link href="/signup" className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition flex items-center gap-2">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#" className="border border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary/10 transition">
                Watch Demo
              </Link>
            </div>
          </div>
          <div className="relative h-96 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <BookOpen className="w-24 h-24 text-primary mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Interactive learning platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <p className="text-primary-foreground/80">Schools worldwide</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <p className="text-primary-foreground/80">Active students</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <p className="text-primary-foreground/80">Uptime SLA</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <p className="text-primary-foreground/80">Support team</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Everything you need</h2>
          <p className="text-lg text-muted-foreground">A complete platform designed for modern schools</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: "Seamless Collaboration",
              description: "Connect students, teachers, and parents in one unified platform with real-time communication."
            },
            {
              icon: BookOpen,
              title: "Digital Learning",
              description: "Access course materials, submit assignments, and track progress from anywhere, anytime."
            },
            {
              icon: Award,
              title: "Performance Tracking",
              description: "Monitor student progress with detailed analytics and insights for personalized learning paths."
            },
            {
              icon: Zap,
              title: "Instant Notifications",
              description: "Stay updated with real-time notifications about grades, announcements, and school events."
            },
            {
              icon: CheckCircle2,
              title: "Assignment Management",
              description: "Create, assign, and grade assignments with instant feedback and progress tracking."
            },
            {
              icon: GraduationCap,
              title: "Student Development",
              description: "Track skills development, build portfolios, and prepare students for future success."
            }
          ].map((feature, i) => (
            <div key={i} className="p-8 border border-border rounded-xl hover:border-primary transition">
              <feature.icon className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="bg-card py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Three steps to success</h2>
            <p className="text-lg text-muted-foreground">Get your school set up in minutes</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Sign Up</h3>
              <p className="text-muted-foreground">Create your school account and customize your workspace in seconds.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Invite Users</h3>
              <p className="text-muted-foreground">Invite teachers, students, and parents to join your school's platform.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Start Teaching</h3>
              <p className="text-muted-foreground">Launch your courses and begin collaborating with your school community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Trusted by educators</h2>
          <p className="text-lg text-muted-foreground">See what teachers and administrators say about us</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Mrs. Sarah Johnson",
              role: "High School Principal",
              quote: "Bendella transformed how our school communicates. It's intuitive and has improved student engagement dramatically.",
              stars: 5
            },
            {
              name: "Mr. Ahmed Hassan",
              role: "Mathematics Teacher",
              quote: "The assignment management features save me hours each week. My students love the instant feedback system.",
              stars: 5
            },
            {
              name: "Ms. Emily Chen",
              role: "Parent",
              quote: "Finally, I can easily track my child's progress and communicate with teachers. Highly recommended!",
              stars: 5
            }
          ].map((testimonial, i) => (
            <div key={i} className="bg-card p-8 rounded-xl border border-border">
              <div className="flex gap-1 mb-4">
                {Array(testimonial.stars).fill(0).map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-card py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground">Scale as your school grows</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "$0",
                period: "/month",
                description: "Perfect for small teams",
                features: ["Up to 50 students", "Basic courses", "Email support", "5 GB storage"]
              },
              {
                name: "Professional",
                price: "$99",
                period: "/month",
                description: "For growing schools",
                features: ["Unlimited students", "Advanced courses", "Priority support", "100 GB storage", "Analytics dashboard"],
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                description: "For large institutions",
                features: ["Custom features", "Dedicated support", "Unlimited storage", "API access", "SSO integration"]
              }
            ].map((plan, i) => (
              <div key={i} className={`rounded-xl p-8 border transition ${plan.popular ? 'border-primary bg-primary/5 scale-105' : 'border-border hover:border-primary'}`}>
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
                <button className={`w-full py-3 rounded-lg font-semibold transition mb-8 ${plan.popular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-primary text-primary hover:bg-primary/10'}`}>
                  Get Started
                </button>
                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to transform your school?</h2>
          <p className="text-lg text-primary-foreground/90 mb-8">Join hundreds of schools already using Bendella to revolutionize education.</p>
          <Link href="/signup" className="inline-block bg-primary-foreground text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary-foreground/90 transition">
            Start Your Free Trial Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-primary">Bendella</span>
              </div>
              <p className="text-muted-foreground">Transforming education through technology.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">Features</a></li>
                <li><a href="#" className="hover:text-primary transition">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">About</a></li>
                <li><a href="#" className="hover:text-primary transition">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Bendella School. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
