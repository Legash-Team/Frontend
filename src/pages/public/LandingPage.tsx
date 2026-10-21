import { Navbar } from '@/components/navigation/Navbar';
import { Hero } from '@/features/landing/components/Hero';
import { HowItWorks } from '@/features/landing/components/HowItWorks';
import { Impact } from '@/features/landing/components/Impact';
import { MobileApp } from '@/features/landing/components/MobileApp';
import { Trust } from '@/features/landing/components/Trust';
import { Footer } from '@/components/navigation/Footer';

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <div className="max-w-7xl mx-auto px-6"><hr className="border-gray-100" /></div>
        <HowItWorks />
        <Impact />
        <MobileApp />
        <div className="max-w-7xl mx-auto px-6"><hr className="border-gray-100" /></div>
        <Trust />
      </main>
      <Footer />
    </div>
  );
}