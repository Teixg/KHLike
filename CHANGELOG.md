# Changelog

## [v0.8.2] - 2026-05-29

### 🎨 UI/UX & Aesthetics
- **Silhouetted Locked Worlds**: Replaced the generic lock emoji (`🔒`) on locked world detail pages in Jiminy's Journal with the silhouetted logo of the world, matching the visual style of undiscovered enemies, keyblades, and accessories.
- **Authentic Mickey Seal Badges**: Substituted the generic key emoji (`🔑`) next to sealed worlds in the journal index list with the authentic `MickeyChek.png` seal asset.
- **Mickey Completion Stamps**: Upgraded the tab completion stamp from a generic crown (`👑`) to the animated `MickeyChek.png` stamp, preserving the custom bounce micro-animation.
- **Text-Only Dynamic Tabs**: Removed emoji icons from all 5 main navigation tabs in the journal, refactoring their CSS to support dynamic widths based on text length. The tabs now overlap the book page cleanly, prevent text wrapping, and have their label font size increased to `11px` for better readability.

### 🔧 Refactoring
- **Bestiary Rename (Adversaries to Enemies)**: Replaced all user-facing text, page titles, empty states, code references, and tab IDs from "Adversaries" to "Enemies" for clarity and consistency across the codebase.

---

## [v0.8.1] - 2026-05-28

### ✨ Features
- **Battle Victory Rewards Separation**: Restored boss drop functionality by storing the `isBoss` flag in `gs.currentBattleInfo`, enabling the interactive claim/reject overlay for boss Keyblades and accessories upon victory.
- **Accessory Names Translation**: Translated all 12 collectible accessory/item names (e.g., Elven Bandana, Protect Belt, Power Band, Aegis Chain, Cosmic Chain, Shock Charm, Expert's Ring, Full Bloom, Midnight Anklet, Orichalcum Ring, Star Charm, and Master's Ring) and their corresponding enemy drop references to English to align with the rest of the game's language setting.
- **Streamlined Moogle Shop Choices**: Removed the redundant confirmation dialog ("You obtained...!") after selecting an item, returning the player directly to the map with their new accessory.
- **Dedicated Ending Screen**: Integrated a dedicated ending viewport screen (`#s-ending`) displaying the classic *Chain of Memories* ending illustration (Sora & Riku side-by-side) with "The End" text and a return-to-title navigation button, replacing the generic victory modal when clearing the game.

### 🐛 Bug Fixes
- **World Enemy Sync**: Synced the `enemies` and `boss` arrays inside the master `WORLDS` template with the updated `ENEMY_TEMPLATES` database, resolving `Invalid enemy in startBattle: null` and `Boss not found` errors.
- **Battle Victory Rewards Display**: Separated normal battle rewards from boss drops. Normal battles now only show the level up capsule and HP recovery (and no longer display fake, un-awarded items).
- **Save Migration for Renamed Rings**: Integrated automatic migration mapping in `loadGame()` and `loadProfile()` inside `js/game.js` to convert the old ring IDs (`anillo-experto-6` $\rightarrow$ `anillo-experto` and `anillo-experto-7` $\rightarrow$ `anillo-maestro`) to their new values, preserving active saves and profile statistics.
- **Enemy Sprite Centering**: Centered enemy sprite images relative to their health bars on the battle screen by removing the inline `align-self: flex-end` override from `#e-sprite`.
- **Clean Event Overlays**: Prevented empty gold reward boxes from rendering on dialog overlays (like the Save Overwrite warning and Victory popups) by making the `.event-reward` container render conditionally only when reward text is present.

---

## [v0.8.0] - 2026-05-28

### ✨ Features
- **In-Game English Tutorial System**: Added an interactive "How to Play" tutorial guide modal (`#s-tutorial`) in `index.html` accessible from the Title Screen, fully translated to English with tabbed sections covering Exploration, Combat, Growth, and Recycling.
- **Key-Shaped Achievement Toast Redesign**: Redesigned the achievement unlock popup into a custom key-shaped banner inspired directly by the *Kingdom Hearts* "OBTAINED" notification. Includes a circular head for the icon, a dark-gradient body, a white outline, and an italicized, underlined gold "OBTAINED" header.
- **Visual World Representation**: Replaced world emojis with custom graphic logo assets (e.g. Wonderland logo, Deep Jungle logo, etc.) and updated Castle Oblivion's theme and naming.
- **Enriched Enemy & Boss Roster**: Upgraded several enemy encounters across worlds:
  - Wonderland: Added *Card of Spades* and *Card of Hearts* (replacing Rhapsody/Plant).
  - Deep Jungle: Replaced Air Soldier with *Creeper Plant*.
  - Olympus Coliseum: Replaced Barrel Spider and Large Body with *Tornado Step* and *Air Soldier*, and replaced Cerberus with the *Hades* boss fight.
  - Halloween Town & Hollow Bastion: Updated Oogie Boogie and Riku Replica with dedicated, unique graphic sprite assets.
  - Castle Oblivion: Added *Black Fungus* and *Organization XIII* (replacing Invisible/Angel Star), and upgraded Marluxia's sprite with the *Specter* graphic.

