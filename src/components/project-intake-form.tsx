"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { createProjectFromIntake } from "@/lib/actions";
import { BUSINESS_MODELS, PLATFORMS, PRIORITIES } from "@/lib/constants";

const STEPS = [
  {
    title: "Concept",
    description: "Name the idea and capture the one-sentence concept.",
    fields: ["name", "concept", "priority"],
  },
  {
    title: "Audience & problem",
    description: "Who is this for, and what painful problem does it solve?",
    fields: ["targetUser", "problem", "platform", "businessModel"],
  },
  {
    title: "Product shape",
    description: "Must-haves, inspirations, technical preferences, and constraints.",
    fields: [
      "mustHaveFeatures",
      "visualInspirations",
      "technicalPreferences",
      "constraints",
    ],
  },
] as const;

export function ProjectIntakeForm() {
  const [step, setStep] = React.useState(0);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  function validateCurrentStep() {
    const form = formRef.current;
    if (!form) return false;
    const fields = STEPS[step].fields;
    for (const field of fields) {
      const element = form.elements.namedItem(field);
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        if (element.required && !element.value.trim()) {
          element.focus();
          setError(`Please complete “${element.labels?.[0]?.textContent ?? field}”.`);
          return false;
        }
      }
    }
    setError(null);
    return true;
  }

  async function onSubmit(formData: FormData) {
    if (!validateCurrentStep()) return;
    setPending(true);
    setError(null);
    try {
      const result = await createProjectFromIntake(formData);
      if (result && "ok" in result && !result.ok) {
        setError(result.error ?? "Could not create project.");
        setPending(false);
      }
    } catch {
      // redirect() throws; ignore successful navigation.
    }
  }

  return (
    <form ref={formRef} action={onSubmit} className="space-y-7">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span>{Math.round(((step + 1) / STEPS.length) * 100)}% complete</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STEPS.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setStep(index)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                index === step
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : index < step
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {index + 1}. {item.title}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{STEPS[step].title}</h2>
        <p className="text-sm text-muted-foreground">{STEPS[step].description}</p>
      </div>

      <div className={step === 0 ? "grid gap-4" : "hidden"}>
        <div className="space-y-2">
          <Label htmlFor="name">Project name</Label>
          <Input id="name" name="name" placeholder="e.g. Habit Compass" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="concept">One-sentence concept</Label>
          <Textarea
            id="concept"
            name="concept"
            rows={2}
            placeholder="What is this product, in one clear sentence?"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <NativeSelect id="priority" name="priority" defaultValue="Medium">
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className={step === 1 ? "grid gap-4 md:grid-cols-2" : "hidden"}>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="targetUser">Target user</Label>
          <Textarea
            id="targetUser"
            name="targetUser"
            rows={2}
            placeholder="Who feels this pain most acutely?"
            required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="problem">Problem being solved</Label>
          <Textarea
            id="problem"
            name="problem"
            rows={3}
            placeholder="What is broken today, and why does it matter?"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="platform">Desired platform</Label>
          <NativeSelect id="platform" name="platform" defaultValue="Web app">
            {PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessModel">Business model</Label>
          <NativeSelect id="businessModel" name="businessModel" defaultValue="Subscription">
            {BUSINESS_MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className={step === 2 ? "grid gap-4" : "hidden"}>
        <div className="space-y-2">
          <Label htmlFor="mustHaveFeatures">Must-have features</Label>
          <Textarea
            id="mustHaveFeatures"
            name="mustHaveFeatures"
            rows={3}
            placeholder="List the capabilities the MVP cannot ship without."
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="visualInspirations">Visual inspirations</Label>
          <Textarea
            id="visualInspirations"
            name="visualInspirations"
            rows={2}
            placeholder="Sites, products, or moods that feel right."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="technicalPreferences">Technical preferences</Label>
          <Textarea
            id="technicalPreferences"
            name="technicalPreferences"
            rows={2}
            placeholder="Stack preferences, hosting, frameworks..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="constraints">Constraints</Label>
          <Textarea
            id="constraints"
            name="constraints"
            rows={2}
            placeholder="Budget, timeline, compliance, team limits..."
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={step === 0 || pending}
          onClick={() => setStep((value) => Math.max(0, value - 1))}
        >
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={() => {
              if (validateCurrentStep()) setStep((value) => value + 1);
            }}
          >
            Continue
          </Button>
        ) : (
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create project from intake
          </Button>
        )}
      </div>
    </form>
  );
}
