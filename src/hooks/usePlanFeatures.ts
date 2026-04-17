import { useInvoiceLimits } from "@/hooks/useInvoiceLimits";

export interface PlanFeatures {
  customCadence: boolean;
  toneSelection: boolean;
  activityTimeline: boolean;
  emailTracking: boolean;
  payLinkInReminders: boolean;
}

const featuresByPlan: Record<string, PlanFeatures> = {
  free: {
    customCadence: false,
    toneSelection: false,
    activityTimeline: false,
    emailTracking: true,
    payLinkInReminders: true,
  },
  starter: {
    customCadence: true,
    toneSelection: true,
    activityTimeline: true,
    emailTracking: true,
    payLinkInReminders: true,
  },
  pro: {
    customCadence: true,
    toneSelection: true,
    activityTimeline: true,
    emailTracking: true,
    payLinkInReminders: true,
  },
  business: {
    customCadence: true,
    toneSelection: true,
    activityTimeline: true,
    emailTracking: true,
    payLinkInReminders: true,
  },
};

export function usePlanFeatures(): PlanFeatures & { planKey: string } {
  const { planKey } = useInvoiceLimits();
  const features = featuresByPlan[planKey] ?? featuresByPlan.free;
  return { ...features, planKey };
}
