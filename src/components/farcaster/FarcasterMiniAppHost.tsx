import { useEffect, useRef } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useConfig, useConnect, useConnection } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";

const expectedChainId = Number(import.meta.env.VITE_CHAIN_ID || 8453);

function targetChainId() {
  return expectedChainId === 84532 ? baseSepolia.id : base.id;
}

/**
 * Farcaster Mini Apps: hide the client splash via `ready()`, and connect the
 * host wallet through the official wagmi connector when running inside a client.
 */
export function FarcasterMiniAppHost() {
  const config = useConfig();
  const { status } = useConnection();
  const { connectAsync } = useConnect();
  const didTryConnect = useRef(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const inMiniApp = await sdk.isInMiniApp().catch(() => false);
      if (cancelled) return;

      try {
        await sdk.actions.ready();
      } catch {
        /* Outside a Mini App host, ready() may reject — safe to ignore. */
      }
      if (cancelled) return;

      if (inMiniApp && status === "disconnected" && !didTryConnect.current) {
        const fc = config.connectors.find(c => c.id === "farcaster");
        if (fc) {
          didTryConnect.current = true;
          try {
            await connectAsync({ connector: fc, chainId: targetChainId() });
          } catch {
            didTryConnect.current = false;
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [config, connectAsync, status]);

  return null;
}