### 🐛 Bug Fixes
- **Enemy Sprite Scaling**: Fixed an issue where the battle screen ignored enemy `iconHeight` settings and rendered all enemy images at a default 45px width. The engine now queries the `<img>` sprite inside `#e-sprite` and dynamically sets its height to `iconHeight` (and width to `auto`) to override the inline defaults.
- **Achievements Title**: Translated the achievements list header from Spanish ("Logros") to English ("Achievements") to preserve linguistic consistency.

---

## [v0.7.0] - 2026-05-28

### ✨ Features
- **Suspend & Resume Save System**: Added a complete run persistence system utilizing `localStorage` to allow players to safely close their browser and resume runs:
  - **Auto-save**: Saves player stats, inventory, equipment, and map layouts automatically when starting a run, completing map nodes, or returning from combat.
  - **Thematic Save Points**: Interacting with Save Points heals the player and explicitly triggers `saveGame()` with a custom header `"Save Point (Game Saved!)"`.
  - **Permadeath Compliance**: Automatically wipes the save game from storage when the player dies (defeat) or completes the final world (victory).
  - **Overwrite Warning Overlay**: Added a warning dialog when clicking "New Journey" while a save file exists to prevent accidental loss of progress.

### 🎨 UI/UX Improvements
- **Title Screen Continue Button**: Integrated a stacked "Continue Journey" button on the Title Screen that automatically displays only if a saved game is present in browser storage.

### 🔧 Technical
- Added `saveGame()`, `loadGame()`, and `clearSave()` helper functions to handle JSON serialization of the global state `gs`.
- Implemented `updateTitleScreenContinueButton()` and `startNewJourney()` to manage title screen transitions and warning triggers.
- Triggered `updateTitleScreenContinueButton()` on boot to check browser storage immediately.

---

## [v0.6.0] - 2026-05-28

### ✨ Features
- **Magic & MP Combat System**: Integrated active magic spells into combat using `MP` and `MGK` stats:
  - **Cure Spell**: Automatically casts when player HP is below 40% (heals `mgk * 2.5` HP, costs 20 MP).
  - **Offensive Spells**: 30% chance when MP >= 15 to cast spells instead of attacking: Sora casts Fire/Blizzard/Thunder, Riku casts Dark Firaga (deals `mgk * 1.5` magic damage, costs 15 MP).
  - **MP Regeneration**: Gaining `+5 MP` on player action and when receiving hits.
- **Speed & Agility Combat System**: Re-introduced Speed (`spd`) as a core stat (base: Sora 15, Riku 20; +1 per level):
  - **Dodge Roll**: Chance (`spd * 0.4%`, max 35%) to dodge enemy attacks, logging `"💨 [Name] dodges the attack!"` and avoiding damage.
  - **Double Strike**: Chance (`spd * 0.5%`, max 40%) to execute a second consecutive strike on physical attacks.
- **Revalued Items**: Updated accessories to support the new stats:
  - `Pañuelo duende` (Elven Bandana) now grants `+8 SPD` (was HP).
  - `Dije galvanico` (Shock Charm) now grants `+12 MGK` (was HP).
- **Themed Mystery Events**: Rewrote mystery events in `data.js` to feature Kingdom Hearts characters matching their available assets:
  - *Namine's Sketchbook* (restores MP), *Aerith's Prayer* (heals HP), *Jack's Spooky Trick* (spooky damage), *Kairi's Wayfinder* (item reward), and *Hercules' Training* (permanent +8 ATK).

### 🎨 UI/UX & Aesthetics
- **Rectangular Status Bars**: Removed `border-radius` from all status bars (HP, MP, and EXP) across character select, map HUD, map side-panels, and combat screens, matching the classic Kingdom Hearts layout.
- **Thicker Status Bars**: Increased status bar heights for better visibility (character select to 18px, group health HUD to 10px, map side-panels to 12px, combat HP to 14px, and combat MP to 9px).
- **Victory Screen Icons**: Replaced victory screen reward emojis (`🎁`, `💚`) with custom image assets (`assets/extras/reward.png` and `assets/extras/hpOrb.png`) and vertically centered layout.
- **Character Icons for Speed Control**: The Speed Mode buttons now feature character face icons: **Donald Duck** representing Fast Mode, and **Goofy** representing Normal Mode.
- **Map Layout Polish**: Added `18px` top padding to `.map-body` to separate exploration panels and the map area from the sticky top HUD.

### 🔧 Technical
- Added `toggleBattleSpeed()` and `updateSpeedButtonUI()` to toggle `gs.battleSpeed` (normal speed `1x`, fast speed `4x` with delay multiplier `0.25`).
- Sincronized speed preference globally across map HUD and battle screens, preserving the setting between fights.
- Added `retreatFromBattle()` to clean up auto-attack timeouts when leaving a battle, resolving a background battle execution bug.
- Added permanent `spd` tracking and rendering on the character select screen and the map's left side-panel under a new **📊 Stats** block.

