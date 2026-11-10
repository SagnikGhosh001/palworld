# Creaturebound --- Open-World Creature Companion Survival Game

## Game Design Document, Technical Plan, and Incremental Build Instructions

**Document purpose:** This is the single source of truth for building
the complete game incrementally with an AI coding agent.\
**Working title:** Creaturebound (replaceable)\
**Target:** Browser-based 3D game, desktop-first, single-player first\
**Genre:** Open-world exploration, creature collection, action combat,
survival, crafting, and settlement building\
**Design inspiration:** The broad appeal of creature-companion survival
games such as Palworld and creature-collection adventures. All
creatures, names, art, lore, locations, and other expressive content
must be original.

------------------------------------------------------------------------

# 1. Instructions to the AI coding agent

You are the lead game designer, technical architect, gameplay
programmer, tools engineer, and QA engineer for this project.

Your task is to build the **entire playable game described in this
document**, but you MUST do so incrementally. Do not attempt to
implement the whole game in one response, one patch, or one coding
session.

## 1.1 Non-negotiable working rules

1.  **Inspect before changing.** First inspect the repository, existing
    code, package manager, scripts, assets, and current git status. Do
    not overwrite a working project or replace existing architecture
    without explaining why.
2.  **Plan before each phase.** Before coding a phase, state its goal,
    files likely to change, dependencies, acceptance criteria, and
    risks.
3.  **Build one vertical slice at a time.** Each phase must leave the
    project in a runnable state. Prefer a small end-to-end feature over
    disconnected scaffolding.
4.  **Do not fake completion.** A button, menu, creature, building, or
    system is not complete merely because it renders. Its core
    interaction must work.
5.  **No giant placeholder implementation.** Do not create one enormous
    file, hard-code the whole game into a single component, or build all
    systems as temporary mocks.
6.  **Keep architecture modular.** Separate rendering, simulation,
    gameplay rules, content data, UI, persistence, and input.
7.  **Use data-driven content.** Creatures, items, recipes, structures,
    biomes, spawn rules, and abilities should be defined as data
    wherever practical.
8.  **Test every increment.** Run type checks, lint, tests, and a
    production build when available. Add focused tests for gameplay
    rules.
9.  **Preserve performance.** Profile before adding complexity. Avoid
    unnecessary React re-renders in the render loop. Use instancing,
    spatial partitioning, level of detail, and bounded simulation where
    appropriate.
10. **No unverified APIs.** Check the installed library version and its
    documentation before relying on an API. Do not invent package
    methods.
11. **No copyrighted franchise assets.** Do not use Pokémon names,
    character designs, logos, sounds, music, models, or ripped Palworld
    assets. Create an original universe and original creatures.
12. **Be honest about limitations.** If a feature is too large for the
    current increment, implement a clearly scoped foundation and record
    the remaining work.
13. **Keep a project journal.** Maintain `docs/BUILD_LOG.md` with
    completed work, commands run, test results, known issues, and the
    next recommended task.
14. **Keep this document current.** If a decision changes, update the
    relevant section and `docs/DECISIONS.md`. Do not silently drift from
    the design.
15. **Do not stop after the first playable prototype.** Continue phase
    by phase until all required systems in this document are
    implemented, tested, integrated, and polished.

## 1.2 Required response format for every build increment

At the start of each increment, provide:

-   **Current state:** What exists and what works.
-   **Increment goal:** One clear outcome.
-   **Implementation plan:** Ordered tasks and files/modules involved.
-   **Acceptance criteria:** Observable conditions that prove
    completion.
-   **Risks and trade-offs:** Especially performance and architecture
    risks.

After implementation, report:

-   What changed.
-   How to run it.
-   Tests and commands executed, with actual outcomes.
-   Known bugs or incomplete details.
-   What is next.

Do not claim a test passed unless it was actually run and passed.

## 1.3 Phase completion protocol

A phase is complete only when: - Its acceptance criteria are met. - The
game starts from a clean install using documented commands. - No
critical console errors remain. - Type checking and production build
pass. - Relevant automated tests pass. - The feature works in the
browser through its intended user flow. - The build log and this
document are updated.

If something cannot be completed, mark it **PARTIAL**, explain why, and
do not begin dependent work that assumes it is finished.

------------------------------------------------------------------------

# 2. Game vision

## 2.1 High concept

The player arrives in an unexplored world inhabited by strange,
intelligent creatures. They explore wild regions, discover and befriend
creatures, capture them using crafted containment devices, train them,
and take them on adventures.

