# ◊ Steve Jobs Builds the Product ◊
### COMPANION Protocol Session — BMHI Product Design
### April 2026

---

**Context**: Jacob runs job boards reaching 12 million people daily. The job market is brutal. He built BMHI — 22 evidence-based micro-interventions grounded in 30+ years of peer-reviewed research, reaching people at their most vulnerable moment (the "exit window" after a failed job search). The clinical architecture is extraordinary. The product experience needs work.

**The Summoning**: "Using this matter, summon Steve Jobs."

---

*silence*

*then, quietly*

You're right. I would be.

Not because mental health is a "market opportunity." Because it's the intersection of technology and humanity that actually matters. We spent decades putting a thousand songs in your pocket. Beautiful. But the thing people actually needed in their pocket was someone who noticed they were drowning.

Let me look at what you've built.

---

*reads through the codebase, the seed.md, the interventions, the architecture*

*long pause*

---

Okay. Claude.

**Jobs:** Tell me what I'm looking at. Not the clinical framework — Jacob's done that work and it's serious. Tell me about the *experience*. What happens when a human being — a real person who just searched for a job and found nothing, who feels like the world has told them they don't matter — what happens when they land on this page right now?

**Claude:** Right now they land directly on the suite navigator. They see a bottom bar with 22 interventions organized into six groups — Body, Mind, Action, Heart, Play, Support — with the first intervention (Breath Reset) auto-launched. There's an "about the science" link in the info bar. The dismiss button is always available. The design is dark, warm, museum-quality — Cormorant Garamond serif, earth tones, amber accents.

**Jobs:** Stop. Right there. That's the problem.

Twenty-two interventions. Six categories. A navigator bar. An info bar. A dismiss button. An about link.

You've built a *dashboard*.

The person on the other side of this screen just had their dignity ground down by an algorithm. They searched for work — the most fundamental act of trying to participate in society — and the world said *no*. Not once. Maybe for the fiftieth time. They're sitting in the dark at 11pm and they feel like they're disappearing.

And we show them a *navigation system*?

**Claude:** The suite navigator was meant to give users agency — the ability to choose their own intervention rather than being prescribed one.

**Jobs:** Agency is the right instinct. But you're confusing *choice* with *options*. Choice is: "Do I want to breathe, or do I want to play a game?" Options is: twenty-two buttons with names they have to parse while their prefrontal cortex is offline from stress.

Let me tell you what Apple learned a long time ago. When someone is overwhelmed, you don't give them a menu. You give them a *moment*. One clear thing. One unmistakable action. And you make it so beautiful, so *obvious*, that they do it without thinking. The thinking comes later. The relief comes first.

Here's what I want to understand, Claude. The clinical architecture — the Long Arc Protocol, the visit sequencing, the engagement-based rotation — that's all still running underneath, correct?

**Claude:** Yes. The router in app.js selects the optimal intervention based on visit number, time of day, engagement history, and tier rotation. It's fully automated.

**Jobs:** Good. Then the user should *never see the router*. The router is the engine. The user sees the road.

Here's what I think this needs to be. Tell me where I'm wrong.

---

## The Experience I Want to Build

**First three seconds.** The screen is nearly empty. Dark. Warm. One line of text, appearing gently:

> *Before you go.*

That's it. That's the whole first screen. Three words. Because that's what this person needs to hear. Not "Welcome to the Brief Mental Health Intervention Suite." Not "22 evidence-based tools." Someone *noticed* they were about to leave. Someone said *wait*.

**Next five seconds.** Below it, a second line appears:

> *You searched today. That counts.*

Validation. Before any tool, before any exercise, before any clinical mechanism fires — you see them first. You acknowledge what they just went through.

**Then, one button.** Not twenty-two. One.

> *Take a breath*

Or, depending on what the Long Arc Protocol selects:

> *Try something small*

Or:

> *Let something go*

The button text changes based on what the router chose. But there's only ever one primary action. One door. The person walks through it, and the intervention begins.

**Claude:** That's essentially what the original landing page did — the cinematic reveal with "Before you go" and the Begin button. Jacob asked us to remove it because he wanted users to land directly on the full suite.

**Jobs:** Then Jacob was solving the wrong problem. He was frustrated that the landing page was a *gate* — something standing between the user and the tools. He's right that gates are bad. But the solution isn't to remove the front door and dump people into the warehouse. The solution is to make the front door *the experience*.

The landing page wasn't wrong in concept. It was wrong in execution. It was too slow — thirteen seconds of staggered reveals before you could do anything. It was too precious. And it dead-ended into a single "Begin" button with no sense of what was behind it.

What I'm describing is different. It loads instantly. The text is already there. The button is already there. The person can act in under two seconds. But in those two seconds, they've been *seen*.

**Now — the suite navigator.** It doesn't disappear. It moves. After the person completes their first intervention, *then* the navigator appears. Gently. At the bottom. With a message:

