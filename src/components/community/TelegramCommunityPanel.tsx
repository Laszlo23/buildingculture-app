import { MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChainConfig } from "@/hooks/useChainData";

const FALLBACK_GROUP = "https://t.me/+4zFH7-2tyW0yOTBk";
const FALLBACK_BOT = "https://t.me/culturebuildingbot";

/**
 * BuildingCulture Telegram group + @culturebuildingbot — same Community Builder AI as the web app when the API is configured.
 */
export function TelegramCommunityPanel() {
  const { data: cfg } = useChainConfig();
  const tg = cfg?.telegram;
  const groupUrl = tg?.groupInviteUrl ?? FALLBACK_GROUP;
  const botUrl = tg?.botDeepLink ?? FALLBACK_BOT;
  const botHandle = tg?.botUsername ?? "culturebuildingbot";
  const webhookReady = tg?.botTokenConfigured === true;

  return (
    <section
      className="rounded-2xl border border-border/60 bg-gradient-to-br from-sky-500/[0.08] to-transparent p-5 sm:p-6"
      aria-labelledby="telegram-community-heading"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
            <MessageCircle className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <h2 id="telegram-community-heading" className="font-display text-lg font-semibold tracking-tight">
              Telegram — live community
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-prose">
              Join the <span className="text-foreground/90">BuildingCulture</span> group for announcements and
              hangouts. <span className="font-medium text-foreground/90">@{botHandle}</span> is our Community Builder
              bot: DM it anytime, or in the group mention <code className="text-[10px]">@{botHandle}</code> or send{" "}
              <code className="text-[10px]">/ask your question</code>. Replies use the same server-side builder as
              Member Chat (requires <code className="text-[10px]">LANGBASE_API_KEY</code>).
            </p>
            {!webhookReady && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400">
                Bot token not detected on this API — links still work; set <code className="font-mono">TELEGRAM_BOT_TOKEN</code>{" "}
                and a webhook for Telegram replies.
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Button variant="secondary" size="sm" className="rounded-xl gap-1.5" asChild>
            <a href={groupUrl} target="_blank" rel="noopener noreferrer">
              Join group
              <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
            </a>
          </Button>
          <Button size="sm" className="rounded-xl gap-1.5 bg-[#229ED9] text-white hover:bg-[#1b8ec4]" asChild>
            <a href={botUrl} target="_blank" rel="noopener noreferrer">
              Open @{botHandle}
              <ExternalLink className="h-3.5 w-3.5 opacity-80" aria-hidden />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
