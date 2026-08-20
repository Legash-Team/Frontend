import { Navbar } from '@/components/navigation/Navbar';
import { Hero } from '@/features/landing/Hero';
import { HowItWorks } from '@/features/landing/HowItWorks';
import { AboutUs } from '@/features/landing/AboutUs';
import { PrivacySection } from '@/features/landing/PrivacySection';
import { Trust } from '@/features/landing/Trust';
import { Footer } from '@/components/navigation/Footer';

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <div className="max-w-7xl mx-auto px-6"><hr className="border-gray-100" /></div>
        <HowItWorks />
        <AboutUs />
        <PrivacySection />
        <div className="max-w-7xl mx-auto px-6"><hr className="border-gray-100" /></div>
        <Trust />
      </main>
      <Footer />
    </div>
  );
}
