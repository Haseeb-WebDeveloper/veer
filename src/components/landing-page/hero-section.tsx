import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="w-full h-full pt-28 lg:pt-40 pb-32 lg:pb-36 main-section mx-auto z-10">
      <div className="flex flex-col justify-center text-foreground gap-4 font-aileron">
        <h1 className="font-family-brimful tracking-widest text-5xl leading-[110%] md:text-[78px] font-extrabold uppercase text-pretty text-primary relative">
          Automated Success
        </h1>
        <div className="space-y-6 mt-6 z-10  max-w-4xl ">
          <p className=" text-3xl lg:text-[36px] font-bold font-aileron">
            Transform Your Small Business with <br />
            <span
              className="underline"
              style={{
                textDecorationColor: "var(--color-primary)",
                textUnderlineOffset: "4px",
                textDecorationThickness: "4px",
              }}
            >
              AI Automation
            </span>{" "}
            Solutions.
          </p>
          <p className="text-xl lg:text-[29.57px] font-aileron">
            Voice AI agents, email automation, and smart workflows that work
            24/7. So you can focus on <span className="font-family-brimful">growing your business</span>.
          </p>
        </div>
        <Button variant="default" size="lg" className="lg:mt-12 mt-6 w-fit">
          Get Started Today
        </Button>
      </div>
    </section>
  );
}
