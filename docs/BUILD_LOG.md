# Project Build Log (BUILD_LOG.md)

This log records every incremental development phase, commands executed, automated test results, known issues, and next tasks.

---

## Phase 0: Repository Audit and Technical Foundation
- **Date:** 2026-11-10
- **Status:** Complete (Verified)
- **Increment Goal:** Establish clean project foundation (Vite + React 18 + Three.js + R3F + Rapier + Vitest + Zustand), decoupled simulation architecture, canvas error boundary, and automated verification pipeline.
- **Completed Tasks:**
  - [x] Initialized Git repository and set up remote `origin` (`git@github.com:SagnikGhosh001/palworld.git`).
  - [x] Answered foundational questions and established single source of truth in `questions.md`.
  - [x] Added production-grade `.gitignore` covering dependencies, build artifacts, environments, and OS files.
  - [x] Created `package.json` with locked React 18.3, Three.js 0.170, R3F v8, Drei, Rapier, Zustand, and Vitest.
  - [x] Configured `tsconfig.json` (strict TypeScript, path aliases `@/*`).
  - [x] Configured `vite.config.ts` (React plugin, path aliases, Happy-DOM test runner).
  - [x] Initialized architectural decisions in `docs/DECISIONS.md`.
  - [x] Implemented decoupled simulation core in `src/game/core/GameLoop.ts` (headless fixed-timestep runner).
  - [x] Implemented pub/sub decoupled event system in `src/game/core/EventBus.ts`.
  - [x] Implemented zero-dependency audio synthesizer in `src/game/audio/AudioSynthesizer.ts` (Web Audio API).
  - [x] Implemented simulation crash recovery in `src/app/ErrorBoundary.tsx`.
  - [x] Implemented 3D test canvas with lighting, ground grid, and procedural animated mesh in `src/game/GameCanvas.tsx`.
  - [x] Built application shell with HUD overlay and performance readout in `src/app/App.tsx`.
  - [x] Added automated unit tests in `src/tests/` (GameLoop, EventBus, AudioSynthesizer).
- **Commands Run & Verified:**
  - `npm install` -> 200 packages installed with zero peer-dep conflicts.
  - `npm run typecheck` (`tsc --noEmit`) -> Passed with 0 errors.
  - `npm test` (`vitest run`) -> 3 test suites, 7 tests passed.
  - `npm run build` (`tsc --noEmit && vite build`) -> Production bundle generated in 1.19s without errors.
- **Known Issues:** None.
- **Next Recommended Task:** Proceed to **Phase 1: Third-person movement prototype**.

---

## Phase 1: Third-Person Movement Prototype
- **Date:** 2026-11-10
- **Status:** Complete (Verified)
- **Increment Goal:** Implement responsive third-person adventurer character controller, procedural 3D model with walk/run bobbing, follow camera with mouse yaw/pitch orbit, ground collision, sprint & stamina system, and HUD telemetry.
- **Completed Tasks:**
  - [x] Defined player types and stats in `src/game/player/player.types.ts`.
  - [x] Implemented decoupled keyboard & mouse input handling in `src/game/player/InputManager.ts`.
  - [x] Implemented deterministic kinematics in `src/game/player/PlayerKinematics.ts` (normalized planar movement, camera-relative angle conversion, smooth rotation, gravity, jump impulses, stamina drain and recovery).
  - [x] Built global reactive player store in `src/game/player/usePlayerStore.ts`.
  - [x] Built stylized procedural 3D Adventurer character in `src/game/player/PlayerCharacter.tsx` (tunic, belt, explorer hat, rucksack with bedroll, glowing visor, and speed-adaptive limb swing & bob animations).
  - [x] Implemented third-person follow camera in `src/game/player/ThirdPersonCamera.tsx` (smooth position damping, pitch clamping, ground clearance preservation, mouse drag/look orbit).
  - [x] Created `src/game/player/PlayerController.ts` linking kinematics to headless `GameLoop`, triggering procedural jump/landing and footstep audio.
  - [x] Updated `src/game/GameCanvas.tsx` with explorable terrain floor, grid, decorative boulders, and pine trees.
  - [x] Updated HUD in `src/app/App.tsx` with live coordinates, velocity, movement state tags, animated stamina bar, and control hints.
  - [x] Added unit test suite in `src/tests/PlayerKinematics.test.ts` (6 tests covering idle, camera-relative vectoring, diagonal normalization, sprint stamina drain, jump & gravity landing, stamina recovery).
