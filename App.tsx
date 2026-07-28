import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { HeaderProvider } from "@/components/Header";
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
import Whispers from "./pages/Whispers";
import Search from "./pages/Search";
import Contact from "./pages/Contact";
import AdminUpload from "./pages/AdminUpload";
import MemoryDetail from "./pages/MemoryDetail";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Routes principales */}
            <Route path="/" element={<Index />} />
            <Route path="/questions" element={<Navigate to="/" replace state={{ openSpark: true }} />} />
            <Route path="/treasure" element={<Treasure />} />
            <Route path="/whispers" element={<Whispers />} />

            {/* Redirects pour les routes obsolètes */}
            <Route path="/feed" element={<Navigate to="/" replace />} />
            <Route path="/portrait" element={<Portrait />} />
            <Route path="/login" element={<Navigate to="/welcome" replace />} />
            <Route path="/chats" element={<Navigate to="/whispers" replace />} />
            <Route path="/circles" element={
              <HeaderProvider showBack pageTitle="Ma famille">
                <Circle />
              </HeaderProvider>
            } />

            {/* Routes fonctionnelles */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/identity" element={<FamilyIdentity />} />
            <Route path="/loading" element={<Loading />} />
            <Route path="/record" element={
              <HeaderProvider showBack pageTitle="Enregistrer">
                <Record />
              </HeaderProvider>
            } />
            <Route path="/profile" element={
              <HeaderProvider showBack pageTitle="Mon espace">
                <Profile />
              </HeaderProvider>
            } />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/places" element={
              <HeaderProvider showBack pageTitle="Places">
                <Places />
              </HeaderProvider>
            } />
            <Route path="/create-circle" element={<CreateCircle />} />
            <Route path="/join/:code" element={<JoinCircle />} />
            <Route path="/search" element={<Search />} />
            <Route path="/contact" element={
              <HeaderProvider showBack pageTitle="Contact">
                <Contact />
              </HeaderProvider>
            } />
            <Route path="/admin" element={<AdminUpload />} />
            <Route path="/memory/:id" element={<MemoryDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
