/**
 * SlideCommit Component - Vanilla JS + CSS Adaptation of React Bits Component
 * Preserves exact spring physics, pointer drag, squashing, clip-path painting, and keyboard accessibility.
 */
(function() {
  'use strict';

  const PAD = 4;
  const SQUASH_MAX = 0.08;
  const SQUASH_DIV = 110;
  const SWELL = 1.03;
  const MIN_PENDING = 400;

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  const velocityOf = (hist) => {
    if (hist.length < 2) return 0;
    const [t0, x0] = hist[0];
    const [t1, x1] = hist[hist.length - 1];
    return ((x1 - x0) / Math.max(1, t1 - t0)) * 1000;
  };

  class SlideCommit {
    constructor(container, options = {}) {
      if (!container) return;
      this.container = container;
      this.options = Object.assign({
        label: "Let's Connect ↗",
        doneLabel: "Connected! ↗",
        errorLabel: "Please fill details",
        trackColor: "#15171a",
        handleColor: "#d5fa01",
        successColor: "#22c55e",
        dangerColor: "#e5484d",
        height: 58,
        radius: 29,
        speed: 50,
        returnBounce: 0.38,
        landingDip: 0.026,
        holdMs: 2200,
        disabled: false,
        onConfirm: null,
        onDone: null,
        onError: null
      }, options);

      this.phase = 'idle'; // idle | pending | done | error
      this.held = false;
      this.hot = false;
      this.x = 0;
      this.anchor = 0;
      this.shown = 1;
      this.pulse = 1;
      this.width = 320;
      this.grip = null;
      this.runId = 0;
      this.animId = null;

      this.initDOM();
      this.updateDimensions();
      this.bindEvents();
      this.render();

      window.addEventListener('resize', () => {
        this.updateDimensions();
        this.render();
      });
    }

    initDOM() {
      this.container.innerHTML = `
        <div class="sc-root" data-phase="idle">
          <div class="sc-track" role="presentation">
            <span class="sc-track-label" aria-hidden="true">
              <span class="sc-label-text">${this.options.label}</span>
              <span class="sc-error-text">${this.options.errorLabel}</span>
            </span>
            <div class="sc-capsule" role="slider" tabindex="0"
              aria-label="${this.options.label}"
              aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
              <div class="sc-content">
                <span class="sc-icon-arrow" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </span>
                <span class="sc-spinner-wrap" aria-hidden="true">
                  <svg class="sc-spinner" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-opacity="0.25"></circle>
                    <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"></path>
                  </svg>
                </span>
                <span class="sc-icon-done" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>${this.options.doneLabel}</span>
                </span>
              </div>
            </div>
            <span class="sr-only" aria-live="polite"></span>
          </div>
        </div>
      `;

      this.root = this.container.querySelector('.sc-root');
      this.track = this.container.querySelector('.sc-track');
      this.capsule = this.container.querySelector('.sc-capsule');
      this.content = this.container.querySelector('.sc-content');
      this.trackLabel = this.container.querySelector('.sc-track-label');
      this.arrowIcon = this.container.querySelector('.sc-icon-arrow');
      this.srStatus = this.container.querySelector('.sr-only');
    }

    updateDimensions() {
      this.width = Math.max(200, this.track.getBoundingClientRect().width || this.container.clientWidth || 320);
      const h = this.options.height;
      this.GRIP = h - PAD * 2;
      this.INNER = this.width - PAD * 2;
      this.TRAVEL = Math.max(1, this.INNER - this.GRIP);
      this.r = clamp(this.options.radius, 0, h / 2);
      this.gripR = Math.max(0, this.r - PAD);

      // Spring parameters
      const k = 260 + (clamp(this.options.speed, 0, 100) / 100) * 640;
      this.mass = 0.9;
      this.critical = 2 * Math.sqrt(k * this.mass);
      this.stiffness = k;
      this.homeDamping = this.critical * (1 - clamp(this.options.returnBounce, 0, 0.5));
    }

    setPhase(phase) {
      this.phase = phase;
      this.root.setAttribute('data-phase', phase);
      if (this.srStatus) {
        if (phase === 'pending') this.srStatus.textContent = 'Connecting...';
        else if (phase === 'done') this.srStatus.textContent = this.options.doneLabel;
        else if (phase === 'error') this.srStatus.textContent = this.options.errorLabel;
      }
    }

    local(clientX) {
      const rect = this.track.getBoundingClientRect();
      if (!rect || rect.width <= 0) return 0;
      return (clientX - rect.left) / (rect.width / this.width);
    }

    render() {
      const seen = clamp(this.x, 0, this.TRAVEL);
      const edge = seen + this.GRIP + clamp(this.anchor - seen, 0, this.TRAVEL);
      const insetRight = Math.max(0, this.INNER - edge);
      
      // Capsule clip-path unfurls as you drag
      this.capsule.style.clipPath = `inset(0 ${insetRight}px 0 0 round ${this.gripR}px)`;

      // Squash and stretch
      const swell = (this.hot && !this.held && this.phase === 'idle') ? SWELL : 1;
      const q = 1 - Math.min(SQUASH_MAX, Math.max(0, -this.x) / SQUASH_DIV);
      this.capsule.style.transform = `scale(${q * swell}, ${swell / q})`;
      this.capsule.style.transformOrigin = `${seen}px 50%`;

      // Active content centering
      const contentX = (seen + edge) / 2 - this.INNER / 2;
      this.content.style.transform = `translateX(${contentX}px)`;

      // Fade track label as handle moves past 55%
      const labelOpacity = clamp(1 - (seen / (this.TRAVEL * 0.55)), 0, 1);
      this.trackLabel.style.opacity = String(labelOpacity);

      // Arrow fade near commit
      const arrowOpacity = this.shown * clamp(1 - (seen - this.TRAVEL * 0.55) / (this.TRAVEL * 0.4), 0, 1);
      this.arrowIcon.style.opacity = String(arrowOpacity);

      // Track pulse (landing dip)
      this.track.style.transform = `scale(${this.pulse})`;

      // ARIA value
      const percent = Math.round((seen / this.TRAVEL) * 100);
      this.capsule.setAttribute('aria-valuenow', String(percent));
    }

    animateHome(initialVelocity = 0) {
      if (this.animId) cancelAnimationFrame(this.animId);
      let vel = Math.min(0, initialVelocity);
      let lastTime = performance.now();

      const step = (now) => {
        const dt = Math.min(0.032, (now - lastTime) / 1000);
        lastTime = now;

        const force = -this.stiffness * this.x - this.homeDamping * vel;
        const accel = force / this.mass;
        vel += accel * dt;
        this.x += vel * dt;

        this.render();

        if (Math.abs(this.x) < 0.2 && Math.abs(vel) < 5) {
          this.x = 0;
          this.render();
          this.animId = null;
          return;
        }
        this.animId = requestAnimationFrame(step);
      };

      this.animId = requestAnimationFrame(step);
    }

    commit(viaKey = false) {
      const currentRun = ++this.runId;
      this.x = this.TRAVEL;
      this.shown = 0;
      this.arrowIcon.style.opacity = '0';
      this.render();

      let result;
      try {
        if (typeof this.options.onConfirm === 'function') {
          result = this.options.onConfirm();
        }
      } catch (err) {
        this.reject(err);
        return;
      }

      const isPromise = result && typeof result.then === 'function';
      if (!isPromise) {
        // Immediate or simulated commit
        this.setPhase('pending');
        setTimeout(() => {
          if (this.runId === currentRun) this.resolve(viaKey);
        }, MIN_PENDING);
        return;
      }

      this.setPhase('pending');
      const t0 = performance.now();
      result.then(
        () => {
          const elapsed = performance.now() - t0;
          setTimeout(() => {
            if (this.runId === currentRun) this.resolve(viaKey);
          }, Math.max(0, MIN_PENDING - elapsed));
        },
        (reason) => {
          this.reject(reason);
        }
      );
    }

    resolve(viaKey = false) {
      this.setPhase('done');
      this.anchor = this.INNER;
      this.x = 0;

      // Landing dip pulse
      if (!viaKey && this.options.landingDip > 0) {
        this.pulse = 1 - this.options.landingDip;
        this.render();
        setTimeout(() => {
          this.pulse = 1;
          this.render();
        }, 300);
      } else {
        this.render();
      }

      if (typeof this.options.onDone === 'function') {
        this.options.onDone();
      }

      if (this.options.holdMs > 0) {
        setTimeout(() => {
          if (this.phase === 'done') {
            this.settle();
          }
        }, this.options.holdMs);
      }
    }

    reject(reason) {
      this.setPhase('error');
      if (typeof this.options.onError === 'function') {
        this.options.onError(reason);
      }

      setTimeout(() => {
        this.animateHome(0);
        setTimeout(() => {
          this.setPhase('idle');
        }, 1200);
      }, 400);
    }

    settle() {
      this.setPhase('idle');
      this.anchor = 0;
      this.shown = 1;
      this.animateHome(0);
    }

    bindEvents() {
      const onPointerDown = (e) => {
        if (this.options.disabled || this.grip || this.phase === 'pending' || this.phase === 'done') return;
        if (e.button !== 0 && e.pointerType === 'mouse') return;

        if (this.animId) cancelAnimationFrame(this.animId);
        this.held = true;
        this.root.setAttribute('data-held', '');

        try {
          this.track.setPointerCapture(e.pointerId);
        } catch (_) {}

        this.grip = {
          id: e.pointerId,
          grab: null,
          moved: false,
          hist: [[e.timeStamp, this.x]]
        };

        const onPointerMove = (ev) => {
          if (!this.grip || this.grip.id !== ev.pointerId) return;
          const at = this.local(ev.clientX);
          if (this.grip.grab === null) {
            this.grip.grab = at - this.x;
            return;
          }

          const next = clamp(at - this.grip.grab, -15, this.TRAVEL);
          if (Math.abs(next - this.x) > 0.5) this.grip.moved = true;
          this.grip.hist.push([ev.timeStamp, next]);
          if (this.grip.hist.length > 5) this.grip.hist.shift();

          this.x = next;
          this.render();
        };

        const onPointerUp = (ev) => {
          if (!this.grip || this.grip.id !== ev.pointerId) return;
          const g = this.grip;
          this.grip = null;
          this.held = false;
          this.root.removeAttribute('data-held');

          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUp);
          window.removeEventListener('pointercancel', onPointerUp);

          try {
            this.track.releasePointerCapture(ev.pointerId);
          } catch (_) {}

          if (this.x >= this.TRAVEL * 0.92) {
            this.commit(false);
          } else {
            this.animateHome(velocityOf(g.hist));
          }
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
      };

      this.track.addEventListener('pointerdown', onPointerDown);

      this.capsule.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse') {
          this.hot = true;
          this.render();
        }
      });

      this.capsule.addEventListener('pointerleave', () => {
        this.hot = false;
        this.render();
      });

      // Keyboard Accessibility
      this.capsule.addEventListener('keydown', (e) => {
        if (this.options.disabled || this.phase === 'pending' || this.phase === 'done') return;
        const step = this.TRAVEL / 10;
        if (e.key === 'End' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.commit(true);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          this.x = Math.min(this.TRAVEL, this.x + step);
          this.render();
          if (this.x >= this.TRAVEL) this.commit(true);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          this.x = Math.max(0, this.x - step);
          this.render();
        } else if (e.key === 'Home' || e.key === 'Escape') {
          e.preventDefault();
          this.animateHome(0);
        }
      });
    }
  }

  // Auto-initialize when DOM is ready
  function initSlideCommit() {
    const container = document.getElementById('slide-commit-container');
    if (!container) return;

    const form = container.closest('form');

    window.slideCommitInstance = new SlideCommit(container, {
      label: "Slide to Connect ↗",
      doneLabel: "Connected! ↗",
      errorLabel: "Please fill all fields",
      trackColor: "#15171a",
      handleColor: "#d5fa01",
      successColor: "#22c55e",
      dangerColor: "#e5484d",
      height: 58,
      radius: 29,
      speed: 55,
      returnBounce: 0.38,
      landingDip: 0.026,
      holdMs: 2500,
      onConfirm: function() {
        return new Promise((resolve, reject) => {
          if (form) {
            const inputs = form.querySelectorAll('input, textarea');
            let hasInput = false;
            inputs.forEach(inp => {
              if (inp.value && inp.value.trim().length > 0) hasInput = true;
            });

            // Simulate server network time for smooth feel
            setTimeout(() => {
              resolve({ success: true });
            }, 600);
          } else {
            setTimeout(resolve, 600);
          }
        });
      },
      onDone: function() {
        if (form) {
          // Reset form fields after successful connection
          setTimeout(() => {
            form.reset();
          }, 1500);
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlideCommit);
  } else {
    initSlideCommit();
  }

  window.SlideCommit = SlideCommit;
})();
