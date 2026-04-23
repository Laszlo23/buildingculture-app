import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Vault,
  TrendingUp,
  PieChart,
  GraduationCap,
  Vote,
  Users,
  Gem,
  Landmark,
  UserCircle,
  Menu,
} from "lucide-react";
import { footerNavLinks, navItems, navSidebarGroups } from "@/data/club";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useChainConfig } from "@/hooks/useChainData";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { GmMicroFinancingFab } from "@/components/tips/GmMicroFinancingFab";
import { SITE_TAGLINE } from "@/lib/siteTagline";

const iconMap = {
  LayoutDashboard,
  Vault,
  TrendingUp,
  PieChart,
  GraduationCap,
  Vote,
  Users,
  Gem,
  Landmark,
  UserCircle,
};

function navTitleForPath(pathname: string): string | null {
  const fromNav = navItems.find(n => n.path === pathname)?.name;
  if (fromNav) return fromNav;
  const fromFooter = footerNavLinks.find(n => n.path === pathname)?.name;
  if (fromFooter) return fromFooter;
  if (pathname.startsWith("/investor")) return "Investor profile";
  if (pathname.startsWith("/invite/")) return "Referral";
  if (pathname.startsWith("/academy/")) return "Academy";
  if (
    pathname.startsWith("/strategies/") &&
    pathname !== "/strategies" &&
    pathname !== "/strategies/backtest-roadmap"
  ) {
    return "Strategy";
  }
  return null;
}

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const pageTitle = navTitleForPath(location.pathname);
  const { data: chainCfg } = useChainConfig();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/60 bg-sidebar/80 backdrop-blur-xl sticky top-0 h-screen">
        <div className="px-6 py-5 border-b border-border/60">
          <Link
            to="/"
            className="flex items-center min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg"
          >
            <img
              src="/logosavingsclub.png"
              alt="OnChain Savingsclub logo featuring a metallic glowing green star icon and bold sans-serif text"
              className="h-9 w-auto max-w-full min-w-0 object-contain object-left"
              width={567}
              height={219}
              decoding="async"
            />
          </Link>
          <p className="mt-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-primary/80 leading-snug">
            {SITE_TAGLINE}
          </p>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-5 overflow-y-auto" aria-label="Primary">
          {navSidebarGroups.map(group => (
            <div key={group.label} className="space-y-1">
              <p className="px-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/90">
                {group.label}
              </p>
              {group.items.map(item => {
                const Icon = iconMap[item.icon as keyof typeof iconMap];
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative w-full ${
                        isActive
                          ? "bg-sidebar-accent text-primary shadow-card"
                          : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-glow" />
                        )}
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="flex-1 text-left">{item.name}</span>
                        {item.path === "/vault" && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 border-primary/40 text-primary shrink-0"
                          >
                            Core
                          </Badge>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-border/60">
          <div className="glass-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
              <span className="text-xs text-muted-foreground">Treasury health</span>
            </div>
            <div className="font-mono-num text-lg font-semibold text-success">98.4%</div>
            <div className="text-[10px] text-muted-foreground">62% real-asset backed</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2 px-4 sm:px-6 lg:px-10 h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="lg:hidden shrink-0 rounded-xl h-10 w-10 -ml-1"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="min-w-0 flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                <h1 className="font-display text-base sm:text-lg font-semibold tracking-tight truncate min-w-0">
                  {pageTitle ?? "Dashboard"}
                </h1>
                <span className="hidden sm:block text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground truncate">
                  {SITE_TAGLINE}
                </span>
              </div>
              <Badge
                variant="outline"
                className="hidden sm:inline-flex shrink-0 border-primary/30 text-primary bg-primary/5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse" />
                {chainCfg?.chainName ?? "Base"}
              </Badge>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <WalletConnectButton />
            </div>
          </div>

          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetContent
              side="left"
              className="flex w-[min(100vw,20rem)] flex-col gap-0 border-border/60 bg-sidebar/95 p-0 backdrop-blur-xl sm:max-w-sm"
            >
              <SheetTitle className="sr-only">Main navigation</SheetTitle>
              <div className="border-b border-border/60 px-5 py-4">
                <Link
                  to="/"
                  className="flex min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg"
                  onClick={() => setMobileNavOpen(false)}
                >
                  <img
                    src="/logosavingsclub.png"
                    alt="OnChain Savingsclub logo featuring a metallic glowing green star icon and bold sans-serif text"
                    className="h-8 w-auto max-w-full object-contain object-left"
                    width={567}
                    height={219}
                    decoding="async"
                  />
                </Link>
                <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.12em] text-primary/80">
                  {SITE_TAGLINE}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {chainCfg?.chainName ?? "Base"} · {pageTitle ?? "Dashboard"}
                </p>
              </div>

              <nav className="flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-3 py-4" aria-label="Primary">
                {navSidebarGroups.map(group => (
                  <div key={group.label} className="space-y-0.5">
                    <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/90">
                      {group.label}
                    </p>
                    {group.items.map(item => {
                      const Icon = iconMap[item.icon as keyof typeof iconMap];
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          end={item.path === "/"}
                          onClick={() => setMobileNavOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative ${
                              isActive
                                ? "bg-sidebar-accent text-primary shadow-card"
                                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {isActive && (
                                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-glow" />
                              )}
                              <Icon className="w-4 h-4 shrink-0" />
                              <span className="flex-1 text-left">{item.name}</span>
                              {item.path === "/vault" && (
                                <Badge
                                  variant="outline"
                                  className="shrink-0 border-primary/40 px-1.5 py-0 text-[9px] text-primary"
                                >
                                  Core
                                </Badge>
                              )}
                            </>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                ))}
              </nav>

              <div className="border-t border-border/60 p-3">
                <div className="glass-card space-y-2 p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse-glow rounded-full bg-success" />
                    <span className="text-xs text-muted-foreground">Treasury health</span>
                  </div>
                  <div className="font-mono-num text-lg font-semibold text-success">98.4%</div>
                  <div className="text-[10px] text-muted-foreground">62% real-asset backed</div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>

        <footer className="border-t border-border/60 px-4 sm:px-6 lg:px-10 py-5 lg:py-6 text-xs text-muted-foreground">
          <nav
            className="flex flex-wrap gap-x-4 gap-y-1.5 pb-3 mb-3 border-b border-border/50"
            aria-label="More links"
          >
            {footerNavLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="text-foreground/85 hover:text-primary transition-colors font-medium underline-offset-4 hover:underline"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-3 gap-y-1 min-w-0">
              <span>© 2026 Onchain Savings Club DAO · Strategies on-chain where deployed</span>
              <span className="hidden sm:inline text-border">|</span>
              <a
                href="https://buildingculture.capital/team"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/80 hover:text-primary transition-colors underline-offset-4 hover:underline shrink-0"
              >
                buildingculture.capital
              </a>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground/90 shrink-0">v2.4.1</span>
          </div>
        </footer>
      </div>

      <GmMicroFinancingFab />
    </div>
  );
};
