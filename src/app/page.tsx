import { Button, FeatureCard } from '@/components/ui';
import { Header } from '@/components/Header';
import styles from './page.module.css';

/**
 * Home page component - Landing page for Cadence fantasy football platform.
 * Features hero section, CTA buttons, and feature showcase.
 */
export default function HomePage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <HeroSection />
        <FeaturesSection />
        <StatusSection />
      </main>
    </>
  );
}

/**
 * Hero section with title, subtitle, and CTA buttons
 */
function HeroSection() {
  return (
    <section className={styles.hero}>
      <h1 className={styles.title}>
        Cadence
      </h1>
      <p className={styles.subtitle}>
        AI-powered fantasy football. Draft smarter. Manage better. Dominate your league.
      </p>
      <div className={styles.ctaButtons}>
        <Button variant="primary" size="md">
          Create League
        </Button>
        <Button variant="secondary" size="md">
          Join League
        </Button>
      </div>
    </section>
  );
}

/**
 * Features section showcasing key platform features
 */
function FeaturesSection() {
  const features = [
    {
      icon: '📊',
      title: 'Live Scoring',
      description: 'Real-time NFL stats and fantasy points powered by Sleeper API',
    },
    {
      icon: '🏆',
      title: 'League Management',
      description: 'Customizable scoring, drafts, and playoff brackets',
    },
    {
      icon: '📱',
      title: 'Mobile Optimized',
      description: 'Manage your team anywhere, anytime',
    },
    {
      icon: '⚡',
      title: 'Real-Time Updates',
      description: 'Watch your matchups unfold live on game day',
    },
  ];

  return (
    <section className={styles.featuresGrid}>
      {features.map((feature, index) => (
        <FeatureCard
          key={feature.title}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          delay={index * 0.1}
        />
      ))}
    </section>
  );
}

/**
 * Status section showing development progress
 */
function StatusSection() {
  return (
    <section className={styles.status}>
      <p className={styles.statusBadge}>
        🚀 Currently in development - Stay tuned!
      </p>
    </section>
  );
}