Creatures are not just collectibles. They are active companions that can
fight, gather resources, farm, craft, transport the player, and help
construct a home. The player gradually develops a small camp into a
thriving settlement while exploring increasingly dangerous regions.

## 2.2 Core player fantasy

-   Explore a beautiful, mysterious world at your own pace.
-   Discover creatures with distinct silhouettes, behaviours, habitats,
    and abilities.
-   Build a meaningful bond with a team of companions.
-   Fight alongside companions in real-time combat.
-   Turn a basic camp into a functioning home and settlement.
-   Use creature abilities to unlock new ways to explore and build.
-   Discover rare creatures, hidden locations, dungeons, and world
    secrets.

## 2.3 Design pillars

1.  **Exploration is rewarding:** Curiosity should reveal resources,
    creatures, landmarks, secrets, and stories.
2.  **Creatures feel alive:** They should move, rest, eat, react, flee,
    defend themselves, and interact with the environment.
3.  **Companions are useful:** Each creature should have meaningful
    combat, traversal, or work roles.
4.  **Progression unlocks possibilities:** New tools, recipes,
    abilities, regions, and structures expand what the player can do.
5.  **Building creates ownership:** The player's settlement should
    visibly grow and become more capable.
6.  **A playable game before a huge game:** A small polished world comes
    before a vast empty world.

## 2.4 Scope boundaries

### First complete release

-   Single-player.
-   Desktop browser.
-   Third-person 3D.
-   One coherent world with several connected biomes.
-   Original creatures and content.
-   Local save/load.
-   Combat, catching, companions, crafting, building, and creature jobs.

### Explicitly deferred

-   Online multiplayer and shared servers.
-   PvP.
-   Trading between players.
-   Large-scale procedural continent generation.
-   Mobile controls and mobile performance certification.
-   Complex breeding genetics.
-   Voice acting and cinematic narrative.
-   Monetization and live-service features.

Do not let deferred features delay the single-player game.

------------------------------------------------------------------------

# 3. Player experience and core gameplay loop

The main loop is:

1.  Leave the base and explore.
2.  Find creatures, resources, landmarks, and points of interest.
3.  Gather resources and fight or avoid threats.
4.  Weaken and capture suitable wild creatures.
5.  Return to base, heal, feed, store, craft, and assign companions.
6.  Upgrade equipment, tools, structures, and creature abilities.
7.  Explore a more dangerous area.
8.  Repeat with new goals and discoveries.

## 3.1 Session goals

A short play session should offer useful activities: - Find a new
creature. - Gather enough material for one upgrade. - Complete a small
exploration objective. - Improve a companion. - Build or upgrade one
structure.

Longer sessions should support: - Exploring a new biome. - Defeating a
regional boss. - Expanding the settlement. - Completing a dungeon. -
Unlocking a traversal ability.

------------------------------------------------------------------------

# 4. World design

## 4.1 World structure

Create one connected world divided into handcrafted or hand-authored
regions. Use procedural decoration and spawn variation, not fully random
terrain that makes navigation incoherent.

Initial world target: - One central beginner region. - Three additional
unlockable regions. - One small cave or dungeon. - One boss arena. - One
player settlement area. - Clear landmarks visible from a distance.

The initial map should be compact enough to traverse and test. Expand
only after the first region is fun.

## 4.2 Initial biomes

### A. Verdant Reach --- beginner region

-   Meadows, gentle hills, forest edges, streams, small ponds.
-   Common Nature, Earth, and Water creatures.
-   Basic wood, stone, berries, and medicinal plants.
-   Safe starting area with low-level threats.

### B. Emberfall Basin

-   Dry grassland, red rock, volcanic vents, hot springs.
-   Fire and Earth creatures.
-   Ore, charcoal, heat-resistant resources.
-   Environmental heat challenge introduced later.

### C. Frostveil Highlands

-   Snowfields, pine forest, cliffs, frozen lakes, ice caves.
-   Ice and Wind creatures.
-   Rare minerals and cold-region materials.
-   Cold exposure introduced later.

### D. Moonfen Wilds

-   Wetlands, glowing plants, misty groves, ancient ruins.
-   Nature, Water, and unusual rare creatures.
-   Herbs, rare crafting ingredients, hidden lore.
-   More dangerous night encounters.

## 4.3 World systems

Implement in this order: 1. Terrain and collision. 2. Player movement
and camera. 3. Landmarks and navigation. 4. Resource nodes. 5. Creature
spawn regions. 6. Day/night cycle and lighting. 7. Weather variation. 8.
Environmental hazards. 9. Region unlock conditions. 10. Dungeons and
boss arenas.

