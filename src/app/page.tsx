import Header from "@/components/layout/header";
import HeroSection from "@/components/landing-page/hero-section";

export default function Home() {
  return (
    <main className="flex flex-col gap-10 h-[600vh]"
    >
      <Header />
      <HeroSection />
    </main>
  );
}
