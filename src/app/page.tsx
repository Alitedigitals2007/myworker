import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LucideArrowRight, LucideUsers, LucideBarChart3, LucideMessageSquare, LucideShield, LucideZap } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();
  
  // Redirect authenticated users to their dashboard
  if (session?.user) {
    if (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") {
      redirect("/admin");
    } else {
      redirect("/worker");
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">MW</span>
            </div>
            <span className="font-bold text-lg">MY WORKER</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin Portal
            </Link>
            <Link
              href="/worker-login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Worker Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-8">
            <LucideZap size={16} />
            <span>Premium Worker Management Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Manage Your Workforce
            <span className="gradient-text block">Like Never Before</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            A comprehensive platform combining worker management, real-time communication, 
            product inventory, sales tracking, and commission automation in one seamless application.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5"
            >
              Admin Portal
              <LucideArrowRight size={20} />
            </Link>
            <Link
              href="/worker-login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-border font-semibold hover:border-primary/50 hover:bg-accent transition-all"
            >
              Worker Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Everything You Need to Run Your Business
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: LucideUsers,
                title: "Worker Management",
                description: "Complete worker profiles, commission tracking, face verification, and performance analytics."
              },
              {
                icon: LucideBarChart3,
                title: "Sales & Analytics",
                description: "Track sales in real-time, manage inventory, calculate commissions automatically."
              },
              {
                icon: LucideMessageSquare,
                title: "Real-time Chat",
                description: "WhatsApp-style messaging with typing indicators, read receipts, and media sharing."
              },
              {
                icon: LucideShield,
                title: "Secure Authentication",
                description: "Face verification for workers, role-based access, and comprehensive audit logs."
              },
              {
                icon: LucideZap,
                title: "Instant Notifications",
                description: "Real-time push notifications for sales, payments, announcements, and more."
              },
              {
                icon: LucideBarChart3,
                title: "Google Sheets Sync",
                description: "Bidirectional sync with Google Sheets for seamless data management."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-background rounded-2xl border border-border hover:border-primary/30 transition-all hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of businesses using MY WORKER to manage their workforce.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
          >
            Get Started Now
            <LucideArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">MW</span>
              </div>
              <span className="font-semibold">MY WORKER</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} MY WORKER. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}