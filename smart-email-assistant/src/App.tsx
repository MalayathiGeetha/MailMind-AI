import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Generate from "./pages/Generate";
import Advanced from "./pages/Advanced";
import ThreadReply from "./pages/ThreadReply";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import Safety from "./pages/Safety";
import NotFound from "./pages/NotFound";
import IntentDetector from "./pages/IntentDetector";
import SubjectGenerator from "./pages/SubjectGenerator";
import EmailSummarizer from "./pages/EmailSummarizer";
import FollowUpGenerator from "./pages/FollowUpGenerator";
import SendEmail from "./pages/SendEmail";
import UserDashboard from "./pages/UserDashboard"; 
const queryClient = new QueryClient();


//5. AI Model Switcher (25m) ⭐⭐⭐⭐
//6. Email Scheduling (40m) ⭐⭐⭐⭐

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to="/generate" replace />} />
                <Route path="generate" element={<Generate />} />
                <Route path="advanced" element={<Advanced />} />
                <Route path="thread" element={<ThreadReply />} />
                <Route path="history" element={<History />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="safety" element={<Safety />} />
                <Route path="/intent" element={<IntentDetector />} />
<Route path="/subjects" element={<SubjectGenerator />} />
<Route path="/summarize" element={<EmailSummarizer />} />
<Route path="/followup" element={<FollowUpGenerator />} />
// Already in your App.tsx ✅
<Route path="/send" element={<SendEmail />} />
// Already exists ✅
<Route path="/dashboard" element={<UserDashboard />} />



              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
