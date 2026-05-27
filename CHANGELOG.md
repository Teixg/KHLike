# Changelog

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
