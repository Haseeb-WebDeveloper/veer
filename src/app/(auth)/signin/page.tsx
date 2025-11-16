import { SigninForm } from "@/components/auth/signin-form";

export default function SigninPage() {
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
        <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight font-family-brimful tracking-widest">
          Welcome back to Veer
        </h1>

        {/* Promotional Text */}
        <p className="text-lg text-background/90 font-light">
          Sign in to continue managing your business and closing more deals.
        </p>
      </div>

      {/* Right Column - White Background with Form */}
      <div className="flex-[60%] flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Sign in to your account
          </h2>
          <SigninForm />
        </div>
      </div>
    </div>
  );
}
