import { Component, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  Line as ThreeLine,
  LineBasicMaterial,
  LineDashedMaterial,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  QuadraticBezierCurve3,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Claim, Entity } from '../lib/types.ts';
import { createGalaxyLayout, decorativeStars, ENTITY_COLORS } from './galaxy-layout.ts';
import type { Position } from './galaxy-layout.ts';

export interface CitationLink {
  paperId: string;
  entityId: string;
  claimId: string;
}

export interface GalaxyProps {
  entities: Entity[];
  claims: Claim[];
  selectedId: string | null;
  selectedClaimId: string | null;
  onSelect: (id: string) => void;
  onSelectClaim: (id: string) => void;
  reducedMotion: boolean;
  resetKey: number;
  /** Increment to zoom in, decrement to zoom out. */
  zoomStep?: number;
  citationLinks?: CitationLink[];
  layoutEntities?: Entity[];
  onUnavailable?: () => void;
  /** Copy the current camera view on demand without retaining the drawing buffer. */
  onCaptureReady?: (capture: (() => HTMLCanvasElement) | null) => void;
}

function Unavailable() {
  return <div className="galaxy-fallback">The graph is unavailable. Use the list to explore the same evidence.</div>;
}

function approach(value: number, destination: number, alpha: number): number {
  return Math.abs(destination - value) < 0.001 ? destination : value + (destination - value) * alpha;
}

const ignoreRaycast = () => {};

function colorIsMoving(color: Color, destination: Color, alpha: number): boolean {
  const difference = Math.abs(color.r - destination.r) + Math.abs(color.g - destination.g) + Math.abs(color.b - destination.b);
  if (difference < 0.002) { color.copy(destination); return false; }
  color.lerp(destination, alpha);
  return true;
}

class RendererBoundary extends Component<{ children: ReactNode; onUnavailable?: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onUnavailable?.(); }
  render() {
    return this.state.failed ? <Unavailable /> : this.props.children;
  }
}

