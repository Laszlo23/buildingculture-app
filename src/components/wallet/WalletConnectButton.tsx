import { ChevronDown, Loader2, User, Wallet, LineChart } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import type { Connector } from "wagmi";
import { useConnection, useConnect, useConnectors, useDisconnect, useSwitchChain } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWalletInfo } from "@/hooks/useChainData";

const expectedChainId = Number(import.meta.env.VITE_CHAIN_ID || 8453);

function targetChain() {
  return expectedChainId === 84532 ? baseSepolia : base;
}

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function WalletConnectButton() {
  const { address, chainId, status } = useConnection();
  const connectors = useConnectors();
  const { connectAsync, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { data: relayer, isLoading: relayerLoading, isError: relayerError } = useWalletInfo();

  const isConnected = status === "connected";
  const wrongChain =
    isConnected && chainId !== undefined && chainId !== expectedChainId;

  const relayerShort =
    relayer?.address && !relayerError ? shortAddr(relayer.address) : null;

  async function handleConnect(connector: Connector) {
    try {
      await connectAsync({
        connector,
        chainId: expectedChainId,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || "Could not connect wallet");
    }
  }

  if (!isConnected) {
    if (connectors.length === 0) {
      return (
        <Button type="button" variant="secondary" className="rounded-xl font-medium gap-2" disabled>
          <Wallet className="w-4 h-4 shrink-0" />
          <span className="text-xs">No wallet found</span>
        </Button>
      );
    }

    if (connectors.length === 1) {
      const c = connectors[0];
      return (
        <Button
          type="button"
          variant="secondary"
          className="rounded-xl font-medium gap-2"
          disabled={isConnecting}
          onClick={() => void handleConnect(c)}
        >
          {isConnecting ? (
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          ) : (
            <Wallet className="w-4 h-4 shrink-0" />
          )}
          <span className="text-xs">Connect {c.name}</span>
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl font-medium gap-2"
            disabled={isConnecting}
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            ) : (
              <Wallet className="w-4 h-4 shrink-0" />
            )}
            <span className="text-xs">Connect wallet</span>
            <ChevronDown className="w-4 h-4 opacity-60 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Choose a wallet</DropdownMenuLabel>
          {connectors.map((c) => (
            <DropdownMenuItem
              key={c.uid}
              onClick={() => void handleConnect(c)}
              disabled={isConnecting}
            >
              {c.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          className="rounded-xl font-medium gap-2 max-w-[220px]"
        >
          <Wallet className="w-4 h-4 shrink-0" />
          <span className="font-mono-num truncate text-xs">
            {wrongChain ? "Wrong network" : address ? shortAddr(address) : "—"}
          </span>
          <ChevronDown className="w-4 h-4 opacity-60 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {address && (
          <>
            <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
              Connected
            </DropdownMenuLabel>
            <div className="px-2 py-1 font-mono-num text-xs break-all">{address}</div>
          </>
        )}
        {wrongChain && (
          <DropdownMenuItem
            onClick={() => switchChain({ chainId: expectedChainId })}
            disabled={isSwitching}
          >
            {isSwitching ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Switch to {targetChain().name}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/profile" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to={`/investor/${address}`} className="flex items-center gap-2">
            <LineChart className="h-4 w-4" /> Wealth graph
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
          API signer (deposits / votes)
        </DropdownMenuLabel>
        <div className="px-2 py-1 text-xs font-mono-num">
          {relayerLoading ? (
            <Loader2 className="w-3 h-3 animate-spin inline" />
          ) : relayerError ? (
            <span className="text-destructive">Offline</span>
          ) : (
            relayerShort ?? "—"
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => disconnect()}>Disconnect wallet</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
