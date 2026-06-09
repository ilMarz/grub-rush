"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { Vector3 } from "three";
import { GlbCharacter } from "./GlbCharacter";
import styles from "./CollectGame.module.css";

type GameStatus = "ready" | "playing" | "paused";
type Direction = "up" | "down" | "left" | "right";
type CollectibleKind = "coin" | "crystal" | "gift" | "star";

type Collectible = {
  id: number;
  kind: CollectibleKind;
  x: number;
  z: number;
  phase: number;
  color: string;
};

type NpcPlayer = {
  id: number;
  name: string;
  x: number;
  z: number;
  facing: number;
  score: number;
  color: string;
  kind: NpcKind;
};

type InputState = {
  x: number;
  z: number;
};

type SceneryItem = {
  id: string;
  x: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  rotation: number;
  color: string;
  blocksMovement: boolean;
};

type PlayerBrick = SceneryItem & {
  expiresAt: number;
};

type NpcKind = "adventurer" | "king" | "farmer" | "hoodie";

type CollectParticle = {
  id: number;
  x: number;
  z: number;
  color: string;
  startTime: number;
};

const arenaSize = 42;
const playerSpeed = 11.2;
const npcSpeed = 5.8;
const collectDistance = 1.55;
const maxCollectibles = 9;
const maxNpcs = 4;
const maxPlayerBricks = 5;
const brickCooldownSeconds = 3.2;
const brickLifetimeSeconds = 14;
const brickPlaceDistance = 1.85;
const brickWidth = 2.35;
const brickHeight = 0.9;
const brickDepth = 1.05;

export default function CollectGame() {
  const inputRef = useRef<InputState>({ x: 0, z: 0 });
  const brickRequestRef = useRef(0);
  const [status, setStatus] = useState<GameStatus>("ready");
  const [score, setScore] = useState(0);
  const [collected, setCollected] = useState(0);
  const [npcScores, setNpcScores] = useState<NpcPlayer[]>([]);
  const [timeLeft, setTimeLeft] = useState(90);
  const [brickHud, setBrickHud] = useState({ available: maxPlayerBricks, cooldown: 0 });
  const [restartToken, setRestartToken] = useState(0);

  const startGame = useCallback(() => {
    inputRef.current = { x: 0, z: 0 };
    brickRequestRef.current = 0;
    setScore(0);
    setCollected(0);
    setNpcScores([]);
    setTimeLeft(90);
    setBrickHud({ available: maxPlayerBricks, cooldown: 0 });
    setStatus("playing");
    setRestartToken((value) => value + 1);
  }, []);

  const setDirection = useCallback((direction: Direction, active: boolean) => {
    const next = { ...inputRef.current };
    const value = active ? 1 : 0;

    if (direction === "left") {
      next.x = active ? -1 : next.x < 0 ? 0 : next.x;
    }
    if (direction === "right") {
      next.x = active ? 1 : next.x > 0 ? 0 : next.x;
    }
    if (direction === "up") {
      next.z = active ? -1 : next.z < 0 ? 0 : next.z;
    }
    if (direction === "down") {
      next.z = value;
    }

    inputRef.current = next;
  }, []);

  const requestBrick = useCallback(() => {
    if (status !== "playing") {
      return;
    }

    brickRequestRef.current += 1;
  }, [status]);

  useEffect(() => {
    if (status !== "playing") {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setStatus("paused");
          inputRef.current = { x: 0, z: 0 };
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (status !== "playing") {
        return;
      }

      if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
        setDirection("up", true);
      }
      if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
        setDirection("down", true);
      }
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        setDirection("left", true);
      }
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        setDirection("right", true);
      }
      if ((event.key === " " || event.key.toLowerCase() === "e") && !event.repeat) {
        event.preventDefault();
        requestBrick();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
        setDirection("up", false);
      }
      if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
        setDirection("down", false);
      }
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        setDirection("left", false);
      }
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        setDirection("right", false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [requestBrick, setDirection, status]);

  return (
    <main className={styles.shell}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          fov: 52,
          position: [0, 13, 17]
        }}
        className={styles.canvas}
      >
        <Suspense fallback={null}>
          <CollectScene
            brickRequestRef={brickRequestRef}
            inputRef={inputRef}
            restartToken={restartToken}
            status={status}
            onBrickHudChange={setBrickHud}
            onNpcScoresChange={setNpcScores}
            onCollect={() => {
              setCollected((value) => value + 1);
              setScore((value) => value + 100);
            }}
          />
        </Suspense>
        <EffectComposer>
          <Bloom intensity={1.4} luminanceThreshold={0.15} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette offset={0.38} darkness={0.6} />
        </EffectComposer>
      </Canvas>

      <section className={styles.hud} aria-label="Game status">
        <div>
          <span>Score</span>
          <strong>{score}</strong>
        </div>
        <div>
          <span>Items</span>
          <strong>{collected}</strong>
        </div>
        <div>
          <span>Bricks</span>
          <strong>
            {brickHud.cooldown > 0 ? `${brickHud.cooldown}s` : brickHud.available}
          </strong>
        </div>
      </section>

      <section className={styles.timer} aria-label="Time left">
        <span>Time</span>
        <strong>{timeLeft}s</strong>
      </section>

      <section className={styles.leaderboard} aria-label="Leaderboard">
        <span>Leaderboard</span>
        <strong>You: {score}</strong>
        {npcScores.map((npc) => (
          <p key={npc.id}>
            {npc.name}: {npc.score}
          </p>
        ))}
      </section>

      {status !== "playing" ? (
        <section className={styles.overlay} aria-live="polite">
          <div className={styles.panel}>
            <p>Grab Rush</p>
            <h1>{status === "ready" ? "Collect the cosmic prizes" : "Time is up"}</h1>
            <span>Use the D-pad or WASD to move. Tap Brick or press E/Space to block rivals.</span>
            <button type="button" onClick={startGame}>
              {status === "ready" ? "Start" : "Restart"}
            </button>
          </div>
        </section>
      ) : null}

      {status === "playing" ? (
        <>
          <section className={styles.controlsLeft} aria-label="Brick control">
            <button
              aria-label="Place brick"
              className={styles.brickButton}
              type="button"
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                requestBrick();
              }}
            >
              Brick
            </button>
          </section>
          <section className={styles.controlsRight} aria-label="Movement controls">
            <HoldButton direction="up" label="Forward" onHold={(active) => setDirection("up", active)} />
            <div className={styles.controlRow}>
              <HoldButton direction="left" label="Left" onHold={(active) => setDirection("left", active)} />
              <HoldButton direction="down" label="Back" onHold={(active) => setDirection("down", active)} />
              <HoldButton direction="right" label="Right" onHold={(active) => setDirection("right", active)} />
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}

