"use client";

import { ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Step {
  number: number;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: 1,
    title: "Configuration",
    description: "Basic form settings",
  },
  {
    number: 2,
    title: "Fields",
    description: "Add and configure fields",
  },
  {
    number: 3,
    title: "Submission",
    description: "Success behavior",
  },
  {
    number: 4,
    title: "Automation",
    description: "Set up automations",
  },
  {
    number: 5,
    title: "Share & Embed",
    description: "Get link or code",
  },
];

interface FormWizardProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  children: ReactNode;
  onFinish?: () => void;
  isLastStep?: boolean;
}

export function FormWizard({
  currentStep,
  onStepChange,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  children,
  onFinish,
  isLastStep = false,
}: FormWizardProps) {
  return (
    <div className="flex flex-1 flex-col">
      {/* Progress Indicator */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-6 py-4w-full">
          <div className="flex items-center justify-center gap-4 py-3">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              const isClickable = isCompleted || currentStep === step.number;

              return (
                <div
                  key={step.number}
                  className="flex items-center"
                  onClick={() => isClickable && onStepChange(step.number)}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                        isActive &&
                          "border-primary bg-primary text-primary-foreground",
                        isCompleted &&
                          "border-primary bg-primary text-primary-foreground",
                        !isActive &&
                          !isCompleted &&
                          "border-muted-foreground/30 bg-background text-muted-foreground",
                        isClickable && "cursor-pointer hover:border-primary/50"
                      )}
                    >
                      {isCompleted ? (
                        <Image
                          src="/icons/check.svg"
                          alt="Check"
                          width={16}
                          height={16}
                        />
                      ) : (
                        <span className="text-xs font-semibold">
                          {step.number}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p
                        className={cn(
                          "text-xs font-medium",
                          isActive && "text-foreground",
                          !isActive && "text-muted-foreground"
                        )}
                      >
                        {step.title}
                      </p>
                      {/* <p className="text-xs text-muted-foreground">
                        {step.description}
                      </p> */}
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "mx-4 h-0.5 flex-1",
                        isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div
          className="flex-1 overflow-y-auto"
          style={{ height: "calc(100vh - 12rem)" }}
        >
          {children}
        </div>

        {/* Navigation */}
        <div className="border-t bg-background">
          <div className="container mx-auto flex items-center justify-center gap-8 px-6 py-4">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={!canGoPrevious}
            >
              <ChevronLeftIcon className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {STEPS.length}
            </div>

            {isLastStep ? (
              <Button onClick={onFinish} disabled={!canGoNext}>
                Finish & Publish
              </Button>
            ) : (
              <Button onClick={onNext} disabled={!canGoNext}>
                Next
                <ChevronRightIcon className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
