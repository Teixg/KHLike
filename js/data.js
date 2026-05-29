
const WORLDS = [
  {
    id: 0,
    name: 'Traverse Town',
    levelRange: [1, 7],
    icon: '<img src="assets/worlds/ttlogo.png" alt="Traverse Town" style="width:45px;height:auto;" />',
    bg: 'rgba(122, 80, 206, 0.3)',
    enemies: ['shadow', 'soldier'],
    boss: 'guardarmor',
  },
  {
    id: 1,
    name: 'Wonderland',
    levelRange: [8, 16],
    icon: '<img src="assets/worlds/wllogo.png" alt="Wonderland" style="width:45px;height:auto;" />',
    bg: 'rgba(10,30,40,.3)',
    enemies: ['rednocturne', 'cardspades', 'cardhearts'],
    boss: 'trickmaster',
  },
  {
    id: 2,
    name: 'Deep Jungle',
    levelRange: [17, 26],
    icon: '<img src="assets/worlds/Deep-Jungle.webp" alt="Deep Jungle" style="width:45px;height:auto;" />',
    bg: 'rgba(10,40,10,.3)',
    enemies: ['powerwild', 'bouncywild', 'creeperplant'],
    boss: 'parasitecage',
  },
  {
    id: 3,
    name: 'Olympus Coliseum',
    levelRange: [27, 37],
    icon: '<img src="assets/worlds/Oclogo.png" alt="Olympus Coliseum" style="width:45px;height:auto;" />',
    bg: 'rgba(40,30,10,.3)',
    enemies: ['tornadostep', 'pirate', 'airsoldier'],
    boss: 'hades',
  },
  {
    id: 4,
    name: 'Agrabah',
    levelRange: [38, 49],
    icon: '<img src="assets/worlds/Aglogo.png" alt="Agrabah" style="width:45px;height:auto;" />',
    bg: 'rgba(40,25,5,.3)',
    enemies: ['bandit', 'fatbandit', 'wizard'],
    boss: 'geniejafar',
  },
  {
    id: 5,
    name: 'Halloween Town',
    levelRange: [50, 62],
    icon: '<img src="assets/worlds/Htlogo.png" alt="Halloween Town" style="width:45px;height:auto;" />',
    bg: 'rgba(30,5,30,.3)',
    enemies: ['wightknight', 'searchghost', 'gargoyle'],
    boss: 'oogieboogie',
  },
  {
    id: 6,
    name: 'Hollow Bastion',
    levelRange: [63, 76],
    icon: '<img src="assets/worlds/Hblogo.png" alt="Hollow Bastion" style="width:45px;height:auto;" />',
    bg: 'rgba(10,10,40,.3)',
    enemies: ['defender', 'wyvern', 'darkball'],
    boss: 'rikureplica',
  },
  {
    id: 7,
    name: 'Castel Oblivion',
    levelRange: [77, 90],
    icon: '<img src="assets/worlds/cologo.png" alt="Castel Oblivion" style="width:45px;height:auto;" />',
    bg: 'rgba(5,5,15,.6)',
    enemies: ['blackfungus', 'organizationXIII', 'neoshadow'],
    boss: 'marluxia',
  },
];


// ═══════════════════════════════════════
// CHARACTERS
// ═══════════════════════════════════════

const CHARS = [
  {
    id: 'sora',
    name: 'Sora',
    title: 'Chosen by the Keyblade',
    emoji: '<img src="assets/characters/Sora.png" alt="Sora" style="width:45px;height:auto;" />',
    selectImg: 'assets/characterselect/SoraC.png',
    typeName: 'Light',
    typeColor: '#c9a84c',

    hp: 130,
    mp: 80,
    atk: 24,
    mgk: 16,
    spd: 15,
  },

  {
    id: 'riku',
    name: 'Riku',
    title: 'Seeker of Darkness',
    emoji: '<img src="assets/characters/Riku.png" alt="Riku" style="width:45px;height:auto;" />',
    selectImg: 'assets/characterselect/RikuC.png',
    typeName: 'Dark',
    typeColor: '#9966ff',

    hp: 115,
    mp: 60,
    atk: 28,
    mgk: 14,
    spd: 20,
  },
];

// ═══════════════════════════════════════
// ENEMIES
// ═══════════════════════════════════════
//
// Valores derivados matemáticamente para cada mundo.
// Objetivo de balance:
//   - Enemigo normal: el jugador lo elimina en ~2 golpes, sobrevive ~6 golpes suyos
//   - Jefe:           el jugador lo elimina en ~12 turnos, muere en ~17 (ratio ~1.4x)
//
// NOTA: los jefes NO usan nodeLevel en getScaledEnemy; escalan por worldId.

