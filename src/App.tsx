```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LangBadge from "./components/LangBadge";

import Welcome from "./pages/Welcome";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Verify from "./pages/Verify";
import FamilyIdentity from "./pages/FamilyIdentity";
import Portrait from "./pages/Portrait";
import Index from "./pages/Index";
import Loading from "./pages/Loading";
import About from "./pages/About";
import Record from "./pages/Record";
import Profile from "./pages/Profile";
import Circle from "./pages/Circle";
import Treasure from "./pages/Treasure";
import Places from "./pages/Places";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import CreateCircle from "./pages/CreateCircle";
import JoinCircle from "./pages/JoinCircle";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LangBadge />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/feed" element={<Index />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/identity" element={<FamilyIdentity />} />
            <Route path="/portrait" element={<Portrait />} />
            <Route path="/loading" element={<Loading />} />
            <Route path="/record" element={<Record />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/circle" element={<Circle />} />
            <Route path="/about" element={<About />} />
            <Route path="/treasure" element={<Treasure />} />
            <Route path="/places" element={<Places />} />
            <Route path="/create-circle" element={<CreateCircle />} />
            <Route path="/join/:code" element={<JoinCircle />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```;
