# Creaturebound --- Full Pal Battle System Specification

This document defines the intended **complete creature-versus-creature
battle experience** for Creaturebound. It is a system specification to
merge into `GAME_DESIGN.md`, not a replacement for the rest of the game
design.

## 1. Design intent

Creaturebound must have a deep, real-time, companion-driven creature
battle system inspired by the broad gameplay appeal of
creature-companion survival games. Battles must feel like creatures
fighting creatures---not like ordinary player combat with a pet cosmetic
attached.

The player explores with a team of owned Pals. Pals can independently
perceive threats, choose targets, move, attack, defend, use abilities,
react to damage, retreat when commanded, and coordinate with allies.
Wild creatures have their own AI, territorial behaviours, group
dynamics, and combat decisions. Hostile NPCs and bosses can field their
own Pals.

**Do not reduce this vision to a minimal combat demo.** The complete
target includes team battles, wild encounters, enemy Pal teams, boss
battles, capture during encounters, elemental strategy, progression,
commands, and readable combat feedback. Implement these systems
incrementally, but retain the complete design as the destination.

All creatures, names, models, sounds, animations, lore, and other
expressive content must be original. Do not use Pokémon intellectual
property or copy specific Palworld creature designs/assets.

## 2. What a battle means

A battle is a real-time encounter in which one or more allied Pals fight
one or more wild or hostile Pals. The player is present in the world and
remains an active participant.

A typical encounter:

1.  The player discovers a wild Pal or hostile group.
2.  The wild Pal may ignore the player, investigate, flee, defend its
    territory, or become hostile depending on its species, temperament,
    health, group, and context.
3.  The player can initiate combat, be detected, defend themselves, or
    attempt to avoid the encounter.
4.  The player sends out an owned Pal or has an already summoned
    companion respond according to its command mode.
5.  Allied and enemy Pals select targets, position themselves, use basic
    attacks and abilities, avoid danger where appropriate, and react to
    changing battle conditions.
6.  The player can attack, dodge, aim, issue commands, change target,
    use items, and switch the active Pal.
7.  The encounter ends when one side is defeated, retreats, is captured,
    or the player disengages.
8.  Rewards, XP, drops, capture opportunities, and world-state changes
    are resolved consistently.

A Pal must not simply stand beside the player waiting for scripted
attack animations. It must be an autonomous combat participant with
understandable decisions.

## 3. Battle actors and team composition

### 3.1 Allied side

-   The player character.
-   One active player-controlled/summoned Pal at a time as the default
    combat lead.
-   Additional allied Pals may participate through explicitly designed
    team, base-defence, quest, or multiplayer encounters.
-   The player can maintain a larger owned roster and choose a battle
    party before setting out.

The game should support multi-Pal encounters in its combat architecture
even if early balancing uses smaller groups. Do not hard-code the battle
system around exactly one allied and one enemy actor.

### 3.2 Enemy side

-   Wild Pals acting alone.
-   Wild groups with pack, family, or territorial behaviour.
-   Hostile NPCs with their own Pal companions.
-   Named elite Pals.
-   Dungeon encounter groups.
-   Regional and world bosses.

Enemy Pals must use the same core combat rules as allied Pals wherever
practical. Differences should come from AI policy, stats, abilities,
equipment, and encounter configuration---not a completely separate fake
combat system.

### 3.3 Party and roster

-   Owned Pals live in a persistent collection.
-   The player selects a field party before exploration.
-   A Pal can be active, in reserve, assigned to base work, resting, or
    unavailable due to a defined status.
-   Switching is clear and responsive, with sensible summon/recall
    rules.
-   Defeated or exhausted Pals can be recovered through the game's
    healing/rest systems.
-   Do not permanently delete a Pal because it was defeated in ordinary
    combat.

## 4. Pal combat autonomy and command system

Every combat-capable Pal needs an AI controller. It should perceive
nearby actors and threats, evaluate its current order, choose a target,
select a valid action, navigate into range, execute the action, and
react to the result.

### 4.1 Command modes

Provide clear player commands:

-   **Aggressive:** Engage valid nearby hostile targets proactively.
-   **Defensive:** Protect the player or a selected ally; attack threats
    that approach or attack.
-   **Passive:** Do not initiate attacks; defend only when directly
    threatened if the rules allow.
-   **Focus target:** Prioritise the player's selected enemy.
-   **Hold position / Stay:** Remain near a location and defend within a
    defined radius.
-   **Follow:** Stay near the player and engage only under the
    configured rules.
-   **Retreat / Return:** Stop attacking and return to the player or a
    safe position.