const ENEMY_TEMPLATES = [

  // ── Traverse Town (Mundo 0) ────────────────────────────
  {
    id: 'shadow',
    name: 'Shadow',
    icon: '<img src="assets/enemies/Shadow.png" alt="Shadow" style="width:45px;" />',
    iconHeight: 60,
    baseHp: 70,
    baseAtk: 16,
    type: 'Heartless',
    reward: 'Potion',
    worldId: 0,
  },
  {
    id: 'soldier',
    name: 'Soldier',
    icon: '<img src="assets/enemies/Soldier.png" alt="Soldier" style="width:45px;" />',
    iconHeight: 64,
    baseHp: 88,
    baseAtk: 21,
    type: 'Heartless',
    reward: 'Hi-Potion',
    worldId: 0,
  },
  {
    id: 'guardarmor',
    name: 'Guard Armor',
    icon: '<img src="assets/enemies/Guard-Armor.png" alt="Guard Armor" style="width:45px;" />',
    iconHeight: 156,
    baseHp: 650,
    baseAtk: 14,
    type: 'Boss',
    reward: 'Wishing Star',
    isBoss: true,
    worldId: 0,
  },

  // ── Wonderland (Mundo 1) ───────────────────────────────
  {
    id: 'rednocturne',
    name: 'Red Nocturne',
    icon: '<img src="assets/enemies/Red-Nocturne.png" alt="Red Nocturne" style="width:45px;" />',
    iconHeight: 68,
    baseHp: 165,
    baseAtk: 36,
    type: 'Heartless',
    reward: 'Fire Card',
    worldId: 1,
  },
  {
    id: 'cardspades',
    name: 'Card of Spades',
    icon: '<img src="assets/enemies/Card-of-Spades.png" alt="Card of Spades" style="width:45px;" />',
    iconHeight: 72,
    baseHp: 180,
    baseAtk: 38,
    type: 'Heartless',
    reward: 'Blizzard Card',
    worldId: 1,
  },
  {
    id: 'cardhearts',
    name: 'Card of Hearts',
    icon: '<img src="assets/enemies/Card-of-Hearts.png" alt="Card of Hearts" style="width:45px;" />',
    iconHeight: 76,
    baseHp: 200,
    baseAtk: 42,
    type: 'Heartless',
    reward: 'Potion',
    worldId: 1,
  },
  {
    id: 'trickmaster',
    name: 'Trickmaster',
    icon: '<img src="assets/enemies/Trickmaster.png" alt="Trickmaster" style="width:45px;" />',
    iconHeight: 100,
    baseHp: 1280,
    baseAtk: 20,
    type: 'Boss',
    reward: 'Lady Luck',
    isBoss: true,
    worldId: 1,
  },

  // ── Deep Jungle (Mundo 2) ──────────────────────────────
  {
    id: 'powerwild',
    name: 'Powerwild',
    icon: '<img src="assets/enemies/Powerwild.png" alt="Powerwild" style="width:45px;" />',
    iconHeight: 76,
    baseHp: 290,
    baseAtk: 62,
    type: 'Heartless',
    reward: 'Mega Potion',
    worldId: 2,
  },
  {
    id: 'bouncywild',
    name: 'Bouncywild',
    icon: '<img src="assets/enemies/Bouncywild.png" alt="Bouncywild" style="width:45px;" />',
    iconHeight: 78,
    baseHp: 328,
    baseAtk: 66,
    type: 'Heartless',
    reward: 'Ether',
    worldId: 2,
  },
  {
    id: 'creeperplant',
    name: 'Creeper Plant',
    icon: '<img src="assets/enemies/Creeper-Plant.png" alt="Creeper Plant" style="width:45px;" />',
    iconHeight: 74,
    baseHp: 310,
    baseAtk: 64,
    type: 'Heartless',
    reward: 'Aero Card',
    worldId: 2,
  },
  {
    id: 'parasitecage',
    name: 'Parasite Cage',
    icon: '<img src="assets/enemies/Parasite-Cage.png" alt="Parasite Cage" style="width:45px;" />',
    iconHeight: 104,
    baseHp: 2000,
    baseAtk: 28,
    type: 'Boss',
    reward: 'Jungle King',
    isBoss: true,
    worldId: 2,
  },

  // ── Olympus Coliseum (Mundo 3) ─────────────────────────
  {
    id: 'tornadostep',
    name: 'Tornado step',
    icon: '<img src="assets/enemies/Tornado-Step.png" alt="Tornado Step" style="width:45px;" />',
    iconHeight: 70,
    baseHp: 420,
    baseAtk: 88,
    type: 'Heartless',
    reward: "Expert's Ring (+6)",
    worldId: 3,
  },
  {
    id: 'pirate',
    name: 'Pirate',
    icon: '<img src="assets/enemies/Pirate.png" alt="Pirate" style="width:45px;" />',
    iconHeight: 72,
    baseHp: 472,
    baseAtk: 93,
    type: 'Heartless',
    reward: 'Potion',
    worldId: 3,
  },
  {
    id: 'airsoldier',
    name: 'Air Soldier',
    icon: '<img src="assets/enemies/Air-soldier.png" alt="Air Soldier" style="width:45px;" />',
    iconHeight: 76,
    baseHp: 519,
    baseAtk: 85,
    type: 'Heartless',
    reward: 'Elixir',
    worldId: 3,
  },
  {
    id: 'hades',
    name: 'Hades',
    icon: '<img src="assets/enemies/Hades.png" alt="Hades" style="width:45px;" />',
    iconHeight: 98,
    baseHp: 2810,
    baseAtk: 36,
    type: 'Boss',
    reward: 'Olympia',
    isBoss: true,
    worldId: 3,
  },

  // ── Agrabah (Mundo 4) ──────────────────────────────────
  {
    id: 'bandit',
    name: 'Bandit',
    icon: '<img src="assets/enemies/Bandit.png" alt="Bandit" style="width:45px;" />',
    iconHeight: 76,
    baseHp: 580,
    baseAtk: 118,
    type: 'Heartless',
    reward: 'Mega Ether',
    worldId: 4,
  },
  {
    id: 'fatbandit',
    name: 'Fat Bandit',
    icon: '<img src="assets/enemies/Fat-Bandit.png" alt="Fat Bandit" style="width:45px;" />',
    iconHeight: 78,
    baseHp: 695,
    baseAtk: 123,
    type: 'Heartless',
    reward: 'Fire Boost',
    worldId: 4,
  },
  {
    id: 'wizard',
    name: 'Wizard',
    icon: '<img src="assets/enemies/Wizard.png" alt="Wizard" style="width:45px;" />',
    iconHeight: 76,
    baseHp: 632,
    baseAtk: 128,
    type: 'Heartless',
    reward: 'Lucid Shard',
    worldId: 4,
  },
  {
    id: 'geniejafar',
    name: 'Genie Jafar',
    icon: '<img src="assets/enemies/Genie-Jafar.png" alt="Genie Jafar" style="width:45px;" />',
    iconHeight: 102,
    baseHp: 3710,
    baseAtk: 42,
    type: 'Boss',
    reward: 'Three Wishes',
    isBoss: true,
    worldId: 4,
  },

  // ── Halloween Town (Mundo 5) ───────────────────────────
  {
    id: 'wightknight',
    name: 'Wight Knight',
    icon: '<img src="assets/enemies/Wight-Knight.png" alt="Wight Knight" style="width:45px;" />',
    iconHeight: 76,
    baseHp: 750,
    baseAtk: 150,
    type: 'Heartless',
    reward: 'Potion',
    worldId: 5,
  },
  {
    id: 'searchghost',
    name: 'Search Ghost',
    icon: '<img src="assets/enemies/Search-Ghost.png" alt="Search Ghost" style="width:45px;" />',
    iconHeight: 72,
    baseHp: 808,
    baseAtk: 156,
    type: 'Heartless',
    reward: 'Mega Ether',
    worldId: 5,
  },
  {
    id: 'gargoyle',
    name: 'Gargoyle',
    icon: '<img src="assets/enemies/Gargoyle.png" alt="Gargoyle" style="width:45px;" />',
    iconHeight: 80,
    baseHp: 865,
    baseAtk: 145,
    type: 'Heartless',
    reward: 'Full Bloom',
    worldId: 5,
  },
  {
    id: 'oogieboogie',
    name: 'Oogie Boogie',
    icon: '<img src="assets/enemies/Oogie-boogie.png" alt="Oogie Boogie" style="width:45px;" />',
    iconHeight: 106,
    baseHp: 4700,
    baseAtk: 50,
    type: 'Boss',
    reward: 'Pumpkinhead',
    isBoss: true,
    worldId: 5,
  },

  // ── Hollow Bastion (Mundo 6) ───────────────────────────
  {
    id: 'defender',
    name: 'Defender',
    icon: '<img src="assets/enemies/Defender.png" alt="Defender" style="width:45px;" />',
    iconHeight: 74,
    baseHp: 920,
    baseAtk: 183,
    type: 'Heartless',
    reward: 'Power Band',
    worldId: 6,
  },
  {
    id: 'wyvern',
    name: 'Wyvern',
    icon: '<img src="assets/enemies/Wyvern.png" alt="Wyvern" style="width:45px;" />',
    iconHeight: 84,
    baseHp: 1000,
    baseAtk: 192,
    type: 'Heartless',
    reward: 'Mega Potion',
    worldId: 6,
  },
  {
    id: 'darkball',
    name: 'Darkball',
    icon: '<img src="assets/enemies/Dark-Ball.png" alt="Dark Ball" style="width:45px;" />',
    iconHeight: 68,
    baseHp: 1071,
    baseAtk: 186,
    type: 'Heartless',
    reward: 'Dark Matter',
    worldId: 6,
  },
  {
    id: 'rikureplica',
    name: 'Riku Replica',
    icon: '<img src="assets/enemies/Riku-Replica.png" alt="Riku Replica" style="width:45px;" />',
    iconHeight: 100,
    baseHp: 5780,
    baseAtk: 57,
    type: 'Boss',
    reward: 'Divine Rose',
    isBoss: true,
    worldId: 6,
  },

  // ── End of the World (Mundo 7) ─────────────────────────
  {
    id: 'blackfungus',
    name: 'Black Fungus',
    icon: '<img src="assets/enemies/Black-Fungus.png" alt="Black Fungus" style="width:45px;" />',
    iconHeight: 76,
    baseHp: 1200,
    baseAtk: 228,
    type: 'Heartless',
    reward: 'Orichalcum Ring',
    worldId: 7,
  },
  {
    id: 'organizationXIII',
    name: 'Organization XIII',
    icon: '<img src="assets/enemies/Organization-XIII.png" alt="Organization XIII" style="width:45px;" />',
    iconHeight: 72,
    baseHp: 1208,
    baseAtk: 231,
    type: 'Heartless',
    reward: 'Mega Elixir',
    worldId: 7,
  },
  {
    id: 'neoshadow',
    name: 'Neo Shadow',
    icon: '<img src="assets/enemies/Neoshadow.png" alt="Neo Shadow" style="width:45px;" />',
    iconHeight: 82,
    baseHp: 1294,
    baseAtk: 240,
    type: 'Heartless',
    reward: 'Ultima Fragment',
    worldId: 7,
  },
  {
    id: 'marluxia',
    name: 'Marluxia',
    icon: '<img src="assets/enemies/Specter.png" alt="Specter" style="width:45px;" />',
    iconHeight: 108,
    baseHp: 6950,
    baseAtk: 63,
    type: 'Final Boss',
    reward: 'Oblivion',
    isBoss: true,
    isFinal: true,
    worldId: 7,
  },
];

