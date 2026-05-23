/**
 * data.js — Static game data: characters, enemies, worlds, node config
 */

const WORLDS = [
  { name: 'Traverse Town', icon: '<img src="assets/worlds/ttlogo.png" alt="Traverse Town" style="width:45px;height:auto;" />', bg: 'rgba(122, 80, 206, 0.3)' },
  { name: 'Wonderland', icon: '🐱', bg: 'rgba(10,30,40,.3)' },
  { name: 'Deep Jungle', icon: '🌿', bg: 'rgba(10,40,10,.3)' },
  { name: 'Olympus', icon: '⚡', bg: 'rgba(40,30,10,.3)' },
  { name: 'Agrabah', icon: '🏜️', bg: 'rgba(40,25,5,.3)' },
  { name: 'Halloween Town', icon: '🎃', bg: 'rgba(30,5,30,.3)' },
  { name: 'Hollow Bastion', icon: '🏯', bg: 'rgba(10,10,40,.3)' },
  { name: 'End of the World', icon: '🌑', bg: 'rgba(5,5,15,.6)' },
];

// Levels 0-3 → World 0, 4-5 → World 1, etc. (rough mapping)
const LEVEL_TO_WORLD = [0, 0, 1, 1, 2, 3, 4, 5, 6, 7];

// Playable characters for selection — only Sora and Riku for now
const CHARS = [
  { id: 'sora', name: 'Sora', title: 'Chosen by the Keyblade', emoji: '<img src="assets/characters/Sora.png" alt="Sora" style="width:45px;height:auto;" />', selectImg: 'assets/characterselect/SoraC.png', typeName: 'Light', typeColor: '#c9a84c', hp: 130, mp: 80, atk: 20, mgk: 16, spd: 14 },
  { id: 'riku', name: 'Riku', title: 'Chosen by the Keyblade', emoji: '<img src="assets/characters/Riku.png" alt="Riku" style="width:45px;height:auto;" />', selectImg: 'assets/characterselect/RikuC.png', typeName: 'Dark', typeColor: '#9966ff', hp: 115, mp: 60, atk: 28, mgk: 14, spd: 16 },
];

// Base enemy templates — scaled dynamically by level
// Enemy templates used to spawn foes; keep minimal display fields
const ENEMY_TEMPLATES = [
  { id: 'shadow', name: 'Shadow', emoji: '<img src="assets/enemies/Shadow.png" alt="Shadow" style="width:45px;height:auto;" />', baseHp: 40, baseAtk: 10, type: 'Heartless', reward: 'Munny x10' },
  { id: 'soldier', name: 'Soldier', emoji: '<img src="assets/enemies/Soldier.png" alt="Soldier" style="width:45px;height:auto;" />', baseHp: 55, baseAtk: 13, type: 'Heartless', reward: 'Hi-Potion' },
  { id: 'largebody', name: 'Large Body', emoji: '<img src="assets/enemies/Large-body.png" alt="Large Body" style="width:45px;height:auto;" />', baseHp: 80, baseAtk: 18, type: 'Heartless', reward: 'Elixir' },
  { id: 'guardarmor', name: 'Guard Armor', emoji: '<img src="assets/enemies/GuardArmor.png" alt="Guard Armor" style="width:45px;height:auto;" />', baseHp: 150, baseAtk: 20, type: 'Boss', reward: 'Oblivion Shard', isBoss: true },
];

// Mystery events simplified: static descriptions and a result string
const MYSTERY_EVENTS = [
  {
    icon: '📜',
    title: 'Ancient Tome',
    body: 'You find a tome etched in forgotten runes. Power stirs within.',
    effect: (gs) => {
      gs.char.currentMp = gs.char.mp;
      return '+Full MP restored';
    }
  },
  {
    icon: '💊',
    title: 'Ether Fragment',
    body: 'A glowing ether fragment drifts before you.',
    effect: (gs) => {
      const healed = Math.min(gs.char.hp, gs.char.currentHp + 30) - gs.char.currentHp;
      gs.char.currentHp = Math.min(gs.char.hp, gs.char.currentHp + 30);
      return `+${healed} HP restored`;
    }
  },
  {
    icon: '⚔️',
    title: 'Ambush!',
    body: 'Darkness surges! A wave of Heartless catches you off guard.',
    effect: (gs) => {
      gs.char.currentHp = Math.max(0, gs.char.currentHp - 15);
      return '-15 HP (Ambush!)';
    }
  },
  {
    icon: '🌟',
    title: 'Lucky Munny',
    body: 'A treasure falls from the darkness. Jackpot!',
    effect: (gs) => {
      const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      gs.inventory.push(item.id);
      return `Found ${item.icon} ${item.name}`;
    }
  },
  {
    icon: '🔮',
    title: 'Power Crystal',
    body: 'A crystalline shard pulses with raw magic power.',
    effect: (gs) => {
      gs.char.bonusStats = gs.char.bonusStats || { hp: 0, atk: 0, mgk: 0, spd: 0, mp: 0 };
      gs.char.bonusStats.mgk += 2;
      updateCharStats();
      return '+2 MAGIC (permanent)';
    }
  },
  {
    icon: '❤️',
    title: 'Heart\'s Warmth',
    body: 'A soft warmth fills the air. Your heart grows stronger.',
    effect: (gs) => {
      gs.char.bonusStats = gs.char.bonusStats || { hp: 0, atk: 0, mgk: 0, spd: 0, mp: 0 };
      gs.char.bonusStats.hp += 10;
      updateCharStats();
      return '+10 Max HP (permanent)';
    }
  },
];

