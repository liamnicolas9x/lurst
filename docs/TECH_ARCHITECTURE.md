\# TECH ARCHITECTURE



\---



\# OVERVIEW



The project is a lightweight persistent multiplayer RTS simulation game.



Architecture priorities:

1\. simplicity

2\. stability

3\. readability

4\. authoritative multiplayer

5\. long-term maintainability



Avoid:

\- overengineering

\- microservices

\- premature optimization

\- MMO-scale complexity



\---



\# CORE STACK



\## Frontend

\- Phaser

\- TypeScript

\- HTML5 Canvas/WebGL rendering



\## Backend

\- Node.js

\- TypeScript

\- Vercel serverless backend
- lightweight realtime synchronization
- hybrid persistent simulation



\## Database

\- PostgreSQL or Supabase



\---



\# NETWORK MODEL



\## Hybrid Authoritative Simulation



The server is authoritative for:

\- unit movement

\- pathfinding results

\- combat

\- hunger

\- resource gathering

\- construction progress

\- wildlife AI

\- collisions

\- village ownership

\- population

\- persistence



Clients are NOT trusted.



Clients only:

\- send player input

\- render visuals

\- play audio

\- display UI



\---



\# GAME LOOP



\## Server Tick Rate

\- 5–10 ticks per second



The server updates:

\- unit movement

\- AI logic

\- hunger

\- combat

\- resource gathering

\- construction

\- wildlife

\- pathfinding tasks



\---



\# WORLD MODEL



\## Persistent World

\- single persistent map

\- runs 24/7

\- no match reset



\## World Simulation

World state persists continuously.

Simulation actively updates while players are online.

When players return after being offline:
- offline progress is simulated
- construction progress updates
- gathering progress updates
- hunger updates
- village state updates



Examples:

\- villagers continue gathering

\- buildings continue construction

\- wildlife continues roaming



\---



\# MAP SYSTEM



\## Map Type

\- handmade map

\- tile-based RTS layout



\## Terrain Types

\- grass

\- forest

\- river

\- blocked terrain



\## Rivers

\- block movement

\- require pathfinding around obstacles



Future:

\- bridges



\---



\# ENTITY SYSTEM



All gameplay objects are entities.



Examples:

\- villagers

\- swordsmen

\- wolves

\- crocodiles

\- trees

\- stone nodes

\- buildings

\- fences



Each entity should contain:

\- unique id

\- position

\- state

\- HP

\- owner

\- task state



\---



\# UNIT SYSTEM



\## Villager

Capabilities:

\- move

\- gather

\- build

\- repair

\- eat

\- flee danger



\## Swordsman

Capabilities:

\- move

\- attack

\- defend



\## Wildlife

Capabilities:

\- roam

\- attack nearby targets

\- return near nest



\---



\# AI SYSTEM



\## Villager AI Priorities



Priority order:

1\. escape danger

2\. eat if starving

3\. deposit resources

4\. continue assigned task



\## Wildlife AI

\- simple readable behavior

\- low aggression frequency

\- lightweight server logic



\---



\# TASK SYSTEM



Units operate using queued task states.



Examples:

\- move

\- gather

\- deposit

\- build

\- eat

\- attack

\- flee



Units resume interrupted tasks automatically after survival actions.



\---



\# RESOURCE SYSTEM



\## Resource Nodes

\- trees

\- stone

\- wildlife food



\## Regrowth

Trees:

\- regrow visually over time



Stone:

\- respawns over time



Wildlife:

\- spawned by nests



\---



\# BUILDING SYSTEM



\## Grid Placement

Buildings use RTS-style grid placement.



Cannot place:

\- over rivers

\- over objects

\- over buildings



\## Construction

Buildings:

\- exist as construction sites first

\- visually scaffold while building

\- become completed after timer



Destroyed buildings:

\- become ruins



\---



\# PATHFINDING



\## Requirements

\- realtime RTS pathfinding

\- obstacle avoidance

\- soft unit collision

\- hard building collision



\## Optimization

Favor:

\- readability

\- stability



Over:

\- advanced swarm simulation



\---



\# COLLISION MODEL



\## Soft Unit Collision

Units can slide around each other.



\## Hard Collision

Buildings and rivers block movement completely.



\---



\# MULTIPLAYER



\## Player Cap

\- 5 active players

\- unlimited spectators



\## Spectator Mode

\- free camera

\- global chat access



\---



\# CAMERA SYSTEM



\## Features

\- edge scrolling

\- zoom in/out

\- minimap support



\## Rendering

Only render nearby visible entities.



Do NOT render entire world at full detail.



\---



\# AUDIO SYSTEM



\## Ambient Audio

\- distance-based sound fading

\- local environmental sounds



\## Music

\- medieval ambient loops



\## Notifications

\- text notifications

\- RTS-style announcer voice



\---



\# UI PRINCIPLES



UI goals:

\- modern minimal interface

\- readable RTS controls

\- lightweight layout

\- fast interaction



Avoid:

\- clutter

\- oversized panels

\- MMO-style UI complexity



\---



\# SAVE SYSTEM



\## Persistent Save System

World state is continuously persisted to Supabase.

Offline progress simulation occurs when players reconnect.



\## Persisted Data

Persist:

\- buildings

\- units

\- inventories

\- HP

\- hunger

\- positions

\- village ownership

\- wildlife nests

\- construction progress



Do NOT persist:

\- corpses

\- temporary visual effects

\- transient pathfinding data



\---



\# ABANDONED SYSTEM



If player inactive for 6 months:

\- village becomes abandoned ruins



Ruins remain until cleared manually.



\---



\# SECURITY



\## Anti-Cheat

Server validates:

\- movement

\- resources

\- combat

\- production

\- construction



Never trust client-side values.



\---



\# PERFORMANCE TARGETS



Target:

\- stable browser RTS performance

\- lightweight simulation

\- low server cost



Avoid:

\- massive entity counts

\- expensive AI logic

\- overly detailed physics



\---



\# DEVELOPMENT PHILOSOPHY



Build in phases.



Never attempt:

\- full MMO systems

\- giant feature dumps

\- premature polish



Prioritize:

1\. core gameplay loop

2\. stable multiplayer

3\. persistence

4\. RTS feel

5\. atmosphere

6\. polish later

