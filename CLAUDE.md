# Wayfinders Product Decisions

## North Star Principles
These override every product, algorithm, and prioritisation decision made on this platform.

1. **"The platform should disperse people into new, amazing experiences they would otherwise
   not have discovered — not funnel them into an ever-smaller list of popular ones."**
   This is the primary guiding principle for all decision-making. When in doubt, this wins.

2. **"Social as context. Algorithm as discovery engine."**
   The feed is never driven by who you follow. Social mechanics enrich the experience layer;
   they do not determine what surfaces.

3. **"What if we built Tripadvisor for experiences, designed ground up in 2026."**
   The clearest single articulation of the product. Not a patch on an old model — a
   ground-up rebuild incorporating everything now understood about content, behaviour,
   and discovery.

---

## Product Vision

### What Wayfinders Is
The premier way people are inspired, discover, plan and eventually book the experiences
and activities of travel — what they will actually do on holiday. The experience itself
is the primary object. How to access it — paid tour, self-guided, or other — is a
separate overlay on top, not the defining characteristic.

### The Gap This Fills
- Viator and GetYourGuide assume people only want paid tours — not a full representation
  of everything there is to do, just what's monetisable through them
- Tripadvisor is a muddle of paid tours and reviews with no clear primary object
- Instagram and TikTok are genuinely the best sources of inspiration today, but were never
  built to help anyone move through the planning journey

### What Wayfinders Is Not
- Not a review platform — users inspire and share, not rate and critique
- Not a booking platform — booking is a downstream consequence, not the core mechanic
- Not a social network — connections are context, not the product
- Not a tour operator directory — paid tours are one access method among several
- Not a popularity contest — the algorithm actively resists funnelling toward most visited
- Not a clone of Instagram, TikTok, Viator, or Tripadvisor
- Not comprehensive in the way Tripadvisor tries to be — deliberately narrow, experiences only

---

## Content Architecture

### Three Level Taxonomy

**Place**
- The geographic anchor, tied to a Google Place ID for deduplication
- Inherits Google's geographic hierarchy (city / region / country)
- A Place can itself function as an "experience" relative to a broader area —
  e.g. Byron Bay is worth visiting as a day trip from Gold Coast, but Byron Bay is
  also a Place that contains its own Experiences (such as the Lighthouse Walk)
- Google Places does not model this kind of experiential relationship — Wayfinders
  builds its own relationship layer on top (see Relationship Graph section)

**Experience**
- A specific thing to do, see, or feel at or around a Place
- Anchored to a Google Place ID but holds richer data than Google provides
- Multiple distinct Experiences can exist at the same Place — e.g. "sunrise at the
  west gate" and "the inner sanctuary at midday" are different Experiences that
  happen to share an anchor
- Multiple creators (Waypoints) can upload content against the same Experience
- Carries: See/Do/Feel classification, Q&A, "I Did This" count, hero image, badge data

**Duplicate prevention is a soft guardrail, not a hard constraint.** Because multiple
distinct Experiences are explicitly allowed at the same Place, the Google Place ID alone
cannot mechanically prevent duplicate Experiences the way it prevents duplicate Places.
Prevention instead relies on the upload-time search-and-match flow — surfacing existing
similar Experiences to a creator before they confirm a new one — working well, combined
with reasonable creator honesty. This makes the upload UX for Experience search and
matching one of the most consequential pieces of the entire build: poor UX here directly
produces a fragmented, duplicated content base with no technical backstop to fall back on.

**Waypoint**
- An individual creator's content entry against an Experience — their video, their angle
- Multiple Waypoints can exist per Experience
- Carries: comments, likes, creator attribution, outbound social links, its own hero image
- All engagement actions are attributed to a Waypoint via last-touch attribution
  (the Waypoint being viewed at the moment of the action gets the credit)

### Experience Classification — See / Do / Feel
Assigned by the creator at upload:
- **See** — witness something remarkable
- **Do** — active participation
- **Feel** — emotional or spiritual resonance

A secondary classification is optional, acknowledging that most great experiences are
more than one dimension at once.