const NODE_CONFIGS = {
  start: { icon: '<img src="assets/nodes/Battle1.png" alt="Start" style="width:48px;height:auto;" />', label: 'Start', color: 'var(--kh-gold)' },
  battle: { icon: '<img src="assets/nodes/Battle1.png" alt="Battle" style="width:48px;height:auto;" />', label: 'Battle', color: 'var(--kh-gold)' },
  boss: { icon: '<img src="assets/nodes/Boss1.png" alt="Boss" style="width:48px;height:auto;" />', label: 'Boss', color: 'var(--kh-heart)' },
  save: { icon: '<img src="assets/nodes/Save1.png" alt="Save" style="width:48px;height:auto;" />', label: 'Save Point', color: 'var(--kh-green)' },
  chest: { icon: '<img src="assets/nodes/Chest1.png" alt="Chest" style="width:48px;height:auto;" />', label: 'Keyblade Chest', color: 'var(--kh-blue)' },
  mystery: { icon: '<img src="assets/nodes/Secret1.png" alt="Mystery" style="width:48px;height:auto;" />', label: 'Mystery', color: 'var(--kh-dark)' },
  moogle: { icon: '<img src="assets/nodes/Mogushop1.png" alt="Moogle" style="width:48px;height:auto;" />', label: 'Moogle Shop', color: 'var(--kh-ice)' },
  end: { icon: '<img src="assets/nodes/Boss1.png" alt="Final Boss" style="width:48px;height:auto;" />', label: 'Final Boss', color: 'var(--kh-heart)' },
};

// ═══════════════════════════════════════════════════════════════════
// ═══ ITEMS (Equippable - Max 2 at once) ═══════════════════════════
// ═══════════════════════════════════════════════════════════════════

const ITEMS = [
  { id: 'stone-of-power', name: 'Stone of Power', icon: '💠', stat: 'atk', bonus: 3 },
  { id: 'stone-of-wisdom', name: 'Stone of Wisdom', icon: '🔷', stat: 'mgk', bonus: 3 },
  { id: 'stone-of-protection', name: 'Stone of Protection', icon: '🛡️', stat: 'hp', bonus: 15 },
  { id: 'stone-of-speed', name: 'Stone of Speed', icon: '⚡', stat: 'spd', bonus: 2 },
  { id: 'eon-crystal', name: 'Eon Crystal', icon: '💎', stat: 'atk', bonus: 5, mp_bonus: 10 },
  { id: 'heartless-gem', name: 'Heartless Gem', icon: '🖤', stat: 'atk', bonus: 4 },
  { id: 'cure-charm', name: 'Cure Charm', icon: '💚', stat: 'hp', bonus: 25 },
  { id: 'mythril-shard', name: 'Mythril Shard', icon: '✨', stat: 'atk', bonus: 2, mgk_bonus: 2 },
  { id: 'lucid-shard', name: 'Lucid Shard', icon: '🔮', stat: 'mgk', bonus: 4 },
  { id: 'power-crystal', name: 'Power Crystal', icon: '🔴', stat: 'atk', bonus: 6 },
];

// ═══════════════════════════════════════════════════════════════════
// ═══ KEYBLADES ════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════

const KEYBLADES = [
  { id: 'keyblade', name: 'Keyblade', icon: '⚔️', atk: 20, description: 'The original Keyblade. Balanced and true.' },
  { id: 'oblivion', name: 'Oblivion', icon: '🗡️', atk: 27, description: 'Forged in darkness. A weapon of tremendous power.' },
  { id: 'oathkeeper', name: 'Oathkeeper', icon: '💛', atk: 25, description: 'Born of light and promise. A bond made manifest.' },
  { id: 'rainfell', name: 'Rainfell', icon: '🌧️', atk: 23, description: 'Weathered by countless battles. Reliable and true.' },
  { id: 'sleep-stone', name: 'Sleep Stone', icon: '😴', atk: 24, description: 'A keyblade that whispers of dreams.' },
  { id: 'braveheart', name: 'Braveheart', icon: '❤️', atk: 26, description: 'Born of courage. A heart\'s true strength.' },
];

// ═══════════════════════════════════════════════════════════════════
// ═══ STAT GROWTH CONFIGURATION ════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════

const STAT_GROWTH = {
  // Growth per level (level 1 = base + 0, level 2 = base + 1*growth, etc.)
  hp:  5,    // +5 HP per level
  atk: 2,    // +2 ATK per level (+ keyblade & items)
  mgk: 1.5,  // +1.5 MGK per level (rounded)
  spd: 0.75, // +0.75 SPD per level (rounded)
  mp:  2,    // +2 MP per level
};