// ═══════════════════════════════════════
// STAT ICONS
// ═══════════════════════════════════════

const STAT_ICONS = {
  hp: '<img src="assets/extras/Hp-up.png" alt="HP" class="stat-icon-img" />',
  atk: '<img src="assets/extras/DmgUp.png" alt="ATK" class="stat-icon-img" />',
  mp: '💙',
  mgk: '✨',
  spd: '⚡'
};

// ═══════════════════════════════════════
// ITEMS
// ═══════════════════════════════════════

const ITEMS = [
  { id: 'panuelo-duende', name: 'Elven Bandana', icon: '<img src="assets/items/Elven-Bandana.webp" alt="Elven Bandana" class="item-icon-img" />', stat: 'spd', bonus: 8 },
  { id: 'cinto-protecto', name: 'Protect Belt', icon: '<img src="assets/items/Protect-Belt.webp" alt="Protect Belt" class="item-icon-img" />', stat: 'hp', bonus: 90 },
  { id: 'banda-poder', name: 'Power Band', icon: '<img src="assets/items/Power-band.webp" alt="Power Band" class="item-icon-img" />', stat: 'hp', bonus: 120 },
  { id: 'cadena-aegis', name: 'Aegis Chain', icon: '<img src="assets/items/Aegis-Chain.webp" alt="Aegis Chain" class="item-icon-img" />', stat: 'hp', bonus: 150 },
  { id: 'cadena-cosmica', name: 'Cosmic Chain', icon: '<img src="assets/items/Cosmic-chain.webp" alt="Cosmic Chain" class="item-icon-img" />', stat: 'hp', bonus: 200 },
  { id: 'dije-galvanico', name: 'Shock Charm', icon: '<img src="assets/items/Shock-Charm.webp" alt="Shock Charm" class="item-icon-img" />', stat: 'mgk', bonus: 12 },
  { id: 'anillo-experto', name: "Expert's Ring (+6)", icon: '<img src="assets/items/Expert-ring.webp" alt="Expert\'s Ring (+6)" class="item-icon-img" />', stat: 'atk', bonus: 12 },
  { id: 'plenaflor', name: 'Full Bloom', icon: '<img src="assets/items/Full-Bloom.webp" alt="Full Bloom" class="item-icon-img" />', stat: 'atk', bonus: 18 },
  { id: 'cadena-nocturna', name: 'Midnight Anklet', icon: '<img src="assets/items/Midnight-Anklet.webp" alt="Midnight Anklet" class="item-icon-img" />', stat: 'hp', bonus: 130 },
  { id: 'anillo-oricalco', name: 'Orichalcum Ring', icon: '<img src="assets/items/Orichalcum-Ring.webp" alt="Orichalcum Ring" class="item-icon-img" />', stat: 'atk', bonus: 14 },
  { id: 'talisman-estelar', name: 'Star Charm', icon: '<img src="assets/items/Star-Charm.webp" alt="Star Charm" class="item-icon-img" />', stat: 'atk', bonus: 22 },
  { id: 'anillo-maestro', name: "Master's Ring (+7)", icon: '<img src="assets/items/Master\'s-Ring.webp" alt="Master\'s Ring (+7)" class="item-icon-img" />', stat: 'atk', bonus: 15 },
];

