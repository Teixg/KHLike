# 🎮 Sistema de Combate Mejorado - KHLike

## 📋 Resumen General

El sistema de combate ha sido mejorado significativamente con un sistema de **leveling**, **items equipables** (máximo 2) y **múltiples keyblades** con distintos poderes. Todos estos elementos contribuyen al daño final en combate y a los stats del personaje.

---

## 🔑 Conceptos Principales

### 1️⃣ **Sistema de Leveling**

El jugador sube de **+1 nivel después de cada batalla ganada**.

**Afecta:**
- Stats base del personaje
- Máximo HP
- Capacidad de daño
- Resistencia

**Variables:**
- `gs.playerLevel` - Nivel actual del jugador (comienza en 1)

**Fórmula de crecimiento por nivel:**

```javascript
const STAT_GROWTH = {
  hp:  5,    // +5 HP por nivel
  atk: 2,    // +2 ATK por nivel
  mgk: 1.5,  // +1.5 MAGIC por nivel
  spd: 0.75, // +0.75 SPD por nivel
  mp:  2,    // +2 MP por nivel
};
```

**Ejemplo:**
- Nivel 1: HP 130, ATK 20
- Nivel 2: HP 135 (+5), ATK 22 (+2)
- Nivel 3: HP 140 (+5), ATK 24 (+2)

---

### 2️⃣ **Sistema de Items**

Hay **10 items diferentes** disponibles en el juego. Solo se pueden **equipar máximo 2 a la vez**.

**Items disponibles:**

| Nombre | Emoji | Efecto | Bonus |
|--------|-------|--------|-------|
| Stone of Power | 💠 | +ATK | 3 |
| Stone of Wisdom | 🔷 | +MAGIC | 3 |
| Stone of Protection | 🛡️ | +HP | 15 |
| Stone of Speed | ⚡ | +SPD | 2 |
| Eon Crystal | 💎 | +ATK, +MP | 5 ATK, 10 MP |
| Heartless Gem | 🖤 | +ATK | 4 |
| Cure Charm | 💚 | +HP | 25 |
| Mythril Shard | ✨ | +ATK, +MAGIC | 2 ATK, 2 MGK |
| Lucid Shard | 🔮 | +MAGIC | 4 |
| Power Crystal | 🔴 | +ATK | 6 |

**Dónde obtenerlos:**
- 📦 Keyblade Chests (45% keyblades, 55% items)
- 🌟 Mystery Events pueden dar items
- 🐾 Moogle Shop (próximamente)

**Cómo equipar:**
1. Abre el panel derecho del mapa
2. Mira "INVENTORY"
3. Haz clic en "Equip" para equipar un item (máximo 2)
4. Haz clic en "Unequip" para desequipar

**Variables:**
- `gs.equippedItems` - Array con IDs de items equipados (máximo 2)
- `gs.inventory` - Array con todos los items obtenidos

---

### 3️⃣ **Sistema de Keyblades**

Hay **6 keyblades diferentes** con distintos poderes de ataque.

**Keyblades disponibles:**

| Nombre | Emoji | ATK | Descripción |
|--------|-------|-----|-------------|
| Keyblade | ⚔️ | 20 | La Keyblade original. Equilibrada y verdadera. |
| Oblivion | 🗡️ | 27 | Forjada en oscuridad. Un arma de tremendo poder. |
| Oathkeeper | 💛 | 25 | Nacida de la luz y la promesa. Un pacto hecho manifiesto. |
| Rainfell | 🌧️ | 23 | Desgastada por innumerables batallas. Confiable y verdadera. |
| Sleep Stone | 😴 | 24 | Una keyblade que susurra de sueños. |
| Braveheart | ❤️ | 26 | Nacida del coraje. La verdadera fuerza de un corazón. |

**Dónde obtenerlas:**
- 📦 Keyblade Chests (45% de probabilidad)
- Automáticamente se desbloquean cuando se encuentran

**Cómo cambiarlas:**
- Se cambian automáticamente cuando se encuentran en un cofre
- El panel derecho siempre muestra la keyblade equipada actualmente

**Variables:**
- `gs.currentKeyblade` - Objeto con la keyblade actualmente equipada

---

## 🧮 Cálculo de Daño Final

El daño final en combate se calcula considerando todos los factores:

