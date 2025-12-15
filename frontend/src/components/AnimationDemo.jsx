import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Star } from "lucide-react";
import SmoothScroll from "./animations/SmoothScroll";
import FadeIn, { FadeInStagger, FadeInStaggerItem } from "./animations/FadeIn";
import MagneticButton, {
  MagneticIconButton,
} from "./animations/MagneticButton";

/**
 * AnimationDemo Page
 * Showcases all premium animation components
 *
 * To use this page, add it to your routes:
 * <Route path="/demo" element={<AnimationDemo />} />
 */
export default function AnimationDemo() {
  return (
    <SmoothScroll>
      <div className="min-h-screen bg-richBlack text-white overflow-x-hidden">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 via-transparent to-transparent" />

          <FadeIn delay={0.2} className="text-center z-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 mb-8">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Premium Animations
            </span>
          </FadeIn>

          <FadeIn delay={0.4} y={50} blur={15} className="text-center z-10">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Elevate Your
              <br />
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Experience
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.6} className="text-center z-10 max-w-2xl">
            <p className="text-lg md:text-xl text-gray-400 mb-10">
              Smooth inertia scrolling, staggered animations, and magnetic
              interactions. Built with Framer Motion and Lenis.
            </p>
          </FadeIn>

          <FadeIn delay={0.8} className="flex gap-4 z-10">
            <MagneticButton
              className="px-8 py-4 bg-white text-black rounded-full font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors"
              strength={0.4}
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </MagneticButton>

            <MagneticButton
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-medium hover:bg-white/10 transition-colors"
              strength={0.3}
            >
              Learn More
            </MagneticButton>
          </FadeIn>

          {/* Scroll indicator */}
          <FadeIn delay={1.2} className="absolute bottom-10 z-10">
            <motion.div
              className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            </motion.div>
          </FadeIn>
        </section>

        {/* Features Section with Staggered Animation */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <FadeIn className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Powerful Features
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Everything you need to create stunning, premium experiences
              </p>
            </FadeIn>

            <FadeInStagger
              className="grid md:grid-cols-3 gap-8"
              staggerDelay={0.15}
            >
              {[
                {
                  icon: <Zap className="w-6 h-6" />,
                  title: "Smooth Scrolling",
                  description:
                    "Physics-based inertia scrolling with Lenis for that premium feel.",
                },
                {
                  icon: <Sparkles className="w-6 h-6" />,
                  title: "Fade Animations",
                  description:
                    "Elegant fade-in effects with blur transitions when elements enter view.",
                },
                {
                  icon: <Star className="w-6 h-6" />,
                  title: "Magnetic Buttons",
                  description:
                    "Interactive buttons that follow your cursor with spring physics.",
                },
              ].map((feature, index) => (
                <FadeInStaggerItem key={index}>
                  <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </FadeInStaggerItem>
              ))}
            </FadeInStagger>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section className="py-32 px-6 bg-gradient-to-b from-transparent via-teal-500/5 to-transparent">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Try the Magnetic Effect
              </h2>
              <p className="text-gray-400 text-lg mb-12">
                Hover over these buttons and watch them follow your cursor
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex flex-wrap justify-center gap-6">
                <MagneticButton
                  className="px-10 py-5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl font-semibold text-lg shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-shadow"
                  strength={0.5}
                >
                  Strong Magnet
                </MagneticButton>

                <MagneticButton
                  className="px-10 py-5 bg-white/10 border border-white/20 rounded-2xl font-semibold text-lg backdrop-blur-sm hover:bg-white/15 transition-colors"
                  strength={0.3}
                >
                  Subtle Magnet
                </MagneticButton>

                <MagneticIconButton size="xl" strength={0.6}>
                  <Star className="w-6 h-6 text-yellow-400" />
                </MagneticIconButton>

                <MagneticIconButton size="xl" strength={0.6}>
                  <Zap className="w-6 h-6 text-teal-400" />
                </MagneticIconButton>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Direction Demo Section */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <FadeIn className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Animation Directions</h2>
              <p className="text-gray-400">
                FadeIn supports multiple directions
              </p>
            </FadeIn>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FadeIn direction="up" delay={0}>
                <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-sm text-gray-400 mb-2">direction="up"</p>
                  <p className="font-medium">Fade Up ↑</p>
                </div>
              </FadeIn>

              <FadeIn direction="down" delay={0.1}>
                <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-sm text-gray-400 mb-2">direction="down"</p>
                  <p className="font-medium">Fade Down ↓</p>
                </div>
              </FadeIn>

              <FadeIn direction="left" delay={0.2}>
                <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-sm text-gray-400 mb-2">direction="left"</p>
                  <p className="font-medium">Fade Left ←</p>
                </div>
              </FadeIn>

              <FadeIn direction="right" delay={0.3}>
                <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-sm text-gray-400 mb-2">
                    direction="right"
                  </p>
                  <p className="font-medium">Fade Right →</p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto">
            <FadeIn className="rounded-3xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/20 p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to elevate your site?
              </h2>
              <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                These components are ready to use. Just import and wrap your
                content.
              </p>
              <MagneticButton
                className="px-10 py-5 bg-white text-black rounded-full font-semibold text-lg inline-flex items-center gap-3 hover:bg-gray-100 transition-colors"
                strength={0.4}
              >
                Start Building
                <ArrowRight className="w-5 h-5" />
              </MagneticButton>
            </FadeIn>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/10">
          <FadeIn>
            <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
              Built with Framer Motion + Lenis • Scroll up to feel the smooth
              inertia
            </div>
          </FadeIn>
        </footer>
      </div>
    </SmoothScroll>
  );
}