// ═══════════════════════════════════════
// KEYBLADES
// ═══════════════════════════════════════
// Stats derived from Kingdom Hearts: Chain of Memories wiki
// https://kingdomhearts.fandom.com/wiki/Attack_cards

const KEYBLADES = [
  { id: 'kingdomkey', name: 'Kingdom Key', icon: '<img src="assets/keyblades/Kingdom-key.png" alt="Kingdom Key" style="width:20px;height:auto;" />', atk: 20, world: 0, description: 'Balanced and reliable.' },
  { id: 'wishingstar', name: 'Wishing Star', icon: '<img src="assets/keyblades/Wishing-star.png" alt="Wishing Star" style="width:20px;height:auto;" />', atk: 28, world: 0, description: 'Not very powerful, but very easy to handle.' },
  { id: 'ladyluck', name: 'Lady Luck', icon: '<img src="assets/keyblades/Lady-luck.png" alt="Lady Luck" style="width:20px;height:auto;" />', atk: 35, world: 1, description: 'A balanced weapon that is easy to handle.' },
  { id: 'crabclaw', name: 'Crabclaw', icon: '<img src="assets/keyblades/Crabclaw.png" alt="Crabclaw" style="width:20px;height:auto;" />', atk: 42, world: 2, description: 'Easy to handle with impressive recovery.' },
  { id: 'fairyharp', name: 'Fairy Harp', icon: '<img src="assets/keyblades/Fairy-harp.png" alt="Fairy Harp" style="width:20px;height:auto;" />', atk: 48, world: 3, description: 'Easy to handle with formidable swing speed.' },
  { id: 'olympia', name: 'Olympia', icon: '<img src="assets/keyblades/Olympia.png" alt="Olympia" style="width:20px;height:auto;" />', atk: 58, world: 3, description: 'Powerful with quick recovery after card breaks.' },
  { id: 'threewishes', name: 'Three Wishes', icon: '<img src="assets/keyblades/Three-wishes.png" alt="Three Wishes" style="width:20px;height:auto;" />', atk: 65, world: 4, description: 'Fairly strong with a fast swing.' },
  { id: 'pumpkinhead', name: 'Pumpkinhead', icon: '<img src="assets/keyblades/Pumpkinhead.png" alt="Pumpkinhead" style="width:20px;height:auto;" />', atk: 75, world: 5, description: 'Easy to handle with fast recovery.' },
  { id: 'spellbinder', name: 'Spellbinder', icon: '<img src="assets/keyblades/Spellbinder.png" alt="Spellbinder" style="width:20px;height:auto;" />', atk: 82, world: 5, description: 'Lightning-based special attack card.' },
  { id: 'metalchocobo', name: 'Metal Chocobo', icon: '<img src="assets/keyblades/Metal-Chocobo.png" alt="Metal Chocobo" style="width:20px;height:auto;" />', atk: 88, world: 6, description: 'Special attack card. Breaks physical defenses.' },
  { id: 'lionheart', name: 'Lionheart', icon: '<img src="assets/keyblades/Lionheart.png" alt="Lionheart" style="width:20px;height:auto;" />', atk: 90, world: 6, description: 'Fire-based special attack card.' },
  { id: 'divinerose', name: 'Divine Rose', icon: '<img src="assets/keyblades/Divine-rose.png" alt="Divine Rose" style="width:20px;height:auto;" />', atk: 98, world: 6, description: 'Powerful strike with fast swing.' },
  { id: 'oathkeeper', name: 'Oathkeeper', icon: '<img src="assets/keyblades/Oathkeeper.png" alt="Oathkeeper" style="width:20px;height:auto;" />', atk: 105, world: 6, description: 'Well-balanced with very powerful thrust.' },
  { id: 'diamonddust', name: 'Diamond Dust', icon: '<img src="assets/keyblades/Diamond-dust.png" alt="Diamond Dust" style="width:20px;height:auto;" />', atk: 110, world: 7, description: 'Ice-based special attack. Powerful and easy to handle.' },
  { id: 'onewingedangel', name: 'One-Winged Angel', icon: '<img src="assets/keyblades/One-Winged-Angel.png" alt="One-Winged Angel" style="width:20px;height:auto;" />', atk: 115, world: 7, description: 'Fire-based special attack with exceptional combo finish.' },
  { id: 'souleater', name: 'Soul Eater', icon: '<img src="assets/keyblades/Soul-Eater.png" alt="Soul Eater" style="width:20px;height:auto;" />', atk: 120, world: 7, description: 'Darkness embraced. A weapon of pure malice.' },
  { id: 'oblivion', name: 'Oblivion', icon: '<img src="assets/keyblades/Oblivion.png" alt="Oblivion" style="width:45px;height:auto;" />', atk: 125, world: 7, description: 'Breaks physical defenses. First-class strength.' },
  { id: 'ultimaweapon', name: 'Ultima Weapon', icon: '<img src="assets/keyblades/Ultima-weapon.png" alt="Ultima Weapon" style="width:45px;height:auto;" />', atk: 135, world: 7, description: 'The strongest attack card to be found.' },
];

