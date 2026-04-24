import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ONBOARDING_VIDEO_EMBED_URL, ONBOARDING_VIDEO_WATCH_URL } from "@/config/onboarding";

type Props = {
  children: ReactNode;
};

export function OnboardingVideoDialog({ children }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[min(56rem,calc(100vw-1.5rem))] gap-4 p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Onboarding video</DialogTitle>
          <DialogDescription>
            About two minutes — wallet, Base, and getting started with the club.
          </DialogDescription>
        </DialogHeader>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={ONBOARDING_VIDEO_EMBED_URL}
            title="Onboarding video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5" asChild>
            <a href={ONBOARDING_VIDEO_WATCH_URL} target="_blank" rel="noopener noreferrer">
              Open on YouTube
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
