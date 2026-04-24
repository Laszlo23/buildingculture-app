import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { isAddress } from "viem";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "osc_inviter";

/**
 * /invite/0x… — store referrer and send user to the dashboard. Attribution is recorded on first wallet connect.
 */
export const InvitePage = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const a = address?.trim();
  const valid = Boolean(a && isAddress(a as `0x${string}`));

  useEffect(() => {
    if (!valid || !a) return;
    try {
      localStorage.setItem(STORAGE_KEY, a.toLowerCase());
    } catch {
      /* ignore */
    }
    void navigate("/", { replace: true });
  }, [valid, a, navigate]);

  if (!a || !valid) {
    return (
      <div className="mx-auto flex max-w-md min-h-[42vh] flex-col justify-center gap-4 p-6">
        <div className="glass-card rounded-2xl border border-destructive/25 bg-destructive/5 p-6 text-center space-y-3">
          <p className="text-sm text-destructive leading-relaxed">
            That invite link is not valid. Use <span className="font-mono text-xs">/invite/0x…</span> with a full
            40-character hex address (checksummed or lowercase).
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild variant="default" className="rounded-xl">
              <Link to="/">Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/invites">Invites leaderboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-sm min-h-[48vh] flex-col items-center justify-center gap-3 p-6 text-center">
      <Loader2 className="w-7 h-7 animate-spin text-primary" aria-hidden />
      <p className="text-sm text-muted-foreground">Saving your invite and opening the club…</p>
    </div>
  );
};