function HoldButton({
  direction,
  label,
  onHold
}: {
  direction: Direction;
  label: string;
  onHold: (active: boolean) => void;
}) {
  return (
    <button
      aria-label={label}
      className={styles.controlButton}
      type="button"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        onHold(true);
      }}
      onPointerUp={(event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        onHold(false);
      }}
      onPointerCancel={() => onHold(false)}
      onPointerLeave={() => onHold(false)}
    >
      <span className={`${styles.controlIcon} ${styles[direction]}`} aria-hidden="true" />
    </button>
  );
}

function CollectScene({
  brickRequestRef,
  inputRef,
  restartToken,
  status,
  onBrickHudChange,
  onNpcScoresChange,
  onCollect
}: {
  brickRequestRef: React.MutableRefObject<number>;
  inputRef: React.MutableRefObject<InputState>;
  restartToken: number;
  status: GameStatus;
  onBrickHudChange: (hud: { available: number; cooldown: number }) => void;
  onNpcScoresChange: (scores: NpcPlayer[]) => void;
  onCollect: () => void;
}) {
  const playerRef = useRef<Group>(null);
  const npcRefs = useRef(new Map<number, Group>());
  const playerPositionRef = useRef(new Vector3(0, 0, 0));
  const facingRef = useRef(0);
  const collectiblesRef = useRef<Collectible[]>([]);
  const npcsRef = useRef<NpcPlayer[]>([]);
  const playerBricksRef = useRef<PlayerBrick[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [npcs, setNpcs] = useState<NpcPlayer[]>([]);
  const [playerBricks, setPlayerBricks] = useState<PlayerBrick[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  const isMovingRef = useRef(false);
  const collectParticlesRef = useRef<CollectParticle[]>([]);
  const [collectParticles, setCollectParticles] = useState<CollectParticle[]>([]);
  const cameraTargetRef = useRef(new Vector3());
  const nextIdRef = useRef(1);
  const nextNpcIdRef = useRef(1);
  const nextBrickIdRef = useRef(1);
  const spawnClockRef = useRef(0);
  const npcSpawnClockRef = useRef(0);
  const lastBrickTimeRef = useRef(-brickCooldownSeconds);
  const handledBrickRequestRef = useRef(0);
  const brickHudRef = useRef({ available: maxPlayerBricks, cooldown: 0 });
  const { camera } = useThree();

  const scenery = useMemo(() => createScenery(), []);
  const obstacles = useMemo(
    () => scenery.filter((item) => item.blocksMovement),
    [scenery]
  );

  useEffect(() => {
    playerPositionRef.current.set(0, 0, 0);
    facingRef.current = 0;
    isMovingRef.current = false;
    setIsMoving(false);
    nextIdRef.current = 1;
    nextNpcIdRef.current = 1;
    nextBrickIdRef.current = 1;
    spawnClockRef.current = 0;
    npcSpawnClockRef.current = 0;
    lastBrickTimeRef.current = -brickCooldownSeconds;
    handledBrickRequestRef.current = brickRequestRef.current;
    const initial = Array.from({ length: 6 }, () => createCollectible(nextIdRef));
    const initialNpcs = [createNpc(nextNpcIdRef, 12, -12), createNpc(nextNpcIdRef, -12, 12)];
    playerBricksRef.current = [];
    collectiblesRef.current = initial;
    npcsRef.current = initialNpcs;
    setCollectibles(initial);
    setNpcs(initialNpcs);
    setPlayerBricks([]);
    const initialBrickHud = { available: maxPlayerBricks, cooldown: 0 };
    brickHudRef.current = initialBrickHud;
    onBrickHudChange(initialBrickHud);
    onNpcScoresChange(initialNpcs);
  }, [brickRequestRef, onBrickHudChange, onNpcScoresChange, restartToken]);

  useFrame(({ clock }, delta) => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    if (status === "playing") {
      const elapsed = clock.elapsedTime;
      const activeBricks = playerBricksRef.current.filter((brick) => brick.expiresAt > elapsed);
      if (activeBricks.length !== playerBricksRef.current.length) {
        playerBricksRef.current = activeBricks;
        setPlayerBricks(activeBricks);
      }

      if (brickRequestRef.current !== handledBrickRequestRef.current) {
        handledBrickRequestRef.current = brickRequestRef.current;
        const nextBrick = createPlayerBrick({
          elapsed,
          existingBricks: activeBricks,
          facing: facingRef.current,
          lastBrickTime: lastBrickTimeRef.current,
          nextBrickIdRef,
          playerPosition: playerPositionRef.current,
          staticObstacles: obstacles
        });

        if (nextBrick) {
          lastBrickTimeRef.current = elapsed;
          const nextBricks = [...activeBricks, nextBrick];
          playerBricksRef.current = nextBricks;
          setPlayerBricks(nextBricks);
        }
      }

      const currentObstacles = [...obstacles, ...playerBricksRef.current];
      const input = inputRef.current;
      const length = Math.hypot(input.x, input.z);
      const nextIsMoving = length > 0;

      if (nextIsMoving !== isMovingRef.current) {
        isMovingRef.current = nextIsMoving;
        setIsMoving(nextIsMoving);
      }

      if (length > 0) {
        const directionX = input.x / length;
        const directionZ = input.z / length;
        playerPositionRef.current.copy(
          moveWithCollisions(
            playerPositionRef.current,
            directionX * playerSpeed * delta,
            directionZ * playerSpeed * delta,
            currentObstacles,
            0.72
          )
        );
        facingRef.current = Math.atan2(directionX, directionZ);
      }

      const limit = arenaSize / 2 - 1.2;
      playerPositionRef.current.x = Math.max(-limit, Math.min(limit, playerPositionRef.current.x));
      playerPositionRef.current.z = Math.max(-limit, Math.min(limit, playerPositionRef.current.z));

      let npcScoresChanged = false;
      const updatedNpcs = npcsRef.current.map((npc) =>
        moveNpc(npc, collectiblesRef.current, currentObstacles, delta)
      );

      const nextParticles = collectParticlesRef.current.filter(p => elapsed - p.startTime < 0.7);
      let particlesChanged = nextParticles.length !== collectParticlesRef.current.length;

      const remaining = collectiblesRef.current.filter((item) => {
        const distance = Math.hypot(
          item.x - playerPositionRef.current.x,
          item.z - playerPositionRef.current.z
        );

        if (distance < collectDistance) {
          onCollect();
          nextParticles.push({ id: nextIdRef.current++, x: item.x, z: item.z, color: item.color, startTime: elapsed });
          particlesChanged = true;
          return false;
        }

        for (const npc of updatedNpcs) {
          if (Math.hypot(item.x - npc.x, item.z - npc.z) < collectDistance) {
            npc.score += 100;
            npcScoresChanged = true;
            return false;
          }
        }

        return true;
      });

      if (particlesChanged) {
        collectParticlesRef.current = nextParticles;
        setCollectParticles([...nextParticles]);
      }

      spawnClockRef.current += delta;
      npcSpawnClockRef.current += delta;
      while (remaining.length < maxCollectibles && spawnClockRef.current > 0.55) {
        spawnClockRef.current -= 0.55;
        remaining.push(createCollectible(nextIdRef, playerPositionRef.current));
      }

      if (updatedNpcs.length < maxNpcs && npcSpawnClockRef.current > 12) {
        npcSpawnClockRef.current = 0;
        updatedNpcs.push(createNpc(nextNpcIdRef));
        npcScoresChanged = true;
      }

      npcsRef.current = updatedNpcs;

      if (remaining.length !== collectiblesRef.current.length) {
        collectiblesRef.current = remaining;
        setCollectibles(remaining);
      }

      if (npcScoresChanged || updatedNpcs.length !== npcs.length) {
        setNpcs([...updatedNpcs]);
        onNpcScoresChange([...updatedNpcs]);
      }

      const cooldown = Math.max(
        0,
        Math.ceil(brickCooldownSeconds - (elapsed - lastBrickTimeRef.current))
      );
      const nextBrickHud = {
        available: Math.max(0, maxPlayerBricks - playerBricksRef.current.length),
        cooldown
      };
      if (
        nextBrickHud.available !== brickHudRef.current.available ||
        nextBrickHud.cooldown !== brickHudRef.current.cooldown
      ) {
        brickHudRef.current = nextBrickHud;
        onBrickHudChange(nextBrickHud);
      }
    } else if (isMovingRef.current) {
      isMovingRef.current = false;
      setIsMoving(false);
    }

    player.position.copy(playerPositionRef.current);
    player.rotation.y = facingRef.current;

    for (const npc of npcsRef.current) {
      const npcGroup = npcRefs.current.get(npc.id);
      if (npcGroup) {
        npcGroup.position.set(npc.x, 0, npc.z);
        npcGroup.rotation.y = npc.facing;
      }
    }

    cameraTargetRef.current.set(
      playerPositionRef.current.x,
      0.8,
      playerPositionRef.current.z
    );
    camera.position.lerp(
      new Vector3(
        playerPositionRef.current.x,
        12,
        playerPositionRef.current.z + 15
      ),
      0.08
    );
    camera.lookAt(cameraTargetRef.current);
  });

  return (
    <>
      <color attach="background" args={["#21124a"]} />
      <fog attach="fog" args={["#21124a", 42, 160]} />
      <ambientLight intensity={1.08} />
      <hemisphereLight args={["#9efcff", "#6d28d9", 1.35]} />
      <directionalLight
        castShadow
        intensity={2.6}
        position={[10, 20, 10]}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
      />
      <pointLight color="#ff8bd6" intensity={2.3} distance={36} position={[-14, 8, -10]} />
      <pointLight color="#63e6ff" intensity={2.1} distance={32} position={[16, 7, 12]} />
      <Starfield />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[arenaSize, arenaSize]} />
        <meshStandardMaterial color="#3b2a86" emissive="#140f3f" emissiveIntensity={0.18} roughness={0.78} />
      </mesh>

      <PulsingRings />

      {scenery.map((item) => (
        <ObstacleMesh key={item.id} item={item} />
      ))}

      {playerBricks.map((item) => (
        <BrickObstacleMesh key={item.id} item={item} />
      ))}

      {collectibles.map((item) => (
        <CollectibleMesh key={item.id} item={item} />
      ))}

      {collectParticles.map((p) => (
        <CollectParticleBurst key={p.id} particle={p} />
      ))}

      {npcs.map((npc) => (
        <group
          key={npc.id}
          ref={(group) => {
            if (group) {
              npcRefs.current.set(npc.id, group);
            } else {
              npcRefs.current.delete(npc.id);
            }
          }}
          position={[npc.x, 0, npc.z]}
          rotation={[0, npc.facing, 0]}
        >
          <NpcCharacter kind={npc.kind} />
        </group>
      ))}

      <group ref={playerRef}>
        <PlayerCharacter isMoving={isMoving} />
        <pointLight color="#facc15" intensity={1.2} distance={4} position={[0, 1.5, 0]} />
      </group>
    </>
  );
}

