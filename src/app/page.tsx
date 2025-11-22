import Header from "@/components/layout/header";
import HeroSection from "@/components/landing-page/hero-section";
import SmoothScrollProvider from "@/components/smooth-scroll-provider";

export default function Home() {
  return (
    <SmoothScrollProvider
      options={{
        duration: 1.2, // Premium smoothness - higher = smoother
        touchMultiplier: 2,
      }}
    >
      <main>
        <Header />
        <HeroSection />
      </main>
    </SmoothScrollProvider>
  );
}
