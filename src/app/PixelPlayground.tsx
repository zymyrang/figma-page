"use client";

import { useEffect, useRef } from "react";
import { useContent } from "./LanguageProvider";
import {
  playClear,
  playCollide,
  playDraw,
  playRelease,
} from "./lib/sounds";

export default function PixelPlayground() {
  const drawRef = useRef<HTMLCanvasElement>(null);
  const physRef = useRef<HTMLCanvasElement>(null);
  const clearBtnRef = useRef<HTMLButtonElement>(null);
  const releaseBtnRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const t = useContent().home.playground;

  useEffect(() => {
    const drawCanvas = drawRef.current;
    const physCanvas = physRef.current;
    const clearBtn = clearBtnRef.current;
    const releaseBtn = releaseBtnRef.current;
    const wrapper = wrapperRef.current;
    const hint = hintRef.current;
    const buttonsWrapper = buttonsRef.current;
    if (
      !drawCanvas ||
      !physCanvas ||
      !clearBtn ||
      !releaseBtn ||
      !wrapper ||
      !hint ||
      !buttonsWrapper
    )
      return;
    const drawCtx = drawCanvas.getContext("2d");
    const physCtx = physCanvas.getContext("2d");
    if (!drawCtx || !physCtx) return;

    // ---- FLOATING PIXELS WIDGET ----
    // Imperative single-file approach is intentional.

    const GRID_W = 36;
    const GRID_H = 20;
    const CELL = 10;
    const CANVAS_W = GRID_W * CELL; // 360
    const CANVAS_H = GRID_H * CELL; // 200
    const CENTER_X = CANVAS_W / 2; // 180
    const CENTER_Y = CANVAS_H / 2; // 100

    type Cell = string | 0;
    let grid: Cell[][] = Array.from({ length: GRID_H }, () =>
      Array<Cell>(GRID_W).fill(0),
    );
    let drawing = false;

    const colors = ["#4a9eff", "#7f77dd", "#1d9e75", "#ef9f27", "#d4537e"];
    let currentColor = colors[0];

    type Pixel = { dx: number; dy: number; color: string };
    type Floater = {
      pixels: Pixel[];
      bbox: { x: number; y: number; w: number; h: number };
      bboxCenter: { x: number; y: number };
      radius: number;
      mass: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      phase: number;
      bobAmp: number;
      bobSpeed: number;
      rotation: number;
      rotSpeed: number;
      bob: number;
    };

    let floaters: Floater[] = [];
    let grabbed: Floater | null = null;
    const grabOffset = { x: 0, y: 0 };
    let mouseHistory: { x: number; y: number; t: number }[] = [];
    const grabPrev = { x: 0, y: 0 };
    const grabVel = { x: 0, y: 0 };

    // --- UI overlay state (imperative; bypasses React state) ---
    let uiHasDrawing = false;
    let uiHasFloaters = false;
    let uiHovering = false;
    function updateUi() {
      hint!.style.opacity = uiHasDrawing || uiHovering ? "0" : "1";
      const showRelease = uiHasDrawing;
      const showClear = uiHasDrawing || uiHasFloaters;
      const wrapperVisible = (showRelease || showClear) && uiHovering;
      buttonsWrapper!.style.opacity = wrapperVisible ? "1" : "0";
      buttonsWrapper!.style.pointerEvents = wrapperVisible ? "auto" : "none";
      releaseBtn!.style.display = showRelease ? "" : "none";
      clearBtn!.style.display = showClear ? "" : "none";
    }
    updateUi();

    function onWrapperEnter() {
      uiHovering = true;
      updateUi();
    }
    function onWrapperLeave() {
      uiHovering = false;
      updateUi();
    }
    function onWrapperMouseMove() {
      // covers the case where cursor was already inside the wrapper
      // when the listener was attached (mouseenter wouldn't fire then).
      if (!uiHovering) {
        uiHovering = true;
        updateUi();
      }
    }
    wrapper.addEventListener("mouseenter", onWrapperEnter);
    wrapper.addEventListener("mouseleave", onWrapperLeave);
    wrapper.addEventListener("mousemove", onWrapperMouseMove);

    function resizePhys() {
      physCanvas!.width = window.innerWidth;
      physCanvas!.height = window.innerHeight;
    }
    resizePhys();

    function renderGrid() {
      drawCtx!.clearRect(0, 0, CANVAS_W, CANVAS_H);
      for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
          const c = grid[y][x];
          if (c) {
            drawCtx!.fillStyle = c;
            drawCtx!.fillRect(x * CELL, y * CELL, CELL, CELL);
          }
        }
      }
    }

    function getCellFromClient(cx: number, cy: number) {
      const rect = drawCanvas!.getBoundingClientRect();
      const x = Math.floor(((cx - rect.left) / rect.width) * GRID_W);
      const y = Math.floor(((cy - rect.top) / rect.height) * GRID_H);
      return { x, y };
    }

    function paintAt(cx: number, cy: number) {
      const { x, y } = getCellFromClient(cx, cy);
      if (x >= 0 && x < GRID_W && y >= 0 && y < GRID_H) {
        const wasEmpty = !grid[y][x];
        grid[y][x] = currentColor;
        renderGrid();
        if (wasEmpty) playDraw();
        // user is interacting with the widget — treat as hovering even on
        // touch (where mouseenter never fires).
        if (!uiHasDrawing || !uiHovering) {
          uiHasDrawing = true;
          uiHovering = true;
          updateUi();
        }
      }
    }

    // --- Drawing input (mouse) ---
    function onDrawMouseDown(e: MouseEvent) {
      drawing = true;
      currentColor = colors[Math.floor(Math.random() * colors.length)];
      paintAt(e.clientX, e.clientY);
      e.stopPropagation();
    }
    function onDrawMouseMove(e: MouseEvent) {
      if (drawing) paintAt(e.clientX, e.clientY);
    }
    function onWindowMouseUp() {
      drawing = false;
    }

    drawCanvas.addEventListener("mousedown", onDrawMouseDown);
    drawCanvas.addEventListener("mousemove", onDrawMouseMove);
    window.addEventListener("mouseup", onWindowMouseUp);

    // --- Drawing input (touch) ---
    function onDrawTouchStart(e: TouchEvent) {
      if (e.touches.length === 0) return;
      e.preventDefault();
      drawing = true;
      currentColor = colors[Math.floor(Math.random() * colors.length)];
      const t = e.touches[0];
      paintAt(t.clientX, t.clientY);
    }
    function onDrawTouchMove(e: TouchEvent) {
      if (!drawing || e.touches.length === 0) return;
      e.preventDefault();
      const t = e.touches[0];
      paintAt(t.clientX, t.clientY);
    }
    function onDrawTouchEnd() {
      drawing = false;
    }
    drawCanvas.addEventListener("touchstart", onDrawTouchStart, {
      passive: false,
    });
    drawCanvas.addEventListener("touchmove", onDrawTouchMove, {
      passive: false,
    });
    drawCanvas.addEventListener("touchend", onDrawTouchEnd);
    drawCanvas.addEventListener("touchcancel", onDrawTouchEnd);

    // --- Release / clear ---
    function release() {
      const pixels: Pixel[] = [];
      let minX = GRID_W,
        minY = GRID_H,
        maxX = 0,
        maxY = 0;
      for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
          const c = grid[y][x];
          if (c) {
            pixels.push({ dx: x * CELL, dy: y * CELL, color: c });
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (pixels.length === 0) return;
      playRelease();

      const canvasRect = drawCanvas!.getBoundingClientRect();
      const startX = canvasRect.left;
      const startY = canvasRect.top;

      const bbox = {
        x: minX * CELL,
        y: minY * CELL,
        w: (maxX - minX + 1) * CELL,
        h: (maxY - minY + 1) * CELL,
      };
      const cx = bbox.x + bbox.w / 2;
      const cy = bbox.y + bbox.h / 2;
      const radius =
        (Math.sqrt(bbox.w * bbox.w + bbox.h * bbox.h) / 2) * 0.85;
      const mass = pixels.length;

      // «Выпрыгивает» из канваса: импульс направлен в верхнюю полуплоскость
      // (вверх + случайный наклон по горизонтали), плюс лёгкое вращение.
      // Drag 0.97/frame погасит импульс примерно за 1.5 сек, после чего
      // floater перейдёт в обычный idle-дрейф.
      const launchAngle = Math.PI + Math.random() * Math.PI; // [180°, 360°] = верхняя полуплоскость в экранных координатах (y вверх = отрицательный)
      const launchSpeed = 2.2 + Math.random() * 1.6; // 2.2–3.8 px/frame
      floaters.push({
        pixels,
        bbox,
        bboxCenter: { x: cx, y: cy },
        radius,
        mass,
        x: startX,
        y: startY,
        vx: Math.cos(launchAngle) * launchSpeed,
        vy: Math.sin(launchAngle) * launchSpeed,
        phase: Math.random() * Math.PI * 2,
        bobAmp: 4 + Math.random() * 3,
        bobSpeed: 0.008 + Math.random() * 0.005,
        rotation: 0,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        bob: 0,
      });

      grid = Array.from({ length: GRID_H }, () =>
        Array<Cell>(GRID_W).fill(0),
      );
      renderGrid();
      uiHasDrawing = false;
      uiHasFloaters = true;
      updateUi();
    }

    function worldCenter(f: Floater) {
      return {
        x: f.x + f.bboxCenter.x,
        y: f.y + f.bboxCenter.y + f.bob,
      };
    }

    function clearAll() {
      playClear();
      floaters = [];
      grabbed = null;
      grid = Array.from({ length: GRID_H }, () =>
        Array<Cell>(GRID_W).fill(0),
      );
      renderGrid();
      physCanvas!.style.cursor = "default";
      physCanvas!.style.pointerEvents = "none";
      uiHasDrawing = false;
      uiHasFloaters = false;
      updateUi();
    }

    releaseBtn.addEventListener("click", release);
    clearBtn.addEventListener("click", clearAll);

    function hitTest(mx: number, my: number, f: Floater) {
      const cx = f.x + CENTER_X;
      const cy = f.y + CENTER_Y + f.bob;
      const tx = mx - cx;
      const ty = my - cy;
      const cos = Math.cos(-f.rotation);
      const sin = Math.sin(-f.rotation);
      const lx = tx * cos - ty * sin + CENTER_X;
      const ly = tx * sin + ty * cos + CENTER_Y;
      return (
        lx >= f.bbox.x &&
        lx <= f.bbox.x + f.bbox.w &&
        ly >= f.bbox.y &&
        ly <= f.bbox.y + f.bbox.h
      );
    }

    physCanvas.style.pointerEvents = "none";

    // --- Floater interaction (mouse) ---
    function tryGrabAt(mx: number, my: number) {
      for (let i = floaters.length - 1; i >= 0; i--) {
        if (hitTest(mx, my, floaters[i])) {
          grabbed = floaters[i];
          floaters.splice(i, 1);
          floaters.push(grabbed);
          grabOffset.x = mx - grabbed.x;
          grabOffset.y = my - (grabbed.y + grabbed.bob);
          grabbed.vx = 0;
          grabbed.vy = 0;
          grabPrev.x = grabbed.x;
          grabPrev.y = grabbed.y;
          mouseHistory = [{ x: mx, y: my, t: performance.now() }];
          physCanvas!.style.cursor = "grabbing";
          return true;
        }
      }
      return false;
    }

    function dragTo(mx: number, my: number) {
      if (!grabbed) return;
      let nx = mx - grabOffset.x;
      let ny = my - grabOffset.y - grabbed.bob;

      // Клампим позицию: центр bbox не должен уходить ближе radius к краям
      const r = grabbed.radius;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const desiredCx = nx + grabbed.bboxCenter.x;
      const desiredCy = ny + grabbed.bboxCenter.y + grabbed.bob;
      const clampedCx = Math.max(r, Math.min(w - r, desiredCx));
      const clampedCy = Math.max(r, Math.min(h - r, desiredCy));
      nx = clampedCx - grabbed.bboxCenter.x;
      ny = clampedCy - grabbed.bboxCenter.y - grabbed.bob;

      grabbed.x = nx;
      grabbed.y = ny;
      mouseHistory.push({ x: mx, y: my, t: performance.now() });
      const cutoff = performance.now() - 100;
      mouseHistory = mouseHistory.filter((p) => p.t > cutoff);
    }

    function releaseGrab() {
      if (!grabbed) return;
      if (mouseHistory.length >= 2) {
        const first = mouseHistory[0];
        const last = mouseHistory[mouseHistory.length - 1];
        const dt = Math.max(last.t - first.t, 16);
        grabbed.vx = ((last.x - first.x) / dt) * 8;
        grabbed.vy = ((last.y - first.y) / dt) * 8;
        const maxV = 12;
        const speed = Math.sqrt(
          grabbed.vx * grabbed.vx + grabbed.vy * grabbed.vy,
        );
        if (speed > maxV) {
          grabbed.vx = (grabbed.vx / speed) * maxV;
          grabbed.vy = (grabbed.vy / speed) * maxV;
        }
        grabbed.rotSpeed =
          (Math.random() - 0.5) * 0.02 * Math.min(speed / 10, 1);
      }
      grabbed = null;
      physCanvas!.style.cursor = "default";
      physCanvas!.style.pointerEvents = "none";
    }

    function onPhysMouseDown(e: MouseEvent) {
      if (tryGrabAt(e.clientX, e.clientY)) {
        e.preventDefault();
      }
    }
    function onPhysMouseMove(e: MouseEvent) {
      if (grabbed) dragTo(e.clientX, e.clientY);
    }
    function onWindowMouseMove(e: MouseEvent) {
      if (grabbed) return;
      const mx = e.clientX;
      const my = e.clientY;
      let over = false;
      for (let i = floaters.length - 1; i >= 0; i--) {
        if (hitTest(mx, my, floaters[i])) {
          over = true;
          break;
        }
      }
      physCanvas!.style.pointerEvents = over ? "auto" : "none";
      physCanvas!.style.cursor = over ? "grab" : "default";
    }
    function onWindowMouseUpGrab() {
      releaseGrab();
    }

    physCanvas.addEventListener("mousedown", onPhysMouseDown);
    physCanvas.addEventListener("mousemove", onPhysMouseMove);
    window.addEventListener("mousemove", onWindowMouseMove);
    window.addEventListener("mouseup", onWindowMouseUpGrab);

    // --- Floater interaction (touch) ---
    function onWindowTouchStart(e: TouchEvent) {
      if (e.touches.length === 0 || grabbed) return;
      if (e.target === drawCanvas) return;
      const t = e.touches[0];
      if (tryGrabAt(t.clientX, t.clientY)) {
        e.preventDefault();
      }
    }
    function onWindowTouchMove(e: TouchEvent) {
      if (!grabbed || e.touches.length === 0) return;
      e.preventDefault();
      const t = e.touches[0];
      dragTo(t.clientX, t.clientY);
    }
    function onWindowTouchEnd() {
      if (grabbed) releaseGrab();
    }

    window.addEventListener("touchstart", onWindowTouchStart, {
      passive: false,
    });
    window.addEventListener("touchmove", onWindowTouchMove, { passive: false });
    window.addEventListener("touchend", onWindowTouchEnd);
    window.addEventListener("touchcancel", onWindowTouchEnd);

    window.addEventListener("resize", resizePhys);

    // --- COLLISION RESOLUTION (do not "improve") ---
    function resolveCollision(a: Floater, b: Floater) {
      const ca = worldCenter(a);
      const cb = worldCenter(b);
      const dx = cb.x - ca.x;
      const dy = cb.y - ca.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = a.radius + b.radius;
      if (dist >= minDist || dist === 0) return;

      const nx = dx / dist;
      const ny = dy / dist;
      const overlap = minDist - dist;
      const aGrabbed = a === grabbed;
      const bGrabbed = b === grabbed;
      if (aGrabbed && bGrabbed) return;

      if (aGrabbed) {
        b.x += nx * overlap;
        b.y += ny * overlap;
      } else if (bGrabbed) {
        a.x -= nx * overlap;
        a.y -= ny * overlap;
      } else {
        const totalMass = a.mass + b.mass;
        const aShare = b.mass / totalMass;
        const bShare = a.mass / totalMass;
        a.x -= nx * overlap * aShare;
        a.y -= ny * overlap * aShare;
        b.x += nx * overlap * bShare;
        b.y += ny * overlap * bShare;
      }

      if (aGrabbed || bGrabbed) {
        const free = aGrabbed ? b : a;
        const fnx = aGrabbed ? nx : -nx;
        const fny = aGrabbed ? ny : -ny;
        const cursorAlongNormal = grabVel.x * fnx + grabVel.y * fny;
        if (cursorAlongNormal > 0) {
          const freeAlongNormal = free.vx * fnx + free.vy * fny;
          const bounce = 1.15;
          const targetSpeed = cursorAlongNormal * bounce;
          if (freeAlongNormal < targetSpeed) {
            const delta = targetSpeed - freeAlongNormal;
            free.vx += fnx * delta;
            free.vy += fny * delta;
            free.rotSpeed +=
              (Math.random() - 0.5) *
              0.003 *
              Math.min(cursorAlongNormal / 3, 1);
            playCollide(cursorAlongNormal);
          }
        }
        return;
      }

      const dvx = b.vx - a.vx;
      const dvy = b.vy - a.vy;
      const velAlongNormal = dvx * nx + dvy * ny;
      if (velAlongNormal > 0) return;
      const restitution = 0.6;
      const impulse =
        (-(1 + restitution) * velAlongNormal) / (1 / a.mass + 1 / b.mass);
      a.vx -= (impulse * nx) / a.mass;
      a.vy -= (impulse * ny) / a.mass;
      b.vx += (impulse * nx) / b.mass;
      b.vy += (impulse * ny) / b.mass;
      a.rotSpeed += (Math.random() - 0.5) * 0.005;
      b.rotSpeed += (Math.random() - 0.5) * 0.005;
      playCollide(Math.abs(velAlongNormal));
    }

    let t = 0;
    let rafId = 0;
    function tick() {
      physCtx!.clearRect(0, 0, physCanvas!.width, physCanvas!.height);
      t++;
      const w = physCanvas!.width;
      const h = physCanvas!.height;

      if (grabbed) {
        grabVel.x = grabbed.x - grabPrev.x;
        grabVel.y = grabbed.y - grabPrev.y;
        grabPrev.x = grabbed.x;
        grabPrev.y = grabbed.y;
      } else {
        grabVel.x = 0;
        grabVel.y = 0;
      }

      for (const f of floaters) {
        if (f === grabbed) {
          f.bob = Math.sin(t * f.bobSpeed + f.phase) * f.bobAmp * 0.3;
        } else {
          f.vx *= 0.97;
          f.vy *= 0.97;
          f.rotSpeed *= 0.985;

          const minSpeed = 0.15;
          const speed = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
          if (speed < minSpeed && Math.abs(f.rotSpeed) < 0.001) {
            f.vx = (Math.random() - 0.5) * 0.25;
            f.vy = (Math.random() - 0.5) * 0.25;
          }

          f.x += f.vx;
          f.y += f.vy;

          // Отскок от краёв экрана: смотрим на центр bbox в мировых
          // координатах и радиус — флипаем скорость + клампим позицию,
          // чтобы floater не уходил за край и не «терялся».
          const wcx = f.x + f.bboxCenter.x;
          const wcy = f.y + f.bboxCenter.y + f.bob;
          const r = f.radius;
          if (wcx - r < 0) {
            f.vx = Math.abs(f.vx) || 0.5;
            f.x = r - f.bboxCenter.x;
          } else if (wcx + r > w) {
            f.vx = -Math.abs(f.vx) || -0.5;
            f.x = w - r - f.bboxCenter.x;
          }
          if (wcy - r < 0) {
            f.vy = Math.abs(f.vy) || 0.5;
            f.y = r - f.bboxCenter.y - f.bob;
          } else if (wcy + r > h) {
            f.vy = -Math.abs(f.vy) || -0.5;
            f.y = h - r - f.bboxCenter.y - f.bob;
          }

          f.bob = Math.sin(t * f.bobSpeed + f.phase) * f.bobAmp;
          f.rotation += f.rotSpeed;
        }
      }

      for (let iter = 0; iter < 3; iter++) {
        for (let i = 0; i < floaters.length; i++) {
          for (let j = i + 1; j < floaters.length; j++) {
            resolveCollision(floaters[i], floaters[j]);
          }
        }
      }

      for (const f of floaters) {
        const cx = f.x + CENTER_X;
        const cy = f.y + CENTER_Y + f.bob;
        physCtx!.save();
        physCtx!.translate(cx, cy);
        physCtx!.rotate(f.rotation);
        physCtx!.translate(-CENTER_X, -CENTER_Y);
        for (const p of f.pixels) {
          physCtx!.fillStyle = p.color;
          physCtx!.fillRect(p.dx, p.dy, CELL, CELL);
        }
        physCtx!.restore();
      }

      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resizePhys);
      drawCanvas.removeEventListener("mousedown", onDrawMouseDown);
      drawCanvas.removeEventListener("mousemove", onDrawMouseMove);
      window.removeEventListener("mouseup", onWindowMouseUp);
      drawCanvas.removeEventListener("touchstart", onDrawTouchStart);
      drawCanvas.removeEventListener("touchmove", onDrawTouchMove);
      drawCanvas.removeEventListener("touchend", onDrawTouchEnd);
      drawCanvas.removeEventListener("touchcancel", onDrawTouchEnd);
      physCanvas.removeEventListener("mousedown", onPhysMouseDown);
      physCanvas.removeEventListener("mousemove", onPhysMouseMove);
      window.removeEventListener("mousemove", onWindowMouseMove);
      window.removeEventListener("mouseup", onWindowMouseUpGrab);
      window.removeEventListener("touchstart", onWindowTouchStart);
      window.removeEventListener("touchmove", onWindowTouchMove);
      window.removeEventListener("touchend", onWindowTouchEnd);
      window.removeEventListener("touchcancel", onWindowTouchEnd);
      releaseBtn.removeEventListener("click", release);
      clearBtn.removeEventListener("click", clearAll);
      wrapper.removeEventListener("mouseenter", onWrapperEnter);
      wrapper.removeEventListener("mouseleave", onWrapperLeave);
      wrapper.removeEventListener("mousemove", onWrapperMouseMove);
    };
  }, []);

  return (
    <>
      <canvas
        ref={physRef}
        aria-hidden
        className="fixed inset-0 z-50"
        style={{
          pointerEvents: "none",
          width: "100vw",
          height: "100vh",
        }}
      />
      <div
        ref={wrapperRef}
        className="relative w-[360px] h-[200px] shrink-0"
      >
        <canvas
          ref={drawRef}
          width={360}
          height={200}
          className="block w-[360px] h-[200px] bg-[var(--pp-fill)] border border-[var(--pp-border)] rounded-[8px] cursor-crosshair"
          style={{
            imageRendering: "pixelated",
            touchAction: "none",
          }}
        />
        <div
          ref={buttonsRef}
          className="absolute top-2 right-2 flex gap-2 transition-opacity duration-200"
          style={{ opacity: 0, pointerEvents: "none" }}
        >
          <button
            ref={clearBtnRef}
            type="button"
            className="text-[13px] leading-none text-[var(--fg)]/70 bg-[var(--bg)]/60 backdrop-blur-sm border border-[var(--fg)]/20 hover:border-[var(--fg)]/40 hover:text-[var(--fg)] cursor-pointer px-3 py-[7px] rounded-full transition-colors"
          >
            {t.clear}
          </button>
          <button
            ref={releaseBtnRef}
            type="button"
            className="text-[13px] leading-none text-[#4a9eff] bg-[var(--bg)]/60 backdrop-blur-sm border border-[#4a9eff] hover:bg-[#4a9eff]/15 cursor-pointer px-3 py-[7px] rounded-full transition-colors"
          >
            {t.release}
          </button>
        </div>
        <p
          ref={hintRef}
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-[16px] leading-[1.4] text-[var(--fg)]/45 transition-opacity duration-200"
          style={{ opacity: 1 }}
        >
          {t.hint}
        </p>
      </div>
    </>
  );
}
