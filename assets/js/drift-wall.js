/**
 * React Bits - <DriftWall /> Component (Vanilla JavaScript Implementation)
 * Infinite 3D drifting wall of teammate cards with parallax tilt and lift interaction.
 */

(function () {
  'use strict';

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const columnFactor = (index, variance) => {
    const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
    return 1 + variance * pseudo;
  };

  function initDriftWall() {
    const container = document.getElementById('driftWallContainer');
    if (!container) return;

    // Use teammates data
    const team = (typeof SANVEX_TEAM_MEMBERS !== 'undefined' && SANVEX_TEAM_MEMBERS.length)
      ? SANVEX_TEAM_MEMBERS
      : [];

    if (!team.length) return;

    // Configuration matching React Bits props with small tile sizes & full-page coverage
    const w = window.innerWidth;
    const isMobile = w <= 768;
    const isTablet = w <= 1024 && w > 768;
    const isWide = w >= 1440;
    const isUltraWide = w >= 1920;

    // Responsive columns matching small tile sizes:
    // Ultrawide: 9 cols, Wide desktop: 8 cols, Desktop: 7 cols, Tablet: 5 cols, Mobile: 4 cols
    const columns = isMobile ? 4 : (isTablet ? 5 : (isUltraWide ? 9 : (isWide ? 8 : 7)));

    // Small dimensions exactly matching React Bits prompt
    const tileWidth = isMobile ? 150 : 196;
    const tileHeight = isMobile ? 90 : 110;
    const gap = isMobile ? 12 : 16;
    const tilt = 16;
    const turn = -14;
    const roll = -13;
    const depth = 120;
    const speed = 48;
    const direction = 'down';
    const variance = 0.4;
    const parallax = 0.6;
    const pauseOnHover = false;

    let containerHeight = container.clientHeight || window.innerHeight;
    const unit = tileHeight + gap;

    // Distribute team members across columns
    const columnItems = Array.from({ length: columns }, () => []);
    team.forEach((member, i) => {
      columnItems[i % columns].push({ ...member, originalIndex: i });
    });

    // Fallback fill for any empty column
    columnItems.forEach((col, c) => {
      if (!col.length) col.push({ ...team[c % team.length], originalIndex: c % team.length });
    });

    // Compute column copies for seamless infinite looping across full screen
    const columnMeta = columnItems.map(col => {
      const copyHeight = Math.max(unit, col.length * unit);
      // Multiplier 3.6 ensures continuous infinite small tiles covering above and below 100vh
      const copies = Math.max(5, Math.ceil((containerHeight * 3.6) / copyHeight) + 2);
      return { copyHeight, copies };
    });

    // Compute base velocities (alternating column drift directions)
    const dirSign = direction === 'up' ? 1 : -1;
    const baseVelocities = columnItems.map((_, c) => {
      const altSign = c % 2 === 0 ? 1 : -1;
      return speed * columnFactor(c, variance) * dirSign * altSign;
    });

    const offsets = columnMeta.map((meta, c) => meta.copyHeight * ((c * 0.37) % 1));
    const velocities = columnItems.map(() => 0);

    // Build DOM structure
    container.innerHTML = '';
    const plane = document.createElement('div');
    plane.className = 'drift-wall-plane';

    const trackElements = [];

    columnItems.forEach((col, c) => {
      const colEl = document.createElement('div');
      colEl.className = 'drift-wall-col';

      const trackEl = document.createElement('div');
      trackEl.className = 'drift-wall-track';

      const meta = columnMeta[c];
      for (let copy = 0; copy < meta.copies; copy++) {
        col.forEach((member) => {
          const tileEl = document.createElement('div');
          tileEl.className = 'drift-wall-tile';
          tileEl.setAttribute('data-col', c);
          tileEl.setAttribute('data-member-index', member.originalIndex);
          tileEl.setAttribute('role', 'button');
          tileEl.setAttribute('tabindex', '0');
          tileEl.setAttribute('aria-label', `View profile of ${member.name}`);

          tileEl.innerHTML = `
            <div class="drift-wall-inner">
              <span class="drift-wall-plus-badge" aria-hidden="true">
                <i class="ph-bold ph-arrow-up-right"></i>
              </span>
              <div class="drift-wall-avatar-wrap">
                <img class="drift-wall-avatar" src="${member.photo}" alt="${member.name}" loading="lazy" draggable="false" />
              </div>
              <div class="drift-wall-content">
                <h4 class="drift-wall-name">${member.name}</h4>
                <p class="drift-wall-role">${member.role}</p>
              </div>
            </div>
          `;

          // Click / tap opens teammate modal
          tileEl.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (typeof window.openTeamModal === 'function') {
              window.openTeamModal(member.originalIndex);
            }
          });

          // Keyboard Enter / Space support
          tileEl.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (typeof window.openTeamModal === 'function') {
                window.openTeamModal(member.originalIndex);
              }
            }
          });

          trackEl.appendChild(tileEl);
        });
      }

      colEl.appendChild(trackEl);
      plane.appendChild(colEl);
      trackElements.push(trackEl);
    });

    container.appendChild(plane);

    // State for animation
    const pointer = { x: 0, y: 0 };
    const pointerDamped = { x: 0, y: 0 };
    let hoveredCol = -1;
    let wallHovered = false;
    let lastTs = null;
    let raf = null;
    let isVisible = true;
    const reduced = prefersReducedMotion();

    function applyPlaneTransform(px, py) {
      plane.style.transform =
        `translate(-50%, -50%) scale(1.44) ` +
        `rotateX(${tilt + py}deg) rotateY(${turn + px}deg) rotateZ(${roll}deg) ` +
        `translateZ(${-depth}px)`;
    }

    applyPlaneTransform(0, 0);

    // Smooth entrance animation via GSAP ScrollTrigger if available
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.fromTo(container,
        { opacity: 0, scale: 0.96 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#collaborators-section',
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    function animate(ts) {
      if (lastTs === null) lastTs = ts;
      const dt = Math.min(0.05, Math.max(0, ts - lastTs) / 1000);
      lastTs = ts;

      // Parallax rotation
      const maxTilt = parallax * 8;
      const targetX = pointer.x * maxTilt;
      const targetY = -pointer.y * maxTilt;
      const damp = 1 - Math.exp(-dt / 0.12);
      pointerDamped.x += (targetX - pointerDamped.x) * damp;
      pointerDamped.y += (targetY - pointerDamped.y) * damp;
      applyPlaneTransform(pointerDamped.x, pointerDamped.y);

      // Column drift animation
      if (!reduced) {
        for (let c = 0; c < trackElements.length; c++) {
          const meta = columnMeta[c];
          if (!meta) continue;
          const paused = wallHovered && pauseOnHover;
          const factor = paused || hoveredCol === c ? 0.15 : 1; // Smoothly decelerates on hover
          const target = baseVelocities[c] * factor;

          const ease = 1 - Math.exp(-dt / (target === 0 ? 0.16 : 0.28));
          velocities[c] += (target - velocities[c]) * ease;
          let next = (offsets[c] ?? 0) + velocities[c] * dt;
          next = ((next % meta.copyHeight) + meta.copyHeight) % meta.copyHeight;
          offsets[c] = next;

          const el = trackElements[c];
          if (el) el.style.transform = `translate3d(0, ${-next}px, 0)`;
        }
      }

      if (isVisible) {
        raf = requestAnimationFrame(animate);
      }
    }

    // Pointer events on container
    container.addEventListener('pointerenter', function () {
      wallHovered = true;
    });

    container.addEventListener('pointerleave', function () {
      wallHovered = false;
      hoveredCol = -1;
      pointer.x = 0;
      pointer.y = 0;
      // Remove any active tile class
      const actives = container.querySelectorAll('.drift-wall-tile.is-active');
      actives.forEach(el => el.classList.remove('is-active'));
    });

    container.addEventListener('pointermove', function (e) {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      if (parallax > 0 && !reduced) {
        pointer.x = (e.clientX - rect.left) / rect.width - 0.5;
        pointer.y = (e.clientY - rect.top) / rect.height - 0.5;
      }

      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const tile = hit ? hit.closest('.drift-wall-tile') : null;

      if (tile) {
        const c = Number(tile.dataset.col);
        hoveredCol = isNaN(c) ? -1 : c;
        const currentActive = container.querySelector('.drift-wall-tile.is-active');
        if (currentActive !== tile) {
          if (currentActive) currentActive.classList.remove('is-active');
          tile.classList.add('is-active');
        }
      } else {
        hoveredCol = -1;
        const currentActive = container.querySelector('.drift-wall-tile.is-active');
        if (currentActive) currentActive.classList.remove('is-active');
      }
    });

    // Resize observer
    const ro = new ResizeObserver(([entry]) => {
      containerHeight = entry.contentRect.height || window.innerHeight;
    });
    ro.observe(container);

    // Intersection observer
    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !raf) {
        lastTs = null;
        raf = requestAnimationFrame(animate);
      } else if (!isVisible && raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    });
    io.observe(container);

    raf = requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDriftWall);
  } else {
    initDriftWall();
  }

  // Handle dynamic resize
  let resizeTimeout = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initDriftWall, 300);
  });
})();
