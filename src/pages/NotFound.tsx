import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.warn("[404]", location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-secondary/30 text-muted-foreground">
        <Search className="h-8 w-8" aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Nothing lives at <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">{location.pathname}</code>.
          Check the spelling or start from the dashboard.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild className="rounded-xl">
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/manifest">Manifest</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/learn">Learning hub</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