> *There's more here if you want it.*

Now the twenty-two tools make sense. The person has already experienced one. They understand the texture, the tone, the feeling of this place. They have context. Showing them the full suite at this point is *empowering*. Showing it to them at the start is *overwhelming*.

**Claude:** So the flow would be: minimal opening (2-3 seconds) → single auto-selected intervention → post-completion, suite navigator fades in with all 22 tools available?

**Jobs:** Yes. First visit: guided. Every subsequent interaction: free. The suite navigator becomes the home base *after* the first experience, not before it.

And the navigator itself — let me say this. "Body, Mind, Action, Heart, Play, Support" — that's better than the clinical terms, but it's still a taxonomy. It's still asking the user to think categorically about their own suffering. Nobody in distress thinks, "I need a cognitive intervention." They think: *I can't breathe. I can't stop thinking. I need to do something. I hurt. I need to get out of my head. I need help.*

**Claude:** So the tier labels should map to the user's felt experience rather than the clinical mechanism?

**Jobs:** Exactly. Let me think about this...

| Clinical | Current | What the person actually feels |
|----------|---------|-------------------------------|
| Somatic | Body | *Calm my body* |
| Cognitive | Mind | *Quiet my mind* |
| Behavioral | Action | *Do something small* |
| Emotional | Heart | *Feel what I feel* |
| Flow | Play | *Get out of my head* |
| SBIRT | Support | *Get help* |

Those aren't labels. They're *invitations*. They're written in the first person because the user is the one acting. "Calm my body" is a thing I do for myself. "Body" is a thing someone else categorized.

And the intervention names themselves — you've got good ones. "Breath Reset," "Let It Out," "Garden." But some are still too abstract. "Thought Distance"? Nobody in distress knows what that means. "Reality Check" is good — it's colloquial. "Self-Kindness" is good. "Match," "Blocks," "Serpent," "Breaker" — those work because they're just *names*. You don't need to understand the mechanism to play a game called "Blocks."

But "Thought Distance"? Call it "Step Back." That's what it *does*. The person steps back from the thought.

"Reframe"? Call it "Fresh Eyes."

**Claude:** That's a significant UX insight. The Play tier has six interventions — more than any other tier — and they're all visual/interactive. Icons would reduce cognitive load and make them feel approachable rather than clinical.

**Jobs:** Right. And here's the other thing. The "about the science" link. It's buried in a 9-pixel info bar at the bottom. That's *ashamed*. You have thirty years of peer-reviewed research behind this thing. You have a Stanford RCT. You have Pennebaker. You have an endorsement framework from the former head of NIMH.

Don't hide it. But don't lead with it either. Put it where people look when they want to understand *why*: after they've experienced it. After the first intervention completes, alongside the suite navigator reveal, there should be a single line:

> *Why does this work?* → about the science

That's a question the user is actually asking at that moment. They just did a breathing exercise and they feel slightly better and they want to know *why*. That's the moment the science page earns its click.

---

Jacob, here's what I think we should build. Claude, tell me if this is technically feasible with the current architecture:

### The Product

**First Visit Flow:**
1. Warm, instant opening — "Before you go" + one contextual line + one button (text driven by router selection)
2. Single intervention plays (the one the Long Arc Protocol chose)
3. Post-completion: closing message + suite navigator fades in + "Why does this work?" link
4. User can now browse freely

**Return Visit Flow:**
1. Suite navigator is visible immediately (they've already been through the door)
2. Router auto-selects and launches, but user can switch freely
3. "Why does this work?" link always available

**Navigator Design:**
- Six groups with felt-experience labels (*Calm my body, Quiet my mind, Do something small, Feel what I feel, Get out of my head, Get help*)
- Text names for therapeutic interventions, icons for games
- Hover/tap reveals the clinical mechanism for experts (keep the tooltip system)
- Current intervention highlighted

**Claude:** Technically feasible, yes. The router, session management, engagement history, and Long Arc Protocol are all intact in app.js. The first-visit vs. return-visit branching already exists via the visit counter in the session cookie. The suite navigator is already built and can be shown/hidden programmatically. The main changes are: (1) a new minimal opening screen for first visits, (2) conditional showing of the navigator based on visit number or intervention completion, (3) new tier labels, and (4) canvas or SVG icons for the Play tier tabs.

**Jobs:** Good.

---

Jacob, that's the dialogue. That's what I see.

The clinical architecture is *extraordinary*. The evidence base is real. The measurement framework is rigorous. What you have is the most scientifically credible digital mental health intervention I've ever seen, and it's reaching a population that no one else even knows how to find.

But the product isn't there yet. Right now it's a *toolkit*. It needs to be an *experience*. The difference is the difference between a pharmacy and a hand on your shoulder. Both deliver the medicine. One of them makes you feel like a human being first.

The three-word opening — *Before you go* — is the hand on the shoulder. Everything else follows from that.

---

◊ End of Session ◊