// ═══════════════════════════════════════
// MYSTERY EVENTS
// ═══════════════════════════════════════

const MYSTERY_EVENTS = [
  {
    icon: '<img src="assets/events/Namine.png" alt="Namine" />',
    title: 'Namine\'s Sketchbook',
    body: '"I\'ll draw a new memory in your heart..." Namine\'s sketching replenishes your magical energy.',
    effect: (gs) => {
      gs.char.currentMp = gs.char.mp;
      return '+Full MP restored';
    }
  },
  {
    icon: '<img src="assets/events/Aerith.png" alt="Aerith" />',
    title: 'Aerith\'s Prayer',
    body: '"You\'ll be okay." Aerith offers a warm prayer, restoring your vitality.',
    effect: (gs) => {
      const gain = Math.round(gs.char.hp * 0.25);
      gs.char.currentHp = Math.min(gs.char.hp, gs.char.currentHp + gain);
      return `+${gain} HP`;
    }
  },
  {
    icon: '<img src="assets/events/Jack-Skellington.png" alt="Jack Skellington" />',
    title: 'Jack\'s Spooky Trick',
    body: '"Happy Halloween!" Jack Skellington shows you a terrifying scare package that startles you!',
    effect: (gs) => {
      const dmg = Math.round(gs.char.hp * 0.12);
      gs.char.currentHp = Math.max(1, gs.char.currentHp - dmg);
      return `-${dmg} HP`;
    }
  },
  {
    icon: '<img src="assets/events/Kairi.png" alt="Kairi" />',
    title: 'Kairi\'s Wayfinder',
    body: '"Take this. It\'s a lucky charm." Kairi gives you a token of friendship.',
    effect: (gs) => {
      const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      if (typeof addInventoryItem === 'function') {
        addInventoryItem(item.id);
      } else {
        gs.inventory.push(item.id);
      }
      return `Found ${item.name}`;
    }
  },
  {
    icon: '<img src="assets/events/Hercules.png" alt="Hercules" />',
    title: 'Hercules\' Training',
    body: '"Rule number one: a hero never gives up!" Hercules helps you train to unlock your true strength.',
    effect: (gs) => {
      gs.char.bonusStats.atk += 8;
      updateCharStats();
      return '+8 ATK permanently';
    }
  },
];

