
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
    icon: '🐱',
    bg: 'rgba(10,30,40,.3)',
    enemies: ['rednocturne', 'bluerhapsody', 'creeperplant'],
    boss: 'trickmaster',
  },
  {
    id: 2,
    name: 'Deep Jungle',
    levelRange: [17, 26],
    icon: '🌿',
    bg: 'rgba(10,40,10,.3)',
    enemies: ['powerwild', 'bouncywild', 'airsoldier'],
    boss: 'parasitecage',
  },
  {
    id: 3,
    name: 'Olympus Coliseum',
    levelRange: [27, 37],
    icon: '⚡',
    bg: 'rgba(40,30,10,.3)',
    enemies: ['barrelspider', 'pirate', 'largebody'],
    boss: 'cerberus',
  },
  {
    id: 4,
    name: 'Agrabah',
    levelRange: [38, 49],
    icon: '🏜️',
    bg: 'rgba(40,25,5,.3)',
    enemies: ['bandit', 'fatbandit', 'wizard'],
    boss: 'geniejafar',
  },
  {
    id: 5,
    name: 'Halloween Town',
    levelRange: [50, 62],
    icon: '🎃',
    bg: 'rgba(30,5,30,.3)',
    enemies: ['wightknight', 'searchghost', 'gargoyle'],
    boss: 'oogieboogie',
  },
  {
    id: 6,
    name: 'Hollow Bastion',
    levelRange: [63, 76],
    icon: '🏯',
    bg: 'rgba(10,10,40,.3)',
    enemies: ['defender', 'wyvern', 'darkball'],
    boss: 'rikureplica',
  },
  {
    id: 7,
    name: 'End of the World',
    levelRange: [77, 90],
    icon: '🌑',
    bg: 'rgba(5,5,15,.6)',
    enemies: ['invisible', 'angelstar', 'neoshadow'],
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
    icon: '<img src="assets/enemies/Shadow.png" alt="Shadow" style="width:45px;height:auto;" />',
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
    icon: '<img src="assets/enemies/Soldier.png" alt="Soldier" style="width:45px;height:auto;" />',
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
    icon: '<img src="assets/enemies/Guard-Armor.png" alt="Guard Armor" style="width:45px;height:auto;" />',
    iconHeight: 96,
    baseHp: 650,
    baseAtk: 6,
    type: 'Boss',
    reward: 'Wishing Star',
    isBoss: true,
    worldId: 0,
  },

  // ── Wonderland (Mundo 1) ───────────────────────────────
  {
    id: 'rednocturne',
    name: 'Red Nocturne',
    icon: '<img src="assets/enemies/Red-Nocturne.png" alt="Red Nocturne" style="width:45px;height:auto;" />',
    iconHeight: 68,
    baseHp: 165,
    baseAtk: 36,
    type: 'Heartless',
    reward: 'Fire Card',
    worldId: 1,
  },
  {
    id: 'bluerhapsody',
    name: 'Blue Rhapsody',
    icon: '<img src="assets/enemies/Blue-Rhapsody.png" alt="Blue Rhapsody" style="width:45px;height:auto;" />',
    iconHeight: 72,
    baseHp: 180,
    baseAtk: 38,
    type: 'Heartless',
    reward: 'Blizzard Card',
    worldId: 1,
  },
  {
    id: 'creeperplant',
    name: 'Creeper Plant',
    icon: '<img src="assets/enemies/Creeper-Plant.png" alt="Creeper Plant" style="width:45px;height:auto;" />',
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
    icon: '<img src="assets/enemies/Trickmaster.png" alt="Trickmaster" style="width:45px;height:auto;" />',
    iconHeight: 100,
    baseHp: 1280,
    baseAtk: 14,
    type: 'Boss',
    reward: 'Lady Luck',
    isBoss: true,
    worldId: 1,
  },

  // ── Deep Jungle (Mundo 2) ──────────────────────────────
  {
    id: 'powerwild',
    name: 'Powerwild',
    icon: '<img src="assets/enemies/Powerwild.png" alt="Powerwild" style="width:45px;height:auto;" />',
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
    icon: '<img src="assets/enemies/Bouncywild.png" alt="Bouncywild" style="width:45px;height:auto;" />',
    iconHeight: 78,
    baseHp: 328,
    baseAtk: 66,
    type: 'Heartless',
    reward: 'Ether',
    worldId: 2,
  },
  {
    id: 'airsoldier',
    name: 'Air Soldier',
    icon: '<img src="assets/enemies/Air-soldier.png" alt="Air Soldier" style="width:45px;height:auto;" />',
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
    icon: '<img src="assets/enemies/Parasite-Cage.png" alt="Parasite Cage" style="width:45px;height:auto;" />',
    iconHeight: 104,
    baseHp: 2000,
    baseAtk: 23,
    type: 'Boss',
    reward: 'Jungle King',
    isBoss: true,
    worldId: 2,
  },

  // ── Olympus Coliseum (Mundo 3) ─────────────────────────
  {
    id: 'barrelspider',
    name: 'Barrel Spider',
    icon: '<img src="assets/enemies/Barrel-Spider.png" alt="Barrel Spider" style="width:45px;height:auto;" />',
    iconHeight: 70,
    baseHp: 420,
    baseAtk: 88,
    type: 'Heartless',
    reward: 'Anillo de experto (+6)',
    worldId: 3,
  },
  {
    id: 'pirate',
    name: 'Pirate',
    icon: '<img src="assets/enemies/Pirate.png" alt="Pirate" style="width:45px;height:auto;" />',
    iconHeight: 72,
    baseHp: 472,
    baseAtk: 93,
    type: 'Heartless',
    reward: 'Potion',
    worldId: 3,
  },
  {
    id: 'largebody',
    name: 'Large Body',
    icon: '<img src="assets/enemies/Large-body.png" alt="Large Body" style="width:45px;height:auto;" />',
    iconHeight: 76,
    baseHp: 519,
    baseAtk: 85,
    type: 'Heartless',
    reward: 'Elixir',
    worldId: 3,
  },
  {
    id: 'cerberus',
    name: 'Cerberus',
    icon: '🐕',
    iconHeight: 98,
    baseHp: 2810,
    baseAtk: 33,
    type: 'Boss',
    reward: 'Olympia',
    isBoss: true,
    worldId: 3,
  },

  // ── Agrabah (Mundo 4) ──────────────────────────────────
  {
    id: 'bandit',
    name: 'Bandit',
    icon: '<img src="assets/enemies/Bandit.png" alt="Bandit" style="width:45px;height:auto;" />',
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
    icon: '<img src="assets/enemies/Fat-Bandit.png" alt="Fat Bandit" style="width:45px;height:auto;" />',
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
    icon: '<img src="assets/enemies/Wizard.png" alt="Wizard" style="width:45px;height:auto;" />',
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
    icon: '<img src="assets/enemies/Genie-Jafar.png" alt="Genie Jafar" style="width:45px;height:auto;" />',
    iconHeight: 102,
    baseHp: 3710,
    baseAtk: 45,
    type: 'Boss',
    reward: 'Three Wishes',
    isBoss: true,
    worldId: 4,
  },

  // ── Halloween Town (Mundo 5) ───────────────────────────
  {
    id: 'wightknight',
    name: 'Wight Knight',
    icon: '<img src="assets/enemies/Wight-Knight.png" alt="Wight Knight" style="width:45px;height:auto;" />',
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
    icon: '<img src="assets/enemies/Search-Ghost.png" alt="Search Ghost" style="width:45px;height:auto;" />',
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
    icon: '<img src="assets/enemies/Gargoyle.png" alt="Gargoyle" style="width:45px;height:auto;" />',
    iconHeight: 80,
    baseHp: 865,
    baseAtk: 145,
    type: 'Heartless',
    reward: 'Plenaflor',
    worldId: 5,
  },
  {
    id: 'oogieboogie',
    name: 'Oogie Boogie',
    icon: '<img src="assets/enemies/Darkside.png" alt="Oogie Boogie" style="width:45px;height:auto;" />',
    iconHeight: 106,
    baseHp: 4700,
    baseAtk: 57,
    type: 'Boss',
    reward: 'Pumpkinhead',
    isBoss: true,
    worldId: 5,
  },

  // ── Hollow Bastion (Mundo 6) ───────────────────────────
  {
    id: 'defender',
    name: 'Defender',
    icon: '<img src="assets/enemies/Defender.png" alt="Defender" style="width:45px;height:auto;" />',
    iconHeight: 74,
    baseHp: 920,
    baseAtk: 183,
    type: 'Heartless',
    reward: 'Banda de poder',
    worldId: 6,
  },
  {
    id: 'wyvern',
    name: 'Wyvern',
    icon: '<img src="assets/enemies/Wyvern.png" alt="Wyvern" style="width:45px;height:auto;" />',
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
    icon: '<img src="assets/enemies/Dark-Ball.png" alt="Dark Ball" style="width:45px;height:auto;" />',
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
    icon: '<img src="assets/enemies/Organization-XIII.png" alt="Riku Replica" style="width:45px;height:auto;" />',
    iconHeight: 100,
    baseHp: 5780,
    baseAtk: 71,
    type: 'Boss',
    reward: 'Divine Rose',
    isBoss: true,
    worldId: 6,
  },

  // ── End of the World (Mundo 7) ─────────────────────────
  {
    id: 'invisible',
    name: 'Invisible',
    icon: '👁️',
    iconHeight: 76,
    baseHp: 1200,
    baseAtk: 228,
    type: 'Heartless',
    reward: 'Anillo oricalco',
    worldId: 7,
  },
  {
    id: 'angelstar',
    name: 'Angel Star',
    icon: '⭐',
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
    icon: '<img src="assets/enemies/Neoshadow.png" alt="Neo Shadow" style="width:45px;height:auto;" />',
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
    icon: '🌹',
    iconHeight: 108,
    baseHp: 6950,
    baseAtk: 86,
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
  { id: 'panuelo-duende', name: 'Pañuelo duende', icon: '<img src="assets/items/Elven-Bandana.webp" alt="Pañuelo duende" class="item-icon-img" />', stat: 'spd', bonus: 8 },
  { id: 'cinto-protecto', name: 'Cinto protecto', icon: '<img src="assets/items/Protect-Belt.webp" alt="Cinto protecto" class="item-icon-img" />', stat: 'hp', bonus: 90 },
  { id: 'banda-poder', name: 'Banda de poder', icon: '<img src="assets/items/Power-band.webp" alt="Banda de poder" class="item-icon-img" />', stat: 'hp', bonus: 120 },
  { id: 'cadena-aegis', name: 'Cadena de aegis', icon: '<img src="assets/items/Aegis-Chain.webp" alt="Cadena de aegis" class="item-icon-img" />', stat: 'hp', bonus: 150 },
  { id: 'cadena-cosmica', name: 'Cadena Cosmica', icon: '<img src="assets/items/Cosmic-chain.webp" alt="Cadena Cosmica" class="item-icon-img" />', stat: 'hp', bonus: 200 },
  { id: 'dije-galvanico', name: 'Dije galvanico', icon: '<img src="assets/items/Shock-Charm.webp" alt="Dije galvanico" class="item-icon-img" />', stat: 'mgk', bonus: 12 },
  { id: 'anillo-experto-6', name: 'Anillo de experto (+6)', icon: '<img src="assets/items/Expert-ring.webp" alt="Anillo de experto (+6)" class="item-icon-img" />', stat: 'atk', bonus: 12 },
  { id: 'plenaflor', name: 'Plenaflor', icon: '<img src="assets/items/Full-Bloom.webp" alt="Plenaflor" class="item-icon-img" />', stat: 'atk', bonus: 18 },
  { id: 'cadena-nocturna', name: 'Cadena nocturna', icon: '<img src="assets/items/Midnight-Anklet.webp" alt="Cadena nocturna" class="item-icon-img" />', stat: 'hp', bonus: 130 },
  { id: 'anillo-oricalco', name: 'Anillo oricalco', icon: '<img src="assets/items/Orichalcum-Ring.webp" alt="Anillo oricalco" class="item-icon-img" />', stat: 'atk', bonus: 14 },
  { id: 'talisman-estelar', name: 'Talisman estelar', icon: '<img src="assets/items/Star-Charm.webp" alt="Talisman estelar" class="item-icon-img" />', stat: 'atk', bonus: 22 },
  { id: 'anillo-experto-7', name: 'Anillo de experto (+7)', icon: '<img src="assets/items/Master\'s-Ring.webp" alt="Anillo de experto (+7)" class="item-icon-img" />', stat: 'atk', bonus: 15 },
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
      gs.inventory.push(item.id);
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