function PulsingRings() {
  const outerRef = useRef<Mesh>(null);
  const innerRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (outerRef.current) {
      (outerRef.current.material as MeshStandardMaterial).emissiveIntensity = 0.07 + Math.sin(t * 1.3) * 0.05;
    }
    if (innerRef.current) {
      (innerRef.current.material as MeshStandardMaterial).emissiveIntensity = 0.1 + Math.sin(t * 1.9 + 1.1) * 0.06;
    }
  });

  return (
    <>
      <mesh ref={outerRef} receiveShadow position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[arenaSize * 0.35, arenaSize * 0.49, 96]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.07} roughness={0.6} />
      </mesh>
      <mesh ref={innerRef} receiveShadow position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[arenaSize * 0.12, arenaSize * 0.18, 72]} />
        <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={0.32} roughness={0.5} />
      </mesh>
    </>
  );
}

function CollectParticleBurst({ particle }: { particle: CollectParticle }) {
  const meshRefs = useRef<(Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const age = clock.elapsedTime - particle.startTime;
    const t = Math.min(age / 0.65, 1);
    const radius = 0.15 + t * 1.2;
    const opacity = t < 0.3 ? 1 : Math.max(0, 1 - (t - 0.3) / 0.7);
    const y = 0.85 + t * 1.8;

    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const angle = (i / 7) * Math.PI * 2;
      mesh.position.set(
        particle.x + Math.cos(angle) * radius,
        y,
        particle.z + Math.sin(angle) * radius
      );
      const mat = mesh.material as MeshStandardMaterial;
      mat.opacity = opacity;
      mat.emissiveIntensity = opacity * 1.5;
    });
  });

  return (
    <>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} ref={(el) => { meshRefs.current[i] = el; }} position={[particle.x, 0.85, particle.z]}>
          <sphereGeometry args={[0.11, 6, 4]} />
          <meshStandardMaterial
            color={particle.color}
            emissive={particle.color}
            emissiveIntensity={1.5}
            transparent
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}

