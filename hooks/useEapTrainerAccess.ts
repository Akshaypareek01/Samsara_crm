"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TrainerService, { type Trainer } from "@/services/trainerService";

/**
 * Ensures the current user is an EAP trainer and loads their profile.
 */
export function useEapTrainerAccess() {
  const router = useRouter();
  const [profile, setProfile] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        setLoading(true);
        const me = await TrainerService.getMyProfile();
        if (me.category !== "EAP Trainer") {
          if (!cancelled) {
            setAccessDenied(true);
            router.replace("/trainer/dashboard");
          }
          return;
        }
        if (!cancelled) setProfile(me);
      } catch {
        if (!cancelled) {
          setAccessDenied(true);
          router.replace("/trainer/dashboard");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return { profile, loading, accessDenied };
}
