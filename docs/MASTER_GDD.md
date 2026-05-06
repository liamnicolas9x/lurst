\# PROJECT TITLE

Unnamed Persistent RTS



\---



\# CORE VISION



A lightweight browser-based persistent RTS village simulation game inspired by Age of Empires I.



The game focuses on:

\- living world simulation

\- chill village management

\- persistent online world

\- realtime RTS gameplay

\- small social multiplayer experience

\- semi-automation gameplay

\- long-term village attachment



The game is NOT focused on:

\- hardcore PvP

\- esports balancing

\- massive MMO scale

\- complex civilization tech trees

\- hyper realism



\---



\# PLATFORM



\- PC browser only (initial version)

\- Multiplayer online

\- Hybrid persistent simulation world



\---



\# TECH STACK



Frontend:

\- Phaser

\- TypeScript



Backend:

\- Node.js authoritative server

\- WebSocket realtime networking



Database:

\- PostgreSQL or Supabase



Architecture:

\- authoritative server

\- server-side simulation

\- realtime persistent world



\---



\# WORLD DESIGN



\## Map

\- One handmade persistent map

\- Maximum 5 active players

\- Additional users join as spectators

\- Medium-small map size

\- Players are close enough to see signs of each other

\- No map reset

\- World exists permanently



\## Environment

\- Forests

\- Rivers

\- Grassland

\- Wildlife nests



\## Day/Night Cycle

\- Real-time 1:1 with real-world clock

\- Visual/audio only

\- No gameplay stat changes



\---



\# GAMEPLAY STYLE



\- Realtime RTS

\- Mouse controls

\- Classic readable RTS movement

\- Gameplay-first simulation

\- Chill social village atmosphere



\---



\# PLAYER EXPERIENCE



Players start with:

\- 1 villager

\- starter resources:

&#x20; - 100 wood

&#x20; - 50 food

&#x20; - 20 stone

&#x20; - 0 gold



Player flow:

1\. Spawn into world

2\. Search for village location

3\. Build first Town Center

4\. Gather resources

5\. Expand village

6\. Defend from wildlife

7\. Live long-term in persistent world



\---



\# RESOURCES



\## Resource Types

\- Wood

\- Stone

\- Food

\- Gold



\## Resource Rules

\- Resources are public

\- Trees regrow naturally

\- Stone respawns

\- Wildlife respawns from nests

\- Resources never permanently disappear



\---



\# UNITS



\## Villager

Functions:

\- gather wood

\- gather stone

\- hunt animals

\- build structures

\- repair structures



Behavior:

\- auto continue tasks

\- can gather multiple targets per order

\- carries limited resources

\- survival-priority AI



Carry capacity:

\- 10 wood max



Combat:

\- does not fight

\- runs away automatically



\## Swordsman

Functions:

\- defend village

\- attack wildlife



Behavior:

\- auto attack nearby threats



\## Wildlife



\### Wolf

\- land predator

\- guards nearby territory



\### Crocodile

\- water predator

\- roams farther

\- prefers staying near rivers



\---



\# HUNGER SYSTEM



\- HP bar represents both health and hunger

\- Villagers lose HP over time from hunger

\- Every 5 real-life hours:

&#x20; - villagers lose 10% HP

\- If HP drops below 20%:

&#x20; - villager automatically returns to nearest House or Town Center to eat

&#x20; - then resumes previous task



If attacked:

\- villagers lose HP normally



If village collapses:

\- final surviving villager never dies permanently

\- allows player recovery later



\---



\# BUILDINGS



\## Town Center

Functions:

\- villager production

\- resource drop-off

\- food access

\- civilization upgrades



Rules:

\- max 3 Town Centers per player



Construction time:

\- 1 minute



Upgrade system:

\- 3 upgrade levels

\- upgrades improve civilization visuals

\- each level increases max population by +5



\## House

Functions:

\- increases population cap

\- food access

\- resource drop-off



Population:

\- +5 population



Capacity:

\- max 5 villagers inside



Construction time:

\- 3 minutes



\## Barracks

Functions:

\- train swordsmen



Construction time:

\- 5 minutes



\## Fence

Functions:

\- block wildlife

\- village protection



Features:

\- drag placement

\- automatic gates



\## Building Rules

\- buildings use grid placement

\- cannot overlap map objects

\- buildings have HP

\- destroyed buildings become ruins



Ruins:

\- must be cleared before rebuilding



\---



\# POPULATION SYSTEM



Base population:

\- increased by Houses



Maximum population:

\- 20 base max per player

\- Town Center upgrades increase cap further



Production queue:

\- single queue only



Production times:

\- villager: 15 seconds

\- swordsman: 30 seconds



\---



\# AI BEHAVIOR



\## Villager Priorities

Priority order:

1\. survive danger

2\. eat if starving

3\. deposit resources

4\. continue assigned work



\## Idle Behavior

\- villagers wander lightly near village

\- idle animations enabled



\## Wildlife AI

\- simple readable AI

\- low aggression frequency

\- nest-based spawning



\---



\# CONTROLS



\## Mouse Controls

\- left click: select

\- drag box: multi-select

\- right click: move/action



\## Camera

\- edge scrolling

\- zoom in/out

\- minimap support



\## Minimap

Shows:

\- players

\- buildings

\- unit movement

\- wildlife



\---



\# PATHFINDING



\- realtime pathfinding

\- units avoid obstacles

\- rivers block movement

\- soft unit collision

\- hard building collision



Future feature:

\- bridges



\---



\# SOCIAL FEATURES



\## Chat

\- realtime global chat

\- spectators can chat



\## Identity

Each player has:

\- Player Name

\- Village Name



Map label format:

VillageName (PlayerName)



\---



\# AUDIO



\## Music

\- medieval chill ambient music



\## Ambient Audio

\- water sounds

\- chopping sounds

\- wildlife sounds

\- distance-based audio fading



\## Notifications

\- text + classic RTS-style male announcer voice



Examples:

\- villager under attack

\- construction completed

\- need more houses



\---



\# VISUAL STYLE



\- classic RTS inspired visuals

\- modern minimal UI

\- readable gameplay-first graphics

\- detailed but lightweight sprite art

\- Age of Empires inspired atmosphere



\---



\# PERSISTENCE



\- world state persists continuously
- simulation updates while players are online
- offline progress is simulated when players return

\- server autosaves continuously

\- simulation continues while players are offline



Persisted data:

\- buildings

\- unit positions

\- HP/hunger

\- construction progress

\- wildlife nests

\- village ownership

\- resources



Non-persistent temporary data:

\- corpses

\- temporary effects

\- pathfinding cache



\---



\# ABANDONED VILLAGES



If player inactive for 6 months:

\- village becomes abandoned ruins



Ruins remain on map until cleared.



\---



\# DESIGN PHILOSOPHY



Priority order:

1\. atmosphere

2\. readability

3\. persistent world feeling

4\. social chill experience

5\. RTS responsiveness

6\. technical simplicity



Avoid:

\- feature creep

\- MMO complexity

\- hardcore PvP

\- over-realism

\- excessive micromanagement