-   **Use ability:** Request a specific ability when available and
    valid.

Commands should be delivered through a quick command wheel or similarly
accessible interface. The player must be able to understand the Pal's
current order.

### 4.2 Autonomous decisions

A Pal AI should consider: - Current command mode. - Current target and
target threat. - Distance, line of sight, and navigation path. - Attack
and ability range. - Health and stamina. - Cooldowns. - Elemental
matchup. - Nearby allies and enemies. - Whether the target is already
being handled. - Environmental hazards. - Whether it should protect,
attack, reposition, or retreat.

Use a state machine or behaviour architecture with explicit states such
as: - Idle - Follow - Guard - AcquireTarget - Approach - MaintainRange -
BasicAttack - UseAbility - Dodge / Evade - Defend - Stagger - Retreat -
Return - Defeated

Avoid making decisions every render frame. Use bounded, staggered AI
updates and immediate event-driven reactions where necessary.

### 4.3 Target selection

-   Pals can attack the player's focused target.
-   Defensive Pals prioritise enemies threatening their protected ally.
-   Aggressive Pals can choose nearby valid threats.
-   Avoid all allied Pals mindlessly attacking different irrelevant
    targets.
-   Prevent target oscillation by using target commitment and sensible
    switching thresholds.
-   Do not attack neutral or friendly actors unless a specific game rule
    permits it.

## 5. Pal combat moves and abilities

Each Pal species must have a distinctive combat identity. A species
should not be differentiated only by colour, element, or stats.

### 5.1 Basic move set

A combat-capable Pal should have: - At least one basic attack. - A
movement/approach behaviour suited to its combat range. - A defensive or
evasive reaction where appropriate. - One or more signature abilities. -
A defeat and recovery state.

As the content roster expands, add more abilities per species. Ability
definitions should be data-driven.

### 5.2 Ability categories

Support a varied ability library: - Melee strike. - Ranged projectile. -
Area-of-effect attack. - Charge or leap. - Cone or line attack. -
Damage-over-time effect. - Shield or damage reduction. - Healing or
support. - Crowd control, slow, stagger, or knockback. - Mobility,
repositioning, or escape. - Summon or environmental interaction where
appropriate.

Each ability definition should describe: - Unique ID and display name. -
Eligible species or tags. - Targeting mode. - Range and area. - Wind-up
and recovery. - Cooldown. - Stamina or resource cost. -
Damage/healing/effect values. - Element and status effects. -
Interruptibility and crowd-control resistance. - VFX, SFX, animation,
and UI feedback references.

Abilities must have readable telegraphs and counterplay. Avoid
unavoidable, instant, invisible damage.

### 5.3 Combat roles

Species can specialise in roles such as: - Bruiser: durable close-range
fighter. - Striker: high damage, lower durability. - Ranged attacker:
maintains distance and fires projectiles. - Defender: protects allies
and draws attention. - Support: heals, shields, buffs, or controls
space. - Skirmisher: fast repositioning and hit-and-run attacks.

A Pal may combine roles. Roles are guidance for behaviour and balance,
not rigid classes.

## 6. Elemental system

Initial elements: - Nature - Fire - Water - Earth - Electric - Frost

Define a clear, data-driven effectiveness matrix. Elemental advantages
should matter, but a level difference, player skill, ability timing, and
team composition should still matter.

Element rules should apply consistently to: - Basic attacks. - Pal
abilities. - Environmental interactions where relevant. - Damage
resistance. - Status effects, if implemented.

UI must communicate important matchup information without requiring the
player to memorise a hidden spreadsheet. Avoid an overly complicated
type chart in the first balancing pass.

## 7. Combat stats and battle resources

Pals may have: - Max health and current health. - Attack. - Defence. -
Ability power or equivalent. - Movement speed. - Attack speed. - Stamina
or energy. - Critical chance or another limited advanced stat, if
useful. - Elemental resistances. - Level and experience.

Battle actions should respect: - Cooldowns. - Stamina/energy. - Wind-up
and recovery. - Interrupts and stagger. - Range and line of sight. -
Collision and navigation. - Status effects.

Keep the formulas centralised and tested. Do not scatter damage
calculations across UI components or creature scripts.

## 8. Player participation

The player is not a spectator. During Pal battles, the player can:

-   Move, sprint, jump, and dodge.
-   Use a basic melee weapon or tool.
-   Use a ranged weapon/tool where appropriate.
-   Aim and select a target.
-   Issue Pal commands.
-   Switch the active Pal.
-   Use healing or tactical items.
-   Throw a capture device at an eligible wild target.
-   Retreat or reposition.

