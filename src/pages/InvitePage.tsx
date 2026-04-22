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
      <div className="min-h-[40vh] flex flex-col items-center justify-center p-6 gap-3 text-center text-sm text-destructive max-w-md mx-auto">
        <p>That invite link is not valid. Use <span className="font-mono">/invite/0x…</span> with a full 40-hex address.</p>
        <Button asChild variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
      Saving your invite and opening the club…
    </div>
  );
};