function Starfield() {
  const groupRef = useRef<Group>(null);
  const planetRef = useRef<Mesh>(null);
  const moonRef = useRef<Mesh>(null);
  const starRefs = useRef<Map<number, Mesh>>(new Map());

  const stars = useMemo(
    () =>
      Array.from({ length: 160 }, (_, index) => ({
        id: index,
        color: ["#ffffff", "#ffffff", "#fde68a", "#a5f3fc", "#f0abfc", "#ffffff"][index % 6],
        baseScale: randomBetween(0.04, 0.16),
        phase: randomBetween(0, Math.PI * 2),
        speed: randomBetween(0.6, 2.2),
        x: randomBetween(-48, 48),
        y: randomBetween(7, 28),
        z: randomBetween(-52, 32)
      })),
    []
  );

  const sparkles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        id: index,
        color: ["#ffffff", "#fde68a", "#a5f3fc", "#f0abfc"][index % 4],
        baseScale: randomBetween(0.18, 0.32),
        phase: randomBetween(0, Math.PI * 2),
        speed: randomBetween(1.2, 3.0),
        x: randomBetween(-44, 44),
        y: randomBetween(9, 24),
        z: randomBetween(-48, 28)
      })),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (groupRef.current) groupRef.current.rotation.y = t * 0.004;
    if (planetRef.current) {
      planetRef.current.rotation.y = t * 0.09;
      planetRef.current.rotation.x = t * 0.03;
    }
    if (moonRef.current) moonRef.current.rotation.y = t * 0.14;

    starRefs.current.forEach((mesh, id) => {
      const star = id < 160 ? stars[id] : sparkles[id - 160];
      if (!star) return;
      const twinkle = 0.55 + 0.45 * Math.sin(t * star.speed + star.phase);
      mesh.scale.setScalar(star.baseScale * twinkle);
    });
  });

  return (
    <group ref={groupRef}>
      {stars.map((star) => (
        <mesh
          key={star.id}
          ref={(el) => { if (el) starRefs.current.set(star.id, el); }}
          position={[star.x, star.y, star.z]}
          scale={star.baseScale}
        >
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial color={star.color} />
        </mesh>
      ))}

      {sparkles.map((spark) => (
        <group
          key={spark.id}
          ref={(el) => { if (el) { const m = el.children[0] as Mesh; if (m) starRefs.current.set(160 + spark.id, m); } }}
          position={[spark.x, spark.y, spark.z]}
        >
          <mesh scale={spark.baseScale}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color={spark.color} emissive={spark.color} emissiveIntensity={1.8} toneMapped={false} />
          </mesh>
          <mesh scale={[spark.baseScale * 0.08, spark.baseScale * 2.2, spark.baseScale * 0.08]}>
            <boxGeometry />
            <meshBasicMaterial color={spark.color} transparent opacity={0.6} />
          </mesh>
          <mesh scale={[spark.baseScale * 2.2, spark.baseScale * 0.08, spark.baseScale * 0.08]}>
            <boxGeometry />
            <meshBasicMaterial color={spark.color} transparent opacity={0.6} />
          </mesh>
        </group>
      ))}

      {/* Pink planet with ring */}
      <mesh ref={planetRef} position={[-17, 6, -22]} rotation={[0.35, 0.2, -0.4]}>
        <sphereGeometry args={[2.7, 32, 16]} />
        <meshStandardMaterial color="#fb7185" emissive="#fb2055" emissiveIntensity={0.35} roughness={0.45} />
      </mesh>
      <mesh position={[-17, 6, -22]} rotation={[1.15, 0.25, -0.2]}>
        <torusGeometry args={[4.1, 0.08, 10, 72]} />
        <meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={0.15} roughness={0.4} />
      </mesh>

      {/* Blue moon */}
      <mesh ref={moonRef} position={[18, 5, -20]}>
        <sphereGeometry args={[1.8, 24, 14]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.3} roughness={0.48} />
      </mesh>

      {/* Large purple gas giant with ring */}
      <mesh position={[28, 4, -26]} rotation={[0.1, 0.4, 0.2]}>
        <sphereGeometry args={[5.2, 32, 18]} />
        <meshStandardMaterial color="#7c3aed" emissive="#4c1d95" emissiveIntensity={0.25} roughness={0.6} />
      </mesh>
      <mesh position={[28, 4, -26]} rotation={[0.6, 0.1, -0.3]}>
        <torusGeometry args={[7.4, 0.14, 8, 80]} />
        <meshStandardMaterial color="#a78bfa" emissive="#6d28d9" emissiveIntensity={0.3} roughness={0.4} />
      </mesh>

      {/* Teal planet */}
      <mesh position={[-30, 3, -24]} rotation={[0.2, 0.6, 0.1]}>
        <sphereGeometry args={[1.6, 24, 14]} />
        <meshStandardMaterial color="#2dd4bf" emissive="#0d9488" emissiveIntensity={0.28} roughness={0.5} />
      </mesh>

      {/* Orange planet */}
      <mesh position={[6, 3, -28]} rotation={[0.3, 0.2, -0.1]}>
        <sphereGeometry args={[3.8, 28, 16]} />
        <meshStandardMaterial color="#fb923c" emissive="#c2410c" emissiveIntensity={0.22} roughness={0.55} />
      </mesh>

      {/* White moon near orange */}
      <mesh position={[12, 5, -26]}>
        <sphereGeometry args={[0.9, 16, 10]} />
        <meshStandardMaterial color="#f1f5f9" emissive="#94a3b8" emissiveIntensity={0.2} roughness={0.7} />
      </mesh>

      {/* Lime green small planet */}
      <mesh position={[-8, 2, -26]}>
        <sphereGeometry args={[1.1, 20, 12]} />
        <meshStandardMaterial color="#86efac" emissive="#14532d" emissiveIntensity={0.22} roughness={0.5} />
      </mesh>

      {/* Deep red far planet */}
      <mesh position={[-22, 2, -30]} rotation={[0.1, 0.3, 0.1]}>
        <sphereGeometry args={[2.2, 24, 14]} />
        <meshStandardMaterial color="#ef4444" emissive="#7f1d1d" emissiveIntensity={0.2} roughness={0.6} />
      </mesh>

      {/* Tiny icy planet far right */}
      <mesh position={[36, 3, -28]}>
        <sphereGeometry args={[1.0, 18, 12]} />
        <meshStandardMaterial color="#bae6fd" emissive="#075985" emissiveIntensity={0.22} roughness={0.45} />
      </mesh>

      {/* Gold dwarf far left */}
      <mesh position={[-38, 4, -26]}>
        <sphereGeometry args={[1.3, 20, 12]} />
        <meshStandardMaterial color="#fbbf24" emissive="#78350f" emissiveIntensity={0.2} roughness={0.5} />
      </mesh>

      {/* Nebula clouds back */}
      <mesh position={[-6, 1, -32]}>
        <sphereGeometry args={[16, 16, 10]} />
        <meshBasicMaterial color="#4c1d95" transparent opacity={0.07} depthWrite={false} />
      </mesh>
      <mesh position={[20, 2, -30]}>
        <sphereGeometry args={[12, 16, 10]} />
        <meshBasicMaterial color="#164e63" transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <mesh position={[-24, 1, -28]}>
        <sphereGeometry args={[10, 14, 8]} />
        <meshBasicMaterial color="#1e1b4b" transparent opacity={0.09} depthWrite={false} />
      </mesh>

      {/* === SIDE PLANETS === */}

      {/* Right side — cyan large */}
      <mesh position={[42, 5, -8]} rotation={[0.2, 0.1, 0.3]}>
        <sphereGeometry args={[4.0, 28, 16]} />
        <meshStandardMaterial color="#22d3ee" emissive="#0e7490" emissiveIntensity={0.25} roughness={0.5} />
      </mesh>
      <mesh position={[42, 5, -8]} rotation={[0.5, 0.2, -0.4]}>
        <torusGeometry args={[5.8, 0.11, 8, 72]} />
        <meshStandardMaterial color="#a5f3fc" emissive="#0e7490" emissiveIntensity={0.2} roughness={0.4} />
      </mesh>

      {/* Right side — small magenta */}
      <mesh position={[38, 3, 6]}>
        <sphereGeometry args={[1.2, 20, 12]} />
        <meshStandardMaterial color="#e879f9" emissive="#701a75" emissiveIntensity={0.25} roughness={0.5} />
      </mesh>

      {/* Right side — warm yellow dwarf */}
      <mesh position={[44, 4, -20]}>
        <sphereGeometry args={[1.8, 20, 12]} />
        <meshStandardMaterial color="#fde68a" emissive="#92400e" emissiveIntensity={0.18} roughness={0.55} />
      </mesh>

      {/* Left side — large violet */}
      <mesh position={[-42, 4, -10]} rotation={[0.15, 0.5, 0.2]}>
        <sphereGeometry args={[3.5, 28, 16]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#3b0764" emissiveIntensity={0.22} roughness={0.55} />
      </mesh>

      {/* Left side — small coral */}
      <mesh position={[-38, 3, 4]}>
        <sphereGeometry args={[1.0, 18, 12]} />
        <meshStandardMaterial color="#f97316" emissive="#7c2d12" emissiveIntensity={0.2} roughness={0.5} />
      </mesh>

      {/* Left side — icy far */}
      <mesh position={[-46, 5, -18]}>
        <sphereGeometry args={[2.4, 22, 14]} />
        <meshStandardMaterial color="#e0f2fe" emissive="#0369a1" emissiveIntensity={0.2} roughness={0.6} />
      </mesh>

      {/* Nebula side right */}
      <mesh position={[40, 2, 0]}>
        <sphereGeometry args={[14, 14, 8]} />
        <meshBasicMaterial color="#083344" transparent opacity={0.08} depthWrite={false} />
      </mesh>

      {/* Nebula side left */}
      <mesh position={[-40, 2, -4]}>
        <sphereGeometry args={[13, 14, 8]} />
        <meshBasicMaterial color="#1e1b4b" transparent opacity={0.08} depthWrite={false} />
      </mesh>
    </group>
  );
}

