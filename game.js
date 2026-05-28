(function () {
  const pl = window.planck;
  const Vec2 = pl.Vec2;

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const resetButton = document.getElementById("resetButton");
  const playButton = document.getElementById("playButton");
  const appShell = document.querySelector(".app-shell");
  const gameStage = document.querySelector(".game-stage");
  const sidePanel = document.querySelector(".side-panel");
  const topStrip = document.querySelector(".top-strip");
  const homeHud = document.getElementById("homeHud");
  const homeCoinsValue = document.getElementById("homeCoinsValue");
  const homePopup = document.getElementById("homePopup");
  const homePopupTitle = document.getElementById("homePopupTitle");
  const homePopupSubtitle = document.getElementById("homePopupSubtitle");
  const homePopupList = document.getElementById("homePopupList");
  const homePopupClose = document.getElementById("homePopupClose");
  const scoreValue = document.getElementById("scoreValue");
  const multiplierValue = document.getElementById("multiplierValue");
  const sumValue = document.getElementById("sumValue");
  const depthValue = document.getElementById("depthValue");
  const speedValue = document.getElementById("speedValue");
  const remainingValue = document.getElementById("remainingValue");
  const timeValue = document.getElementById("timeValue");
  const stateValue = document.getElementById("stateValue");
  const statusNote = document.getElementById("statusNote");

  const VIEW_W = 414;
  const VIEW_H = 896;
  const SCALE = 50;
  const WORLD_W = VIEW_W / SCALE;
  const VIEW_H_METERS = VIEW_H / SCALE;
  const HALF_W = WORLD_W * 0.5;
  const WALL_MARGIN = 0.22;
  const LEFT_WALL = WALL_MARGIN;
  const RIGHT_WALL = WORLD_W - WALL_MARGIN;
  const LEVEL_TOP = 200;
  const LEVEL_BOTTOM = 0;
  const START_CAMERA_Y = LEVEL_TOP - VIEW_H_METERS * 0.32;
  let ANCHOR = Vec2(HALF_W, LEVEL_TOP);
  const MAX_STRETCH = 2.35;
  const DRAG_RADIUS = 0.5;
  const TIME_STEP = 1 / 60;
  const VELOCITY_ITERS = 8;
  const POSITION_ITERS = 3;
  const GRAVITY = -12.8;
  const MUSHROOM_GREEN_BOOST = 12.5;
  const MUSHROOM_RED_BOOST = 23;
  const MAX_LAUNCH_SPEED = 96;
  const WALL_RESTITUTION = 0.8;
  const TRAIL_LIMIT = 14;
  const LOOP_MEMORY = 8;
  const OBJECT_SCALE = 0.5;
  const PROJECTILE_RADIUS = 0.14;
  const COIN_RADIUS = 0.09;
  const COIN_PICKUP_RADIUS = 0.17;
  const DIAMOND_PICKUP_RADIUS = 0.19;
  const COIN_RESPAWN_TIME = 5;
  const BONUS_COIN_MIN_Y = 18;
  const BONUS_COIN_MAX_Y = 158;
  const BONUS_COIN_MIN_DISTANCE = 0.34;
  const PLATFORM_HALF_HEIGHT = 0.08;
  const MUSHROOM_COOLDOWN = 0.22;
  const CLOUD_COOLDOWN = 0.2;
  const DROP_START_SPEED = 9.4;
  const RUNIC_STONE_SPEED = 1.45;
  const CLOUD_SPEED = 1.1;
  const LOOP_SAMPLE_INTERVAL = 0.24;
  const BRANCH_PLATFORM_CLEARANCE_Y = 4.4;
  const BRANCH_MUSHROOM_CLEARANCE_Y = 3.7;
  const BRANCH_BRANCH_CLEARANCE_Y = 9.5;
  const MUSHROOM_MIN_WORLD_GAP = 1.05;
  const PLATFORM_WALK_VISUAL_SPEED = 5.4;
  const PLATFORM_WALK_VISUAL_DISTANCE = 0.42;
  const PLATFORM_WALL_CLEARANCE = 0.72;
  const WALL_STUCK_SPEED = 2.4;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const world = new pl.World(Vec2(0, GRAVITY));

  const sprites = loadSprites({
    bottom: "./files/bottom.png",
    balloon1: "./files/baloon_01.png",
    balloon2: "./files/baloon_02.png",
    balloon3: "./files/baloon_03.png",
    balloon4: "./files/baloon_04.png",
    coin: "./files/coin_01.png",
    branch1: "./files/branch_01.png",
    branch2: "./files/branch_02.png",
    branch3: "./files/branch_03.png",
    branch4: "./files/branch_04.png",
    cloud1: "./files/cloud_01.png",
    cloud2: "./files/cloud_02.png",
    cloud3: "./files/cloud_03.png",
    cloud5: "./files/cloud_05.png",
    cloud6: "./files/cloud_06.png",
    cloudBg: "./files/cloud_bg.png",
    heroStanding: "./files/hero_standing.png",
    heroFly1: "./files/hero_fly_01.png",
    heroFly2: "./files/hero_fly_02.png",
    heroFly3: "./files/hero_fly_03.png",
    heroFly4: "./files/hero_fly_04.png",
    platform1: "./files/platform_01.png",
    platform2: "./files/platform_02.png",
    platform3: "./files/platform_03.png",
    shroomGreen1: "./files/shroom_green_01.png",
    shroomGreen2: "./files/shroom_green_02.png",
    shroomGreen3: "./files/shroom_green_03.png",
    shroomGreen4: "./files/shroom_green_04.png",
    shroomRed1: "./files/shroom_red_01.png",
    skyBg: "./files/sky_bg.png?v=sky-bg-3600-1",
    splashScreen: "./files/splash_screen.png?v=splash-intro-1",
    runicStone1: "./files/runic_stone_01.png",
    runicStone2: "./files/runic_stone_02.png",
    runicStone3: "./files/runic_stone_03.png",
    runicStone4: "./files/runic_stone_04.png",
    runicStone5: "./files/runic_stone_05.png",
  });

  const palette = {
    skyTop: "#142a63",
    skyBottom: "#76b8ff",
    wallFace: "rgba(58, 126, 210, 0.62)",
    wallShade: "rgba(18, 75, 148, 0.72)",
    wallHighlight: "rgba(196, 232, 255, 0.78)",
    platformTop: "#ffe38c",
    platformFace: "#f6c954",
    platformShade: "#cd9730",
    boosterTop: "#8ff08e",
    boosterFace: "#54d66b",
    boosterShade: "#2f9447",
    gate: "#59e36e",
    gateGlow: "rgba(89, 227, 110, 0.2)",
    gateArrow: "#eaffef",
    projectile: "#ff7f7f",
    projectileGlow: "rgba(255, 127, 127, 0.28)",
    slingshot: "#7a5237",
    path: "rgba(117, 82, 55, 0.22)",
    text: "#dce8ff",
    muted: "#93a8d8",
    tunnelGlow: "rgba(255, 255, 255, 0.16)",
    grid: "rgba(255, 255, 255, 0.16)",
    boosterPulse: "rgba(255, 163, 133, 0.18)",
    coin: "#ffd64f",
    coinEdge: "#f4a700",
    coinSpark: "#fff9d5",
    hud: "#0c1430",
    hudBorder: "#3855a8",
    hudShadow: "rgba(0, 0, 0, 0.3)",
    cloud: "rgba(255, 255, 255, 0.72)",
    grass: "#88d15c",
    grassShade: "#4ca544",
  };

  const levelSegments = [
    { x: 6.83, y: 194.0, w: 5.0, angle: 0.18, sprite: "platform1" },
    { x: 1.45, y: 187.0, w: 4.9, angle: -0.2, sprite: "platform2" },
    { x: 6.79, y: 180.0, w: 5.15, angle: 0.24, sprite: "platform3" },
    { x: 1.41, y: 173.0, w: 4.8, angle: -0.18, sprite: "platform1" },
    { x: 6.83, y: 165.0, w: 5.0, angle: 0.18, sprite: "platform1" },
    { x: 1.45, y: 158.0, w: 4.9, angle: -0.2, sprite: "platform2" },
    { x: 6.79, y: 151.0, w: 5.15, angle: 0.24, sprite: "platform3" },
    { x: 1.41, y: 144.0, w: 4.8, angle: -0.18, sprite: "platform1" },
    { x: 6.83, y: 136.0, w: 5.0, angle: 0.18, sprite: "platform2" },
    { x: 1.45, y: 129.0, w: 4.9, angle: -0.22, sprite: "platform3" },
    { x: 6.79, y: 122.0, w: 5.15, angle: 0.19, sprite: "platform1" },
    { x: 1.41, y: 115.0, w: 4.8, angle: -0.21, sprite: "platform2" },
    { x: 6.83, y: 107.0, w: 5.0, angle: 0.23, sprite: "platform3" },
    { x: 1.45, y: 100.0, w: 4.9, angle: -0.19, sprite: "platform1" },
    { x: 6.79, y: 93.0, w: 5.15, angle: 0.2, sprite: "platform2" },
    { x: 1.41, y: 86.0, w: 4.8, angle: -0.24, sprite: "platform3" },
    { x: 6.83, y: 78.0, w: 5.0, angle: 0.18, sprite: "platform1" },
    { x: 1.45, y: 71.0, w: 4.9, angle: -0.2, sprite: "platform2" },
    { x: 6.79, y: 64.0, w: 5.15, angle: 0.24, sprite: "platform3" },
    { x: 1.41, y: 57.0, w: 4.8, angle: -0.18, sprite: "platform1" },
    { x: 6.83, y: 49.0, w: 5.0, angle: 0.19, sprite: "platform2" },
    { x: 1.45, y: 42.0, w: 4.9, angle: -0.23, sprite: "platform3" },
    { x: 6.79, y: 35.0, w: 5.15, angle: 0.22, sprite: "platform1" },
    { x: 1.41, y: 28.0, w: 4.8, angle: -0.2, sprite: "platform2" },
    { x: 6.83, y: 20.0, w: 5.0, angle: 0.19, sprite: "platform3" },
    { x: 1.45, y: 13.0, w: 4.9, angle: -0.22, sprite: "platform1" },
    { x: 6.82, y: 175.5, w: 4.9, angle: 0.2, sprite: "platform2" },
    { x: 1.42, y: 159.5, w: 4.75, angle: -0.19, sprite: "platform1" },
    { x: 6.81, y: 117.5, w: 4.95, angle: 0.18, sprite: "platform3" },
    { x: 1.44, y: 95.5, w: 4.8, angle: -0.18, sprite: "platform2" },
    { x: 6.82, y: 53.5, w: 4.9, angle: 0.2, sprite: "platform1" },
    { x: 1.42, y: 31.5, w: 4.75, angle: -0.18, sprite: "platform3" },
  ];
  const mushroomSpawns = [
    { platform: 0, offset: -0.42, kind: "green", sprite: "shroomGreen1", drawHeight: 38 },
    { platform: 1, offset: 0.28, kind: "green", sprite: "shroomGreen2", drawHeight: 52 },
    { platform: 2, offset: -0.2, kind: "red", sprite: "shroomRed1", drawHeight: 34 },
    { platform: 3, offset: 0.36, kind: "green", sprite: "shroomGreen3", drawHeight: 58 },
    { platform: 4, offset: -0.38, kind: "green", sprite: "shroomGreen4", drawHeight: 34 },
    { platform: 5, offset: 0.26, kind: "red", sprite: "shroomRed1", drawHeight: 34 },
    { platform: 6, offset: -0.34, kind: "green", sprite: "shroomGreen1", drawHeight: 38 },
    { platform: 7, offset: 0.34, kind: "green", sprite: "shroomGreen2", drawHeight: 52 },
    { platform: 8, offset: -0.28, kind: "red", sprite: "shroomRed1", drawHeight: 34 },
    { platform: 9, offset: 0.2, kind: "green", sprite: "shroomGreen3", drawHeight: 58 },
    { platform: 10, offset: -0.3, kind: "green", sprite: "shroomGreen4", drawHeight: 34 },
    { platform: 11, offset: 0.32, kind: "red", sprite: "shroomRed1", drawHeight: 34 },
    { platform: 12, offset: -0.36, kind: "green", sprite: "shroomGreen1", drawHeight: 38 },
    { platform: 13, offset: 0.24, kind: "green", sprite: "shroomGreen2", drawHeight: 52 },
    { platform: 14, offset: -0.22, kind: "red", sprite: "shroomRed1", drawHeight: 34 },
    { platform: 15, offset: 0.34, kind: "green", sprite: "shroomGreen3", drawHeight: 58 },
    { platform: 16, offset: -0.36, kind: "green", sprite: "shroomGreen4", drawHeight: 34 },
    { platform: 17, offset: 0.24, kind: "green", sprite: "shroomGreen1", drawHeight: 38 },
    { platform: 18, offset: -0.22, kind: "red", sprite: "shroomRed1", drawHeight: 34 },
    { platform: 19, offset: 0.34, kind: "green", sprite: "shroomGreen2", drawHeight: 52 },
  ];
  const runicStoneSpawns = [
    { x: 2.0, y: 187.0, sprite: "runicStone1", phase: 0, drawHeight: 40 },
    { x: 6.2, y: 169.0, sprite: "runicStone2", phase: 1, drawHeight: 46 },
    { x: 2.0, y: 147.0, sprite: "runicStone1", phase: 0, drawHeight: 40 },
    { x: 6.2, y: 131.0, sprite: "runicStone2", phase: 1, drawHeight: 46 },
    { x: 2.5, y: 113.0, sprite: "runicStone3", phase: 0, drawHeight: 44 },
    { x: 5.8, y: 94.0, sprite: "runicStone4", phase: 1, drawHeight: 46 },
    { x: 2.2, y: 76.0, sprite: "runicStone5", phase: 0, drawHeight: 60 },
    { x: 6.0, y: 58.0, sprite: "runicStone1", phase: 1, drawHeight: 40 },
    { x: 2.4, y: 40.0, sprite: "runicStone3", phase: 0, drawHeight: 44 },
    { x: 5.9, y: 22.0, sprite: "runicStone5", phase: 1, drawHeight: 60 },
    { x: 5.9, y: 178.0, sprite: "runicStone4", phase: 1, drawHeight: 46 },
    { x: 2.2, y: 121.0, sprite: "runicStone3", phase: 0, drawHeight: 44 },
    { x: 5.8, y: 84.0, sprite: "runicStone2", phase: 1, drawHeight: 46 },
    { x: 2.3, y: 48.0, sprite: "runicStone1", phase: 0, drawHeight: 40 },
  ];
  const cloudSpawns = [
    { x: 5.8, y: 188.6, sprite: "cloud1", phase: 1, width: 72, height: 42 },
    { x: 2.2, y: 176.0, sprite: "cloud2", phase: 0, width: 66, height: 38 },
    { x: 6.0, y: 156.0, sprite: "cloud3", phase: 1, width: 74, height: 44 },
    { x: 2.0, y: 138.0, sprite: "cloud5", phase: 0, width: 62, height: 36 },
    { x: 5.9, y: 118.0, sprite: "cloud6", phase: 1, width: 68, height: 40 },
    { x: 2.1, y: 96.0, sprite: "cloud1", phase: 0, width: 72, height: 42 },
    { x: 6.0, y: 74.0, sprite: "cloud3", phase: 1, width: 74, height: 44 },
    { x: 2.2, y: 52.0, sprite: "cloud2", phase: 0, width: 66, height: 38 },
    { x: 5.8, y: 30.0, sprite: "cloud6", phase: 1, width: 68, height: 40 },
    { x: 2.5, y: 16.0, sprite: "cloud5", phase: 0, width: 62, height: 36 },
    { x: 6.1, y: 144.0, sprite: "cloud1", phase: 1, width: 72, height: 42 },
    { x: 2.3, y: 66.0, sprite: "cloud6", phase: 0, width: 68, height: 40 },
    { x: 5.75, y: 96.0, sprite: "cloud2", phase: 1, width: 66, height: 38 },
  ];
  const balloonSpawns = [
    { x: 2.15, baseY: 176.0, sprite: "balloon1", drawHeight: 94, phase: 0.0 },
    { x: 6.05, baseY: 132.0, sprite: "balloon2", drawHeight: 99, phase: 1.2 },
    { x: 2.35, baseY: 88.0, sprite: "balloon3", drawHeight: 91, phase: 2.4 },
    { x: 5.85, baseY: 44.0, sprite: "balloon4", drawHeight: 96, phase: 3.6 },
    { x: 3.0, baseY: 154.0, sprite: "balloon2", drawHeight: 95, phase: 0.8 },
    { x: 5.15, baseY: 66.0, sprite: "balloon3", drawHeight: 92, phase: 2.0 },
    { x: 2.1, baseY: 120.0, sprite: "balloon1", drawHeight: 94, phase: 1.5 },
    { x: 6.0, baseY: 108.0, sprite: "balloon4", drawHeight: 95, phase: 2.7 },
    { x: 2.55, baseY: 54.0, sprite: "balloon2", drawHeight: 93, phase: 3.1 },
    { x: 5.45, baseY: 22.0, sprite: "balloon3", drawHeight: 90, phase: 4.2 },
  ];
  const branchSpawns = [
    { x: RIGHT_WALL + 0.08, y: 162.0, sprite: "branch1", side: "right", drawHeight: 154, sensorOffsetX: -1.02, sensorOffsetY: 0.15, sensorW: 1.22, sensorH: 1.0 },
    { x: LEFT_WALL - 0.08, y: 126.0, sprite: "branch2", side: "left", drawHeight: 164, sensorOffsetX: 1.04, sensorOffsetY: 0.13, sensorW: 1.26, sensorH: 1.05 },
    { x: LEFT_WALL - 0.08, y: 74.0, sprite: "branch3", side: "left", drawHeight: 172, sensorOffsetX: 1.08, sensorOffsetY: 0.1, sensorW: 1.34, sensorH: 1.1 },
    { x: RIGHT_WALL + 0.08, y: 36.0, sprite: "branch4", side: "right", drawHeight: 159, sensorOffsetX: -1.06, sensorOffsetY: 0.1, sensorW: 1.28, sensorH: 1.04 },
  ];
  const coinSpawns = [
    { x: 3.2, y: 194.0 }, { x: 3.9, y: 193.0 }, { x: 4.6, y: 192.0 }, { x: 5.3, y: 191.0 },
    { x: 5.1, y: 186.0 }, { x: 4.4, y: 185.0 }, { x: 3.7, y: 184.0 }, { x: 3.0, y: 183.0 },
    { x: 3.1, y: 177.0 }, { x: 3.8, y: 176.0 }, { x: 4.5, y: 175.0 }, { x: 5.2, y: 174.0 },
    { x: 5.0, y: 168.0 }, { x: 4.3, y: 167.0 }, { x: 3.6, y: 166.0 }, { x: 2.9, y: 165.0 },
    { x: 3.2, y: 154.0 }, { x: 3.9, y: 153.0 }, { x: 4.6, y: 152.0 }, { x: 5.3, y: 151.0 },
    { x: 5.1, y: 146.0 }, { x: 4.4, y: 145.0 }, { x: 3.7, y: 144.0 }, { x: 3.0, y: 143.0 },
    { x: 3.1, y: 137.0 }, { x: 3.8, y: 136.0 }, { x: 4.5, y: 135.0 }, { x: 5.2, y: 134.0 },
    { x: 5.0, y: 128.0 }, { x: 4.3, y: 127.0 }, { x: 3.6, y: 126.0 }, { x: 2.9, y: 125.0 },
    { x: 3.0, y: 119.0 }, { x: 3.7, y: 118.0 }, { x: 4.4, y: 117.0 }, { x: 5.1, y: 116.0 },
    { x: 5.0, y: 110.0 }, { x: 4.3, y: 109.0 }, { x: 3.6, y: 108.0 }, { x: 2.9, y: 107.0 },
    { x: 3.1, y: 101.0 }, { x: 3.8, y: 100.0 }, { x: 4.5, y: 99.0 }, { x: 5.2, y: 98.0 },
    { x: 5.0, y: 92.0 }, { x: 4.3, y: 91.0 }, { x: 3.6, y: 90.0 }, { x: 2.9, y: 89.0 },
    { x: 3.0, y: 83.0 }, { x: 3.7, y: 82.0 }, { x: 4.4, y: 81.0 }, { x: 5.1, y: 80.0 },
    { x: 5.0, y: 74.0 }, { x: 4.3, y: 73.0 }, { x: 3.6, y: 72.0 }, { x: 2.9, y: 71.0 },
    { x: 3.1, y: 65.0 }, { x: 3.8, y: 64.0 }, { x: 4.5, y: 63.0 }, { x: 5.2, y: 62.0 },
    { x: 5.0, y: 56.0 }, { x: 4.3, y: 55.0 }, { x: 3.6, y: 54.0 }, { x: 2.9, y: 53.0 },
    { x: 3.0, y: 47.0 }, { x: 3.7, y: 46.0 }, { x: 4.4, y: 45.0 }, { x: 5.1, y: 44.0 },
    { x: 5.0, y: 38.0 }, { x: 4.3, y: 37.0 }, { x: 3.6, y: 36.0 }, { x: 2.9, y: 35.0 },
    { x: 3.1, y: 29.0 }, { x: 3.8, y: 28.0 }, { x: 4.5, y: 27.0 }, { x: 5.2, y: 26.0 },
    { x: 5.0, y: 20.0 }, { x: 4.3, y: 19.0 }, { x: 3.6, y: 18.0 }, { x: 2.9, y: 17.0 },
  ];
  const diamondSpawns = [
    { x: 2.8, y: 182.8 }, { x: 5.5, y: 171.0 }, { x: 3.35, y: 149.2 }, { x: 5.6, y: 139.0 },
    { x: 2.75, y: 111.5 }, { x: 5.35, y: 101.0 }, { x: 3.2, y: 79.3 }, { x: 5.55, y: 68.0 },
    { x: 2.85, y: 43.5 }, { x: 5.45, y: 24.5 },
  ];
  const coinClusterPlatforms = [20, 21, 22, 23, 24, 25, 26, 27];
  const baseLayout = JSON.parse(JSON.stringify({
    levelSegments,
    mushroomSpawns,
    runicStoneSpawns,
    cloudSpawns,
    balloonSpawns,
    branchSpawns,
    coinSpawns,
    diamondSpawns,
  }));
  function createUpgradeLevels(count, baseCost, growth, describe) {
    return Array.from({ length: count }, (_, index) => ({
      cost: roundIdleCost(baseCost * Math.pow(growth, index)),
      ...describe(index),
    }));
  }

  function roundIdleCost(value) {
    if (value < 100) {
      return Math.ceil(value / 5) * 5;
    }
    if (value < 1000) {
      return Math.ceil(value / 25) * 25;
    }
    if (value < 10000) {
      return Math.ceil(value / 250) * 250;
    }
    return Math.ceil(value / 1000) * 1000;
  }

  function formatMultiplier(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  const upgradeCatalog = {
    balloon: {
      title: "Balloon Harbor",
      subtitle: "Balony daja dluzszy lot i mocniejsze odbicia.",
      tracks: {
        flotilla: {
          name: "Balloon Flotilla",
          description: "Dodaje wiecej balonow na plansze.",
          levels: createUpgradeLevels(10, 140, 1.62, (level) => ({
            current: `${level} additional balloons`,
            next: "+1 balloon",
          })),
        },
        speed: {
          name: "Balloon Speed",
          description: "Zwieksza sile odbicia od balonow.",
          levels: createUpgradeLevels(8, 320, 2.05, (level) => ({
            current: `Balloon bounce x${formatMultiplier(1 + level * 0.35)}`,
            next: `x${formatMultiplier(1 + (level + 1) * 0.35)} balloon bounce`,
          })),
        },
      },
    },
    stone: {
      title: "Stone Circle",
      subtitle: "Runiczne kamienie tworza ruchome odbicia.",
      tracks: {
        travelers: {
          name: "Stone Travelers",
          description: "Dodaje wiecej kamieni na plansze.",
          levels: createUpgradeLevels(12, 160, 1.65, (level) => ({
            current: `${level} traveling stones`,
            next: "+1 runic stone",
          })),
        },
        speed: {
          name: "Stone Speed",
          description: "Zwieksza sile odbicia od kamieni.",
          levels: createUpgradeLevels(8, 380, 2.1, (level) => ({
            current: `Stone bounce x${formatMultiplier(1 + level * 0.3)}`,
            next: `x${formatMultiplier(1 + (level + 1) * 0.3)} stone bounce`,
          })),
        },
      },
    },
    cloud: {
      title: "Cloud Factory",
      subtitle: "Chmury buduja mnoznik wyniku.",
      tracks: {
        number: {
          name: "Cloud Number",
          description: "Dodaje chmurki na plansze.",
          levels: createUpgradeLevels(10, 120, 1.58, (level) => ({
            current: `${level} additional clouds`,
            next: "+1 cloud",
          })),
        },
        intensity: {
          name: "Cloud Intensity",
          description: "Zwieksza mnoznik dawany przez kazda chmure.",
          levels: createUpgradeLevels(7, 1000, 2.85, (level) => ({
            current: `Cloud Multiplier x${Math.max(1, level + 1)}`,
            next: `x${level + 2} cloud multiplier`,
          })),
        },
      },
    },
    shroom: {
      title: "Shroom Circle",
      subtitle: "Grzybki mocniej wybijaja i karmia portfel.",
      tracks: {
        elasticity: {
          name: "Shroom Elasticity",
          description: "Zwieksza sile odbicia od grzybkow.",
          levels: createUpgradeLevels(9, 240, 1.85, (level) => ({
            current: `Shroom bounce x${formatMultiplier(1 + level * 0.22)}`,
            next: `x${formatMultiplier(1 + (level + 1) * 0.22)} shroom bounce`,
          })),
        },
        nuggets: {
          name: "Shroom Nuggets",
          description: "Kazde odbicie od grzybka daje wiecej monet.",
          levels: createUpgradeLevels(8, 500, 2.25, (level) => ({
            current: `+${level + 1} coin per green shroom bounce`,
            next: `+${level + 2} coin per green shroom bounce`,
          })),
        },
      },
    },
    gold: {
      title: "Gold Smith",
      subtitle: "Monety pojawiaja sie czesciej i rosna w wartosci.",
      tracks: {
        number: {
          name: "Gold Number",
          description: "Dodaje 5 monet na plansze za kazdy level.",
          levels: createUpgradeLevels(14, 80, 1.55, (level) => ({
            current: `${level * 5} additional coins`,
            next: "+5 coins",
          })),
        },
        value: {
          name: "Gold Value",
          description: "Kazdy level podwaja wartosc zwyklej monety.",
          levels: createUpgradeLevels(8, 900, 2.75, (level) => ({
            current: `Coin Value x${Math.pow(2, level)}`,
            next: `x${Math.pow(2, level + 1)} coin value`,
          })),
        },
      },
    },
    crystal: {
      title: "Cristal Extractor",
      subtitle: "Krysztaly sa rzadkie, ale szybko robia duze liczby.",
      tracks: {
        spawner: {
          name: "Cristal Spawner",
          description: "Dodaje 1 krysztal na plansze za kazdy level.",
          levels: createUpgradeLevels(8, 350, 2.0, (level) => ({
            current: `${level} additional crystals`,
            next: "+1 crystal",
          })),
        },
        value: {
          name: "Cristal Value",
          description: "Kazdy level zwieksza wartosc krysztalow o 10.",
          levels: createUpgradeLevels(10, 1400, 2.65, (level) => ({
            current: `Crystal Value ${10 + level * 10}`,
            next: `+${10} crystal value`,
          })),
        },
      },
    },
  };
  const HOME_CLOUD_BG_WIDTH = VIEW_W * 1.1;
  const HOME_CLOUD_BG_CENTER_X = VIEW_W * 0.5;
  const HOME_CLOUD_BG_CENTER_Y = VIEW_H * 0.49;
  const HOME_LABEL_Y_RATIO = 0.62;
  const HOME_INTRO_SPLASH_HOLD = 0.65;
  const HOME_INTRO_FADE_DURATION = 0.95;
  const HOME_INTRO_CLOUD_SLIDE_DURATION = 0.95;
  const HOME_INTRO_UI_DURATION = 0.45;
  const HOME_INTRO_TOTAL = HOME_INTRO_SPLASH_HOLD + HOME_INTRO_FADE_DURATION + HOME_INTRO_CLOUD_SLIDE_DURATION + HOME_INTRO_UI_DURATION;
  const homeBuildings = [
    {
      id: "balloon",
      label: "Balloon Harbor",
      x: 105,
      y: 245,
      enterZone: { x: 127.09934853420197, y: 258.0769936269783, rx: 50, ry: 50 },
      clickZone: { x: 92.03745928338762, y: 231.10617783317264, rx: 78, ry: 72 },
    },
    {
      id: "stone",
      label: "Stone Circle",
      x: 305,
      y: 235,
      enterZone: { x: 309.1514657980456, y: 247.28866730945606, rx: 50, ry: 50 },
      clickZone: { x: 307.8029315960912, y: 244.5915857300755, rx: 60, ry: 60 },
    },
    {
      id: "cloud",
      label: "Cloud Factory",
      x: 90,
      y: 430,
      enterZone: { x: 94.7345276872964, y: 382.8170166733297, rx: 60, ry: 60 },
      clickZone: { x: 92, y: 383, rx: 72, ry: 66 },
    },
    {
      id: "shroom",
      label: "Shroom Circle",
      x: 305,
      y: 460,
      enterZone: { x: 321.9625407166124, y: 365.9602568022012, rx: 60, ry: 60 },
      clickZone: { x: 325.3338762214984, y: 372.70296075065255, rx: 70, ry: 64 },
    },
    {
      id: "gold",
      label: "Gold Smith",
      x: 92,
      y: 676,
      enterZone: { x: 90.01465798045604, y: 557.4530900924206, rx: 60, ry: 60 },
      clickZone: { x: 77.87785016286645, y: 545.3161818310091, rx: 60, ry: 60 },
    },
    {
      id: "crystal",
      label: "Cristal Extractor",
      x: 323,
      y: 686,
      enterZone: { x: 317.9169381107492, y: 541.2705594619382, rx: 60, ry: 60 },
      clickZone: { x: 321.9625407166124, y: 535.8763963031771, rx: 60, ry: 60 },
    },
  ];
  const homeHeroSprites = loadSprites({
    standing: "./files/hero/hero_standing.png",
    walk1: "./files/hero/hero_walk_01.png",
    walk2: "./files/hero/hero_walk_02.png",
    walk3: "./files/hero/hero_walk_03.png",
    walk4: "./files/hero/hero_walk_04.png",
    walk5: "./files/hero/hero_walk_05.png",
    walk6: "./files/hero/hero_walk_06.png",
    walk7: "./files/hero/hero_walk_07.png",
  });

  let projectile = null;
  let projectileFixture = null;
  let dragPointerId = null;
  let dragWorld = null;
  let launched = false;
  let lastTime = 0;
  let accumulator = 0;
  let cameraY = START_CAMERA_Y;
  let boosterFlash = 0;
  let boostCooldown = 0;
  let trail = [];
  let lastLaunchVector = Vec2(0, 0);
  let survivalTime = 0;
  let contactSerial = 0;
  let recentBounceSignatures = [];
  let pendingLoopNudge = null;
  let score = 0;
  let multiplier = 1;
  let walletCoins = 0;
  let activeHomeBuildingId = null;
  let roundPayoutClaimed = false;
  let roundAwaitingReturn = false;
  let upgrades = createDefaultUpgrades();
  let floatingTexts = [];
  let coinBodies = [];
  let pendingCoinBodies = [];
  let roundEnded = false;
  let levelBodies = [];
  let mushroomBodies = [];
  let runicStoneBodies = [];
  let cloudBodies = [];
  let branchBodies = [];
  let balloonBodies = [];
  let mushroomCooldowns = new Map();
  let cloudCooldowns = new Map();
  let branchCooldowns = new Map();
  let branchShakeStates = new Map();
  let branchLeaves = [];
  let startCloudId = null;
  let startCloudGraceActive = false;
  let loopSampleTimer = 0;
  let recentFlightStates = new Map();
  let heroFlightFrame = 0;
  let roundEndAnimation = null;
  let screenMode = "home";
  let homeIntroElapsed = 0;
  let homeCharacterX = 206;
  let homeCharacterY = 610;
  let homeCharacterFacing = 1;
  let homeCharacterSpeedX = 0;
  let homeCharacterSpeedY = 0;
  let homeWalkFrame = 0;
  let homeWalkTimer = 0;
  let homePointerActive = false;
  let homePointerTarget = null;
  let homeMoveX = 0;
  let homeMoveY = 0;
  const HOME_WALK_POLYGON = [
    { x: 233.63355048859935, y: 241.2202337558498 },
    { x: 181.71498371335502, y: 247.28866730945606 },
    { x: 133.1677935969946, y: 226.3863056463561 },
    { x: 75.18078175895765, y: 268.1910495496555 },
    { x: 83.27198697068404, y: 312.6928956094349 },
    { x: 23.262214983713353, y: 372.0287315100063 },
    { x: 15.84527687296417, y: 451.5925969475343 },
    { x: 103.5, y: 497.442983797004 },
    { x: 28.656392945528804, y: 538.5734778825577 },
    { x: 19.21661237785016, y: 597.2350022340852 },
    { x: 180.36649066539852, y: 655.2222973449663 },
    { x: 228.23941368078178, y: 625.5543588175811 },
    { x: 176.99515516051252, y: 576.3326199938857 },
    { x: 175.64657980456028, y: 554.0817381181948 },
    { x: 226.21661237785017, y: 551.3846153846155 },
    { x: 253.18729641693812, y: 594.5379618089034 },
    { x: 361.07003257328995, y: 612.7432213155233 },
    { x: 400.8518738389403, y: 547.3390341697434 },
    { x: 341.51628664495115, y: 480.58622392587546 },
    { x: 403.5488599348534, y: 425.2960515485737 },
    { x: 388.0407166123778, y: 328.2011558450721 },
    { x: 348.93322475570034, y: 301.9045692919126 },
    { x: 388.714983713355, y: 268.1910495496555 },
    { x: 363.09283387622145, y: 204.13536203936692 },
    { x: 291.6205211726384, y: 195.36984690638008 },
    { x: 252.51302931596092, y: 219.64360169790467 },
    { x: 252.51302931596092, y: 219.64360169790467 },
  ];
  const HOME_WALK_BOUNDS = {
    left: 34,
    right: VIEW_W - 34,
    top: 170,
    bottom: VIEW_H - 102,
  };
  const HOME_HERO = {
    height: 54,
    moveSpeed: 160,
  };

  randomizeLayout();
  buildBounds();
  buildLevel();
  buildMushrooms();
  buildRunicStones();
  buildClouds();
  buildBranches();
  buildBalloons();
  buildCoins();
  createProjectile();
  bindInput();
  updateScreenModeUi();

  world.on("begin-contact", (contact) => {
    const fixtureA = contact.getFixtureA();
    const fixtureB = contact.getFixtureB();
    const dataA = fixtureA.getUserData() || {};
    const dataB = fixtureB.getUserData() || {};

    const projectileHitMushroom =
      (dataA.type === "projectile" && dataB.type === "mushroom") ||
      (dataB.type === "projectile" && dataA.type === "mushroom");
    const projectileHitCoin =
      (dataA.type === "projectile" && dataB.type === "coin") ||
      (dataB.type === "projectile" && dataA.type === "coin");
    const projectileHitDiamond =
      (dataA.type === "projectile" && dataB.type === "diamond") ||
      (dataB.type === "projectile" && dataA.type === "diamond");
    const projectileHitRunicStone =
      (dataA.type === "projectile" && dataB.type === "runicStone") ||
      (dataB.type === "projectile" && dataA.type === "runicStone");
    const projectileHitCloud =
      (dataA.type === "projectile" && dataB.type === "cloud") ||
      (dataB.type === "projectile" && dataA.type === "cloud");
    const projectileHitBranch =
      (dataA.type === "projectile" && dataB.type === "branch") ||
      (dataB.type === "projectile" && dataA.type === "branch");
    const projectileHitBalloon =
      (dataA.type === "projectile" && dataB.type === "balloon") ||
      (dataB.type === "projectile" && dataA.type === "balloon");
    const projectileHitFloor =
      (dataA.type === "projectile" && dataB.type === "floor") ||
      (dataB.type === "projectile" && dataA.type === "floor");
    const surfaceData = dataA.type === "projectile" ? dataB : dataA.type ? dataA : null;

    if (projectileHitCoin || projectileHitDiamond) {
      const coinFixture =
        dataA.type === "coin" || dataA.type === "diamond" ? fixtureA : fixtureB;
      queueCoinCollection(coinFixture.getBody());
      return;
    }

    if (projectileHitCloud && launched && !roundEnded) {
      const cloudFixture = dataA.type === "cloud" ? fixtureA : fixtureB;
      triggerCloudDrag(cloudFixture.getBody());
      return;
    }

    if (projectileHitBranch && launched && !roundEnded) {
      const branchFixture = dataA.type === "branch" ? fixtureA : fixtureB;
      triggerBranchDrag(branchFixture.getBody());
      return;
    }

    if (projectileHitBalloon && launched && !roundEnded) {
      const balloonFixture = dataA.type === "balloon" ? fixtureA : fixtureB;
      triggerBalloonBounce(balloonFixture.getBody());
      registerBounce(surfaceData);
      return;
    }

    if (projectileHitMushroom && launched && !roundEnded) {
      const mushroomFixture = dataA.type === "mushroom" ? fixtureA : fixtureB;
      triggerMushroomBoost(mushroomFixture.getBody());
      registerBounce(surfaceData);
      return;
    }

    if (projectileHitRunicStone && launched && !roundEnded) {
      const stoneFixture = dataA.type === "runicStone" ? fixtureA : fixtureB;
      triggerRunicStoneBounce(stoneFixture.getBody());
      registerBounce(surfaceData);
      return;
    }

    if (projectileHitFloor && launched && !roundEnded) {
      endRoundOnFloorHit();
      return;
    }

    if (launched && surfaceData && surfaceData.type !== "projectile") {
      registerBounce(surfaceData);
    }
  });

  world.on("pre-solve", (contact) => {
    const fixtureA = contact.getFixtureA();
    const fixtureB = contact.getFixtureB();
    const dataA = fixtureA.getUserData() || {};
    const dataB = fixtureB.getUserData() || {};

    const projectileHitMushroom =
      (dataA.type === "projectile" && dataB.type === "mushroom") ||
      (dataB.type === "projectile" && dataA.type === "mushroom");

    if (projectileHitMushroom) {
      contact.setEnabled(false);
    }
  });

  resetButton.addEventListener("click", resetProjectile);
  if (playButton) {
    playButton.addEventListener("click", onHomePrimaryButtonClick);
  }
  if (homePopupClose) {
    homePopupClose.addEventListener("click", closeHomePopup);
  }
  if (homePopup) {
    homePopup.addEventListener("click", (event) => {
      if (event.target === homePopup) {
        closeHomePopup();
      }
    });
  }
  requestAnimationFrame(frame);

  function buildBounds() {
    const bounds = world.createBody();
    bounds.createFixture(pl.Edge(Vec2(LEFT_WALL, LEVEL_BOTTOM), Vec2(LEFT_WALL, LEVEL_TOP + 0.5)), {
      restitution: WALL_RESTITUTION,
      friction: 0.02,
      userData: { type: "wall", id: "wall-left" },
    });
    bounds.createFixture(pl.Edge(Vec2(RIGHT_WALL, LEVEL_BOTTOM), Vec2(RIGHT_WALL, LEVEL_TOP + 0.5)), {
      restitution: WALL_RESTITUTION,
      friction: 0.02,
      userData: { type: "wall", id: "wall-right" },
    });
    bounds.createFixture(pl.Edge(Vec2(LEFT_WALL, 0), Vec2(RIGHT_WALL, 0)), {
      restitution: 0.16,
      friction: 0.3,
      userData: { type: "floor", id: "floor-base" },
    });
    bounds.createFixture(pl.Edge(Vec2(LEFT_WALL, LEVEL_TOP + 0.25), Vec2(RIGHT_WALL, LEVEL_TOP + 0.25)), {
      restitution: 0.1,
      friction: 0,
      userData: { type: "ceiling", id: "ceiling-top" },
    });
  }

  function buildLevel() {
    levelSegments.forEach((segment, index) => {
      const body = world.createBody({
        position: Vec2(segment.x, segment.y),
        angle: segment.angle,
      });

      body.createFixture(pl.Box(segment.w * 0.25, PLATFORM_HALF_HEIGHT), {
        density: 1,
        friction: 0.24,
        restitution: 0.54,
        userData: {
          type: "platform",
          id: `platform-${index}`,
          width: segment.w,
          sprite: segment.sprite,
        },
      });

      levelBodies.push(body);
    });
  }

  function buildMushrooms() {
    const gameplayConfig = getGameplayConfig();
    mushroomSpawns.forEach((mushroom, index) => {
      const platform = levelSegments[mushroom.platform];
      const point = platformSurfacePoint(platform, mushroom.offset * OBJECT_SCALE, 0.38);
      const isRed = mushroom.kind === "red";
      const body = world.createBody({
        position: Vec2(point.x, point.y),
        angle: platform.angle,
      });

      body.createFixture(pl.Box(0.29, 0.17), {
        isSensor: true,
        userData: {
          type: "mushroom",
          id: `mushroom-${index}`,
          kind: mushroom.kind,
          sprite: mushroom.sprite,
          drawHeight: mushroom.drawHeight,
          power: (isRed ? MUSHROOM_RED_BOOST : MUSHROOM_GREEN_BOOST) * gameplayConfig.shroomMultiplier,
          reward: gameplayConfig.shroomReward * (isRed ? 2 : 1),
          width: 0.58,
          height: 0.41,
        },
      });

      mushroomBodies.push(body);
    });
  }

  function buildRunicStones() {
    const gameplayConfig = getGameplayConfig();
    runicStoneSpawns.slice(0, gameplayConfig.stoneCount).forEach((stone, index) => {
      const body = world.createKinematicBody({
        position: Vec2(stone.x, stone.y),
        linearVelocity: Vec2(stone.phase ? -RUNIC_STONE_SPEED : RUNIC_STONE_SPEED, 0),
      });

      body.createFixture(pl.Box(0.28, 0.28), {
        density: 1,
        friction: 0.05,
        restitution: 0.78,
        userData: {
          type: "runicStone",
          id: `runic-stone-${index}`,
          sprite: stone.sprite,
          drawHeight: stone.drawHeight,
          width: 0.56,
          height: 0.56,
        },
      });

      runicStoneBodies.push(body);
    });
  }

  function buildClouds() {
    const gameplayConfig = getGameplayConfig();
    cloudSpawns.slice(0, gameplayConfig.cloudCount).forEach((cloud, index) => {
      const body = world.createKinematicBody({
        position: Vec2(cloud.x, cloud.y),
        linearVelocity: Vec2(cloud.phase ? CLOUD_SPEED : -CLOUD_SPEED, 0),
      });

      body.createFixture(pl.Box(0.46, 0.24), {
        isSensor: true,
        userData: {
          type: "cloud",
          id: `cloud-${index}`,
          sprite: cloud.sprite,
          width: cloud.width,
          height: cloud.height,
          isStartCloud: index === 0,
        },
      });

      if (index === 0) {
        startCloudId = `cloud-${index}`;
      }
      cloudBodies.push(body);
    });
  }

  function buildBranches() {
    branchSpawns.forEach((branch, index) => {
      const body = world.createBody({
        position: Vec2(branch.x, branch.y),
      });

      body.createFixture(pl.Box(branch.sensorW * 0.5, branch.sensorH * 0.5, Vec2(branch.sensorOffsetX, branch.sensorOffsetY), 0), {
        isSensor: true,
        userData: {
          type: "branch",
          id: `branch-${index}`,
          sprite: branch.sprite,
          side: branch.side,
          drawWidth: branch.drawWidth,
          drawHeight: branch.drawHeight,
        },
      });

      branchBodies.push(body);
    });
  }

  function buildBalloons() {
    const gameplayConfig = getGameplayConfig();
    balloonSpawns.slice(0, gameplayConfig.balloonCount).forEach((balloon, index) => {
      const body = world.createKinematicBody({
        position: Vec2(balloon.x, balloon.baseY),
      });

      body.createFixture(pl.Circle(0.43), {
        restitution: 0.94,
        friction: 0.02,
        userData: {
          type: "balloon",
          id: `balloon-${index}`,
          sprite: balloon.sprite,
          drawHeight: balloon.drawHeight,
          baseY: balloon.baseY,
          phase: balloon.phase,
        },
      });

      balloonBodies.push(body);
    });
  }

  function buildCoins() {
    const gameplayConfig = getGameplayConfig();
    const coinCandidates = [];

    coinSpawns.forEach((coin, index) => {
      coinCandidates.push({
        x: coin.x,
        y: coin.y,
        id: `coin-${index}`,
      });
    });

    coinClusterPlatforms.forEach((platformIndex, clusterIndex) => {
      const platform = levelSegments[platformIndex];
      if (!platform) {
        return;
      }

      const center = platformSurfacePoint(platform, 0, 0.72);
      for (let i = 0; i < 6; i += 1) {
        const angle = (Math.PI * 2 * i) / 6;
        const radius = 0.38;
        coinCandidates.push({
          x: center.x + Math.cos(angle) * radius,
          y: center.y + Math.sin(angle) * radius,
          id: `coin-cluster-${clusterIndex}-${i}`,
        });
      }
    });

    addBonusCoinPatterns(coinCandidates, gameplayConfig.coinCount);

    coinCandidates.slice(0, gameplayConfig.coinCount).forEach((coin) => {
      createCollectibleBody({
        x: coin.x,
        y: coin.y,
        type: "coin",
        id: coin.id,
        value: gameplayConfig.coinValue,
      });
    });

    diamondSpawns.slice(0, gameplayConfig.diamondCount).forEach((diamond, index) => {
      createCollectibleBody({
        x: diamond.x,
        y: diamond.y,
        type: "diamond",
        id: `diamond-${index}`,
        value: gameplayConfig.diamondValue,
      });
    });
  }

  function addBonusCoinPatterns(coinCandidates, targetCount) {
    let patternIndex = 0;
    while (coinCandidates.length < targetCount && patternIndex < 80) {
      const missing = targetCount - coinCandidates.length;
      const pattern = createBonusCoinPattern(patternIndex, missing);
      pattern.forEach((coin) => {
        if (coinCandidates.length >= targetCount) {
          return;
        }
        if (isCoinPositionSafe(coin, coinCandidates)) {
          coinCandidates.push({
            ...coin,
            id: `coin-bonus-${coinCandidates.length}`,
          });
        }
      });
      patternIndex += 1;
    }
  }

  function createBonusCoinPattern(patternIndex, missing) {
    const laneCenters = [2.05, 3.15, 4.15, 5.15, 6.2];
    const yBands = [150, 136, 122, 108, 94, 80, 66, 52, 38, 24];
    const centerX = laneCenters[patternIndex % laneCenters.length] + randRange(-0.18, 0.18);
    const centerY = yBands[Math.floor(patternIndex / laneCenters.length) % yBands.length] + randRange(-1.1, 1.1);
    const count = Math.min(missing, patternIndex % 3 === 0 ? 7 : patternIndex % 3 === 1 ? 5 : 6);

    if (patternIndex % 3 === 0) {
      return Array.from({ length: count }, (_, i) => {
        const t = count === 1 ? 0.5 : i / (count - 1);
        const angle = Math.PI * (0.12 + t * 0.76);
        return {
          x: clamp(centerX + Math.cos(angle) * 0.82, LEFT_WALL + 0.72, RIGHT_WALL - 0.72),
          y: clamp(centerY + Math.sin(angle) * 0.58, BONUS_COIN_MIN_Y, BONUS_COIN_MAX_Y),
        };
      });
    }

    if (patternIndex % 3 === 1) {
      return Array.from({ length: count }, (_, i) => ({
        x: clamp(centerX + (i - (count - 1) * 0.5) * 0.42, LEFT_WALL + 0.72, RIGHT_WALL - 0.72),
        y: clamp(centerY + (i % 2 === 0 ? 0.28 : -0.28), BONUS_COIN_MIN_Y, BONUS_COIN_MAX_Y),
      }));
    }

    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count;
      return {
        x: clamp(centerX + Math.cos(angle) * 0.48, LEFT_WALL + 0.72, RIGHT_WALL - 0.72),
        y: clamp(centerY + Math.sin(angle) * 0.48, BONUS_COIN_MIN_Y, BONUS_COIN_MAX_Y),
      };
    });
  }

  function isCoinPositionSafe(coin, existingCoins) {
    if (coin.y > BONUS_COIN_MAX_Y || coin.y < BONUS_COIN_MIN_Y) {
      return false;
    }
    return existingCoins.every((existing) => distance(Vec2(coin.x, coin.y), Vec2(existing.x, existing.y)) >= BONUS_COIN_MIN_DISTANCE);
  }

  function createCollectibleBody(config) {
    const body = world.createBody({
      position: Vec2(config.x, config.y),
    });

    body.createFixture(pl.Circle(config.type === "diamond" ? DIAMOND_PICKUP_RADIUS : COIN_PICKUP_RADIUS), {
      isSensor: true,
      userData: {
        type: config.type,
        id: config.id,
        value: config.value,
        collected: false,
        respawnRemaining: 0,
      },
    });

    coinBodies.push(body);
  }

  function createProjectile() {
    projectile = world.createDynamicBody({
      position: Vec2(ANCHOR.x, ANCHOR.y),
      bullet: true,
      linearDamping: 0.06,
      angularDamping: 0.35,
      gravityScale: 0,
    });

    projectileFixture = projectile.createFixture(pl.Circle(PROJECTILE_RADIUS), {
      density: 1.15,
      friction: 0.18,
      restitution: 0.88,
      userData: { type: "projectile" },
    });

    projectile.setMassData({
      mass: 1,
      center: Vec2(),
      I: 0.12,
    });
  }

  function resetProjectile() {
    randomizeLayout();
    rebuildScene();
    launched = false;
    dragPointerId = null;
    dragWorld = null;
    trail = [];
    boosterFlash = 0;
    boostCooldown = 0;
    cameraY = ANCHOR.y - VIEW_H_METERS * 0.32;
    pendingLoopNudge = null;
    recentBounceSignatures = [];
    contactSerial = 0;
    floatingTexts = [];
    score = 0;
    survivalTime = 0;
    pendingCoinBodies = [];
    roundEnded = false;
    mushroomCooldowns.clear();
    cloudCooldowns.clear();
    branchCooldowns.clear();
    branchShakeStates.clear();
    branchLeaves = [];
    startCloudGraceActive = false;
    loopSampleTimer = 0;
    recentFlightStates.clear();
    heroFlightFrame = 0;
    roundEndAnimation = null;
    roundPayoutClaimed = false;
    roundAwaitingReturn = false;
    multiplier = 1;
    projectile.setTransform(Vec2(ANCHOR.x, ANCHOR.y), 0);
    projectile.setLinearVelocity(Vec2());
    projectile.setAngularVelocity(0);
    projectile.setGravityScale(0);
    projectile.setAwake(true);
    lastLaunchVector = Vec2(0, 0);
  }

  function bindInput() {
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
  }

  function onPointerDown(event) {
    if (screenMode === "home") {
      if (!isHomeIntroComplete()) {
        return;
      }
      if (event.target === playButton) {
        return;
      }
      const homePoint = screenToCanvasPoint(event);
      const clickedBuilding = getHomeBuildingAt(homePoint.x, homePoint.y);
      if (clickedBuilding) {
        openHomePopup(clickedBuilding.id);
        return;
      }
      closeHomePopup();
      homePointerActive = true;
      updateHomePointerTarget(event);
      return;
    }

    if (roundAwaitingReturn) {
      returnToHomeAfterRun();
      return;
    }

    if (launched || roundEnded) {
      return;
    }

    const worldPoint = screenToWorld(event);
    dragPointerId = event.pointerId;
    dragWorld = clampDrag(worldPoint);
    canvas.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (screenMode === "home") {
      if (homePointerActive && (event.buttons & 1) === 1) {
        updateHomePointerTarget(event);
      }
      return;
    }

    if (roundAwaitingReturn) {
      return;
    }

    if (event.pointerId !== dragPointerId) {
      return;
    }

    dragWorld = clampDrag(screenToWorld(event));
  }

  function onPointerUp(event) {
    if (screenMode === "home") {
      homePointerActive = false;
      homePointerTarget = null;
      return;
    }

    if (event.pointerId !== dragPointerId) {
      return;
    }

    const releasePoint = dragWorld ? Vec2(dragWorld.x, dragWorld.y) : Vec2(ANCHOR.x, ANCHOR.y - 1);
    let direction = normalize(Vec2(releasePoint.x - ANCHOR.x, releasePoint.y - ANCHOR.y));
    if (direction.y > -0.18) {
      direction = normalize(Vec2(direction.x, -0.18));
    }

    const velocity = Vec2(direction.x * DROP_START_SPEED, direction.y * DROP_START_SPEED);

    projectile.setTransform(Vec2(ANCHOR.x, ANCHOR.y), 0);
    projectile.setLinearVelocity(velocity);
    projectile.setAngularVelocity(-direction.x * 8);
    projectile.setGravityScale(1);
    projectile.setAwake(true);

    launched = true;
    startCloudGraceActive = true;
    dragPointerId = null;
    dragWorld = null;
    lastLaunchVector = velocity;
    trail = [];
  }

  function onKeyDown(event) {
    if (screenMode !== "home") {
      return;
    }

    if (event.key === "a" || event.key === "A" || event.key === "ArrowLeft") homeMoveX = -1;
    if (event.key === "d" || event.key === "D" || event.key === "ArrowRight") homeMoveX = 1;
    if (event.key === "w" || event.key === "W" || event.key === "ArrowUp") homeMoveY = -1;
    if (event.key === "s" || event.key === "S" || event.key === "ArrowDown") homeMoveY = 1;
  }

  function onKeyUp(event) {
    if (screenMode !== "home") {
      return;
    }

    if (
      event.key === "a" ||
      event.key === "A" ||
      event.key === "ArrowLeft" ||
      (event.key === "d") ||
      (event.key === "D") ||
      (event.key === "ArrowRight")
    ) {
      homeMoveX = 0;
    }
    if (event.key === "w" || event.key === "W" || event.key === "ArrowUp" || event.key === "s" || event.key === "S" || event.key === "ArrowDown") {
      homeMoveY = 0;
    }
  }

  function updateHomePointerTarget(event) {
    const point = screenToCanvasPoint(event);
    homePointerTarget = {
      x: clamp(point.x, HOME_WALK_BOUNDS.left, HOME_WALK_BOUNDS.right),
      y: clamp(point.y, HOME_WALK_BOUNDS.top, HOME_WALK_BOUNDS.bottom),
    };
  }

  function onHomePrimaryButtonClick() {
    if (screenMode !== "home" || !isHomeIntroComplete()) {
      return;
    }

    const nearbyBuilding = getNearbyHomeBuilding();
    if (nearbyBuilding) {
      openHomePopup(nearbyBuilding.id);
      return;
    }

    startGameFromHome();
  }

  function startGameFromHome() {
    screenMode = "game";
    closeHomePopup();
    updateScreenModeUi();
    resetProjectile();
  }

  function updateScreenModeUi() {
    const isHome = screenMode === "home";
    if (appShell) {
      appShell.classList.toggle("home-mode", isHome);
    }
    if (gameStage) {
      gameStage.classList.toggle("home-mode", isHome);
    }
    if (topStrip) {
      topStrip.hidden = isHome;
    }
    if (sidePanel) {
      sidePanel.hidden = isHome;
    }
    updateHomeIntroUi(isHome);
    if (homePopup) {
      homePopup.hidden = !isHome || !activeHomeBuildingId || !isHomeIntroComplete();
    }
    updateHomeHud();
  }

  function updateHomeIntroUi(isHome = screenMode === "home") {
    const introComplete = isHomeIntroComplete();
    const uiAlpha = isHome ? getHomeIntroUiAlpha() : 1;
    if (homeHud) {
      homeHud.hidden = !isHome || uiAlpha <= 0;
      homeHud.style.opacity = String(uiAlpha);
      homeHud.style.pointerEvents = introComplete ? "" : "none";
    }
    if (playButton) {
      playButton.hidden = !isHome || uiAlpha <= 0;
      playButton.style.opacity = String(uiAlpha);
      playButton.style.pointerEvents = introComplete ? "" : "none";
      playButton.textContent = getNearbyHomeBuilding() ? "Enter" : "Play";
    }
  }

  function isHomeIntroComplete() {
    return homeIntroElapsed >= HOME_INTRO_TOTAL;
  }

  function getHomeIntroUiAlpha() {
    const start = HOME_INTRO_TOTAL - HOME_INTRO_UI_DURATION;
    return clamp((homeIntroElapsed - start) / HOME_INTRO_UI_DURATION, 0, 1);
  }

  function getHomeIntroCloudOffset() {
    const start = HOME_INTRO_SPLASH_HOLD + HOME_INTRO_FADE_DURATION;
    const t = clamp((homeIntroElapsed - start) / HOME_INTRO_CLOUD_SLIDE_DURATION, 0, 1);
    return lerp(VIEW_W * 1.2, 0, easeOutCubic(t));
  }

  function getHomeIntroSplashAlpha() {
    const t = clamp((homeIntroElapsed - HOME_INTRO_SPLASH_HOLD) / HOME_INTRO_FADE_DURATION, 0, 1);
    return 1 - easeOutCubic(t);
  }

  function updateHomeScene(dt) {
    if (!isHomeIntroComplete()) {
      homeIntroElapsed = Math.min(HOME_INTRO_TOTAL, homeIntroElapsed + dt);
      updateHomeIntroUi(true);
    }

    if (!isHomeIntroComplete()) {
      homeCharacterSpeedX = 0;
      homeCharacterSpeedY = 0;
      updateHomeHud();
      return;
    }

    let moveX = homeMoveX;
    let moveY = homeMoveY;

    if (homePointerTarget) {
      const dx = homePointerTarget.x - homeCharacterX;
      const dy = homePointerTarget.y - homeCharacterY;
      const distanceToTarget = Math.hypot(dx, dy);
      if (distanceToTarget > 6) {
        moveX = dx / distanceToTarget;
        moveY = dy / distanceToTarget;
      } else {
        homePointerTarget = null;
      }
    }

    const lengthMove = Math.hypot(moveX, moveY) || 1;
    homeCharacterSpeedX = (moveX / lengthMove) * HOME_HERO.moveSpeed * (moveX || moveY ? 1 : 0);
    homeCharacterSpeedY = (moveY / lengthMove) * HOME_HERO.moveSpeed * (moveX || moveY ? 1 : 0);

    const candidateX = clamp(homeCharacterX + homeCharacterSpeedX * dt, HOME_WALK_BOUNDS.left, HOME_WALK_BOUNDS.right);
    const candidateY = clamp(homeCharacterY + homeCharacterSpeedY * dt, HOME_WALK_BOUNDS.top, HOME_WALK_BOUNDS.bottom);
    const constrained = constrainHomePosition(candidateX, candidateY, homeCharacterX, homeCharacterY);
    homeCharacterX = constrained.x;
    homeCharacterY = constrained.y;

    if (moveX !== 0 || moveY !== 0) {
      if (moveX !== 0) {
        homeCharacterFacing = moveX < 0 ? -1 : 1;
      }
      homeWalkTimer += dt * 10;
      homeWalkFrame = Math.floor(homeWalkTimer) % 7;
    } else {
      homeWalkTimer = 0;
      homeWalkFrame = 0;
    }

    if (playButton) {
      playButton.textContent = getNearbyHomeBuilding() ? "Enter" : "Play";
    }
    updateHomeHud();
  }

  function renderHomeScene() {
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = "#7fc7f5";
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    drawImageCentered(sprites.skyBg, VIEW_W * 0.5, VIEW_H * 0.5, VIEW_W * 1.08, null);

    const cloudOffsetX = getHomeIntroCloudOffset();
    drawHomeWorld(cloudOffsetX);
    drawHomeHero(cloudOffsetX);

    const splashAlpha = getHomeIntroSplashAlpha();
    if (splashAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = splashAlpha;
      drawImageCentered(sprites.splashScreen, VIEW_W * 0.5, VIEW_H * 0.5, VIEW_W * 1.08, null);
      ctx.restore();
    }
  }

  function drawHomeWorld(offsetX = 0) {
    ctx.save();
    ctx.translate(offsetX, 0);
    drawImageCentered(sprites.cloudBg, HOME_CLOUD_BG_CENTER_X, HOME_CLOUD_BG_CENTER_Y, HOME_CLOUD_BG_WIDTH, null);
    homeBuildings.forEach((building) => drawHomeBuildingLabel(building));
    homeBuildings.forEach((building) => drawHomeBuildingHotspot(building));
    ctx.restore();
  }

  function drawHomeHero(offsetX = 0) {
    const walkSprites = [
      homeHeroSprites.walk1,
      homeHeroSprites.walk2,
      homeHeroSprites.walk3,
      homeHeroSprites.walk4,
      homeHeroSprites.walk5,
      homeHeroSprites.walk6,
      homeHeroSprites.walk7,
    ];
    const sprite = homeCharacterSpeedX === 0 && homeCharacterSpeedY === 0
      ? homeHeroSprites.standing
      : walkSprites[homeWalkFrame % walkSprites.length];
    const heroY = homeCharacterY;

    ctx.save();
    ctx.translate(homeCharacterX + offsetX, heroY);
    ctx.scale(homeCharacterFacing, 1);
    drawImageAnchored(sprite, 0, 0, null, HOME_HERO.height, 0.5, 0.95);
    ctx.restore();
  }

  function drawHomeBuildingLabel(building) {
    const zone = building.clickZone;
    const x = zone.x;
    const y = zone.y + zone.ry * HOME_LABEL_Y_RATIO;

    ctx.save();
    ctx.font = '700 11px "Trebuchet MS", "Segoe UI", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const textWidth = ctx.measureText(building.label).width;
    const labelWidth = Math.min(zone.rx * 1.8, textWidth + 18);
    const labelHeight = 20;
    const drawX = clamp(x - labelWidth * 0.5, 8, VIEW_W - labelWidth - 8);
    const drawY = clamp(y - labelHeight * 0.5, 8, VIEW_H - labelHeight - 8);

    ctx.fillStyle = "rgba(228, 247, 255, 0.78)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 1.2;
    ctx.shadowColor = "rgba(39, 109, 170, 0.2)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.beginPath();
    ctx.roundRect(drawX, drawY, labelWidth, labelHeight, 10);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = "rgba(203, 241, 255, 0.95)";
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = "#101820";
    ctx.fillText(building.label, drawX + labelWidth * 0.5, drawY + labelHeight * 0.5 + 0.5);
    ctx.restore();
  }

  function drawHomeBuildingHotspot(building) {
    const isActive = activeHomeBuildingId === building.id;
    const nearby = getNearbyHomeBuilding()?.id === building.id;
    if (!isActive && !nearby) {
      return;
    }

    const zone = nearby ? building.enterZone : building.clickZone;
    ctx.save();
    ctx.translate(zone.x, zone.y);
    ctx.fillStyle = nearby ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 239, 178, 0.22)";
    ctx.beginPath();
    ctx.ellipse(0, 0, zone.rx, zone.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isActive ? "rgba(255, 239, 178, 0.9)" : "rgba(255, 255, 255, 0.76)";
    ctx.lineWidth = isActive ? 3 : 2;
    ctx.stroke();
    ctx.restore();
  }

  function getNearbyHomeBuilding() {
    return homeBuildings.find((building) => {
      return isInsideEllipse(homeCharacterX, homeCharacterY, building.enterZone);
    }) || null;
  }

  function getHomeBuildingAt(x, y) {
    return homeBuildings.find((building) => {
      return isInsideEllipse(x, y, building.clickZone);
    }) || null;
  }

  function updateHomeHud() {
    if (homeCoinsValue) {
      homeCoinsValue.textContent = String(walletCoins);
    }
  }

  function openHomePopup(buildingId) {
    activeHomeBuildingId = buildingId;
    renderHomePopup();
    updateScreenModeUi();
  }

  function closeHomePopup() {
    activeHomeBuildingId = null;
    if (homePopup) {
      homePopup.hidden = true;
    }
    if (playButton && screenMode === "home") {
      playButton.textContent = getNearbyHomeBuilding() ? "Enter" : "Play";
    }
  }

  function renderHomePopup() {
    if (!activeHomeBuildingId || !homePopup || !homePopupList) {
      return;
    }

    const building = upgradeCatalog[activeHomeBuildingId];
    const buildingUpgrades = upgrades[activeHomeBuildingId];

    homePopupTitle.textContent = building.title;
    homePopupSubtitle.textContent = building.subtitle;
    homePopupList.innerHTML = "";

    Object.entries(building.tracks).forEach(([trackId, track]) => {
      const level = buildingUpgrades[trackId] || 0;
      const nextUpgrade = track.levels[level];
      const item = document.createElement("article");
      item.className = "upgrade-item";

      if (!nextUpgrade) {
        const lastLevel = track.levels[track.levels.length - 1];
        item.innerHTML = `
          <div class="upgrade-copy">
            <strong>${track.name}</strong>
            <p>Level ${level} - ${lastLevel.current}</p>
            <span class="upgrade-status">Max level</span>
          </div>
          <button class="upgrade-buy" type="button" disabled>MAX</button>
        `;
        homePopupList.appendChild(item);
        return;
      }

      const affordable = walletCoins >= nextUpgrade.cost;
      item.innerHTML = `
        <div class="upgrade-copy">
          <strong>${track.name}</strong>
          <p>Level ${level} - ${nextUpgrade.current}</p>
          <span class="upgrade-status">Upgrade: ${nextUpgrade.next}</span>
        </div>
        <button class="upgrade-buy" type="button" ${affordable ? "" : "disabled"}>${nextUpgrade.cost}</button>
      `;
      const button = item.querySelector("button");
      button?.addEventListener("click", () => buyUpgrade(activeHomeBuildingId, trackId));
      homePopupList.appendChild(item);
    });

    homePopup.hidden = false;
  }

  function buyUpgrade(buildingId, trackId) {
    const building = upgradeCatalog[buildingId];
    const buildingUpgrades = upgrades[buildingId];
    const level = buildingUpgrades[trackId] || 0;
    const nextUpgrade = building.tracks[trackId]?.levels[level];
    if (!nextUpgrade || walletCoins < nextUpgrade.cost) {
      return;
    }

    walletCoins -= nextUpgrade.cost;
    buildingUpgrades[trackId] = level + 1;
    renderHomePopup();
    updateHomeHud();
  }

  function createDefaultUpgrades() {
    return Object.fromEntries(
      Object.entries(upgradeCatalog).map(([buildingId, building]) => [
        buildingId,
        Object.fromEntries(Object.keys(building.tracks).map((trackId) => [trackId, 0])),
      ])
    );
  }

  function getUpgradeLevel(buildingId, trackId) {
    return upgrades[buildingId]?.[trackId] || 0;
  }

  function getGameplayConfig() {
    const goldValueLevel = getUpgradeLevel("gold", "value");
    const crystalValueLevel = getUpgradeLevel("crystal", "value");
    return {
      balloonCount: getUpgradeLevel("balloon", "flotilla"),
      balloonBounceMultiplier: 1 + getUpgradeLevel("balloon", "speed") * 0.35,
      stoneCount: getUpgradeLevel("stone", "travelers"),
      stoneBounceMultiplier: 1 + getUpgradeLevel("stone", "speed") * 0.3,
      diamondCount: 3 + getUpgradeLevel("crystal", "spawner"),
      diamondValue: 10 + crystalValueLevel * 10,
      coinCount: 120 + getUpgradeLevel("gold", "number") * 5,
      coinValue: Math.pow(2, goldValueLevel),
      cloudCount: 10 + getUpgradeLevel("cloud", "number"),
      cloudMultiplier: 1 + getUpgradeLevel("cloud", "intensity"),
      shroomMultiplier: 1 + getUpgradeLevel("shroom", "elasticity") * 0.22,
      shroomReward: 1 + getUpgradeLevel("shroom", "nuggets"),
    };
  }

  function constrainHomePosition(nextX, nextY, prevX, prevY) {
    if (isInHomeWalkZone(nextX, nextY)) {
      return { x: nextX, y: nextY };
    }

    if (isInHomeWalkZone(nextX, prevY)) {
      return { x: nextX, y: prevY };
    }

    if (isInHomeWalkZone(prevX, nextY)) {
      return { x: prevX, y: nextY };
    }

    return findNearestHomeWalkPoint(nextX, nextY);
  }

  function isInHomeWalkZone(x, y) {
    return isPointInPolygon({ x, y }, HOME_WALK_POLYGON);
  }

  function findNearestHomeWalkPoint(x, y) {
    let bestPoint = { x, y };
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < HOME_WALK_POLYGON.length; i += 1) {
      const a = HOME_WALK_POLYGON[i];
      const b = HOME_WALK_POLYGON[(i + 1) % HOME_WALK_POLYGON.length];
      const point = projectPointToSegment({ x, y }, a, b);
      const distanceValue = distance(Vec2(x, y), Vec2(point.x, point.y));
      if (distanceValue < bestDistance) {
        bestDistance = distanceValue;
        bestPoint = point;
      }
    }

    return bestPoint;
  }

  function isInsideEllipse(x, y, zone) {
    if (!zone) {
      return false;
    }

    const dx = (x - zone.x) / zone.rx;
    const dy = (y - zone.y) / zone.ry;
    return dx * dx + dy * dy <= 1;
  }

  function isPointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;
      const intersects = ((yi > point.y) !== (yj > point.y))
        && (point.x < ((xj - xi) * (point.y - yi)) / ((yj - yi) || 0.00001) + xi);
      if (intersects) {
        inside = !inside;
      }
    }
    return inside;
  }

  function projectPointToSegment(point, a, b) {
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const lengthSq = abx * abx + aby * aby;
    if (lengthSq === 0) {
      return { x: a.x, y: a.y };
    }
    const t = clamp(((point.x - a.x) * abx + (point.y - a.y) * aby) / lengthSq, 0, 1);
    return {
      x: a.x + abx * t,
      y: a.y + aby * t,
    };
  }

  function frame(timestamp) {
    if (!lastTime) {
      lastTime = timestamp;
    }

    const delta = Math.min(0.033, (timestamp - lastTime) / 1000);
    lastTime = timestamp;
    accumulator += delta;

    while (accumulator >= TIME_STEP) {
      step(TIME_STEP);
      accumulator -= TIME_STEP;
    }

    render();
    requestAnimationFrame(frame);
  }

  function step(dt) {
    if (screenMode === "home") {
      updateHomeScene(dt);
      return;
    }

    if (!launched && !roundEnded) {
      syncAnchorToLiveStartCloud();
      cameraY = ANCHOR.y - VIEW_H_METERS * 0.32;
    }

    if (!launched && !roundEnded) {
      projectile.setTransform(Vec2(ANCHOR.x, ANCHOR.y), 0);
      projectile.setLinearVelocity(Vec2());
      projectile.setAngularVelocity(0);
    }

    updateRunicStones();
    updateClouds();
    updateBalloons();
    world.step(dt, VELOCITY_ITERS, POSITION_ITERS);
    nudgeProjectileOutOfWallPlatformTrap();
    constrainProjectileToPlayfield();
    flushCoinCollections();
    updateCoins(dt);
    updateMushroomCooldowns(dt);
    updateBranchEffects(dt);
    updateStartCloudGrace();
    maybeApplyLoopNudge();
    detectRepeatedFlight(dt);
    updateFloatingTexts(dt);

    if (launched) {
      const pos = projectile.getPosition();
      const vel = projectile.getLinearVelocity();

      trail.push({ x: pos.x, y: pos.y });
      if (trail.length > TRAIL_LIMIT) {
        trail.shift();
      }

      survivalTime += dt;

      const lookAhead = clamp(vel.y * 0.1, -2.4, 1.2);
      const targetCamera = clamp(pos.y + lookAhead, VIEW_H_METERS * 0.5, START_CAMERA_Y);
      cameraY += (targetCamera - cameraY) * 0.12;

      if (!roundEnded && pos.y <= LEVEL_BOTTOM + 0.32) {
        endRoundOnFloorHit();
      }
    } else {
      const idleCamera = roundEnded ? VIEW_H_METERS * 0.5 : START_CAMERA_Y;
      cameraY += (idleCamera - cameraY) * 0.1;
    }

    if (roundEndAnimation) {
      updateRoundEndAnimation(dt);
    }

    boosterFlash = Math.max(0, boosterFlash - dt * 2.2);
    boostCooldown = Math.max(0, boostCooldown - dt);
  }

  function render() {
    if (screenMode === "home") {
      renderHomeScene();
      return;
    }

    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    drawBackground();
    drawTunnel();
    drawGround();
    drawPlatforms();
    drawMushrooms();
    drawRunicStones();
    drawClouds();
    drawBranches();
    drawBranchLeaves();
    drawBalloons();
    drawCoins();
    drawTrajectoryGuide();
    drawTrail();
    drawSlingshot();
    drawProjectile();
    drawFloatingTexts();
    updateHudPanel();
  }

  function drawBackground() {
    const altitudeFactor = clamp((cameraY - VIEW_H_METERS * 0.5) / 95, 0, 1);
    const gradient = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    gradient.addColorStop(0, mixColor("#102a66", "#18397e", altitudeFactor));
    gradient.addColorStop(0.48, mixColor("#183a80", "#2b57a8", altitudeFactor));
    gradient.addColorStop(1, mixColor("#3c78c9", "#8fcbff", altitudeFactor));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    ctx.fillStyle = palette.tunnelGlow;
    ctx.fillRect(worldToScreenX(LEFT_WALL), 0, worldToScreenX(RIGHT_WALL) - worldToScreenX(LEFT_WALL), VIEW_H);
  }

  function drawGround() {
    const groundY = worldToScreenY(LEVEL_BOTTOM);
    if (groundY < -80 || groundY > VIEW_H + 80) {
      return;
    }
    const centerX = worldToScreenX((LEFT_WALL + RIGHT_WALL) * 0.5);
    drawImageAnchored(sprites.bottom, centerX, groundY + 30, 430, null, 0.5, 0.88);
  }

  function drawTunnel() {
    const leftX = worldToScreenX(LEFT_WALL) - 8;
    const rightX = worldToScreenX(RIGHT_WALL) - 8;
    const wallWidth = 18;

    ctx.fillStyle = palette.wallShade;
    ctx.fillRect(leftX, 0, wallWidth, VIEW_H);
    ctx.fillRect(rightX, 0, wallWidth, VIEW_H);

    ctx.fillStyle = palette.wallFace;
    ctx.fillRect(leftX + 4, 0, wallWidth - 4, VIEW_H);
    ctx.fillRect(rightX + 4, 0, wallWidth - 4, VIEW_H);

    ctx.fillStyle = palette.wallHighlight;
    ctx.fillRect(leftX + 6, 0, 4, VIEW_H);
    ctx.fillRect(rightX + 6, 0, 4, VIEW_H);
  }

  function drawPlatforms() {
    for (let body = world.getBodyList(); body; body = body.getNext()) {
      if (body === projectile) {
        continue;
      }

      for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
        const userData = fixture.getUserData();
        if (!userData || userData.type !== "platform") {
          continue;
        }

        drawSpriteBody(sprites[userData.sprite], body.getPosition(), body.getAngle(), (userData.width * SCALE + 20) * OBJECT_SCALE, 48 * OBJECT_SCALE);
      }
    }
  }

  function drawMushrooms() {
    mushroomBodies.forEach((body) => {
      const fixture = body.getFixtureList();
      const userData = fixture.getUserData();
      const sprite = sprites[userData.sprite];
      drawSpriteBody(sprite, body.getPosition(), body.getAngle(), null, userData.drawHeight || 40);
    });
  }

  function drawRunicStones() {
    runicStoneBodies.forEach((body) => {
      const fixture = body.getFixtureList();
      const userData = fixture.getUserData();
      drawSpriteBody(sprites[userData.sprite], body.getPosition(), body.getAngle(), null, userData.drawHeight || 42);
    });
  }

  function drawClouds() {
    cloudBodies.forEach((body) => {
      const fixture = body.getFixtureList();
      const userData = fixture.getUserData();
      drawSpriteBody(sprites[userData.sprite], body.getPosition(), 0, userData.width, userData.height);
    });
  }

  function drawBranches() {
    branchBodies.forEach((body) => {
      const fixture = body.getFixtureList();
      const userData = fixture.getUserData();
      const shake = branchShakeStates.get(userData.id);
      const phase = shake ? 1 - shake.time / shake.duration : 0;
      const shakeOffsetY = shake
        ? Math.sin(phase * Math.PI * 5) * 0.06 * (shake.time / shake.duration)
        : 0;
      const shakeAngle = shake
        ? Math.sin(phase * Math.PI * 6) * 0.075 * (userData.side === "right" ? -1 : 1) * (shake.time / shake.duration)
        : 0;
      const position = body.getPosition();

      ctx.save();
      ctx.translate(worldToScreenX(position.x), worldToScreenY(position.y + shakeOffsetY));
      ctx.rotate(shakeAngle);
      drawImageAnchored(
        sprites[userData.sprite],
        0,
        0,
        null,
        userData.drawHeight,
        userData.side === "right" ? 0.98 : 0.02,
        0.5
      );
      ctx.restore();
    });
  }

  function drawBalloons() {
    balloonBodies.forEach((body) => {
      const fixture = body.getFixtureList();
      const userData = fixture.getUserData();
      drawSpriteBody(sprites[userData.sprite], body.getPosition(), 0, null, userData.drawHeight);
    });
  }

  function drawCoins() {
    coinBodies.forEach((body) => {
      const fixture = body.getFixtureList();
      const coinData = fixture.getUserData();
      const pos = body.getPosition();
      const x = worldToScreenX(pos.x);
      const y = worldToScreenY(pos.y);

      ctx.save();
      ctx.translate(x, y);
      if (coinData.collected) {
        const progress = 1 - (coinData.respawnRemaining / COIN_RESPAWN_TIME);
        const timerRadius = coinData.type === "diamond" ? 8.2 : 6.5;
        ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
        ctx.beginPath();
        ctx.arc(0, 0, timerRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.21)";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(0, 0, timerRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, timerRadius, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * progress);
        ctx.stroke();
      } else if (coinData.type === "diamond") {
        drawDiamond(0, 0);
      } else {
        ctx.fillStyle = "rgba(255, 245, 184, 0.32)";
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fill();
        drawImageCentered(sprites.coin, 0, 0, 25, 25);
      }
      ctx.restore();
    });
  }



  function drawTrajectoryGuide() {
    if (launched || !dragWorld) {
      return;
    }

    const current = dragWorld;
    const aimVector = Vec2(current.x - ANCHOR.x, current.y - ANCHOR.y);
    const stretch = Math.min(MAX_STRETCH, length(aimVector));

    ctx.strokeStyle = palette.path;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(worldToScreenX(ANCHOR.x), worldToScreenY(ANCHOR.y));
    ctx.lineTo(worldToScreenX(current.x), worldToScreenY(current.y));
    ctx.stroke();

    if (stretch < 0.08) {
      return;
    }

    let direction = normalize(aimVector);
    if (direction.y > -0.18) {
      direction = normalize(Vec2(direction.x, -0.18));
    }
    let samplePos = Vec2(ANCHOR.x, ANCHOR.y);
    let sampleVel = Vec2(direction.x * (DROP_START_SPEED * 0.88), direction.y * (DROP_START_SPEED * 0.88));

    ctx.fillStyle = "rgba(124, 224, 255, 0.7)";
    for (let i = 0; i < 22; i += 1) {
      const t = 0.08;
      sampleVel = Vec2(sampleVel.x, sampleVel.y + GRAVITY * t);
      samplePos = Vec2(samplePos.x + sampleVel.x * t, samplePos.y + sampleVel.y * t);
      ctx.beginPath();
      ctx.arc(worldToScreenX(samplePos.x), worldToScreenY(samplePos.y), 3.2 - i * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawTrail() {
    if (trail.length < 2) {
      return;
    }

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    for (let index = 1; index < trail.length; index += 1) {
      const prev = trail[index - 1];
      const point = trail[index];
      const alpha = index / trail.length;
      const width = 1.5 + alpha * 4;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.35})`;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(worldToScreenX(prev.x), worldToScreenY(prev.y));
      const x = worldToScreenX(point.x);
      const y = worldToScreenY(point.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }

  function drawSlingshot() {
    if (launched || !dragWorld) {
      return;
    }

    const current = dragWorld;
    const anchorX = worldToScreenX(ANCHOR.x);
    const anchorY = worldToScreenY(ANCHOR.y);
    const currentX = worldToScreenX(current.x);
    const currentY = worldToScreenY(current.y);

    ctx.strokeStyle = "rgba(117, 82, 55, 0.38)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(anchorX, anchorY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

  }

  function drawProjectile() {
    const pos = projectile.getPosition();
    const screenX = worldToScreenX(pos.x);
    const screenY = worldToScreenY(pos.y);
    const velocity = projectile.getLinearVelocity();
    const flySprites = [sprites.heroFly1, sprites.heroFly2, sprites.heroFly3, sprites.heroFly4];
    const walkVisual = getPlatformWalkVisual(pos, velocity);
    const walkSprites = [
      homeHeroSprites.walk1,
      homeHeroSprites.walk2,
      homeHeroSprites.walk3,
      homeHeroSprites.walk4,
      homeHeroSprites.walk5,
      homeHeroSprites.walk6,
      homeHeroSprites.walk7,
    ];
    const sprite = walkVisual
      ? walkSprites[Math.floor(performance.now() / 95) % walkSprites.length]
      : launched
        ? flySprites[heroFlightFrame % flySprites.length]
        : sprites.heroStanding;
    const visualAngle = walkVisual
      ? walkVisual.angle
      : launched
        ? Math.atan2(-velocity.y || 0, velocity.x || 0) + Math.PI * 0.5
        : 0;
    const heroHeight = launched ? 50 : 49;
    const anchorY = walkVisual ? 0.95 : roundEnded ? 0.84 : 0.03;
    const facing = walkVisual ? walkVisual.facing : 1;

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(visualAngle);
    ctx.scale(facing, 1);

    drawImageAnchored(sprite, 0, 0, null, heroHeight, 0.5, anchorY);
    ctx.restore();
  }

  function getPlatformWalkVisual(pos, velocity) {
    if (!launched || roundEnded || length(velocity) > PLATFORM_WALK_VISUAL_SPEED) {
      return null;
    }

    let bestPlatform = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    levelSegments.forEach((platform) => {
      const cos = Math.cos(platform.angle);
      const sin = Math.sin(platform.angle);
      const rel = Vec2(pos.x - platform.x, pos.y - platform.y);
      const localX = rel.x * cos + rel.y * sin;
      const localY = -rel.x * sin + rel.y * cos;
      const halfLength = platform.w * 0.25 + 0.18;
      const surfaceY = PLATFORM_HALF_HEIGHT + PROJECTILE_RADIUS;
      const surfaceDistance = Math.abs(localY - surfaceY);

      if (Math.abs(localX) <= halfLength && surfaceDistance < bestDistance) {
        bestDistance = surfaceDistance;
        bestPlatform = platform;
      }
    });

    if (!bestPlatform || bestDistance > PLATFORM_WALK_VISUAL_DISTANCE) {
      return null;
    }

    return {
      angle: bestPlatform.angle,
      facing: velocity.x < -0.12 ? -1 : 1,
    };
  }

  function updateHudPanel() {
    const pos = projectile.getPosition();
    const vel = projectile.getLinearVelocity();
    const speed = length(vel).toFixed(1);
    const remaining = Math.max(0, pos.y - LEVEL_BOTTOM).toFixed(1);
    const elapsed = survivalTime.toFixed(1);

    const stateLabel = roundAwaitingReturn
      ? "Dotknij, aby wrocic"
      : roundEnded
        ? "Runda zakonczona"
        : launched
        ? "Spadanie aktywne"
        : dragWorld
          ? "Wybierasz kierunek"
          : "Gotowy do puszczenia";

    let note = "Cel: spadaj jak najdluzej i zbieraj monety";
    if (roundAwaitingReturn) {
      note = "Zebrane zloto dopisane. Kliknij, aby wrocic na Home.";
    } else if (roundEnded) {
      note = "Ludzik dotarl na dno.";
    } else if (pendingLoopNudge) {
      note = "Anti-loop: korekta toru gotowa";
    }

    if (scoreValue) {
      scoreValue.textContent = String(score);
    }
    if (multiplierValue) {
      multiplierValue.textContent = String(multiplier);
    }
    if (sumValue) {
      sumValue.textContent = String(multiplier * score);
    }
    if (depthValue) {
      depthValue.textContent = `spadanie ${LEVEL_TOP} m`;
    }
    if (speedValue) {
      speedValue.textContent = `${speed} m/s`;
    }
    if (remainingValue) {
      remainingValue.textContent = `${remaining} m`;
    }
    if (timeValue) {
      timeValue.textContent = `${elapsed} s`;
    }
    if (stateValue) {
      stateValue.textContent = stateLabel;
    }
    if (statusNote) {
      statusNote.textContent = note;
    }
  }

  function registerBounce(surfaceData) {
    if (!surfaceData || !surfaceData.id) {
      return;
    }

    const velocity = projectile.getLinearVelocity();
    const speed = length(velocity);
    if (speed < 4) {
      return;
    }

    const signature = {
      id: surfaceData.id,
      type: surfaceData.type,
      dirX: Math.sign(velocity.x) || 1,
      dirY: Math.sign(velocity.y) || 1,
      speedBand: Math.round(speed / 2),
      yBand: Math.round(projectile.getPosition().y / 3),
      serial: contactSerial++,
    };

    const repeated = recentBounceSignatures.find((entry) => {
      return (
        entry.id === signature.id &&
        entry.type === signature.type &&
        entry.dirX === signature.dirX &&
        entry.dirY === signature.dirY &&
        Math.abs(entry.speedBand - signature.speedBand) <= 1 &&
        Math.abs(entry.yBand - signature.yBand) <= 1 &&
        signature.serial - entry.serial >= 2
      );
    });

    if (repeated && !pendingLoopNudge) {
      const angleJitter = (Math.random() * 0.18 + 0.08) * (Math.random() < 0.5 ? -1 : 1);
      pendingLoopNudge = {
        angleJitter,
        speedBoost: 1 + Math.random() * 0.06,
      };
    }

    recentBounceSignatures.push(signature);
    if (recentBounceSignatures.length > LOOP_MEMORY) {
      recentBounceSignatures.shift();
    }
    heroFlightFrame = (heroFlightFrame + 1) % 4;
  }

  function maybeApplyLoopNudge() {
    if (!pendingLoopNudge || !launched || roundEnded) {
      return;
    }

    const velocity = projectile.getLinearVelocity();
    const speed = length(velocity);
    if (speed < 0.01) {
      pendingLoopNudge = null;
      return;
    }

    const angle = Math.atan2(velocity.y, velocity.x) + pendingLoopNudge.angleJitter;
    const adjustedSpeed = speed * pendingLoopNudge.speedBoost;
    projectile.setLinearVelocity(Vec2(Math.cos(angle) * adjustedSpeed, Math.sin(angle) * adjustedSpeed));
    projectile.setAngularVelocity(projectile.getAngularVelocity() * 0.92);
    pendingLoopNudge = null;
  }

  function detectRepeatedFlight(dt) {
    if (!launched || roundEnded) {
      loopSampleTimer = 0;
      return;
    }

    loopSampleTimer += dt;
    if (loopSampleTimer < LOOP_SAMPLE_INTERVAL) {
      return;
    }
    loopSampleTimer = 0;

    const pos = projectile.getPosition();
    const vel = projectile.getLinearVelocity();
    const speed = length(vel);
    if (speed < 5) {
      return;
    }

    const stateKey = [
      Math.round(pos.x * 1.4),
      Math.round(pos.y * 0.22),
      Math.sign(vel.x) || 1,
      Math.sign(vel.y) || 1,
      Math.round(speed / 3),
    ].join(":");
    const now = performance.now() / 1000;
    const existing = recentFlightStates.get(stateKey);

    if (existing && now - existing.lastSeen > 0.7 && now - existing.lastSeen < 6) {
      existing.hits += 1;
      existing.lastSeen = now;
      recentFlightStates.set(stateKey, existing);

      if (existing.hits >= 2 && !pendingLoopNudge) {
        const jitterBase = 0.16 + Math.min(0.18, existing.hits * 0.03);
        pendingLoopNudge = {
          angleJitter: jitterBase * (Math.random() < 0.5 ? -1 : 1),
          speedBoost: 1.03 + Math.random() * 0.08,
        };
      }
      return;
    }

    recentFlightStates.set(stateKey, {
      hits: 0,
      lastSeen: now,
    });

    if (recentFlightStates.size > 80) {
      const oldestKey = recentFlightStates.keys().next().value;
      recentFlightStates.delete(oldestKey);
    }
  }

  function endRoundOnFloorHit() {
    const landingX = HALF_W;
    const landingY = LEVEL_BOTTOM + 1.05;
    const finalScore = multiplier * score;
    roundEnded = true;
    launched = false;
    dragPointerId = null;
    dragWorld = null;
    pendingLoopNudge = null;
    recentBounceSignatures = [];
    projectile.setLinearVelocity(Vec2());
    projectile.setAngularVelocity(0);
    projectile.setGravityScale(0);
    projectile.setAwake(false);
    projectile.setTransform(Vec2(landingX, LEVEL_BOTTOM - 0.65), 0);
    roundEndAnimation = {
      elapsed: 0,
      riseDuration: 0.26,
      duration: 0.82,
      startY: LEVEL_BOTTOM - 0.65,
      apexY: LEVEL_BOTTOM + 2.3,
      landingY,
      x: landingX,
      score: finalScore,
      scoreShown: false,
    };
    creditRoundPayout(finalScore);
  }

  function updateRoundEndAnimation(dt) {
    if (!roundEndAnimation) {
      return;
    }

    roundEndAnimation.elapsed += dt;
    const anim = roundEndAnimation;
    let nextY;

    if (anim.elapsed <= anim.riseDuration) {
      const t = anim.elapsed / anim.riseDuration;
      nextY = lerp(anim.startY, anim.apexY, easeOutCubic(t));
    } else {
      const t = clamp((anim.elapsed - anim.riseDuration) / (anim.duration - anim.riseDuration), 0, 1);
      nextY = lerp(anim.apexY, anim.landingY, easeInQuad(t));
    }

    projectile.setTransform(Vec2(anim.x, nextY), 0);

    if (anim.elapsed >= anim.duration) {
      projectile.setTransform(Vec2(anim.x, anim.landingY), 0);
      if (!anim.scoreShown) {
        anim.scoreShown = true;
        floatingTexts.push({
          x: anim.x,
          y: anim.landingY + 1.2,
          value: `${anim.score}`,
          life: 4.2,
          color: "#ffffff",
          scale: 1.5,
        });
      }
      roundEndAnimation = null;
      roundAwaitingReturn = true;
    }
  }

  function creditRoundPayout(finalScore) {
    if (roundPayoutClaimed) {
      return;
    }

    walletCoins += finalScore;
    roundPayoutClaimed = true;
    updateHomeHud();
  }

  function returnToHomeAfterRun() {
    screenMode = "home";
    homeIntroElapsed = HOME_INTRO_TOTAL;
    closeHomePopup();
    resetProjectile();
    homeCharacterX = 206;
    homeCharacterY = 610;
    updateScreenModeUi();
  }

  function queueCoinCollection(body) {
    if (!body || pendingCoinBodies.includes(body)) {
      return;
    }
    const fixture = body.getFixtureList();
    const coinData = fixture?.getUserData();
    if (coinData?.collected) {
      return;
    }
    pendingCoinBodies.push(body);
  }

  function flushCoinCollections() {
    if (!pendingCoinBodies.length) {
      return;
    }

    pendingCoinBodies.forEach((body) => collectCoin(body));
    pendingCoinBodies = [];
  }

  function collectCoin(body) {
    const fixture = body.getFixtureList();
    const coinData = fixture.getUserData();
    if (coinData.collected) {
      return;
    }
    const pos = body.getPosition();
    coinData.collected = true;
    coinData.respawnRemaining = COIN_RESPAWN_TIME;
    grantCoins(coinData.value, pos, false, coinData.type);
  }

  function grantCoins(amount, position, boosterReward, rewardType = "coin") {
    score += amount;
    floatingTexts.push({
      x: position.x,
      y: position.y,
      value: `+${amount}`,
      life: 0.9,
      color: boosterReward ? "#ff8c6f" : rewardType === "diamond" ? "#ff6fb9" : "#f4a700",
      scale: boosterReward ? 1.2 : rewardType === "diamond" ? 1.2 : 1,
    });
  }

  function updateFloatingTexts(dt) {
    floatingTexts = floatingTexts
      .map((entry) => ({
        ...entry,
        y: entry.y + dt * 0.95,
        life: entry.life - dt,
      }))
      .filter((entry) => entry.life > 0);
  }

  function updateCoins(dt) {
    coinBodies.forEach((body) => {
      const fixture = body.getFixtureList();
      const coinData = fixture.getUserData();
      if (!coinData.collected) {
        return;
      }
      coinData.respawnRemaining = Math.max(0, coinData.respawnRemaining - dt);
      if (coinData.respawnRemaining <= 0) {
        coinData.collected = false;
      }
    });
  }

  function updateMushroomCooldowns(dt) {
    mushroomCooldowns.forEach((time, key) => {
      const next = time - dt;
      if (next <= 0) {
        mushroomCooldowns.delete(key);
      } else {
        mushroomCooldowns.set(key, next);
      }
    });
  }

  function updateBranchEffects(dt) {
    branchShakeStates.forEach((shake, key) => {
      const nextTime = shake.time - dt;
      if (nextTime <= 0) {
        branchShakeStates.delete(key);
      } else {
        branchShakeStates.set(key, { ...shake, time: nextTime });
      }
    });

    branchLeaves = branchLeaves
      .map((leaf) => ({
        ...leaf,
        x: leaf.x + leaf.vx * dt,
        y: leaf.y + leaf.vy * dt,
        vx: leaf.vx * 0.98,
        vy: leaf.vy - 1.45 * dt,
        rotation: leaf.rotation + leaf.spin * dt,
        life: leaf.life - dt,
      }))
      .filter((leaf) => leaf.life > 0);
  }

  function updateStartCloudGrace() {
    if (!launched || !startCloudGraceActive) {
      return;
    }

    const startCloudBody = cloudBodies[0];
    if (!startCloudBody) {
      startCloudGraceActive = false;
      return;
    }

    const projectilePos = projectile.getPosition();
    const cloudPos = startCloudBody.getPosition();
    if (Math.abs(projectilePos.x - cloudPos.x) > 0.86 || Math.abs(projectilePos.y - cloudPos.y) > 0.58) {
      startCloudGraceActive = false;
    }
  }

  function drawFloatingTexts() {
    floatingTexts.forEach((entry) => {
      const alpha = Math.min(1, entry.life * 1.5);
      const x = worldToScreenX(entry.x);
      const y = worldToScreenY(entry.y);
      const fontSize = Math.round(24 * entry.scale);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `700 ${fontSize}px "Arial Rounded MT Bold", "Trebuchet MS", "Verdana", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(5, 14, 48, 0.35)";
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 3;
      ctx.lineWidth = Math.max(2.2, fontSize * 0.14);
      ctx.strokeStyle = "rgba(18, 33, 84, 0.96)";
      ctx.fillStyle = entry.color;
      ctx.strokeText(entry.value, x, y);
      ctx.fillText(entry.value, x, y);
      ctx.restore();
    });
    ctx.textAlign = "start";
  }

  function drawBranchLeaves() {
    branchLeaves.forEach((leaf) => {
      const alpha = Math.max(0, leaf.life / leaf.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha * 0.82;
      ctx.translate(worldToScreenX(leaf.x), worldToScreenY(leaf.y));
      ctx.rotate(leaf.rotation);
      ctx.fillStyle = leaf.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, leaf.size * 0.7, leaf.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawDiamond(x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(255, 160, 214, 0.28)";
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(11, -2);
    ctx.lineTo(0, 14);
    ctx.lineTo(-11, -2);
    ctx.closePath();
    ctx.fillStyle = "#ff5ea8";
    ctx.fill();
    ctx.strokeStyle = "#ffd0ea";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(0, 14);
    ctx.moveTo(-11, -2);
    ctx.lineTo(11, -2);
    ctx.strokeStyle = "rgba(255, 236, 247, 0.75)";
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.restore();
  }

  function rebuildCoins() {
    coinBodies.forEach((body) => world.destroyBody(body));
    coinBodies = [];
    buildCoins();
  }

  function rebuildScene() {
    destroyBodies(levelBodies);
    destroyBodies(mushroomBodies);
    destroyBodies(runicStoneBodies);
    destroyBodies(cloudBodies);
    destroyBodies(branchBodies);
    destroyBodies(balloonBodies);
    destroyBodies(coinBodies);

    levelBodies = [];
    mushroomBodies = [];
    runicStoneBodies = [];
    cloudBodies = [];
    branchBodies = [];
    balloonBodies = [];
    coinBodies = [];
    pendingCoinBodies = [];
    startCloudId = null;

    buildLevel();
    buildMushrooms();
    buildRunicStones();
    buildClouds();
    buildBranches();
    buildBalloons();
    buildCoins();
  }

  function destroyBodies(bodies) {
    bodies.forEach((body) => world.destroyBody(body));
  }

  function randomizeLayout() {
    randomizePlatformLayout();
    enforcePlatformSpacing();

    randomizeMushroomLayout();

    mutateLayout(runicStoneSpawns, baseLayout.runicStoneSpawns, (stone) => ({
      ...stone,
      x: clamp(stone.x + randRange(-0.35, 0.35), LEFT_WALL + 1.2, RIGHT_WALL - 1.2),
      y: clamp(stone.y + randRange(-1.35, 1.35), LEVEL_BOTTOM + 8, LEVEL_TOP - 6),
    }));

    mutateLayout(cloudSpawns, baseLayout.cloudSpawns, (cloud, index) => ({
      ...cloud,
      x: clamp(cloud.x + randRange(index === 0 ? -0.18 : -0.32, index === 0 ? 0.18 : 0.32), LEFT_WALL + 1.35, RIGHT_WALL - 1.35),
      y: clamp(cloud.y + randRange(index === 0 ? -0.45 : -1.15, index === 0 ? 0.45 : 1.15), LEVEL_BOTTOM + 8, LEVEL_TOP - 2),
    }));

    randomizeBranchLayout();

    mutateLayout(balloonSpawns, baseLayout.balloonSpawns, (balloon) => ({
      ...balloon,
      x: clamp(balloon.x + randRange(-0.4, 0.4), LEFT_WALL + 1.1, RIGHT_WALL - 1.1),
      baseY: clamp(balloon.baseY + randRange(-1.5, 1.5), LEVEL_BOTTOM + 10, LEVEL_TOP - 10),
      phase: balloon.phase + randRange(-0.3, 0.3),
    }));

    randomizeCoinLines();

    mutateLayout(diamondSpawns, baseLayout.diamondSpawns, (diamond) => ({
      x: clamp(diamond.x + randRange(-0.34, 0.34), LEFT_WALL + 1.0, RIGHT_WALL - 1.0),
      y: clamp(diamond.y + randRange(-1.1, 1.1), LEVEL_BOTTOM + 8, LEVEL_TOP - 6),
    }));

    syncAnchorToStartCloud();
  }

  function mutateLayout(target, base, mapper) {
    base.forEach((item, index) => {
      Object.assign(target[index], mapper(item, index));
    });
  }

  function randomizePlatformLayout() {
    const leftOuter = 1.38;
    const leftInner = 2.18;
    const rightInner = 6.02;
    const rightOuter = 6.82;
    const groupSize = 4;

    baseLayout.levelSegments.forEach((segment, index) => {
      const groupIndex = Math.floor(index / groupSize);
      const groupDriftY = Math.sin(groupIndex * 1.7 + Math.random()) * 0.75 + randRange(-1.0, 1.0);
      const sideSign = segment.x > HALF_W ? 1 : -1;
      const prefersInner = Math.random() < 0.45;
      const laneCenter = sideSign > 0
        ? (prefersInner ? rightInner : rightOuter)
        : (prefersInner ? leftInner : leftOuter);
      const laneJitter = randRange(-0.2, 0.2);
      const angleMagnitude = randRange(0.16, 0.27);

      levelSegments[index].x = clamp(
        laneCenter + laneJitter,
        LEFT_WALL + segment.w * 0.25 + PLATFORM_WALL_CLEARANCE,
        RIGHT_WALL - segment.w * 0.25 - PLATFORM_WALL_CLEARANCE
      );
      levelSegments[index].y = clamp(
        segment.y + groupDriftY + randRange(-1.2, 1.2),
        LEVEL_BOTTOM + 10,
        LEVEL_TOP - 4
      );
      levelSegments[index].w = clamp(segment.w + randRange(-0.18, 0.18), 4.7, 5.24);
      levelSegments[index].angle = sideSign > 0
        ? angleMagnitude + randRange(-0.035, 0.035)
        : -angleMagnitude + randRange(-0.035, 0.035);
    });
  }

  function randomizeMushroomLayout() {
    const platformOffsets = [0, 0, -2, 2, -4, 4];
    const placedMushrooms = [];

    baseLayout.mushroomSpawns.forEach((mushroom, index) => {
      const candidates = createMushroomCandidates(mushroom, platformOffsets);
      const selected = candidates.find((candidate) => !mushroomOverlapsPlaced(candidate, placedMushrooms)) || candidates[candidates.length - 1];
      mushroomSpawns[index].platform = selected.platform;
      mushroomSpawns[index].offset = selected.offset;
      placedMushrooms.push(selected);
    });
  }

  function createMushroomCandidates(mushroom, platformOffsets) {
    const candidates = [];
    platformOffsets.forEach((platformShift) => {
      const platform = clampIndex(mushroom.platform + platformShift, 0, 19);
      const baseOffset = clamp(mushroom.offset + randRange(-0.16, 0.16), -0.54, 0.54);
      candidates.push({ platform, offset: baseOffset });
      [-0.46, -0.24, 0, 0.24, 0.46].forEach((fallbackOffset) => {
        candidates.push({
          platform,
          offset: clamp(fallbackOffset + randRange(-0.04, 0.04), -0.54, 0.54),
        });
      });
    });
    return candidates;
  }

  function mushroomOverlapsPlaced(candidate, placedMushrooms) {
    const candidatePoint = mushroomWorldPoint(candidate);
    return placedMushrooms.some((placed) => {
      const placedPoint = mushroomWorldPoint(placed);
      return distance(candidatePoint, placedPoint) < MUSHROOM_MIN_WORLD_GAP;
    });
  }

  function mushroomWorldPoint(mushroom) {
    const platform = levelSegments[mushroom.platform];
    return platformSurfacePoint(platform, mushroom.offset * OBJECT_SCALE, 0.38);
  }

  function randomizeBranchLayout() {
    const placedBranches = [];

    baseLayout.branchSpawns.forEach((baseBranch, index) => {
      const candidateYs = createBranchCandidateYs(baseBranch.y);
      let selectedY = candidateYs[candidateYs.length - 1];

      for (const candidateY of candidateYs) {
        const candidate = { ...baseBranch, y: candidateY };
        if (!branchHasUnsafeOverlap(candidate, placedBranches)) {
          selectedY = candidateY;
          break;
        }
      }

      branchSpawns[index].x = baseBranch.x;
      branchSpawns[index].y = selectedY;
      branchSpawns[index].side = baseBranch.side;
      placedBranches.push(branchSpawns[index]);
    });
  }

  function createBranchCandidateYs(baseY) {
    const candidates = [baseY + randRange(-1.4, 1.4)];
    const offsets = [4, -4, 7, -7, 11, -11, 15, -15, 20, -20, 26, -26];
    offsets.forEach((offset) => {
      candidates.push(baseY + offset + randRange(-0.6, 0.6));
    });
    for (let y = LEVEL_BOTTOM + 14; y <= LEVEL_TOP - 14; y += 7.5) {
      candidates.push(y + randRange(-0.55, 0.55));
    }
    return Array.from(new Set(candidates.map((y) => clamp(Number(y.toFixed(2)), LEVEL_BOTTOM + 12, LEVEL_TOP - 12))));
  }

  function branchHasUnsafeOverlap(branch, placedBranches) {
    return (
      branchOverlapsAnyPlatform(branch) ||
      branchOverlapsAnyMushroom(branch) ||
      placedBranches.some((placed) => {
        return placed.side === branch.side && Math.abs(placed.y - branch.y) < BRANCH_BRANCH_CLEARANCE_Y;
      })
    );
  }

  function branchOverlapsAnyPlatform(branch) {
    const branchBox = getBranchSensorBox(branch);
    return levelSegments.some((platform) => {
      const platformBox = getPlatformSafetyBox(platform);
      return boxesOverlap(branchBox, platformBox, 0.32, BRANCH_PLATFORM_CLEARANCE_Y);
    });
  }

  function branchOverlapsAnyMushroom(branch) {
    const branchBox = getBranchSensorBox(branch);
    return mushroomSpawns.some((mushroom) => {
      const platform = levelSegments[mushroom.platform];
      if (!platform) {
        return false;
      }
      const point = platformSurfacePoint(platform, mushroom.offset * OBJECT_SCALE, 0.38);
      const mushroomBox = {
        minX: point.x - 0.54,
        maxX: point.x + 0.54,
        minY: point.y - 0.44,
        maxY: point.y + 0.52,
      };
      return boxesOverlap(branchBox, mushroomBox, 0.28, BRANCH_MUSHROOM_CLEARANCE_Y);
    });
  }

  function getBranchSensorBox(branch) {
    const centerX = branch.x + branch.sensorOffsetX;
    const centerY = branch.y + branch.sensorOffsetY;
    return {
      minX: centerX - branch.sensorW * 0.5,
      maxX: centerX + branch.sensorW * 0.5,
      minY: centerY - branch.sensorH * 0.5,
      maxY: centerY + branch.sensorH * 0.5,
    };
  }

  function getPlatformSafetyBox(platform) {
    const halfLength = platform.w * 0.28;
    return {
      minX: platform.x - halfLength,
      maxX: platform.x + halfLength,
      minY: platform.y - 0.45,
      maxY: platform.y + 0.45,
    };
  }

  function boxesOverlap(a, b, extraX = 0, extraY = 0) {
    return (
      a.minX - extraX <= b.maxX &&
      a.maxX + extraX >= b.minX &&
      a.minY - extraY <= b.maxY &&
      a.maxY + extraY >= b.minY
    );
  }

  function randomizeCoinLines() {
    const lineSize = 4;
    for (let start = 0; start < baseLayout.coinSpawns.length; start += lineSize) {
      const shiftX = randRange(-0.26, 0.26);
      const shiftY = randRange(-0.8, 0.8);
      const tiltX = randRange(-0.04, 0.04);
      const tiltY = randRange(-0.08, 0.08);

      for (let i = 0; i < lineSize; i += 1) {
        const index = start + i;
        const baseCoin = baseLayout.coinSpawns[index];
        if (!baseCoin || !coinSpawns[index]) {
          continue;
        }

        coinSpawns[index].x = clamp(
          baseCoin.x + shiftX + tiltX * i,
          LEFT_WALL + 0.95,
          RIGHT_WALL - 0.95
        );
        coinSpawns[index].y = clamp(
          baseCoin.y + shiftY + tiltY * i,
          LEVEL_BOTTOM + 8,
          LEVEL_TOP - 6
        );
      }
    }
  }

  function enforcePlatformSpacing() {
    const minVerticalGap = 5.2;

    for (let i = 0; i < levelSegments.length; i += 1) {
      for (let j = i + 1; j < levelSegments.length; j += 1) {
        const a = levelSegments[i];
        const b = levelSegments[j];
        const horizontalOverlap = Math.abs(a.x - b.x) < 5.4;
        if (!horizontalOverlap) {
          continue;
        }

        const gap = Math.abs(a.y - b.y);
        if (gap >= minVerticalGap) {
          continue;
        }

        const baseHigher = baseLayout.levelSegments[i].y >= baseLayout.levelSegments[j].y ? i : j;
        const baseLower = baseHigher === i ? j : i;
        const higher = levelSegments[baseHigher];
        const lower = levelSegments[baseLower];
        lower.y = clamp(higher.y - minVerticalGap, LEVEL_BOTTOM + 10, LEVEL_TOP - 4);
      }
    }
  }

  function syncAnchorToStartCloud() {
    const startCloud = cloudSpawns[0];
    ANCHOR = Vec2(startCloud.x, Math.min(LEVEL_TOP - 0.15, startCloud.y + 0.98));
  }

  function syncAnchorToLiveStartCloud() {
    const startCloudBody = cloudBodies[0];
    if (!startCloudBody) {
      return;
    }

    const pos = startCloudBody.getPosition();
    ANCHOR = Vec2(pos.x, Math.min(LEVEL_TOP - 0.15, pos.y + 0.98));
  }

  function randRange(min, max) {
    return min + Math.random() * (max - min);
  }





  function drawCloud(x, y, scale) {
    drawSkyCloud(x, y, scale, 0.5);
  }

  function drawSkyCloud(x, y, scale, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = palette.cloud;
    ctx.beginPath();
    ctx.arc(-24, 4, 17, 0, Math.PI * 2);
    ctx.arc(-3, -8, 24, 0, Math.PI * 2);
    ctx.arc(24, 3, 18, 0, Math.PI * 2);
    ctx.arc(4, 12, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.42)";
    ctx.beginPath();
    ctx.ellipse(2, 5, 54, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function triggerMushroomBoost(body) {
    const fixture = body.getFixtureList();
    const mushroomData = fixture.getUserData();
    const mushroomId = mushroomData?.id;
    if (!mushroomId || mushroomCooldowns.has(mushroomId)) {
      return;
    }

    mushroomCooldowns.set(mushroomId, MUSHROOM_COOLDOWN);
    const bodyPos = body.getPosition();
    const projectilePos = projectile.getPosition();
    const angle = body.getAngle();
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rel = Vec2(projectilePos.x - bodyPos.x, projectilePos.y - bodyPos.y);
    const localX = rel.x * cos + rel.y * sin;
    const capT = clamp(localX / 0.5, -1, 1);
    const localNormal = normalize(Vec2(capT * 0.9, 1 - Math.abs(capT) * 0.14));
    let normal = Vec2(
      localNormal.x * cos - localNormal.y * sin,
      localNormal.x * sin + localNormal.y * cos
    );

    if (normal.y < 0.22) {
      normal = normalize(Vec2(normal.x * 0.35, 0.94));
    }

    const velocity = projectile.getLinearVelocity();
    const currentSpeed = length(velocity);
    const boostSpeed = Math.max(mushroomData.power, currentSpeed * (mushroomData.kind === "red" ? 1.12 : 1.04));
    projectile.setLinearVelocity(Vec2(normal.x * boostSpeed + velocity.x * 0.18, normal.y * boostSpeed + 0.6));
    projectile.setAngularVelocity(-normal.x * 10);
    projectile.setAwake(true);
    grantCoins(mushroomData.reward, bodyPos, true, "shroom");
    boosterFlash = 1;
  }

  function updateRunicStones() {
    runicStoneBodies.forEach((body) => {
      const pos = body.getPosition();
      const velocity = body.getLinearVelocity();
      if (pos.x <= LEFT_WALL + 0.34 && velocity.x < 0) {
        body.setLinearVelocity(Vec2(RUNIC_STONE_SPEED, 0));
      } else if (pos.x >= RIGHT_WALL - 0.34 && velocity.x > 0) {
        body.setLinearVelocity(Vec2(-RUNIC_STONE_SPEED, 0));
      }
    });
  }

  function updateClouds() {
    cloudBodies.forEach((body) => {
      const pos = body.getPosition();
      const velocity = body.getLinearVelocity();
      if (pos.x <= LEFT_WALL + 0.62 && velocity.x < 0) {
        body.setLinearVelocity(Vec2(CLOUD_SPEED, 0));
      } else if (pos.x >= RIGHT_WALL - 0.62 && velocity.x > 0) {
        body.setLinearVelocity(Vec2(-CLOUD_SPEED, 0));
      }
    });

    cloudCooldowns.forEach((time, key) => {
      const next = time - TIME_STEP;
      if (next <= 0) {
        cloudCooldowns.delete(key);
      } else {
        cloudCooldowns.set(key, next);
      }
    });

    branchCooldowns.forEach((time, key) => {
      const next = time - TIME_STEP;
      if (next <= 0) {
        branchCooldowns.delete(key);
      } else {
        branchCooldowns.set(key, next);
      }
    });
  }

  function updateBalloons() {
    const now = performance.now() / 1000;
    balloonBodies.forEach((body) => {
      const fixture = body.getFixtureList();
      const userData = fixture.getUserData();
      const yOffset = Math.sin(now * 0.85 + userData.phase) * 5;
      body.setTransform(Vec2(body.getPosition().x, userData.baseY + yOffset), 0);
    });
  }

  function nudgeProjectileOutOfWallPlatformTrap() {
    if (!projectile || !launched || roundEnded) {
      return;
    }

    const pos = projectile.getPosition();
    const velocity = projectile.getLinearVelocity();
    if (length(velocity) > WALL_STUCK_SPEED) {
      return;
    }

    const nearLeft = pos.x <= LEFT_WALL + PROJECTILE_RADIUS + 0.12;
    const nearRight = pos.x >= RIGHT_WALL - PROJECTILE_RADIUS - 0.12;
    if (!nearLeft && !nearRight) {
      return;
    }

    const nearPlatform = levelSegments.some((platform) => {
      const cos = Math.cos(platform.angle);
      const sin = Math.sin(platform.angle);
      const rel = Vec2(pos.x - platform.x, pos.y - platform.y);
      const localX = rel.x * cos + rel.y * sin;
      const localY = -rel.x * sin + rel.y * cos;
      return Math.abs(localX) <= platform.w * 0.25 + 0.36 && Math.abs(localY) <= 0.62;
    });

    if (!nearPlatform) {
      return;
    }

    const inward = nearLeft ? 1 : -1;
    projectile.setTransform(Vec2(pos.x + inward * 0.16, pos.y + 0.04), projectile.getAngle());
    projectile.setLinearVelocity(Vec2(inward * Math.max(3.2, Math.abs(velocity.x) + 2.1), Math.max(velocity.y, 1.15)));
    projectile.setAngularVelocity(projectile.getAngularVelocity() * 0.35);
    projectile.setAwake(true);
  }

  function constrainProjectileToPlayfield() {
    if (!projectile || roundEnded) {
      return;
    }

    const pos = projectile.getPosition();
    const velocity = projectile.getLinearVelocity();
    const minX = LEFT_WALL + PROJECTILE_RADIUS;
    const maxX = RIGHT_WALL - PROJECTILE_RADIUS;
    const clampedX = clamp(pos.x, minX, maxX);
    const clampedY = Math.min(pos.y, LEVEL_TOP);
    const hitSide = clampedX !== pos.x;
    const hitTop = clampedY !== pos.y;

    if (!hitSide && !hitTop) {
      return;
    }

    projectile.setTransform(Vec2(clampedX, clampedY), projectile.getAngle());
    projectile.setLinearVelocity(Vec2(
      hitSide ? -velocity.x * WALL_RESTITUTION : velocity.x,
      hitTop ? Math.min(velocity.y, -1.5) : velocity.y
    ));
  }

  function triggerBalloonBounce(body) {
    const gameplayConfig = getGameplayConfig();
    const velocity = projectile.getLinearVelocity();
    const projectilePos = projectile.getPosition();
    const balloonPos = body.getPosition();
    const normal = normalize(Vec2(projectilePos.x - balloonPos.x, projectilePos.y - balloonPos.y));
    const speed = Math.max(length(velocity), DROP_START_SPEED * 0.9) * gameplayConfig.balloonBounceMultiplier;
    projectile.setLinearVelocity(Vec2(normal.x * speed + velocity.x * 0.12, normal.y * speed + velocity.y * 0.08));
    projectile.setAngularVelocity(-normal.x * 8);
    projectile.setAwake(true);
  }

  function triggerRunicStoneBounce(body) {
    const gameplayConfig = getGameplayConfig();
    const velocity = projectile.getLinearVelocity();
    const stoneVelocity = body.getLinearVelocity();
    const power = gameplayConfig.stoneBounceMultiplier;
    projectile.setLinearVelocity(Vec2(
      velocity.x * -0.32 * power + stoneVelocity.x * 1.1 * power,
      Math.min(-3.2 * power, velocity.y * 0.34 - 1.8 * power)
    ));
    projectile.setAngularVelocity(stoneVelocity.x * 1.7 * power);
    projectile.setAwake(true);
  }

  function triggerCloudDrag(body) {
    const fixture = body.getFixtureList();
    const cloudData = fixture.getUserData();
    const cloudId = cloudData?.id;
    if (!cloudId || cloudCooldowns.has(cloudId)) {
      return;
    }
    if (startCloudGraceActive && cloudId === startCloudId) {
      return;
    }

    const gameplayConfig = getGameplayConfig();
    const gain = gameplayConfig.cloudMultiplier;
    cloudCooldowns.set(cloudId, CLOUD_COOLDOWN);
    multiplier += gain;
    floatingTexts.push({
      x: body.getPosition().x,
      y: body.getPosition().y + 0.2,
      value: `+${gain}x`,
      life: 0.7,
      color: "#ffffff",
      scale: 0.9 + Math.min(0.45, gain * 0.04),
    });
  }

  function triggerBranchDrag(body) {
    const fixture = body.getFixtureList();
    const branchData = fixture.getUserData();
    const branchId = branchData?.id;
    if (!branchId || branchCooldowns.has(branchId)) {
      return;
    }

    branchCooldowns.set(branchId, 0.24);
    branchShakeStates.set(branchId, {
      time: 0.58,
      duration: 0.58,
    });
    const velocity = projectile.getLinearVelocity();
    projectile.setLinearVelocity(Vec2(velocity.x * 0.34, velocity.y * 0.34));
    projectile.setAngularVelocity(projectile.getAngularVelocity() * 0.4);
    spawnBranchLeaves(body.getPosition(), branchData.side);
    floatingTexts.push({
      x: body.getPosition().x,
      y: body.getPosition().y + 0.2,
      value: "SLOW",
      life: 0.7,
      color: "#d5ffd0",
      scale: 0.88,
    });
  }

  function spawnBranchLeaves(position, side) {
    const sideSign = side === "right" ? -1 : 1;
    for (let i = 0; i < 9; i += 1) {
      branchLeaves.push({
        x: position.x + sideSign * (0.5 + Math.random() * 0.5),
        y: position.y + 0.1 + (Math.random() - 0.5) * 0.8,
        vx: sideSign * (0.35 + Math.random() * 0.6),
        vy: 0.55 + Math.random() * 1.4,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 8,
        size: 3 + Math.random() * 3,
        life: 0.8 + Math.random() * 0.45,
        maxLife: 1.25,
        color: Math.random() > 0.45 ? "#90cf61" : "#6fb249",
      });
    }
  }

  function loadSprites(paths) {
    return Object.fromEntries(
      Object.entries(paths).map(([key, src]) => {
        const image = new Image();
        image.src = src;
        return [key, image];
      })
    );
  }

  function drawSpriteBody(image, position, angle, width, height) {
    ctx.save();
    ctx.translate(worldToScreenX(position.x), worldToScreenY(position.y));
    ctx.rotate(-angle);
    drawImageCentered(image, 0, 0, width, height);
    ctx.restore();
  }

  function drawImageCentered(image, x, y, width, height) {
    const dimensions = resolveDrawSize(image, width, height);
    const drawX = snapPixel(x - dimensions.width * 0.5);
    const drawY = snapPixel(y - dimensions.height * 0.5);
    const drawWidth = snapSize(dimensions.width);
    const drawHeight = snapSize(dimensions.height);
    if (image && image.complete && image.naturalWidth) {
      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      return;
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.beginPath();
    ctx.roundRect(
      drawX,
      drawY,
      drawWidth,
      drawHeight,
      Math.min(12, drawWidth * 0.25)
    );
    ctx.fill();
  }

  function drawImageAnchored(image, x, y, width, height, anchorXRatio, anchorYRatio) {
    const dimensions = resolveDrawSize(image, width, height);
    const drawX = snapPixel(x - dimensions.width * anchorXRatio);
    const drawY = snapPixel(y - dimensions.height * anchorYRatio);
    const drawWidth = snapSize(dimensions.width);
    const drawHeight = snapSize(dimensions.height);
    if (image && image.complete && image.naturalWidth) {
      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      return;
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.beginPath();
    ctx.roundRect(drawX, drawY, drawWidth, drawHeight, Math.min(12, drawWidth * 0.25));
    ctx.fill();
  }

  function drawWorldAnchoredSprite(image, position, width, height, anchorXRatio, anchorYRatio) {
    ctx.save();
    ctx.translate(worldToScreenX(position.x), worldToScreenY(position.y));
    drawImageAnchored(image, 0, 0, width, height, anchorXRatio, anchorYRatio);
    ctx.restore();
  }

  function resolveDrawSize(image, width, height) {
    if (width && height) {
      return { width, height };
    }

    if (image && image.complete && image.naturalWidth && image.naturalHeight) {
      if (height) {
        return {
          width: height * (image.naturalWidth / image.naturalHeight),
          height,
        };
      }
      if (width) {
        return {
          width,
          height: width * (image.naturalHeight / image.naturalWidth),
        };
      }
    }

    return {
      width: width || height || 32,
      height: height || width || 32,
    };
  }

  function platformSurfacePoint(platform, offset, lift) {
    const tangent = Vec2(Math.cos(platform.angle), Math.sin(platform.angle));
    const normal = Vec2(-Math.sin(platform.angle), Math.cos(platform.angle));
    return Vec2(
      platform.x + tangent.x * offset + normal.x * (PLATFORM_HALF_HEIGHT + lift),
      platform.y + tangent.y * offset + normal.y * (PLATFORM_HALF_HEIGHT + lift)
    );
  }

  function screenToWorld(event) {
    const point = screenToCanvasPoint(event);
    const x = point.x;
    const y = point.y;
    return Vec2(x / SCALE, cameraY + VIEW_H_METERS * 0.5 - y / SCALE);
  }

  function screenToCanvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEW_W,
      y: ((event.clientY - rect.top) / rect.height) * VIEW_H,
    };
  }

  function worldToScreenX(x) {
    return x * SCALE;
  }

  function worldToScreenY(y) {
    return VIEW_H - (y - (cameraY - VIEW_H_METERS * 0.5)) * SCALE;
  }

  function clampDrag(point) {
    const delta = Vec2(point.x - ANCHOR.x, point.y - ANCHOR.y);
    const dist = length(delta);
    const safeDist = Math.max(dist, 0.0001);
    const factor = Math.min(1, MAX_STRETCH / safeDist);
    const clamped = Vec2(ANCHOR.x + delta.x * factor, ANCHOR.y + delta.y * factor);
    clamped.x = clamp(clamped.x, LEFT_WALL + 0.45, RIGHT_WALL - 0.45);
    clamped.y = clamp(clamped.y, ANCHOR.y - MAX_STRETCH, ANCHOR.y + 0.15);
    return clamped;
  }

  function rotatePoint(localX, localY, angle, origin) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: origin.x + localX * cos - localY * sin,
      y: origin.y + localX * sin + localY * cos,
    };
  }

  function length(vec) {
    return Math.hypot(vec.x, vec.y);
  }

  function normalize(vec) {
    const len = length(vec) || 1;
    return Vec2(vec.x / len, vec.y / len);
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function clampIndex(value, min, max) {
    return Math.max(min, Math.min(max, Math.round(value)));
  }

  function snapPixel(value) {
    return Math.round(value);
  }

  function snapSize(value) {
    return Math.max(1, Math.round(value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInQuad(t) {
    return t * t;
  }

  function mixColor(startHex, endHex, t) {
    const start = hexToRgb(startHex);
    const end = hexToRgb(endHex);
    const r = Math.round(start.r + (end.r - start.r) * t);
    const g = Math.round(start.g + (end.g - start.g) * t);
    const b = Math.round(start.b + (end.b - start.b) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    const value = parseInt(clean, 16);
    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255,
    };
  }
})();
