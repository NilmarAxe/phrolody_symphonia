'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Music, Github, Heart, Layers, Zap, Shield, Globe, Radio } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function AboutPage() {
  const technologies = [
    { category: 'Frontend', items: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Zustand', 'React Query'] },
    { category: 'Backend', items: ['NestJS', 'PostgreSQL', 'Prisma ORM', 'Redis', 'JWT Auth', 'WebSocket'] },
    { category: 'Infrastructure', items: ['Docker', 'Supabase Storage', 'Socket.io', 'Swagger API', 'Passport.js'] },
  ];

  const features = [
    { icon: Radio, title: 'Real-time Streaming', description: 'High-quality audio streaming with WebSocket live activity feeds showing what others are listening to.' },
    { icon: Layers, title: 'Smart Collections', description: 'Organize your classical music into playlists, favorites, and personal libraries with ease.' },
    { icon: Zap, title: 'Instant Recommendations', description: 'Personalized track suggestions based on your listening history and preferences.' },
    { icon: Shield, title: 'Secure & Private', description: 'JWT authentication, encrypted tokens, and role-based access control keep your data safe.' },
    { icon: Globe, title: 'Public Domain Music', description: 'All classical masterpieces are sourced from public domain recordings — free to stream forever.' },
    { icon: Heart, title: 'Built with Passion', description: 'Crafted for classical music lovers who deserve a modern, beautiful listening experience.' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 border-b border-neutral-800">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-primary-500 blur-3xl" />
          <div className="absolute bottom-0 right-20 w-64 h-64 rounded-full bg-primary-700 blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 py-24 text-center">
          <motion.div {...fadeUp}>
            <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow-primary">
              <Music className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              <span className="text-primary-500">Phrolody</span>{' '}
              <span className="text-secondary-200">Symphonia</span>
            </h1>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              A modern classical music streaming platform built to bring the world's greatest
              compositions to your ears — beautifully, seamlessly, and freely.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/browse">
                <Button size="lg">
                  <Music className="w-5 h-5 mr-2" />
                  Start Listening
                </Button>
              </Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg">
                  <Github className="w-5 h-5 mr-2" />
                  View on GitHub
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mission */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <h2 className="text-3xl font-display font-bold text-secondary-200 mb-6">Our Mission</h2>
          <p className="text-neutral-400 text-lg leading-relaxed">
            Classical music is humanity's greatest artistic achievement — centuries of genius
            captured in sound. Yet it remains inaccessible to many. Phrolody Symphonia was built
            to change that: a platform that treats classical music with the respect it deserves,
            wrapped in an experience worthy of the 21st century.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
        >
          {features.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-primary-500/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition-colors">
                <Icon className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="text-lg font-display font-semibold text-secondary-200 mb-2">{title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-display font-bold text-secondary-200 text-center mb-12">
            Built With
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {technologies.map(({ category, items }) => (
              <div key={category} className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
                <h3 className="text-lg font-semibold text-primary-500 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  {category}
                </h3>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-neutral-400 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500/60 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center p-12 rounded-3xl bg-gradient-to-br from-primary-500/10 to-neutral-900 border border-primary-500/20"
        >
          <h2 className="text-3xl font-display font-bold text-secondary-200 mb-4">
            Ready to Listen?
          </h2>
          <p className="text-neutral-400 mb-8 max-w-md mx-auto">
            Join and discover centuries of musical masterpieces — completely free.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/register">
              <Button size="lg">Create Account</Button>
            </Link>
            <Link href="/browse">
              <Button variant="outline" size="lg">Browse Music</Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer note */}
      <div className="border-t border-neutral-800 py-8 text-center">
        <p className="text-neutral-600 text-sm flex items-center justify-center gap-1">
          Made with <Heart className="w-4 h-4 text-primary-500 fill-primary-500 mx-1" /> for classical music lovers
        </p>
      </div>
    </div>
  );
}