function ObstacleMesh({ item }: { item: SceneryItem }) {
  return (
    <mesh
      castShadow
      receiveShadow
      position={[item.x, item.height / 2, item.z]}
      rotation={[0, item.rotation, 0]}
    >
      <boxGeometry args={[item.width, item.height, item.depth]} />
      <meshStandardMaterial color={item.color} emissive="#180f3d" roughness={0.78} />
    </mesh>
  );
}

function BrickObstacleMesh({ item }: { item: PlayerBrick }) {
  return (
    <group position={[item.x, 0, item.z]} rotation={[0, item.rotation, 0]}>
      <mesh castShadow receiveShadow position={[0, item.height / 2, 0]}>
        <boxGeometry args={[item.width, item.height, item.depth]} />
        <meshStandardMaterial color={item.color} emissive="#5b1807" roughness={0.62} />
      </mesh>
      {[-0.42, 0, 0.42].map((offset) => (
        <mesh key={offset} castShadow position={[offset, item.height + 0.04, -0.15]}>
          <boxGeometry args={[0.26, 0.12, 0.18]} />
          <meshStandardMaterial color="#ffd166" emissive="#7c2d12" roughness={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function CollectibleMesh({ item }: { item: Collectible }) {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) {
      return;
    }

    const t = clock.elapsedTime + item.phase;
    ref.current.position.y = 0.85 + Math.sin(t * 2.5) * 0.18;
    ref.current.rotation.y += 0.04;
  });

  return (
    <group ref={ref} position={[item.x, 0.85, item.z]}>
      <RecognizablePrize item={item} />
      <pointLight color={item.color} intensity={2.8} distance={7} />
    </group>
  );
}

function RecognizablePrize({ item }: { item: Collectible }) {
  if (item.kind === "coin") {
    return (
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.58, 0.58, 0.16, 44]} />
          <meshStandardMaterial color="#ffd166" emissive="#ffd166" emissiveIntensity={0.5} metalness={0.42} roughness={0.24} />
        </mesh>
        <mesh position={[0, 0.09, 0]}>
          <torusGeometry args={[0.36, 0.035, 8, 40]} />
          <meshStandardMaterial color="#fff4a8" emissive="#854d0e" metalness={0.28} roughness={0.22} />
        </mesh>
      </group>
    );
  }

  if (item.kind === "crystal") {
    return (
      <group>
        <mesh castShadow position={[0, 0.08, 0]}>
          <octahedronGeometry args={[0.68, 0]} />
          <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={0.5} metalness={0.18} roughness={0.22} />
        </mesh>
        <mesh castShadow position={[0, -0.42, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.42, 0.72, 4]} />
          <meshStandardMaterial color="#22d3ee" emissive="#164e63" roughness={0.25} />
        </mesh>
      </group>
    );
  }

  if (item.kind === "gift") {
    return (
      <group>
        <mesh castShadow>
          <boxGeometry args={[0.85, 0.62, 0.85]} />
          <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={0.45} roughness={0.42} />
        </mesh>
        <mesh castShadow position={[0, 0.01, 0]}>
          <boxGeometry args={[0.16, 0.68, 0.9]} />
          <meshStandardMaterial color="#fef08a" emissive="#854d0e" roughness={0.35} />
        </mesh>
        <mesh castShadow position={[0, 0.01, 0]}>
          <boxGeometry args={[0.9, 0.68, 0.16]} />
          <meshStandardMaterial color="#fef08a" emissive="#854d0e" roughness={0.35} />
        </mesh>
        <mesh castShadow position={[0, 0.43, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.045, 8, 18]} />
          <meshStandardMaterial color="#fef08a" emissive="#854d0e" roughness={0.32} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[0.26, 16, 10]} />
        <meshStandardMaterial color="#f0abfc" emissive="#f0abfc" emissiveIntensity={0.55} roughness={0.26} />
      </mesh>
      {[0, 1, 2, 3, 4].map((point) => {
        const angle = (point / 5) * Math.PI * 2;

        return (
          <mesh
            key={point}
            castShadow
            position={[Math.cos(angle) * 0.34, Math.sin(angle) * 0.34, 0]}
            rotation={[0, 0, angle - Math.PI / 2]}
          >
            <coneGeometry args={[0.2, 0.55, 4]} />
            <meshStandardMaterial color="#fde68a" emissive="#713f12" emissiveIntensity={0.24} roughness={0.34} />
          </mesh>
        );
      })}
    </group>
  );
}

function createCollectible(
  nextIdRef: React.MutableRefObject<number>,
  avoidPosition?: Vector3
): Collectible {
  let x = 0;
  let z = 0;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    x = randomBetween(-arenaSize * 0.42, arenaSize * 0.42);
    z = randomBetween(-arenaSize * 0.42, arenaSize * 0.42);

    if (!avoidPosition || Math.hypot(x - avoidPosition.x, z - avoidPosition.z) > 6) {
      break;
    }
  }

  const palette = [
    { kind: "coin", color: "#ffd166" },
    { kind: "crystal", color: "#67e8f9" },
    { kind: "gift", color: "#fb7185" },
    { kind: "star", color: "#fde68a" }
  ] satisfies Array<{ kind: CollectibleKind; color: string }>;
  const selected = palette[Math.floor(Math.random() * palette.length)];

  return {
    id: nextIdRef.current++,
    kind: selected.kind,
    x,
    z,
    phase: Math.random() * Math.PI * 2,
    color: selected.color
  };
}