## 4.4 Exploration and map

-   Map starts mostly obscured by fog of war.
-   Nearby terrain is revealed as the player explores.
-   Discovered landmarks remain visible.
-   Add player position, base marker, discovered points of interest, and
    creature habitat hints.
-   Add a compass or simple directional indicator.
-   Do not reveal exact rare-creature locations by default.
-   Map and world state must be saved.

------------------------------------------------------------------------

# 5. Creature design

## 5.1 Creature identity

Every creature must have: - Unique original name and visual
silhouette. - Species ID and descriptive entry. - Element or affinity. -
Rarity. - Habitat and spawn conditions. - Base stats. - Temperament and
behaviour profile. - Combat abilities. - Work capabilities, where
appropriate. - Traversal capability, where appropriate. - Animation
set. - Sound identity, if available. - Growth and progression rules.

## 5.2 Initial elements

Start with six elements: - Nature - Fire - Water - Earth - Electric -
Frost

Element interactions should be understandable and data-driven. Begin
with a simple advantage/disadvantage table. Avoid complicated
multipliers until combat is enjoyable.

## 5.3 Rarity

Use: - Common - Uncommon - Rare - Epic - Legendary

Rarity affects spawn probability, visual variants, and potential stat
ranges. Rarity must not be the only measure of usefulness: a common
creature can remain valuable because of its specialised work ability.

## 5.4 Initial creature roster

Create at least six original starter species, with placeholder art only
during early development. Replace placeholders with original models
before the content-polish phase.

Suggested concepts: 1. **Mosskin:** Small Nature creature; friendly;
gathers berries and plants seeds. 2. **Cindercub:** Small Fire creature;
curious; can ignite a furnace. 3. **Pebblit:** Small Earth creature;
stubborn; mines stone. 4. **Ripplefin:** Small Water creature; playful;
waters crops. 5. **Voltkit:** Small Electric creature; energetic; powers
simple devices. 6. **Glimmerowl:** Wind/Nature-inspired flying creature;
cautious; later enables limited gliding or aerial travel.

Names are working names and can be changed. Do not imitate existing
franchise creature designs.

## 5.5 Creature needs and state

A creature may have: - Health - Stamina - Hunger - Mood -
Bond/affection - Level - Experience - Current task - Current target -
Current state - Assigned home or work station

Needs should create light management, not tedious micromanagement.
Creatures should not die permanently from ordinary hunger in the initial
release. Provide clear warnings and forgiving recovery.

## 5.6 Creature AI state machine

Use explicit states such as: - Idle - Wander - FollowPlayer -
ReturnHome - SeekFood - Rest - Work - Investigate - Flee - Defend -
Attack - Stunned - Captured/Owned

State transitions must be deterministic enough to debug. Use utility
scoring or simple rules only where useful. Avoid running expensive
decision logic every frame; stagger updates.

## 5.7 Creature progression

-   Creatures gain XP from combat, exploration, and work.
-   Level-ups improve stats and may unlock abilities.
-   Use a small ability set per species.
-   Add equipment or passive traits only after core leveling works.
-   Evolution or advanced forms are optional post-release scope, not a
    blocker.

------------------------------------------------------------------------

# 6. Discovering, befriending, and capturing creatures

## 6.1 Discovery

Wild creatures spawn according to: - Biome. - Time of day. - Weather. -
Rarity. - Local population cap. - Player progression. - Optional event
conditions.

Use spawn zones and weighted tables. Avoid spawning creatures directly
in the player's view or inside solid geometry.

## 6.2 Capture flow

1.  Player targets a wild creature.
2.  UI shows species name, level, health, and capture estimate.
3.  Player weakens it or uses a calming/befriending item.
4.  Player throws or activates a capture device.
5.  A short capture animation and outcome play.
6.  On success, creature enters collection storage.
7.  On failure, creature reacts and combat or escape continues.

Capture probability should be based on: - Current health ratio. -
Creature rarity. - Capture device quality. - Status effects. - Optional
species-specific modifiers.

Show an understandable estimate or feedback. Avoid making capture feel
arbitrary.

## 6.3 Capture devices

Initial tiers: - Basic Capsule - Reinforced Capsule - Advanced Capsule

Each tier requires different materials and improves capture odds. Use
original names and designs.

## 6.4 Collection management