This taxonomy went through extensive iteration (candidates considered and rejected:
Wonder/Immersion/Challenge/Stillness; Witness/Taste/Live It/Be There/Connect/Exhale;
See/Do/Eat/Feel/Live). All were rejected as either too academic, requiring decoding,
or not mutually exclusive enough. See/Do/Feel was settled on as final for now, with an
explicit acknowledgment that "Feel" is the weakest of the three labels and may be
revisited. **Store as neutral database identifiers (e.g. type_1, type_2, type_3), never
as the literal words** — labels must be changeable without a schema rebuild, and
additional dimensions may be added later.

### Relationship Graph
Two distinct relationship mechanisms exist — do not conflate them:

**Platform-level Place relationships** — e.g. "Byron Bay is a recommended day trip from
Gold Coast." Builds over time as a confidence-scored graph, informed by aggregated
creator behaviour. Lives in `place_relationships`.

**Creator-contributed routing context** — captured at upload, per Waypoint:
- Where were you based when you did this experience?
- Was this part of a wider trip or route?
- If yes, what would you call that trip or route?
- What did you do immediately before and after this experience?

This data seeds the relationship graph organically and is one of the platform's most
defensible long-term assets — no competitor can replicate years of crowdsourced routing
data. At MVP, proximity logic is purely geographic (distance, mode of travel, approximate
time). Rome2Rio integration for richer transport context is a future enhancement.

**Why this matters strategically:** the relationship graph, once it has accumulated real
volume, is genuinely difficult for a competitor to replicate quickly — it's not content
that can be scraped or re-licensed, it's the accumulated, organic record of how real
travellers actually move between Places, built one upload at a time. Content alone can
be copied by a well-resourced competitor; a mature relationship graph cannot be bought
or rebuilt quickly. This is arguably more defensible long-term than the content library
itself.

---

## Users

### One Account Type, Behaviour-Driven Presentation
There is one account type. The platform does not force a binary creator/consumer choice.
Roughly 90%+ of users will be pure consumers. The remaining slice are not "creators" as a
separate class — they are both creator and consumer simultaneously, the same pattern seen
on Instagram and TikTok. Profile richness is driven by behaviour, not account type — a
heavy creator has a rich public profile, a pure consumer has a minimal one, but the
underlying data structure is identical.

### Anonymous Users
- Full browsing and list-building allowed without an account
- Login required only to save a list permanently
- Shared list links are fully viewable by unauthenticated users — login required only to save

### Third User Type — Operators (Post-MVP Experience, Day-One Data Structure)
Tour operators and experience providers are a genuine third user type, but their
self-serve experience is explicitly post-MVP. The data structure must exist from day one:
- `operators` table as a placeholder account type
- `products` table linking operators to Experiences
- At MVP, an operator record is just a name, URL, and price — manually seeded by Tim if
  needed, no login, no dashboard, no commission tracking
- The "Book this" button on an Experience page links externally only at MVP

---

## Creator System

### Cold Start Strategy
Creator-first, not consumer-first. The platform's content database builds organically
through creator uploads — there is no need to pre-populate Experiences before opening to
creators, since a creator searching for an Experience that doesn't yet exist simply
creates it. The first creator on the platform is not blocked by an empty database; they
*are* the database, from their very first upload.

The consumer-facing side of the platform is deliberately sequenced to open only once
creator-side content density is established — this is a go-to-market and sequencing
decision, not a technical constraint. Opening broadly to consumers against a near-empty
content base would waste the platform's only real chance at a strong first impression
for that user.

**A significant accelerant to this sequencing:** Tim holds a personal travel library
spanning 70+ countries and plans to seed hundreds, potentially thousands, of Experiences
himself. This materially changes the cold start picture — the consumer side need not be
empty at launch even before third-party creators arrive in volume, and this should be
treated as a core strategic asset, not just a stopgap.

### Acquisition Target
Micro-influencers with roughly 5,000–50,000 followers on Instagram or TikTok — existing
travel content creators who are struggling to cut through algorithmically and struggling
to monetise, but who already produce quality content and have an existing content library
sitting unused.

### The Creator Hook
"Evergreen discoverability" alone was considered and rejected as the primary hook — it
creates an unresolved ranking problem the moment more than one creator covers the same
Experience (who gets shown first?), which makes the promise feel broken in practice the
moment it's tested. The hook is instead a combination of:
1. The **First Waypoint badge** — a land-grab dynamic that rewards documenting new,
   undiscovered Places
