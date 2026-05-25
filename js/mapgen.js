/**
 * mapgen.js — Procedural map generation (per-world vertical structure)
 */

const WORLD_MAP_LEVELS = {
  0: 8,
  1: 9,
  2: 10,
  3: 11,
  4: 12,
  5: 13,
  6: 14,
  7: 15,
};

function randomNodeType(level, totalLevels) {
  if (level === 0) return 'start';
  if (level === totalLevels - 1) return 'boss';

  const r = Math.random();

  if (r < 0.45) return 'battle';
  if (r < 0.60) return 'save';
  if (r < 0.72) return 'chest';
  if (r < 0.84) return 'mystery';

  return 'moogle';
}

function generateMap(worldId = 0) {
  const totalLevels = WORLD_MAP_LEVELS[worldId] || 10;

  const nodes = {};
  const levels = [];

  let nodeIdSeq = 0;

  for (let l = 0; l < totalLevels; l++) {
    const isFirst = l === 0;
    const isLast = l === totalLevels - 1;

    const count =
      isFirst || isLast
        ? 1
        : (Math.random() < 0.45 ? 3 : 2);

    const levelIds = [];

    for (let p = 0; p < count; p++) {
      const id = `w${worldId}_n${nodeIdSeq++}`;

      const type = randomNodeType(l, totalLevels);

      nodes[id] = {
        id,
        worldId,
        level: l,
        pos: p,
        totalInLevel: count,
        type,
        connections: [],
        visited: false,
        available: false,
        current: false,
      };

      levelIds.push(id);
    }

    levels.push(levelIds);
  }

  // Connections
  for (let l = 0; l < levels.length - 1; l++) {
    const currIds = levels[l];
    const nextIds = levels[l + 1];

    currIds.forEach(cid => {
      const cNode = nodes[cid];

      const cRel =
        cNode.pos / Math.max(cNode.totalInLevel - 1, 1);

      const sorted = [...nextIds].sort((a, b) => {
        const na = nodes[a];
        const nb = nodes[b];

        const aRel =
          na.pos / Math.max(na.totalInLevel - 1, 1);

        const bRel =
          nb.pos / Math.max(nb.totalInLevel - 1, 1);

        return Math.abs(aRel - cRel) - Math.abs(bRel - cRel);
      });

      const numConn =
        (Math.random() < 0.38 && sorted.length > 1)
          ? 2
          : 1;

      for (let i = 0; i < numConn; i++) {
        if (!cNode.connections.includes(sorted[i])) {
          cNode.connections.push(sorted[i]);
        }
      }
    });

    // Ensure all nodes are reachable
    nextIds.forEach(nid => {
      const reachable = currIds.some(cid =>
        nodes[cid].connections.includes(nid)
      );

      if (!reachable) {
        const closest = currIds[0];

        nodes[closest].connections.push(nid);
      }
    });
  }

  // Initialize start node
  const startId = levels[0][0];

  nodes[startId].visited = true;
  nodes[startId].current = true;
  nodes[startId].available = true;

  nodes[startId].connections.forEach(nid => {
    nodes[nid].available = true;
  });

  console.log(
    `🌍 Generated map for world ${worldId} (${totalLevels} levels)`
  );

  return {
    worldId,
    nodes,
    levels,
    currentNodeId: startId,
  };
}

/**
 * Advance through map
 */
function advanceMap(mapData, visitedNodeId) {
  const { nodes } = mapData;

  const vNode = nodes[visitedNodeId];

  Object.values(nodes).forEach(n => {
    n.current = false;

    if (!n.visited) {
      n.available = false;
    }
  });

  vNode.visited = true;
  vNode.available = false;

  vNode.connections.forEach(nid => {
    nodes[nid].available = true;
  });

  mapData.currentNodeId = visitedNodeId;

  return mapData;
}