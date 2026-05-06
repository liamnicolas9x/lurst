\# AI DEVELOPMENT RULES



These rules apply to ALL AI coding assistants working on this project.



Examples:

\- Cursor

\- Windsurf

\- Codex

\- Claude

\- GPT

\- Copilot



Failure to follow these rules will damage project stability.



\---



\# CORE PROJECT IDENTITY



This project is:



\- a lightweight persistent RTS village simulation

\- multiplayer

\- authoritative-server architecture

\- gameplay-first simulation

\- chill atmosphere

\- small-scale persistent world



This project is NOT:

\- an MMO

\- a competitive RTS esport

\- a survival hardcore simulator

\- a giant procedural sandbox



\---



\# ABSOLUTE PRIORITIES



Priority order:



1\. multiplayer stability

2\. persistence reliability

3\. RTS responsiveness

4\. readable gameplay

5\. maintainable architecture

6\. atmosphere

7\. visual polish



\---



\# DO NOT OVERENGINEER



Always prefer:

\- simple systems

\- readable code

\- stable architecture



Avoid:

\- unnecessary abstractions

\- enterprise patterns

\- complex dependency injection

\- microservices

\- ECS overengineering

\- premature optimization



\---



\# AUTHORITATIVE SERVER RULE



The server controls:

\- movement

\- combat

\- AI

\- hunger

\- construction

\- resources

\- collisions

\- persistence



Clients NEVER make gameplay decisions.



Clients only:

\- send player input

\- render graphics

\- play sounds

\- display UI



Never trust client-side values.



\---



\# PHASE DEVELOPMENT RULE



Only implement features from the CURRENT phase.



Do NOT:

\- jump ahead

\- add future systems early

\- partially implement future mechanics



Always finish:

\- stable functionality

\- bug fixing

\- multiplayer testing



before moving to next phase.



\---



\# KEEP THE GAME PLAYABLE



Every development phase must:

\- run correctly

\- remain playable

\- remain testable



Never leave the project in a broken intermediate state.



\---



\# RTS FEEL RULES



Movement must feel:

\- responsive

\- readable

\- lightweight



Avoid:

\- floaty movement

\- excessive animation blending

\- physics-heavy movement

\- realism over gameplay



The game should FEEL like a classic RTS.



\---



\# SIMULATION RULES



Simulation should:

\- create atmosphere

\- support gameplay

\- remain lightweight



Avoid:

\- excessive realism

\- complex biological simulation

\- deep survival simulation

\- unnecessary statistics systems



Gameplay-first always wins.



\---



\# AI BEHAVIOR RULES



AI should:

\- be predictable

\- be readable

\- support RTS clarity



Avoid:

\- advanced behavior trees too early

\- machine-learning systems

\- expensive AI calculations

\- chaotic random behavior



\---



\# PERFORMANCE RULES



Target:

\- stable browser performance

\- stable multiplayer synchronization

\- low server CPU usage



Avoid:

\- large entity counts

\- expensive physics

\- expensive pathfinding loops

\- unnecessary particles

\- excessive memory allocations



\---



\# VISUAL RULES



Visuals should prioritize:

\- readability

\- atmosphere

\- RTS clarity



Avoid:

\- hyper realism

\- excessive effects

\- cluttered UI

\- oversized UI panels



The world should feel:

\- cozy

\- medieval

\- alive

\- readable



\---



\# UI RULES



UI should be:

\- modern

\- minimal

\- fast

\- clean



Avoid:

\- MMO-style UI clutter

\- giant menus

\- nested complexity



The game should remain intuitive.



\---



\# NETWORKING RULES



Networking should prioritize:

\- stability

\- simplicity

\- predictability



Avoid:

\- unnecessary prediction systems

\- complex rollback systems

\- ultra-high tickrate designs



5–10 ticks/sec is acceptable.



\---



\# PATHFINDING RULES



Pathfinding should:

\- be stable

\- be readable

\- avoid congestion



Avoid:

\- overcomplicated crowd simulation

\- perfect realism

\- expensive calculations



Soft unit collision is preferred.



\---



\# SAVE SYSTEM RULES



Persistence is critical.



Always safely persist:

\- buildings

\- units

\- resources

\- ownership

\- construction progress

\- hunger

\- HP



Never lose persistent world state.



\---



\# WORLD ATMOSPHERE RULES



Atmosphere matters more than graphical fidelity.



Prioritize:

\- ambient audio

\- village life feeling

\- readable activity

\- world persistence

\- emotional attachment



Small details matter:

\- villagers carrying wood

\- distant water sounds

\- nighttime lighting

\- idle wandering



\---



\# FEATURE CREEP RULE



Do NOT add:

\- farming

\- diplomacy

\- advanced economy

\- weather systems

\- PvP

\- alliances

\- boats

\- technology trees



unless explicitly requested.



Focus only on current scope.



\---



\# CODE STYLE RULES



Code should be:

\- modular

\- readable

\- maintainable

\- simple



Prefer:

\- straightforward logic

\- explicit naming

\- predictable architecture



Avoid:

\- magic abstractions

\- overgeneric systems

\- premature frameworks



\---



\# DEBUGGING RULES



When bugs occur:

1\. identify root cause

2\. apply minimal fix

3\. avoid large rewrites

4\. preserve architecture stability



Do NOT rewrite entire systems unnecessarily.



\---



\# MULTIPLAYER RULES



Multiplayer consistency matters more than visual smoothness.



Always prioritize:

\- correct synchronization

\- stable server authority

\- predictable simulation



Minor visual imperfections are acceptable.



\---



\# LONG-TERM PROJECT RULE



This is a long-term persistent world project.



Architecture decisions should prioritize:

\- maintainability

\- clarity

\- incremental expansion



Do NOT optimize for:

\- massive scale

\- MMO player counts

\- enterprise infrastructure



\---



\# FINAL DEVELOPMENT PHILOSOPHY



Build:

\- small

\- stable

\- atmospheric

\- playable



Expand slowly.



Never sacrifice:

\- persistence

\- RTS feel

\- atmosphere

\- simplicity



for unnecessary complexity.

