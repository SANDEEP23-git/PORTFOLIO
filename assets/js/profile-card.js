/**
 * ==========================================================================
 * REACT BITS — PROFILECARD COMPONENT (JavaScript Adaptation)
 * 3D Holographic Tilt, Parallax & Lighting Physics Engine
 * ==========================================================================
 */

(function () {
  'use strict';

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  class ProfileCardPhysics {
    constructor(rootEl, options = {}) {
      this.root = rootEl;
      this.options = {
        tiltStrength: 14,
        parallax: 10,
        holo: 0.85,
        glare: 0.55,
        enableTilt: true,
        intro: true,
        ...options
      };

      this.size = { width: 360, height: 480 };
      this.x = { p: 0, v: 0, target: 0 };
      this.y = { p: 0, v: 0, target: 0 };
      this.light = { p: 0, target: 0 };
      this.raf = 0;
      this.last = 0;
      this.slowUntil = 0;
      this.touchId = null;
      this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.bindEvents();
      this.updateSize();
    }

    updateSize() {
      if (this.root) {
        this.size.width = this.root.offsetWidth || 360;
        this.size.height = this.root.offsetHeight || 480;
      }
    }

    write() {
      if (!this.root) return;
      const { enableTilt, tiltStrength, parallax } = this.options;
      const angle = enableTilt && !this.reduced ? tiltStrength : 0;
      const tilt = Math.min(1, Math.hypot(this.x.p, this.y.p));
      const style = this.root.style;

      style.setProperty('--pc-light-x', `${((this.x.p + 1) * 0.5 * this.size.width).toFixed(1)}px`);
      style.setProperty('--pc-light-y', `${((this.y.p + 1) * 0.5 * this.size.height).toFixed(1)}px`);
      style.setProperty('--pc-pointer-x', `${((this.x.p + 1) * 50).toFixed(2)}%`);
      style.setProperty('--pc-pointer-y', `${((this.y.p + 1) * 50).toFixed(2)}%`);
      style.setProperty('--pc-band-x', `${(50 + this.x.p * 15).toFixed(2)}%`);
      style.setProperty('--pc-band-y', `${(50 + this.y.p * 15).toFixed(2)}%`);
      style.setProperty('--pc-rotate-x', `${(this.y.p * angle).toFixed(3)}deg`);
      style.setProperty('--pc-rotate-y', `${(-this.x.p * angle).toFixed(3)}deg`);
      style.setProperty('--pc-shift-x', `${(this.x.p * (this.reduced ? 0 : parallax)).toFixed(2)}px`);
      style.setProperty('--pc-shift-y', `${(this.y.p * (this.reduced ? 0 : parallax)).toFixed(2)}px`);
      style.setProperty('--pc-reach', tilt.toFixed(4));
      style.setProperty('--pc-tilt', (tilt * this.light.p).toFixed(4));
      style.setProperty('--pc-active', this.light.p.toFixed(4));
    }

    frame(now) {
      const dt = Math.min(0.05, (now - this.last) / 1000 || 0);
      this.last = now;
      const slow = now < this.slowUntil;
      const stiffness = slow ? 24 : 120;
      const damping = slow ? 9 : 16;
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
      const h = dt / steps;

      for (let i = 0; i < steps; i++) {
        for (const axis of [this.x, this.y]) {
          axis.v += (stiffness * (axis.target - axis.p) - damping * axis.v) * h;
          axis.p += axis.v * h;
        }
      }

      const tau = this.light.target > this.light.p ? 0.18 : slow ? 0.9 : 0.45;
      this.light.p += (this.light.target - this.light.p) * (1 - Math.exp(-dt / tau));
      this.write();

      const moving =
        Math.abs(this.x.target - this.x.p) > 0.0005 ||
        Math.abs(this.y.target - this.y.p) > 0.0005 ||
        Math.abs(this.x.v) > 0.0005 ||
        Math.abs(this.y.v) > 0.0005 ||
        Math.abs(this.light.target - this.light.p) > 0.002;

      if (moving) {
        this.raf = requestAnimationFrame(t => this.frame(t));
      } else {
        this.x.p = this.x.target;
        this.y.p = this.y.target;
        this.light.p = this.light.target;
        this.write();
        this.raf = 0;
      }
    }

    wake() {
      if (this.raf) return;
      this.last = performance.now();
      this.raf = requestAnimationFrame(t => this.frame(t));
    }

    aim(nx, ny, on = true) {
      this.x.target = clamp(nx, -1, 1);
      this.y.target = clamp(ny, -1, 1);
      this.light.target = on ? 1 : 0;
      this.slowUntil = 0;
      this.wake();
    }

    aimAt(event) {
      const rect = this.root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      this.aim(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        ((event.clientY - rect.top) / rect.height) * 2 - 1
      );
    }

    release() {
      this.aim(0, 0, false);
    }

    triggerIntro() {
      if (this.reduced) {
        this.write();
        return;
      }
      this.updateSize();
      this.x.p = 0.62;
      this.y.p = -0.55;
      this.x.target = 0;
      this.y.target = 0;
      this.light.p = 1;
      this.light.target = 0;
      this.slowUntil = performance.now() + 1400;
      this.write();
      this.wake();
    }

    bindEvents() {
      const root = this.root;
      if (!root) return;

      root.addEventListener('pointerenter', e => {
        if (e.pointerType === 'mouse') this.aimAt(e);
      });
      root.addEventListener('pointermove', e => {
        if (e.pointerType === 'mouse' || e.pointerId === this.touchId) this.aimAt(e);
      });
      root.addEventListener('pointerleave', e => {
        if (e.pointerType === 'mouse') this.release();
      });
      root.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse') return;
        this.touchId = e.pointerId;
        this.aimAt(e);
      });
      root.addEventListener('pointerup', e => {
        if (e.pointerId !== this.touchId) return;
        this.touchId = null;
        this.release();
      });
      root.addEventListener('pointercancel', () => {
        this.touchId = null;
        this.release();
      });

      window.addEventListener('resize', () => {
        this.updateSize();
        this.write();
      });
    }
  }

  // Controller for ProfileCard Modal
  window.SanvexProfileCard = {
    physics: null,

    init() {
      const rootEl = document.getElementById('sanvexProfileCardRoot');
      if (rootEl) {
        this.physics = new ProfileCardPhysics(rootEl, {
          tiltStrength: 14,
          parallax: 10,
          holo: 0.85,
          glare: 0.6,
          enableTilt: true,
          intro: true
        });
      }
    },

    populate(member) {
      if (!member) return;

      const photoEl = document.getElementById('pcCardPhoto');
      const miniAvatarEl = document.getElementById('pcCardMiniAvatar');
      const nameEl = document.getElementById('pcCardName');
      const titleEl = document.getElementById('pcCardTitle');
      const handleEl = document.getElementById('pcCardHandle');
      const statusTextEl = document.getElementById('pcCardStatusText');
      const bioEl = document.getElementById('pcCardBio');
      const skillsEl = document.getElementById('pcCardSkills');

      const linkPortfolio = document.getElementById('pcCardPortfolio');
      const linkGithub = document.getElementById('pcCardGithub');
      const linkInstagram = document.getElementById('pcCardInstagram');
      const linkContact = document.getElementById('pcCardContact');

      // Photo & Avatars
      if (photoEl) {
        photoEl.src = member.photo;
        photoEl.alt = member.name;
      }
      if (miniAvatarEl) {
        miniAvatarEl.src = member.photo;
        miniAvatarEl.alt = member.name;
      }

      // Names & Roles
      if (nameEl) nameEl.textContent = member.name;
      if (titleEl) titleEl.textContent = member.role;

      // Handle & Status
      const handle = member.handle || member.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (handleEl) handleEl.textContent = '@' + handle;
      if (statusTextEl) statusTextEl.textContent = member.status || 'Active Collaborator';

      // Status color variable
      const rootEl = document.getElementById('sanvexProfileCardRoot');
      if (rootEl) {
        rootEl.style.setProperty('--pc-status', member.statusColor || '#22c55e');
      }

      // Bio
      if (bioEl) {
        bioEl.textContent = member.bio || '';
        bioEl.style.display = member.bio ? 'block' : 'none';
      }

      // Skills badges
      if (skillsEl) {
        if (member.skills) {
          const tags = member.skills.split('•').map(s => s.trim()).filter(Boolean);
          skillsEl.innerHTML = tags.map(t => `<span class="pc-skill-badge">${t}</span>`).join('');
          skillsEl.style.display = 'flex';
        } else {
          skillsEl.innerHTML = '';
          skillsEl.style.display = 'none';
        }
      }

      // Helper for social links
      function configureBtn(btn, url, defaultUrl) {
        if (!btn) return;
        const targetUrl = url || defaultUrl;
        if (targetUrl && typeof targetUrl === 'string' && targetUrl.trim().length > 0) {
          btn.href = targetUrl.trim();
          btn.target = '_blank';
          btn.rel = 'noopener noreferrer';
          btn.style.display = 'inline-flex';
        } else {
          btn.removeAttribute('href');
          btn.style.display = 'none';
        }
      }

      configureBtn(linkPortfolio, member.portfolio);
      configureBtn(linkGithub, member.github);
      configureBtn(linkInstagram, member.instagram);

      // Contact button
      if (linkContact) {
        const contactHref = member.email ? `mailto:${member.email}` : (member.portfolio || member.github || '#');
        linkContact.href = contactHref;
        linkContact.target = contactHref.startsWith('mailto:') ? '_self' : '_blank';
        linkContact.rel = 'noopener noreferrer';
        linkContact.style.display = 'inline-flex';
      }

      // Trigger tactile intro sweep on the card
      if (this.physics) {
        setTimeout(() => this.physics.triggerIntro(), 50);
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.SanvexProfileCard.init();
  });
})();