- **Commands Run & Verified:**
  - `npm run typecheck` (`tsc --noEmit`) -> Passed with 0 errors.
  - `npm test` (`vitest run`) -> 4 test suites, 13 tests passed in 325ms.
  - `npm run build` (`tsc --noEmit && vite build`) -> Production bundle built in 655ms with 0 errors.
- **Known Issues:** None.
- **Next Recommended Task:** Proceed to **Phase 2: First explorable environment**.

---

## Phase 2: First Explorable Environment (Verdant Reach Greybox)
- **Date:** 2026-11-10
- **Status:** Complete (Verified)
- **Increment Goal:** Construct Verdant Reach starter environment with continuous heightfield terrain, tranquil pond water plane, POI landmarks, atmospheric sky dome with drifting clouds, real-time minimap with player heading, and fog-of-war discovery system.
- **Completed Tasks:**
  - [x] Defined continuous heightfield mathematical function `getTerrainHeight(x, z)` and landmarks in `src/game/world/terrain/TerrainData.ts`.
  - [x] Implemented contoured terrain with vertex color elevation gradients (sand, lush grass, dark grass, slate rock) and animated water surface in `src/game/world/terrain/VerdantTerrain.tsx`.
  - [x] Placed regional landmarks in `src/game/world/landmarks/VerdantLandmarks.tsx` (Ancient Waystone, Elder Pine Grove, Stepping Stones, Whispering Ridge slate crag, and circling perimeter mountain wall).
  - [x] Created atmospheric sky with sun lighting, ambient daylight, and procedural drifting clouds in `src/game/world/sky/StylizedSky.tsx`.
  - [x] Built grid-based fog-of-war engine with landmark detection and serialization in `src/game/world/fog/FogOfWarSystem.ts`.
  - [x] Built circular HUD minimap radar in `src/ui/minimap/Minimap.tsx` featuring live shroud clearing, landmark icons, player heading pointer, cardinal directions, exploration percentage, and 'M' zoom toggle.
  - [x] Integrated heightfield collision in `src/game/player/PlayerKinematics.ts` (terrain clamping, water wading speed reduction, and world boundary limits).
  - [x] Added unit test suites `src/tests/TerrainData.test.ts` (6 tests) and `src/tests/FogOfWar.test.ts` (4 tests).
- **Commands Run & Verified:**
  - `npm run typecheck` (`tsc --noEmit`) -> Passed with 0 errors.
  - `npm test` (`vitest run`) -> 7 test suites, 26 tests passed in 348ms.
  - `npm run build` (`tsc --noEmit && vite build`) -> Production bundle built in 643ms without errors.
- **Known Issues:** None.
- **Next Recommended Task:** Proceed to **Phase 3: Creature foundation**.

---

