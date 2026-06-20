# Wayfinders — Full Data Model

Companion file to CLAUDE.md. Read this explicitly whenever building or modifying
the database schema, writing migrations, or working on any feature whose
correctness depends on exact table structure.

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

Both badge types feed a **single unified badge shelf on the creator profile** — they are
rendered together, not in separate sections. The two types may be visually differentiated
(distinct shape, colour, or label), but they are highly related elements and the profile
treats them as one cohesive collection. Any API or UI work fetching badges should query
both tables and merge the results before rendering.

**`first_waypoint_badges`**
id, place_id, waypoint_id, creator_id, awarded_at
One record per Place — awarded automatically on first Waypoint upload at that Place.
Anchored to a Place. Cannot be reassigned or revoked.

**`creator_badges`** — exceptional badge assignments
id, creator_id, experience_id, assigned_at, reassigned_at (nullable)
Allocation count lives on profiles (total_badges_allocated). One active assignment
record per badge owned. Anchored to an Experience. Freely and repeatedly reassignable.

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
