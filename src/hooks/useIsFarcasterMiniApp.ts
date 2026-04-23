import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

/**
 * Resolves after the host reports whether we are inside a Farcaster Mini App.
 * Used to hide the Farcaster wagmi connector in normal browsers (it targets SDK.ethProvider only).
 */
export function useIsFarcasterMiniApp() {
  const [value, setValue] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    void sdk
      .isInMiniApp(5000)
      .then(v => {
        if (alive) setValue(v);
      })
      .catch(() => {
        if (alive) setValue(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return value;
}
