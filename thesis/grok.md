**Experts on X largely agree that building software is undergoing a rapid, structural shift driven by capable AI coding agents.** The consensus is that the core activity is moving from “typing code into an editor” toward directing, orchestrating, reviewing, and specifying work for agents—while the volume and customizability of software both increase dramatically.

### Andrej Karpathy (one of the most detailed and widely engaged takes)

Karpathy has posted multiple high-visibility threads describing a phase shift that accelerated sharply around late 2025 / early 2026:

- Agents went from unreliable to genuinely useful for large, multi-step tasks. He describes giving an agent a complex home-camera video-analysis setup (SSH, vLLM, model download, web UI, systemd services, testing) and walking away for ~30 minutes while it resolved issues autonomously.
- “You’re not typing computer code into an editor… You’re spinning up AI agents, giving them tasks _in English_ and managing and reviewing their work in parallel.” The highest leverage is ascending abstraction layers—setting up long-running orchestrators that manage multiple coding agents with the right tools, memory, and instructions.
- Programming is becoming unrecognizable. The bottleneck moves from writing code to high-level direction, judgment, taste, decomposition of tasks, verification, and iteration. Agents still make subtle conceptual mistakes, overcomplicate things, and need oversight, but the net productivity and expansion of what is worth building is huge.
- Longer-term speculation: software becomes so cheap and abundant that discrete “apps” start to dissolve into on-demand, hyper-specific code paths that are assembled and discarded as needed (“boiling soup of code” rather than permanent castles of bricks).

He also notes personal workflow changes (from ~80% manual to ~80% agent-driven), the fun of removing drudgery, risks of skill atrophy in pure generation, and questions about whether the productivity gap between average and top engineers will widen further.

### Patrick Collison (Stripe CEO)

Collison predicts a fundamental economic shift:

- Software moves from “mass-produced, industrial scale” products built years in advance to **bespoke, custom software created the moment it is needed**.
- Traditional software economics (high fixed cost, near-zero marginal cost, strong winner-take-all dynamics) break down once inference costs and cheap custom generation are involved. This reduces the lock-in advantages of large pre-built platforms.

Related discussions on X often frame this as “generative software” or on-demand pixels/code generated at request time.

### Other notable expert / practitioner voices

- **Gergely Orosz** (Pragmatic Engineer): In the next 12–24 months, “UX-pilled” builders who can create intuitive, fast, natural-feeling interfaces across web/mobile/desktop will be in massive demand. This becomes a key differentiator when AI can generate functional code. He also flags that secure software will become significantly more expensive as AI speeds up vulnerability discovery and defense must keep pace.
- **Bindu Reddy** and others: AI will graduate from “vibe coding” to full software-system creation—design, develop, test, monitor, scale, add features, fix bugs, and handle support.
- **Jerry Tworek** (ex-OpenAI, cited in threads): Coding agents represent a new level of abstraction in programming; “soon, almost no one will type code directly.” Focus shifts to reliability when humans are neither writing nor deeply reading most of the code.
- Broader practitioner consensus appearing across threads:
  - The market for software expands (Jevons paradox)—cheaper production unlocks custom tools and automations for many small businesses and internal use cases that previously could not justify the cost.
  - Humans retain (and increase in importance for) deciding _what_ should exist, domain modeling, product sense, verification, security, and orchestration of multiple agents.
  - Pure “typist” roles shrink; problem-solvers, domain experts who can direct agents, and people with strong taste/judgment thrive.
  - Some predict a rise in custom/in-house software at SaaS-like prices, disruption of traditional SaaS in many verticals, and a possible shift toward AI-native services or even hardware-native services longer term.

### Common themes across expert posts

| Theme                           | Typical Expert View                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------ |
| Core activity                   | Directing & reviewing agents instead of writing most code line-by-line                           |
| Software abundance              | Much more software will be created; many one-off or short-lived tools                            |
| Custom vs. packaged             | Strong tilt toward on-demand/bespoke software                                                    |
| Human edge                      | Taste, problem selection, decomposition, verification, UX, domain expertise, orchestration       |
| Bottlenecks that remain or grow | Reliability, security, long-term maintenance, knowing what is worth building                     |
| Time horizon                    | Meaningful change already visible in 2025–2026; deeper structural shifts over the next few years |

In short, the experts on X describe a future in which the act of “building software” becomes far more about high-level intent, verification, and orchestration than about manually producing source code. The craft does not disappear—it moves up the stack—while the volume and customizability of software both increase substantially.

Here are the direct links to the most relevant expert tweets/threads:

### Andrej Karpathy

- **Main recent thread** (programming is becoming unrecognizable, agents handling large tasks, agentic engineering):  
  https://x.com/karpathy/status/2026731645169185220

- **Detailed notes on coding workflow shift** (from 80% manual → 80% agents, current limitations, leverage, fun, atrophy, etc.):  
  https://x.com/karpathy/status/2015883857489522876

- **On software becoming extremely cheap/abundant** (“boiling soup of code” idea):  
  https://x.com/karpathy/status/2024933972523057610

### Patrick Collison (Stripe CEO)

- **Prediction about shift to bespoke/custom software** (via TBPN clip):  
  https://x.com/tbpn/status/2026410054111342650  
  (Similar version: https://x.com/tbpn/status/2027775887610179669)

### Gergely Orosz (Pragmatic Engineer)

- **“UX-pilled” builders will be in massive demand**:  
  https://x.com/GergelyOrosz/status/2044884503391355326

### Other notable ones

- **Bindu Reddy** – AI graduating from vibe coding to full software system creator:  
  https://x.com/bindureddy/status/2014569897079316482

- **Soleio** – Future of software design (production design automated, strategic/exploratory design changes):  
  https://x.com/soleio/status/2045574058654478472

These are the highest-signal posts that formed the core of the earlier summary. Let me know if you want more from specific people or related threads.