-   Collection screen with species, level, rarity, element, and status.
-   Party capacity: five active companions initially.
-   Storage capacity: expandable.
-   Player can add/remove active companions at base.
-   Prevent accidental deletion or release with confirmation.
-   Show owned, discovered, and unknown species in a creature journal.

------------------------------------------------------------------------

# 7. Companion system

Companions should: - Follow the player at a comfortable distance. -
Avoid obstructing the camera and player path. - Teleport or catch up
only when safely out of sight and stuck, with a graceful effect. - React
to nearby threats. - Assist in combat when commanded or configured. -
Return to a passive state when combat ends. - Be recalled and
summoned. - Have clear health and status indicators.

Commands: - Follow - Stay - Return - Assist - Passive

Do not make companions attack everything automatically. Provide player
control over aggression.

------------------------------------------------------------------------

# 8. Combat

## 8.1 Combat philosophy

Use real-time action combat. The player participates directly while a
selected companion fights alongside them.

## 8.2 Player combat

Initial actions: - Basic melee attack. - Dodge or short evade. -
Aim/throw capture device. - Use a simple ranged tool or projectile. -
Interact. - Switch active companion.

Keep controls responsive and readable. Add cooldowns and hit feedback.

## 8.3 Companion combat

-   Basic attack.
-   One signature ability per creature in the first release.
-   Target selection based on player target or nearby threat.
-   Cooldowns and stamina constraints.
-   Clear telegraphs for strong enemy attacks.

## 8.4 Wild creature behaviour

Wild creatures may: - Wander. - Ignore the player. - Investigate. -
Flee. - Defend territory. - Attack if threatened. - Protect nearby
members of their group.

Not every creature should be hostile.

## 8.5 Bosses

First complete release should include one regional boss: - Distinct
arena. - Readable attack patterns. - Multiple attack types. - Clear
telegraphs. - Reward drop. - Repeatable encounter with balanced rewards.

------------------------------------------------------------------------

# 9. Survival and resources

Start with lightweight survival: - Player health. - Player stamina. -
Food and healing items. - Basic resource gathering.

Add hunger, temperature, and weather exposure only after the core
exploration loop is stable.

## 9.1 Resource types

Initial resources: - Wood - Stone - Fibre - Berries - Medicinal herbs -
Ore - Coal/charcoal - Creature essence or another original rare crafting
material

## 9.2 Gathering

-   Trees provide wood.
-   Rocks provide stone.
-   Ore nodes provide ore.
-   Plants provide fibre, food, and herbs.
-   Creature drops are contextual and not excessively grindy.

Resource nodes should have health or a simple interaction duration,
respawn rules, and visual feedback.

------------------------------------------------------------------------

# 10. Base building and settlement

## 10.1 Building philosophy

Allow free placement within a valid build area, with optional
snap-to-grid. Placement should feel understandable and forgiving.

## 10.2 Initial structures

1.  Campfire --- basic cooking and warmth.
2.  Storage Chest --- stores resources and items.
3.  Small House --- player shelter and spawn point.
4.  Creature Bed --- allows companions to rest.
5.  Workbench --- crafts basic tools and capture devices.
6.  Farm Plot --- grows food.
7.  Furnace --- smelts ore, assisted by Fire creatures.
8.  Defensive Wall --- protects the settlement.
9.  Gate --- controlled entrance.
10. Creature Workstation --- assigns a creature to a job.

## 10.3 Building flow

1.  Open build menu.
2.  Select structure.
3.  Preview a ghost model.
4.  Validate terrain, collision, distance, and resource requirements.
5.  Rotate and place.
6.  Deduct resources only after successful placement.
7.  Construct over time or complete immediately for early prototypes.
8.  Allow repair, upgrade, and dismantling with clear refunds.

## 10.4 Creature jobs

A creature can be assigned to a compatible station or task: - Planting
and watering. - Gathering. - Mining. - Smelting. - Crafting
assistance. - Transporting items. - Guarding.

For the first release, use a small number of well-tested jobs. Work
should visibly happen and produce a clear result.

## 10.5 Settlement simulation

-   Structures have storage and functional state.
-   Creatures assigned to work have a home/work location.
-   Jobs pause when resources or capacity are unavailable.
-   Work queues must be visible.
-   Avoid simulating every worker at full detail when far from the
    player.

------------------------------------------------------------------------

# 11. Crafting, inventory, and equipment

## 11.1 Inventory

-   Item stacks.
-   Item icons and descriptions.
-   Weight or capacity limit only if it adds value.
-   Quick-access hotbar.
-   Drag/drop or click-to-move.
-   Clear feedback when full.