Player attacks and Pal attacks must be balanced together. Avoid making
either the player or the Pal irrelevant.

## 9. Wild Pal ecosystem battles

The world should feel alive even when the player is not initiating
combat.

Wild Pals can: - Compete for territory. - Defend nests or young. - Hunt
smaller creatures. - Flee from stronger predators. - Protect members of
their group. - Fight rival groups. - React to environmental threats. -
Disengage when badly injured.

Do not turn the entire world into constant combat. Encounters should be
contextual, readable, and appropriate to species temperament and
habitat.

Use a scalable simulation: nearby creatures can use full AI, while
distant ecosystem activity is simplified or represented through low-cost
world-state updates. Do not simulate every distant creature at full
fidelity.

## 10. Hostile NPCs and enemy Pal teams

Some hostile NPCs, factions, or dungeon encounters should field their
own Pals.

Requirements: - NPCs have a readable team composition. - NPCs and their
Pals can coordinate targets. - Enemy Pals use the shared combat
framework. - NPCs can issue simple orders such as focus, defend, or
retreat. - Encounters have appropriate difficulty and rewards. - The
player can capture eligible wild Pals, but must not automatically
capture owned or story-protected NPC Pals unless a specific quest
explicitly permits it.

This creates battles against opposing creature trainers/handlers, not
only random wildlife.

## 11. Multi-Pal battles and group tactics

The system must support more than one Pal on either side.

Required capabilities: - Multiple allied and enemy combatants. - Target
distribution and threat evaluation. - Avoidance of excessive crowding
around one target. - Friendly actor collision handling. - Area attacks
that can affect multiple valid actors. - Support abilities that can
affect allies. - Boss adds or companion creatures. - Clear visual
distinction between ally, enemy, neutral, and target.

The number of active actors can be encounter-configured. Performance
safeguards must prevent uncontrolled entity counts.

## 12. Capture during battle

Capturing is part of the encounter loop, not a separate menu action.

-   Only eligible wild Pals can be captured.
-   Capture chance is influenced by target health, rarity, device tier,
    status effects, and species modifiers.
-   A capture attempt has an animation, projectile or interaction,
    feedback, and result.
-   A failed attempt does not silently consume or duplicate items.
-   The target may remain hostile, flee, or recover according to defined
    rules.
-   A successful capture ends that wild Pal's participation and adds it
    to the player's collection.
-   Bosses, protected quest creatures, and NPC-owned Pals follow
    explicit capture eligibility rules.
-   Capture feedback must be clear and fair.

## 13. Status effects and battle conditions

Build a reusable status-effect framework. Potential effects: - Burn. -
Slow. - Stun or stagger. - Root or snare. - Weaken. - Shield. - Heal
over time. - Damage over time.

Each effect must define duration, stacking/refresh behaviour, source,
target eligibility, UI icon, VFX/SFX, and interaction with resistance or
immunity. Add effects selectively; do not overload the player with
status icons.

## 14. Boss battles

Bosses are major creature encounters, not simply creatures with inflated
health.

A boss should have: - Unique model/silhouette and arena. - Distinct
phases or changing attack patterns. - Telegraphs for dangerous
attacks. - Area control and movement mechanics. - Summoned adds or
environmental interactions where appropriate. - Windows for
counterattack. - Difficulty tuned for the expected player and Pal
progression. - Reward table, discovery entry, and repeat rules.

Bosses must use the same fundamental damage, ability, status, and actor
rules as the rest of the game, with bespoke encounter logic layered on
top.

## 15. Multiplayer requirements and future compatibility

The complete design should include a future multiplayer direction, even
if the first shipped implementation is single-player.

### Intended future co-op experience

-   Friends can join a shared world or host session.
-   Players explore together.
-   Each player owns and manages their own Pal collection.
-   Players can summon companions.
-   Players and their Pals can fight together against wild Pals, hostile
    NPC teams, and bosses.
-   Players can build and contribute to a shared settlement.
-   Resource, loot, capture, and progression ownership rules are
    explicit.
-   Disconnect/reconnect and host migration expectations are documented
    before implementation.

### Multiplayer combat requirements

-   Server-authoritative or host-authoritative validation for health,
    damage, capture outcomes, inventory, and progression.
-   Replication of actor positions, animations, combat states,
    abilities, projectiles, and effects.
-   Consistent target and encounter ownership.
-   Latency-tolerant combat feedback.
-   Anti-duplication and anti-cheat validation for important outcomes.
-   Clear rules for who can command a Pal and who receives rewards.
-   Encounter scaling for party size.