## Phase 3: Creature Foundation
- **Date:** 2026-11-10
- **Status:** Complete (Verified)
- **Increment Goal:** Establish creature foundation with complete data contracts, 6 original starter species, habitat spawn zones with population caps, autonomous creature AI state machine (`IDLE`, `WANDER`, `INVESTIGATE`, `FLEE`, `RETURN`), procedural 3D creature models with animations, target HUD, and creature field journal.
- **Completed Tasks:**
  - [x] Defined typed creature contracts in `src/game/creatures/creature.types.ts` (elements, rarity, temperaments, base stats, work skills, signature abilities, AI states).
  - [x] Implemented data-driven starter species registry in `src/game/content/creatures/speciesRegistry.ts` (Mosskin, Cindercub, Pebblit, Ripplefin, Voltkit, Glimmerowl) and 6 regional spawn zones.
  - [x] Developed headless creature AI state machine in `src/game/creatures/ai/CreatureAI.ts` with temperament behaviors (curious investigation, passive fleeing, territory bounding, terrain-clamped wandering).
  - [x] Built habitat spawner in `src/game/creatures/CreatureSpawner.ts` enforcing zone population caps and randomized levels.
  - [x] Created stylized compound procedural 3D meshes for all 6 species in `src/game/creatures/procedural/CreatureMesh.tsx` with speed-adaptive walking swings and breathing animations.
  - [x] Built reactive creature cluster in `src/game/creatures/CreatureWorld.tsx` with proximity auto-discovery and distance-based targeting.
  - [x] Built `src/ui/hud/TargetHUD.tsx` displaying name, level, element badge, distance, health bar, and AI state of targeted wild creatures.
  - [x] Built `src/ui/journal/CreatureJournalModal.tsx` (`J` hotkey) displaying discovered vs unknown species, lore, habitats, base stats, and signature abilities.
  - [x] Added automated unit test suites: `SpeciesRegistry.test.ts` (3 tests), `CreatureAI.test.ts` (4 tests), and `CreatureSpawner.test.ts` (2 tests).
- **Commands Run & Verified:**
  - `npm run typecheck` (`tsc --noEmit`) -> Passed with 0 errors.
  - `npm test` (`vitest run`) -> 10 test suites, 37 tests passed in 403ms.
  - `npm run build` (`tsc --noEmit && vite build`) -> Production bundle built in 755ms with 0 errors.
- **Known Issues:** None.
- **Next Recommended Task:** Proceed to **Phase 4: Catching and collection**.

---

## Phase 4: Catching and Collection
- **Date:** 2026-11-11
- **Status:** Complete (Verified)
- **Increment Goal:** Implement complete creature capture mechanic and collection system: craftable capsule tiers, parabolic throw trajectory, 3-stage suspenseful shake animation sequence, IndexedDB-backed creature storage, active party management (max 5), and field Capture HUD.
- **Completed Tasks:**
  - [x] Defined capture types in `src/game/capture/capture.types.ts` (capsule tiers, capture states, owned creature models, active projectiles).
  - [x] Implemented data-driven capture formula in `src/game/capture/CaptureFormula.ts` (factors in health ratio, species rarity, device tier multiplier, level difference, clamped to [5%, 98%]).
  - [x] Built `src/game/capture/usePartyStore.ts` managing active party (up to 5 companions), unlimited storage box, capsule inventory, and IndexedDB (`idb-keyval`) persistence.
  - [x] Created `src/game/capture/CaptureSystem.ts` managing parabolic flight trajectory, 3-stage wobble shake suspense, despawning captured wild creatures, and audio chimes.
  - [x] Created 3D capsule mesh with glowing latch button and wobbling shake animations in `src/game/capture/CaptureProjectileMesh.tsx`.
  - [x] Built in-encounter `src/ui/hud/CaptureHUD.tsx` with capsule tier selector (keys 1/2/3), real-time catch probability %, and [R] throw trigger.
  - [x] Built `src/ui/party/PartyHUD.tsx` and `src/ui/party/PartyManagementModal.tsx` (`Tab` hotkey) allowing renaming nicknames, moving between active party and storage, and releasing to wild.
  - [x] Added automated unit test suites: `CaptureFormula.test.ts` (5 tests) and `PartyStore.test.ts` (5 tests).
- **Commands Run & Verified:**
  - `npm run typecheck` (`tsc --noEmit`) -> Passed with 0 errors.
  - `npm test` (`vitest run`) -> 12 test suites, 47 tests passed in 455ms.
  - `npm run build` (`tsc --noEmit && vite build`) -> Production bundle built in 829ms with 0 errors.
- **Known Issues:** None.
- **Next Recommended Task:** Proceed to **Phase 5: Companion behaviour** (summon and recall active party companions into 3D world with [F], intelligent follow kinematics with obstacle navigation and teleport catch-up, companion command wheel [Q] for Aggressive / Defensive / Passive / Stay / Follow modes, and companion HUD status).