## 11.2 Crafting

Recipes are data-driven and contain: - Recipe ID. - Output item and
quantity. - Required ingredients. - Crafting station. - Craft
duration. - Unlock condition.

## 11.3 Equipment progression

Initial equipment: - Basic gathering tool. - Basic melee weapon. - Basic
ranged tool. - Capture devices. - Healing/food items.

Keep equipment progression modest until the combat loop is proven.

------------------------------------------------------------------------

# 12. Progression and objectives

Use a lightweight progression system: - Player XP and level. -
Unlockable recipes. - New capture device tiers. - New structures. - New
regions. - Creature journal discoveries. - Exploration milestones. -
Boss rewards.

Provide a quest/objective tracker with short, actionable goals. The game
should not force a long linear campaign.

Initial objectives: 1. Gather wood and stone. 2. Craft a basic tool. 3.
Discover and capture a first companion. 4. Build a campfire and storage
chest. 5. Craft a better capture device. 6. Discover a second habitat.
7. Defeat the first regional boss. 8. Build a functional settlement.

------------------------------------------------------------------------

# 13. User interface and controls

## 13.1 Desktop controls

Suggested default mapping: - WASD --- move. - Mouse --- camera. - Left
click --- primary attack / confirm context action. - Right click --- aim
or secondary action. - E --- interact. - F --- summon/recall
companion. - Q --- companion command wheel. - R --- use selected capture
device. - Shift --- sprint. - Space --- jump. - Tab ---
inventory/creature collection. - M --- map. - B --- build mode. - Esc
--- pause/settings.

Controls must be remappable later. Avoid conflicting keys.

## 13.2 HUD

Show: - Player health and stamina. - Active companion portrait, health,
and level. - Current target information. - Hotbar. - Interaction
prompt. - Small objective reminder. - Contextual capture feedback.

## 13.3 Menus

-   Main menu.
-   Pause/settings.
-   Inventory.
-   Creature collection.
-   Creature journal.
-   Map.
-   Crafting.
-   Build menu.
-   Quest/objective log.
-   Save/load feedback.

UI should be readable and consistent, with minimal obstruction of the
world.

------------------------------------------------------------------------

# 14. Audio, animation, and visual feedback

Add audio and polish after systems work: - Footsteps by surface. -
Gathering sounds. - Creature vocalisations. - Combat impact and ability
sounds. - Capture success/failure sounds. - UI feedback. - Ambient biome
audio. - Day/night ambience.

Animation needs: - Idle, walk, run, turn, jump, land. - Attack, hit,
stagger, defeat. - Follow, rest, eat, work. - Capture reaction. -
Creature ability animations.

Use original or properly licensed assets. Temporary placeholders are
acceptable only during early phases and must be tracked for replacement.

------------------------------------------------------------------------

# 15. Technical architecture

## 15.1 Recommended stack

Use the following unless repository constraints justify a documented
alternative: - TypeScript. - React. - Vite. - Three.js. - React Three
Fiber for declarative scene composition. - Drei for useful R3F helpers
where appropriate. - Rapier for physics and collision. - Zustand or a
similarly lightweight store for shared game/UI state. - Zod for runtime
validation of save data and external content. - Vitest for unit tests. -
Playwright for browser smoke and interaction tests.

Check current compatibility before installing packages. Keep
dependencies lean.

## 15.2 Architectural principles

-   Rendering is not the source of truth for game rules.
-   Game simulation should be separable from React UI.
-   Avoid putting high-frequency simulation state into React component
    state.
-   Use refs, dedicated systems, or an external store for per-frame
    state.
-   Keep game rules deterministic where practical.
-   Use fixed or bounded simulation steps for physics/gameplay where
    appropriate.
-   Keep content definitions separate from behaviour implementations.
-   Use stable IDs for creatures, items, structures, and world entities.
-   Build save/load around versioned data schemas.

## 15.3 Suggested project structure

Adapt to the existing repository rather than blindly forcing this exact
layout.

