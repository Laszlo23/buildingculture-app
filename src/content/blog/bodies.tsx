import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const L = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link to={to} className="font-medium text-primary underline-offset-4 hover:underline">
    {children}
  </Link>
);

/** What tokenized exposure usually proves on-chain vs what stays in legal/off-chain layers. */
export function BodyRwaOnChainClaims() {
  return (
    <>
      <p>
        Tokenized real-world assets are often marketed as “everything on-chain.” In practice, the smart contract
        usually encodes <strong>claims, cash-flow rules, and transfer restrictions</strong> — while custody, disclosures,
        and regulated workflows may still live off-chain.
      </p>
      <p>
        For members, the useful question is: <em>what does this instrument actually settle on-chain today?</em> That
        framing keeps expectations aligned with how settlement, oracles, and issuer attestations actually work.
      </p>
      <h2>Where to go next</h2>
      <p>
        Explore <L to="/reserves">Reserves</L> for how we talk about real-asset backing, then pair it with{" "}
        <L to="/strategies">Strategies</L> to see how vault exposure is presented in the app (educational framing, not a
        personalized recommendation).
      </p>
      <p>
        New to the vocabulary? Start with <L to="/academy">Academy</L> — short routes on RWA, authenticity, and what
        blockchains can and cannot prove.
      </p>
    </>
  );
}

/** AI-assisted workflows vs “magic alpha” — how we think about tooling around a vault. */
export function BodyAiTradingSignals() {
  return (
    <>
      <p>
        “AI trading” can mean many things. In a club context, we treat AI as a <strong>workflow and communication</strong>{" "}
        layer: summarizing complexity, surfacing prompts, and helping members ask better questions — not promising
        guaranteed returns or hidden edge.
      </p>
      <p>
        When models touch market data, the risk story is still about <strong>inputs, latency, and incentives</strong>.
        Smart contracts do not automatically know off-chain prices; feeds and operators introduce assumptions members
        should understand at a high level.
      </p>
      <h2>Connect to the product surface</h2>
      <p>
        See <L to="/strategies">Strategies</L> for how strategies are described in-product, and{" "}
        <L to="/vault">Vault</L> for how savings rails are framed. Use <L to="/transparency">Transparency</L> when you
        want the “what we publish vs what is marketing” posture in one place.
      </p>
    </>
  );
}

/** How diversification maps to a strategy list — without implying personal suitability. */
export function BodyStrategyStack() {
  return (
    <>
      <p>
        A strategy list is a <strong>catalog of exposures and narratives</strong>, not a personalized portfolio
        prescription. Members still need their own constraints: time horizon, liquidity needs, jurisdiction, and risk
        tolerance.
      </p>
      <p>
        We keep the UI oriented around <em>education and transparency</em>: where metrics come from, what is on-chain vs
        illustrative, and where to dig deeper (contracts, reserves, governance).
      </p>
      <h2>Internal links worth bookmarking</h2>
      <ul>
        <li>
          <L to="/portfolio">Portfolio</L> — wallet-aware view when connected
        </li>
        <li>
          <L to="/contracts">Contracts</L> — addresses and network context
        </li>
        <li>
          <L to="/dao">DAO</L> — proposals and participation entry points
        </li>
      </ul>
    </>
  );
}

/** Yield language: forward-looking vs historical; no guaranteed outcomes. */
export function BodyThinkingAboutYield() {
  return (
    <>
      <p>
        Yield is often shown as a single number. In reality, members should treat headline figures as{" "}
        <strong>scenario-sensitive</strong>: they can reflect historicals, modeled ranges, or marketing summaries — and
        they can change as market conditions change.
      </p>
      <p>
        A healthy club culture encourages questions: <em>what period</em> does this represent, <em>what fees</em> are
        included, and <em>what risks</em> are excluded from the headline?
      </p>
      <p>
        If you want a structured starting point, use <L to="/academy">Academy</L> and then cross-check any claim you care
        about on <L to="/transparency">Transparency</L> and <L to="/vault">Vault</L>.
      </p>
    </>
  );
}

/** Why we bias toward published surfaces: contracts, reserves, governance. */
export function BodyTransparencyFirst() {
  return (
    <>
      <p>
        Growth and trust compound when the same facts are easy to find. We bias the product toward{" "}
        <strong>published routes</strong>: where contracts live, how reserves are described, and how governance activity
        is surfaced.
      </p>
      <p>
        That does not replace your own diligence — it reduces friction for the basics: “where is the on-chain truth for
        X?” and “what is still an off-chain representation?”
      </p>
      <h2>Jump links</h2>
      <p>
        <L to="/transparency">Transparency</L> · <L to="/contracts">Contracts</L> · <L to="/community">Community</L> ·{" "}
        <L to="/strategies">Strategies</L>
      </p>
    </>
  );
}

/** Member education + distribution: how content supports safer onboarding. */
export function BodyClubGrowthContent() {
  return (
    <>
      <p>
        For a savings club, “growth” is not only top-of-funnel — it is <strong>retention through clarity</strong>. Short
        explainers, consistent terminology, and obvious links to on-chain surfaces reduce the chance that someone
        optimizes for the wrong thing by accident.
      </p>
      <p>
        We treat blog posts as living companions to the app: they should always point you back to a{" "}
        <strong>verifiable next step</strong> (vault, strategies, contracts) rather than stopping at hype.
      </p>
      <p>
        Dive in via <L to="/community">Community</L>, share feedback, and use <L to="/membership">Membership</L> when
        you want the club’s member framing in one place.
      </p>
    </>
  );
}