2. Future revenue share, foreshadowed honestly but not over-promised
3. The reframe: **"give your existing content a permanent home"** — most micro-influencers
   already have footage sitting unused; Wayfinders gives it discoverable permanence rather
   than asking for new content

### First Waypoint Badge
- Awarded to the first creator to upload any Waypoint at a Place not previously on the platform
- **One badge per Place**, not per Experience — does not restrict multiple Experiences
  being added at the same Place, simply doesn't incentivise stacking badges at one location
- Small hexagonal badge, displayed prominently alongside the creator's profile photo
- Permanently attached to the creator's profile and to the Place/Experience page
- Purpose: actively directs creator energy toward documenting new Places rather than
  mining a single popular location

### Exceptional Badge System
- One badge unlocked per every 10 uploads (1 at 10 uploads, 2 at 20, and so on)
- The creator manually assigns each unlocked badge to whichever of their Experiences they
  judge to be their best work — never automatically awarded
- Badges can be freely and repeatedly reassigned, without limit
- This is mathematically equivalent to a "top 10%" proportional model, but creator-curated
  rather than automatic — preserving meaningful scarcity (an automatically-awarded top 10%
  badge would lose its signalling value, since every creator would know they're guaranteed
  one) while still scaling fairly with upload volume rather than rewarding raw volume alone

### Creator Social Links
- Instagram and TikTok handles displayed on creator profile
- Tapping opens in an in-app browser or new tab — never replaces the current session
- A deliberate short-term trade: sending traffic outward is a real, immediate carrot for
  creators while Wayfinders' own audience is not yet valuable enough to be the draw on
  its own. Not removed later — as the platform's own audience becomes valuable, creators
  will naturally start promoting their Wayfinders profile as a destination in its own right.

---

## Core Product Experience

