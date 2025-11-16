import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Column - Purple Background */}
      <div
        className="hidden lg:flex lg:w-[40%] flex-col justify-between bg-primary p-12 text-white"
        style={{
          background: `url(/auth/auth.png) no-repeat center center`,
          backgroundSize: "cover",
        }}
      >
        {/* Headline */}
        <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight  font-family-brimful tracking-widest">
          Start closing more deals with veer
        </h1>

        {/* Promotional Text */}
        <p className="text-lg text-background/90 font-light">
          Create a free account and get full access to all features for 30-days.
          No credit card needed.
        </p>
      </div>

      {/* Right Column - White Background with Form */}
      <div className="flex-[60%] flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Create your account
          </h2>
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