function createNpc(
  nextNpcIdRef: React.MutableRefObject<number>,
  x = randomEdgePosition(),
  z = randomEdgePosition()
): NpcPlayer {
  const id = nextNpcIdRef.current++;
  const names = ["Mia", "Leo", "Nora", "Teo"];
  const colors = ["#7dd3fc", "#c084fc", "#fb7185", "#86efac"];
  const kinds: NpcKind[] = ["adventurer", "farmer", "hoodie", "adventurer"];

  return {
    id,
    name: names[(id - 1) % names.length],
    x,
    z,
    facing: 0,
    score: 0,
    color: colors[(id - 1) % colors.length],
    kind: kinds[(id - 1) % kinds.length]
  };
}

function moveNpc(
  npc: NpcPlayer,
  collectibles: Collectible[],
  obstacles: SceneryItem[],
  delta: number
): NpcPlayer {
  const target = chooseNpcTarget(npc, collectibles, obstacles);

  if (!target) {
    return npc;
  }

  const dx = target.x - npc.x;
  const dz = target.z - npc.z;
  const distance = Math.max(0.001, Math.hypot(dx, dz));
  const baseDirection = {
    x: dx / distance,
    z: dz / distance
  };
  const nextStep = chooseNpcStep({
    baseDirection,
    npc,
    obstacles,
    stepDistance: npcSpeed * delta,
    target
  });

  return {
    ...npc,
    x: nextStep.position.x,
    z: nextStep.position.z,
    facing: nextStep.facing
  };
}