/** Learning paths, docs humor, and why we still built the boring pages. */
export function BodyDocsAreAFeature() {
  return (
    <>
      <p>
        Statistically, almost nobody reads the long version of anything until something breaks. We know. We still built a{" "}
        <L to="/learn">Learning hub</L> anyway — partly because optimism is a strategy, and partly because the members who{" "}
        <em>do</em> read tend to ask better questions in chat and fewer panicked ones at 2 a.m.
      </p>
      <p>
        Transparent humor moment: if a product page ever feels like it is flattering you, assume it is practicing self-esteem.
        The club version of romance is linking you to <L to="/contracts">Contracts</L> and letting the relationship develop
        from there.
      </p>
      <p>
        For structured nonsense-with-footnotes, <L to="/academy">Academy</L> and the story routes are still the shortest
        path from “I heard a word on a podcast” to “I can articulate what I do not know yet.” No grade inflation — if you
        pass a quiz, you earned it; if you skip it, we will not send a guilt NFT.
      </p>
      <h2>Where to wander next</h2>
      <p>
        <L to="/learn">Learning hub</L> · <L to="/vault">Vault</L> · <L to="/strategies">Strategies</L> ·{" "}
        <L to="/transparency">Transparency</L> — pick your vibe: curriculum, savings rail, catalog, or receipts.
      </p>
    </>
  );
}

/** Narratives, timelines, and not outsourcing your calendar to a slogan. */
export function BodyNarrativeSeasons() {
  return (
    <>
      <p>
        Markets love seasons: “liquidity summer,” “builder winter,” “narrative autumn” (we made that last one up just now;
        check back next quarter when it is trending). The honest version is simpler:{" "}
        <strong>your</strong> timeline is not required to rhyme with Twitter’s mood board.
      </p>
      <p>
        When yield talk gets theatrical, treat the performance as entertainment and the footnotes as homework. Headlines
        age faster than <L to="/dao">DAO</L> proposals — which is saying something.
      </p>
      <p>
        If an assistant summarizes the world for you, enjoy the convenience — then cross-check anything you would regret
        explaining to future-you on <L to="/portfolio">Portfolio</L> and <L to="/reserves">Reserves</L>. We are fans of
        tools that save time; we are less fond of outsourcing common sense to a confident paragraph.
      </p>
      <h2>Serious links, lightly offered</h2>
      <p>
        <L to="/agents">Agents</L> for questions in plain language, <L to="/academy">Academy</L> for foundations, and{" "}
        <L to="/blog">this very blog</L> when you want opinions that know where the exits are.
      </p>
    </>
  );
}

/** Gas, patience, and the social contract between you and Base. */
export function BodyGasAndPatience() {
  return (
    <>
      <p>
        A transaction receipt is a tiny certificate of adulthood: you waited, you paid, you did not refresh the page
        seventeen times in four seconds. We respect that energy — even when gas is “cheap enough to pretend it is free”
        until it is not.
      </p>
      <p>
        If the <L to="/vault">Vault</L> flow asks you to confirm twice, it is not flirting; it is separating “deposit principal”
        from “claim yield” so you do not accidentally narrate two different stories to your future self in one click.
      </p>
      <p>
        Transparent humor: blaming the chain for your impatience is allowed for exactly five minutes, then we gently
        redirect you to <L to="/transparency">Transparency</L> and <L to="/contracts">Contracts</L> where the grown-up
        footnotes live.
      </p>
      <h2>While the block confirms</h2>
      <p>
        Read a <L to="/blog">blog post</L>, poke <L to="/strategies">Strategies</L>, or open <L to="/learn">Learning hub</L>{" "}
        — education is a valid way to pass time that is not refreshing a pending spinner.
      </p>
    </>
  );
}

/** PFPs, vibes, and what actually counts as diligence. */
export function BodyJpegDiligence() {
  return (
    <>
      <p>
        Your profile picture can be art, identity, or a screenshot of a spreadsheet — we are not judging. We are simply
        noting that a tasteful gradient does not replace reading what the app links to when it says “verify on-chain.”
      </p>
      <p>
        If you resolved a <L to="/profile">Profile</L> handle, celebrate the dopamine, then still walk the boring path:
        reserves narrative plus <L to="/reserves">Reserves</L>, strategy copy plus <L to="/strategies">Strategies</L>, and
        anything you intend to repeat out loud in <L to="/community">Community</L> checked against{" "}
        <L to="/contracts">Contracts</L> when it matters.
      </p>
      <p>
        Self-own for the road: the author of this paragraph has definitely clicked “I agree” without reading. The club
        aspiration is smaller — fewer surprises, more receipts — not moral perfection.
      </p>
      <h2>Receipt-forward browsing</h2>
      <p>
        <L to="/transparency">Transparency</L> · <L to="/dao">DAO</L> · <L to="/academy">Academy</L> — three tabs you can
        open when you want to feel responsible without yet knowing which question to ask first.
      </p>
    </>
  );
}

