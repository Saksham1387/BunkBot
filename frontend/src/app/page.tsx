"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Bot,
  Shield,
  Rocket,
  Users,
  Star,
  ArrowRight,
  Github,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/nav-bar";

export default function BonkBotLanding() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const router = useRouter();
  useEffect(() => {
    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background dots */}
      <div className="fixed inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1) 0%, transparent 50%)`,
            transition: "background-image 0.3s ease",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:50px_50px] animate-pulse" />
      </div>

      {/* Navigation */}
     <NavBar/>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-gray-500/5" />

        {/* Floating elements */}
        <div
          className="absolute top-20 left-10 w-2 h-2 bg-white rounded-full animate-bounce"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        />
        <div
          className="absolute top-40 right-20 w-1 h-1 bg-white rounded-full animate-bounce"
          style={{ animationDelay: "1s", animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-white rounded-full animate-bounce"
          style={{ animationDelay: "2s", animationDuration: "5s" }}
        />

        <div className="container mx-auto px-4 py-24 relative">
          <div
            className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <Badge
              className={`mb-6 bg-white/10 text-white border-white/20 transition-all duration-700 hover:scale-105 ${
                isVisible ? "animate-pulse" : ""
              }`}
            >
              🚀 Now Available on Web
            </Badge>
            <h1
              className={`text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-gray-400 via-white to-gray-400 bg-clip-text text-transparent transition-all duration-1000 ${
                isVisible ? "scale-100" : "scale-95"
              }`}
            >
              <span className="inline-block hover:animate-pulse">B</span>
              <span
                className="inline-block hover:animate-pulse"
                style={{ animationDelay: "0.1s" }}
              >
                o
              </span>
              <span
                className="inline-block hover:animate-pulse"
                style={{ animationDelay: "0.2s" }}
              >
                n
              </span>
              <span
                className="inline-block hover:animate-pulse"
                style={{ animationDelay: "0.3s" }}
              >
                k
              </span>
              <span
                className="inline-block hover:animate-pulse mx-4"
                style={{ animationDelay: "0.4s" }}
              >
                B
              </span>
              <span
                className="inline-block hover:animate-pulse"
                style={{ animationDelay: "0.5s" }}
              >
                o
              </span>
              <span
                className="inline-block hover:animate-pulse"
                style={{ animationDelay: "0.6s" }}
              >
                t
              </span>
            </h1>
            <p
              className={`text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed transition-all duration-1000 delay-300 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
            >
              The most powerful automation bot for your workflow.
              <br />
              <span className="inline-block animate-pulse">
                Now available as a sleek web application.
              </span>
            </p>
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-500 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
            >
              <Button
                size="lg"
                onClick={() => router.push("/auth")}
                className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/20 group"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button
                onClick={() =>
                  router.push(
                    "https://x.com/Saksham37718116/status/1866219626582929812"
                  )
                }
                size="lg"
                variant="outline"
                className="border-gray-600 text-black hover:bg-white hover:text-black text-lg px-8 py-4 transition-all duration-300 hover:scale-105"
              >
                Watch Demo
              </Button>
            </div>
            <div
              className={`mt-12 flex items-center justify-center space-x-8 text-sm text-gray-400 transition-all duration-1000 delay-700 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
            >
              <div className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300">
                <Shield
                  className="h-4 w-4 animate-pulse"
                  style={{ animationDelay: "1s" }}
                />
                <span>Enterprise Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-900/20 relative">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.01)_50%,transparent_75%)] bg-[length:60px_60px] animate-pulse" />

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 hover:scale-105 transition-transform duration-300">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to automate your workflow and boost
              productivity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                title: "Smart Automation",
                desc: "Advanced AI-powered automation that learns from your patterns and optimizes workflows automatically.",
                delay: "0s",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "Execute commands and processes at incredible speeds with our optimized engine.",
                delay: "0.1s",
              },
              {
                icon: Shield,
                title: "Secure & Reliable",
                desc: "Enterprise-grade security with 99.9% uptime guarantee and encrypted data handling.",
                delay: "0.2s",
              },
              {
                icon: Rocket,
                title: "Easy Integration",
                desc: "Seamlessly integrate with your existing tools and platforms with our comprehensive API.",
                delay: "0.3s",
              },
              {
                icon: Users,
                title: "Team Collaboration",
                desc: "Built for teams with advanced sharing, permissions, and collaborative features.",
                delay: "0.4s",
              },
              {
                icon: Star,
                title: "Premium Support",
                desc: "24/7 expert support with dedicated account managers for enterprise customers.",
                delay: "0.5s",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="bg-gray-800/30 border-gray-700 hover:border-white/50 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-white/10 group animate-fade-in-up"
                style={{ animationDelay: feature.delay }}
              >
                <CardContent className="p-8">
                  <feature.icon className="h-12 w-12 text-white mb-4 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
                  <h3 className="text-2xl font-semibold mb-3 text-white group-hover:text-gray-200 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Active Users", delay: "0s" },
              { number: "1M+", label: "Tasks Automated", delay: "0.2s" },
              { number: "99.9%", label: "Uptime", delay: "0.4s" },
              { number: "24/7", label: "Support", delay: "0.6s" },
            ].map((stat, index) => (
              <div
                key={index}
                className="group hover:scale-110 transition-all duration-300"
                style={{ animationDelay: stat.delay }}
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:animate-pulse">
                  {stat.number}
                </div>
                <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-white/5 to-gray-500/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:100px_100px] animate-pulse" />

        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 hover:scale-105 transition-transform duration-300">
            Ready to Bonk Your Workflow?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto animate-pulse">
            Join thousands of users who have already transformed their
            productivity with Bonk Bot.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 bg-gray-900/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="group">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-xl font-bold">Bonk Bot</span>
              </div>
              <p className="text-gray-400 mb-4 group-hover:text-gray-300 transition-colors duration-300">
                The most powerful automation bot for your workflow.
              </p>
              <div className="flex space-x-4">
                <Link
                  href="https://x.com/Saksham37718116"
                  className="text-gray-400 hover:text-white hover:scale-110 transition-all duration-300"
                >
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link
                  href="https://github.com/Saksham1387/BunkBot"
                  className="text-gray-400 hover:text-white hover:scale-110 transition-all duration-300"
                >
                  <Github className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p className="hover:text-gray-300 transition-colors duration-300">
              &copy; {new Date().getFullYear()} Bonk Bot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