function chooseNpcTarget(
  npc: NpcPlayer,
  collectibles: Collectible[],
  obstacles: SceneryItem[]
) {
  return collectibles.reduce<Collectible | undefined>((best, item) => {
    if (!best) {
      return item;
    }

    const bestScore = npcTargetScore(npc, best, obstacles);
    const itemScore = npcTargetScore(npc, item, obstacles);
    return itemScore < bestScore ? item : best;
  }, undefined);
}

function npcTargetScore(
  npc: NpcPlayer,
  item: Collectible,
  obstacles: SceneryItem[]
) {
  const distance = Math.hypot(item.x - npc.x, item.z - npc.z);
  const blockedPenalty = lineIntersectsObstacle(
    npc.x,
    npc.z,
    item.x,
    item.z,
    obstacles,
    0.8
  )
    ? 8
    : 0;

  return distance + blockedPenalty;
}

function chooseNpcStep({
  baseDirection,
  npc,
  obstacles,
  stepDistance,
  target
}: {
  baseDirection: { x: number; z: number };
  npc: NpcPlayer;
  obstacles: SceneryItem[];
  stepDistance: number;
  target: Collectible;
}) {
  const currentPosition = new Vector3(npc.x, 0, npc.z);
  const sidePreference = npc.id % 2 === 0 ? 1 : -1;
  const candidateAngles = [
    0,
    sidePreference * Math.PI * 0.18,
    -sidePreference * Math.PI * 0.18,
    sidePreference * Math.PI * 0.36,
    -sidePreference * Math.PI * 0.36,
    sidePreference * Math.PI * 0.5,
    -sidePreference * Math.PI * 0.5,
    Math.PI
  ];

  let best = {
    facing: Math.atan2(baseDirection.x, baseDirection.z),
    position: currentPosition,
    score: Number.POSITIVE_INFINITY
  };

  for (const angle of candidateAngles) {
    const direction = rotateDirection(baseDirection, angle);
    const candidate = moveWithCollisions(
      currentPosition,
      direction.x * stepDistance,
      direction.z * stepDistance,
      obstacles,
      0.68
    );
    const movedDistance = Math.hypot(candidate.x - npc.x, candidate.z - npc.z);

    if (movedDistance < stepDistance * 0.28) {
      continue;
    }

    const targetDistance = Math.hypot(target.x - candidate.x, target.z - candidate.z);
    const turnPenalty = Math.abs(angle) * 0.65;
    const score = targetDistance + turnPenalty;

    if (score < best.score) {
      best = {
        facing: Math.atan2(direction.x, direction.z),
        position: candidate,
        score
      };
    }
  }

  return best;
}

function rotateDirection(direction: { x: number; z: number }, angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: direction.x * cos - direction.z * sin,
    z: direction.x * sin + direction.z * cos
  };
}

function PlayerCharacter({ isMoving }: { isMoving: boolean }) {
  return (
    <GlbCharacter
      animationSpeed={1.35}
      isMoving={isMoving}
      rotationOffset={0}
      scale={1}
      src="/assets/characters/quaternius-king.glb"
      tint="#facc15"
    />
  );
}

function NpcCharacter({
  kind
}: {
  kind: NpcKind;
}) {
  const model = getNpcModel(kind);

  return (
    <GlbCharacter
      animationSpeed={1.05}
      isMoving
      positionY={model.positionY}
      rotationOffset={model.rotationOffset}
      scale={model.scale}
      src={model.src}
    />
  );
}

function getNpcModel(kind: NpcKind) {
  if (kind === "king") {
    return {
      rotationOffset: 0,
      positionY: 0,
      scale: 1,
      src: "/assets/characters/quaternius-king.glb"
    };
  }

  if (kind === "farmer") {
    return {
      rotationOffset: 0,
      positionY: 0,
      scale: 1,
      src: "/assets/characters/quaternius-farmer.glb"
    };
  }

  if (kind === "hoodie") {
    return {
      rotationOffset: 0,
      positionY: 0,
      scale: 1,
      src: "/assets/characters/quaternius-hoodie.glb"
    };
  }

  return {
    rotationOffset: 0,
    positionY: 0,
    scale: 1,
    src: "/assets/characters/quaternius-adventurer.glb"
  };
}