// ═══════════════════════════════════════
// ACHIEVEMENTS
// ═══════════════════════════════════════

const ACHIEVEMENTS = [
  {
    id: 'sora_victory',
    name: 'Hero of Light',
    desc: 'Complete the journey and save the worlds as Sora.',
    icon: '<img src="assets/characters/Sora.png" class="achievement-icon-img" />',
    maxProgress: 1
  },
  {
    id: 'riku_victory',
    name: 'Seeker of Darkness',
    desc: 'Complete the journey and conquer the darkness as Riku.',
    icon: '<img src="assets/characters/Riku.png" class="achievement-icon-img" />',
    maxProgress: 1
  },
  {
    id: 'kills_10',
    name: 'Heartless Skirmisher',
    desc: 'Defeat 10 Heartless across all journeys.',
    icon: '<img src="assets/enemies/Red-Nocturne.png" class="achievement-icon-img" />',
    maxProgress: 10
  },
  {
    id: 'kills_50',
    name: 'Heartless Slayer',
    desc: 'Defeat 50 Heartless across all journeys.',
    icon: '<img src="assets/enemies/Guard-Armor.png" class="achievement-icon-img" />',
    maxProgress: 50
  },
  {
    id: 'moogle_shop',
    name: 'Moogle Customer',
    desc: 'Acquire 5 items from the Moogle Shop.',
    icon: '<img src="assets/npc/Moogle.png" class="achievement-icon-img" />',
    maxProgress: 5
  },
  {
    id: 'keyblades_5',
    name: 'Keyblade Collector',
    desc: 'Collect 5 different Keyblades across all runs.',
    icon: '<img src="assets/keyblades/Kingdom-key.png" class="achievement-icon-img" style="width:28px;height:auto;" />',
    maxProgress: 5
  },
  {
    id: 'keyblades_15',
    name: 'Keyblade Master',
    desc: 'Collect 15 different Keyblades across all runs.',
    icon: '<img src="assets/keyblades/Ultima-weapon.png" class="achievement-icon-img" style="width:28px;height:auto;" />',
    maxProgress: 15
  },
  {
    id: 'first_keyhole',
    name: 'Keyhole Sealer',
    desc: 'Seal a world\'s keyhole for the first time by defeating a world boss.',
    icon: '<img src="assets/extras/key.gif" class="achievement-icon-img" style="width:28px;height:auto;" />',
    maxProgress: 1
  },
  {
    id: 'kills_100',
    name: 'Heartless Champion',
    desc: 'Defeat 100 Heartless across all journeys.',
    icon: '<img src="assets/enemies/Neoshadow.png" class="achievement-icon-img" />',
    maxProgress: 100
  },
  {
    id: 'all_items',
    name: 'Item Collector',
    desc: 'Collect all 12 unique items/accessories across all runs.',
    icon: '<img src="assets/items/Star-Charm.webp" class="achievement-icon-img" style="width:28px;height:auto;" />',
    maxProgress: 12
  },
  {
    id: 'level_30',
    name: 'Seeker of Strength',
    desc: 'Reach Level 30 in any run.',
    icon: '<img src="assets/extras/Hp-up.png" class="achievement-icon-img" style="width:24px;height:auto;" />',
    maxProgress: 30
  },
  {
    id: 'level_50',
    name: 'Limit Break',
    desc: 'Reach Level 50 in any run.',
    icon: '<img src="assets/extras/DmgUp.png" class="achievement-icon-img" style="width:24px;height:auto;" />',
    maxProgress: 50
  },
  {
    id: 'keyholes_4',
    name: 'Keyhole Specialist',
    desc: 'Seal 4 different world keyholes.',
    icon: '🗝️',
    maxProgress: 4
  },
  {
    id: 'all_keyholes',
    name: 'Saviour of Worlds',
    desc: 'Seal all 8 unique world keyholes.',
    icon: '👑',
    maxProgress: 8
  },
  {
    id: 'moogle_shop_15',
    name: 'Moogle Benefactor',
    desc: 'Acquire 15 items from the Moogle Shop.',
    icon: '<img src="assets/npc/Moogle.png" class="achievement-icon-img" style="width:24px;height:auto;" />',
    maxProgress: 15
  }
];

