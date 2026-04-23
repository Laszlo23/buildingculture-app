/**
 * Educational storytelling for strategy detail pages — illustrative, not a performance guarantee.
 * Figures on cards/portfolio may still come from API merge; this copy explains mechanics in plain language.
 */
export type StrategyNarrative = {
  tagline: string;
  /** One short line for list cards */
  hook: string;
  /** 2–4 sentences: scene-setting, character of the strategy */
  story: string[];
  /** How money is theoretically made (and what can eat returns) */
  roiTitle: string;
  roiBody: string[];
  pros: string[];
  cons: string[];
  proTip: string;
};

const narratives: Record<string, StrategyNarrative> = {
  "real-estate": {
    tagline: "Rent meets rails — paperwork still exists somewhere.",
    hook: "Skyline cash flows, token-sized tickets.",
    story: [
      "Picture a building that pays rent every month. Now shrink the ownership slice until it fits in a wallet: that is the romance of tokenized real estate — pooled economics with programmable distribution.",
      "The plot twist is familiar: the deed and the tenant relationships usually live off-chain. On-chain you often hold claims, rules, and settlement — which can still be powerful, but is not the same as kicking the tires in the lobby.",
    ],
    roiTitle: "How ROI usually shows up (when things go well)",
    roiBody: [
      "Cash flow from leases (minus costs) can be routed to token holders as distributions, buybacks, or reinvestment — depending on the mandate the DAO votes on.",
      "Secondary liquidity can help price discovery, but spreads and gates still matter; “listed” does not mean “always easy to exit at NAV.”",
      "Macro rates, vacancies, and local regulation can compress yields faster than a dashboard animation.",
    ],
    pros: [
      "Tangible narrative — people understand rent.",
      "Potential diversification vs pure crypto beta (still correlated in stress).",
      "On-chain allocation can make treasury composition legible to members.",
    ],
    cons: [
      "Legal and operational layers remain critical — the chain does not replace counsel.",
      "Liquidity events can gap vs fair value; APY-style headlines may smooth volatility away.",
      "Oracle / reporting risk if off-chain cash flow is attested imperfectly.",
    ],
    proTip: "Pair every marketing map with the reserves and contracts pages — if the story and the receipts disagree, trust the receipts first.",
  },
  "btc-mining": {
    tagline: "Machines do not care about your Twitter handle.",
    hook: "Hashrate, watts, and orange-coin paychecks.",
    story: [
      "Somewhere a rack of ASICs is doing arithmetic for a living. When difficulty cooperates and power is priced sanely, the reward is BTC — a simple story until energy markets sneeze.",
      "DAO-owned hashrate is a bet on continuity: uptime, hosting contracts, and the global race for efficiency.",
    ],
    roiTitle: "How ROI usually shows up (when things go well)",
    roiBody: [
      "Mined BTC (net of pool fees and opex) accumulates to the strategy; treasury policy decides how much is held vs converted.",
      "Difficulty adjustments and halving cycles change the slope — good years can look heroic; bad years look expensive.",
      "Correlation to BTC price dominates — you are rarely escaping orange-coin gravity.",
    ],
    pros: [
      "Native BTC exposure without pretending it is something else.",
      "Infrastructure moat possible with cheap, reliable power and ops partners.",
      "Transparent hashrate reporting (when published) maps well to member education.",
    ],
    cons: [
      "Energy politics and hardware depreciation are real tail risks.",
      "Pool / custodian concentration — know who holds keys between payouts.",
      "APY can look smooth while realized BTC per share wiggles materially.",
    ],
    proTip: "Ask what period the hashrate and yield figures cover — trailing glory is not a promise about next quarter’s weather.",
  },
  "ai-trading": {
    tagline: "Copilots are loud; markets are louder.",
    hook: "Signals, sizing, and surviving drawdowns.",
    story: [
      "Imagine a disciplined desk that ingests noisy markets and outputs trades — except the “trader” is software, and the discipline is whatever risk rails humans actually wired in.",
      "This strategy’s drama is not magic alpha; it is fee math, funding rates, and the gap between backtest poetry and live-order prose.",
    ],
    roiTitle: "How ROI usually shows up (when things go well)",
    roiBody: [
      "Returns come from directional or relative-value bets where edge (if any) survives trading costs and volatility drag.",
      "Strict drawdown controls can cap losses — they can also cap recoveries if the model flips regimes slowly.",
      "High headline APYs often bake in favorable regimes; stress months are the footnote nobody scrolls to.",
    ],
    pros: [
      "Automation can react faster than manual workflows for certain signals.",
      "Risk overlays (limits, kill-switches) can be codified — if maintained.",
      "Useful as a satellite sleeve when size is sober and governance is awake.",
    ],
    cons: [
      "Model decay and overfitting are evergreen villains.",
      "Latency, counterparty, and liquidation cascades are not “AI problems” — they are market problems.",
      "Marketing loves the word “AI”; diligence loves the word “reproducible.”",
    ],
    proTip: "Treat AI here as tooling around execution — not an oracle that knows your personal risk tolerance.",
  },
  liquidity: {
    tagline: "You are the market — sometimes uncomfortably so.",
    hook: "Fees from swaps, drama from curves.",
    story: [
      "Liquidity strategies are the club throwing a party where guests pay a tiny toll every time they dance across the floor. Concentrated positions mean you picked the corner of the room — great when the crowd stays, rough when it leaves.",
      "Uniswap v4, Aerodrome, Curve — different venues, same moral: you earn when volume meets your range.",
    ],
    roiTitle: "How ROI usually shows up (when things go well)",
    roiBody: [
      "LP fees accrue from traders crossing your liquidity; incentives (gauges, rewards) can temporarily boost APY.",
      "Impermanent loss is the silent bill when prices diverge — fees must outrun the divergence story.",
      "Compounding rewards sounds virtuous; gas and slippage still read the fine print on every harvest.",
    ],
    pros: [
      "Transparent on-chain positions and swap volume in many setups.",
      "Composable with the rest of DeFi lego — useful for treasury engineering.",
      "Fee income can be steady in range-bound regimes.",
    ],
    cons: [
      "IL can erase weeks of fees in a violent trend.",
      "Smart contract and upgrade-path risk varies by venue.",
      "Active management time — set-and-forget often becomes set-and-regret.",
    ],
    proTip: "Compare fee APR vs price risk — if you cannot explain IL in one sentence, size smaller until you can.",
  },
  staking: {
    tagline: "Yield with homework: consensus, then extra credit.",
    hook: "ETH secured, rewards layered.",
    story: [
      "First act: ETH validates Ethereum — predictable-ish base rewards if validators behave. Second act: restaking adds AVS-style duties — extra yield, extra things that can go sideways if operators stumble.",
      "It is the financial equivalent of taking a steady job, then signing up for night classes that pay better but occasionally send you surprise exams.",
    ],
    roiTitle: "How ROI usually shows up (when things go well)",
    roiBody: [
      "Consensus rewards and MEV smoothing contribute baseline yield on staked ETH.",
      "EigenLayer-style AVS rewards add variable upside tied to adoption and slashing design.",
      "Slashing and operator behavior are the grim reapers in the footnotes — low headline risk is not “no tail risk.”",
    ],
    pros: [
      "Exposure to Ethereum security budget — a clear economic story.",
      "Liquid staking variants can improve portability (with their own trust assumptions).",
      "Often lower volatility sleeve than pure perp strategies.",
    ],
    cons: [
      "Upgrade and fork politics can move expectations quickly.",
      "Restaking complexity stacks unknowns — read the operator set and coverage.",
      "Withdrawal queues can delay exits in stress.",
    ],
    proTip: "Read whether yield is mostly consensus or mostly AVS — they break for different reasons when markets turn.",
  },
  art: {
    tagline: "Illiquid beauty, audited custody, patient capital.",
    hook: "Culture as collateral — slowly.",
    story: [
      "Blue-chip art is a slow-burn narrative: auctions, private sales, and insurance vaults. Tokenization translates that story into smaller tickets — but not into a vending machine that prints liquidity on demand.",
      "The emotional pitch is real; the settlement path is still humans, appraisers, and jurisdictions.",
    ],
    roiTitle: "How ROI usually shows up (when things go well)",
    roiBody: [
      "Returns may arrive via sales, lending against inventory, or curated exhibitions — timing is lumpy, not monthly DeFi cadence.",
      "Custody and provenance are the product — mishandle them and the ROI story becomes a litigation story.",
      "Correlation to risk assets can spike during margin-call seasons even if “culture” feels defensive.",
    ],
    pros: [
      "Diversification vs purely digital factors when mandates are conservative.",
      "Prestige and narrative can unlock strategic partnerships.",
      "On-chain proof of allocation can still improve transparency vs opaque funds.",
    ],
    cons: [
      "Valuation subjectivity — two experts, three opinions, one spreadsheet.",
      "Long lockups and high diligence costs.",
      "Market depth thinner than large-cap equities — exits need planning.",
    ],
    proTip: "If the pitch is masterpiece-grade, the diligence should be custody-grade — signatures, insurers, and chain-of-title, not vibes.",
  },
  structured: {
    tagline: "Options kitchens: recipes, not guarantees.",
    hook: "Defined outcomes — read the fine print twice.",
    story: [
      "Structured products bundle trades so members see a clean label: “capped upside, cushioned downside” or similar. Behind the label is a kitchen of puts, calls, and funding — each ingredient billed.",
      "Ribbon-style vaults made the genre famous; the lesson is the same: payoff diagrams do not remove counterparty and model risk — they organize it prettily.",
    ],
    roiTitle: "How ROI usually shows up (when things go well)",
    roiBody: [
      "Yield often comes from selling volatility or harvesting premia when implied vol is rich vs realized.",
      "Principal protection is only as good as the wrapper and collateral chain — read what “protected” means literally.",
      "Vendor and venue risk stack — if one leg fails, the diagram tears.",
    ],
    pros: [
      "Clear payoff framing can help members reason about tail scenarios.",
      "Useful for expressing a specific view with bounded loss (if truly bounded).",
      "Composable with treasury goals when sizing is conservative.",
    ],
    cons: [
      "Black-swan gaps where hedges do not print when needed.",
      "Complex fee stacks — headline APY may omit drag.",
      "Liquidity can vanish when everyone reads the same footnote at once.",
    ],
    proTip: "Ask for the payoff diagram in words and numbers — if nobody can draw it on a whiteboard, size it like a mystery box.",
  },
};

export function getStrategyNarrative(strategyId: string | undefined): StrategyNarrative | undefined {
  if (!strategyId) return undefined;
  return narratives[strategyId];
}
