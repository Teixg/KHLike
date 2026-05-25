# 🗝️ KHLIKE

Un RPG estilo roguelite inspirado en *Kingdom Hearts: Chain of Memories*, con combate por nodos, mapas por mundos y progresión tipo “run”.

---

## 🎮 Cómo jugar

### 🧭 Objetivo
Avanza por los mundos derrotando enemigos en cada nodo hasta llegar al boss final.  
Al derrotarlo, desbloqueas el siguiente mundo.

---

### 🗺️ Sistema de mapas

Cada mundo genera un mapa vertical independiente:

- Empiezas en la parte superior
- Avanzas nodo a nodo hacia abajo
- Cada nodo puede ser:
  - ⚔️ Combate
  - 💀 Boss
  - 🎁 Cofre
  - ❓ Evento especial (según configuración)

---

### 🌍 Mundos disponibles

El juego está dividido en 8 mundos:

1. Traverse Town  
2. Wonderland  
3. Deep Jungle  
4. Olympus Coliseum  
5. Agrabah  
6. Halloween Town  
7. Hollow Bastion  
8. End of the World  

Cada mundo tiene:
- Enemigos únicos
- Boss propio
- Dificultad progresiva

---

### ⚔️ Combate

- Sistema por turnos simplificado
- Enemigos escalan según el nivel del nodo
- Los bosses no escalan: son encuentros fijos de mundo

---

### 🧠 Progresión

- Cada run empieza desde el mundo 1
- Al derrotar el boss de un mundo:
  - Se genera automáticamente el siguiente mundo
  - Se resetea el mapa
  - Se mantiene el progreso del jugador

---

### 🎒 Sistema de personaje

- HP / MP
- Nivel de jugador
- Keyblade equipada
- Inventario de objetos
- Equipamiento con slots

---

### 🧩 Tipos de nodos

- ⚔️ Battle nodes → enemigos normales
- 💀 Boss nodes → jefe del mundo
- 🎁 Chest nodes → loot
- ❓ Mystery nodes → eventos
- 💾 Save nodes → puntos seguros

---

## 🛠️ Estado del proyecto

Este proyecto está en desarrollo activo.  
El sistema actual ya incluye:

- Mapas generados proceduralmente por mundo
- Progresión limpia entre mundos
- Escalado de enemigos por nodo
- Sistema de combate funcional
- Equipamiento básico

---

## ⚠️ Nota técnica

El sistema ya no usa progresión por “pisos” o niveles globales.  
Toda la progresión depende de:

```js
gs.currentWorldId
gs.currentLevel