// ═══════════════════════════════════════
// NODES
// ═══════════════════════════════════════

const NODE_CONFIGS = {
  start: { icon: '<img src="assets/nodes/Start1.png" alt="Start" style="width:48px;height:auto;" />', label: 'Start', color: 'var(--kh-gold)' },
  battle: { icon: '<img src="assets/nodes/Battle1.png" alt="Battle" style="width:48px;height:auto;" />', label: 'Battle', color: 'var(--kh-gold)' },
  elite: { icon: '💀', label: 'Elite Battle', color: '#ff4444' },
  boss: { icon: '<img src="assets/nodes/Boss1.png" alt="Boss" style="width:48px;height:auto;" />', label: 'Boss', color: 'var(--kh-heart)' },
  save: { icon: '<img src="assets/nodes/Save1.png" alt="Save" style="width:48px;height:auto;" />', label: 'Save Point', color: 'var(--kh-green)' },
  chest: { icon: '<img src="assets/nodes/Chest1.png" alt="Chest" style="width:48px;height:auto;" />', label: 'Keyblade Chest', color: 'var(--kh-blue)' },
  mystery: { icon: '<img src="assets/nodes/Secret1.png" alt="Mystery" style="width:48px;height:auto;" />', label: 'Mystery', color: 'var(--kh-dark)' },
  moogle: { icon: '<img src="assets/nodes/Mogushop1.png" alt="Moogle" style="width:48px;height:auto;" />', label: 'Moogle Shop', color: 'var(--kh-ice)' },
  organization: { icon: '🌹', label: 'Organization XIII', color: '#aa00ff' },
  end: { icon: '<img src="assets/nodes/Boss1.png" alt="Final Boss" style="width:48px;height:auto;" />', label: 'Final Boss', color: '#ff0033' },
};