function makeGlow(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.18, 'rgba(255,255,255,0.35)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.07)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function makeLabel(entity: Entity): { texture: CanvasTexture; aspect: number; lines: number } {
  const canvas = document.createElement('canvas');
  const font = `${entity.type === 'paper' ? 500 : 600} ${entity.type === 'paper' ? 44 : 50}px system-ui, sans-serif`;
  const label = entity.label.length > 35 ? `${entity.label.slice(0, 33)}…` : entity.label;
  const lines = entity.type === 'pathway' ? label.split(' ').reduce<string[]>((result, word) => {
    const last = result.at(-1);
    if (last && `${last} ${word}`.length <= 18) result[result.length - 1] = `${last} ${word}`;
    else result.push(word);
    return result;
  }, []) : [label];
  const measuringContext = canvas.getContext('2d');
  if (measuringContext) measuringContext.font = font;
  canvas.width = Math.max(160, ...lines.map((line) => Math.ceil(measuringContext?.measureText(line).width ?? 600) + 36));
  canvas.height = 80 * lines.length;
  const context = canvas.getContext('2d');
  if (context) {
    context.font = font;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.shadowColor = '#080c0d';
    context.shadowBlur = 12;
    context.fillStyle = '#e7eeed';
    lines.forEach((line, index) => context.fillText(line, canvas.width / 2, 40 + index * 80));
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return { texture, aspect: canvas.width / canvas.height, lines: lines.length };
}

function EntityNode({ entity, position, selected, onSelect, glow, reducedMotion, compactLabels }: {
  entity: Entity;
  position: Position;
  selected: boolean;
  onSelect: (id: string) => void;
  glow: CanvasTexture;
  reducedMotion: boolean;
  compactLabels: boolean;
}) {
  const { gl, camera, size, invalidate } = useThree();
  const hovered = useRef(false);
  const sphere = useRef<Mesh>(null);
  const hitArea = useRef<Mesh>(null);
  const ring = useRef<Mesh>(null);
  const sphereMaterial = useRef<MeshBasicMaterial>(null);
  const glowMaterial = useRef<SpriteMaterial>(null);
  const ringMaterial = useRef<MeshBasicMaterial>(null);
  const labelSprite = useRef<Sprite>(null);
  const label = useMemo(() => makeLabel(entity), [entity]);
  const worldPosition = useMemo(() => new Vector3(...position), [position]);
  const labelPosition = useMemo(() => new Vector3(), []);
  const showCompactLabel = compactLabels || (entity.type === 'gene' && ['gene-apoe', 'gene-abca1', 'gene-trem2'].includes(entity.id));
  const colors = useMemo(() => ({ normal: new Color(ENTITY_COLORS[entity.type]), selected: new Color('#f0fff8') }), [entity.type]);
  const radius = entity.type === 'disease' ? 0.34 : entity.type === 'paper' ? 0.14 : 0.23;
  const initial = useRef({ scale: selected ? 1.1 : 1, glow: selected ? 0.85 : 0.37, ring: selected ? 0.75 : 0, color: selected ? '#f0fff8' : ENTITY_COLORS[entity.type], labelOpacity: selected ? 1 : size.width < 520 && !showCompactLabel ? 0 : 0.85 });

  useEffect(() => () => { label.texture.dispose(); gl.domElement.style.cursor = 'grab'; }, [label, gl]);
  useLayoutEffect(() => invalidate(), [selected, reducedMotion, size.width, invalidate]);

  useFrame((_, delta) => {
    const alpha = reducedMotion ? 1 : 1 - Math.exp(-Math.min(delta, 0.05) * 16);
    const emphasis = selected || hovered.current;
    const scale = selected ? 1.1 : hovered.current ? 1.15 : 1;
    const glowOpacity = selected ? 0.85 : hovered.current ? 0.68 : 0.37;
    const ringOpacity = selected ? 0.75 : hovered.current ? 0.42 : 0;
    let moving = false;

    if (sphere.current) {
      const next = approach(sphere.current.scale.x, scale, alpha);
      sphere.current.scale.setScalar(next);
      moving ||= next !== scale;
    }
    if (sphereMaterial.current) moving = colorIsMoving(sphereMaterial.current.color, selected ? colors.selected : colors.normal, alpha) || moving;
    if (glowMaterial.current) {
      glowMaterial.current.opacity = approach(glowMaterial.current.opacity, glowOpacity, alpha);
      moving ||= glowMaterial.current.opacity !== glowOpacity;
    }
    if (ring.current && ringMaterial.current) {
      ring.current.quaternion.copy(camera.quaternion);
      ringMaterial.current.opacity = approach(ringMaterial.current.opacity, ringOpacity, alpha);
      ring.current.visible = ringMaterial.current.opacity > 0;
      moving ||= ringMaterial.current.opacity !== ringOpacity;
    }

    // Names and hit targets retain a usable screen size at any camera distance.
    const worldPerPixel = camera instanceof PerspectiveCamera
      ? 2 * Math.tan(camera.fov * Math.PI / 360) * camera.position.distanceTo(worldPosition) / Math.max(size.height, 1)
      : 0.025;
    hitArea.current?.scale.setScalar(Math.max(radius * 1.5, worldPerPixel * 20));
    if (labelSprite.current) {
      const compact = size.width < 520;
      const height = worldPerPixel * (entity.type === 'paper' ? 22 : 24) * label.lines;
      labelSprite.current.scale.set(height * label.aspect, height, 1);
      // Clamp visible labels inside the canvas while retaining their depth.
      const above = entity.type === 'pathway' || (entity.type === 'paper' && position[1] >= 0) || (compact && entity.type === 'disease');
      const labelY = (above ? 1 : -1) * (radius + height * 0.7);
      labelPosition.copy(worldPosition);
      labelPosition.y += labelY;
      labelPosition.project(camera);
      const halfWidth = Math.min(size.width / 2 - 8, height / worldPerPixel * label.aspect / 2);
      const margin = (halfWidth + 8) / Math.max(size.width, 1) * 2;
      if (Math.abs(labelPosition.x) < 1.25) labelPosition.x = Math.max(-1 + margin, Math.min(1 - margin, labelPosition.x));
      const verticalMargin = (height / worldPerPixel / 2 + 8) / Math.max(size.height, 1) * 2;
      if (Math.abs(labelPosition.y) < 1.25) labelPosition.y = Math.max(-1 + verticalMargin, Math.min(1 - verticalMargin, labelPosition.y));
      labelPosition.unproject(camera).sub(worldPosition);
      labelSprite.current.position.copy(labelPosition);
      const material = labelSprite.current.material as SpriteMaterial;
      const opacity = compact && !showCompactLabel && !emphasis ? 0 : emphasis ? 1 : 0.85;
      material.opacity = approach(material.opacity, opacity, alpha);
      labelSprite.current.visible = material.opacity > 0.001;
      labelSprite.current.raycast = labelSprite.current.visible ? Sprite.prototype.raycast : ignoreRaycast;
      moving ||= material.opacity !== opacity;
    }
    if (moving) invalidate();
  });

  function interact(event: ThreeEvent<PointerEvent>, active: boolean) {
    event.stopPropagation();
    hovered.current = active;
    gl.domElement.style.cursor = active ? 'pointer' : 'grab';
    invalidate();
  }
  function select(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    if (event.delta <= 4) onSelect(entity.id);
  }

  return <group position={position}>
    <sprite scale={[radius * 8, radius * 8, 1]} raycast={() => {}}>
      <spriteMaterial ref={glowMaterial} map={glow} color={ENTITY_COLORS[entity.type]} opacity={initial.current.glow} blending={AdditiveBlending} depthWrite={false} />
    </sprite>
    <mesh ref={sphere} raycast={() => {}} scale={initial.current.scale}>
      <sphereGeometry args={[radius, 24, 16]} />
      <meshBasicMaterial ref={sphereMaterial} color={initial.current.color} />
    </mesh>
    <mesh ref={ring} raycast={() => {}} visible={initial.current.ring > 0}>
      <torusGeometry args={[radius + 0.15, 0.012, 8, 64]} />
      <meshBasicMaterial ref={ringMaterial} color={ENTITY_COLORS[entity.type]} transparent opacity={initial.current.ring} depthWrite={false} />
    </mesh>
    <mesh ref={hitArea} onClick={select} onPointerOver={(event) => interact(event, true)} onPointerOut={(event) => interact(event, false)}>
      <sphereGeometry args={[1, 12, 8]} />
      <meshBasicMaterial transparent opacity={0} colorWrite={false} depthWrite={false} />
    </mesh>
    <sprite ref={labelSprite} visible={initial.current.labelOpacity > 0} position={[0, -radius - 0.5, 0]} scale={[label.aspect * 0.6, 0.6, 1]} onClick={select} onPointerOver={(event) => interact(event, true)} onPointerOut={(event) => interact(event, false)}>
      <spriteMaterial map={label.texture} transparent opacity={initial.current.labelOpacity} depthWrite={false} depthTest={false} />
    </sprite>
  </group>;
}

function Connection({ start, end, selected, citation, index, onClick, reducedMotion }: {
  start: Position;
  end: Position;
  selected: boolean;
  citation?: boolean;
  index: number;
  onClick: () => void;
  reducedMotion: boolean;
}) {
  const { gl, invalidate } = useThree();
  const hovered = useRef(false);
  const geometry = useMemo(() => {
    const from = new Vector3(...start);
    const to = new Vector3(...end);
    const middle = from.clone().lerp(to, 0.5);
    const perpendicular = new Vector3(-(to.y - from.y), to.x - from.x, 0).normalize();
    middle.addScaledVector(perpendicular, citation ? 0.08 : 0.23 + (index % 3) * 0.19);
    middle.z += citation ? -0.18 : 0.25;
    return new BufferGeometry().setFromPoints(new QuadraticBezierCurve3(from, middle, to).getPoints(60));
  }, [start, end, citation, index]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const material = useMemo(() => citation
    ? new LineDashedMaterial({ color: '#728ba6', transparent: true, opacity: 0.25, dashSize: 0.045, gapSize: 0.075, depthWrite: false })
    : new LineBasicMaterial({ color: '#7ca99b', transparent: true, opacity: 0.4, depthWrite: false }), [citation]);
  const colors = useMemo(() => ({ normal: new Color(citation ? '#728ba6' : '#7ca99b'), active: new Color(citation ? '#c6d8ef' : '#c4e9d6') }), [citation]);
  const line = useMemo(() => {
    const object = new ThreeLine(geometry, material);
    object.computeLineDistances();
    return object;
  }, [geometry, material]);
  useEffect(() => () => material.dispose(), [material]);
  useLayoutEffect(() => invalidate(), [selected, reducedMotion, invalidate]);

  useFrame((_, delta) => {
    const active = selected || hovered.current;
    const alpha = reducedMotion ? 1 : 1 - Math.exp(-Math.min(delta, 0.05) * 14);
    const opacity = active ? (citation ? 0.68 : 0.9) : (citation ? 0.25 : 0.4);
    material.opacity = approach(material.opacity, opacity, alpha);
    const colorMoving = colorIsMoving(material.color, active ? colors.active : colors.normal, alpha);
    if (material.opacity !== opacity || colorMoving) invalidate();
  });

  return <primitive object={line}
    onClick={(event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); if (event.delta <= 4) onClick(); }}
    onPointerOver={(event: ThreeEvent<PointerEvent>) => { event.stopPropagation(); hovered.current = true; gl.domElement.style.cursor = 'pointer'; invalidate(); }}
    onPointerOut={() => { hovered.current = false; gl.domElement.style.cursor = 'grab'; invalidate(); }}
  />;
}

function Stars() {
  const points = useMemo(() => decorativeStars(420), []);
  return <points raycast={() => {}}>
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[points, 3]} />
    </bufferGeometry>
    <pointsMaterial color="#94a9ae" size={0.021} transparent opacity={0.34} sizeAttenuation depthWrite={false} />
  </points>;
}

