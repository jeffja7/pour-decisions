"use client";

import { useEffect, useState } from "react";
import OnboardingFlow from "@/components/OnboardingFlow";
import { getProfile, isOnboarded } from "@/lib/storage";
import { TasteProfile } from "@/lib/types";

export default function OnboardingPage() {
  const [existingProfile, setExistingProfile] = useState<TasteProfile | null>(
    null
  );
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isOnboarded()) {
      setExistingProfile(getProfile());
    }
    setChecked(true);
  }, []);

  if (!checked) return null;

  return (
    <main className="flex-1 flex items-center justify-center min-h-screen">
      <OnboardingFlow existingProfile={existingProfile} />
    </main>
  );
}
