import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import MarketingLayout from "@/layouts/MarketingLayout";
import Index from "@/pages/Index";
import HowItWorks from "@/pages/HowItWorks";
import Pricing from "@/pages/Pricing";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import TemplatesHub from "@/pages/templates/TemplatesHub";
import PastDueInvoiceEmail from "@/pages/templates/PastDueInvoiceEmail";
import PolitePaymentReminder from "@/pages/templates/PolitePaymentReminder";
import FinalInvoiceReminder from "@/pages/templates/FinalInvoiceReminder";
import HowToFollowUp from "@/pages/templates/HowToFollowUp";
import LatePaymentPolicy from "@/pages/templates/LatePaymentPolicy";
import ReminderSchedule from "@/pages/templates/ReminderSchedule";
import InvoiceFollowUpTips from "@/pages/templates/InvoiceFollowUpTips";
import SmallBusinessWorkflow from "@/pages/templates/SmallBusinessWorkflow";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Marketing site */}
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/templates" element={<TemplatesHub />} />
            <Route path="/templates/past-due-invoice-email-template" element={<PastDueInvoiceEmail />} />
            <Route path="/templates/polite-payment-reminder-email" element={<PolitePaymentReminder />} />
            <Route path="/templates/final-invoice-reminder-template" element={<FinalInvoiceReminder />} />
            <Route path="/templates/how-to-follow-up-on-unpaid-invoice" element={<HowToFollowUp />} />
            <Route path="/templates/late-payment-policy-template" element={<LatePaymentPolicy />} />
            <Route path="/templates/reminder-schedule-for-overdue-invoices" element={<ReminderSchedule />} />
            <Route path="/templates/invoice-follow-up-tips-for-freelancers" element={<InvoiceFollowUpTips />} />
            <Route path="/templates/small-business-late-payment-workflow" element={<SmallBusinessWorkflow />} />
          </Route>

          {/* Auth (no marketing layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* App routes will be added in Phase 2+ */}

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