### Architecture — Progressive Web App
- Built in Next.js 14, single codebase for both web and mobile
- Works in browser and can be added to home screen
- Mobile-first design — vertical format; on desktop the content is centred in a
  phone-width column with whitespace either side (same pattern as TikTok's desktop layout),
  not stretched to fill a widescreen
- A native React Native/Expo app is a deliberate V2, planned for after MVP product
  validation — not before
- English language only at MVP

This architecture decision had real back-and-forth worth preserving: the original
instinct was "web app now, native app later, web is basically a marketing layer." That
was wrong. The web experience is the **primary acquisition surface** — the large majority
of users will arrive via a Google search ("best things to do in Bali") and land directly
on a Wayfinders page. If that page is a download prompt rather than a working product,
the platform loses almost all of its organic acquisition. The web experience must
therefore be a fully functional product — feed, detail pages, save, share — not a
brochure. A Progressive Web App resolves this: one codebase delivers a real product on
web and a near-native feel on mobile, without splitting build effort across two
codebases before anything is validated.

### SEO and AIO First
A non-negotiable engineering principle, not a marketing afterthought:
- All Experience pages, Place feeds, and destination surfaces are server side rendered
- Structured data markup (schema.org) on all indexable pages, so AI search tools
  (Perplexity, Google AI overviews) can parse and surface Wayfinders content directly
- SEO-optimised URL structure throughout
- The personalised, dynamic discovery feed itself does not need this treatment —
  only static-ish, indexable pages do

### The Discovery Feed
**Default state** — a deliberate opening frame that prompts a location search, but the
user can bypass it entirely and start scrolling immediately. Either path leads to the
same underlying feed mechanic. No search input defaults to a globally curated feed.

**Directed state** — searching a destination filters the same feed to that region.

**Feed content types** — four types exist in the feed architecture:
1. `experience` — standard Waypoint video content (the primary, default type)
2. `ranking` — comparative judgement card (post-MVP feature; placeholder from day one)
3. `ad` — promotional content with external link (post-MVP; placeholder from day one)
4. `editorial` — admin-curated content (placeholder from day one, fully undefined
   beyond its existence as a type — not blocking for MVP)

**Infinite scroll**, for as long as content is available.

### The Scroll Mechanic
Card unit: full-bleed video, autoplaying, with overlays for Experience name, caption,
and creator attribution.

- **Swipe left** — not interested, advances to next Experience
- **Swipe right** — interested, saves to list as "maybe"
- **Tap left/right screen edges** — cycles through multiple Waypoints within the
  same Experience
- **Swipe up** — opens the Experience detail page (this is explicitly *not* "next
  experience" — vertical motion is reserved entirely for depth, not lateral progression)
- **Swipe down** — returns to the previous Experience

Escalating a saved Experience to "must-do" never happens from within the feed itself —
only from the list or the detail page. This keeps the discovery flow fast and binary
while still allowing considered prioritisation elsewhere.

The swipe-based mechanic deliberately echoes a dating-app interaction pattern, which
carries some risk of feeling trivialising for a travel product — the visual design needs
to read as premium and travel-specific, not gamified.

**Desktop translation:**
- Vertical scroll wheel / arrow keys are the natural equivalent of swipe up/down, but
  this conflicts with native browser scroll behaviour — explicitly parked as a UX problem
  to solve once the mobile experience is working. Not a core engineering challenge.
- Left/right edge tap becomes a click in the same screen regions
- Swipe left/right becomes on-screen ✕ and ♡ buttons, visible on hover

### The Experience Detail Page
In order, top to bottom:
1. Full media (video or photo) from the relevant Waypoint
2. Experience name, Place anchor, creator attribution with profile photo
3. See/Do/Feel classification
4. Caption / description
5. Social actions — comments, sharing
6. Save mechanic — maybe / must-do
7. "I Did This" button, with count ("X Wayfinders have done this")
8. Map showing location with nearby Experience pins
9. How to get there (general transport guidance — see Relationship Graph / Routes)
10. Book this — external link only at MVP
11. "See it as part of" — tours, routes, or collections that include this Experience
12. "More to do in [Place]"
13. "More like this"

All modules from 11 onward use **progressive disclosure** — hidden entirely when no
data exists, never shown as an empty or "coming soon" placeholder.

### The List
Mental model: an Airbnb-style wishlist. A simple collection point, curated afterward —
not a planning tool with built-in intelligence at MVP.

**Two tiers:**
- **Maybe** — the result of a right swipe in the feed, or a save from the detail page
- **Must-do** — a deliberate escalation, only available from within the list itself or
  the detail page, never from the discovery feed

**Visual organisation** — a simple ordered grouping: must-do items listed first, maybe
items after. No additional visual styling differentiates the tiers beyond this ordering.

**Automatic geographic grouping** — not user-created folders. Saved Experiences are
grouped at the most specific level that produces meaningful distinct groups:
- Country appears only as a header, never as a grouping level on its own
- Region is the primary grouping level when multiple regions are represented
- Place becomes a subgroup within a region where useful

Example: a list spanning Kangaroo Island, Lord Howe Island, and Darwin groups as
**Australia** (header) → South Australia / New South Wales / Northern Territory
(region groups) → individual Place subgroups within each. A list spanning Australia and
Bali shows two country headers, each with their own region groups beneath.

**Sharing** — a simple share button generates a public link. This is core functionality,
not a nice-to-have addition — shared lists are expected to be a meaningful organic
acquisition channel (a user sharing their Bali shortlist with a travel companion is one
of the platform's strongest growth loops). Unauthenticated visitors to a shared list see
the full experience; login is required only to save anything from it. This is a
deliberate choice to observe real engagement patterns before introducing any signup
friction on this surface.

**Post-MVP**: itinerary logic connecting saved Experiences, collaborative list building,
algorithmic suggestions based on list contents.

---

## Social Layer

### Philosophy
"Social as context. Algorithm as discovery engine." The feed is never driven by the
social graph — a socially-driven feed would create filter bubbles that directly
contradict the north star (people would only ever see what their existing network has
already done). Social mechanics exist to enrich the Experience layer, not to determine
what surfaces in discovery.

### What Exists at MVP
- **Follow a creator** — their new uploads surface in a separate following feed. This
  feed is deliberately *not* a prominent tab at MVP — it lives inside the navigation
  menu rather than competing for attention with the main discovery feed, since the
  social graph isn't meaningful enough yet to warrant prominence
- **Comments** — live at the **Waypoint** level. Conversational, creator-specific,
  ephemeral. ("Amazing video", "this looks incredible")
- **Waypoint likes** — a lightweight appreciation action at Waypoint level, distinct
  from comments
- **Q&A** — lives at the **Experience** level. Structured, searchable, evergreen,
  building into a genuine knowledge base over time. Deliberately distinct from comments —
  directed at creators and at users who have flagged "I Did This," not a casual thread
- **Share** — both Experiences and Lists
- **"I Did This"** — see dedicated section below
- **"I Did This" count** displayed on Experience pages

### "I Did This"
- Lives at the **Experience** level, not the Waypoint level
- Users are explicitly encouraged to log past travel history retroactively, not just
  log new experiences going forward — this is a powerful profile-building mechanic and
  a major data accelerator, and should be a core part of onboarding once designed
- Feeds into: comparative judgement qualification, the personalisation algorithm
  (post-MVP), the enriched profile page, and a broader, more representative dataset on
  experience quality than creator self-assessment alone could provide
- **Explicitly excluded** from the creator engagement/revenue scoring model (see
  Algorithm section) — this was a deliberate choice, not an oversight

### Notification System
Built as infrastructure at MVP with a minimal initial set, specifically using a
**batched digest** model rather than immediate pings — chosen to avoid notification
fatigue for well-travelled users who may accumulate many Q&A questions across the
Experiences they've done.

**MVP notification types:**
- Q&A digest — weekly, sent only if one or more unanswered questions exist
- New follower
- Someone saved an Experience you created
- Someone flagged "I Did This" on an Experience you created
- System notifications

**Post-MVP:** trending alerts, personalised discovery alerts, engagement milestones

Users have simple per-notification-type on/off controls from day one.

---

## Discovery Model

### Search
Returns all three content types from a single query, categorised:
- **Place** → filtered destination feed with a Place header
- **Experience** → Experience detail page
- **Creator** → creator profile page

### Map Browse
Included at MVP — this is a core expression of the product's vision (the world as a
canvas of discoverable experience), not a deferrable nice-to-have.
- Google Maps at MVP (already using Google Places for Place ID anchoring — keeping the
  map provider in the same ecosystem reduces integration complexity; Mapbox is a
  candidate for later if cost or visual customisation becomes a priority)
- Experience pins clustered by location
- Tapping a pin surfaces an overlay with the Experience name and thumbnail
- Tapping the overlay navigates to the Experience detail page (a deliberate two-step
  interaction to prevent accidental navigation)
- No routing or turn-by-turn directions at MVP

### Destination Feed
Not a separate page or template — a filtered instance of the same main feed component,
with a Place header added. Reuses the feed mechanic entirely.

### Geographic Diversity — Two Layer Protection
Exists specifically to prevent broad regional searches (e.g. "Australia") from being
dominated by the most content-dense areas (Sydney, Melbourne) at the expense of
less-documented but equally worthy Places (Kangaroo Island, Darwin, Lord Howe).

1. **Soft layer** — the quality-over-popularity algorithm handles most of this
   naturally, since it doesn't weight by raw popularity in the first place
2. **Hard layer** — a minimum guarantee: at least 1 Experience from every represented
   region must appear in any regional search result, regardless of engagement score.
   Chosen over a percentage cap specifically because content will be sparse at MVP — a
   percentage cap assumes a density that won't exist yet. Evolves to a percentage-based
   model as content density grows.

### Geographic Search Hierarchy
Search queries are recursive/hierarchical — a search for "Australia" returns every
Experience whose geographic chain includes Australia at any depth of nesting, not just
Experiences directly tagged at the country level. This is not automatic from the Google
Place ID hierarchy alone — it requires deliberate query design.

### Filtering
Post-MVP (by See/Do/Feel, region, trip type, etc.), but the underlying data model
supports it from day one so it can be added without restructuring.

### Editorial Curation
Admin-only manual curation tool, surfacing content via the `editorial` feed content type.
Completely undefined beyond its placeholder existence — not required for MVP.

---

## Algorithm

### Core Principle
Quality over popularity, always, as the default/global state. This is not in tension
with personalisation — personalisation (post-MVP) layers "quality as judged by this
specific user's preferences" on top of the same principle, it never replaces it with
raw popularity.

### Rejected Quality Mechanics
For the record, these were considered and explicitly rejected:
- **Simple X/10 rating** — inconsistent across creators, doesn't encourage thoughtful input
- **Fixed "top 5" designation** — gaming problem, every creator picks their own as top 5
- **"Who is this experience for" categorisation** — people click through such fields
  without genuine thought
- **Behavioural signals alone (saves, must-do count, time on page) as a quality proxy** —
  these measure popularity, not quality, and using them as the primary signal would
  directly contradict the north star

### The Three-Part Quality System
1. **Comparative judgement** (post-MVP, see below) — the long-term "unlock"
2. **Exceptional badge system** (see Creator System section) — scarce, creator-curated
3. **See/Do/Feel classification** (see Content Architecture section) — taxonomy, not a
   quality score, but informs personalisation and filtering

### Comparative Judgement System (Post-MVP — Potential Platform Unlock)
Explicitly flagged as one of the most promising long-term mechanics discussed, and
explicitly **not** an MVP feature — but the data model must accommodate it from day one.

- Surfaces pairwise "which of these would you rather do" comparisons
- **Only** users who have flagged "I Did This" on *both* Experiences being compared are
  qualified respondents — comparing experiences you haven't done is noise, not signal
- Delivered as an occasional card in the main feed, using the exact same swipe mechanic
  as standard Experience cards (directly analogous to how Instagram embeds an ad within
  a normal feed) — deliberately native and frictionless, not presented as a survey
- Should only surface to users with sufficient "I Did This" / save history for the
  comparison to be meaningful
- Results feed a `comparison_score` on the Experience, which acts as a quality signal
  independent of and complementary to raw engagement volume

### Engagement Scoring and Last-Touch Attribution
Engagement actions happen at the Experience level (saves, must-do, etc.) but credit must
flow to the specific Waypoint (and therefore creator) that drove the action. This is
solved with **last-touch attribution** — whichever Waypoint was being viewed at the
moment the user took the action receives the credit. Last-touch was chosen deliberately
over split attribution for MVP simplicity; split attribution across multiple viewed
Waypoints is a flagged future refinement.

**Weighted point values:**

| Action | Points |
|---|---|
| View of more than 10 seconds | 5 |
| Swipe right / save to maybe | 3 |
| Upgrade to must-do | 8 |
| Share | 10 |
| Comment | 5 |
| Return visit to same Experience | 6 |
| Q&A response | 7 |

**"I Did This" is deliberately excluded from this scoring model.** This was a specific
and considered choice, not an oversight: at this early stage, the goal is to incentivise
broad and diverse creator content rather than concentrate reward on already-popular
destinations. A view can happen on any piece of interesting content regardless of its
popularity, but saves and "I Did This" flags will naturally concentrate around already
well-known Places — weighting those too heavily risks pushing creators to flood the most
popular Experiences chasing points, which runs directly against the north star. This is
also why "swipe right / save" (3 points) is deliberately weighted *lower* than a simple
view (5 points) — an inversion that looks counterintuitive in isolation but is a
deliberate editorial lever favouring broad, diverse content over destination popularity.

### Discovery Bonus — Sliding Scale Multiplier
Applied on top of the base point values, scaled to the total engagement count of the
**Place** (not the Experience) being engaged with:

| Place engagement status | Multiplier |
|---|---|
| First ever engagement with this Place on the platform | 4x |
| Place with fewer than 50 total engagements | 3x |
| Place with 50–500 total engagements | 2x |
| Place with more than 500 total engagements | 1x (no bonus) |

Example: a 10-second view of a brand-new Place scores 5 points × 4 = 20 points. The
identical view of an established Place scores the base 5 points only. This mechanic is
self-correcting — it cannot be gamed by repeatedly posting about the same Place, since
the multiplier naturally decreases as that Place accumulates engagement.

### Personalisation (Post-MVP)
As a user's swipe history builds, the algorithm shifts from global quality signals to
"quality as judged by this individual's preferences" — their See/Do/Feel leanings,
geographic interests, and engagement patterns. **Every swipe, left or right, must be
captured in the database from day one**, even before the personalisation algorithm
exists to process it — this data cannot be recovered retroactively if not captured from
the start.

### Geographic Diversity in Search
See Discovery Model section — the same north-star principle applied specifically to
broad regional search results, with both a soft (algorithmic) and hard (rule-based)
layer of protection.

---

## Commercial Model

### Revenue Sequencing
1. **Affiliate revenue** — first; lowest friction, fastest to implement, no operator
   relationships required
2. **Advertising** — second; uses the `ad` feed content type placeholder already in
   the architecture
3. **Full booking platform** — third, and only pursued at genuinely significant consumer
   scale; either via deeper commercial integration with Viator/GetYourGuide, or — if
   scale ultimately justifies it — a fully owned in-house booking backend along the
   same lines as how GetYourGuide or Viator operate today

### Affiliate Model
Deliberately broad rather than hotel-only, specifically to avoid unfairly disadvantaging
creators whose content covers destinations with little hotel-affiliate opportunity:
- Booking.com (or equivalent) for accommodation
- GetYourGuide / Viator for bookable experiences
- Rome2Rio, potentially, for transport
A broad affiliate base means engagement on any content type or destination contributes
to total platform revenue, not just accommodation-heavy locations.

### Creator Revenue Share Pool
- **Pool size:** 12.5% of **total** platform revenue across all revenue streams combined —
  described as "starting low and ramping" over time, locked at 12.5% until further notice
- **Distribution:** proportional to each creator's share of **total** platform engagement
  (using the weighted point system above), not segmented by geography or revenue type
- **Why total/total rather than segmented:** this was a specific refinement that solves
  the geographic fairness problem directly — a creator documenting incredible content in
  landlocked Nepal benefits equally from hotel affiliate revenue generated by Bali
  content, because both the revenue pool and the engagement measure are platform-wide,
  not tied to where the revenue or the engagement originated
- **Attribution:** last-touch Waypoint attribution, as defined in the Algorithm section
- **Review trigger:** none formally defined — left as an ongoing founder's discretion
  judgement call, not tied to a specific revenue threshold

### Booking at MVP
External link only. The "Book this" button on an Experience detail page links out to
the best available external source. No commission tracking, no operator dashboard, no
in-platform booking flow of any kind at MVP.

---

## Creator Expression of Interest Page

A pre-launch landing page designed to start building the creator pipeline before any
product exists. Audience is creators only, not consumers. No visual identity existed
for Wayfinders at the time this was designed — typography and colour direction were
created specifically for this page and are not yet confirmed as the platform's permanent
visual identity.

**Capture fields:** name and email only — deliberately minimal.

**Tone:** excited, part of something — not informational or measured. The person should
feel like they're being let in on something early, not being pitched at.

**Founding Wayfinder status — the specific, concrete value proposition offered:**
1. Permanently badged as a Founding Wayfinder on their profile
2. First access to upload and claim First Waypoint badges before the platform opens
   publicly — i.e. a genuine head start on the land-grab dynamic, not just a label
3. Entry into the creator revenue share pool from day one

**Monetisation framing:** deliberately mentions the *mechanic*, not a number —
"creators share in the platform's revenue based on the engagement their content drives."
The 12.5% figure is never stated publicly. This is intentional: a percentage on a public
page invites scrutiny and comparison before the platform has any track record to defend
it, and is either read as too low by sophisticated creators or as an overpromise that's
hard to walk back.

**Status: designed, not built.** This currently exists only as a rendered visual artifact
produced in conversation — dark/light split layout, serif display headline font, sans
body font, name+email form with a client-side-only mock submission. It has not been
turned into a real, deployable page, and the form does not yet write anywhere — see
OQ-012 in open-questions.md.

---

## Data Model Requirements

The following must exist in the database schema before front-end build proceeds much
further. Full field-by-field schema with precise data types is a dedicated build task —
this captures known fields and structure, not a final DDL.

### Core Content Tables

**`profiles`** *(exists — needs expansion)*
Existing: id, username, full_name, avatar_url, bio, website, created_at
To add: instagram_handle, tiktok_handle, upload_count, total_badges_allocated,
engagement_score (running total, feeds revenue share calculation), account_type
(user / operator placeholder)

**`places`**
id, google_place_id, place_name, city, region, country, latitude, longitude,
place_type (landmark / city / region / area), total_engagement_count (for discovery
bonus multiplier), created_at

**`experiences`**
id, place_id, name, description, see_do_feel_primary (neutral identifier),
see_do_feel_secondary (neutral identifier, nullable), hero_image_url, first_waypoint_id,
total_engagement_score, comparison_score, google_place_id (denormalised for query
performance), created_by, created_at

**`waypoints`**
id, experience_id, creator_id, video_url, hero_image_url, caption, view_count, created_at
Trip context fields: based_at_place_id, trip_name, before_experience_id, after_experience_id

### Relationship and Graph Tables

**`place_relationships`** — platform-level experiential relationships between Places
id, place_id_from, place_id_to, relationship_type (day_trip / side_trip / nearby /
en_route), confidence_score, created_at
Distinct from creator-contributed routing data below — this is the aggregated platform
relationship graph that matures over time.

**`experience_relationships`** — narrative trip context contributed by creators at upload
id, experience_id, creator_id, based_at_place_id, trip_name, before_experience_id,
after_experience_id, created_at

**`experience_routes`** — structured "how to get there" data
id, experience_id, origin_place_id (nullable), origin_label, transport_mode (enum:
driving / bus / taxi / walking / ferry / flying / other), duration_minutes,
approximate_cost, cost_currency, notes, contributed_by, created_at

**`trip_collections`** — tours, routes, multi-experience collections
id, name, description, created_by, collection_type (tour / route / self_guided), created_at

**`collection_experiences`** — join table
id, collection_id, experience_id, order_index, created_at

### User Behaviour Tables

**`i_did_this`**
id, user_id, experience_id, created_at

**`user_place_history`** — maintained for profile map performance (derivable from
i_did_this, but maintained separately to avoid expensive joins on a frequently-viewed page)
id, user_id, place_id, first_visited_at, visit_count

**`swipe_history`** — every left/right swipe, for future personalisation
id, user_id, experience_id, direction (left / right), created_at

**`lists`**
id, user_id, list_name, is_public, share_token (unique token for the public URL), created_at

**`list_items`**
id, list_id, experience_id, tier (maybe / must_do), waypoint_attribution_id
(last-touch Waypoint at time of save), created_at

### Social Tables

**`follows`**
id, follower_id, following_id, created_at

**`comments`** — Waypoint level
id, waypoint_id, user_id, content, created_at

**`waypoint_likes`**
id, waypoint_id, user_id, created_at

**`qa`** — Experience level
id, experience_id, asked_by, question, is_answered, created_at

**`qa_responses`**
id, qa_id, responded_by, response, created_at

**`notifications`**
id, user_id, type (enum: qa_digest / new_follower / experience_saved / i_did_this /
system), reference_id, is_read, created_at
Per-type on/off preferences stored on profiles.

### Badge Tables

**`first_waypoint_badges`**
id, place_id, waypoint_id, creator_id, awarded_at
One record per Place — awarded automatically on first Waypoint upload at that Place.

**`creator_badges`** — exceptional badge assignments
id, creator_id, experience_id, assigned_at, reassigned_at (nullable)
Allocation count lives on profiles (total_badges_allocated). One active assignment
record per badge owned. Freely and repeatedly reassignable.

### Algorithm and Engagement Tables

**`engagement_events`**
id, user_id, waypoint_id, experience_id, place_id, action_type (enum: view /
swipe_right / must_do / share / comment / return_visit / qa_response),
points_awarded, discovery_multiplier_applied, created_at
Note: "I Did This" deliberately does not generate an engagement_event for scoring
purposes (see Algorithm section). This will be a large table at scale and needs a
date-based indexing/partitioning plan.

**`experience_comparisons`**
id, user_id, experience_id_a, experience_id_b, preferred_experience_id, created_at
Only submittable by users qualified via "I Did This" on both Experiences. Feeds
comparison_score on the experiences table.

### Commercial Tables

**`operators`** — placeholder third user type
id, profile_id, company_name, website, created_at

**`products`** — bookable products linked to Experiences
id, operator_id (nullable at MVP — can be manually seeded), experience_id,
product_name, provider_name, external_url, approximate_price, currency, created_at

### Feed Table

**`feed_items`**
id, content_type (enum: experience / ranking / ad / editorial), reference_id,
metadata (jsonb for type-specific data), created_at

### Search Configuration
Not a table — PostgreSQL/Supabase full text search, explicitly configured across
places.place_name, experiences.name, profiles.username, profiles.full_name.

### Key Principles Across the Schema
- See/Do/Feel stored as neutral identifiers, never literal label text
- Feed content type stored as a strict enum: experience / ranking / ad / editorial
- Google Place ID stored on every Place record
- Geographic hierarchy fields on Place inherited from Google Places at creation time
- Last-touch Waypoint ID captured on every scoring-relevant engagement event
- Place total_engagement_count maintained for the discovery bonus multiplier calculation
- Experience comparison_score maintained and updated on each new comparison submission
- All tables include created_at
- Row Level Security enabled on every table
- Full field-by-field schema with precise data types is a dedicated, separate build task
