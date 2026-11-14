/**
 * React Bits — CardSwap Component
 * JavaScript + CSS Variant adapted for SANVEX Portfolio
 * Features 3D Spring Physics, Fling / Drag, Parallax, Autoplay & Hover Spread
 */

(function () {
  "use strict";

  const PERSPECTIVE = 900;
  const TAU = Math.PI * 2;
  const STEP = 1 / 240;
  const PAD = 32;
  const AXES = ['x', 'y', 'z', 'r', 'p'];
  const DOWN = { x: 0, y: 1 };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function stackBounds({ width, height, cardDistance, verticalDistance, depth, skewAmount, visible, hoverSpread }) {
    const slope = Math.tan((skewAmount * Math.PI) / 180);
    const spread = 1 + Math.max(0, hoverSpread);
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < visible; i++) {
      const scale = PERSPECTIVE / (PERSPECTIVE + i * depth);
      for (const u of [-width / 2, width / 2]) {
        for (const v of [-height / 2, height / 2]) {
          const x = (i * cardDistance * spread + u) * scale;
          const y = (-i * verticalDistance * spread + v + u * slope) * scale;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }
    return {
      width: Math.ceil(maxX - minX + PAD * 2),
      height: Math.ceil(maxY - minY + PAD * 2),
      originX: PAD - minX,
      originY: PAD - minY
    };
  }

  class CardSwapInstance {
    constructor(rootElement, options = {}) {
      this.root = rootElement;
      this.stage = this.root.querySelector('.card-swap-stage');
      this.slots = Array.from(this.root.querySelectorAll('.card-swap-slot'));
      this.count = this.slots.length;
      if (!this.count || !this.stage) return;

      this.options = {
        width: options.width || 440,
        height: options.height || 360,
        cardDistance: options.cardDistance || 48,
        verticalDistance: options.verticalDistance || 56,
        depth: options.depth || 80,
        skewAmount: options.skewAmount || 5,
        visibleCards: Math.min(this.count, options.visibleCards || 4),
        delay: options.delay || 4000,
        autoplay: options.autoplay !== false,
        pauseOnHover: options.pauseOnHover !== false,
        draggable: options.draggable !== false,
        speed: options.speed || 1,
        bounce: options.bounce !== undefined ? options.bounce : 0.35,
        parallax: options.parallax !== undefined ? options.parallax : 0.5,
        hoverSpread: options.hoverSpread !== undefined ? options.hoverSpread : 0.12,
        dim: options.dim !== undefined ? options.dim : 0.45,
        cardRadius: options.cardRadius || 18,
        ...options
      };

      this.shades = this.slots.map(s => s.querySelector('.card-swap-shade'));
      this.init();
    }

    init() {
      const s = this.options;
      const count = this.count;
      const now = performance.now();

      this.bounds = stackBounds({
        width: s.width,
        height: s.height,
        cardDistance: s.cardDistance,
        verticalDistance: s.verticalDistance,
        depth: Math.max(0, s.depth),
        skewAmount: s.skewAmount,
        visible: s.visibleCards,
        hoverSpread: s.hoverSpread
      });

      this.settings = {
        ...s,
        bounds: this.bounds
      };

      this.applyStyles();

      this.deck = Array.from({ length: count }, (_, index) => ({
        el: this.slots[index],
        shade: this.shades[index],
        index,
        pos: index,
        from: index,
        hold: 0,
        nudge: 0,
        phase: 'rest',
        dir: { x: 0, y: 1 },
        tilt: 0,
        top: 0,
        under: false,
        x: 0,
        y: 0,
        z: 0,
        r: 0,
        p: 0,
        v: { x: 0, y: 0, z: 0, r: 0, p: 0 }
      }));

      this.state = {
        order: this.deck.map(c => c.index),
        raf: 0,
        last: 0,
        timer: 0,
        queue: [],
        layers: 0,
        scale: 1,
        hovered: false,
        overCard: false,
        inView: true,
        drag: null,
        spread: 0,
        spreadV: 0,
        px: 0,
        py: 0,
        pvx: 0,
        pvy: 0,
        tx: 0,
        ty: 0,
        dragged: false,
        autoplay: s.autoplay,
        delay: s.delay
      };

      this.deck.forEach(card => {
        card.from = 0;
        card.hold = now + (card.pos * 70) / s.speed;
        Object.assign(card, this.slotCoords(card.pos));
      });

      this.bindEvents();
      this.fit();
      this.writeStage();
      this.deck.forEach(c => this.writeCard(c));
      this.updateDots();
      this.wake();
      this.schedule();
    }

    applyStyles() {
      const s = this.settings;
      const b = this.bounds;
      this.root.style.setProperty('--swap-w', `${s.width}px`);
      this.root.style.setProperty('--swap-h', `${s.height}px`);
      this.root.style.setProperty('--swap-ox', `${b.originX}px`);
      this.root.style.setProperty('--swap-oy', `${b.originY}px`);
      this.root.style.setProperty('--swap-stage-w', `${b.width}px`);
      this.root.style.setProperty('--swap-stage-h', `${b.height}px`);
      this.root.style.setProperty('--swap-radius', `${s.cardRadius}px`);
    }

    slotCoords(position) {
      const s = this.settings;
      const q = Math.min(position, s.visibleCards);
      const spread = 1 + this.state.spread;
      return {
        x: q * s.cardDistance * spread,
        y: -q * s.verticalDistance * spread,
        z: -q * s.depth,
        r: 0,
        p: q
      };
    }

    clearance(dir) {
      const s = this.settings;
      return Math.abs(dir.x) * s.width + Math.abs(dir.y) * s.height + 12;
    }

    targetOf(card, time) {
      const s = this.settings;
      if (card.phase === 'exit') {
        const base = this.slotCoords(0);
        const reach = this.clearance(card.dir) * 1.3;
        return {
          x: base.x + card.dir.x * reach,
          y: base.y + card.dir.y * reach,
          z: base.z,
          r: card.tilt,
          p: 0
        };
      }
      if (card.phase === 'enter') {
        const base = this.slotCoords(0);
        return {
          x: base.x,
          y: base.y + this.clearance(DOWN) * 1.3,
          z: base.z,
          r: 0,
          p: card.p
        };
      }
      const position = (time < card.hold ? card.from : card.pos) + card.nudge;
      return this.slotCoords(Math.max(0, position));
    }

    layerOf(card) {
      if (card.top) return 1000 + card.top;
      if (card.under) return 1;
      return 10 + (this.count - card.pos) * 2;
    }

    writeCard(card) {
      const s = this.settings;
      const el = card.el;
      if (!el) return;
      el.style.transform = `translate3d(${card.x.toFixed(2)}px, ${card.y.toFixed(2)}px, ${card.z.toFixed(2)}px) rotate(${card.r.toFixed(3)}deg) skewY(${s.skewAmount}deg)`;
      el.style.zIndex = String(this.layerOf(card));

      const fade = clamp(s.visibleCards - card.p, 0, 1);
      el.style.opacity = fade < 1 ? fade.toFixed(3) : '';
      el.style.visibility = fade <= 0.001 ? 'hidden' : '';

      if (card.shade) {
        const depthT = clamp(card.p / Math.max(1, s.visibleCards - 1), 0, 1);
        card.shade.style.opacity = (s.dim * 0.62 * depthT).toFixed(3);
      }

      el.style.cursor = card.phase === 'drag' ? 'grabbing' : card.pos > 0 ? 'pointer' : s.draggable ? 'grab' : '';
      if (card.pos === 0) el.setAttribute('data-front', '');
      else el.removeAttribute('data-front');
    }

    writeStage() {
      const s = this.settings;
      const ox = s.bounds.originX + this.state.px;
      const oy = s.bounds.originY + this.state.py;
      this.stage.style.perspectiveOrigin = `${ox.toFixed(2)}px ${oy.toFixed(2)}px`;
    }

    integrate(card, target, omega, zeta, dt) {
      const k = omega * omega;
      const d = 2 * zeta * omega;
      const steps = Math.max(1, Math.ceil(dt / STEP));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        for (const axis of AXES) {
          const velocity = card.v[axis] + (k * (target[axis] - card[axis]) - d * card.v[axis]) * h;
          card.v[axis] = velocity;
          card[axis] += velocity * h;
        }
      }
    }

    scalar(value, velocity, target, omega, zeta, dt) {
      const k = omega * omega;
      const d = 2 * zeta * omega;
      const steps = Math.max(1, Math.ceil(dt / STEP));
      const h = dt / steps;
      let x = value;
      let v = velocity;
      for (let i = 0; i < steps; i++) {
        v += (k * (target - x) - d * v) * h;
        x += v * h;
      }
      return [x, v];
    }

    frame(time) {
      this.state.raf = 0;
      const s = this.settings;
      const dt = this.state.last ? Math.min(0.05, (time - this.state.last) / 1000) : 1 / 60;
      this.state.last = time;
      const speed = s.speed;
      const restOmega = TAU * 1.7 * speed;
      const restZeta = 1 - 0.72 * s.bounce;
      const exitOmega = TAU * 1.9 * speed;
      let busy = false;

      const spreadTarget = this.state.hovered ? s.hoverSpread : 0;
      [this.state.spread, this.state.spreadV] = this.scalar(this.state.spread, this.state.spreadV, spreadTarget, TAU * 1.4, 0.9, dt);
      [this.state.px, this.state.pvx] = this.scalar(this.state.px, this.state.pvx, this.state.tx, TAU * 1.1, 1, dt);
      [this.state.py, this.state.pvy] = this.scalar(this.state.py, this.state.pvy, this.state.ty, TAU * 1.1, 1, dt);

      if (
        Math.abs(this.state.spread - spreadTarget) > 0.0005 ||
        Math.abs(this.state.spreadV) > 0.0005 ||
        Math.abs(this.state.px - this.state.tx) > 0.05 ||
        Math.abs(this.state.py - this.state.ty) > 0.05
      ) {
        busy = true;
      }

      this.writeStage();

      for (const card of this.deck) {
        if (card.phase === 'drag') {
          busy = true;
          this.writeCard(card);
          continue;
        }
        const target = this.targetOf(card, time);
        const moving = card.phase === 'exit' || card.phase === 'enter';
        this.integrate(card, target, moving ? exitOmega : restOmega, moving ? 1 : restZeta, dt);

        if (card.phase === 'exit') {
          const base = this.slotCoords(0);
          const travelled = (card.x - base.x) * card.dir.x + (card.y - base.y) * card.dir.y;
          if (travelled >= this.clearance(card.dir)) {
            card.phase = 'rest';
            card.top = 0;
            card.hold = 0;
          }
        } else if (card.phase === 'enter') {
          const base = this.slotCoords(0);
          if (card.y - base.y >= this.clearance(DOWN)) {
            card.phase = 'rest';
            card.under = false;
            card.hold = 0;
          }
        }

        if (card.hold > time || card.phase !== 'rest') busy = true;
        for (const axis of AXES) {
          const limit = axis === 'p' ? 0.001 : 0.02;
          if (Math.abs(target[axis] - card[axis]) > limit || Math.abs(card.v[axis]) > limit) busy = true;
        }
        this.writeCard(card);
      }

      if (busy) {
        this.state.raf = requestAnimationFrame(t => this.frame(t));
      } else {
        this.state.last = 0;
        for (const card of this.deck) {
          if (card.top && card.phase === 'rest') card.top = 0;
        }
      }
    }

    wake() {
      if (!this.state.raf) this.state.raf = requestAnimationFrame(t => this.frame(t));
    }

    paused() {
      const s = this.settings;
      return (
        !s.autoplay ||
        this.count < 2 ||
        (s.pauseOnHover && this.state.overCard) ||
        this.state.drag ||
        !this.state.inView ||
        document.visibilityState === 'hidden'
      );
    }

    schedule() {
      clearTimeout(this.state.timer);
      this.state.timer = 0;
      if (this.paused()) return;
      this.state.timer = window.setTimeout(
        () => {
          this.state.timer = 0;
          this.shift(1);
        },
        Math.max(400, this.settings.delay)
      );
    }

    settleOrder(time, stagger) {
      this.state.order.forEach((index, position) => {
        const card = this.deck[index];
        if (card.pos === position) return;
        card.from = card.pos;
        card.pos = position;
        card.hold = time + Math.max(0, position) * stagger;
      });
    }

    shift(direction, options = {}) {
      if (this.count < 2) return;
      const s = this.settings;
      const time = performance.now();
      const stagger = 0.05 / s.speed;

      if (direction > 0) {
        const front = this.deck[this.state.order[0]];
        this.state.order = [...this.state.order.slice(1), front.index];
        this.settleOrder(time, stagger * 1000);
        front.phase = 'exit';
        front.dir = options.dir || DOWN;
        front.tilt = options.tilt || 0;
        front.top = ++this.state.layers;
        front.under = false;
        front.nudge = 0;
        front.hold = 0;
        if (options.velocity) {
          front.v.x = options.velocity.x;
          front.v.y = options.velocity.y;
        }
      } else {
        const back = this.deck[this.state.order[this.count - 1]];
        this.state.order = [back.index, ...this.state.order.slice(0, this.count - 1)];
        this.settleOrder(time, stagger * 1000);
        back.phase = 'enter';
        back.top = 0;
        back.under = true;
        back.nudge = 0;
        back.hold = 0;
      }

      this.deck.forEach(c => {
        if (c.phase === 'rest') c.nudge = 0;
      });

      this.updateDots();
      this.wake();
      this.schedule();
    }

    updateDots() {
      const activeIdx = this.state.order[0];
      const dots = document.querySelectorAll('.card-swap-dot');
      dots.forEach((dot, idx) => {
        if (idx === activeIdx) dot.classList.add('active');
        else dot.classList.remove('active');
      });
    }

    goTo(position) {
      this.state.queue.forEach(clearTimeout);
      this.state.queue = [];
      const gap = 110 / this.settings.speed;
      for (let i = 0; i < position; i++) {
        this.state.queue.push(window.setTimeout(() => this.shift(1), i * gap));
      }
    }

    fit() {
      const s = this.settings;
      const w = this.root.clientWidth;
      const h = this.root.clientHeight;
      const scale = Math.min(1, (w - 30) / s.bounds.width, h > 0 ? (h - 20) / s.bounds.height : 1);
      this.state.scale = scale > 0 ? scale : 1;
      this.stage.style.transform = `translate(-50%, -50%) scale(${this.state.scale.toFixed(4)})`;
    }

    local(event) {
      const box = this.root.getBoundingClientRect();
      return { x: event.clientX - box.left, y: event.clientY - box.top, w: box.width, h: box.height };
    }

    bindEvents() {
      const root = this.root;
      const s = this.settings;

      const onMove = event => {
        if (event.pointerType !== 'touch') {
          const point = this.local(event);
          const nx = clamp((point.x / Math.max(1, point.w)) * 2 - 1, -1, 1);
          const ny = clamp((point.y / Math.max(1, point.h)) * 2 - 1, -1, 1);
          this.state.tx = nx * s.parallax * 0.35 * s.bounds.width;
          this.state.ty = ny * s.parallax * 0.35 * s.bounds.height;
          this.state.hovered = true;
          const overCard = Boolean(event.target.closest?.('.card-swap-slot'));
          if (overCard !== this.state.overCard) {
            this.state.overCard = overCard;
            this.schedule();
          }
          this.wake();
        }
        const drag = this.state.drag;
        if (!drag || drag.id !== event.pointerId) return;
        const dx = (event.clientX - drag.startX) / this.state.scale;
        const dy = (event.clientY - drag.startY) / this.state.scale;
        if (!drag.active) {
          if (Math.hypot(dx, dy) < 5) return;
          drag.active = true;
          this.state.dragged = true;
          const card = this.deck[drag.index];
          card.phase = 'drag';
          card.v = { x: 0, y: 0, z: 0, r: 0, p: 0 };
          try { root.setPointerCapture?.(event.pointerId); } catch (_) {}
          root.style.cursor = 'grabbing';
        }
        const card = this.deck[drag.index];
        const base = this.slotCoords(0);
        card.x = base.x + dx;
        card.y = base.y + dy;
        card.z = base.z;
        card.r = clamp(dx * 0.035, -9, 9);
        card.p = 0;
        const time = performance.now();
        drag.samples.push({ x: card.x, y: card.y, t: time });
        while (drag.samples.length > 2 && time - drag.samples[0].t > 90) drag.samples.shift();
        const progress = clamp(Math.hypot(dx, dy) / (Math.min(s.width, s.height) * 0.3), 0, 1);
        const next = this.deck[this.state.order[1]];
        if (next && next.phase === 'rest') next.nudge = -0.22 * progress;
        this.wake();
      };

      const onLeave = event => {
        if (event.pointerType === 'touch') return;
        if (this.state.drag?.active) return;
        this.state.hovered = false;
        this.state.overCard = false;
        this.state.tx = 0;
        this.state.ty = 0;
        this.schedule();
        this.wake();
      };

      const onDown = event => {
        this.state.dragged = false;
        if (!s.draggable || event.button > 0 || this.count < 2) return;
        // Don't drag if clicking interactive elements inside card
        if (event.target.closest('button, a, input, select, .open-coming-soon-btn')) return;

        const target = event.target.closest?.('.card-swap-slot');
        if (!target || !root.contains(target)) return;
        const index = Number(target.getAttribute('data-swap-index'));
        if (index !== this.state.order[0] || this.deck[index].phase !== 'rest') return;
        this.state.drag = {
          id: event.pointerId,
          index,
          startX: event.clientX,
          startY: event.clientY,
          active: false,
          samples: []
        };
        this.schedule();
      };

      const onUp = event => {
        const drag = this.state.drag;
        if (!drag || drag.id !== event.pointerId) return;
        this.state.drag = null;
        root.style.cursor = '';
        if (!drag.active) {
          this.schedule();
          return;
        }
        try { root.releasePointerCapture?.(event.pointerId); } catch (_) {}
        const card = this.deck[drag.index];
        const base = this.slotCoords(0);
        const first = drag.samples[0];
        const lastSample = drag.samples[drag.samples.length - 1];
        const span = first && lastSample ? Math.max(0.016, (lastSample.t - first.t) / 1000) : 1;
        const velocity =
          first && lastSample && lastSample !== first
            ? { x: (lastSample.x - first.x) / span, y: (lastSample.y - first.y) / span }
            : { x: 0, y: 0 };
        const offset = { x: card.x - base.x, y: card.y - base.y };
        const distance = Math.hypot(offset.x, offset.y);
        const fling = Math.hypot(velocity.x, velocity.y);
        const next = this.deck[this.state.order[1]];
        if (next) next.nudge = 0;

        if (event.type !== 'pointercancel' && (distance > Math.min(s.width, s.height) * 0.28 || fling > 650)) {
          const aim = { x: offset.x + velocity.x * 0.12, y: offset.y + velocity.y * 0.12 };
          const length = Math.hypot(aim.x, aim.y) || 1;
          card.phase = 'rest';
          this.shift(1, {
            dir: { x: aim.x / length, y: aim.y / length },
            tilt: card.r,
            velocity
          });
        } else {
          card.phase = 'rest';
          card.v.x = velocity.x;
          card.v.y = velocity.y;
          this.wake();
          this.schedule();
        }
      };

      const onClick = event => {
        if (this.state.dragged) {
          this.state.dragged = false;
          return;
        }
        if (event.target.closest('button, a, .open-coming-soon-btn')) return;
        const target = event.target.closest?.('.card-swap-slot');
        if (!target || !root.contains(target)) return;
        const index = Number(target.getAttribute('data-swap-index'));
        const position = this.state.order.indexOf(index);
        if (position > 0) this.goTo(position);
      };

      root.addEventListener('pointermove', onMove);
      root.addEventListener('pointerleave', onLeave);
      root.addEventListener('pointerdown', onDown);
      root.addEventListener('pointerup', onUp);
      root.addEventListener('pointercancel', onUp);
      root.addEventListener('click', onClick);

      window.addEventListener('resize', () => this.fit());

      // Navigation buttons
      const prevBtn = document.getElementById('cardSwapPrevBtn');
      const nextBtn = document.getElementById('cardSwapNextBtn');
      if (prevBtn) prevBtn.addEventListener('click', () => this.shift(-1));
      if (nextBtn) nextBtn.addEventListener('click', () => this.shift(1));

      // Indicator dots
      const dots = document.querySelectorAll('.card-swap-dot');
      dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
          const pos = this.state.order.indexOf(idx);
          if (pos > 0) this.goTo(pos);
        });
      });
    }
  }

  // Auto initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    const swapRoot = document.getElementById('sanvexCardSwap');
    if (swapRoot) {
      window.sanvexCardSwapInstance = new CardSwapInstance(swapRoot, {
        width: 580,
        height: 460,
        cardDistance: 56,
        verticalDistance: 66,
        depth: 90,
        skewAmount: 5,
        visibleCards: 4,
        delay: 4000,
        autoplay: true,
        pauseOnHover: true,
        draggable: true,
        speed: 1,
        bounce: 0.35,
        parallax: 0.5,
        hoverSpread: 0.12,
        dim: 0.45,
        cardRadius: 22
      });
    }
  });

})();
