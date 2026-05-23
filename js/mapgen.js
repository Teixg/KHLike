/**
 * mapgen.js — Procedural map generation (Slay the Spire style directed graph)
 *
 * Map structure:
 *   - TOTAL_LEVELS levels (rows)
 *   - Level 0: single START node (auto-visited)
 *   - Levels 1..N-2: 2-3 nodes each with random types
 *   - Level N-1: single BOSS/END node
 *
 * Each node stores its level, horizontal position index, type,
 * outgoing connections (to next level), and state flags.
 */

const MAP_LEVELS = 10; // including start (0) and boss (last)

function randomNodeType(level, totalLevels) {
  if (level === 0)              return 'start';
  if (level === totalLevels-1) return 'end';
  const r = Math.random();
  // Boss midpoint around level 5
  if (level === Math.floor(totalLevels / 2)) {
    if (r < 0.35) return 'boss';
  }
  if (r < 0.50) return 'battle';
  if (r < 0.65) return 'save';
  if (r < 0.77) return 'chest';
  if (r < 0.89) return 'mystery';
  return 'moogle';
}

function generateMap() {
  const nodes   = {}; // id → node object
  const levels  = []; // level index → [nodeId, ...]
  let nodeIdSeq = 0;

  // ── 1. Create nodes ──────────────────────────────────────
  for (let l = 0; l < MAP_LEVELS; l++) {
    const isFirst = l === 0;
    const isLast  = l === MAP_LEVELS - 1;
    const count   = isFirst || isLast ? 1 : (Math.random() < 0.45 ? 3 : 2);

    const levelIds = [];
    for (let p = 0; p < count; p++) {
      const id   = `n${nodeIdSeq++}`;
      const type = randomNodeType(l, MAP_LEVELS);
      nodes[id]  = {
        id,
        level: l,
        pos:   p,
        totalInLevel: count,
        type,
        connections: [],   // outgoing → ids in level l+1
        visited:   false,
        available: false,
        current:   false,
      };
      levelIds.push(id);
    }
    levels.push(levelIds);
  }

  // ── 2. Create connections ─────────────────────────────────
  // Rules:
  //   a) Every node in level L must have ≥1 connection to level L+1
  //   b) Every node in level L+1 must be reachable from ≥1 node in level L
  //   c) Lines should not cross (spatial proximity preference)
  for (let l = 0; l < levels.length - 1; l++) {
    const currIds = levels[l];
    const nextIds = levels[l + 1];

    // For each current node, connect to closest 1-2 nodes in next level
    currIds.forEach(cid => {
      const cNode = nodes[cid];
      const cRel  = cNode.pos / Math.max(cNode.totalInLevel - 1, 1);

      // Sort next by spatial closeness
      const sorted = [...nextIds].sort((a, b) => {
        const na = nodes[a], nb = nodes[b];
        const aRel = na.pos / Math.max(na.totalInLevel - 1, 1);
        const bRel = nb.pos / Math.max(nb.totalInLevel - 1, 1);
        return Math.abs(aRel - cRel) - Math.abs(bRel - cRel);
      });

      const numConn = (Math.random() < 0.38 && sorted.length > 1) ? 2 : 1;
      for (let i = 0; i < numConn; i++) {
        if (!cNode.connections.includes(sorted[i])) {
          cNode.connections.push(sorted[i]);
        }
      }
    });

    // Ensure every next-level node is reachable
    nextIds.forEach(nid => {
      const reachable = currIds.some(cid => nodes[cid].connections.includes(nid));
      if (!reachable) {
        const nNode = nodes[nid];
        const nRel  = nNode.pos / Math.max(nNode.totalInLevel - 1, 1);
        const closest = currIds.reduce((best, cid) => {
          const cNode = nodes[cid];
          const cRel  = cNode.pos / Math.max(cNode.totalInLevel - 1, 1);
          if (!best) return cid;
          const bNode = nodes[best];
          const bRel  = bNode.pos / Math.max(bNode.totalInLevel - 1, 1);
          return Math.abs(cRel - nRel) < Math.abs(bRel - nRel) ? cid : best;
        }, null);
        if (closest && !nodes[closest].connections.includes(nid)) {
          nodes[closest].connections.push(nid);
        }
      }
    });
  }

  // ── 3. Initialise state ────────────────────────────────────
  const startId = levels[0][0];
  nodes[startId].visited   = true;
  nodes[startId].current   = true;
  nodes[startId].available = true;

  nodes[startId].connections.forEach(nid => {
    nodes[nid].available = true;
  });

  return { nodes, levels, currentNodeId: startId };
}

/**
 * After visiting a node, update available flags for its connections.
 * Clears ALL available flags first — no going back, no sibling access.
 */
function advanceMap(mapData, visitedNodeId) {
  const { nodes } = mapData;
  const vNode = nodes[visitedNodeId];

  // Clear current + available from every node that hasn't been visited yet.
  // This locks siblings, previous levels, and any detached paths.
  Object.values(nodes).forEach(n => {
    n.current = false;
    if (!n.visited) n.available = false;
  });

  // Mark the chosen node as visited
  vNode.visited   = true;
  vNode.available = false;

  // Only the chosen node's forward connections become available
  vNode.connections.forEach(nid => {
    nodes[nid].available = true;
  });

  mapData.currentNodeId = visitedNodeId;
  return mapData;
}