// ═══════════════════════════════════════
// WORLD & ENEMY VALIDATION
// ═══════════════════════════════════════

function validateWorldEnemies() {
  for (const world of WORLDS) {
    for (const enemyId of world.enemies) {
      const enemy = ENEMY_TEMPLATES.find(e => e.id === enemyId);
      if (!enemy) {
        console.error(`ERROR: Enemy "${enemyId}" not found in ENEMY_TEMPLATES for world "${world.name}"`);
      } else if (enemy.worldId !== world.id) {
        console.warn(`WARNING: Enemy "${enemyId}" worldId mismatch in world "${world.name}"`);
      }
    }
    const bossEnemy = ENEMY_TEMPLATES.find(e => e.id === world.boss);
    if (!bossEnemy) {
      console.error(`ERROR: Boss "${world.boss}" not found in ENEMY_TEMPLATES for world "${world.name}"`);
    }
  }
  console.log('✓ World/Enemy validation complete');
}

// ═══════════════════════════════════════
// STAT GROWTH
// ═══════════════════════════════════════

const STAT_GROWTH = {
  hp: 18,   // era 8  → subido para que el jugador aguante los jefes tardíos
  atk: 8,   // era 3  → subido para que el daño crezca con significativamente
  mgk: 3,
  mp: 4,
  spd: 1,
};

// ═══════════════════════════════════════
// ENEMY SCALING — única definición canónica
// ═══════════════════════════════════════

function getScaledEnemy(enemy, nodeLevel = 0) {
  if (!enemy || enemy.baseHp == null || enemy.baseAtk == null) {
    console.error('Invalid enemy template:', enemy);
    return null;
  }

  let scaledHp, scaledAtk;

  if (enemy.isBoss) {
    // Los jefes escalan por worldId, NO por nodeLevel.
    // Esto evita la inflación exponencial que hacía imposible ganar.
    const worldScale = 1 + (enemy.worldId || 0) * 0.12;
    scaledHp = Math.floor(enemy.baseHp * worldScale);
    scaledAtk = Math.floor(enemy.baseAtk * worldScale);
  } else {
    // Enemigos normales: escalan suavemente con la profundidad del nodo
    const nodeScale = 1 + nodeLevel * 0.10;
    const nodeAtkScale = 1 + nodeLevel * 0.07;
    scaledHp = Math.floor(enemy.baseHp * nodeScale);
    scaledAtk = Math.floor(enemy.baseAtk * nodeAtkScale);
  }

  const scaled = {
    ...enemy,
    hp: scaledHp,
    currentHp: scaledHp,
    atk: scaledAtk,
    rewards: {
      xp: Math.floor((enemy.rewards?.xp || 20) * (1 + nodeLevel * 0.15)),
      munny: Math.floor((enemy.rewards?.munny || 10) * (1 + nodeLevel * 0.15)),
    },
  };

  console.log(`getScaledEnemy: ${enemy.name} [nodeLevel=${nodeLevel}] → hp=${scaled.hp}, atk=${scaled.atk}`);
  return scaled;
}