```javascript
function calculateFinalStats() {
  // 1. Base stats del personaje
  let finalStats = {
    hp:  baseChar.hp + (level - 1) * STAT_GROWTH.hp,
    atk: baseChar.atk + (level - 1) * STAT_GROWTH.atk,
    mgk: baseChar.mgk + (level - 1) * STAT_GROWTH.mgk,
    spd: baseChar.spd + (level - 1) * STAT_GROWTH.spd,
    mp:  baseChar.mp + (level - 1) * STAT_GROWTH.mp,
  };
  
  // 2. + Bonus de Keyblade (diferencia respecto a keyblade base)
  finalStats.atk += (currentKeyblade.atk - 20);
  
  // 3. + Bonus de Items equipados
  equippedItems.forEach(itemId => {
    const item = ITEMS.find(i => i.id === itemId);
    finalStats[item.stat] += item.bonus;
  });
  
  return finalStats;
}
```

**Ejemplo de cálculo:**

```
Personaje: Sora (ATK base: 20)
Nivel: 5
Keyblade: Oblivion (ATK 27)
Items: Stone of Power (ATK +3), Eon Crystal (ATK +5)

ATK Final = 20 + (5-1)*2 + (27-20) + 3 + 5 = 20 + 8 + 7 + 3 + 5 = 43 ATK
```

---

## 🎬 Flujo de Batalla Mejorado

1. **Inicio de batalla:**
   - Se calcula el daño final del jugador usando `calculateFinalStats()`
   - Se muestra el nivel actual: "Lv. X"
   - Se muestra la keyblade equipada

2. **Durante la batalla:**
   - Cada ataque usa el daño calculado + varianza (-2 a +3)
   - El enemigo ataca normalmente

3. **Victoria:**
   - Se muestra overlay de VICTORY
   - Se sube el nivel en 1
   - Se actualizan los stats automáticamente
   - Se muestran los gains con emojis:
     - ❤️ HP gained
     - ⚔️ ATK gained
     - ✨ MAGIC gained
     - 💙 MP gained

4. **Vuelta al mapa:**
   - Los nuevos stats se reflejan en el panel izquierdo
   - Se puede equipar/desequipar items

---

## 🔧 Funciones Principales

### `calculateFinalStats()`
Calcula todos los stats finales considerando nivel, keyblade e items.

### `updateCharStats()`
Actualiza `gs.char` con los stats finales. Mantiene proporcional el HP actual.

### `toggleEquipItem(itemId)`
Equipa o desequipa un item. Máximo 2 equipados.

### `addInventoryItem(itemId)`
Agrega un item al inventario.

### `unlockKeyblade(keybladeId)`
Desbloquea y equipa una nueva keyblade.

---

## 📊 Datos de Estado

```javascript
// Estado del jugador
gs.playerLevel = 1;                  // Nivel actual
gs.equippedItems = [];               // [id1, id2] máximo
gs.currentKeyblade = { ... };        // Keyblade actual
gs.inventory = [];                   // [itemId1, itemId2, ...]
gs.char = {
  level: gs.playerLevel,
  hp: 130,
  atk: 20,
  mgk: 16,
  spd: 14,
  mp: 80,
  currentHp: 130,
  currentMp: 80,
  bonusStats: { hp: 0, atk: 0, ... } // Bonos permanentes
};
```

---

## 🎨 UI Elements

### Panel Izquierdo (Character)
- Nombre del personaje
- Nivel actual ⭐
- HP actual/máximo
- MP actual/máximo

### Panel Derecho (Keyblade & Items)
```
KEYBLADE
├─ Equipped: ⚔️ Keyblade
├─ ATK: 20

EQUIPPED ITEMS
├─ Slot 1: 💠 Stone of Power (or Empty)
├─ Slot 2: 🛡️ Stone of Protection (or Empty)

INVENTORY
├─ 💠 Stone of Power [Unequip] (if equipped)
├─ 🔷 Stone of Wisdom [Equip]
├─ 🎴 Item Name [Equip/Unequip]
```

---

## 🐛 Debugging

Para ver el estado actual en consola:
```javascript
console.log(gs.playerLevel);           // Nivel actual
console.log(calculateFinalStats());    // Stats finales calculados
console.log(gs.equippedItems);         // Items equipados
console.log(gs.currentKeyblade);       // Keyblade actual
```

---

## 🔮 Próximas Mejoras Sugeridas

1. **Shop System:** Vender/comprar items en tiendas Moogle
2. **Permanent Stat Boosts:** Events que den bonos permanentes
3. **Skill System:** Habilidades especiales por nivel
4. **Difficulty Scaling:** Dificultad aumenta con el progreso
5. **New Game+:** Modo de reinicio con ventajas

---

**Última actualización:** May 2026  
**Versión:** 0.3 - Enhanced Combat System