``` text
src/
  app/
    App.tsx
    routes/
    providers/
  game/
    Game.tsx
    config/
    core/
      GameLoop.ts
      GameTime.ts
      EventBus.ts
      EntityRegistry.ts
    world/
      WorldScene.tsx
      terrain/
      biomes/
      weather/
      dayNight/
      navigation/
      resources/
    player/
      PlayerController.ts
      PlayerCharacter.tsx
      player.types.ts
    creatures/
      Creature.tsx
      CreatureSystem.ts
      CreatureAI.ts
      CreatureSpawner.ts
      CaptureSystem.ts
      CompanionSystem.ts
      creature.types.ts
    combat/
      CombatSystem.ts
      DamageSystem.ts
      abilities/
    building/
      BuildSystem.ts
      PlacementValidator.ts
      structures/
    crafting/
      CraftingSystem.ts
      recipes/
    inventory/
      InventorySystem.ts
      items/
    progression/
      ProgressionSystem.ts
      objectives/
    interaction/
      InteractionSystem.ts
    save/
      SaveSystem.ts
      migrations/
    content/
      creatures/
      items/
      recipes/
      biomes/
      structures/
  ui/
    hud/
    menus/
    inventory/
    creatures/
    map/
    crafting/
    building/
    settings/
  shared/
    types/
    constants/
    utils/
  tests/
docs/
  GAME_DESIGN.md
  BUILD_LOG.md
  DECISIONS.md
  PERFORMANCE.md
public/
  assets/
    models/
    textures/
    audio/
```

## 15.4 Core systems and interfaces

Define typed interfaces for: - `CreatureDefinition` -
`CreatureInstance` - `CreatureNeeds` - `CreatureState` -
`CreatureAbility` - `ItemDefinition` - `InventoryStack` -
`RecipeDefinition` - `StructureDefinition` - `BuildPlacement` -
`BiomeDefinition` - `SpawnTable` - `WorldSave` - `PlayerSave`

Use IDs and references instead of duplicating full content objects
throughout runtime state.

## 15.5 Simulation update strategy

-   Render loop: visual updates and interpolation.
-   Physics loop: physics engine stepping.
-   Gameplay systems: bounded updates at suitable frequencies.
-   Creature AI: stagger updates across frames.
-   Distant entities: reduced update frequency or simplified simulation.
-   UI: subscribe only to state it needs.
-   Persist meaningful state, not transient render details.

## 15.6 Asset strategy

-   Prefer original low-poly or stylized assets to start.
-   Use primitive geometry only for the first mechanics prototype.
-   Use placeholder models with consistent scale and pivots.
-   Keep asset licensing records.
-   Load assets asynchronously and show loading feedback.
-   Compress textures and use appropriate formats.
-   Avoid downloading random assets at runtime.

------------------------------------------------------------------------

# 16. Performance and quality targets

Initial target: - Desktop browser. - Aim for smooth 60 FPS on a
reasonable modern desktop, with graceful degradation. - Start with a
small active creature population. - Set explicit budgets for visible
creatures, draw calls, texture memory, and world objects. - Use
instanced rendering for repeated vegetation and props. - Use level of
detail and culling. - Use spatial partitioning for nearby interaction
and AI queries. - Avoid per-frame React state updates. - Dispose of
unused geometries, materials, and textures. - Profile real scenes, not
just empty startup scenes.

Do not claim performance targets are met without measuring them on
documented hardware/browser conditions.

------------------------------------------------------------------------

# 17. Save/load and reliability

The game must support: - New game. - Manual save. - Autosave at safe
checkpoints. - Load game. - Save schema version. - Migration path for
future save changes. - Graceful handling of corrupted or outdated
saves. - Player position and progression. - Inventory and equipment. -
Owned creatures and their state. - Base structures and storage. -
Discovered map areas and landmarks. - World resource state where needed.

Use browser persistence for the first single-player release. Keep
persistence behind an interface so cloud saves can be added later.

------------------------------------------------------------------------

# 18. Testing strategy

## Unit tests

Test pure gameplay rules: - Capture probability. - Element advantage. -
Damage calculations. - Inventory stacking and capacity. - Recipe
requirements. - Build placement validation. - XP and level
progression. - Save schema validation and migrations. - Spawn table
selection.

## Integration tests

Test: - Capture flow from encounter to collection. - Companion follow
and recall. - Combat damage and defeat. - Crafting from inventory. -
Building resource deduction and placement. - Creature job output. - Save
and reload consistency.

## Browser tests

Test: - App starts. - Main menu works. - New game loads. - Player can
move. - Interactions work. - Inventory and map open. - Save/reload
preserves key progress. - No critical console errors.

------------------------------------------------------------------------

# 19. Incremental implementation roadmap

**Important:** This roadmap is intentionally staged. Complete and verify
one phase before moving to the next. Do not try to generate every phase
in one go.

## Phase 0 --- Repository audit and technical foundation

