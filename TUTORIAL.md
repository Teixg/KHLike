# KHLike · Game Mechanics Manual & Guide

Welcome to **KHLike**! This manual details all the gameplay rules, combat algorithms, stat growth formulas, inventory slot management, and the persistent account achievements system.

---

## 1. Journey & Map Exploration

Your objective is to guide your Keyblade wielder (Sora or Riku) across **8 procedural worlds**, sealing their keyholes and defeating the darkness.

### Map Node Types
As you navigate the interconnected paths of the map, you will encounter various node types:
*   **Start Node 🏁**: The starting point of each world.
*   **Normal Battle 🗡️**: Combat against standard Heartless. Winning grants +1 player level and heals 15% of your max HP.
*   **Boss Battle 💀**: Positioned at the end of each world. Defeating the boss seals the world's keyhole, opens a boss chest, and allows you to transition to the next world.
*   **Save Point 💾**: Autosaves your run and restores **40% of your max HP** and **50% of your max MP**.
*   **Keyblade Chest 📦**: Unlocks a stronger Keyblade (45% chance) or gives you a random accessory.
*   **Mystery Node 📜**: Random narrative encounters with Namine, Aerith, Kairi, Hercules, or Jack Skellington that modify your stats or heal your pools.
*   **Moogle Shop ⭐**: Offers you a free choice between two random accessory cards.
*   **Final Boss 👑 (Marluxia)**: Located at the end of World 7. Defeating Marluxia clears the run and grants victory.

---

## 2. Turn-Based Combat Logic

Combat resolves automatically in turns based on wielder and enemy stats, executing specific conditional rules.

### Magic & Spells
*   **MP Regeneration**: The player recovers **+5 MP** on every player turn, and another **+5 MP** whenever hit by an enemy physical attack.
*   **Cure Heals 💚**:
    *   **Condition**: Triggers only when player health drops **below 40%** of max HP.
    *   **Cost**: Consumes **50 MP**.
    *   **Activation**: Has a **30% activation chance** on your turn. If triggered, heals for `Magic (MGK) * 2.5` HP. If it fails, the wielder performs another action (offensive magic or physical attack).
*   **Offensive Magic (Fire / Blizzard / Thunder / Dark Firaga) 🔥❄️⚡🔮**:
    *   **Condition**: Triggers with a **30% chance** on your turn whenever you have **15 MP** or more.
    *   **Effect**: Consumes **15 MP** and deals `MGK * 1.5` magic damage (+/- random variance). Sora casts random element spells; Riku casts *Dark Firaga*.

### Speed (SPD) Mechanics
Your Speed stat directly scales your physical combat maneuvers:
1.  **Double Strike 🗡️🗡️**: When attacking physically, you have a chance to strike twice in a row equal to `Speed (SPD) * 0.5%` (capped at 40%).
2.  **Dodge Roll 💨**: When attacked, you have a chance to completely evade the hit equal to `Speed (SPD) * 0.4%` (capped at 35%).

---

## 3. Attributes & Growths

Winning a combat node increases your Player Level by 1. Leveling up increases your base attributes according to fixed stat growth rules:

*   **Max HP (+18 / Level)**: Increases your health pool to survive heavy hits.
*   **Strength / ATK (+8 / Level)**: Boosts physical attack card damage.
*   **Magic / MGK (+3 / Level)**: Scales offensive spell damage and Cure healing.
*   **Max MP (+4 / Level)**: Increases maximum mana capacity.
*   **Speed / SPD (+1 / Level)**: Increases dodge and double strike probabilities.

---

## 4. Equipment & Inventory

You can store accessories in your inventory grid and equip up to **2 items simultaneously**.

### Accessory Slots & Fusions
*   **Index-based Slots**: Items are tracked by slot positions. If you possess duplicate accessories (e.g. two *Protect Belts*), you can equip both at the same time to stack their bonuses (e.g. `+180 HP`).
*   **Keyblades**: Finding a stronger Keyblade automatically replaces your current wielder weapon. If the found Keyblade is weaker or equal, its essence condenses into a rare accessory instead.

### Item Recycling & Dismantling (♻️)
You can recycle unwanted or duplicate items from your inventory grid at any time:
*   Hover over an accessory cell and click the `♻️` button in the top-left corner.
*   The item will be dismantled and permanently award one of these random bonuses:
    *   **+15 Max HP** ❤️
    *   **+5 Max MP** 💙
    *   **+1 Strength (ATK)** ⚔️
    *   **+1 Magic (MGK)** ✨
*   The inventory grid automatically shifts and preserves your equipped indices.

---

## 5. Player Profile & Achievements

Although a run is wiped on defeat (permadeath), your account-wide **Player Profile** is saved persistently in browser storage (`khlike_profile`) across all journeys.

### Persistent Achievements (15 total)
Check your progress via the **🏆 Achievements** screen:
1.  **Hero of Light**: Beat the game as Sora.
2.  **Seeker of Darkness**: Beat the game as Riku.
3.  **Heartless Skirmisher / Slayer / Champion**: Defeat 10, 50, and 100 Heartless in total.
4.  **Moogle Customer / Benefactor**: Buy 5 and 15 items from the Moogle Shop.
5.  **Keyblade Collector / Master**: Unlock 5 and 15 unique Keyblades.
6.  **Keyhole Sealer / Specialist / Saviour of Worlds**: Seal 1, 4, and all 8 unique worlds.
7.  **Item Collector**: Collect all 12 unique items at least once.
8.  **Seeker of Strength / Limit Break**: Reach Level 30 and Level 50 in any run.