function Capture({ onReady }: { onReady: GalaxyProps['onCaptureReady'] }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    if (!onReady) return;
    onReady(() => {
      if (gl.getContext().isContextLost()) throw new Error('The graph is unavailable. Switch to the list and try again.');
      const copy = document.createElement('canvas');
      copy.width = gl.domElement.width;
      copy.height = gl.domElement.height;
      const context = copy.getContext('2d');
      if (!context || !copy.width || !copy.height) throw new Error('Unable to capture the graph in this browser.');
      // Read in the same task as rendering: preserveDrawingBuffer stays disabled.
      gl.render(scene, camera);
      context.drawImage(gl.domElement, 0, 0);
      return copy;
    });
    return () => onReady(null);
  }, [gl, scene, camera, onReady]);
  return null;
}

function Navigation({ selectedId, positions, reducedMotion, resetKey, zoomStep = 0, onUnavailable }: {
  selectedId: string | null;
  positions: Map<string, Position>;
  reducedMotion: boolean;
  resetKey: number;
  zoomStep?: number;
  onUnavailable?: () => void;
}) {
  const { camera, gl, invalidate, raycaster, size } = useThree();
  const controls = useRef<OrbitControls | null>(null);
  const target = useRef<{ camera: Vector3; center: Vector3 } | null>(null);
  const previous = useRef({ initialized: false, selectedId, resetKey, zoomStep, width: size.width, height: size.height });
  const rememberedCenter = useRef(new Vector3());
  const unavailableCallback = useRef(onUnavailable);
  useEffect(() => { unavailableCallback.current = onUnavailable; }, [onUnavailable]);

  useLayoutEffect(() => {
    const orbit = new OrbitControls(camera, gl.domElement);
    orbit.enableDamping = !reducedMotion;
    orbit.dampingFactor = 0.1;
    orbit.minDistance = 6;
    orbit.maxDistance = 42;
    orbit.maxPolarAngle = Math.PI * 0.82;
    orbit.minPolarAngle = Math.PI * 0.18;
    const onChange = () => invalidate();
    orbit.addEventListener('change', onChange);
    const stopFocus = () => { target.current = null; };
    orbit.addEventListener('start', stopFocus);
    orbit.target.copy(rememberedCenter.current);
    orbit.update();
    controls.current = orbit;
    gl.domElement.style.cursor = 'grab';
    raycaster.params.Line.threshold = 0.12;
    const lostContext = (event: Event) => { event.preventDefault(); unavailableCallback.current?.(); };
    gl.domElement.addEventListener('webglcontextlost', lostContext);
    return () => {
      rememberedCenter.current.copy(orbit.target);
      controls.current = null;
      orbit.removeEventListener('change', onChange);
      orbit.removeEventListener('start', stopFocus);
      gl.domElement.removeEventListener('webglcontextlost', lostContext);
      orbit.dispose();
    };
  }, [camera, gl, invalidate, reducedMotion, raycaster]);

  useLayoutEffect(() => {
    const orbit = controls.current;
    if (!orbit) return;
    const initial = !previous.current.initialized;
    const reset = previous.current.resetKey !== resetKey;
    const resized = previous.current.width !== size.width || previous.current.height !== size.height;
    const zoomDelta = zoomStep - previous.current.zoomStep;
    const selectionChanged = previous.current.selectedId !== selectedId;
    previous.current = { initialized: true, selectedId, resetKey, zoomStep, width: size.width, height: size.height };
    const aspect = size.width / Math.max(size.height, 1);
    const halfFov = camera instanceof PerspectiveCamera ? camera.fov * Math.PI / 360 : 23 * Math.PI / 180;
    const fitDistance = Math.min(42, Math.max(13.5, 7.2 / (Math.tan(halfFov) * aspect)));
    const center = orbit.target.clone();
    const offset = camera.position.clone().sub(orbit.target);

    if (initial || reset) {
      center.set(0, 0, 0);
      offset.set(0, 0.3, fitDistance);
    } else if (resized) {
      offset.setLength(fitDistance);
    } else if (zoomDelta) {
      offset.setLength(Math.max(6, Math.min(42, offset.length() * Math.pow(0.82, zoomDelta))));
    } else if (selectionChanged) {
      const selectedPosition = selectedId ? positions.get(selectedId) : undefined;
      if (selectedPosition) center.set(...selectedPosition).multiplyScalar(0.28);
    } else if (reducedMotion && target.current) {
      camera.position.copy(target.current.camera);
      orbit.target.copy(target.current.center);
      target.current = null;
      orbit.update();
      invalidate();
      return;
    } else return;

    const destination = center.clone().add(offset);
    if (initial || resized || reducedMotion) {
      // Start fitted; avoid an initial zoom-out on narrow screens.
      camera.position.copy(destination);
      orbit.target.copy(center);
      target.current = null;
      orbit.update();
    } else target.current = { camera: destination, center };
    invalidate();
  }, [selectedId, positions, resetKey, zoomStep, reducedMotion, camera, invalidate, size.width, size.height]);

  useFrame((_, delta) => {
    const orbit = controls.current;
    const destination = target.current;
    if (orbit && destination) {
      const step = 1 - Math.exp(-Math.min(delta, 0.05) * 9);
      camera.position.lerp(destination.camera, step);
      orbit.target.lerp(destination.center, step);
      if (camera.position.distanceTo(destination.camera) < 0.005 && orbit.target.distanceTo(destination.center) < 0.005) {
        camera.position.copy(destination.camera);
        orbit.target.copy(destination.center);
        target.current = null;
      } else invalidate();
    }
    orbit?.update();
  });
  return null;
}

