
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Applications from "./pages/dashboard/Applications";
import ApplicationDetails from "./pages/dashboard/ApplicationDetails";
import LoanProcessing from "./pages/dashboard/LoanProcessing";
import LoanProcessingDetails from "./pages/dashboard/LoanProcessingDetails";
import Borrowers from "./pages/dashboard/Borrowers";
import Repayments from "./pages/dashboard/Repayments";
import RepaymentDetails from "@/pages/dashboard/RepaymentDetails.tsx";
import BorrowerDetails from "@/pages/dashboard/BorrowerDetails.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="applications" element={<Applications />} />
            <Route path="applications/:id" element={<ApplicationDetails />} />
            <Route path="loan-processing" element={<LoanProcessing />} />
            <Route path="loan-processing/:id" element={<LoanProcessingDetails />} />
            <Route path="borrowers" element={<Borrowers />} />
            <Route path="/dashboard/borrowers/:id" element={<BorrowerDetails />} />
            <Route path="repayments" element={<Repayments />} />
            <Route path="/dashboard/repayments/:id" element={<RepaymentDetails />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
