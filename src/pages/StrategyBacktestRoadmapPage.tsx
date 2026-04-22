import { Link } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Bot,
  Coins,
  Database,
  Gauge,
  LineChart,
  Sparkles,
  Vote,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BinanceKlinesPreview } from "@/components/market/BinanceKlinesPreview";
import { cn } from "@/lib/utils";

const BINANCE_KLINES = "https://api.binance.com/api/v3/klines";

function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-[hsl(222_40%_6%)] overflow-hidden text-left">
      {title ? (
        <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/50 bg-secondary/30">
          {title}
        </div>
      ) : null}
      <pre className="p-4 text-xs font-mono text-foreground/90 overflow-x-auto leading-relaxed whitespace-pre-wrap">
        {children}
      </pre>
    </div>
  );
}

export function StrategyBacktestRoadmapPage() {
  return (
    <div className="space-y-10 max-w-3xl">
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" className="rounded-xl -ml-2" asChild>
          <Link to="/strategies">
            <span className="text-muted-foreground">Strategies</span>
            <span className="mx-1.5 text-border">/</span>
            Backtest roadmap
          </Link>
        </Button>
      </div>

      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <LineChart className="w-3.5 h-3.5" />
          Product architecture
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Strategy builder & backtester roadmap
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Internal blueprint for{" "}
          <span className="text-foreground/90 font-medium">app.buildingculture.capital</span> — inspired by lightweight
          GT-style protocol backtests (simple strategies, exchange candles, builder UI). This app today is{" "}
          <strong className="text-foreground/95">Vite + React + Tailwind + Hono</strong>; the sections below map where a
          dedicated engine would plug in.
        </p>
      </header>

      {/* Illustrative backtest snapshot */}
      <section
        className={cn(
          "rounded-2xl border border-border/60 p-5 sm:p-6 space-y-4",
          "bg-gradient-to-br from-secondary/50 via-card/80 to-primary/[0.04]",
        )}
      >
        <h2 className="font-display text-sm font-semibold flex items-center gap-2 text-foreground/95">
          <Activity className="w-4 h-4 text-primary" />
          Example snapshot (illustrative)
        </h2>
        <p className="text-xs text-muted-foreground">
          Same shape as a typical external backtest screen — not live data from this deployment.
        </p>
        <ul className="grid sm:grid-cols-2 gap-3 text-sm">
          {[
            ["Trades", "73"],
            ["Win rate", "42.5%"],
            ["PnL", "−51%"],
            ["Strategy", "Bollinger Bands"],
            ["Pair", "RAVE / USDT"],
            ["Timeframe", "1m"],
          ].map(([k, v]) => (
            <li
              key={k}
              className="flex justify-between gap-4 rounded-xl border border-border/50 bg-background/40 px-3 py-2.5"
            >
              <span className="text-muted-foreground">{k}</span>
              <span className="font-mono-num font-medium text-foreground">{v}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">
          Good fit to <strong className="text-foreground/90">self-host</strong>: strategy logic stays small, candles come
          from a single venue (e.g. Binance), UI is essentially a parameter panel + equity curve + trade list — often{" "}
          <strong className="text-foreground/90">10–50× cheaper</strong> than premium SaaS if you own compute and skip
          proprietary data feeds.
        </p>
      </section>

      <BinanceKlinesPreview className="scroll-mt-8" />

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <Database className="w-5 h-5 text-sky-400" />
          1. Market data (low cost)
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          OHLCV candles from public APIs — e.g. Binance <code className="text-xs px-1 rounded bg-secondary">klines</code>
          , or Hyperliquid for perps. No paid vendor required for research-grade history.
        </p>
        <CodeBlock title="Binance REST (example)">{`${BINANCE_KLINES}?symbol=BTCUSDT&interval=1m&limit=500`}</CodeBlock>
        <p className="text-xs text-muted-foreground">
          Docs:{" "}
          <a
            className="text-primary hover:underline"
            href="https://binance-docs.github.io/apidocs/spot/en/#kline-candlestick-data"
            target="_blank"
            rel="noopener noreferrer"
          >
            Binance Spot API — klines
          </a>
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          2. Backtest engine (backend)
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A dedicated worker service (recommended: <strong className="text-foreground/90">Python + FastAPI</strong>{" "}
          with <strong className="text-foreground/90">pandas / NumPy / vectorbt</strong>) for vectorized runs and grid
          search. <strong className="text-foreground/90">vectorbt</strong> is a strong default for millions of
          parameter combinations on crypto time series.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Alternatively, keep everything in TypeScript and call the same math from Hono — trade-off is ergonomics vs.
          ecosystem for heavy research.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <Gauge className="w-5 h-5 text-gold" />
          3. Strategy library (starter set)
        </h2>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
          <li>
            <strong className="text-foreground/90">Bollinger Bands</strong> — mean reversion: touch lower band → long
            bias; upper band → take profit / short bias.
          </li>
          <li>
            <strong className="text-foreground/90">MACD</strong> — trend and momentum crossovers.
          </li>
          <li>
            <strong className="text-foreground/90">KDJ / stochastic family</strong> — overbought / oversold swings.
          </li>
        </ul>
        <CodeBlock title="Bollinger-style signal sketch">{`upper = ma + (std * 2)
lower = ma - (std * 2)
buy  = price < lower
sell = price > upper`}</CodeBlock>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          4. Optimizer (grid search first)
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The expensive part of hosted tools is usually multi-tenant compute + UI. Start with nested loops over TP/SL or
          band width — add genetic search or Bayesian optimization later if needed.
        </p>
        <CodeBlock title="Grid search (pseudo)">{`for tp in range(2, 10):
    for sl in range(2, 10):
        run_backtest(tp=tp, sl=sl)`}</CodeBlock>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <LineChart className="w-5 h-5 text-cyan-400" />
          5. Frontend & charts
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This codebase already uses <strong className="text-foreground/90">React + Tailwind</strong>. For pro-grade
          candles and drawings, integrate{" "}
          <strong className="text-foreground/90">TradingView Charting Library</strong> (requires their license) or an
          open alternative (Lightweight Charts, Apache ECharts) depending on compliance and budget.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <Vote className="w-5 h-5 text-primary" />
          6. DAO integration (your differentiator)
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The club already has on-chain governance surfaces (e.g. <strong className="text-foreground/90">StrategyRegistry</strong>
          , vault, proposals). A backtester can feed <em>which</em> strategies are eligible for DAO vote, live capital
          caps, or copy-trading pools — flows SaaS backtesters typically do not ship.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-xl" asChild>
            <Link to="/dao">DAO governance</Link>
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl" asChild>
            <Link to="/strategies">Strategy explorer</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <Bot className="w-5 h-5 text-violet-400" />
          7. AI strategy generator (optional)
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          “Generate strategy” → LLM emits constrained Python (or DSL) → lint → run in sandbox → show equity curve. Pair
          with the existing server AI routes pattern; never execute unaudited code on shared production without isolation.
        </p>
      </section>

      <section className="glass-card p-6 space-y-4 border border-gold/15">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2 text-gold">
          <Coins className="w-5 h-5" />
          Cost framing (order of magnitude)
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-border/60 p-4 space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Typical SaaS tool</div>
            <div className="font-mono-num text-lg">~$30–$200 / mo</div>
            <p className="text-xs text-muted-foreground">Multi-tenant UI + hosted data + optimizer.</p>
          </div>
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-1">
            <div className="text-xs text-primary uppercase tracking-wide">Self-hosted club stack</div>
            <div className="font-mono-num text-lg text-primary">~$5–$20 / mo VM</div>
            <p className="text-xs text-muted-foreground">Data $0 (public APIs), software OSS + optional chart license.</p>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-primary/20 bg-primary/[0.04] p-6">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          North star: AI Wealth Engine
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Fold backtests into a single member dashboard: <strong className="text-foreground/90">AI trading</strong>,{" "}
          <strong className="text-foreground/90">BTC mining</strong>,{" "}
          <strong className="text-foreground/90">tokenized real estate</strong>, liquidity mining, lending, staking —{" "}
          <strong className="text-foreground/90">total yield</strong>, strategy performance, DAO votes, and (where
          applicable) real-asset income — aligned with{" "}
          <Link to="/reserves" className="text-primary font-medium hover:underline">
            Reserves
          </Link>{" "}
          transparency.
        </p>
      </section>

      <p className="text-xs text-muted-foreground border-t border-border/60 pt-6">
        Educational architecture note — not a commitment to ship every subsystem; prioritise exchange ToS, rate limits,
        and regulatory context before live capital.
      </p>
    </div>
  );
}