Do not bolt networking onto tightly coupled local-only combat code. Keep
simulation rules, actor identities, commands, and combat events
structured so networking can be introduced. Do not claim multiplayer
works until real multi-client testing has been completed.

## 16. Battle UI and feedback

During combat, the player should be able to read: - Active Pal and its
health. - Pal level and current command mode. - Player health and
stamina. - Target name, level, health, and hostility. - Ability
cooldown/readiness. - Capture device and capture feedback. - Status
effects. - Damage, hit, block, stagger, and defeat feedback. -
Ally/enemy distinction. - Boss health and phase cues.

Use a quick command wheel and a clear target-selection mechanism. Do not
cover the centre of the screen with permanent UI.

Every important action should have animation, VFX, audio, and/or UI
feedback. Telegraph strong enemy abilities so players can respond.

## 17. Data and architecture requirements

Keep the battle system modular and data-driven. Suggested modules:

``` text
game/combat/
  CombatSystem.ts
  DamageResolver.ts
  TargetingSystem.ts
  ThreatSystem.ts
  StatusEffectSystem.ts
  EncounterSystem.ts
  BattleEvent.ts
  abilities/
    AbilityDefinition.ts
    AbilityExecutor.ts
    AbilityRegistry.ts
  ai/
    CombatAI.ts
    CombatStateMachine.ts
    TargetSelector.ts
    BehaviourProfiles.ts
  teams/
    BattleParty.ts
    TeamCoordinator.ts
  capture/
    CaptureSystem.ts
    CaptureFormula.ts
  bosses/
    BossEncounter.ts
```

Use shared typed definitions for: - `CombatActor` - `CombatTeam` -
`CombatCommand` - `CombatTarget` - `AbilityDefinition` -
`AbilityRuntimeState` - `DamageEvent` - `StatusEffectDefinition` -
`EncounterDefinition` - `CaptureAttempt` - `BattleResult`

Keep rendering and animation separate from authoritative gameplay rules.
The same combat rules should be testable without rendering a 3D scene.

## 18. Required battle testing

Unit tests: - Damage and mitigation. - Element effectiveness. - Cooldown
and stamina checks. - Status duration and stacking. - Target
eligibility. - Threat scoring and target selection. - Capture chance and
eligibility. - XP and rewards.

Integration tests: - Allied Pal engages a wild enemy. - Wild Pal
attacks, flees, or defends based on behaviour. - Player issues
focus-target and retreat commands. - Pal uses an ability and respects
cooldown. - Multiple Pals distribute targets. - NPC team encounter
resolves. - Boss phase changes and rewards resolve. - Capture
succeeds/fails without item or collection duplication. - Save/reload
preserves Pal progression and party.

Browser/gameplay tests: - Player can enter and leave combat. - Targeting
and command UI work. - Combat animations and effects appear. - Health
and cooldown UI remain in sync. - No stuck combat states or permanently
hostile actors after an encounter.

## 19. Acceptance criteria for the complete Pal battle system

The battle system is complete only when all of the following work
together:

1.  Owned Pals autonomously fight beside the player.
2.  Wild Pals have distinct non-combat and combat behaviours.
3.  Player can issue commands and change targets.
4.  Player can participate directly in battle.
5.  Pals have species-specific attacks and signature abilities.
6.  Elemental matchups affect battle outcomes.
7.  Multiple allied and enemy Pals can fight in one encounter.
8.  Hostile NPCs can field their own Pal teams.
9.  Wild Pals can fight other wild Pals as part of the ecosystem.
10. Capture can be attempted during an eligible encounter.
11. Pals gain experience and improve through progression.
12. Boss battles have bespoke mechanics and rewards.
13. Combat state, party state, and progression save and load correctly.
14. Combat remains performant at the designed encounter size.
15. The architecture has documented seams for future co-op multiplayer.

Do not mark this system complete because one Pal can follow the player
and play one attack animation. The full acceptance list is the
definition of done.

## 20. Build instruction

Integrate this specification into the main game design document.
Preserve the incremental development approach, but do not reinterpret
incremental delivery as an MVP-only product goal.

For each implementation phase: - Keep the full battle vision in scope. -
Build the combat foundation so later mechanics fit without rewrites. -
Implement and test a coherent vertical slice. - Update the build log and
decisions. - Keep all unimplemented requirements visible in a tracked
backlog. - Do not claim the full battle system---or the full game---is
complete until its acceptance criteria are met.
