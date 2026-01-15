import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Users, RotateCcw, Plus, Trash2, Play, ArrowRight, Home } from 'lucide-react';

const HexWargame = () => {
  // Shape definitions for unit types
  const unitShapes = {
    circle: { name: 'Circle' },
    square: { name: 'Square' },
    triangle: { name: 'Triangle' },
    diamond: { name: 'Diamond' },
    pentagon: { name: 'Pentagon' },
    hexagon: { name: 'Hexagon' },
    star: { name: 'Star' },
    cross: { name: 'Cross' },
    octagon: { name: 'Octagon' },
    rectangle: { name: 'Rectangle' }
  };

  // Function to render unit shape
  const renderUnitShape = (shape, x, y, size = 10) => {
    switch (shape) {
      case 'circle':
        return <circle cx={x} cy={y} r={size} fill="white" />;
      case 'square':
        return <rect x={x - size} y={y - size} width={size * 2} height={size * 2} fill="white" />;
      case 'triangle':
        return <polygon points={`${x},${y - size} ${x - size},${y + size} ${x + size},${y + size}`} fill="white" />;
      case 'diamond':
        return <polygon points={`${x},${y - size} ${x + size},${y} ${x},${y + size} ${x - size},${y}`} fill="white" />;
      case 'pentagon':
        return <polygon points={`${x},${y - size} ${x + size * 0.95},${y - size * 0.31} ${x + size * 0.59},${y + size * 0.81} ${x - size * 0.59},${y + size * 0.81} ${x - size * 0.95},${y - size * 0.31}`} fill="white" />;
      case 'hexagon':
        return <polygon points={`${x},${y - size} ${x + size * 0.87},${y - size * 0.5} ${x + size * 0.87},${y + size * 0.5} ${x},${y + size} ${x - size * 0.87},${y + size * 0.5} ${x - size * 0.87},${y - size * 0.5}`} fill="white" />;
      case 'star':
        return <polygon points={`${x},${y - size} ${x + size * 0.3},${y - size * 0.3} ${x + size},${y - size * 0.3} ${x + size * 0.5},${y + size * 0.2} ${x + size * 0.6},${y + size} ${x},${y + size * 0.5} ${x - size * 0.6},${y + size} ${x - size * 0.5},${y + size * 0.2} ${x - size},${y - size * 0.3} ${x - size * 0.3},${y - size * 0.3}`} fill="white" />;
      case 'cross':
        return <path d={`M ${x - size * 0.3} ${y - size} L ${x + size * 0.3} ${y - size} L ${x + size * 0.3} ${y - size * 0.3} L ${x + size} ${y - size * 0.3} L ${x + size} ${y + size * 0.3} L ${x + size * 0.3} ${y + size * 0.3} L ${x + size * 0.3} ${y + size} L ${x - size * 0.3} ${y + size} L ${x - size * 0.3} ${y + size * 0.3} L ${x - size} ${y + size * 0.3} L ${x - size} ${y - size * 0.3} L ${x - size * 0.3} ${y - size * 0.3} Z`} fill="white" />;
      case 'octagon':
        return <polygon points={`${x},${y - size} ${x + size * 0.7},${y - size * 0.7} ${x + size},${y} ${x + size * 0.7},${y + size * 0.7} ${x},${y + size} ${x - size * 0.7},${y + size * 0.7} ${x - size},${y} ${x - size * 0.7},${y - size * 0.7}`} fill="white" />;
      case 'rectangle':
        return <rect x={x - size * 1.2} y={y - size * 0.7} width={size * 2.4} height={size * 1.4} fill="white" />;
      default:
        return <circle cx={x} cy={y} r={size} fill="white" />;
    }
  };

  const [gamePhase, setGamePhase] = useState('title');
  const [mapWidth, setMapWidth] = useState(15);
  const [mapHeight, setMapHeight] = useState(10);
  const [unitTypes, setUnitTypes] = useState([
    { id: 1, name: 'Infantry', move: 2, vision: 2, shape: 'square', zoc: 0 },
    { id: 2, name: 'Cavalry', move: 4, vision: 3, shape: 'triangle', zoc: 0 },
    { id: 3, name: 'Artillery', move: 1, vision: 2, shape: 'diamond', zoc: 0 }
  ]);
  const [nextUnitTypeId, setNextUnitTypeId] = useState(4);
  const [terrainTypes, setTerrainTypes] = useState([
    { 
      id: 1, 
      name: 'Field', 
      color: '#c4d882', 
      blocksVision: false,
      moveCosts: { 1: 1, 2: 1, 3: 1 }
    },
    { 
      id: 2, 
      name: 'Forest', 
      color: '#22c55e', 
      blocksVision: true,
      moveCosts: { 1: 1, 2: 2, 3: 'impassable' }
    },
    { 
      id: 3, 
      name: 'Mountain', 
      color: '#78716c', 
      blocksVision: true,
      moveCosts: { 1: 2, 2: 3, 3: 'impassable' }
    },
    { 
      id: 4, 
      name: 'Water', 
      color: '#3b82f6', 
      blocksVision: false,
      moveCosts: { 1: 'impassable', 2: 'impassable', 3: 'impassable' }
    }
  ]);
  const [nextTerrainTypeId, setNextTerrainTypeId] = useState(5);
  const [terrainMap, setTerrainMap] = useState({});
  const [selectedTerrainBrush, setSelectedTerrainBrush] = useState(null);
  const [player1DeploymentZone, setPlayer1DeploymentZone] = useState({});
  const [player2DeploymentZone, setPlayer2DeploymentZone] = useState({});
  const [player1Units, setPlayer1Units] = useState([]);
  const [player2Units, setPlayer2Units] = useState([]);
  const [player1Color, setPlayer1Color] = useState('#3b82f6');
  const [player2Color, setPlayer2Color] = useState('#ef4444');
  const [nextUnitId, setNextUnitId] = useState(1);

  // Deployment phase state
  const [deploymentPlayer, setDeploymentPlayer] = useState(1); // Which player is currently deploying
  const [player1Deployed, setPlayer1Deployed] = useState(false);
  const [player2Deployed, setPlayer2Deployed] = useState(false);
  const [deployedUnits, setDeployedUnits] = useState([]); // Units that have been placed on the map
  const [draggingUnit, setDraggingUnit] = useState(null); // Unit currently being dragged

  const HEX_SIZE = 30;

  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [units, setUnits] = useState([]);
  const [movedUnits, setMovedUnits] = useState(new Set());
  const [fogEnabled, setFogEnabled] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });
  const [hoveredHex, setHoveredHex] = useState(null);
  const [pendingMove, setPendingMove] = useState(null);
  const [userPathTrail, setUserPathTrail] = useState([]); // Track hexes the user's mouse passes through
  const [zoomLevel, setZoomLevel] = useState(1); // Zoom level (0.5 to 2.0)
  const scrollContainerRef = useRef(null);

  // Terrain painting state
  const [isPainting, setIsPainting] = useState(false);

  // Combat state - supports multiple units on each side
  const [activeCombat, setActiveCombat] = useState(null); // { attackers: [], defenders: [], combatHex, attackApproachHex }
  const [combatPhase, setCombatPhase] = useState(null); // 'combat', 'resolve', 'retreat'
  const [combatWinner, setCombatWinner] = useState(null); // 'attacker' or 'defender'
  const [retreatingUnits, setRetreatingUnits] = useState([]); // All units that need to retreat
  const [selectedRetreatUnit, setSelectedRetreatUnit] = useState(null); // Currently selected unit for retreat
  const [retreatPositions, setRetreatPositions] = useState({}); // { hexKey: count } tracking where units have retreated
  const [validRetreatHexes, setValidRetreatHexes] = useState([]); // Hexes the selected unit can retreat to
  const [combatStrengths, setCombatStrengths] = useState({}); // { unitId: adjustedStrength } for combat resolution
  const [sogParticipation, setSogParticipation] = useState({}); // { unitId: boolean } tracking which SOG units are participating

  // Move interruption state
  const [moveInterrupted, setMoveInterrupted] = useState(null); // { unit, finalHex, reason }

  // Multiplayer save system state
  const [gameCode, setGameCode] = useState(null);
  const [player1Code, setPlayer1Code] = useState(null);
  const [player2Code, setPlayer2Code] = useState(null);
  const [authenticatedPlayer, setAuthenticatedPlayer] = useState(null);
  const [loadGameInput, setLoadGameInput] = useState('');
  const [loadGameError, setLoadGameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gameName, setGameName] = useState('');
  const [initiativeType, setInitiativeType] = useState('igo-ugo'); // 'igo-ugo' or 'unit-initiative'
  const [gameMode, setGameMode] = useState('local-hotseat'); // 'local-hotseat' or 'online-multiplayer'
  const [turnTransitionPending, setTurnTransitionPending] = useState(false); // For hotseat turn handoff
  const [nextPlayerNum, setNextPlayerNum] = useState(null); // Track who's next during transition

  // Unit stacking state
  const [stackingEnabled, setStackingEnabled] = useState(false);
  const [stackingLimitEnabled, setStackingLimitEnabled] = useState(false);
  const [maxStackSize, setMaxStackSize] = useState(3);
  const [stackSelectionHex, setStackSelectionHex] = useState(null); // Hex where stack selection bubble is shown
  const [selectedStack, setSelectedStack] = useState(null); // Array of units selected for group movement

  // Sound of the Guns (SOG) state
  const [sogEnabled, setSogEnabled] = useState(false);
  const [sogRange, setSogRange] = useState(1);

  // Generate a random code
  const generateCode = (length = 6) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Save game to persistent storage
  const saveGame = async () => {
    if (!gameCode) return false;
    
    const gameState = {
      gameName,
      gameCode,
      player1Code,
      player2Code,
      mapWidth,
      mapHeight,
      unitTypes,
      nextUnitTypeId,
      terrainTypes,
      nextTerrainTypeId,
      terrainMap,
      player1Units,
      player2Units,
      player1Color,
      player2Color,
      nextUnitId,
      currentPlayer,
      units,
      movedUnits: Array.from(movedUnits),
      fogEnabled,
      initiativeType,
      gameMode,
      gamePhase,
      lastUpdated: new Date().toISOString()
    };

    try {
      await window.storage.set(`game:${gameCode}`, JSON.stringify(gameState), true);
      // Also save lookup entries for player codes -> game code
      await window.storage.set(`player:${player1Code}`, gameCode, true);
      await window.storage.set(`player:${player2Code}`, gameCode, true);
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  };

  // Load game from persistent storage using player code
  const loadGameByPlayerCode = async (playerCode) => {
    setIsLoading(true);
    setLoadGameError('');
    
    try {
      // First, look up the game code from the player code
      const lookupResult = await window.storage.get(`player:${playerCode.toUpperCase()}`, true);
      if (!lookupResult || !lookupResult.value) {
        setLoadGameError('Player code not found. Please check the code and try again.');
        setIsLoading(false);
        return null;
      }
      
      const foundGameCode = lookupResult.value;
      
      // Now load the actual game data
      const result = await window.storage.get(`game:${foundGameCode}`, true);
      if (!result || !result.value) {
        setLoadGameError('Game data not found. The game may have been deleted.');
        setIsLoading(false);
        return null;
      }
      
      const gameState = JSON.parse(result.value);
      setIsLoading(false);
      return gameState;
    } catch (error) {
      console.error('Failed to load game:', error);
      setLoadGameError('Failed to load game. Please try again.');
      setIsLoading(false);
      return null;
    }
  };

  // Load game directly by game code (for refresh)
  const loadGameByGameCode = async (code) => {
    try {
      const result = await window.storage.get(`game:${code}`, true);
      if (!result || !result.value) {
        return null;
      }
      return JSON.parse(result.value);
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  };

  // Authenticate player with their code
  const authenticatePlayer = (gameState, playerCode) => {
    const upperCode = playerCode.toUpperCase();
    if (upperCode === gameState.player1Code) {
      return 1;
    } else if (upperCode === gameState.player2Code) {
      return 2;
    }
    return null;
  };

  // Apply loaded game state
  const applyGameState = (gameState, playerNum) => {
    setGameName(gameState.gameName || '');
    setGameCode(gameState.gameCode);
    setPlayer1Code(gameState.player1Code);
    setPlayer2Code(gameState.player2Code);
    setMapWidth(gameState.mapWidth);
    setMapHeight(gameState.mapHeight);
    setUnitTypes(gameState.unitTypes);
    setNextUnitTypeId(gameState.nextUnitTypeId);
    setTerrainTypes(gameState.terrainTypes);
    setNextTerrainTypeId(gameState.nextTerrainTypeId);
    setTerrainMap(gameState.terrainMap);
    setPlayer1Units(gameState.player1Units);
    setPlayer2Units(gameState.player2Units);
    setPlayer1Color(gameState.player1Color);
    setPlayer2Color(gameState.player2Color);
    setNextUnitId(gameState.nextUnitId);
    setCurrentPlayer(gameState.currentPlayer);
    setUnits(gameState.units);
    setMovedUnits(new Set(gameState.movedUnits || []));
    setFogEnabled(gameState.fogEnabled);
    setInitiativeType(gameState.initiativeType || 'igo-ugo');
    setGameMode(gameState.gameMode || 'online-multiplayer');
    setAuthenticatedPlayer(playerNum);
    setGamePhase(gameState.gamePhase === 'game' ? 'game' : gameState.gamePhase);
  };

  // Handle load game submission
  const handleLoadGame = async () => {
    const code = loadGameInput.trim().toUpperCase();
    if (code.length < 6) {
      setLoadGameError('Please enter a valid code.');
      return;
    }

    const gameState = await loadGameByPlayerCode(code);
    if (!gameState) return;

    const playerNum = authenticatePlayer(gameState, code);
    if (!playerNum) {
      setLoadGameError('Invalid player code. Please check and try again.');
      return;
    }

    applyGameState(gameState, playerNum);
  };

  // Create new multiplayer game
  const createMultiplayerGame = () => {
    const newGameCode = generateCode(8);
    const newPlayer1Code = generateCode(6);
    const newPlayer2Code = generateCode(6);
    
    setGameCode(newGameCode);
    setPlayer1Code(newPlayer1Code);
    setPlayer2Code(newPlayer2Code);
    setGamePhase('game-created');
  };

  const addUnitType = () => {
    setUnitTypes([
      ...unitTypes,
      { id: nextUnitTypeId, name: `Unit ${nextUnitTypeId}`, move: 2, vision: 2, shape: 'circle', zoc: 0 }
    ]);
    setNextUnitTypeId(nextUnitTypeId + 1);
  };

  const removeUnitType = (id) => {
    if (unitTypes.length > 1) {
      setUnitTypes(unitTypes.filter(ut => ut.id !== id));
    }
  };

  const updateUnitType = (id, field, value) => {
    setUnitTypes(unitTypes.map(ut => 
      ut.id === id ? { ...ut, [field]: value } : ut
    ));
  };

  const addTerrainType = () => {
    const defaultMoveCosts = {};
    unitTypes.forEach(ut => {
      defaultMoveCosts[ut.id] = 1;
    });
    
    setTerrainTypes([
      ...terrainTypes,
      { 
        id: nextTerrainTypeId, 
        name: `Terrain ${nextTerrainTypeId}`, 
        color: '#8b5cf6', 
        blocksVision: false,
        moveCosts: defaultMoveCosts
      }
    ]);
    setNextTerrainTypeId(nextTerrainTypeId + 1);
  };

  const removeTerrainType = (id) => {
    if (terrainTypes.length > 1) {
      setTerrainTypes(terrainTypes.filter(tt => tt.id !== id));
    }
  };

  const updateTerrainType = (id, field, value) => {
    setTerrainTypes(terrainTypes.map(tt => 
      tt.id === id ? { ...tt, [field]: value } : tt
    ));
  };

  const updateTerrainMoveCost = (terrainId, unitTypeId, value) => {
    setTerrainTypes(terrainTypes.map(tt => {
      if (tt.id === terrainId) {
        return {
          ...tt,
          moveCosts: {
            ...tt.moveCosts,
            [unitTypeId]: value
          }
        };
      }
      return tt;
    }));
  };

  const proceedToTerrainPaint = () => {
    // Pre-populate entire map with Field terrain (id: 1)
    const initialTerrain = {};
    for (let q = 0; q < mapWidth; q++) {
      for (let r = 0; r < mapHeight; r++) {
        initialTerrain[`${q}-${r}`] = 1;
      }
    }
    setTerrainMap(initialTerrain);
    
    setGamePhase('terrain-paint');
    if (terrainTypes.length > 0) {
      setSelectedTerrainBrush(terrainTypes[0].id);
    }
  };

  const paintTerrain = (q, r) => {
    if (selectedTerrainBrush === null) return;
    
    const key = `${q}-${r}`;
    
    // Handle deployment zone brushes
    if (selectedTerrainBrush === 'deploy-p1') {
      // Remove from P2 zone if exists, add to P1
      const newP2Zone = { ...player2DeploymentZone };
      delete newP2Zone[key];
      setPlayer2DeploymentZone(newP2Zone);
      setPlayer1DeploymentZone({ ...player1DeploymentZone, [key]: true });
      return;
    }
    if (selectedTerrainBrush === 'deploy-p2') {
      // Remove from P1 zone if exists, add to P2
      const newP1Zone = { ...player1DeploymentZone };
      delete newP1Zone[key];
      setPlayer1DeploymentZone(newP1Zone);
      setPlayer2DeploymentZone({ ...player2DeploymentZone, [key]: true });
      return;
    }
    if (selectedTerrainBrush === 'deploy-clear') {
      // Remove from both deployment zones
      const newP1Zone = { ...player1DeploymentZone };
      const newP2Zone = { ...player2DeploymentZone };
      delete newP1Zone[key];
      delete newP2Zone[key];
      setPlayer1DeploymentZone(newP1Zone);
      setPlayer2DeploymentZone(newP2Zone);
      return;
    }
    
    // Handle terrain brushes (no clear option - all hexes must have terrain)
    if (selectedTerrainBrush && typeof selectedTerrainBrush === 'number') {
      setTerrainMap({
        ...terrainMap,
        [key]: selectedTerrainBrush
      });
    }
  };

  const getTerrainAt = (q, r) => {
    const key = `${q}-${r}`;
    const terrainId = terrainMap[key];
    if (!terrainId) return null;
    return terrainTypes.find(tt => tt.id === terrainId);
  };

  const getHexNeighbors = (q, r) => {
    const parity = r & 1;
    const neighbors = [
      { q: q + 1, r: r },
      { q: q - 1, r: r },
      { q: q + parity, r: r - 1 },
      { q: q + parity - 1, r: r - 1 },
      { q: q + parity, r: r + 1 },
      { q: q + parity - 1, r: r + 1 }
    ];
    
    return neighbors.filter(n => n.q >= 0 && n.q < mapWidth && n.r >= 0 && n.r < mapHeight);
  };

  const getMovementCost = (unitTypeId, q, r) => {
    const terrain = getTerrainAt(q, r);
    if (!terrain) return 1;
    
    const cost = terrain.moveCosts[unitTypeId];
    if (cost === 'impassable') return Infinity;
    return cost || 1;
  };

  // Check if a unit can stack at a hex (for friendly units)
  const canStackAtHex = (q, r, movingUnit) => {
    if (!stackingEnabled) return false;
    
    const friendlyUnitsAtHex = units.filter(u => 
      u.q === q && u.r === r && u.player === movingUnit.player && u.id !== movingUnit.id
    );
    
    if (friendlyUnitsAtHex.length === 0) return true; // No friendlies, can move there
    
    if (!stackingLimitEnabled) return true; // No limit, can always stack
    
    // Check if adding this unit would exceed the limit
    return friendlyUnitsAtHex.length < maxStackSize;
  };

  // Get count of friendly units at a hex
  const getFriendlyUnitCountAtHex = (q, r, player) => {
    return units.filter(u => u.q === q && u.r === r && u.player === player).length;
  };

  // Check if an enemy unit at a position is visible to the moving unit's player
  const isEnemyVisible = (enemyQ, enemyR, viewingPlayer) => {
    if (!fogEnabled) return true;
    
    const playerUnits = units.filter(u => u.player === viewingPlayer);
    
    return playerUnits.some(unit => {
      const unitType = getUnitType(unit.typeId);
      const distance = hexDistance(unit.q, unit.r, enemyQ, enemyR);
      
      if (distance > unitType.vision) return false;
      if (distance <= 1) return true;
      
      const line = hexLine(unit.q, unit.r, enemyQ, enemyR);
      
      for (let i = 1; i < line.length; i++) {
        const hex = line[i];
        const terrain = getTerrainAt(hex.q, hex.r);
        if (terrain && terrain.blocksVision) return false;
      }
      
      return true;
    });
  };

  // Check if a hex is within a VISIBLE enemy unit's Zone of Control
  const isInVisibleEnemyZOC = (q, r, movingUnit) => {
    const enemyUnits = units.filter(u => u.player !== movingUnit.player);
    
    for (const enemy of enemyUnits) {
      // Only consider visible enemies
      if (!isEnemyVisible(enemy.q, enemy.r, movingUnit.player)) continue;
      
      const enemyType = getUnitType(enemy.typeId);
      const zocRange = enemyType?.zoc || 0;
      
      if (zocRange > 0) {
        const distance = hexDistance(enemy.q, enemy.r, q, r);
        if (distance <= zocRange) {
          return { inZOC: true, enemyUnit: enemy };
        }
      }
    }
    
    return { inZOC: false, enemyUnit: null };
  };

  // Check if a hex is within ANY enemy unit's Zone of Control (including hidden)
  const isInEnemyZOC = (q, r, movingUnit) => {
    const enemyUnits = units.filter(u => u.player !== movingUnit.player);
    
    for (const enemy of enemyUnits) {
      const enemyType = getUnitType(enemy.typeId);
      const zocRange = enemyType?.zoc || 0;
      
      if (zocRange > 0) {
        const distance = hexDistance(enemy.q, enemy.r, q, r);
        if (distance <= zocRange) {
          return { inZOC: true, enemyUnit: enemy };
        }
      }
    }
    
    return { inZOC: false, enemyUnit: null };
  };

  // Check if movement is allowed by VISIBLE enemy ZOC
  const isMovementAllowedByVisibleZOC = (fromQ, fromR, toQ, toR, movingUnit) => {
    const fromZOC = isInVisibleEnemyZOC(fromQ, fromR, movingUnit);
    
    if (!fromZOC.inZOC) return true;
    
    const enemy = fromZOC.enemyUnit;
    const currentDistToEnemy = hexDistance(fromQ, fromR, enemy.q, enemy.r);
    const newDistToEnemy = hexDistance(toQ, toR, enemy.q, enemy.r);
    
    return newDistToEnemy !== currentDistToEnemy;
  };

  // Check if movement from one hex to another is allowed given ZOC restrictions
  // Returns true if the move is allowed
  const isMovementAllowedByZOC = (fromQ, fromR, toQ, toR, movingUnit) => {
    const fromZOC = isInEnemyZOC(fromQ, fromR, movingUnit);
    
    // If not in any enemy ZOC, movement is allowed
    if (!fromZOC.inZOC) return true;
    
    // If in enemy ZOC, can only move directly toward OR directly away from the enemy
    const enemy = fromZOC.enemyUnit;
    const currentDistToEnemy = hexDistance(fromQ, fromR, enemy.q, enemy.r);
    const newDistToEnemy = hexDistance(toQ, toR, enemy.q, enemy.r);
    
    // Allow movement if moving closer to the enemy (toward)
    // OR if moving further from the enemy (away)
    // This prevents lateral movement (staying at same distance)
    return newDistToEnemy !== currentDistToEnemy;
  };

  const findPath = (unit, targetQ, targetR, ignoreHiddenEnemies = true) => {
    if (!unit) return null;
    
    const startKey = `${unit.q}-${unit.r}`;
    const targetKey = `${targetQ}-${targetR}`;
    
    if (startKey === targetKey) return null;
    
    // Check if target is occupied by friendly unit
    const friendlyOccupied = units.some(u => u.q === targetQ && u.r === targetR && u.id !== unit.id && u.player === unit.player);
    if (friendlyOccupied) {
      // If stacking is disabled, or we can't stack at this hex, return null
      if (!stackingEnabled || !canStackAtHex(targetQ, targetR, unit)) {
        return null;
      }
    }
    
    // Check if target is occupied by VISIBLE enemy unit (combat) - only if we're considering visibility
    const enemyAtTarget = units.find(u => u.q === targetQ && u.r === targetR && u.player !== unit.player);
    const isVisibleEnemy = enemyAtTarget && (!ignoreHiddenEnemies || isEnemyVisible(targetQ, targetR, unit.player));
    const isAttack = !!enemyAtTarget && isVisibleEnemy;
    
    const unitType = getUnitType(unit.typeId);
    const maxMove = unitType.move;
    
    const costs = { [startKey]: 0 };
    const previous = {};
    const visited = new Set();
    const queue = [{ q: unit.q, r: unit.r, cost: 0 }];
    
    while (queue.length > 0) {
      queue.sort((a, b) => a.cost - b.cost);
      const current = queue.shift();
      const currentKey = `${current.q}-${current.r}`;
      
      if (visited.has(currentKey)) continue;
      visited.add(currentKey);
      
      if (currentKey === targetKey) {
        const path = [];
        let key = targetKey;
        while (key !== startKey) {
          const [q, r] = key.split('-').map(Number);
          path.unshift({ q, r });
          key = previous[key];
        }
        return { path, totalCost: costs[targetKey], isAttack, enemyUnit: isVisibleEnemy ? enemyAtTarget : null };
      }
      
      const neighbors = getHexNeighbors(current.q, current.r);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.q}-${neighbor.r}`;
        if (visited.has(neighborKey)) continue;
        
        // Check if neighbor is occupied
        const neighborOccupants = units.filter(u => u.q === neighbor.q && u.r === neighbor.r && u.id !== unit.id);
        
        if (neighborOccupants.length > 0) {
          const hasFriendly = neighborOccupants.some(u => u.player === unit.player);
          const hasEnemy = neighborOccupants.some(u => u.player !== unit.player);
          
          if (hasFriendly) {
            // If stacking is enabled and this is the target, check if we can stack
            if (neighborKey === targetKey && canStackAtHex(neighbor.q, neighbor.r, unit)) {
              // Allow moving to this hex (stacking)
            } else if (!canStackAtHex(neighbor.q, neighbor.r, unit)) {
              // Can't stack here, skip
              continue;
            }
            // If stacking enabled, can pass through friendly units
          }
          
          if (hasEnemy) {
            // If it's an enemy unit but not our target, can't pass through (only if visible or not ignoring hidden)
            if (neighborKey !== targetKey) {
              if (!ignoreHiddenEnemies || isEnemyVisible(neighbor.q, neighbor.r, unit.player)) {
                continue;
              }
            }
          }
        }
        
        // Check ZOC restrictions - only for VISIBLE enemies when ignoring hidden
        if (ignoreHiddenEnemies) {
          if (!isMovementAllowedByVisibleZOC(current.q, current.r, neighbor.q, neighbor.r, unit)) {
            continue;
          }
        } else {
          if (!isMovementAllowedByZOC(current.q, current.r, neighbor.q, neighbor.r, unit)) {
            continue;
          }
        }
        
        const moveCost = getMovementCost(unit.typeId, neighbor.q, neighbor.r);
        if (moveCost === Infinity) continue;
        
        const newCost = costs[currentKey] + moveCost;
        
        if (newCost <= maxMove && (!costs[neighborKey] || newCost < costs[neighborKey])) {
          costs[neighborKey] = newCost;
          previous[neighborKey] = currentKey;
          queue.push({ q: neighbor.q, r: neighbor.r, cost: newCost });
        }
      }
    }
    
    return null;
  };

  // Try to find a path that follows the user's mouse trail
  // Falls back to shortest path if trail is invalid or if there's only one possible path
  const findPathFollowingTrail = (unit, targetQ, targetR, trail, ignoreHiddenEnemies = true) => {
    if (!unit || !trail || trail.length === 0) {
      return findPath(unit, targetQ, targetR, ignoreHiddenEnemies);
    }
    
    const startKey = `${unit.q}-${unit.r}`;
    const targetKey = `${targetQ}-${targetR}`;
    
    if (startKey === targetKey) return null;
    
    // Get the default shortest path first
    const shortestPath = findPath(unit, targetQ, targetR, ignoreHiddenEnemies);
    if (!shortestPath) return null;
    
    const unitType = getUnitType(unit.typeId);
    const maxMove = unitType.move;
    
    // Clean up the trail: remove duplicates and ensure it starts from unit position
    // and ends at target
    const cleanTrail = [];
    let lastKey = null;
    
    // Start from unit's position
    cleanTrail.push({ q: unit.q, r: unit.r });
    lastKey = startKey;
    
    // Add trail hexes that are adjacent to the previous hex
    for (const hex of trail) {
      const hexKey = `${hex.q}-${hex.r}`;
      if (hexKey === lastKey) continue; // Skip duplicates
      if (hexKey === startKey) continue; // Skip start position
      
      // Check if this hex is adjacent to the last one
      const neighbors = getHexNeighbors(cleanTrail[cleanTrail.length - 1].q, cleanTrail[cleanTrail.length - 1].r);
      const isAdjacent = neighbors.some(n => n.q === hex.q && n.r === hex.r);
      
      if (isAdjacent) {
        cleanTrail.push({ q: hex.q, r: hex.r });
        lastKey = hexKey;
        
        // If we reached the target, stop
        if (hexKey === targetKey) break;
      }
    }
    
    // If trail doesn't end at target, try to connect the last trail hex to target
    if (lastKey !== targetKey) {
      // Find path from last trail hex to target
      const lastHex = cleanTrail[cleanTrail.length - 1];
      const tempUnit = { ...unit, q: lastHex.q, r: lastHex.r };
      const remainingPath = findPath(tempUnit, targetQ, targetR, ignoreHiddenEnemies);
      
      if (remainingPath && remainingPath.path) {
        // Append remaining path
        cleanTrail.push(...remainingPath.path);
      } else {
        // Can't connect trail to target, use shortest path
        return shortestPath;
      }
    }
    
    // Now validate the trail path - check movement costs and rules
    let totalCost = 0;
    const validPath = [];
    
    for (let i = 1; i < cleanTrail.length; i++) {
      const prev = cleanTrail[i - 1];
      const curr = cleanTrail[i];
      const currKey = `${curr.q}-${curr.r}`;
      
      // Check if this hex is passable
      const moveCost = getMovementCost(unit.typeId, curr.q, curr.r);
      if (moveCost === Infinity) {
        // Impassable terrain, use shortest path
        return shortestPath;
      }
      
      // Check ZOC restrictions
      if (ignoreHiddenEnemies) {
        if (!isMovementAllowedByVisibleZOC(prev.q, prev.r, curr.q, curr.r, unit)) {
          // ZOC blocks this path, use shortest path
          return shortestPath;
        }
      } else {
        if (!isMovementAllowedByZOC(prev.q, prev.r, curr.q, curr.r, unit)) {
          return shortestPath;
        }
      }
      
      // Check for blocking units (not at target)
      if (currKey !== targetKey) {
        const occupants = units.filter(u => u.q === curr.q && u.r === curr.r && u.id !== unit.id);
        if (occupants.length > 0) {
          const hasEnemy = occupants.some(u => u.player !== unit.player);
          if (hasEnemy) {
            if (!ignoreHiddenEnemies || isEnemyVisible(curr.q, curr.r, unit.player)) {
              // Blocked by visible enemy, use shortest path
              return shortestPath;
            }
          }
          const hasFriendly = occupants.some(u => u.player === unit.player);
          if (hasFriendly && !canStackAtHex(curr.q, curr.r, unit)) {
            // Blocked by friendly unit we can't stack with
            return shortestPath;
          }
        }
      }
      
      totalCost += moveCost;
      validPath.push({ q: curr.q, r: curr.r });
    }
    
    // Check if total cost is within movement range
    if (totalCost > maxMove) {
      // Trail path too expensive, use shortest path
      return shortestPath;
    }
    
    // Check if target has visible enemy (for attack flag)
    const enemyAtTarget = units.find(u => u.q === targetQ && u.r === targetR && u.player !== unit.player);
    const isVisibleEnemy = enemyAtTarget && (!ignoreHiddenEnemies || isEnemyVisible(targetQ, targetR, unit.player));
    const isAttack = !!enemyAtTarget && isVisibleEnemy;
    
    return { 
      path: validPath, 
      totalCost, 
      isAttack, 
      enemyUnit: isVisibleEnemy ? enemyAtTarget : null 
    };
  };

  const getValidMoves = (unit) => {
    if (!unit || movedUnits.has(unit.id)) return [];
    
    const unitType = getUnitType(unit.typeId);
    const maxMove = unitType.move;
    const moves = [];
    
    const startKey = `${unit.q}-${unit.r}`;
    const costs = { [startKey]: 0 };
    const previous = { [startKey]: null };
    const visited = new Set();
    const queue = [{ q: unit.q, r: unit.r, cost: 0 }];
    
    // Track VISIBLE enemy positions we can attack
    const visibleEnemyPositions = new Set();
    units.forEach(u => {
      if (u.player !== unit.player && isEnemyVisible(u.q, u.r, unit.player)) {
        visibleEnemyPositions.add(`${u.q}-${u.r}`);
      }
    });
    
    while (queue.length > 0) {
      queue.sort((a, b) => a.cost - b.cost);
      const current = queue.shift();
      const currentKey = `${current.q}-${current.r}`;
      
      if (visited.has(currentKey)) continue;
      visited.add(currentKey);
      
      if (currentKey !== startKey) {
        const isVisibleEnemyHex = visibleEnemyPositions.has(currentKey);
        // Check if this hex has friendly units and if we can stack there
        const friendlyAtHex = units.filter(u => u.q === current.q && u.r === current.r && u.player === unit.player && u.id !== unit.id);
        const canMoveHere = friendlyAtHex.length === 0 || canStackAtHex(current.q, current.r, unit);
        
        if (canMoveHere || isVisibleEnemyHex) {
          moves.push({ q: current.q, r: current.r, cost: current.cost, isAttack: isVisibleEnemyHex });
        }
      }
      
      const neighbors = getHexNeighbors(current.q, current.r);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.q}-${neighbor.r}`;
        if (visited.has(neighborKey)) continue;
        
        // Check if neighbor is occupied
        const neighborOccupants = units.filter(u => u.q === neighbor.q && u.r === neighbor.r && u.id !== unit.id);
        const friendlyOccupants = neighborOccupants.filter(u => u.player === unit.player);
        const enemyOccupants = neighborOccupants.filter(u => u.player !== unit.player);
        const hasVisibleEnemy = enemyOccupants.some(u => isEnemyVisible(u.q, u.r, unit.player));
        
        if (friendlyOccupants.length > 0) {
          // If stacking is enabled, we can pass through (and potentially stop at) friendly hexes
          if (!stackingEnabled) continue;
        }
        
        if (enemyOccupants.length > 0 && hasVisibleEnemy) {
          // VISIBLE enemy unit - it's a valid attack target but we stop there
        }
        
        // Check ZOC restrictions - only for VISIBLE enemies
        if (!isMovementAllowedByVisibleZOC(current.q, current.r, neighbor.q, neighbor.r, unit)) {
          continue;
        }
        
        const moveCost = getMovementCost(unit.typeId, neighbor.q, neighbor.r);
        if (moveCost === Infinity) continue;
        
        const newCost = costs[currentKey] + moveCost;
        
        if (newCost <= maxMove && (!costs[neighborKey] || newCost < costs[neighborKey])) {
          costs[neighborKey] = newCost;
          previous[neighborKey] = currentKey;
          
          // If it's a VISIBLE enemy hex, add to moves but don't continue pathfinding from there
          if (hasVisibleEnemy) {
            moves.push({ q: neighbor.q, r: neighbor.r, cost: newCost, isAttack: true });
          } else {
            queue.push({ q: neighbor.q, r: neighbor.r, cost: newCost });
          }
        }
      }
    }
    
    return moves;
  };

  // Get valid moves for a stack of units (uses minimum movement of all units)
  const getValidMovesForStack = (stackUnits) => {
    if (!stackUnits || stackUnits.length === 0) return [];
    if (stackUnits.some(u => movedUnits.has(u.id))) return [];
    
    // Find the minimum movement value among all units in the stack
    const minMove = Math.min(...stackUnits.map(u => {
      const unitType = getUnitType(u.typeId);
      return unitType?.move || 0;
    }));
    
    if (minMove <= 0) return [];
    
    // Use the first unit as reference for position and player
    const refUnit = stackUnits[0];
    const moves = [];
    
    const startKey = `${refUnit.q}-${refUnit.r}`;
    const costs = { [startKey]: 0 };
    const visited = new Set();
    const queue = [{ q: refUnit.q, r: refUnit.r, cost: 0 }];
    
    // Track VISIBLE enemy positions
    const visibleEnemyPositions = new Set();
    units.forEach(u => {
      if (u.player !== refUnit.player && isEnemyVisible(u.q, u.r, refUnit.player)) {
        visibleEnemyPositions.add(`${u.q}-${u.r}`);
      }
    });
    
    // For stack movement, we need to check terrain costs for ALL unit types
    const getMaxMovementCost = (q, r) => {
      let maxCost = 0;
      for (const u of stackUnits) {
        const cost = getMovementCost(u.typeId, q, r);
        if (cost === Infinity) return Infinity;
        maxCost = Math.max(maxCost, cost);
      }
      return maxCost;
    };
    
    while (queue.length > 0) {
      queue.sort((a, b) => a.cost - b.cost);
      const current = queue.shift();
      const currentKey = `${current.q}-${current.r}`;
      
      if (visited.has(currentKey)) continue;
      visited.add(currentKey);
      
      if (currentKey !== startKey) {
        const isVisibleEnemyHex = visibleEnemyPositions.has(currentKey);
        
        if (isVisibleEnemyHex) {
          // Stack can attack enemy hexes
          moves.push({ q: current.q, r: current.r, cost: current.cost, isAttack: true });
        } else {
          const friendlyAtHex = units.filter(u => 
            u.q === current.q && u.r === current.r && 
            u.player === refUnit.player && 
            !stackUnits.some(su => su.id === u.id)
          );
          
          // Check if we can fit the entire stack here
          let canFitStack = true;
          if (friendlyAtHex.length > 0) {
            if (!stackingEnabled) {
              canFitStack = false;
            } else if (stackingLimitEnabled) {
              canFitStack = (friendlyAtHex.length + stackUnits.length) <= maxStackSize;
            }
          }
          
          if (canFitStack) {
            moves.push({ q: current.q, r: current.r, cost: current.cost, isAttack: false });
          }
        }
      }
      
      const neighbors = getHexNeighbors(current.q, current.r);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.q}-${neighbor.r}`;
        if (visited.has(neighborKey)) continue;
        
        // Check if neighbor has visible enemies - can attack but not pass through
        const hasVisibleEnemy = units.some(u => 
          u.q === neighbor.q && u.r === neighbor.r && 
          u.player !== refUnit.player &&
          isEnemyVisible(u.q, u.r, refUnit.player)
        );
        
        // Check if neighbor has friendlies (need stacking to pass through)
        const hasFriendly = units.some(u => 
          u.q === neighbor.q && u.r === neighbor.r && 
          u.player === refUnit.player &&
          !stackUnits.some(su => su.id === u.id)
        );
        if (hasFriendly && !stackingEnabled) continue;
        
        // Check ZOC restrictions
        if (!isMovementAllowedByVisibleZOC(current.q, current.r, neighbor.q, neighbor.r, refUnit)) {
          continue;
        }
        
        const moveCost = getMaxMovementCost(neighbor.q, neighbor.r);
        if (moveCost === Infinity) continue;
        
        const newCost = costs[currentKey] + moveCost;
        
        if (newCost <= minMove && (!costs[neighborKey] || newCost < costs[neighborKey])) {
          costs[neighborKey] = newCost;
          
          // If visible enemy hex, add to moves but don't continue pathfinding
          if (hasVisibleEnemy) {
            moves.push({ q: neighbor.q, r: neighbor.r, cost: newCost, isAttack: true });
          } else {
            queue.push({ q: neighbor.q, r: neighbor.r, cost: newCost });
          }
        }
      }
    }
    
    return moves;
  };

  // Find path for a stack of units
  const findPathForStack = (stackUnits, targetQ, targetR) => {
    if (!stackUnits || stackUnits.length === 0) return null;
    
    const refUnit = stackUnits[0];
    const startKey = `${refUnit.q}-${refUnit.r}`;
    const targetKey = `${targetQ}-${targetR}`;
    
    if (startKey === targetKey) return null;
    
    // Check if target has enemies (this is an attack)
    const enemiesAtTarget = units.filter(u => 
      u.q === targetQ && u.r === targetR && 
      u.player !== refUnit.player &&
      isEnemyVisible(u.q, u.r, refUnit.player)
    );
    const isAttack = enemiesAtTarget.length > 0;
    
    // If not an attack, check if we can fit the stack at the target
    if (!isAttack) {
      const friendlyAtTarget = units.filter(u => 
        u.q === targetQ && u.r === targetR && 
        u.player === refUnit.player &&
        !stackUnits.some(su => su.id === u.id)
      );
      
      if (friendlyAtTarget.length > 0) {
        if (!stackingEnabled) return null;
        if (stackingLimitEnabled && (friendlyAtTarget.length + stackUnits.length) > maxStackSize) {
          return null;
        }
      }
    }
    
    // Find minimum movement
    const minMove = Math.min(...stackUnits.map(u => {
      const unitType = getUnitType(u.typeId);
      return unitType?.move || 0;
    }));
    
    // Get max movement cost for the stack
    const getMaxMovementCost = (q, r) => {
      let maxCost = 0;
      for (const u of stackUnits) {
        const cost = getMovementCost(u.typeId, q, r);
        if (cost === Infinity) return Infinity;
        maxCost = Math.max(maxCost, cost);
      }
      return maxCost;
    };
    
    const costs = { [startKey]: 0 };
    const previous = {};
    const visited = new Set();
    const queue = [{ q: refUnit.q, r: refUnit.r, cost: 0 }];
    
    while (queue.length > 0) {
      queue.sort((a, b) => a.cost - b.cost);
      const current = queue.shift();
      const currentKey = `${current.q}-${current.r}`;
      
      if (visited.has(currentKey)) continue;
      visited.add(currentKey);
      
      if (currentKey === targetKey) {
        const path = [];
        let key = targetKey;
        while (key !== startKey) {
          const [q, r] = key.split('-').map(Number);
          path.unshift({ q, r });
          key = previous[key];
        }
        return { path, totalCost: costs[targetKey], isAttack, enemyUnits: isAttack ? enemiesAtTarget : null };
      }
      
      const neighbors = getHexNeighbors(current.q, current.r);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.q}-${neighbor.r}`;
        if (visited.has(neighborKey)) continue;
        
        // Check if neighbor has visible enemies - can only enter if it's our target
        const hasVisibleEnemy = units.some(u => 
          u.q === neighbor.q && u.r === neighbor.r && 
          u.player !== refUnit.player &&
          isEnemyVisible(u.q, u.r, refUnit.player)
        );
        
        // Can only enter enemy hex if it's the target
        if (hasVisibleEnemy && neighborKey !== targetKey) continue;
        
        // Check if neighbor has friendlies
        const hasFriendlyNeighbor = units.some(u => 
          u.q === neighbor.q && u.r === neighbor.r && 
          u.player === refUnit.player &&
          !stackUnits.some(su => su.id === u.id)
        );
        if (hasFriendlyNeighbor && !stackingEnabled) continue;
        
        // Check ZOC
        if (!isMovementAllowedByVisibleZOC(current.q, current.r, neighbor.q, neighbor.r, refUnit)) {
          continue;
        }
        
        const moveCost = getMaxMovementCost(neighbor.q, neighbor.r);
        if (moveCost === Infinity) continue;
        
        const newCost = costs[currentKey] + moveCost;
        
        if (newCost <= minMove && (!costs[neighborKey] || newCost < costs[neighborKey])) {
          costs[neighborKey] = newCost;
          previous[neighborKey] = currentKey;
          queue.push({ q: neighbor.q, r: neighbor.r, cost: newCost });
        }
      }
    }
    
    return null;
  };

  const proceedToUnitSetup = () => {
    setGamePhase('player1-units');
  };

  const addPlayerUnit = (player) => {
    const newUnit = {
      id: nextUnitId,
      typeId: unitTypes[0].id,
      name: `Unit ${nextUnitId}`,
      strength: 10
    };
    setNextUnitId(nextUnitId + 1);
    
    if (player === 1) {
      setPlayer1Units([...player1Units, newUnit]);
    } else {
      setPlayer2Units([...player2Units, newUnit]);
    }
  };

  const removePlayerUnit = (player, id) => {
    if (player === 1) {
      setPlayer1Units(player1Units.filter(u => u.id !== id));
    } else {
      setPlayer2Units(player2Units.filter(u => u.id !== id));
    }
  };

  const updatePlayerUnit = (player, id, field, value) => {
    if (player === 1) {
      setPlayer1Units(player1Units.map(u => 
        u.id === id ? { ...u, [field]: value } : u
      ));
    } else {
      setPlayer2Units(player2Units.map(u => 
        u.id === id ? { ...u, [field]: value } : u
      ));
    }
  };

  const startGame = () => {
    const gameUnits = [];
    
    player1Units.forEach((unit, index) => {
      gameUnits.push({
        id: unit.id,
        player: 1,
        typeId: unit.typeId,
        name: unit.name,
        strength: unit.strength,
        q: 2 + (index % 5),
        r: 2 + Math.floor(index / 5)
      });
    });
    
    // Don't place units automatically - go to deployment phase instead
    setDeployedUnits([]);
    setPlayer1Deployed(false);
    setPlayer2Deployed(false);
    setDeploymentPlayer(1);
    
    if (gameMode === 'online-multiplayer') {
      createMultiplayerGame();
    } else {
      // Local hotseat - go to deployment phase
      setAuthenticatedPlayer(1); // Start with player 1's deployment
      setGamePhase('deployment');
    }
  };

  // Handle deployment of a unit to a hex
  const deployUnit = (unit, q, r) => {
    const player = unit.player || deploymentPlayer;
    const deployZone = player === 1 ? player1DeploymentZone : player2DeploymentZone;
    const key = `${q}-${r}`;
    
    // Check if hex is in player's deployment zone
    if (!deployZone[key]) return false;
    
    // Check for existing units at this hex
    const unitsAtHex = deployedUnits.filter(u => u.q === q && u.r === r);
    
    // If there are units at this hex, check stacking rules
    if (unitsAtHex.length > 0) {
      // If stacking is disabled, can't place here
      if (!stackingEnabled) return false;
      
      // Check if existing units belong to the same player
      if (unitsAtHex.some(u => u.player !== player)) return false;
      
      // If stacking limit is enabled, check the limit
      if (stackingLimitEnabled) {
        // Count units that would be at this hex (excluding this unit if it's being moved)
        const otherUnitsAtHex = unitsAtHex.filter(u => !(u.id === unit.id && u.player === player));
        if (otherUnitsAtHex.length >= maxStackSize) return false;
      }
    }
    
    // Add unit to deployed units
    const deployedUnit = {
      ...unit,
      player: player,
      q,
      r
    };
    
    setDeployedUnits(prev => {
      // Remove if already deployed (moving it)
      const filtered = prev.filter(u => u.id !== unit.id || u.player !== player);
      return [...filtered, deployedUnit];
    });
    
    return true;
  };

  // Remove a deployed unit (put it back in the pool)
  const undeployUnit = (unitId, player) => {
    setDeployedUnits(prev => prev.filter(u => !(u.id === unitId && u.player === player)));
  };

  // Check if all units for a player are deployed
  const areAllUnitsDeployed = (player) => {
    const playerUnitList = player === 1 ? player1Units : player2Units;
    const deployedForPlayer = deployedUnits.filter(u => u.player === player);
    return deployedForPlayer.length === playerUnitList.length;
  };

  // Confirm deployment for current player
  const confirmDeployment = () => {
    if (deploymentPlayer === 1) {
      if (!areAllUnitsDeployed(1)) return;
      setPlayer1Deployed(true);
      setDeploymentPlayer(2);
      setAuthenticatedPlayer(2);
    } else {
      if (!areAllUnitsDeployed(2)) return;
      setPlayer2Deployed(true);
      // Both players deployed - start the game
      setUnits(deployedUnits);
      setAuthenticatedPlayer(1); // Player 1 starts
      setGamePhase('game');
    }
  };

  const hexToPixel = (q, r) => {
    const x = HEX_SIZE * Math.sqrt(3) * (q + 0.5 * (r % 2)) + 50;
    const y = HEX_SIZE * 1.5 * r + 50;
    return { x, y };
  };

  const offsetToCube = (q, r) => {
    const x = q - (r - (r & 1)) / 2;
    const z = r;
    const y = -x - z;
    return { x, y, z };
  };

  const hexDistance = (q1, r1, q2, r2) => {
    const a = offsetToCube(q1, r1);
    const b = offsetToCube(q2, r2);
    return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2;
  };

  const lerp = (a, b, t) => a + (b - a) * t;

  const cubeToOffset = (x, y, z) => {
    const r = z;
    const q = x + (r - (r & 1)) / 2;
    return { q, r };
  };

  const cubeRound = (x, y, z) => {
    let rx = Math.round(x);
    let ry = Math.round(y);
    let rz = Math.round(z);

    const xDiff = Math.abs(rx - x);
    const yDiff = Math.abs(ry - y);
    const zDiff = Math.abs(rz - z);

    if (xDiff > yDiff && xDiff > zDiff) {
      rx = -ry - rz;
    } else if (yDiff > zDiff) {
      ry = -rx - rz;
    } else {
      rz = -rx - ry;
    }

    return { x: rx, y: ry, z: rz };
  };

  const hexLine = (fromQ, fromR, toQ, toR) => {
    const start = offsetToCube(fromQ, fromR);
    const end = offsetToCube(toQ, toR);
    
    const distance = Math.max(
      Math.abs(start.x - end.x),
      Math.abs(start.y - end.y),
      Math.abs(start.z - end.z)
    );

    const results = [];
    for (let i = 0; i <= distance; i++) {
      const t = distance === 0 ? 0 : i / distance;
      const cube = cubeRound(
        lerp(start.x, end.x, t),
        lerp(start.y, end.y, t),
        lerp(start.z, end.z, t)
      );
      const offset = cubeToOffset(cube.x, cube.y, cube.z);
      
      if (offset.q >= 0 && offset.q < mapWidth && offset.r >= 0 && offset.r < mapHeight) {
        results.push(offset);
      }
    }
    
    return results;
  };

  const getUnitType = (typeId) => {
    return unitTypes.find(ut => ut.id === typeId);
  };

  // Determine which player's perspective to use for visibility
  // In multiplayer, always use the authenticated player's view
  // In local play (no authentication), use current player's view
  const viewingPlayer = authenticatedPlayer || currentPlayer;

  const isHexVisible = (q, r) => {
    if (!fogEnabled) return true;
    
    const playerUnits = units.filter(u => u.player === viewingPlayer);
    
    return playerUnits.some(unit => {
      const unitType = getUnitType(unit.typeId);
      const distance = hexDistance(unit.q, unit.r, q, r);
      
      if (distance > unitType.vision) {
        return false;
      }
      
      if (distance === 0) {
        return true;
      }
      
      if (distance === 1) {
        return true;
      }
      
      const line = hexLine(unit.q, unit.r, q, r);
      
      for (let i = 1; i < line.length; i++) {
        const hex = line[i];
        const terrain = getTerrainAt(hex.q, hex.r);
        
        if (terrain && terrain.blocksVision) {
          if (hex.q === q && hex.r === r) {
            return false;
          }
          return false;
        }
      }
      
      return true;
    });
  };

  const moveUnit = (q, r) => {
    if (isPanning) return;
    
    // Handle stack movement
    if (selectedStack && selectedStack.length > 0) {
      const pathResult = findPathForStack(selectedStack, q, r);
      if (pathResult) {
        setPendingMove({ 
          q, r, 
          path: pathResult.path, 
          cost: pathResult.totalCost,
          isAttack: false,
          enemyUnit: null,
          isStackMove: true,
          stackUnits: selectedStack
        });
      }
      return;
    }
    
    // Handle single unit movement
    if (!selectedUnit) return;
    
    const pathResult = findPath(selectedUnit, q, r);
    if (pathResult) {
      setPendingMove({ 
        q, r, 
        path: pathResult.path, 
        cost: pathResult.totalCost,
        isAttack: pathResult.isAttack,
        enemyUnit: pathResult.enemyUnit
      });
    }
  };

  // Check path for hidden enemy encounters or ZOC violations
  const checkPathForInterruptions = (unit, path) => {
    if (!path || path.length === 0) return null;
    
    let previousHex = { q: unit.q, r: unit.r };
    
    for (let i = 0; i < path.length; i++) {
      const currentHex = path[i];
      
      // Check if there's a hidden enemy at this hex
      const hiddenEnemy = units.find(u => 
        u.q === currentHex.q && 
        u.r === currentHex.r && 
        u.player !== unit.player && 
        !isEnemyVisible(u.q, u.r, unit.player)
      );
      
      if (hiddenEnemy) {
        // Return the last valid position (previous hex) and reason
        return {
          interruptedAtIndex: i,
          finalHex: previousHex,
          reason: 'enemy',
          encounteredUnit: hiddenEnemy
        };
      }
      
      // Check if movement into this hex violates hidden enemy ZOC
      const fullZOC = isInEnemyZOC(currentHex.q, currentHex.r, unit);
      const visibleZOC = isInVisibleEnemyZOC(currentHex.q, currentHex.r, unit);
      
      // If we're in a hidden enemy's ZOC (but not a visible one)
      if (fullZOC.inZOC && !visibleZOC.inZOC) {
        // Check if this movement would be blocked by the hidden ZOC
        if (!isMovementAllowedByZOC(previousHex.q, previousHex.r, currentHex.q, currentHex.r, unit)) {
          return {
            interruptedAtIndex: i,
            finalHex: previousHex,
            reason: 'zoc',
            encounteredUnit: fullZOC.enemyUnit
          };
        }
      }
      
      previousHex = currentHex;
    }
    
    return null; // No interruption
  };

  // Gather units for Sound of the Guns - returns units grouped by distance
  const gatherSOGUnits = (combatHex, attackingPlayer, primaryAttackerIds, primaryDefenderIds) => {
    if (!sogEnabled) {
      return { attackersByDistance: {}, defendersByDistance: {} };
    }
    
    const attackersByDistance = {};
    const defendersByDistance = {};
    
    // Find all units within SOG range
    for (const unit of units) {
      // Skip units already in the primary combat
      if (primaryAttackerIds.includes(unit.id) || primaryDefenderIds.includes(unit.id)) {
        continue;
      }
      
      const distance = hexDistance(unit.q, unit.r, combatHex.q, combatHex.r);
      
      // Must be within SOG range and greater than 0 (not at combat hex)
      if (distance > 0 && distance <= sogRange) {
        if (unit.player === attackingPlayer) {
          // This unit joins as an attacker
          if (!attackersByDistance[distance]) {
            attackersByDistance[distance] = [];
          }
          attackersByDistance[distance].push(unit);
        } else {
          // This unit joins as a defender
          if (!defendersByDistance[distance]) {
            defendersByDistance[distance] = [];
          }
          defendersByDistance[distance].push(unit);
        }
      }
    }
    
    return { attackersByDistance, defendersByDistance };
  };

  // Get all units from a byDistance object as a flat array
  const flattenByDistance = (byDistance) => {
    const result = [];
    Object.keys(byDistance).sort((a, b) => parseInt(a) - parseInt(b)).forEach(dist => {
      result.push(...byDistance[dist]);
    });
    return result;
  };

  const confirmMove = () => {
    if (!pendingMove) return;
    
    // Handle stack movement
    if (pendingMove.isStackMove && pendingMove.stackUnits) {
      const stackUnits = pendingMove.stackUnits;
      const refUnit = stackUnits[0];
      
      // Check if this is an attack (enemies at destination)
      const enemiesAtDest = units.filter(u => 
        u.q === pendingMove.q && u.r === pendingMove.r && u.player !== refUnit.player
      );
      
      if (enemiesAtDest.length > 0) {
        // Stack attack - initiate multi-unit combat
        const attackApproachHex = pendingMove.path.length > 1 
          ? pendingMove.path[pendingMove.path.length - 2]
          : { q: refUnit.q, r: refUnit.r };
        
        const combatHex = { q: pendingMove.q, r: pendingMove.r };
        
        // Move all attackers to the combat hex
        const movedAttackers = stackUnits.map(u => ({ ...u, q: pendingMove.q, r: pendingMove.r }));
        
        setUnits(units.map(u => {
          if (stackUnits.some(su => su.id === u.id)) {
            return { ...u, q: pendingMove.q, r: pendingMove.r };
          }
          return u;
        }));
        
        // Gather SOG units
        const { attackersByDistance, defendersByDistance } = gatherSOGUnits(
          combatHex,
          refUnit.player,
          movedAttackers.map(u => u.id),
          enemiesAtDest.map(u => u.id)
        );
        
        // Initialize combat strengths for all units
        const initialStrengths = {};
        movedAttackers.forEach(u => { initialStrengths[u.id] = u.strength; });
        enemiesAtDest.forEach(u => { initialStrengths[u.id] = u.strength; });
        flattenByDistance(attackersByDistance).forEach(u => { initialStrengths[u.id] = u.strength; });
        flattenByDistance(defendersByDistance).forEach(u => { initialStrengths[u.id] = u.strength; });
        setCombatStrengths(initialStrengths);
        
        // Initialize SOG participation (default: false - units don't move to combat)
        const initialParticipation = {};
        flattenByDistance(attackersByDistance).forEach(u => { initialParticipation[u.id] = false; });
        flattenByDistance(defendersByDistance).forEach(u => { initialParticipation[u.id] = false; });
        setSogParticipation(initialParticipation);
        
        setActiveCombat({
          attackers: movedAttackers,
          defenders: enemiesAtDest,
          attackersByDistance,
          defendersByDistance,
          combatHex,
          attackApproachHex
        });
        setCombatPhase('combat');
        setSelectedStack(null);
        setPendingMove(null);
        setHoveredHex(null);
        return;
      }
      
      // Normal stack movement (no combat)
      setUnits(units.map(u => {
        if (stackUnits.some(su => su.id === u.id)) {
          return { ...u, q: pendingMove.q, r: pendingMove.r };
        }
        return u;
      }));
      
      // Mark all units as moved
      const newMovedUnits = new Set(movedUnits);
      stackUnits.forEach(u => newMovedUnits.add(u.id));
      setMovedUnits(newMovedUnits);
      
      setSelectedStack(null);
      setPendingMove(null);
      setHoveredHex(null);
      return;
    }
    
    // Single unit movement
    if (!selectedUnit) return;
    
    // Check for interruptions along the path due to hidden enemies
    const interruption = checkPathForInterruptions(selectedUnit, pendingMove.path);
    
    if (interruption) {
      // Move unit to the last valid hex before interruption
      const finalQ = interruption.finalHex.q;
      const finalR = interruption.finalHex.r;
      
      // Only move if the final hex is different from starting position
      if (finalQ !== selectedUnit.q || finalR !== selectedUnit.r) {
        setUnits(units.map(u => 
          u.id === selectedUnit.id ? { ...u, q: finalQ, r: finalR } : u
        ));
      }
      
      // Show interruption modal
      setMoveInterrupted({
        unit: selectedUnit,
        finalHex: interruption.finalHex,
        reason: interruption.reason,
        encounteredUnit: interruption.encounteredUnit
      });
      
      setMovedUnits(new Set([...movedUnits, selectedUnit.id]));
      setSelectedUnit(null);
      setPendingMove(null);
      setHoveredHex(null);
      setUserPathTrail([]); // Clear trail after interruption
      return;
    }
    
    if (pendingMove.isAttack && pendingMove.enemyUnit) {
      // Get the hex immediately before the combat hex (attack direction)
      // If path length is 1, attacker came directly from their starting position
      // If path length > 1, attacker came from the second-to-last hex in the path
      const attackApproachHex = pendingMove.path.length > 1 
        ? pendingMove.path[pendingMove.path.length - 2]
        : { q: selectedUnit.q, r: selectedUnit.r };
      
      const combatHex = { q: pendingMove.q, r: pendingMove.r };
      
      // Move attacker into the combat hex (same hex as defender)
      setUnits(units.map(u => 
        u.id === selectedUnit.id ? { ...u, q: pendingMove.q, r: pendingMove.r } : u
      ));
      
      // Get all defenders at the combat hex (distance 0)
      const primaryDefenders = units.filter(u => 
        u.q === pendingMove.q && u.r === pendingMove.r && u.player !== selectedUnit.player
      );
      
      // Single attacker for single unit move (distance 0)
      const primaryAttackers = [{ ...selectedUnit, q: pendingMove.q, r: pendingMove.r }];
      
      // Gather SOG units
      const { attackersByDistance, defendersByDistance } = gatherSOGUnits(
        combatHex,
        selectedUnit.player,
        primaryAttackers.map(u => u.id),
        primaryDefenders.map(u => u.id)
      );
      
      // Initialize combat strengths for all units
      const initialStrengths = {};
      primaryAttackers.forEach(u => { initialStrengths[u.id] = u.strength; });
      primaryDefenders.forEach(u => { initialStrengths[u.id] = u.strength; });
      flattenByDistance(attackersByDistance).forEach(u => { initialStrengths[u.id] = u.strength; });
      flattenByDistance(defendersByDistance).forEach(u => { initialStrengths[u.id] = u.strength; });
      setCombatStrengths(initialStrengths);
      
      // Initialize SOG participation (default: false - units don't move to combat)
      const initialParticipation = {};
      flattenByDistance(attackersByDistance).forEach(u => { initialParticipation[u.id] = false; });
      flattenByDistance(defendersByDistance).forEach(u => { initialParticipation[u.id] = false; });
      setSogParticipation(initialParticipation);
      
      // Initiate combat with attack approach hex for retreat direction calculations
      setActiveCombat({
        attackers: primaryAttackers,
        defenders: primaryDefenders,
        attackersByDistance,
        defendersByDistance,
        combatHex,
        attackApproachHex
      });
      setCombatPhase('combat');
      setPendingMove(null);
      setHoveredHex(null);
    } else {
      // Check if destination has a hidden enemy (would trigger combat)
      const hiddenEnemyAtDest = units.find(u => 
        u.q === pendingMove.q && 
        u.r === pendingMove.r && 
        u.player !== selectedUnit.player && 
        !isEnemyVisible(u.q, u.r, selectedUnit.player)
      );
      
      if (hiddenEnemyAtDest) {
        // Encountered hidden enemy at destination - initiate combat
        // Get the hex immediately before the combat hex (attack direction)
        const attackApproachHex = pendingMove.path.length > 1 
          ? pendingMove.path[pendingMove.path.length - 2]
          : { q: selectedUnit.q, r: selectedUnit.r };
        
        const combatHex = { q: pendingMove.q, r: pendingMove.r };
        
        setUnits(units.map(u => 
          u.id === selectedUnit.id ? { ...u, q: pendingMove.q, r: pendingMove.r } : u
        ));
        
        // Get all defenders at the combat hex (all hidden enemies)
        const primaryDefenders = units.filter(u => 
          u.q === pendingMove.q && u.r === pendingMove.r && u.player !== selectedUnit.player
        );
        
        // Single attacker for single unit move
        const primaryAttackers = [{ ...selectedUnit, q: pendingMove.q, r: pendingMove.r }];
        
        // Gather SOG units
        const { attackersByDistance, defendersByDistance } = gatherSOGUnits(
          combatHex,
          selectedUnit.player,
          primaryAttackers.map(u => u.id),
          primaryDefenders.map(u => u.id)
        );
        
        // Initialize combat strengths
        const initialStrengths = {};
        primaryAttackers.forEach(u => { initialStrengths[u.id] = u.strength; });
        primaryDefenders.forEach(u => { initialStrengths[u.id] = u.strength; });
        flattenByDistance(attackersByDistance).forEach(u => { initialStrengths[u.id] = u.strength; });
        flattenByDistance(defendersByDistance).forEach(u => { initialStrengths[u.id] = u.strength; });
        setCombatStrengths(initialStrengths);
        
        // Initialize SOG participation (default: false - units don't move to combat)
        const initialParticipation = {};
        flattenByDistance(attackersByDistance).forEach(u => { initialParticipation[u.id] = false; });
        flattenByDistance(defendersByDistance).forEach(u => { initialParticipation[u.id] = false; });
        setSogParticipation(initialParticipation);
        
        setActiveCombat({
          attackers: primaryAttackers,
          defenders: primaryDefenders,
          attackersByDistance,
          defendersByDistance,
          combatHex,
          attackApproachHex
        });
        setCombatPhase('combat');
        setPendingMove(null);
        setHoveredHex(null);
        setUserPathTrail([]); // Clear trail when entering combat
      } else {
        // Normal movement
        setUnits(units.map(u => 
          u.id === selectedUnit.id ? { ...u, q: pendingMove.q, r: pendingMove.r } : u
        ));
        setMovedUnits(new Set([...movedUnits, selectedUnit.id]));
        setSelectedUnit(null);
        setPendingMove(null);
        setHoveredHex(null);
        setUserPathTrail([]); // Clear trail after move
      }
    }
  };

  // Acknowledge move interruption
  const acknowledgeMoveInterruption = () => {
    setMoveInterrupted(null);
  };

  const cancelMove = () => {
    setPendingMove(null);
    setSelectedStack(null);
    setUserPathTrail([]); // Clear trail when canceling move
  };

  // Check if a retreat hex is in the valid 180° arc based on attack direction
  // For attacker: retreat toward where they came from (back toward attackApproachHex)
  // For defender: retreat away from where the attack came from (opposite of attackApproachHex)
  const isValidRetreatDirection = (combatHex, retreatHex, attackApproachHex, isAttackerRetreating) => {
    if (!attackApproachHex) return true; // If no approach hex, allow all directions
    
    // Convert to cube coordinates for angle calculations
    const combatCube = offsetToCube(combatHex.q, combatHex.r);
    const retreatCube = offsetToCube(retreatHex.q, retreatHex.r);
    const approachCube = offsetToCube(attackApproachHex.q, attackApproachHex.r);
    
    // Calculate direction vectors
    // Attack direction: from approach hex TO combat hex
    const attackDirX = combatCube.x - approachCube.x;
    const attackDirY = combatCube.y - approachCube.y;
    const attackDirZ = combatCube.z - approachCube.z;
    
    // Retreat direction: from combat hex TO retreat hex
    const retreatDirX = retreatCube.x - combatCube.x;
    const retreatDirY = retreatCube.y - combatCube.y;
    const retreatDirZ = retreatCube.z - combatCube.z;
    
    // Calculate dot product to determine if retreat is in valid direction
    // Dot product > 0 means same general direction, < 0 means opposite direction
    const dotProduct = (attackDirX * retreatDirX) + (attackDirY * retreatDirY) + (attackDirZ * retreatDirZ);
    
    if (isAttackerRetreating) {
      // Attacker retreats BACKWARD (opposite to attack direction)
      // Valid if dot product <= 0 (perpendicular or backward)
      return dotProduct <= 0;
    } else {
      // Defender retreats AWAY from attack (same direction as attack was going)
      // Valid if dot product >= 0 (perpendicular or forward from attack direction)
      return dotProduct >= 0;
    }
  };

  // Calculate valid retreat hexes for a unit (single hex, respects retreat direction and stacking)
  const getValidRetreatHexes = (retreatingUnit, alreadyRetreatedPositions = {}) => {
    const validHexes = [];
    
    // Get only adjacent hexes (1 hex retreat distance)
    const neighbors = getHexNeighbors(retreatingUnit.q, retreatingUnit.r);
    
    // Get all combatant IDs to exclude from occupation checks
    // (all units are at the same hex during combat)
    // Include both primary combatants AND participating SOG units
    const primaryAttackerIds = activeCombat ? activeCombat.attackers.map(u => u.id) : [];
    const primaryDefenderIds = activeCombat ? activeCombat.defenders.map(u => u.id) : [];
    
    // Get participating SOG unit IDs
    const sogAttackerIds = activeCombat && activeCombat.attackersByDistance 
      ? flattenByDistance(activeCombat.attackersByDistance).filter(u => sogParticipation[u.id]).map(u => u.id)
      : [];
    const sogDefenderIds = activeCombat && activeCombat.defendersByDistance
      ? flattenByDistance(activeCombat.defendersByDistance).filter(u => sogParticipation[u.id]).map(u => u.id)
      : [];
    
    const allAttackerIds = [...primaryAttackerIds, ...sogAttackerIds];
    const allDefenderIds = [...primaryDefenderIds, ...sogDefenderIds];
    const allCombatantIds = [...allAttackerIds, ...allDefenderIds];
    
    // Determine if this is an attacker or defender retreating
    const isAttackerRetreating = allAttackerIds.includes(retreatingUnit.id);
    
    // Get combat hex and attack approach hex for direction calculation
    const combatHex = activeCombat?.combatHex;
    const attackApproachHex = activeCombat?.attackApproachHex;
    
    for (const neighbor of neighbors) {
      const { q, r } = neighbor;
      const hexKey = `${q}-${r}`;
      
      // Check retreat direction (180° arc restriction)
      if (combatHex && attackApproachHex) {
        if (!isValidRetreatDirection(combatHex, { q, r }, attackApproachHex, isAttackerRetreating)) {
          continue;
        }
      }
      
      // Count units at this hex (excluding combatants still at combat hex)
      const unitsAtHex = units.filter(u => u.q === q && u.r === r && !allCombatantIds.includes(u.id));
      
      // Count units that have already retreated to this hex
      const retreatedToHex = alreadyRetreatedPositions[hexKey] || 0;
      
      const totalAtHex = unitsAtHex.length + retreatedToHex;
      
      // Check stacking limits
      if (totalAtHex > 0) {
        if (!stackingEnabled) continue;
        if (stackingLimitEnabled && (totalAtHex + 1) > maxStackSize) continue;
      }
      
      // Check if terrain is passable
      const moveCost = getMovementCost(retreatingUnit.typeId, q, r);
      if (moveCost === Infinity) continue;
      
      // Check if destination hex is in enemy ZOC (can't retreat into enemy ZOC)
      // But exclude units involved in the combat
      const enemyUnitsForZOC = units.filter(u => 
        u.player !== retreatingUnit.player && !allCombatantIds.includes(u.id)
      );
      
      let inOtherEnemyZOC = false;
      for (const enemy of enemyUnitsForZOC) {
        const enemyType = getUnitType(enemy.typeId);
        const zocRange = enemyType?.zoc || 0;
        if (zocRange > 0) {
          const distance = hexDistance(enemy.q, enemy.r, q, r);
          if (distance <= zocRange) {
            inOtherEnemyZOC = true;
            break;
          }
        }
      }
      if (inOtherEnemyZOC) continue;
      
      validHexes.push({ q, r });
    }
    
    return validHexes;
  };

  // Open the resolve combat panel
  const openResolveCombat = () => {
    setCombatPhase('resolve');
  };

  // Handle combat resolution - updated for multi-unit combat with SOG
  const resolveCombat = (winner) => {
    if (!activeCombat) return;
    
    const { attackers, defenders, attackersByDistance, defendersByDistance, combatHex } = activeCombat;
    
    // Get participating SOG units (those who opted to move to combat)
    const participatingSOGAttackers = flattenByDistance(attackersByDistance || {}).filter(u => sogParticipation[u.id]);
    const participatingSOGDefenders = flattenByDistance(defendersByDistance || {}).filter(u => sogParticipation[u.id]);
    
    // All units that are part of this combat (primary + participating SOG)
    const allCombatAttackers = [...attackers, ...participatingSOGAttackers];
    const allCombatDefenders = [...defenders, ...participatingSOGDefenders];
    
    // Find units that will be destroyed (strength reduced to 0)
    const destroyedUnitIds = [];
    Object.entries(combatStrengths).forEach(([unitId, strength]) => {
      if (strength <= 0) {
        destroyedUnitIds.push(parseInt(unitId));
      }
    });
    
    // Move participating SOG units to the combat hex, update strengths, and remove destroyed units
    setUnits(units.map(u => {
      // Remove units with 0 strength
      if (destroyedUnitIds.includes(u.id)) {
        return null; // Will be filtered out
      }
      // Move participating SOG attackers to combat hex
      if (participatingSOGAttackers.some(sog => sog.id === u.id)) {
        return { 
          ...u, 
          q: combatHex.q, 
          r: combatHex.r,
          strength: combatStrengths[u.id] ?? u.strength 
        };
      }
      // Move participating SOG defenders to combat hex
      if (participatingSOGDefenders.some(sog => sog.id === u.id)) {
        return { 
          ...u, 
          q: combatHex.q, 
          r: combatHex.r,
          strength: combatStrengths[u.id] ?? u.strength 
        };
      }
      // Update strength for other participating units
      if (combatStrengths[u.id] !== undefined) {
        return { ...u, strength: combatStrengths[u.id] };
      }
      return u;
    }).filter(u => u !== null)); // Remove null entries (destroyed units)
    
    setCombatWinner(winner);
    
    // Determine which side needs to retreat (the loser)
    // All losing units at combat hex need to retreat (primary + participating SOG)
    // Exclude destroyed units from retreat
    const losingUnits = winner === 'attacker' ? allCombatDefenders : allCombatAttackers;
    const survivingLosingUnits = losingUnits.filter(u => !destroyedUnitIds.includes(u.id));
    
    // Prepare surviving losing units with updated positions and strengths (all now at combat hex)
    const updatedLosingUnits = survivingLosingUnits.map(u => ({
      ...u,
      q: combatHex.q,
      r: combatHex.r,
      strength: combatStrengths[u.id] ?? u.strength
    }));
    
    // Check if any surviving units can retreat
    const unitsWithRetreats = updatedLosingUnits.filter(u => {
      const hexes = getValidRetreatHexes(u, {});
      return hexes.length > 0;
    });
    
    // Filter out destroyed attackers when marking as moved
    const survivingAttackers = allCombatAttackers.filter(u => !destroyedUnitIds.includes(u.id));
    
    if (unitsWithRetreats.length === 0 && updatedLosingUnits.length > 0) {
      // No valid retreats - all surviving losing units are eliminated
      const losingIds = survivingLosingUnits.map(u => u.id);
      setUnits(prev => prev.filter(u => !losingIds.includes(u.id)));
      
      // Mark surviving attacking units (primary + participating SOG) as moved
      const newMovedUnits = new Set(movedUnits);
      survivingAttackers.forEach(u => newMovedUnits.add(u.id));
      setMovedUnits(newMovedUnits);
      
      setSelectedUnit(null);
      setActiveCombat(null);
      setCombatPhase(null);
      setCombatWinner(null);
      setCombatStrengths({});
      setSogParticipation({});
    } else if (updatedLosingUnits.length === 0) {
      // No units need to retreat (all were destroyed or winners)
      const newMovedUnits = new Set(movedUnits);
      survivingAttackers.forEach(u => newMovedUnits.add(u.id));
      setMovedUnits(newMovedUnits);
      
      setSelectedUnit(null);
      setActiveCombat(null);
      setCombatPhase(null);
      setCombatWinner(null);
      setCombatStrengths({});
      setSogParticipation({});
    } else {
      // Set up retreat phase with surviving losing units (including participating SOG)
      setRetreatingUnits(updatedLosingUnits);
      setRetreatPositions({});
      setSelectedRetreatUnit(null);
      setValidRetreatHexes([]);
      setCombatPhase('retreat');
    }
  };

  // Select a unit for retreat
  const selectUnitForRetreat = (unit) => {
    setSelectedRetreatUnit(unit);
    const hexes = getValidRetreatHexes(unit, retreatPositions);
    setValidRetreatHexes(hexes);
  };

  // Handle retreat hex selection for the selected unit
  const selectRetreatHex = (q, r) => {
    if (!selectedRetreatUnit || !activeCombat) return;
    
    const { attackers, attackersByDistance } = activeCombat;
    const hexKey = `${q}-${r}`;
    
    // Move the retreating unit to selected hex
    setUnits(prev => prev.map(u => 
      u.id === selectedRetreatUnit.id ? { ...u, q, r } : u
    ));
    
    // Update retreat positions tracking
    const newRetreatPositions = { 
      ...retreatPositions, 
      [hexKey]: (retreatPositions[hexKey] || 0) + 1 
    };
    setRetreatPositions(newRetreatPositions);
    
    // Remove this unit from retreating units
    const remainingUnits = retreatingUnits.filter(u => u.id !== selectedRetreatUnit.id);
    setRetreatingUnits(remainingUnits);
    
    // Clear selection
    setSelectedRetreatUnit(null);
    setValidRetreatHexes([]);
    
    // Check if all units have retreated
    if (remainingUnits.length === 0) {
      // All retreats complete - mark participating attackers as moved
      const participatingSOGAttackers = flattenByDistance(attackersByDistance || {}).filter(u => sogParticipation[u.id]);
      const allCombatAttackers = [...attackers, ...participatingSOGAttackers];
      const newMovedUnits = new Set(movedUnits);
      allCombatAttackers.forEach(u => newMovedUnits.add(u.id));
      setMovedUnits(newMovedUnits);
      
      // Clean up combat state
      setSelectedUnit(null);
      setActiveCombat(null);
      setCombatPhase(null);
      setCombatWinner(null);
      setRetreatingUnits([]);
      setRetreatPositions({});
      setCombatStrengths({});
      setSogParticipation({});
    }
  };

  // Eliminate a unit that cannot retreat
  const eliminateRetreatUnit = (unit) => {
    // Remove the unit from the game
    setUnits(prev => prev.filter(u => u.id !== unit.id));
    
    // Remove from retreating units
    const remainingUnits = retreatingUnits.filter(u => u.id !== unit.id);
    setRetreatingUnits(remainingUnits);
    
    // Clear selection if this was selected
    if (selectedRetreatUnit?.id === unit.id) {
      setSelectedRetreatUnit(null);
      setValidRetreatHexes([]);
    }
    
    // Check if all units have been handled
    if (remainingUnits.length === 0) {
      const { attackers, attackersByDistance } = activeCombat;
      
      // All retreats complete - mark participating attackers as moved
      const participatingSOGAttackers = flattenByDistance(attackersByDistance || {}).filter(u => sogParticipation[u.id]);
      const allCombatAttackers = [...attackers, ...participatingSOGAttackers];
      const newMovedUnits = new Set(movedUnits);
      allCombatAttackers.forEach(u => newMovedUnits.add(u.id));
      setMovedUnits(newMovedUnits);
      
      // Clean up combat state
      setSelectedUnit(null);
      setActiveCombat(null);
      setCombatPhase(null);
      setCombatWinner(null);
      setRetreatingUnits([]);
      setRetreatPositions({});
      setCombatStrengths({});
      setSogParticipation({});
    }
  };

  // Cancel combat (go back to unit selection)
  const cancelCombat = () => {
    setActiveCombat(null);
    setCombatPhase(null);
    setCombatWinner(null);
    setRetreatingUnits([]);
    setSelectedRetreatUnit(null);
    setRetreatPositions({});
    setValidRetreatHexes([]);
    setSelectedUnit(null);
    setCombatStrengths({});
    setSogParticipation({});
  };

  const handleMouseDown = (e) => {
    if (e.button === 0 && !pendingMove) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX + scrollPos.x,
        y: e.clientY + scrollPos.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning && scrollContainerRef.current) {
      const deltaX = panStart.x - e.clientX;
      const deltaY = panStart.y - e.clientY;
      
      scrollContainerRef.current.scrollLeft = deltaX;
      scrollContainerRef.current.scrollTop = deltaY;
      
      setScrollPos({ x: deltaX, y: deltaY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Handle mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    setZoomLevel(prev => Math.min(2.0, Math.max(0.25, prev + delta)));
  };

  // Handle right-click to deselect
  const handleContextMenu = (e) => {
    e.preventDefault();
    if (selectedUnit || selectedStack) {
      setSelectedUnit(null);
      setSelectedStack(null);
      setUserPathTrail([]);
      setPendingMove(null);
      setHoveredHex(null);
      setStackSelectionHex(null);
    }
  };

  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, panStart, scrollPos]);

  const endTurn = async () => {
    const nextPlayer = currentPlayer === 1 ? 2 : 1;
    
    if (gameMode === 'local-hotseat') {
      // Show turn transition screen instead of immediately switching
      setNextPlayerNum(nextPlayer);
      setTurnTransitionPending(true);
      setMovedUnits(new Set());
      setSelectedUnit(null);
      setSelectedStack(null);
      setPendingMove(null);
      setHoveredHex(null);
      setStackSelectionHex(null);
      setUserPathTrail([]); // Clear trail
      return;
    }
    
    // Online multiplayer - proceed as before
    setCurrentPlayer(nextPlayer);
    setMovedUnits(new Set());
    setSelectedUnit(null);
    setSelectedStack(null);
    setPendingMove(null);
    setHoveredHex(null);
    setStackSelectionHex(null);
    setUserPathTrail([]); // Clear trail
    
    // Auto-save after ending turn in multiplayer
    // We need to save with the new player value directly since setState is async
    if (gameCode) {
      const gameState = {
        gameName,
        gameCode,
        player1Code,
        player2Code,
        mapWidth,
        mapHeight,
        unitTypes,
        nextUnitTypeId,
        terrainTypes,
        nextTerrainTypeId,
        terrainMap,
        player1Units,
        player2Units,
        player1Color,
        player2Color,
        nextUnitId,
        currentPlayer: nextPlayer, // Use the new player value
        units,
        movedUnits: [], // Reset moved units for next turn
        fogEnabled,
        initiativeType,
        gameMode,
        gamePhase,
        lastUpdated: new Date().toISOString()
      };

      try {
        await window.storage.set(`game:${gameCode}`, JSON.stringify(gameState), true);
        await window.storage.set(`player:${player1Code}`, gameCode, true);
        await window.storage.set(`player:${player2Code}`, gameCode, true);
      } catch (error) {
        console.error('Failed to save game:', error);
      }
    }
  };

  // Continue to next player's turn (for hotseat mode)
  const continueToNextPlayer = () => {
    setCurrentPlayer(nextPlayerNum);
    setAuthenticatedPlayer(nextPlayerNum);
    setTurnTransitionPending(false);
    setNextPlayerNum(null);
  };

  const goToTitle = () => {
    setGamePhase('title');
    setCurrentPlayer(1);
    setMovedUnits(new Set());
    setSelectedUnit(null);
    setPlayer1Units([]);
    setPlayer2Units([]);
    setUnits([]);
    setTerrainMap({});
    setPendingMove(null);
    setHoveredHex(null);
    setPlayer1Color('#3b82f6');
    setPlayer2Color('#ef4444');
    setZoomLevel(1); // Reset zoom
    setUserPathTrail([]); // Clear path trail
    // Reset multiplayer state
    setGameCode(null);
    setPlayer1Code(null);
    setPlayer2Code(null);
    setAuthenticatedPlayer(null);
    setLoadGameInput('');
    setLoadGameError('');
    setGameName('');
    setInitiativeType('igo-ugo');
    setGameMode('local-hotseat');
    setTurnTransitionPending(false);
    setNextPlayerNum(null);
    // Reset deployment state
    setPlayer1DeploymentZone({});
    setPlayer2DeploymentZone({});
    setDeployedUnits([]);
    setPlayer1Deployed(false);
    setPlayer2Deployed(false);
    setDeploymentPlayer(1);
    setDraggingUnit(null);
    // Reset stacking state
    setStackSelectionHex(null);
    setSelectedStack(null);
    setStackingEnabled(false);
    setStackingLimitEnabled(false);
    setMaxStackSize(3);
  };

  const resetGame = () => {
    setGamePhase('setup');
    setCurrentPlayer(1);
    setMovedUnits(new Set());
    setSelectedUnit(null);
    setPlayer1Units([]);
    setPlayer2Units([]);
    setTerrainMap({});
    setPendingMove(null);
    setHoveredHex(null);
    setPlayer1Color('#3b82f6');
    setPlayer2Color('#ef4444');
    // Reset deployment state
    setPlayer1DeploymentZone({});
    setPlayer2DeploymentZone({});
    setDeployedUnits([]);
    setPlayer1Deployed(false);
    setPlayer2Deployed(false);
    setDeploymentPlayer(1);
    setDraggingUnit(null);
    // Reset stacking selection
    setStackSelectionHex(null);
    setSelectedStack(null);
  };

  const getHexPath = (x, y) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      points.push([
        x + HEX_SIZE * Math.cos(angle),
        y + HEX_SIZE * Math.sin(angle)
      ]);
    }
    return points.map(p => p.join(',')).join(' ');
  };

  const validMoves = selectedStack ? getValidMovesForStack(selectedStack) : (selectedUnit ? getValidMoves(selectedUnit) : []);
  const hoveredPath = hoveredHex && !pendingMove ? (
    selectedStack ? findPathForStack(selectedStack, hoveredHex.q, hoveredHex.r) :
    (selectedUnit ? findPathFollowingTrail(selectedUnit, hoveredHex.q, hoveredHex.r, userPathTrail) : null)
  ) : null;

  // Title Screen
  if (gamePhase === 'title') {
    return (
      <div className="w-full min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 text-amber-400">Pocket Generals</h1>
          <p className="text-2xl text-slate-400">Wargame Companion</p>
        </div>
        
        <div className="flex flex-col gap-4 w-64">
          <button
            onClick={() => setGamePhase('campaign-options')}
            className="bg-amber-600 hover:bg-amber-700 text-xl font-semibold py-4 px-8 rounded-lg transition-colors"
          >
            Create New Game
          </button>
          <button
            onClick={() => setGamePhase('load-game')}
            className="bg-slate-600 hover:bg-slate-500 text-xl font-semibold py-4 px-8 rounded-lg transition-colors"
          >
            Load Game
          </button>
          <button
            disabled
            className="bg-slate-700 text-slate-500 cursor-not-allowed text-xl font-semibold py-4 px-8 rounded-lg"
          >
            Options
          </button>
          <button
            disabled
            className="bg-slate-700 text-slate-500 cursor-not-allowed text-xl font-semibold py-4 px-8 rounded-lg"
          >
            Exit
          </button>
        </div>
      </div>
    );
  }

  // Campaign Options Screen
  if (gamePhase === 'campaign-options') {
    return (
      <div className="w-full min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Campaign Options</h1>
            <button
              onClick={goToTitle}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded"
            >
              <Home className="w-5 h-5" />
              Title
            </button>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Game Mode</h2>
            <div className="space-y-3">
              <label 
                className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors ${
                  gameMode === 'local-hotseat' 
                    ? 'bg-blue-900/50 border-2 border-blue-500' 
                    : 'bg-slate-700 border-2 border-transparent hover:border-slate-500'
                }`}
                onClick={() => setGameMode('local-hotseat')}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                  gameMode === 'local-hotseat' ? 'border-blue-500' : 'border-slate-400'
                }`}>
                  {gameMode === 'local-hotseat' && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                </div>
                <div>
                  <p className="font-semibold">Local Hotseat</p>
                  <p className="text-sm text-slate-400">Two players share the same device, taking turns. A warning screen appears between turns to prevent seeing the other player's positions.</p>
                </div>
              </label>
              
              <label 
                className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors ${
                  gameMode === 'online-multiplayer' 
                    ? 'bg-blue-900/50 border-2 border-blue-500' 
                    : 'bg-slate-700 border-2 border-transparent hover:border-slate-500'
                }`}
                onClick={() => setGameMode('online-multiplayer')}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                  gameMode === 'online-multiplayer' ? 'border-blue-500' : 'border-slate-400'
                }`}>
                  {gameMode === 'online-multiplayer' && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                </div>
                <div>
                  <p className="font-semibold">Online Multiplayer</p>
                  <p className="text-sm text-slate-400">Each player receives a unique code to access the game from their own device. Game state is saved and synced between players.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Game Info</h2>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Game Name (optional)</label>
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="e.g., Battle of the Bulge"
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Map Size</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Width (hexes)</label>
                <input
                  type="number"
                  min="10"
                  max="50"
                  value={mapWidth}
                  onChange={(e) => setMapWidth(parseInt(e.target.value) || 10)}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Height (hexes)</label>
                <input
                  type="number"
                  min="10"
                  max="50"
                  value={mapHeight}
                  onChange={(e) => setMapHeight(parseInt(e.target.value) || 10)}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Fog of War</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFogEnabled(!fogEnabled)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  fogEnabled 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
              >
                {fogEnabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                {fogEnabled ? 'Enabled' : 'Disabled'}
              </button>
              <span className="text-slate-400 text-sm">
                {fogEnabled 
                  ? 'Units can only see hexes within their vision range' 
                  : 'All hexes are visible to both players'}
              </span>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Unit Stacking</h2>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => setStackingEnabled(!stackingEnabled)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  stackingEnabled 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
              >
                {stackingEnabled ? 'Enabled' : 'Disabled'}
              </button>
              
              {stackingEnabled && (
                <div className="flex items-center gap-3 bg-slate-700 px-4 py-2 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stackingLimitEnabled}
                      onChange={(e) => setStackingLimitEnabled(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-500 bg-slate-600 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm">Limit Stack Size</span>
                  </label>
                  
                  {stackingLimitEnabled && (
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-slate-400">Max:</label>
                      <input
                        type="number"
                        min="2"
                        max="20"
                        value={maxStackSize}
                        onChange={(e) => setMaxStackSize(Math.max(2, parseInt(e.target.value) || 2))}
                        className="w-16 bg-slate-600 border border-slate-500 rounded px-2 py-1 text-center"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-3">
              {stackingEnabled 
                ? stackingLimitEnabled 
                  ? `Multiple friendly units can occupy the same hex (max ${maxStackSize} units per hex)`
                  : 'Multiple friendly units can occupy the same hex (unlimited)'
                : 'Only one unit can occupy each hex'}
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Sound of the Guns</h2>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => setSogEnabled(!sogEnabled)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  sogEnabled 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
              >
                {sogEnabled ? 'Enabled' : 'Disabled'}
              </button>
              
              {sogEnabled && (
                <div className="flex items-center gap-3 bg-slate-700 px-4 py-2 rounded-lg">
                  <label className="text-sm text-slate-400">Range (hexes):</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={sogRange}
                    onChange={(e) => setSogRange(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 bg-slate-600 border border-slate-500 rounded px-2 py-1 text-center"
                  />
                </div>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-3">
              {sogEnabled 
                ? `Units within ${sogRange} hex${sogRange > 1 ? 'es' : ''} of a combat are automatically drawn into the battle`
                : 'Only units directly involved in combat participate'}
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Initiative System</h2>
            <div className="space-y-3">
              <label 
                className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors ${
                  initiativeType === 'igo-ugo' 
                    ? 'bg-blue-900/50 border-2 border-blue-500' 
                    : 'bg-slate-700 border-2 border-transparent hover:border-slate-500'
                }`}
                onClick={() => setInitiativeType('igo-ugo')}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                  initiativeType === 'igo-ugo' ? 'border-blue-500' : 'border-slate-400'
                }`}>
                  {initiativeType === 'igo-ugo' && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                </div>
                <div>
                  <p className="font-semibold">I Go, You Go</p>
                  <p className="text-sm text-slate-400">Player 1 moves all their units, then Player 2 moves all their units. Traditional turn-based gameplay.</p>
                </div>
              </label>
              
              <label 
                className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors ${
                  initiativeType === 'unit-initiative' 
                    ? 'bg-blue-900/50 border-2 border-blue-500' 
                    : 'bg-slate-700 border-2 border-transparent hover:border-slate-500'
                }`}
                onClick={() => setInitiativeType('unit-initiative')}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                  initiativeType === 'unit-initiative' ? 'border-blue-500' : 'border-slate-400'
                }`}>
                  {initiativeType === 'unit-initiative' && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                </div>
                <div>
                  <p className="font-semibold">Unit Initiative <span className="text-amber-400 text-xs ml-2">Coming Soon</span></p>
                  <p className="text-sm text-slate-400">Units activate individually based on initiative values. More dynamic and unpredictable gameplay.</p>
                </div>
              </label>
            </div>
          </div>

          <button
            onClick={() => setGamePhase('setup')}
            className="w-full bg-green-600 hover:bg-green-700 text-lg font-semibold py-4 rounded-lg flex items-center justify-center gap-2"
          >
            Continue to Game Setup
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  // Load Game Screen
  if (gamePhase === 'load-game') {
    return (
      <div className="w-full min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-amber-400">Load Game</h1>
          <p className="text-lg text-slate-400">Enter your player code to join a game</p>
        </div>
        
        <div className="bg-slate-800 p-8 rounded-lg w-full max-w-md">
          <div className="mb-6">
            <label className="block text-sm text-slate-400 mb-2">Player Code</label>
            <input
              type="text"
              value={loadGameInput}
              onChange={(e) => {
                setLoadGameInput(e.target.value.toUpperCase());
                setLoadGameError('');
              }}
              placeholder="Enter your 6-character code"
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-xl text-center tracking-widest uppercase"
              maxLength={8}
            />
          </div>
          
          {loadGameError && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
              {loadGameError}
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              onClick={goToTitle}
              className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-semibold"
            >
              Back
            </button>
            <button
              onClick={handleLoadGame}
              disabled={isLoading || loadGameInput.length < 6}
              className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 disabled:cursor-not-allowed py-3 rounded-lg font-semibold"
            >
              {isLoading ? 'Loading...' : 'Join Game'}
            </button>
          </div>
        </div>
        
        <p className="mt-8 text-slate-500 text-sm max-w-md text-center">
          Your player code was given to you when the game was created. 
          Each player has a unique code that determines which army they control.
        </p>
      </div>
    );
  }

  // Game Created Screen - shows codes after setup
  if (gamePhase === 'game-created') {
    return (
      <div className="w-full min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-green-400">Game Created!</h1>
          <p className="text-lg text-slate-400">Share these codes with each player</p>
        </div>
        
        <div className="bg-slate-800 p-8 rounded-lg w-full max-w-lg">
          {gameName && (
            <div className="mb-6 text-center">
              <p className="text-slate-400 text-sm">Game Name</p>
              <p className="text-2xl font-bold">{gameName}</p>
            </div>
          )}
          
          <div className="mb-6 p-4 bg-slate-700 rounded-lg">
            <p className="text-slate-400 text-sm mb-1">Game Code (for reference)</p>
            <p className="text-2xl font-mono font-bold text-center tracking-widest">{gameCode}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-900/30 border-2 border-blue-500 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: player1Color }}
                />
                <p className="text-blue-300 text-sm">Player 1 Code</p>
              </div>
              <p className="text-2xl font-mono font-bold text-center tracking-widest text-blue-100">{player1Code}</p>
            </div>
            
            <div className="p-4 bg-red-900/30 border-2 border-red-500 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: player2Color }}
                />
                <p className="text-red-300 text-sm">Player 2 Code</p>
              </div>
              <p className="text-2xl font-mono font-bold text-center tracking-widest text-red-100">{player2Code}</p>
            </div>
          </div>
          
          <div className="bg-amber-900/30 border border-amber-500 rounded-lg p-4 mb-6">
            <p className="text-amber-200 text-sm">
              <strong>Important:</strong> Save these codes! Each player needs their unique code to access the game. 
              Players can only control their assigned army.
            </p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={goToTitle}
              className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-semibold"
            >
              Back to Title
            </button>
            <button
              onClick={() => {
                setAuthenticatedPlayer(1);
                setGamePhase('game');
                saveGame();
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold"
            >
              Start as Player 1
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gamePhase === 'setup') {
    return (
      <div className="w-full min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Game Setup</h1>
            <button
              onClick={goToTitle}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded"
            >
              <Home className="w-5 h-5" />
              Title
            </button>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Unit Types</h2>
              <button
                onClick={addUnitType}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                <Plus className="w-4 h-4" />
                Add Unit Type
              </button>
            </div>

            <div className="space-y-4">
              {unitTypes.map((unitType) => (
                <div key={unitType.id} className="bg-slate-700 p-4 rounded-lg">
                  <div className="grid grid-cols-6 gap-3 items-end">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Name</label>
                      <input
                        type="text"
                        value={unitType.name}
                        onChange={(e) => updateUnitType(unitType.id, 'name', e.target.value)}
                        className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Move</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={unitType.move}
                        onChange={(e) => updateUnitType(unitType.id, 'move', parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Vision</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={unitType.vision}
                        onChange={(e) => updateUnitType(unitType.id, 'vision', parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">ZOC</label>
                      <select
                        value={unitType.zoc || 0}
                        onChange={(e) => updateUnitType(unitType.id, 'zoc', parseInt(e.target.value))}
                        className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2"
                      >
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Shape</label>
                      <select
                        value={unitType.shape}
                        onChange={(e) => updateUnitType(unitType.id, 'shape', e.target.value)}
                        className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2"
                      >
                        {Object.entries(unitShapes).map(([key, value]) => (
                          <option key={key} value={key}>{value.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <button
                        onClick={() => removeUnitType(unitType.id)}
                        disabled={unitTypes.length === 1}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-3 py-2 rounded"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    ZOC (Zone of Control): 0 = own hex only, 1 = adjacent hexes, 2 = two hex radius. Enemy units in ZOC can only move directly toward or away from the controlling unit.
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Terrain Types</h2>
              <button
                onClick={addTerrainType}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
              >
                <Plus className="w-4 h-4" />
                Add Terrain Type
              </button>
            </div>

            <div className="space-y-6">
              {terrainTypes.map((terrain) => (
                <div key={terrain.id} className="bg-slate-700 p-4 rounded-lg">
                  <div className="grid grid-cols-4 gap-3 items-end mb-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Name</label>
                      <input
                        type="text"
                        value={terrain.name}
                        onChange={(e) => updateTerrainType(terrain.id, 'name', e.target.value)}
                        className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Color</label>
                      <input
                        type="color"
                        value={terrain.color}
                        onChange={(e) => updateTerrainType(terrain.id, 'color', e.target.value)}
                        className="w-full h-10 bg-slate-600 border border-slate-500 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Blocks Vision</label>
                      <button
                        onClick={() => updateTerrainType(terrain.id, 'blocksVision', !terrain.blocksVision)}
                        className={`w-full h-10 rounded font-semibold ${
                          terrain.blocksVision 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {terrain.blocksVision ? 'YES' : 'NO'}
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={() => removeTerrainType(terrain.id)}
                        disabled={terrainTypes.length === 1}
                        className="w-full h-10 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-600 pt-3">
                    <label className="block text-sm text-slate-400 mb-3">Movement Cost by Unit Type:</label>
                    <div className="grid grid-cols-3 gap-3">
                      {unitTypes.map((unitType) => (
                        <div key={unitType.id}>
                          <label className="block text-xs text-slate-400 mb-1">{unitType.name}</label>
                          <select
                            value={terrain.moveCosts[unitType.id] || 1}
                            onChange={(e) => {
                              const val = e.target.value === 'impassable' ? 'impassable' : parseInt(e.target.value);
                              updateTerrainMoveCost(terrain.id, unitType.id, val);
                            }}
                            className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm"
                          >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="impassable">Impassable</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setGamePhase('campaign-options')}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-lg font-semibold py-4 rounded-lg"
            >
              Back
            </button>
            <button
              onClick={proceedToTerrainPaint}
              className="flex-1 bg-green-600 hover:bg-green-700 text-lg font-semibold py-4 rounded-lg flex items-center justify-center gap-2"
            >
              Continue to Terrain Setup
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gamePhase === 'terrain-paint') {
    return (
      <div className="w-full h-screen bg-slate-900 text-white p-4">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Paint Terrain & Deployment Zones</h1>
            <button
              onClick={goToTitle}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded"
            >
              <Home className="w-5 h-5" />
              Title
            </button>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg mb-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-slate-400 mr-2">Terrain:</span>
              {terrainTypes.map((terrain) => (
                <button
                  key={terrain.id}
                  onClick={() => setSelectedTerrainBrush(terrain.id)}
                  className={`px-4 py-2 rounded font-semibold ${
                    selectedTerrainBrush === terrain.id
                      ? 'ring-2 ring-yellow-400'
                      : 'hover:opacity-80'
                  }`}
                  style={{ backgroundColor: terrain.color }}
                >
                  {terrain.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-slate-400 mr-2">Deployment Zones:</span>
              <button
                onClick={() => setSelectedTerrainBrush('deploy-clear')}
                className={`px-4 py-2 rounded font-semibold ${
                  selectedTerrainBrush === 'deploy-clear'
                    ? 'bg-slate-500 ring-2 ring-yellow-400'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                Clear Zone
              </button>
              <button
                onClick={() => setSelectedTerrainBrush('deploy-p1')}
                className={`px-4 py-2 rounded font-semibold border-2 ${
                  selectedTerrainBrush === 'deploy-p1'
                    ? 'ring-2 ring-yellow-400'
                    : 'hover:opacity-80'
                }`}
                style={{ backgroundColor: `${player1Color}40`, borderColor: player1Color }}
              >
                Player 1 Zone
              </button>
              <button
                onClick={() => setSelectedTerrainBrush('deploy-p2')}
                className={`px-4 py-2 rounded font-semibold border-2 ${
                  selectedTerrainBrush === 'deploy-p2'
                    ? 'ring-2 ring-yellow-400'
                    : 'hover:opacity-80'
                }`}
                style={{ backgroundColor: `${player2Color}40`, borderColor: player2Color }}
              >
                Player 2 Zone
              </button>
            </div>
          </div>

          <div 
            className="bg-slate-800 p-4 rounded-lg overflow-auto flex-1"
            style={{ cursor: 'crosshair' }}
            onMouseUp={() => setIsPainting(false)}
            onMouseLeave={() => setIsPainting(false)}
          >
            <svg 
              width={mapWidth * HEX_SIZE * Math.sqrt(3) + 150} 
              height={mapHeight * HEX_SIZE * 1.5 + 150}
              style={{ display: 'block' }}
            >
              {/* Define diagonal stripe patterns for deployment zones */}
              <defs>
                <pattern id="tp-p1-stripes" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="8" stroke={player1Color} strokeWidth="4" strokeOpacity="0.5" />
                </pattern>
                <pattern id="tp-p2-stripes" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(-45)">
                  <line x1="0" y1="0" x2="0" y2="8" stroke={player2Color} strokeWidth="4" strokeOpacity="0.5" />
                </pattern>
              </defs>
              {Array.from({ length: mapWidth }, (_, q) =>
                Array.from({ length: mapHeight }, (_, r) => {
                  const { x, y } = hexToPixel(q, r);
                  const terrain = getTerrainAt(q, r);
                  const key = `${q}-${r}`;
                  const isP1Deploy = player1DeploymentZone[key];
                  const isP2Deploy = player2DeploymentZone[key];
                  
                  return (
                    <g key={`${q}-${r}`}>
                      <polygon
                        points={getHexPath(x, y)}
                        fill={terrain ? terrain.color : '#1e293b'}
                        stroke="#334155"
                        strokeWidth="1"
                        style={{ cursor: 'pointer' }}
                        onMouseDown={(e) => {
                          if (e.button === 0) {
                            setIsPainting(true);
                            paintTerrain(q, r);
                          }
                        }}
                        onMouseEnter={() => {
                          if (isPainting) {
                            paintTerrain(q, r);
                          }
                        }}
                        onClick={() => paintTerrain(q, r)}
                      />
                      {/* Player 1 deployment zone overlay - diagonal stripes */}
                      {isP1Deploy && (
                        <polygon
                          points={getHexPath(x, y)}
                          fill="url(#tp-p1-stripes)"
                          stroke={player1Color}
                          strokeWidth="2"
                          style={{ pointerEvents: 'none' }}
                        />
                      )}
                      {/* Player 2 deployment zone overlay - diagonal stripes */}
                      {isP2Deploy && (
                        <polygon
                          points={getHexPath(x, y)}
                          fill="url(#tp-p2-stripes)"
                          stroke={player2Color}
                          strokeWidth="2"
                          style={{ pointerEvents: 'none' }}
                        />
                      )}
                      {terrain && !isP1Deploy && !isP2Deploy && (
                        <text
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="8"
                          fill="white"
                          fontWeight="bold"
                          style={{ pointerEvents: 'none' }}
                        >
                          {terrain.name.substring(0, 3).toUpperCase()}
                        </text>
                      )}
                      {(isP1Deploy || isP2Deploy) && (
                        <text
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="10"
                          fill="white"
                          fontWeight="bold"
                          style={{ pointerEvents: 'none' }}
                        >
                          {isP1Deploy ? 'P1' : 'P2'}
                        </text>
                      )}
                    </g>
                  );
                })
              )}
            </svg>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setGamePhase('setup')}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-lg font-semibold py-4 rounded-lg"
            >
              Back to Setup
            </button>
            <button
              onClick={() => {
                // Reset all terrain to Field (id: 1) and clear deployment zones
                const initialTerrain = {};
                for (let q = 0; q < mapWidth; q++) {
                  for (let r = 0; r < mapHeight; r++) {
                    initialTerrain[`${q}-${r}`] = 1;
                  }
                }
                setTerrainMap(initialTerrain);
                setPlayer1DeploymentZone({});
                setPlayer2DeploymentZone({});
                setSelectedTerrainBrush(terrainTypes.length > 0 ? terrainTypes[0].id : null);
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-lg font-semibold py-4 rounded-lg"
            >
              Reset All
            </button>
            <button
              onClick={proceedToUnitSetup}
              className="flex-1 bg-green-600 hover:bg-green-700 text-lg font-semibold py-4 rounded-lg flex items-center justify-center gap-2"
            >
              Continue to Order of Battle
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-4 text-sm text-slate-400">
            <p>Click or click-and-drag to paint terrain and deployment zones. Select a brush from the options above.</p>
          </div>
        </div>
      </div>
    );
  }

  if (gamePhase === 'player1-units' || gamePhase === 'player2-units') {
    const currentSetupPlayer = gamePhase === 'player1-units' ? 1 : 2;
    const currentUnits = currentSetupPlayer === 1 ? player1Units : player2Units;
    const currentColor = currentSetupPlayer === 1 ? player1Color : player2Color;
    const setCurrentColor = currentSetupPlayer === 1 ? setPlayer1Color : setPlayer2Color;

    return (
      <div className="w-full min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Player {currentSetupPlayer} - Order of Battle</h1>
            <button
              onClick={goToTitle}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded"
            >
              <Home className="w-5 h-5" />
              Title
            </button>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-lg mb-6">
            <div className="flex items-center gap-4">
              <label className="text-lg font-semibold">Army Color:</label>
              <input
                type="color"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                className="w-20 h-12 bg-slate-600 border border-slate-500 rounded cursor-pointer"
              />
              <div 
                className="w-12 h-12 rounded border-2 border-white"
                style={{ backgroundColor: currentColor }}
              />
              <span className="text-slate-400 text-sm">This color will be used for all your units</span>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Units</h2>
              <button
                onClick={() => addPlayerUnit(currentSetupPlayer)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                <Plus className="w-4 h-4" />
                Add Unit
              </button>
            </div>

            {currentUnits.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No units yet. Click "Add Unit" to create your first unit.</p>
            ) : (
              <div className="space-y-4">
                {currentUnits.map((unit) => {
                  const unitType = getUnitType(unit.typeId);
                  return (
                    <div key={unit.id} className="bg-slate-700 p-4 rounded-lg">
                      <div className="grid grid-cols-4 gap-3 items-end">
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">Unit Type</label>
                          <select
                            value={unit.typeId}
                            onChange={(e) => updatePlayerUnit(currentSetupPlayer, unit.id, 'typeId', parseInt(e.target.value))}
                            className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2"
                          >
                            {unitTypes.map(type => (
                              <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">Unit Name</label>
                          <input
                            type="text"
                            value={unit.name}
                            onChange={(e) => updatePlayerUnit(currentSetupPlayer, unit.id, 'name', e.target.value)}
                            className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">Strength</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={unit.strength}
                            onChange={(e) => updatePlayerUnit(currentSetupPlayer, unit.id, 'strength', parseInt(e.target.value) || 1)}
                            className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <button
                            onClick={() => removePlayerUnit(currentSetupPlayer, unit.id)}
                            className="w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded"
                          >
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      </div>
                      {unitType && (
                        <div className="mt-2 text-sm text-slate-400 flex items-center gap-4">
                          <span>Move: {unitType.move}</span>
                          <span>Vision: {unitType.vision}</span>
                          <span>Shape: {unitShapes[unitType.shape]?.name}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setGamePhase(currentSetupPlayer === 1 ? 'terrain-paint' : 'player1-units')}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-lg font-semibold py-4 rounded-lg"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (currentSetupPlayer === 1) {
                  setGamePhase('player2-units');
                } else {
                  startGame();
                }
              }}
              disabled={currentUnits.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-lg font-semibold py-4 rounded-lg flex items-center justify-center gap-2"
            >
              {currentSetupPlayer === 1 ? (
                <>Player 2 Setup <ArrowRight className="w-6 h-6" /></>
              ) : (
                <>Start Game <Play className="w-6 h-6" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Deployment Phase
  if (gamePhase === 'deployment') {
    const currentPlayerUnits = deploymentPlayer === 1 ? player1Units : player2Units;
    const currentDeployZone = deploymentPlayer === 1 ? player1DeploymentZone : player2DeploymentZone;
    const currentPlayerColor = deploymentPlayer === 1 ? player1Color : player2Color;
    const deployedForCurrentPlayer = deployedUnits.filter(u => u.player === deploymentPlayer);
    const undeployedUnits = currentPlayerUnits.filter(
      unit => !deployedForCurrentPlayer.some(d => d.id === unit.id)
    );
    const deploymentProgress = deployedForCurrentPlayer.length / currentPlayerUnits.length;

    return (
      <div className="w-full h-screen bg-slate-900 text-white p-4 flex">
        {/* Map Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">
                Deployment Phase - Player {deploymentPlayer}
              </h1>
              {/* Deployment Counter */}
              <div className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded">
                <div className="w-32 h-3 bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${deploymentProgress * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {deployedForCurrentPlayer.length}/{currentPlayerUnits.length} deployed
                </span>
              </div>
            </div>
            <button
              onClick={goToTitle}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded"
            >
              <Home className="w-5 h-5" />
              Title
            </button>
          </div>

          <div 
            className="bg-slate-800 p-4 rounded-lg overflow-auto flex-1"
          >
            <svg 
              width={mapWidth * HEX_SIZE * Math.sqrt(3) + 150} 
              height={mapHeight * HEX_SIZE * 1.5 + 150}
              style={{ display: 'block' }}
            >
              {/* Define diagonal stripe patterns for deployment zones */}
              <defs>
                <pattern id="p1-stripes" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="8" stroke={player1Color} strokeWidth="4" strokeOpacity="0.4" />
                </pattern>
                <pattern id="p2-stripes" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(-45)">
                  <line x1="0" y1="0" x2="0" y2="8" stroke={player2Color} strokeWidth="4" strokeOpacity="0.4" />
                </pattern>
              </defs>
              {Array.from({ length: mapWidth }, (_, q) =>
                Array.from({ length: mapHeight }, (_, r) => {
                  const { x, y } = hexToPixel(q, r);
                  const terrain = getTerrainAt(q, r);
                  const key = `${q}-${r}`;
                  const isP1Deploy = player1DeploymentZone[key];
                  const isP2Deploy = player2DeploymentZone[key];
                  const isCurrentPlayerZone = currentDeployZone[key];
                  const unitsAtHex = deployedUnits.filter(u => u.q === q && u.r === r);
                  const deployedUnit = unitsAtHex.length > 0 ? unitsAtHex[0] : null;
                  const stackCount = unitsAtHex.filter(u => u.player === deploymentPlayer).length;
                  
                  // Check if we can deploy here (respecting stacking rules)
                  let canDeployHere = false;
                  if (isCurrentPlayerZone && draggingUnit) {
                    if (unitsAtHex.length === 0) {
                      // Empty hex - can always deploy
                      canDeployHere = true;
                    } else if (stackingEnabled) {
                      // Stacking enabled - check if all units are friendly
                      const allFriendly = unitsAtHex.every(u => u.player === deploymentPlayer);
                      if (allFriendly) {
                        if (stackingLimitEnabled) {
                          // Check stack limit (exclude the dragging unit if it's being moved)
                          const otherUnits = unitsAtHex.filter(u => !(u.id === draggingUnit.id && u.player === draggingUnit.player));
                          canDeployHere = otherUnits.length < maxStackSize;
                        } else {
                          // No limit
                          canDeployHere = true;
                        }
                      }
                    }
                  }
                  
                  return (
                    <g key={`${q}-${r}`}>
                      {/* Base terrain */}
                      <polygon
                        points={getHexPath(x, y)}
                        fill={terrain ? terrain.color : '#1e293b'}
                        stroke="#334155"
                        strokeWidth="1"
                      />
                      {/* Player 1 deployment zone overlay - diagonal stripes */}
                      {isP1Deploy && (
                        <>
                          <polygon
                            points={getHexPath(x, y)}
                            fill="url(#p1-stripes)"
                            stroke={player1Color}
                            strokeWidth="2"
                          />
                        </>
                      )}
                      {/* Player 2 deployment zone overlay - diagonal stripes */}
                      {isP2Deploy && (
                        <>
                          <polygon
                            points={getHexPath(x, y)}
                            fill="url(#p2-stripes)"
                            stroke={player2Color}
                            strokeWidth="2"
                          />
                        </>
                      )}
                      {/* Stack counter for hexes with multiple units */}
                      {stackCount > 1 && isCurrentPlayerZone && (
                        <g>
                          <circle
                            cx={x + HEX_SIZE * 0.6}
                            cy={y - HEX_SIZE * 0.6}
                            r="10"
                            fill="#1e293b"
                            stroke={currentPlayerColor}
                            strokeWidth="2"
                          />
                          <text
                            x={x + HEX_SIZE * 0.6}
                            y={y - HEX_SIZE * 0.6}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="10"
                            fontWeight="bold"
                            fill="white"
                          >
                            {stackingLimitEnabled ? `${stackCount}/${maxStackSize}` : stackCount}
                          </text>
                        </g>
                      )}
                      {/* Highlight valid drop targets */}
                      {canDeployHere && (
                        <polygon
                          points={getHexPath(x, y)}
                          fill="#22c55e"
                          opacity="0.5"
                          stroke="#22c55e"
                          strokeWidth="3"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            if (draggingUnit) {
                              deployUnit(draggingUnit, q, r);
                              setDraggingUnit(null);
                            }
                          }}
                        />
                      )}
                      {/* Fog over enemy deployment zone */}
                      {((deploymentPlayer === 1 && isP2Deploy) || (deploymentPlayer === 2 && isP1Deploy)) && (
                        <polygon
                          points={getHexPath(x, y)}
                          fill="#000000"
                          opacity="0.5"
                          style={{ pointerEvents: 'none' }}
                        />
                      )}
                      {/* Zone labels - only show current player's zone label clearly */}
                      {isCurrentPlayerZone && !deployedUnit && !canDeployHere && (
                        <text
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="10"
                          fill="white"
                          opacity="0.5"
                          style={{ pointerEvents: 'none' }}
                        >
                          {deploymentPlayer === 1 ? 'P1' : 'P2'}
                        </text>
                      )}
                      {/* Question mark on fogged enemy zone */}
                      {((deploymentPlayer === 1 && isP2Deploy) || (deploymentPlayer === 2 && isP1Deploy)) && (
                        <text
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="16"
                          fill="#666"
                          style={{ pointerEvents: 'none' }}
                        >
                          ?
                        </text>
                      )}
                    </g>
                  );
                })
              )}
              
              {/* Render deployed units - only show current player's units */}
              {deployedUnits
                .filter(unit => unit.player === deploymentPlayer)
                .map(unit => {
                const { x, y } = hexToPixel(unit.q, unit.r);
                const unitType = getUnitType(unit.typeId);
                const unitColor = unit.player === 1 ? player1Color : player2Color;
                
                return (
                  <g 
                    key={`deployed-${unit.player}-${unit.id}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      // Click to pick up and move
                      undeployUnit(unit.id, unit.player);
                      setDraggingUnit({ ...unit, player: deploymentPlayer });
                    }}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={15}
                      fill={unitColor}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                    <text
                      x={x}
                      y={y - 25}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="white"
                    >
                      {unit.name}
                    </text>
                    <g>
                      {renderUnitShape(unitType?.shape || 'circle', x, y, 8)}
                    </g>
                    <text
                      x={x}
                      y={y + 20}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="white"
                    >
                      {unit.strength}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-4 text-sm text-slate-400">
            <p>Click a unit from your roster to select it, then click a hex in your deployment zone to place it. Click a deployed unit to pick it back up.</p>
          </div>
        </div>

        {/* Unit Roster Panel */}
        <div className="w-80 ml-4 flex flex-col">
          <div className="bg-slate-800 p-4 rounded-lg flex-1 overflow-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-full border-2 border-white"
                style={{ backgroundColor: currentPlayerColor }}
              />
              Player {deploymentPlayer} Units
            </h2>
            
            <div className="mb-4 text-sm text-slate-400">
              {deployedForCurrentPlayer.length} / {currentPlayerUnits.length} units deployed
            </div>

            {/* Dragging indicator */}
            {draggingUnit && (
              <div className="bg-green-900/50 border-2 border-green-500 rounded-lg p-3 mb-4">
                <p className="text-green-400 text-sm font-semibold">
                  Placing: {draggingUnit.name}
                </p>
                <p className="text-green-400/70 text-xs">
                  Click a hex in your deployment zone
                </p>
                <button
                  onClick={() => setDraggingUnit(null)}
                  className="mt-2 text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Undeployed units */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Available Units:</h3>
              {undeployedUnits.length === 0 ? (
                <p className="text-slate-500 text-sm">All units deployed!</p>
              ) : (
                undeployedUnits.map(unit => {
                  const unitType = getUnitType(unit.typeId);
                  const isSelected = draggingUnit?.id === unit.id;
                  return (
                    <div
                      key={unit.id}
                      onClick={() => setDraggingUnit({ ...unit, player: deploymentPlayer })}
                      className={`bg-slate-700 p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'ring-2 ring-green-500 bg-slate-600' 
                          : 'hover:bg-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center"
                          style={{ backgroundColor: currentPlayerColor }}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20">
                            {renderUnitShape(unitType?.shape || 'circle', 10, 10, 7)}
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold">{unit.name}</p>
                          <p className="text-xs text-slate-400">
                            {unitType?.name} | Str: {unit.strength}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Deployed units list */}
            {deployedForCurrentPlayer.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-400 mb-2">
                  ✓ Deployed:
                </h3>
                <div className="space-y-2">
                  {deployedForCurrentPlayer.map(unit => {
                    const unitType = getUnitType(unit.typeId);
                    return (
                      <div
                        key={unit.id}
                        className="bg-green-900/30 border border-green-700/50 p-2 rounded flex items-center gap-2"
                      >
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: currentPlayerColor }}
                        >
                          <svg width="14" height="14" viewBox="0 0 20 20">
                            {renderUnitShape(unitType?.shape || 'circle', 10, 10, 6)}
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{unit.name}</p>
                          <p className="text-xs text-slate-400">
                            Hex ({unit.q}, {unit.r})
                          </p>
                        </div>
                        <div className="text-green-500 text-lg">✓</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Deployment Button */}
          <button
            onClick={confirmDeployment}
            disabled={!areAllUnitsDeployed(deploymentPlayer)}
            className={`mt-4 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 ${
              areAllUnitsDeployed(deploymentPlayer)
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-slate-600 cursor-not-allowed'
            }`}
          >
            {deploymentPlayer === 1 ? (
              <>
                <span>✓</span>
                Confirm & Pass to Player 2
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Confirm & Start Game
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Check if it's the authenticated player's turn
  const isMyTurn = !authenticatedPlayer || authenticatedPlayer === currentPlayer;
  
  // Refresh game state from server
  const refreshGame = async () => {
    if (!gameCode) return;
    setIsLoading(true);
    try {
      const gameState = await loadGameByGameCode(gameCode);
      if (gameState) {
        applyGameState(gameState, authenticatedPlayer);
      }
    } catch (error) {
      console.error('Failed to refresh game:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full h-screen bg-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Pocket Generals</h1>
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded">
              <Users className="w-5 h-5" />
              <span>Player {currentPlayer}'s Turn</span>
              <div 
                className="w-6 h-6 rounded-full border-2 border-white ml-2"
                style={{ backgroundColor: currentPlayer === 1 ? player1Color : player2Color }}
              />
            </div>
            {gameMode === 'online-multiplayer' && authenticatedPlayer && (
              <div className={`px-3 py-1 rounded text-sm ${
                isMyTurn ? 'bg-green-600' : 'bg-amber-600'
              }`}>
                {isMyTurn ? 'Your Turn' : 'Waiting for opponent'}
              </div>
            )}
            {gameMode === 'local-hotseat' && (
              <div className="px-3 py-1 rounded text-sm bg-slate-700">
                Local Hotseat
              </div>
            )}
          </div>
          
          <div className="flex gap-2 items-center">
            {/* Zoom controls */}
            <div className="flex items-center gap-1 bg-slate-700 rounded px-2 py-1">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.25, prev - 0.25))}
                className="w-6 h-6 flex items-center justify-center hover:bg-slate-600 rounded text-lg"
                title="Zoom Out"
              >
                −
              </button>
              <span className="text-xs w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.25))}
                className="w-6 h-6 flex items-center justify-center hover:bg-slate-600 rounded text-lg"
                title="Zoom In"
              >
                +
              </button>
            </div>
            {gameMode === 'online-multiplayer' && authenticatedPlayer && !isMyTurn && (
              <button
                onClick={refreshGame}
                disabled={isLoading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-4 py-2 rounded"
              >
                <RotateCcw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            )}
            <button
              onClick={goToTitle}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded"
            >
              <Home className="w-5 h-5" />
              Title
            </button>
            {(gameMode === 'local-hotseat' || isMyTurn) && (
              <button
                onClick={endTurn}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-semibold"
              >
                End Turn
              </button>
            )}
          </div>
        </div>

        {gameMode === 'online-multiplayer' && gameCode && (
          <div className="mb-4 bg-slate-800 px-4 py-2 rounded flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              {gameName && <span className="text-slate-300">{gameName}</span>}
              <span className="text-slate-500">Game: {gameCode}</span>
              {authenticatedPlayer && (
                <span className="text-slate-500">
                  Playing as: Player {authenticatedPlayer}
                </span>
              )}
            </div>
          </div>
        )}

        {gameMode === 'local-hotseat' && gameName && (
          <div className="mb-4 bg-slate-800 px-4 py-2 rounded">
            <span className="text-slate-300">{gameName}</span>
          </div>
        )}

        <div className="mb-4 bg-slate-800 p-3 rounded">
          <div className="flex gap-6 text-sm flex-wrap">
            {unitTypes.map((type) => (
              <div key={type.id} className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 20 20">
                  {renderUnitShape(type.shape, 10, 10, 8)}
                </svg>
                <span>{type.name}: Move {type.move}, Vision {type.vision}{type.zoc > 0 ? `, ZOC ${type.zoc}` : ''}</span>
              </div>
            ))}
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="bg-slate-800 p-4 rounded-lg overflow-auto" 
          style={{ 
            maxHeight: 'calc(100vh - 250px)',
            cursor: isPanning ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          onContextMenu={handleContextMenu}
        >
          <svg 
            width={(mapWidth * HEX_SIZE * Math.sqrt(3) + 150) * zoomLevel} 
            height={(mapHeight * HEX_SIZE * 1.5 + 150) * zoomLevel}
            style={{ display: 'block' }}
          >
            <g transform={`scale(${zoomLevel})`}>
            {Array.from({ length: mapWidth }, (_, q) =>
              Array.from({ length: mapHeight }, (_, r) => {
                const { x, y } = hexToPixel(q, r);
                const visible = isHexVisible(q, r);
                const validMove = validMoves.find(m => m.q === q && m.r === r);
                const isValidMove = !!validMove;
                const isAttackMove = validMove?.isAttack;
                const terrain = getTerrainAt(q, r);
                const isHovered = hoveredHex && hoveredHex.q === q && hoveredHex.r === r;
                const isPending = pendingMove && pendingMove.q === q && pendingMove.r === r;
                const isRetreatHex = validRetreatHexes.some(h => h.q === q && h.r === r);
                
                return (
                  <g key={`${q}-${r}`}>
                    {/* Base terrain hex */}
                    <polygon
                      points={getHexPath(x, y)}
                      fill={terrain ? terrain.color : '#1e293b'}
                      stroke="#334155"
                      strokeWidth="1"
                      opacity={0.6}
                      onClick={() => {
                        // Close stack selection when clicking on empty hex
                        if (stackSelectionHex && !isPanning) {
                          setStackSelectionHex(null);
                        }
                      }}
                    />
                    {/* Valid move overlay */}
                    {isValidMove && !combatPhase && (
                      <polygon
                        points={getHexPath(x, y)}
                        fill={isPending ? '#fbbf24' : (isHovered ? (isAttackMove ? '#dc2626' : '#2563eb') : (isAttackMove ? '#991b1b' : '#1e40af'))}
                        stroke={isPending ? '#fbbf24' : (isAttackMove ? '#ef4444' : '#3b82f6')}
                        strokeWidth={isPending ? 3 : 2}
                        opacity={0.5}
                        style={{ cursor: 'pointer' }}
                        onClick={() => !isPanning && moveUnit(q, r)}
                        onMouseEnter={() => {
                          if (!isPanning) {
                            setHoveredHex({ q, r });
                            // Add this hex to the trail
                            setUserPathTrail(prev => {
                              // If trail is empty or this is adjacent to the last hex, add it
                              if (prev.length === 0) {
                                return [{ q, r }];
                              }
                              const lastHex = prev[prev.length - 1];
                              // Check if already in trail (backtracking)
                              const existingIndex = prev.findIndex(h => h.q === q && h.r === r);
                              if (existingIndex !== -1) {
                                // Backtracking - trim trail to this point
                                return prev.slice(0, existingIndex + 1);
                              }
                              // Add to trail
                              return [...prev, { q, r }];
                            });
                          }
                        }}
                        onMouseLeave={() => !isPanning && setHoveredHex(null)}
                      />
                    )}
                    {/* Retreat hex overlay */}
                    {isRetreatHex && combatPhase === 'retreat' && (
                      <polygon
                        points={getHexPath(x, y)}
                        fill="#eab308"
                        stroke="#fbbf24"
                        strokeWidth={3}
                        opacity={0.6}
                        style={{ cursor: 'pointer' }}
                        onClick={() => selectRetreatHex(q, r)}
                      />
                    )}
                    {/* Fog of war overlay */}
                    {!visible && fogEnabled && (
                      <polygon
                        points={getHexPath(x, y)}
                        fill="#000000"
                        opacity="0.4"
                        style={{ pointerEvents: 'none' }}
                      />
                    )}
                  </g>
                );
              })
            )}

            {hoveredPath && hoveredPath.path && (
              <>
                {hoveredPath.path.map((step, index) => {
                  // Get starting position from either selectedUnit or selectedStack
                  const startPos = selectedUnit 
                    ? { q: selectedUnit.q, r: selectedUnit.r }
                    : (selectedStack && selectedStack[0] ? { q: selectedStack[0].q, r: selectedStack[0].r } : null);
                  
                  if (!startPos) return null;
                  
                  const { x: x1, y: y1 } = hexToPixel(
                    index === 0 ? startPos.q : hoveredPath.path[index - 1].q,
                    index === 0 ? startPos.r : hoveredPath.path[index - 1].r
                  );
                  const { x: x2, y: y2 } = hexToPixel(step.q, step.r);
                  
                  const angle = Math.atan2(y2 - y1, x2 - x1);
                  const arrowSize = 8;
                  
                  return (
                    <g key={`path-${index}`}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#fbbf24"
                        strokeWidth="3"
                        style={{ pointerEvents: 'none' }}
                      />
                      <polygon
                        points={`${x2},${y2} ${x2 - arrowSize * Math.cos(angle - Math.PI / 6)},${y2 - arrowSize * Math.sin(angle - Math.PI / 6)} ${x2 - arrowSize * Math.cos(angle + Math.PI / 6)},${y2 - arrowSize * Math.sin(angle + Math.PI / 6)}`}
                        fill="#fbbf24"
                        style={{ pointerEvents: 'none' }}
                      />
                    </g>
                  );
                })}
                {hoveredPath.path.length > 0 && (
                  <g>
                    {(() => {
                      const lastStep = hoveredPath.path[hoveredPath.path.length - 1];
                      const { x, y } = hexToPixel(lastStep.q, lastStep.r);
                      
                      // Calculate remaining movement for single unit or stack
                      let remaining = 0;
                      if (selectedUnit) {
                        const unitType = getUnitType(selectedUnit.typeId);
                        remaining = unitType.move - hoveredPath.totalCost;
                      } else if (selectedStack && selectedStack.length > 0) {
                        const minMove = Math.min(...selectedStack.map(u => {
                          const ut = getUnitType(u.typeId);
                          return ut?.move || 0;
                        }));
                        remaining = minMove - hoveredPath.totalCost;
                      }
                      
                      return (
                        <>
                          <circle
                            cx={x}
                            cy={y - 35}
                            r="12"
                            fill="#1e293b"
                            stroke="#fbbf24"
                            strokeWidth="2"
                            style={{ pointerEvents: 'none' }}
                          />
                          <text
                            x={x}
                            y={y - 35}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="12"
                            fontWeight="bold"
                            fill="#fbbf24"
                            style={{ pointerEvents: 'none' }}
                          >
                            {remaining}
                          </text>
                        </>
                      );
                    })()}
                  </g>
                )}
              </>
            )}

            {pendingMove && pendingMove.path && (
              <>
                {pendingMove.path.map((step, index) => {
                  // Get starting position from selectedUnit, selectedStack, or pendingMove.stackUnits
                  const startPos = selectedUnit 
                    ? { q: selectedUnit.q, r: selectedUnit.r }
                    : (pendingMove.stackUnits && pendingMove.stackUnits[0] 
                      ? { q: pendingMove.stackUnits[0].q, r: pendingMove.stackUnits[0].r }
                      : (selectedStack && selectedStack[0] ? { q: selectedStack[0].q, r: selectedStack[0].r } : null));
                  
                  if (!startPos) return null;
                  
                  const { x: x1, y: y1 } = hexToPixel(
                    index === 0 ? startPos.q : pendingMove.path[index - 1].q,
                    index === 0 ? startPos.r : pendingMove.path[index - 1].r
                  );
                  const { x: x2, y: y2 } = hexToPixel(step.q, step.r);
                  
                  const angle = Math.atan2(y2 - y1, x2 - x1);
                  const arrowSize = 8;
                  
                  return (
                    <g key={`pending-${index}`}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#fbbf24"
                        strokeWidth="4"
                        style={{ pointerEvents: 'none' }}
                      />
                      <polygon
                        points={`${x2},${y2} ${x2 - arrowSize * Math.cos(angle - Math.PI / 6)},${y2 - arrowSize * Math.sin(angle - Math.PI / 6)} ${x2 - arrowSize * Math.cos(angle + Math.PI / 6)},${y2 - arrowSize * Math.sin(angle + Math.PI / 6)}`}
                        fill="#fbbf24"
                        style={{ pointerEvents: 'none' }}
                      />
                    </g>
                  );
                })}
              </>
            )}

            {/* Render units - group by hex for stacking */}
            {(() => {
              // Group units by hex
              const unitsByHex = {};
              units.forEach(unit => {
                const key = `${unit.q}-${unit.r}`;
                if (!unitsByHex[key]) unitsByHex[key] = [];
                unitsByHex[key].push(unit);
              });
              
              return Object.entries(unitsByHex).map(([hexKey, hexUnits]) => {
                const [q, r] = hexKey.split('-').map(Number);
                const { x, y } = hexToPixel(q, r);
                const visible = isHexVisible(q, r) || hexUnits.some(u => u.player === viewingPlayer);
                
                if (!visible) return null;
                
                // Filter to only show visible units
                const visibleUnits = hexUnits.filter(u => 
                  u.player === viewingPlayer || isHexVisible(u.q, u.r)
                );
                
                if (visibleUnits.length === 0) return null;
                
                const isStackedHex = visibleUnits.length > 1;
                const myUnitsAtHex = visibleUnits.filter(u => u.player === currentPlayer);
                const hasSelectableUnits = isMyTurn && myUnitsAtHex.some(u => !movedUnits.has(u.id));
                
                // If only one unit, render normally
                if (visibleUnits.length === 1) {
                  const unit = visibleUnits[0];
                  const unitType = getUnitType(unit.typeId);
                  const isSelected = selectedUnit?.id === unit.id;
                  const hasMoved = movedUnits.has(unit.id);
                  const unitColor = unit.player === 1 ? player1Color : player2Color;
                  const canSelect = isMyTurn && unit.player === currentPlayer && !hasMoved;
                  
                  return (
                    <g 
                      key={unit.id}
                      style={{ cursor: canSelect ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (canSelect && !isPanning) {
                          setSelectedUnit(isSelected ? null : unit);
                          setStackSelectionHex(null);
                          setUserPathTrail([]); // Clear trail when selecting/deselecting
                        }
                      }}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 18 : 15}
                        fill={unitColor}
                        stroke={isSelected ? '#fbbf24' : (hasMoved ? '#6b7280' : '#fff')}
                        strokeWidth={isSelected ? 3 : 2}
                        opacity={hasMoved ? 0.5 : 1}
                      />
                      <text
                        x={x}
                        y={y - 25}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="bold"
                        fill="white"
                      >
                        {unit.name}
                      </text>
                      <g>
                        {renderUnitShape(unitType.shape, x, y, 8)}
                      </g>
                      <text
                        x={x}
                        y={y + 20}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="bold"
                        fill="white"
                      >
                        {unit.strength}
                      </text>
                    </g>
                  );
                }
                
                // Multiple units - render stacked representation
                const topUnit = visibleUnits[0];
                const topUnitType = getUnitType(topUnit.typeId);
                const topUnitColor = topUnit.player === 1 ? player1Color : player2Color;
                const isSelected = visibleUnits.some(u => selectedUnit?.id === u.id);
                const isStackBubbleOpen = stackSelectionHex && stackSelectionHex.q === q && stackSelectionHex.r === r;
                
                return (
                  <g key={hexKey}>
                    {/* Stack indicator shadows */}
                    <circle cx={x + 4} cy={y + 4} r={15} fill="#000" opacity={0.3} />
                    <circle cx={x + 2} cy={y + 2} r={15} fill="#000" opacity={0.2} />
                    
                    {/* Top unit */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 18 : 15}
                      fill={topUnitColor}
                      stroke={isSelected ? '#fbbf24' : '#fff'}
                      strokeWidth={isSelected ? 3 : 2}
                      style={{ cursor: hasSelectableUnits ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (hasSelectableUnits && !isPanning) {
                          setStackSelectionHex(isStackBubbleOpen ? null : { q, r });
                          setSelectedUnit(null);
                        }
                      }}
                    />
                    <g>
                      {renderUnitShape(topUnitType.shape, x, y, 8)}
                    </g>
                    
                    {/* Stack count badge */}
                    <circle cx={x + 12} cy={y - 12} r={10} fill="#1e293b" stroke="#fff" strokeWidth={1} />
                    <text
                      x={x + 12}
                      y={y - 12}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="white"
                    >
                      {visibleUnits.length}
                    </text>
                  </g>
                );
              });
            })()}
            
            {/* Stack selection bubble */}
            {stackSelectionHex && (() => {
              const { x, y } = hexToPixel(stackSelectionHex.q, stackSelectionHex.r);
              const unitsAtHex = units.filter(u => 
                u.q === stackSelectionHex.q && 
                u.r === stackSelectionHex.r &&
                (u.player === viewingPlayer || isHexVisible(u.q, u.r))
              );
              
              // Get selectable units (current player's unmoved units)
              const selectableUnits = unitsAtHex.filter(u => 
                u.player === currentPlayer && !movedUnits.has(u.id)
              );
              const canMoveAll = isMyTurn && selectableUnits.length > 1;
              
              // Calculate minimum move for the stack
              const minStackMove = selectableUnits.length > 0 ? Math.min(...selectableUnits.map(u => {
                const unitType = getUnitType(u.typeId);
                return unitType?.move || 0;
              })) : 0;
              
              const bubbleWidth = 150;
              const moveAllHeight = canMoveAll ? 44 : 0;
              const bubbleHeight = unitsAtHex.length * 36 + 16 + moveAllHeight;
              const bubbleX = x + 30;
              const bubbleY = y - bubbleHeight / 2;
              
              return (
                <g>
                  {/* Pointer line */}
                  <line
                    x1={x + 15}
                    y1={y}
                    x2={bubbleX}
                    y2={y}
                    stroke="#fbbf24"
                    strokeWidth={2}
                  />
                  
                  {/* Bubble background */}
                  <rect
                    x={bubbleX}
                    y={bubbleY}
                    width={bubbleWidth}
                    height={bubbleHeight}
                    rx={8}
                    fill="#1e293b"
                    stroke="#fbbf24"
                    strokeWidth={2}
                  />
                  
                  {/* Move All button */}
                  {canMoveAll && (
                    <g
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedStack(selectableUnits);
                        setSelectedUnit(null);
                        setStackSelectionHex(null);
                      }}
                    >
                      <rect
                        x={bubbleX + 4}
                        y={bubbleY + 4}
                        width={bubbleWidth - 8}
                        height={36}
                        rx={4}
                        fill={selectedStack ? '#fbbf24' : '#065f46'}
                        stroke="#10b981"
                        strokeWidth={2}
                      />
                      <text
                        x={bubbleX + bubbleWidth / 2}
                        y={bubbleY + 22}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="12"
                        fontWeight="bold"
                        fill="white"
                      >
                        ⬆ Move All ({selectableUnits.length})
                      </text>
                      <text
                        x={bubbleX + bubbleWidth / 2}
                        y={bubbleY + 34}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="9"
                        fill="#a7f3d0"
                      >
                        Move: {minStackMove}
                      </text>
                    </g>
                  )}
                  
                  {/* Unit list */}
                  {unitsAtHex.map((unit, index) => {
                    const unitType = getUnitType(unit.typeId);
                    const unitColor = unit.player === 1 ? player1Color : player2Color;
                    const hasMoved = movedUnits.has(unit.id);
                    const canSelect = isMyTurn && unit.player === currentPlayer && !hasMoved;
                    const isSelected = selectedUnit?.id === unit.id;
                    const itemY = bubbleY + moveAllHeight + 8 + index * 36 + 18;
                    
                    return (
                      <g 
                        key={unit.id}
                        style={{ cursor: canSelect ? 'pointer' : 'default' }}
                        onClick={() => {
                          if (canSelect) {
                            setSelectedUnit(unit);
                            setSelectedStack(null);
                            setStackSelectionHex(null);
                          }
                        }}
                      >
                        <rect
                          x={bubbleX + 4}
                          y={itemY - 14}
                          width={bubbleWidth - 8}
                          height={32}
                          rx={4}
                          fill={isSelected ? '#fbbf24' : (canSelect ? '#334155' : '#1e293b')}
                          stroke={isSelected ? '#fbbf24' : 'transparent'}
                          strokeWidth={2}
                          opacity={hasMoved ? 0.5 : 1}
                        />
                        <circle
                          cx={bubbleX + 20}
                          cy={itemY}
                          r={10}
                          fill={unitColor}
                          opacity={hasMoved ? 0.5 : 1}
                        />
                        <g transform={`translate(${bubbleX + 20}, ${itemY})`}>
                          {renderUnitShape(unitType.shape, 0, 0, 6)}
                        </g>
                        <text
                          x={bubbleX + 36}
                          y={itemY}
                          dominantBaseline="middle"
                          fontSize="11"
                          fill={hasMoved ? '#6b7280' : 'white'}
                        >
                          {unit.name}
                        </text>
                        <text
                          x={bubbleX + bubbleWidth - 16}
                          y={itemY}
                          textAnchor="end"
                          dominantBaseline="middle"
                          fontSize="10"
                          fill={hasMoved ? '#6b7280' : '#94a3b8'}
                        >
                          {hasMoved ? 'moved' : `mv:${unitType?.move}`}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })()}
            </g>
          </svg>
        </div>

        <div className="mt-4 text-sm text-slate-400">
          <p>Click and drag to pan. Scroll wheel to zoom. Right-click to deselect. Click units to select, hover to see path, click to confirm.</p>
        </div>

        {pendingMove && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl border-2 border-slate-600">
              <h3 className="text-xl font-bold mb-4">
                {pendingMove.isAttack ? '⚔️ Confirm Attack' : (pendingMove.isStackMove ? '📦 Confirm Stack Move' : 'Confirm Move')}
              </h3>
              {pendingMove.isAttack ? (
                <>
                  <p className="text-slate-300 mb-2">
                    Attack {pendingMove.enemyUnit?.name} with {selectedUnit?.name}?
                  </p>
                  <p className="text-slate-400 mb-4">
                    Attacker Strength: {selectedUnit?.strength} | Defender Strength: {pendingMove.enemyUnit?.strength}
                  </p>
                </>
              ) : pendingMove.isStackMove ? (
                <>
                  <p className="text-slate-300 mb-2">
                    Move {pendingMove.stackUnits?.length} units to hex ({pendingMove.q}, {pendingMove.r})?
                  </p>
                  <div className="text-slate-400 mb-4 text-sm">
                    <p className="mb-1">Units moving:</p>
                    {pendingMove.stackUnits?.map(u => (
                      <span key={u.id} className="inline-block bg-slate-700 px-2 py-1 rounded mr-1 mb-1">
                        {u.name}
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-400 mb-6">
                    Movement cost: {pendingMove.cost}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-slate-300 mb-2">
                    Move {selectedUnit?.name} to hex ({pendingMove.q}, {pendingMove.r})?
                  </p>
                  <p className="text-slate-400 mb-6">
                    Movement cost: {pendingMove.cost} / {selectedUnit ? getUnitType(selectedUnit.typeId).move : 0}
                  </p>
                </>
              )}
              <div className="flex gap-4">
                <button
                  onClick={cancelMove}
                  className="flex-1 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <span className="text-2xl">✕</span>
                  Cancel
                </button>
                <button
                  onClick={confirmMove}
                  className={`flex-1 ${pendingMove.isAttack ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2`}
                >
                  <span className="text-2xl">{pendingMove.isAttack ? '⚔️' : '✓'}</span>
                  {pendingMove.isAttack ? 'Attack' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Combat Modal - Updated for multi-unit combat with SOG support */}
        {combatPhase === 'combat' && activeCombat && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl border-2 border-orange-500 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6 text-center text-orange-400">⚔️ Combat ⚔️</h3>
              
              {(() => {
                const attackerColor = activeCombat.attackers[0]?.player === 1 ? player1Color : player2Color;
                const defenderColor = activeCombat.defenders[0]?.player === 1 ? player1Color : player2Color;
                
                // Calculate total strengths - only include participating SOG units
                let totalAttackerStrength = activeCombat.attackers.reduce((sum, u) => sum + u.strength, 0);
                let totalDefenderStrength = activeCombat.defenders.reduce((sum, u) => sum + u.strength, 0);
                
                const attackersByDist = activeCombat.attackersByDistance || {};
                const defendersByDist = activeCombat.defendersByDistance || {};
                
                // Only add SOG units that are participating
                Object.values(attackersByDist).forEach(unitList => {
                  unitList.forEach(u => {
                    if (sogParticipation[u.id]) {
                      totalAttackerStrength += u.strength;
                    }
                  });
                });
                Object.values(defendersByDist).forEach(unitList => {
                  unitList.forEach(u => {
                    if (sogParticipation[u.id]) {
                      totalDefenderStrength += u.strength;
                    }
                  });
                });
                
                // Get sorted distance keys
                const attackerDistances = Object.keys(attackersByDist).sort((a, b) => parseInt(a) - parseInt(b));
                const defenderDistances = Object.keys(defendersByDist).sort((a, b) => parseInt(a) - parseInt(b));
                
                // Helper to render primary unit list (no checkboxes)
                const renderPrimaryUnitList = (unitList, color) => (
                  <div className="space-y-1">
                    {unitList.map(unit => {
                      const unitType = getUnitType(unit.typeId);
                      return (
                        <div key={unit.id} className="flex items-center gap-2 bg-slate-600 p-1.5 rounded">
                          <div 
                            className="w-6 h-6 rounded-full border border-white flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: color }}
                          >
                            <svg width="12" height="12" viewBox="0 0 20 20">
                              {renderUnitShape(unitType?.shape, 10, 10, 5)}
                            </svg>
                          </div>
                          <span className="font-medium text-sm flex-1 truncate">{unit.name}</span>
                          <span className="font-bold text-sm">{unit.strength}</span>
                        </div>
                      );
                    })}
                  </div>
                );
                
                // Helper to render SOG unit list with participation checkboxes
                const renderSOGUnitList = (unitList, color) => (
                  <div className="space-y-1">
                    {unitList.map(unit => {
                      const unitType = getUnitType(unit.typeId);
                      const isParticipating = sogParticipation[unit.id] || false;
                      return (
                        <div 
                          key={unit.id} 
                          className={`flex items-center gap-2 p-1.5 rounded transition-colors ${
                            isParticipating ? 'bg-slate-600' : 'bg-slate-600/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isParticipating}
                            onChange={(e) => setSogParticipation({
                              ...sogParticipation,
                              [unit.id]: e.target.checked
                            })}
                            className="w-4 h-4 rounded border-slate-400 bg-slate-500 text-amber-500 focus:ring-amber-500 cursor-pointer"
                            title="Move to the sound of the guns?"
                          />
                          <div 
                            className={`w-6 h-6 rounded-full border border-white flex items-center justify-center flex-shrink-0 ${
                              isParticipating ? '' : 'opacity-50'
                            }`}
                            style={{ backgroundColor: color }}
                          >
                            <svg width="12" height="12" viewBox="0 0 20 20">
                              {renderUnitShape(unitType?.shape, 10, 10, 5)}
                            </svg>
                          </div>
                          <span className={`font-medium text-sm flex-1 truncate ${isParticipating ? '' : 'opacity-50'}`}>
                            {unit.name}
                          </span>
                          <span className={`font-bold text-sm ${isParticipating ? '' : 'opacity-50'}`}>
                            {unit.strength}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
                
                return (
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Attackers Column */}
                    <div className="bg-slate-700 p-4 rounded-lg" style={{ borderWidth: '2px', borderStyle: 'solid', borderColor: attackerColor }}>
                      <h4 className="text-lg font-bold mb-3 text-center" style={{ color: attackerColor }}>
                        ATTACKERS
                      </h4>
                      
                      {/* Primary attackers (at combat hex) */}
                      <div className="mb-3">
                        <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">In Combat Hex</p>
                        {renderPrimaryUnitList(activeCombat.attackers, attackerColor)}
                      </div>
                      
                      {/* SOG attackers by distance */}
                      {attackerDistances.map(dist => (
                        <div key={dist} className="mb-3">
                          <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">
                            {dist} Hex{parseInt(dist) > 1 ? 'es' : ''} Away
                          </p>
                          {renderSOGUnitList(attackersByDist[dist], attackerColor)}
                        </div>
                      ))}
                      
                      <div className="border-t border-slate-500 pt-2 mt-3">
                        <p className="text-center text-xl font-bold">Total: {totalAttackerStrength}</p>
                      </div>
                    </div>
                    
                    {/* Defenders Column */}
                    <div className="bg-slate-700 p-4 rounded-lg" style={{ borderWidth: '2px', borderStyle: 'solid', borderColor: defenderColor }}>
                      <h4 className="text-lg font-bold mb-3 text-center" style={{ color: defenderColor }}>
                        DEFENDERS
                      </h4>
                      
                      {/* Primary defenders (at combat hex) */}
                      <div className="mb-3">
                        <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">In Combat Hex</p>
                        {renderPrimaryUnitList(activeCombat.defenders, defenderColor)}
                      </div>
                      
                      {/* SOG defenders by distance */}
                      {defenderDistances.map(dist => (
                        <div key={dist} className="mb-3">
                          <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">
                            {dist} Hex{parseInt(dist) > 1 ? 'es' : ''} Away
                          </p>
                          {renderSOGUnitList(defendersByDist[dist], defenderColor)}
                        </div>
                      ))}
                      
                      <div className="border-t border-slate-500 pt-2 mt-3">
                        <p className="text-center text-xl font-bold">Total: {totalDefenderStrength}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              {(Object.keys(activeCombat.attackersByDistance || {}).length > 0 || 
                Object.keys(activeCombat.defendersByDistance || {}).length > 0) && (
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 mb-4">
                  <p className="text-slate-300 text-sm text-center">
                    ☐ Check nearby units to have them <strong>move to the sound of the guns</strong> and join combat.
                    <br />
                    <span className="text-slate-400 text-xs">Participating units will move to the combat hex and be subject to retreat if they lose.</span>
                  </p>
                </div>
              )}
              
              <div className="bg-amber-900/30 border border-amber-500 rounded-lg p-4 mb-6">
                <p className="text-amber-200 text-sm text-center">
                  Resolve this combat using your tabletop rules, then click "Resolve Combat" to record the results.
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={openResolveCombat}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg font-semibold"
                >
                  Resolve Combat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Combat Resolution Modal */}
        {combatPhase === 'resolve' && activeCombat && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl border-2 border-orange-500 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6 text-center text-orange-400">Combat Resolution</h3>
              
              {(() => {
                const attackerColor = activeCombat.attackers[0]?.player === 1 ? player1Color : player2Color;
                const defenderColor = activeCombat.defenders[0]?.player === 1 ? player1Color : player2Color;
                
                const attackersByDist = activeCombat.attackersByDistance || {};
                const defendersByDist = activeCombat.defendersByDistance || {};
                const attackerDistances = Object.keys(attackersByDist).sort((a, b) => parseInt(a) - parseInt(b));
                const defenderDistances = Object.keys(defendersByDist).sort((a, b) => parseInt(a) - parseInt(b));
                
                // Filter to only participating SOG units
                const participatingAttackersByDist = {};
                attackerDistances.forEach(dist => {
                  const participating = attackersByDist[dist].filter(u => sogParticipation[u.id]);
                  if (participating.length > 0) {
                    participatingAttackersByDist[dist] = participating;
                  }
                });
                const participatingDefendersByDist = {};
                defenderDistances.forEach(dist => {
                  const participating = defendersByDist[dist].filter(u => sogParticipation[u.id]);
                  if (participating.length > 0) {
                    participatingDefendersByDist[dist] = participating;
                  }
                });
                
                const participatingAttackerDistances = Object.keys(participatingAttackersByDist).sort((a, b) => parseInt(a) - parseInt(b));
                const participatingDefenderDistances = Object.keys(participatingDefendersByDist).sort((a, b) => parseInt(a) - parseInt(b));
                
                // Helper to render unit with strength input
                const renderUnitInput = (unit, color) => {
                  const unitType = getUnitType(unit.typeId);
                  return (
                    <div key={unit.id} className="bg-slate-600 p-2 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-5 h-5 rounded-full border border-white flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          <svg width="10" height="10" viewBox="0 0 20 20">
                            {renderUnitShape(unitType?.shape, 10, 10, 4)}
                          </svg>
                        </div>
                        <span className="font-semibold text-xs flex-1 truncate">{unit.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Was: {unit.strength}</span>
                        <input
                          type="number"
                          min="0"
                          value={combatStrengths[unit.id] ?? unit.strength}
                          onChange={(e) => setCombatStrengths({
                            ...combatStrengths,
                            [unit.id]: Math.max(0, parseInt(e.target.value) || 0)
                          })}
                          className="w-14 h-7 text-sm font-bold text-center bg-slate-500 border border-slate-400 rounded"
                        />
                      </div>
                    </div>
                  );
                };
                
                return (
                  <>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      {/* Attacker Strength Adjustments */}
                      <div className="bg-slate-700 p-4 rounded-lg" style={{ borderWidth: '2px', borderStyle: 'solid', borderColor: attackerColor }}>
                        <h4 className="text-lg font-bold mb-3 text-center" style={{ color: attackerColor }}>
                          ATTACKERS
                        </h4>
                        <div className="space-y-3 max-h-72 overflow-y-auto">
                          {/* Primary attackers */}
                          <div>
                            <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">In Combat Hex</p>
                            <div className="space-y-2">
                              {activeCombat.attackers.map(unit => renderUnitInput(unit, attackerColor))}
                            </div>
                          </div>
                          
                          {/* Participating SOG attackers */}
                          {participatingAttackerDistances.map(dist => (
                            <div key={dist}>
                              <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">
                                {dist} Hex{parseInt(dist) > 1 ? 'es' : ''} Away (Joining)
                              </p>
                              <div className="space-y-2">
                                {participatingAttackersByDist[dist].map(unit => renderUnitInput(unit, attackerColor))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Defender Strength Adjustments */}
                      <div className="bg-slate-700 p-4 rounded-lg" style={{ borderWidth: '2px', borderStyle: 'solid', borderColor: defenderColor }}>
                        <h4 className="text-lg font-bold mb-3 text-center" style={{ color: defenderColor }}>
                          DEFENDERS
                        </h4>
                        <div className="space-y-3 max-h-72 overflow-y-auto">
                          {/* Primary defenders */}
                          <div>
                            <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">In Combat Hex</p>
                            <div className="space-y-2">
                              {activeCombat.defenders.map(unit => renderUnitInput(unit, defenderColor))}
                            </div>
                          </div>
                          
                          {/* Participating SOG defenders */}
                          {participatingDefenderDistances.map(dist => (
                            <div key={dist}>
                              <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">
                                {dist} Hex{parseInt(dist) > 1 ? 'es' : ''} Away (Joining)
                              </p>
                              <div className="space-y-2">
                                {participatingDefendersByDist[dist].map(unit => renderUnitInput(unit, defenderColor))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-center text-slate-300 mb-4">Select the winner:</p>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={() => resolveCombat('attacker')}
                        className="flex-1 px-6 py-3 rounded-lg font-semibold hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: attackerColor }}
                      >
                        Attacker Wins
                      </button>
                      <button
                        onClick={() => resolveCombat('defender')}
                        className="flex-1 px-6 py-3 rounded-lg font-semibold hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: defenderColor }}
                      >
                        Defender Wins
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Retreat Selection Panel - Shows all retreating units */}
        {combatPhase === 'retreat' && retreatingUnits.length > 0 && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-slate-800 p-4 rounded-lg shadow-xl border-2 border-amber-500 max-w-lg w-full">
              <h3 className="text-xl font-bold mb-3 text-center text-amber-400">
                Retreat Required ({retreatingUnits.length} unit{retreatingUnits.length > 1 ? 's' : ''})
              </h3>
              
              <p className="text-sm text-slate-400 text-center mb-3">
                Select a unit, then click a yellow hex on the map to retreat it.
              </p>
              
              <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
                {retreatingUnits.map(unit => {
                  const unitType = getUnitType(unit.typeId);
                  const unitColor = unit.player === 1 ? player1Color : player2Color;
                  const isSelected = selectedRetreatUnit?.id === unit.id;
                  const canRetreat = getValidRetreatHexes(unit, retreatPositions).length > 0;
                  
                  return (
                    <div 
                      key={unit.id}
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-amber-600 ring-2 ring-amber-400' 
                          : canRetreat 
                            ? 'bg-slate-700 hover:bg-slate-600' 
                            : 'bg-slate-700 opacity-60'
                      }`}
                      onClick={() => canRetreat && selectUnitForRetreat(unit)}
                    >
                      <div 
                        className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: unitColor }}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20">
                          {renderUnitShape(unitType?.shape, 10, 10, 7)}
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{unit.name}</p>
                        <p className="text-xs text-slate-400">
                          Strength: {unit.strength}
                        </p>
                      </div>
                      <div className="text-right">
                        {canRetreat ? (
                          <span className={`text-sm ${isSelected ? 'text-white' : 'text-green-400'}`}>
                            {isSelected ? 'Select hex ▶' : 'Can retreat'}
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              eliminateRetreatUnit(unit);
                            }}
                            className="text-sm bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                          >
                            Eliminate
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {selectedRetreatUnit && validRetreatHexes.length > 0 && (
                <p className="text-sm text-amber-300 text-center">
                  Click a yellow highlighted hex on the map to retreat {selectedRetreatUnit.name}
                </p>
              )}
            </div>
          </div>
        )}

        {turnTransitionPending && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-lg shadow-xl border-2 border-amber-500 max-w-md text-center">
              <div className="mb-6">
                <div 
                  className="w-16 h-16 rounded-full border-4 border-white mx-auto mb-4"
                  style={{ backgroundColor: nextPlayerNum === 1 ? player1Color : player2Color }}
                />
                <h3 className="text-2xl font-bold mb-2">Turn Complete!</h3>
                <p className="text-xl text-amber-400 font-semibold">
                  Player {nextPlayerNum}'s Turn
                </p>
              </div>
              
              <div className="bg-amber-900/30 border border-amber-500 rounded-lg p-4 mb-6">
                <p className="text-amber-200">
                  <strong>Please pass the device to Player {nextPlayerNum}.</strong>
                </p>
                <p className="text-amber-200/70 text-sm mt-2">
                  Player {nextPlayerNum} should press Continue when ready. This will reveal their unit positions and hide the previous player's hidden units.
                </p>
              </div>
              
              <button
                onClick={continueToNextPlayer}
                className="w-full bg-green-600 hover:bg-green-700 px-6 py-4 rounded-lg font-semibold text-lg"
              >
                Continue as Player {nextPlayerNum}
              </button>
            </div>
          </div>
        )}

        {/* Move Interrupted Modal */}
        {moveInterrupted && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl border-2 border-yellow-500 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold mb-4 text-center text-yellow-400">⚠️ Move Interrupted!</h3>
              
              <div className="bg-slate-700 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-center mb-3">
                  <div 
                    className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center"
                    style={{ backgroundColor: moveInterrupted.unit.player === 1 ? player1Color : player2Color }}
                  >
                    <svg width="24" height="24" viewBox="0 0 20 20">
                      {renderUnitShape(getUnitType(moveInterrupted.unit.typeId)?.shape, 10, 10, 8)}
                    </svg>
                  </div>
                </div>
                <p className="text-center font-semibold">{moveInterrupted.unit.name}</p>
              </div>
              
              <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-4 mb-6">
                {moveInterrupted.reason === 'enemy' ? (
                  <p className="text-yellow-200 text-center">
                    Your unit encountered a hidden enemy unit and was forced to halt!
                  </p>
                ) : (
                  <p className="text-yellow-200 text-center">
                    Your unit entered an enemy's Zone of Control and was forced to halt!
                  </p>
                )}
                <p className="text-yellow-200/70 text-sm text-center mt-2">
                  Unit stopped at hex ({moveInterrupted.finalHex.q}, {moveInterrupted.finalHex.r})
                </p>
              </div>
              
              <button
                onClick={acknowledgeMoveInterruption}
                className="w-full bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg font-semibold"
              >
                Acknowledge
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HexWargame;