Tasks: - Inspect repository and report current state. - Identify
existing stack and scripts. - Create or update project documentation. -
Establish TypeScript, lint, test, and build workflows. - Set up a
minimal game canvas and scene. - Add a loading/error boundary.

Acceptance: - Clean install works. - App starts in browser. - 3D scene
renders. - Type check and production build pass. - Build log exists.

## Phase 1 --- First-person? No: third-person movement prototype

Tasks: - Create a simple test terrain. - Implement third-person
camera. - Implement WASD movement, turning, jump, sprint. - Add ground
collision and gravity. - Add camera collision or sensible camera
obstruction handling. - Add basic animation or placeholder movement
feedback.

Acceptance: - Player moves reliably in all directions. - Camera follows
without jitter. - Player cannot fall through terrain. - Movement works
at different frame rates. - Controls are documented.

## Phase 2 --- First explorable environment

Tasks: - Create Verdant Reach greybox terrain. - Add hills, water,
trees, rocks, and landmarks. - Add collision and basic navigation
boundaries. - Add simple lighting and sky. - Add a small minimap or map
view. - Add fog-of-war discovery.

Acceptance: - Player can explore a coherent area. - Water, terrain, and
props are visually distinct. - Map position and discovery update
correctly. - Frame rate remains acceptable.

## Phase 3 --- Creature foundation

Tasks: - Define creature data model. - Create six placeholder creature
types. - Add spawn zones and population limits. - Implement idle,
wander, investigate, flee, and return behaviours. - Add basic creature
UI on targeting. - Add creature journal discovery.

Acceptance: - Different creatures spawn in appropriate habitats. -
Creatures visibly behave differently. - No runaway spawning or obvious
AI loops. - Discovery is recorded.

## Phase 4 --- Catching and collection

Tasks: - Add capture device item. - Implement targeting and capture
interaction. - Implement capture formula and feedback. - Add capture
animation/effect. - Add owned creature collection and storage. - Add
active party management.

Acceptance: - Player can discover, weaken, and capture a wild
creature. - Successful capture appears in collection. - Failed capture
has a sensible outcome. - Party limits are enforced. - Collection state
persists.

## Phase 5 --- Companion behaviour

Tasks: - Summon and recall companions. - Implement follow movement. -
Prevent companions blocking the player. - Add stay, follow, return,
assist, and passive commands. - Add companion status HUD. - Handle stuck
companions gracefully.

Acceptance: - Companion follows across the test world. - Commands work
consistently. - Companion does not constantly collide with or block the
player. - Recall and resummon work.

## Phase 6 --- Combat vertical slice

Tasks: - Add player basic attack and dodge. - Add health and damage
systems. - Add one creature attack and one signature ability. - Add wild
creature aggression and defence. - Add target selection and hit
feedback. - Add defeat and recovery behaviour.

Acceptance: - Player and companion can defeat a hostile wild creature. -
Damage and cooldowns are consistent. - Combat feedback is readable. -
Passive creatures do not attack without a reason.

## Phase 7 --- Progression and creature journal

Tasks: - Add XP and leveling. - Add stats and one unlockable ability. -
Add creature journal details. - Add discovery milestones. - Add simple
objectives.

Acceptance: - XP is awarded for intended actions. - Level-ups persist. -
Journal shows discovered and owned species correctly. - Objectives
update and complete.

## Phase 8 --- Gathering and inventory

Tasks: - Add resource nodes. - Add gathering tools and interaction. -
Add item definitions and stacks. - Add inventory UI and hotbar. - Add
resource respawn rules. - Add item pickup feedback.

Acceptance: - Player can gather and collect resources. - Inventory
stacking and limits work. - Hotbar selection works. - Resource state
behaves consistently.

## Phase 9 --- Crafting

Tasks: - Add recipe data. - Add workbench. - Add crafting UI. - Add
basic tools, food, and capture device recipes. - Add recipe unlocks.

Acceptance: - Crafting checks ingredients. - Ingredients are deducted
only on successful craft. - Output is added to inventory. - Invalid
recipes show clear feedback.

## Phase 10 --- Base building

Tasks: - Add build mode and ghost preview. - Add placement validation
and rotation. - Add campfire, chest, house, creature bed, workbench,
farm plot, furnace, and wall. - Add construction, dismantling, and
resource costs. - Save placed structures.

Acceptance: - Player can place and remove valid structures. - Invalid
placement is rejected with feedback. - Resources are not lost on failed
placement. - Structures persist after reload.

## Phase 11 --- Creature jobs and settlement simulation