function createPlayerBrick({
  elapsed,
  existingBricks,
  facing,
  lastBrickTime,
  nextBrickIdRef,
  playerPosition,
  staticObstacles
}: {
  elapsed: number;
  existingBricks: PlayerBrick[];
  facing: number;
  lastBrickTime: number;
  nextBrickIdRef: React.MutableRefObject<number>;
  playerPosition: Vector3;
  staticObstacles: SceneryItem[];
}) {
  const directionX = Math.sin(facing);
  const directionZ = Math.cos(facing);
  const sideX = Math.cos(facing);
  const sideZ = -Math.sin(facing);
  const currentObstacles = [...staticObstacles, ...existingBricks];

  if (elapsed - lastBrickTime < brickCooldownSeconds) {
    return null;
  }

  if (existingBricks.length >= maxPlayerBricks) {
    return null;
  }

  for (const sideOffset of [0, -0.8, 0.8]) {
    const x = clampToArena(
      playerPosition.x + directionX * brickPlaceDistance + sideX * sideOffset,
      Math.max(brickWidth, brickDepth) / 2
    );
    const z = clampToArena(
      playerPosition.z + directionZ * brickPlaceDistance + sideZ * sideOffset,
      Math.max(brickWidth, brickDepth) / 2
    );

    if (collidesWithAny(x, z, currentObstacles, Math.max(brickWidth, brickDepth) * 0.48)) {
      continue;
    }

    if (Math.hypot(x - playerPosition.x, z - playerPosition.z) < 1.15) {
      continue;
    }

    return {
      id: `player-brick-${nextBrickIdRef.current++}`,
      x,
      z,
      width: brickWidth,
      height: brickHeight,
      depth: brickDepth,
      rotation: facing,
      color: "#f97316",
      blocksMovement: true,
      expiresAt: elapsed + brickLifetimeSeconds
    };
  }

  return null;
}

function moveWithCollisions(
  position: Vector3,
  dx: number,
  dz: number,
  obstacles: SceneryItem[],
  radius: number
) {
  const next = position.clone();
  next.x = clampToArena(next.x + dx, radius);

  if (collidesWithAny(next.x, next.z, obstacles, radius)) {
    next.x = position.x;
  }

  next.z = clampToArena(next.z + dz, radius);

  if (collidesWithAny(next.x, next.z, obstacles, radius)) {
    next.z = position.z;
  }

  return next;
}

function collidesWithAny(
  x: number,
  z: number,
  obstacles: SceneryItem[],
  radius: number
) {
  return obstacles.some((item) => {
    const localX = x - item.x;
    const localZ = z - item.z;
    const halfWidth = item.width / 2 + radius;
    const halfDepth = item.depth / 2 + radius;

    return Math.abs(localX) < halfWidth && Math.abs(localZ) < halfDepth;
  });
}

function lineIntersectsObstacle(
  startX: number,
  startZ: number,
  endX: number,
  endZ: number,
  obstacles: SceneryItem[],
  radius: number
) {
  const distance = Math.hypot(endX - startX, endZ - startZ);
  const samples = Math.max(3, Math.ceil(distance / 1.4));

  for (let index = 1; index < samples; index += 1) {
    const progress = index / samples;
    const x = startX + (endX - startX) * progress;
    const z = startZ + (endZ - startZ) * progress;

    if (collidesWithAny(x, z, obstacles, radius)) {
      return true;
    }
  }

  return false;
}

function clampToArena(value: number, radius: number) {
  const limit = arenaSize / 2 - radius;
  return Math.max(-limit, Math.min(limit, value));
}

function createScenery(): SceneryItem[] {
  return [
    { id: "north-wall", x: 0, z: -22, width: 44, height: 1.1, depth: 0.8, rotation: 0, color: "#6d5dfc", blocksMovement: true },
    { id: "south-wall", x: 0, z: 22, width: 44, height: 1.1, depth: 0.8, rotation: 0, color: "#ff7ab6", blocksMovement: true },
    { id: "west-wall", x: -22, z: 0, width: 0.8, height: 1.1, depth: 44, rotation: 0, color: "#28d7c1", blocksMovement: true },
    { id: "east-wall", x: 22, z: 0, width: 0.8, height: 1.1, depth: 44, rotation: 0, color: "#ffd166", blocksMovement: true },
    { id: "wall-a", x: -5, z: -8, width: 10, height: 1.6, depth: 0.9, rotation: 0, color: "#f97365", blocksMovement: true },
    { id: "wall-b", x: 6, z: 7, width: 0.9, height: 1.6, depth: 10, rotation: 0, color: "#2dd4bf", blocksMovement: true },
    { id: "bench-a", x: -10, z: -2, width: 4.4, height: 0.55, depth: 1.1, rotation: 0, color: "#facc15", blocksMovement: true },
    { id: "bench-b", x: 12, z: 2, width: 4.4, height: 0.55, depth: 1.1, rotation: 0, color: "#c084fc", blocksMovement: true },
    { id: "crate-a", x: -13, z: 10, width: 2, height: 1.7, depth: 2, rotation: 0, color: "#fb7185", blocksMovement: true },
    { id: "crate-b", x: 13, z: -11, width: 2.2, height: 1.4, depth: 2.2, rotation: 0, color: "#38bdf8", blocksMovement: true }
  ];
}

function randomEdgePosition() {
  return Math.random() > 0.5
    ? randomBetween(arenaSize * 0.34, arenaSize * 0.43)
    : randomBetween(-arenaSize * 0.43, -arenaSize * 0.34);
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}
