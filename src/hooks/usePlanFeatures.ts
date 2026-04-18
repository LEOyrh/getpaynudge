import { useInvoiceLimits } from "@/hooks/useInvoiceLimits";

export interface PlanFeatures {
  /** Auto-send reminders on a schedule (vs. manual-only) */
  autoReminders: boolean;
  /** Custom cadence editor */
  customCadence: boolean;
  /** Tone selection (friendly / professional / firm) */
  toneSelection: boolean;
  /** Activity timeline on invoice detail */
  activityTimeline: boolean;
  /** Open & click tracking */
  emailTracking: boolean;
  /** Pay link rendered in reminder emails */
  payLinkInReminders: boolean;
  /** AI rewrites reminders in the user's voice */
  aiVoice: boolean;
  /** Number of allowed external integrations (Stripe / QBO / Xero). 0 = none, -1 = unlimited */
  integrations: number;
  /** Predicted pay date + Pay-Behavior Score per client */
  predictedPayDate: boolean;
  /** Weekly Receivables Health email digest */
  weeklyHealthReport: boolean;
}

const featuresByPlan: Record<string, PlanFeatures> = {
  free: {
    autoReminders: false,
    customCadence: false,
    toneSelection: false,
    activityTimeline: true,
    emailTracking: true,
    payLinkInReminders: true,
    aiVoice: false,
    integrations: 0,
    predictedPayDate: false,
    weeklyHealthReport: false,
  },
  solo: {
    autoReminders: true,
    customCadence: true,
    toneSelection: true,
    activityTimeline: true,
    emailTracking: true,
    payLinkInReminders: true,
    aiVoice: true,
    integrations: 1,
    predictedPayDate: false,
    weeklyHealthReport: false,
  },
  studio: {
    autoReminders: true,
    customCadence: true,
    toneSelection: true,
    activityTimeline: true,
    emailTracking: true,
    payLinkInReminders: true,
    aiVoice: true,
    integrations: -1,
    predictedPayDate: true,
    weeklyHealthReport: true,
  },
};

export function usePlanFeatures(): PlanFeatures & { planKey: string } {
  const { planKey } = useInvoiceLimits();
  const features = featuresByPlan[planKey] ?? featuresByPlan.free;
  return { ...features, planKey };
}
