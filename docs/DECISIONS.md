# Architecture & Technical Decisions (DECISIONS.md)

This log documents all architectural and technical decisions made for Creaturebound.

---

## ADR-001: Core Tech Stack Selection
- **Status:** Accepted (Phase 0)
- **Decision:** Use React 18.3 + Three.js 0.170+ + React Three Fiber v8 + @react-three/drei + @react-three/rapier + Zustand + Vite + Vitest.
- **Rationale:** React 18.3 provides rock-solid ecosystem compatibility with R3F v8 and Rapier physics without React 19 peer-dependency breaks or experimental flags.
- **Reference:** [questions.md](file:///Users/sagnikghosh/workspace/js/palworld/questions.md) Section 1.

---

## ADR-002: Decoupled Headless Simulation Core
- **Status:** Accepted (Phase 0)
- **Decision:** Implement a pure TypeScript game engine core (simulation loop, AI state machines, combat resolvers, damage calculations, event bus) decoupled from rendering. Three.js / R3F acts as a presentation layer, and React provides HUD/UI overlays.
- **Rationale:** 
  1. Prevents high-frequency physics/AI state updates from triggering React component re-renders.
  2. Ensures all combat, companion AI, and survival calculations can be unit-tested headlessly in Vitest without WebGL.
  3. Fulfills Section 15.2 of the Game Design Document and Section 17 of the Pal Battle Specification.
- **Reference:** [questions.md](file:///Users/sagnikghosh/workspace/js/palworld/questions.md) Section 2.

---

## ADR-003: Procedural Stylized Geometry for Early Creatures & Assets
- **Status:** Accepted (Phase 0)
- **Decision:** Use programmatic compound Three.js meshes with distinctive silhouettes and color-coded materials for starter species (Mosskin, Cindercub, Pebblit, Ripplefin, Voltkit, Glimmerowl), player, and props.
- **Rationale:** Guarantees 100% original designs (zero copyrighted assets), zero external download dependencies, and instant visual distinguishability during early phases before custom GLTF assets are introduced.
- **Reference:** [questions.md](file:///Users/sagnikghosh/workspace/js/palworld/questions.md) Section 4.

---

## ADR-004: Version-Controlled Incremental Approval Flow
- **Status:** Accepted (Phase 0)
- **Decision:** Strictly build one vertical slice per phase, verify type checks, automated tests, and build, record in `docs/BUILD_LOG.md`, create git milestone commits, and push to origin upon approval.
- **Reference:** [questions.md](file:///Users/sagnikghosh/workspace/js/palworld/questions.md) Section 3 & 5.
