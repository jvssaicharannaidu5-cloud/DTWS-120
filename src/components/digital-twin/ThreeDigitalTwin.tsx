import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Well } from '../../types';
import { fmt, clamp } from '../../data/wells';

interface ThreeDigitalTwinProps {
  well: Well;
  layers: { steam: boolean; prod: boolean; elec: boolean };
  paused: boolean;
  onReady?: () => void;
}

export const ThreeDigitalTwin: React.FC<ThreeDigitalTwinProps> = ({
  well,
  layers,
  paused,
  onReady
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const wellRef = useRef<Well>(well);
  wellRef.current = well;

  const pausedRef = useRef<boolean>(paused);
  pausedRef.current = paused;

  const layersRef = useRef(layers);
  layersRef.current = layers;

  useEffect(() => {
    const el = containerRef.current;
    const labRoot = labelsRef.current;
    if (!el || !labRoot) return;

    // 1. Scene & Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1016);
    scene.fog = new THREE.Fog(0x0a1016, 28, 95);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, el.clientWidth / Math.max(el.clientHeight, 1), 0.1, 200);
    camera.position.set(14, 10, 16);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(el.clientWidth, el.clientHeight, false);
    renderer.domElement.className = 'twin-canvas';
    el.appendChild(renderer.domElement);

    // 4. Lights
    const hemi = new THREE.HemisphereLight(0x9bb8c9, 0x3a2a18, 0.55);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffe6c2, 0.9);
    sun.position.set(20, 30, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    scene.add(sun);

    const tealLight = new THREE.PointLight(0x2ee6c7, 1.4, 28);
    tealLight.position.set(2, 4, 2);
    scene.add(tealLight);

    const amberLight = new THREE.PointLight(0xf5a623, 1.1, 22);
    amberLight.position.set(-4, 3, -2);
    scene.add(amberLight);

    // 5. Environment & Ground
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(42, 48),
      new THREE.MeshStandardMaterial({ color: 0x221e18, roughness: 0.95, metalness: 0.05 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(40, 40, 0x2e4235, 0x1c2718);
    grid.position.y = 0.02;
    scene.add(grid);

    // Wellsite Pad
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.18, 12),
      new THREE.MeshStandardMaterial({ color: 0x3d4349, roughness: 0.85 })
    );
    pad.position.y = 0.1;
    pad.receiveShadow = true;
    scene.add(pad);

    // Materials
    const matSteel = new THREE.MeshStandardMaterial({ color: 0x8a93a0, metalness: 0.75, roughness: 0.3 });
    const matDark = new THREE.MeshStandardMaterial({ color: 0x242a32, metalness: 0.5, roughness: 0.45 });
    const matTeal = new THREE.MeshStandardMaterial({ color: 0x16695e, emissive: 0x004d40, emissiveIntensity: 0.4, metalness: 0.4, roughness: 0.4 });
    const matSteam = new THREE.MeshStandardMaterial({ color: 0x8a4a20, emissive: 0xd97706, emissiveIntensity: 0.35, metalness: 0.3, roughness: 0.5 });
    const matWarn = new THREE.MeshStandardMaterial({ color: 0xcc3344, emissive: 0xf43f5e, emissiveIntensity: 0.5 });

    function cyl(r: number, h: number, mat: THREE.Material, x: number, y: number, z: number, rx = 0, rz = 0) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 16), mat);
      m.position.set(x, y, z);
      m.rotation.x = rx;
      m.rotation.z = rz;
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
      return m;
    }

    function box(w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
      return m;
    }

    // Wellhead Christmas Tree structure
    box(3.2, 0.5, 3.2, matDark, 0, 0.4, 0); // Concrete cellar
    cyl(0.55, 1.2, matSteel, 0, 1.1, 0);   // Surface Casing spool
    cyl(0.35, 1.6, matSteel, 0, 2.4, 0);   // Tubing head spool
    box(1.4, 0.55, 0.55, matSteel, 0, 3.3, 0); // Master valve block
    cyl(0.22, 0.7, matDark, -0.7, 3.3, 0, 0, Math.PI / 2); // Wing valve left (production)
    cyl(0.22, 0.7, matDark, 0.7, 3.3, 0, 0, Math.PI / 2);  // Wing valve right (kill/steam)
    cyl(0.18, 0.9, matSteel, 0, 3.9, 0);   // Swab valve
    box(0.7, 0.35, 0.7, matTeal, 0, 4.4, 0); // Stuffing box / polished rod gland

    // Sucker Rod Pumping Unit (Mark II Beam Pump)
    const jack = new THREE.Group();
    jack.position.set(4.2, 0, 0);
    scene.add(jack);

    box(2.4, 0.35, 1.4, matDark, 4.2, 0.35, 0); // Gearbox & motor base
    box(0.28, 4.2, 0.28, matSteel, 4.2, 2.4, 0); // Samson post
    const beam = box(6.2, 0.24, 0.28, matSteel, 3.2, 4.55, 0); // Walking beam
    const horse = box(0.65, 0.85, 0.24, matDark, 0.35, 4.35, 0); // Horsehead
    const crank = box(0.18, 1.8, 0.18, matSteel, 6.6, 1.8, 0.7); // Counterweight crank
    cyl(0.55, 0.3, matDark, 6.6, 1.1, 0.7, Math.PI / 2); // Crank hub
    const polish = cyl(0.07, 3.6, matTeal, 0, 2.2, 0); // Polished rod string

    // Flowline particles (Oil production)
    const flowCount = 18;
    const flowSpheres: THREE.Mesh[] = [];
    const flowMat = new THREE.MeshBasicMaterial({ color: 0x2ee6c7 });
    for (let i = 0; i < flowCount; i++) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), flowMat);
      scene.add(p);
      flowSpheres.push(p);
    }

    // Steam injection particles
    const steamCount = 12;
    const steamSpheres: THREE.Mesh[] = [];
    const steamMat = new THREE.MeshBasicMaterial({ color: 0xf5a623 });
    for (let i = 0; i < steamCount; i++) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), steamMat);
      scene.add(p);
      steamSpheres.push(p);
    }

    // RTU SCADA Panel & Warning Beacon
    box(1.6, 1.8, 1.1, matDark, -5.4, 1.1, 2.2);
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), matWarn);
    beacon.position.set(-5.4, 2.15, 2.2);
    scene.add(beacon);

    // Production flowline pipe (3" insulated steel)
    const prodPipe = cyl(0.16, 6.5, matTeal, 2.2, 1.35, 1.6, 0, Math.PI / 2);
    // Steam injection line pipe
    const steamPipe = cyl(0.16, 5.5, matSteam, -2.4, 1.55, -1.4, 0, Math.PI / 2);
    // Field test separator unit
    box(2.2, 1.4, 1.4, matSteel, -6.2, 0.9, -2.4);

    // Anchor points for 3D overlay chips
    const anchors = {
      wellhead: new THREE.Vector3(0, 4.6, 0),
      pump: new THREE.Vector3(4.2, 5.1, 0),
      steam: new THREE.Vector3(-4.5, 2.2, -1.4),
      flow: new THREE.Vector3(3.5, 1.8, 1.6),
      rtu: new THREE.Vector3(-5.4, 2.6, 2.2)
    };

    // Camera Orbit State
    let mx = 0, my = 0, dragging = false;
    let ax = 0.42, ay = 0.38, dist = 22;

    const onDown = (e: MouseEvent | PointerEvent) => {
      dragging = true;
      mx = e.clientX;
      my = e.clientY;
    };
    const onUp = () => { dragging = false; };
    const onMove = (e: MouseEvent | PointerEvent) => {
      if (!dragging) return;
      ax -= (e.clientX - mx) * 0.005;
      ay = clamp(ay + (e.clientY - my) * 0.005, 0.12, 1.2);
      mx = e.clientX;
      my = e.clientY;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      dist = clamp(dist + e.deltaY * 0.02, 10, 45);
    };

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointermove', onMove);
    el.addEventListener('wheel', onWheel, { passive: false });

    // Create 3D overlay chips
    const labelEls: Record<string, HTMLDivElement> = {};
    labRoot.innerHTML = '';
    ['wellhead', 'pump', 'steam', 'flow', 'rtu'].forEach(k => {
      const d = document.createElement('div');
      d.className = 'label-chip';
      labRoot.appendChild(d);
      labelEls[k] = d;
    });

    const clock = new THREE.Clock();
    let rafId: number;

    const resize = () => {
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight || 320;
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    let simTime = 0;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (!pausedRef.current) {
        simTime += delta;
      }

      const wdat = wellRef.current;
      const curLayers = layersRef.current;
      const spm = wdat.spm || 0;

      // Pump kinematics
      const nod = Math.sin(simTime * (spm * 0.45 + 0.4)) * 0.22;
      beam.rotation.z = nod;
      beam.position.y = 4.55 + Math.sin(simTime * 2) * 0.02;
      horse.position.y = 4.35 + nod * 4;
      polish.position.y = 2.2 + nod * 1.6;
      crank.rotation.z = simTime * (spm * 0.6 + 0.5);

      beacon.material = wdat.status === 'critical' ? matWarn : (wdat.alerts > 0 ? matSteam : matTeal);
      tealLight.intensity = 1.1 + Math.sin(simTime * 2) * 0.3;

      // Layer visibilities
      prodPipe.visible = curLayers.prod;
      steamPipe.visible = curLayers.steam;

      // Animated oil flow
      flowSpheres.forEach((p, i) => {
        const u = (simTime * 0.35 + i / flowCount) % 1;
        p.position.set(-1 + u * 8, 1.35 + Math.sin(u * 6) * 0.05, 1.6);
        p.visible = curLayers.prod && wdat.rate > 1 && !pausedRef.current;
      });

      // Animated steam flow
      steamSpheres.forEach((p, i) => {
        const u = (simTime * 0.25 + i / steamCount) % 1;
        p.position.set(-5 + u * 5, 1.55 + Math.sin(u * 8) * 0.08, -1.4);
        p.visible = curLayers.steam && (wdat.steam > 10 || wdat.cycle === 'INJECT') && !pausedRef.current;
      });

      // Orbit camera positioning
      camera.position.x = Math.cos(ax) * dist * Math.cos(ay);
      camera.position.z = Math.sin(ax) * dist * Math.cos(ay);
      camera.position.y = 4 + Math.sin(ay) * dist;
      camera.lookAt(1.5, 2.2, 0);

      renderer.render(scene, camera);

      // Project labels to screen coordinates
      const rect = el.getBoundingClientRect();
      Object.entries(anchors).forEach(([k, vec]) => {
        const v = vec.clone().project(camera);
        const x = (v.x * 0.5 + 0.5) * rect.width;
        const y = (-v.y * 0.5 + 0.5) * rect.height;
        const eln = labelEls[k];
        if (!eln) return;
        if (v.z > 1) {
          eln.style.display = 'none';
          return;
        }
        eln.style.display = 'block';
        eln.style.left = `${x}px`;
        eln.style.top = `${y}px`;
      });

      if (labelEls.wellhead) {
        labelEls.wellhead.innerHTML = `X-TREE <span>${wdat.id}</span> · THP ${fmt(wdat.thp, 0)} psi`;
      }
      if (labelEls.pump) {
        labelEls.pump.innerHTML = `SRP UNIT · ${fmt(wdat.spm, 1)} SPM · η ${fmt(wdat.pumpEff, 0)}%`;
      }
      if (labelEls.steam) {
        labelEls.steam.innerHTML = `STEAM HDR · ${wdat.steam > 0 ? fmt(wdat.steam, 0) + ' CWE bbl/d' : wdat.cycle}`;
      }
      if (labelEls.flow) {
        labelEls.flow.innerHTML = `FLOWLINE 3" · ${fmt(wdat.rate, 1)} bbl/d`;
      }
      if (labelEls.rtu) {
        labelEls.rtu.innerHTML = `RTU / SCADA · LIVE (124 Hz)`;
      }
    };

    animate();
    if (onReady) onReady();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointermove', onMove);
      el.removeEventListener('wheel', onWheel);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      labRoot.innerHTML = '';
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[300px] overflow-hidden bg-[#0a1016]">
      <div ref={containerRef} className="absolute inset-0" />
      <div ref={labelsRef} className="absolute inset-0 pointer-events-none" />
    </div>
  );
};