Tasks: - Add compatible work skills. - Assign creatures to stations. -
Implement watering, gathering, mining, smelting, or crafting
assistance. - Add work queues and station status. - Add rest and basic
needs. - Simplify simulation for distant workers.

Acceptance: - A creature can be assigned to a compatible task. - Work
visibly progresses. - Output is stored correctly. - Work stops sensibly
when blocked. - State persists.

## Phase 12 --- More biomes and world progression

Tasks: - Add Emberfall Basin, Frostveil Highlands, and Moonfen Wilds. -
Add biome-specific resources and spawn tables. - Add region unlock
conditions. - Add environmental hazards. - Expand map and landmarks.

Acceptance: - Regions feel distinct. - New resources and creatures are
discoverable. - Region progression is clear. - World remains performant.

## Phase 13 --- Dungeon and boss

Tasks: - Build one dungeon. - Add enemy encounter rooms. - Add one boss
with telegraphed patterns. - Add rewards and unlocks. - Add
restart/retry flow.

Acceptance: - Dungeon can be completed. - Boss attacks are readable and
fair. - Rewards are granted once per intended completion. - Player can
retry.

## Phase 14 --- Day/night, weather, and atmosphere

Tasks: - Add time progression. - Add day/night lighting. - Add one or
two weather types. - Add ambient audio and surface footsteps. - Add
creature schedule changes if appropriate.

Acceptance: - Time and weather visibly affect the world. - Gameplay
remains readable at night. - Audio can be muted and volume controlled. -
State changes do not break AI or rendering.

## Phase 15 --- Save/load, settings, and game flow

Tasks: - Add main menu and pause menu. - Add new game, save, autosave,
load. - Add settings for audio, sensitivity, quality, and controls where
feasible. - Add save versioning and migration. - Test reload
consistency.

Acceptance: - Player can leave and resume the game. - Key world and
player state is restored. - Invalid saves fail gracefully. - Settings
persist.

## Phase 16 --- Art, animation, sound, and UX polish

Tasks: - Replace placeholder creatures with original models. - Improve
terrain, vegetation, structures, and VFX. - Add creature and player
animation sets. - Add sound effects and ambience. - Improve UI feedback
and accessibility. - Add onboarding/tutorial hints.

Acceptance: - No critical placeholder art remains in the core gameplay
path. - Creature identities are visually distinguishable. - Important
actions have visual/audio feedback. - New players can understand the
first objectives.

## Phase 17 --- Optimization and release candidate

Tasks: - Profile CPU, GPU, memory, draw calls, and load time. - Add LOD,
instancing, culling, and simulation throttling where required. - Test
multiple browsers and screen sizes. - Fix critical bugs. - Verify clean
install and production build. - Write controls, known limitations, and
release notes.

Acceptance: - No known blocker bugs. - Performance is measured and
documented. - Save/load and core gameplay regression tests pass. -
Production build runs. - The game is a coherent, completable
single-player experience.

------------------------------------------------------------------------

# 20. Definition of done for the complete game

The project is not complete until a new player can:

1.  Start a new game.
2.  Enter and explore the world in third person.
3.  Discover multiple original creature species.
4.  Capture wild creatures.
5.  Manage a collection and active party.
6.  Summon and command companions.
7.  Fight wild creatures and defeat a boss.
8.  Gather resources.
9.  Craft tools and capture devices.
10. Build a functional base.
11. Assign creatures to useful jobs.
12. Unlock and explore multiple biomes.
13. Complete objectives and progress.
14. Save, quit, and resume without losing key progress.

All of these must work together in one integrated game, not as isolated
demos.

------------------------------------------------------------------------

# 21. First instruction to start the project

When this document is supplied to the coding agent, do NOT immediately
implement the entire game.

Start with **Phase 0 only**.

Your first response must: 1. Inspect the repository and existing code.
2. Report the current stack, scripts, and repository structure. 3.
Identify any conflicts between the existing project and this document.
4. Propose the smallest safe Phase 0 plan. 5. Implement Phase 0 only
after the audit. 6. Run the available checks and report their actual
results. 7. Update `docs/BUILD_LOG.md` and `docs/DECISIONS.md`.

After Phase 0 is complete, stop and present the Phase 1 plan. Continue
to the next phase only after the current phase has been verified. If the
user explicitly asks to continue through multiple phases, proceed in
order while keeping each phase independently testable and preserving a
runnable game.

**Final instruction:** Build the complete game over many small, verified
increments. Never confuse a roadmap, mockup, or prototype with a
finished game. Keep the game playable after every phase.
