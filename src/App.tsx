import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";

import MarketingLayout from "@/layouts/MarketingLayout";
import AppLayout from "@/layouts/AppLayout";
import Index from "@/pages/Index";
import HowItWorks from "@/pages/HowItWorks";
import Pricing from "@/pages/Pricing";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import Help from "@/pages/Help";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/app/Dashboard";
import Invoices from "@/pages/app/Invoices";
import NewInvoice from "@/pages/app/NewInvoice";
import InvoiceDetail from "@/pages/app/InvoiceDetail";
import AppSettings from "@/pages/app/AppSettings";
import Billing from "@/pages/app/Billing";
import AdminFinance from "@/pages/app/admin/AdminFinance";
import AdminUsers from "@/pages/app/admin/AdminUsers";
import AdminUserDetail from "@/pages/app/admin/AdminUserDetail";
import AdminInvoices from "@/pages/app/admin/AdminInvoices";
import TemplatesHub from "@/pages/templates/TemplatesHub";
import PastDueInvoiceEmail from "@/pages/templates/PastDueInvoiceEmail";
import PolitePaymentReminder from "@/pages/templates/PolitePaymentReminder";
import FinalInvoiceReminder from "@/pages/templates/FinalInvoiceReminder";
import HowToFollowUp from "@/pages/templates/HowToFollowUp";
import LatePaymentPolicy from "@/pages/templates/LatePaymentPolicy";
import ReminderSchedule from "@/pages/templates/ReminderSchedule";
import InvoiceFollowUpTips from "@/pages/templates/InvoiceFollowUpTips";
import SmallBusinessWorkflow from "@/pages/templates/SmallBusinessWorkflow";
import Unsubscribe from "@/pages/Unsubscribe";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Marketing site */}
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/help" element={<Help />} />
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

            {/* Auth (no layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />

            {/* App (protected) */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/app/dashboard" element={<Dashboard />} />
              <Route path="/app/invoices" element={<Invoices />} />
              <Route path="/app/invoices/new" element={<NewInvoice />} />
              <Route path="/app/invoices/:id" element={<InvoiceDetail />} />
              <Route path="/app/settings" element={<AppSettings />} />
              <Route path="/app/billing" element={<Billing />} />
              <Route path="/app/admin/finance" element={<AdminRoute><AdminFinance /></AdminRoute>} />
              <Route path="/app/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/app/admin/users/:userId" element={<AdminRoute><AdminUserDetail /></AdminRoute>} />
              <Route path="/app/admin/invoices" element={<AdminRoute><AdminInvoices /></AdminRoute>} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
