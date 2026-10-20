import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  Line as ThreeLine,
  LineBasicMaterial,
  LineDashedMaterial,
  PerspectiveCamera,
  QuadraticBezierCurve3,
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
  citationLinks?: CitationLink[];
  layoutEntities?: Entity[];
  onUnavailable?: () => void;
}

function Unavailable() {
  return <div className="galaxy-fallback" style={{ padding: 32 }}>The 3D view is unavailable. Explore the same records in the list view.</div>;
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

function makeLabel(entity: Entity, selected: boolean): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 192;
  const context = canvas.getContext('2d');
  if (context) {
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.shadowColor = '#080c0d';
    context.shadowBlur = 14;
    context.font = `${selected ? 600 : 500} ${entity.type === 'paper' ? 50 : 64}px system-ui, sans-serif`;
    context.fillStyle = selected ? '#ffffff' : '#dbe6e3';
    const label = entity.label.length > 31 ? `${entity.label.slice(0, 29)}…` : entity.label;
    context.fillText(label, 384, 61, 750);
    context.font = '31px ui-monospace, monospace';
    context.fillStyle = ENTITY_COLORS[entity.type];
    context.fillText(entity.type.toUpperCase(), 384, 138);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function EntityNode({ entity, position, selected, onSelect, glow }: {
  entity: Entity;
  position: Position;
  selected: boolean;
  onSelect: (id: string) => void;
  glow: CanvasTexture;
}) {
  const [hovered, setHovered] = useState(false);
  const { gl } = useThree();
  const label = useMemo(() => makeLabel(entity, selected || hovered), [entity, selected, hovered]);
  useEffect(() => () => label.dispose(), [label]);
  const radius = entity.type === 'disease' ? 0.34 : entity.type === 'paper' ? 0.14 : 0.23;
  const color = ENTITY_COLORS[entity.type];
  const interact = (event: ThreeEvent<PointerEvent>, active: boolean) => {
    event.stopPropagation();
    setHovered(active);
    gl.domElement.style.cursor = active ? 'pointer' : 'grab';
  };
  return (
    <group position={position}>
      <sprite scale={[radius * 8, radius * 8, 1]} raycast={() => {}}>
        <spriteMaterial map={glow} color={color} opacity={selected || hovered ? 0.9 : 0.47} blending={AdditiveBlending} depthWrite={false} />
      </sprite>
      <mesh
        onClick={(event) => { event.stopPropagation(); onSelect(entity.id); }}
        onPointerOver={(event) => interact(event, true)}
        onPointerOut={(event) => interact(event, false)}
        scale={hovered ? 1.13 : 1}
      >
        <sphereGeometry args={[radius, 28, 20]} />
        <meshBasicMaterial color={selected ? '#f1fff9' : color} />
      </mesh>
      {(selected || hovered) && <mesh raycast={() => {}}>
        <torusGeometry args={[radius + 0.16, 0.012, 8, 80]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>}
      <sprite position={[0, -radius - 0.6, 0]} scale={entity.type === 'disease' ? [4.4, 1.1, 1] : [3.8, 0.95, 1]} raycast={() => {}}>
        <spriteMaterial map={label} transparent depthWrite={false} depthTest={false} />
      </sprite>
    </group>
  );
}

function Connection({ start, end, selected, citation, index, onClick }: {
  start: Position;
  end: Position;
  selected: boolean;
  citation?: boolean;
  index: number;
  onClick: () => void;
}) {
  const { gl } = useThree();
  const geometry = useMemo(() => {
    const from = new Vector3(...start);
    const to = new Vector3(...end);
    const middle = from.clone().lerp(to, 0.5);
    const perpendicular = new Vector3(-(to.y - from.y), to.x - from.x, 0).normalize();
    middle.addScaledVector(perpendicular, citation ? 0.08 : 0.23 + (index % 3) * 0.19);
    middle.z += citation ? -0.18 : 0.25;
    const points = new QuadraticBezierCurve3(from, middle, to).getPoints(60);
    const result = new BufferGeometry().setFromPoints(points);
    const distances = new Float32Array(points.length);
    for (let pointIndex = 1; pointIndex < points.length; pointIndex += 1) {
      distances[pointIndex] = (distances[pointIndex - 1] ?? 0) + points[pointIndex]!.distanceTo(points[pointIndex - 1]!);
    }
    result.setAttribute('lineDistance', new Float32BufferAttribute(distances, 1));
    return result;
  }, [start, end, citation, index]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const line = useMemo(() => {
    const material = citation
      ? new LineDashedMaterial({ color: selected ? '#d6e2f5' : '#6c82a4', transparent: true, opacity: selected ? 0.65 : 0.24, dashSize: 0.045, gapSize: 0.075, depthWrite: false })
      : new LineBasicMaterial({ color: selected ? '#e9c491' : '#65a695', transparent: true, opacity: selected ? 0.95 : 0.38, depthWrite: false });
    const object = new ThreeLine(geometry, material);
    object.computeLineDistances();
    return object;
  }, [geometry, citation, selected]);
  useEffect(() => () => line.material.dispose(), [line]);
  return (
    <primitive
      object={line}
      onClick={(event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onClick(); }}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => { event.stopPropagation(); gl.domElement.style.cursor = 'pointer'; }}
      onPointerOut={() => { gl.domElement.style.cursor = 'grab'; }}
    />
  );
}

function Stars() {
  const points = useMemo(() => decorativeStars(), []);
  return <points raycast={() => {}}>
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[points, 3]} />
    </bufferGeometry>
    <pointsMaterial color="#94b3b0" size={0.025} transparent opacity={0.48} sizeAttenuation depthWrite={false} />
  </points>;
}

function Navigation({ selectedId, positions, reducedMotion, resetKey, onUnavailable }: {
  selectedId: string | null;
  positions: Map<string, Position>;
  reducedMotion: boolean;
  resetKey: number;
  onUnavailable?: () => void;
}) {
  const { camera, gl, invalidate, raycaster, size } = useThree();
  const controls = useRef<OrbitControls | null>(null);
  const target = useRef<{ camera: Vector3; center: Vector3 } | null>(null);
  const previousReset = useRef(resetKey);
  const unavailableCallback = useRef(onUnavailable);
  useEffect(() => { unavailableCallback.current = onUnavailable; }, [onUnavailable]);

  useEffect(() => {
    const orbit = new OrbitControls(camera, gl.domElement);
    orbit.enableDamping = !reducedMotion;
    orbit.dampingFactor = 0.09;
    orbit.minDistance = 6;
    orbit.maxDistance = 42;
    orbit.maxPolarAngle = Math.PI * 0.82;
    orbit.minPolarAngle = Math.PI * 0.18;
    const onChange = () => invalidate();
    orbit.addEventListener('change', onChange);
    const stopFocus = () => { target.current = null; };
    orbit.addEventListener('start', stopFocus);
    controls.current = orbit;
    gl.domElement.style.cursor = 'grab';
    raycaster.params.Line.threshold = 0.12;
    const lostContext = (event: Event) => { event.preventDefault(); unavailableCallback.current?.(); };
    gl.domElement.addEventListener('webglcontextlost', lostContext);
    return () => {
      controls.current = null;
      orbit.removeEventListener('change', onChange);
      orbit.removeEventListener('start', stopFocus);
      gl.domElement.removeEventListener('webglcontextlost', lostContext);
      orbit.dispose();
    };
  }, [camera, gl, invalidate, reducedMotion, raycaster]);

  useEffect(() => {
    const reset = previousReset.current !== resetKey;
    previousReset.current = resetKey;
    const position = !reset && selectedId ? positions.get(selectedId) : undefined;
    const center = position ? new Vector3(...position).multiplyScalar(0.3) : new Vector3();
    const aspect = size.width / Math.max(size.height, 1);
    const halfFov = camera instanceof PerspectiveCamera ? camera.fov * Math.PI / 360 : 23 * Math.PI / 180;
    const distance = Math.max(13.5, 6.7 / (Math.tan(halfFov) * aspect));
    const destination = center.clone().add(new Vector3(0, 0.3, distance));
    if (reducedMotion) {
      camera.position.copy(destination);
      controls.current?.target.copy(center);
      controls.current?.update();
    } else {
      target.current = { camera: destination, center };
    }
    invalidate();
  }, [selectedId, positions, resetKey, reducedMotion, camera, invalidate, size.width, size.height]);

  useFrame((_, delta) => {
    const orbit = controls.current;
    const destination = target.current;
    if (orbit && destination) {
      const step = 1 - Math.exp(-delta * 6);
      camera.position.lerp(destination.camera, step);
      orbit.target.lerp(destination.center, step);
      if (camera.position.distanceTo(destination.camera) < 0.006 && orbit.target.distanceTo(destination.center) < 0.006) {
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
    <Navigation selectedId={selectedId} positions={positions} reducedMotion={props.reducedMotion} resetKey={props.resetKey} onUnavailable={props.onUnavailable} />
    <Stars />
    {claims.map((claim, index) => {
      const start = positions.get(claim.subject_id);
      const end = positions.get(claim.object_id);
      return start && end ? <Connection key={claim.id} start={start} end={end} selected={selectedClaimId === claim.id} index={index} onClick={() => onSelectClaim(claim.id)} /> : null;
    })}
    {citationLinks.map((citation, index) => {
      const start = positions.get(citation.paperId);
      const end = positions.get(citation.entityId);
      return start && end ? <Connection key={`${citation.paperId}-${citation.entityId}-${citation.claimId}`} start={start} end={end} selected={selectedClaimId === citation.claimId} citation index={index} onClick={() => onSelectClaim(citation.claimId)} /> : null;
    })}
    {entities.map((entity) => {
      const position = positions.get(entity.id);
      return position ? <EntityNode key={entity.id} entity={entity} position={position} selected={selectedId === entity.id} onSelect={onSelect} glow={glow} /> : null;
    })}
  </>;
}

export default function Galaxy(props: GalaxyProps) {
  const unavailable = useCallback(() => props.onUnavailable?.(), [props.onUnavailable]);
  return <div className="scene-shell" aria-hidden="true" style={{ height: '100%', minHeight: 420 }}>
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
