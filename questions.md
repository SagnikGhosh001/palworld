# Creaturebound — Project Architecture & Requirements Clarification

This file contains the foundational architectural and design questions formulated from [Creaturebound_Pal_Battle_System_Specification.md](file:///Users/sagnikghosh/workspace/js/palworld/Creaturebound_Pal_Battle_System_Specification.md) and [Creaturebound_Game_Design_and_Incremental_Build_Plan.md](file:///Users/sagnikghosh/workspace/js/palworld/Creaturebound_Game_Design_and_Incremental_Build_Plan.md).

Your answers will be recorded here to serve as the project baseline before proceeding with implementation.

---

## 1. Tech Stack & Dependency Versions
- **Context:** The system has Node v26.3.1 and npm 11.16.0. The design specification calls for React, Vite, Three.js, React Three Fiber (R3F), Drei, Rapier physics, Zustand, and Vitest. In modern React ecosystems, React 19 sometimes has peer dependency conflicts with certain versions of `@react-three/fiber` and `@react-three/rapier`.
- **Question:** Should we lock React to version 18 (e.g. React 18.3.x) with compatible R3F/Rapier versions for maximum ecosystem stability, or would you prefer React 19 with overrides/flags if needed?
- **Recommendation:** React 18.3 + Three.js 0.170+ + R3F v8 + @react-three/drei + @react-three/rapier for rock-solid stability and zero peer-dependency collisions.
- **Answer:** User selected: *"use whatever you think is best and compatible according to our need because we are building game also 3d view and experience is needed"*.
  - **Resolution:** Adopt **React 18.3 + Three.js 0.170+ + React Three Fiber v8 + @react-three/drei + @react-three/rapier + Zustand + Vitest**. This provides optimal ecosystem compatibility, proven Rapier physics integration, and zero peer-dependency breakage.

---

## 2. Simulation & Architecture Model (ECS / Decoupled Engine vs Pure React Scene)
- **Context:** Section 15.2 of the build plan states: *"Rendering is not the source of truth for game rules. Game simulation should be separable from React UI. Avoid putting high-frequency simulation state into React component state."* Furthermore, the Battle System specification requires modular combat logic (`CombatSystem`, `CombatAI`, `DamageResolver`, `TargetingSystem`) that can run and be unit-tested without rendering a 3D scene.
- **Question:** Do you prefer:
  - **Option A (Recommended):** A headless TypeScript game engine (core loop, ECS/system managers, physics, state stores) where Three.js/R3F acts purely as the presentation layer and React handles overlay UI/HUD.
  - **Option B:** A more standard idiomatic R3F component-driven scene graph where entities and behaviors live primarily inside React component hooks (`useFrame`).
- **Answer:** User selected: *"whatever is best for game"*.
  - **Resolution:** Adopt **Option A: Decoupled Headless Simulation Core**. Systems (Combat, Creature AI, Movement, Damage, Inventory) will run independently with deterministic tick updates and zero React re-render overhead in the physics/simulation loop. Three.js / R3F renders the scene reactively, and React handles HUD/Menus. All gameplay mechanics are 100% unit-testable without a browser or WebGL canvas.

---

## 3. Scope & Phasing Priority: Incremental Roadmap vs Combat-First
- **Context:** `Creaturebound_Game_Design_and_Incremental_Build_Plan.md` lays out an 18-phase roadmap starting from Phase 0 (Audit & Foundation), Phase 1 (Third-person movement), Phase 2 (Verdant Reach Greybox), Phase 3 (Creature AI), up to Phase 6 (Combat slice) and beyond. `Creaturebound_Pal_Battle_System_Specification.md` details deep real-time creature companion combat with autonomous AI, commands, signature abilities, and capture.
- **Question:** Should we strictly follow the sequential order starting with **Phase 0 (Foundation & Audit)** and progress one phase at a time with verification and your approval after each phase?
- **Recommendation:** Yes, proceed strictly phase-by-phase starting with Phase 0, but design the Phase 0/3 data schemas to already anticipate the combat contracts defined in the Pal Battle Spec.
- **Answer:** User selected: *(Recommended) Strict Sequential Phasing: Phase 0 foundation first, test & verify, get your approval before moving to Phase 1, keeping each slice playable.*
  - **Resolution:** We will strictly build and verify one phase at a time starting with **Phase 0**, run automated tests/type checks, log results in `docs/BUILD_LOG.md`, and obtain your explicit review and sign-off before proceeding to the subsequent phase.

---

## 4. Visual & 3D Asset Strategy for Early Phases
- **Context:** The repository currently has no 3D asset files (.glb, .gltf, audio, textures). The spec mandates original designs (no Pokémon or Palworld IP rip-offs) and permits stylized/procedural placeholder representations for the 6 starter species (Mosskin, Cindercub, Pebblit, Ripplefin, Voltkit, Glimmerowl).
- **Question:** How would you like 3D models and visuals handled for Phase 0–Phase 5?
  - **Option A (Recommended):** Programmatic procedural stylized geometry (distinctive compound Three.js meshes with expressive shapes, palettes, and animations) created in code so the game is immediately visually distinguishable and playable without external asset downloads.
  - **Option B:** External free/permissive CC0 low-poly GLTF models downloaded/placed into `public/assets/`.
  - **Option C:** You will provide custom 3D model assets as we go.
- **Answer:** User selected: *(Recommended) Option A: Programmatic Procedural Stylized Geometry (Expressive compound Three.js meshes with distinctive silhouettes and palettes created directly in code; zero external download dependencies).*
  - **Resolution:** All starter creatures, characters, environmental props, structures, and tools will be procedurally authored with stylized geometric silhouettes and color-coded materials directly in TypeScript/Three.js. This avoids broken asset links or bloated downloads while giving each creature (e.g. Mosskin, Cindercub, etc.) an immediate recognizable silhouette.

---

## 5. Repository & Version Control Initialization
- **Context:** The directory currently is not a Git repository.
- **Question:** Should we initialize a local Git repository (`git init`) during Phase 0 with a robust `.gitignore` (for node_modules, dist, .DS_Store, etc.) and commit milestone phases?
- **Recommendation:** Yes, initialize Git and commit at the completion of each verified phase.
- **Answer:** User selected: *(Recommended) Yes: Initialize Git, add a comprehensive .gitignore, and make clean milestone commits per completed phase.*
  - **Resolution:** Initialize a local git repository in Phase 0 with `.gitignore` configured for Vite, node_modules, dist, and OS artifacts. Create clean commits after each verified phase increment.

---

## 6. Persistence Mechanism for Save/Load
- **Context:** The plan calls for versioned save/load schemas (Zod-validated) supporting player position, inventory, captured companions, settlement structures, and map fog of war.
- **Question:** Should we target **IndexedDB** (via `idb-keyval` or native) for large world & entity saves, or standard **localStorage** for early phases?
- **Recommendation:** IndexedDB with an abstracted storage interface (falls back cleanly, handles larger payloads without quota limits).
- **Answer:** User selected: *(Recommended) IndexedDB with an abstracted adapter (Scalable, prevents browser quota limits on large world/creature/fog-of-war states).*
  - **Resolution:** Implement an abstracted `StorageAdapter` backed by IndexedDB (with in-memory fallback for test environments). All save data will be validated via Zod schemas with versioning metadata.

---

## 7. Additional Specific Preferences or Constraints
- **Question:** Are there any specific tools, audio preferences (e.g. Web Audio API synthesized sounds vs placeholder audio files), testing tools, or custom game mechanics you want to mandate right from Phase 0?
- **Answer:** User selected: *(Recommended) Procedural Web Audio API sound generator (Zero-asset audio synthesis for hits, footsteps, jumps, and UI chimes) + Vitest unit testing.*
  - **Resolution:** Build a lightweight procedural Web Audio API sound synthesizer module (zero external audio dependencies, fast, responsive) for UI clicks, jump/footstep impacts, attacks, and capture cues. Vitest will serve as the unit and logic test harness.
