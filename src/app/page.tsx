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
        <iframe
          src="http://localhost:3000/form/form_07323d9653e84bef"
          width="100%"
          height="600"
          frameBorder="0"
        ></iframe>
      </main>
    </SmoothScrollProvider>
  );
}