---

## [v0.5.0] - 2026-05-27

### ✨ Features
- **Functional Moogle Shop**: Replaced placeholder shop with a fully interactive system. Players can choose between 2 randomly offered accessories or skip shopping entirely.
- **World-based Keyblade Progression**: Chests now generate keyblades matched to the player's current world index or lower, aligning weapon power with progression.
- **Smart Loot Conversion**: When defeating a boss, if a dropped Keyblade is weaker than the player's currently equipped weapon, it is automatically converted into a random rare accessory.

### 🎨 UI/UX & Aesthetics
- **Kingdom Hearts Custom Fonts**: Integrated authentic `KHGummi.otf` (Gummi font) and `KHMenu.otf` (Menu font) across all titles, buttons, status bars, and overlays.
- **CoM-Style Level Up Capsule**: Completely overhauled the battle victory screen with a premium Level Up notification:
  - Skewed dual-capsule layout (left side for level count, right side for stat increase notifications).
  - Integrates the active character's sprite (Sora or Riku) floating over the UI.
  - Micro-animations including slide-in entries and a pulsing red shadow glow.
- **Moogle Shop Interface**: Custom card layouts featuring hover scaling, gradient overlays, item stat symbols, and Moogle shopkeeper artwork.
- **Polish & Details**: Replaced text placeholders with visual assets, such as the Save Point icon (`save.png`) and Combat screen heading icon (`key.gif`).

### 🔧 Technical
- Added `showMoogleShop()`, `selectMoogleItem()`, and `skipMoogleShop()` to manage Moogle transactions.
- Refactored `endBattle()` to construct and animate the complex Level Up capsule structure and separate secondary reward displays.
- Modified keyblade chest generation within `handleMapNode()` to enforce world limits.
- Updated `handleBossReward()` to evaluate keyblade attack values and handle accessory transformation fallback.
- Added support for `.otf` fonts inside `base.css` with fallback fonts.

---

## [v0.4.0] - 2026-05-25

### ✨ Features
- **18 Keyblades Collection**: Added all Kingdom Hearts Chain of Memories keyblades with balanced ATK stats (Kingdom Key to Ultima Weapon)
- **Reward Rejection System**: Accept/reject items and keyblades from chests and boss drops
- **Enhanced Item Display**: Item stats always visible in inventory with bonus values
- **Item Equip Buttons**: Quick equip/unequip buttons on hover with visual feedback

### 🎨 UI/UX Improvements
- **Battle Text Visibility**: All battle section text changed to white (#ffffff) for maximum contrast
- **Keyblade Display**: Boss keyblade drop text now white for consistency
- **Side Panel Redesign**: 
  - Gradient backgrounds with golden borders
  - HP/MP bars with smooth animations
  - Equipped items highlighted in green
  - Scrollable panels with custom scrollbars
- **Item Panels**: Organized layout with stat indicators (⚔️ ATK, ✨ MGK, ❤️ HP, 💙 MP, ⚡ SPD)

### 🔧 Technical
- Updated `showEventOverlay()` to support accept/reject buttons
- Added `handleBossReward()` for boss loot selection
- Modified chest handling to allow item/keyblade rejection
- Enhanced maprender.js to display item stats and equipped status

### 📊 Items & Progression
- All equipped items show stat bonuses with icons
- Empty slots clearly marked in equipment panel
- Inventory sorted by equipment status

---

## [v0.3.0] - 2026-05-24

### ✨ Features
- **Healing System**: 15% HP recovery after each battle victory, full heal on world transition
- **Keyblade System**: Foundation with Kingdom Key as starter weapon

### 🔧 Code Cleanup
- Removed `spd` stat from all calculations and UI
- Removed unused `skills` arrays from character data
- Removed `passive` properties from characters/keyblades
- Deleted `useSkill()` function (150+ lines of dead code)
- Removed `emoji` references where applicable

### 🐛 Bugfixes
- Fixed character sprite display bug (undefined character in battle)
- Fixed enemy mixing between worlds via worldId system
- Fixed text visibility in battle section with white colors

---

## [v0.2.0] - 2026-05-23

### ✨ Features
- **8 Worlds System**: Traverse Town → End of the World with unique bosses
- **Procedural Map Generation**: Per-world level-based enemy placement
- **Turn-based Auto-Battle**: Automatic combat with HP/MP tracking
- **Character Selection**: Sora vs Riku with different stat distributions
- **Item System**: Equippable stat-boosting items (max 2 slots)

### 🎨 UI/UX
- Character selection screen with portraits
- Battle interface with enemy/player sprites
- Map navigation with Slay the Spire-style node tree
- HUD with world info and character stats

---

## [v0.1.0] - 2026-05-22

### ✨ Initial Release
- Basic roguelike structure with 8 worlds
- Title screen and character selection
- Map generation and node traversal
- Simple turn-based combat system
- Enemy and item definitions
- Kingdom Hearts theming with custom CSS