function Scene(props: GalaxyProps) {
  const { entities, claims, selectedId, selectedClaimId, onSelect, onSelectClaim, citationLinks = [] } = props;
  const layoutEntities = props.layoutEntities ?? entities;
  const positions = useMemo(() => createGalaxyLayout(layoutEntities), [layoutEntities]);
  const glow = useMemo(makeGlow, []);
  useEffect(() => () => glow.dispose(), [glow]);
  return <>
    <Capture onReady={props.onCaptureReady} />
    <Navigation selectedId={selectedId} positions={positions} reducedMotion={props.reducedMotion} resetKey={props.resetKey} zoomStep={props.zoomStep} onUnavailable={props.onUnavailable} />
    <Stars />
    {claims.map((claim, index) => {
      const start = positions.get(claim.subject_id);
      const end = positions.get(claim.object_id);
      return start && end ? <Connection key={claim.id} start={start} end={end} selected={selectedClaimId === claim.id} index={index} onClick={() => onSelectClaim(claim.id)} reducedMotion={props.reducedMotion} /> : null;
    })}
    {citationLinks.map((citation, index) => {
      const start = positions.get(citation.paperId);
      const end = positions.get(citation.entityId);
      return start && end ? <Connection key={`${citation.paperId}-${citation.entityId}-${citation.claimId}`} start={start} end={end} selected={selectedClaimId === citation.claimId} citation index={index} onClick={() => onSelectClaim(citation.claimId)} reducedMotion={props.reducedMotion} /> : null;
    })}
    {entities.map((entity) => {
      const position = positions.get(entity.id);
      return position ? <EntityNode key={entity.id} entity={entity} position={position} selected={selectedId === entity.id} onSelect={onSelect} glow={glow} reducedMotion={props.reducedMotion} compactLabels={entities.length <= 8} /> : null;
    })}
  </>;
}

export default function Galaxy(props: GalaxyProps) {
  const unavailable = useCallback(() => props.onUnavailable?.(), [props.onUnavailable]);
  return <div className="scene-shell" aria-hidden="true" style={{ height: '100%', minHeight: 360 }}>
    <RendererBoundary onUnavailable={unavailable}>
      <Canvas
        frameloop="demand"
        camera={{ position: [0, 0.3, 13.5], fov: 46, near: 0.1, far: 100 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        fallback={<Unavailable />}
        tabIndex={-1}
      >
        <Scene {...props} onUnavailable={unavailable} />
      </Canvas>
    </RendererBoundary>
  </div>;
}
