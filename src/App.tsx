import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";
import { wagmiConfig } from "@/config/wagmi";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { VaultPage } from "./pages/VaultPage";
import { StrategiesPage } from "./pages/StrategiesPage";
import { StrategyDetailPage } from "./pages/StrategyDetailPage";
import { ReservesPage } from "./pages/ReservesPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import { AcademyPage } from "./pages/AcademyPage";
import { DAOPage } from "./pages/DAOPage";
import { CommunityPage } from "./pages/CommunityPage";
import { MembershipPage } from "./pages/MembershipPage";
import { LearningRoutePage } from "./pages/LearningRoutePage";
import { TransparencyPage } from "./pages/TransparencyPage";
import { ProfilePage } from "./pages/ProfilePage";
import { InvestorPage } from "./pages/InvestorPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { InvitesPage } from "./pages/InvitesPage";
import { InvitePage } from "./pages/InvitePage";
import { TeamPage } from "./pages/TeamPage";
import { StrategyBacktestRoadmapPage } from "./pages/StrategyBacktestRoadmapPage";
import { AgentsPage } from "./pages/AgentsPage";

const queryClient = new QueryClient();

const wrap = (node: React.ReactNode) => <AppShell>{node}</AppShell>;

const App = () => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/vault" element={wrap(<VaultPage />)} />
            <Route path="/strategies" element={wrap(<StrategiesPage />)} />
            <Route path="/strategies/backtest-roadmap" element={wrap(<StrategyBacktestRoadmapPage />)} />
            <Route path="/strategies/:strategyId" element={wrap(<StrategyDetailPage />)} />
            <Route path="/reserves" element={wrap(<ReservesPage />)} />
            <Route path="/portfolio" element={wrap(<PortfolioPage />)} />
            <Route path="/transparency" element={wrap(<TransparencyPage />)} />
            <Route path="/academy" element={wrap(<AcademyPage />)} />
            <Route path="/academy/:routeId" element={wrap(<LearningRoutePage />)} />
            <Route path="/dao" element={wrap(<DAOPage />)} />
            <Route path="/agents" element={wrap(<AgentsPage />)} />
            <Route path="/community" element={wrap(<CommunityPage />)} />
            <Route path="/membership" element={wrap(<MembershipPage />)} />
            <Route path="/profile" element={wrap(<ProfilePage />)} />
            <Route path="/investor/:address" element={wrap(<InvestorPage />)} />
            <Route path="/leaderboard" element={wrap(<LeaderboardPage />)} />
            <Route path="/invites" element={wrap(<InvitesPage />)} />
            <Route path="/invite/:address" element={wrap(<InvitePage />)} />
            <Route path="/team" element={wrap(<TeamPage />)} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
