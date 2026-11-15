/**
 * ==========================================================================
 * SANVEX PORTFOLIO — 3D ELLIPTICAL ORBIT COLLABORATORS CONTROLLER
 * Interactive 3D Planetary Orbit of Teammate Avatars with SpotlightCard Modal
 * Pure Obsidian Black Background matching Contact Section (#010406)
 * ==========================================================================
 */

(function () {
  'use strict';

  let currentCleanup = null;

  function initOrbitCollaborators() {
    if (typeof currentCleanup === 'function') {
      currentCleanup();
      currentCleanup = null;
    }

    const stage = document.getElementById('orbitStage');
    const svgTrack = document.getElementById('orbitTrackSvg');
    const pillsRow = document.getElementById('orbitPillsRow');
    if (!stage) return;

    // Teammates data from team-members.js
    const team = (typeof SANVEX_TEAM_MEMBERS !== 'undefined' && Array.isArray(SANVEX_TEAM_MEMBERS) && SANVEX_TEAM_MEMBERS.length)
      ? SANVEX_TEAM_MEMBERS
      : [];

    if (!team.length) return;

    const N = team.length;
    let baseAngle = 0;
    let targetAngle = null;
    let pauseUntilTs = 0;
    const cruiseSpeed = 0.42; // Constant fluid angular velocity (~15s per full orbit)
    let isDragging = false;
    let dragStartX = 0;
    let dragStartAngle = 0;
    let activeFrontIndex = -1;
    let lastTs = null;
    let rafId = null;

    // Responsive Geometry Calculations
    let stageWidth = stage.clientWidth || 900;
    let stageHeight = stage.clientHeight || 380;
    let cx = stageWidth / 2;
    let cy = 145;
    let rx = 400;
    let ry = 70;

    function updateGeometry() {
      stageWidth = stage.clientWidth || 900;
      stageHeight = stage.clientHeight || 380;
      cx = stageWidth / 2;

      const isMobile = window.innerWidth <= 576;
      const isTablet = window.innerWidth <= 991;

      if (isMobile) {
        cy = 120;
        rx = Math.min(180, Math.max(130, stageWidth * 0.42));
        ry = 48;
      } else if (isTablet) {
        cy = 135;
        rx = Math.min(310, Math.max(180, stageWidth * 0.40));
        ry = 60;
      } else {
        cy = 145;
        rx = Math.min(430, Math.max(240, stageWidth * 0.40));
        ry = 70;
      }

      // Update SVG Ellipse Track Line
      if (svgTrack) {
        svgTrack.setAttribute('viewBox', `0 0 ${stageWidth} ${stageHeight}`);
        const ellipses = svgTrack.querySelectorAll('ellipse');
        ellipses.forEach(el => {
          el.setAttribute('cx', cx);
          el.setAttribute('cy', cy);
          el.setAttribute('rx', rx);
          el.setAttribute('ry', ry);
        });
      }
    }

    /**
     * Smoothly rotates the orbit so teammate `targetIdx` arrives front & center (theta = PI/2)
     */
    function rotateMemberToFront(targetIdx) {
      const step = (2 * Math.PI) / N;
      // Desired theta = Math.PI / 2
      const desiredBase = Math.PI / 2 - targetIdx * step;
      // Shortest angular difference from current baseAngle
      let diff = (desiredBase - baseAngle) % (2 * Math.PI);
      if (diff > Math.PI) diff -= 2 * Math.PI;
      if (diff < -Math.PI) diff += 2 * Math.PI;
      targetAngle = baseAngle + diff;
    }

    // Shared handler: rotates member to front AND opens SpotlightCard profile popup
    let lastSelectionTs = 0;
    function selectMember(index) {
      const now = Date.now();
      if (now - lastSelectionTs < 350) return;
      lastSelectionTs = now;

      // 1. Rotate to front
      rotateMemberToFront(index);

      // 2. Open SpotlightCard profile modal
      if (typeof window.openTeamModal === 'function') {
        window.openTeamModal(index);
      }
    }

    // Build Avatar Elements on the Stage
    stage.querySelectorAll('.orbit-avatar-item').forEach(el => el.remove());
    const avatarElements = [];

    team.forEach((member, i) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'orbit-avatar-item';
      itemEl.setAttribute('data-index', i);
      itemEl.setAttribute('role', 'button');
      itemEl.setAttribute('tabindex', '0');
      itemEl.setAttribute('aria-label', `View profile of ${member.name}`);

      itemEl.innerHTML = `
        <div class="orbit-avatar-bubble">
          <img src="${member.photo}" alt="${member.name}" class="orbit-avatar-img" draggable="false" loading="lazy" />
          <span class="orbit-avatar-ring"></span>
        </div>
        <div class="orbit-avatar-label">
          <span class="orbit-label-name">${member.name}</span>
          <span class="orbit-label-role">${member.role}</span>
        </div>
      `;

      // Touch & Pointer interaction
      let downX = 0;
      let downY = 0;
      let downTime = 0;

      itemEl.addEventListener('pointerdown', (e) => {
        downX = e.clientX;
        downY = e.clientY;
        downTime = Date.now();
        e.stopPropagation();
      });

      itemEl.addEventListener('pointerup', (e) => {
        const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
        const time = Date.now() - downTime;
        if (dist < 15 && time < 450) {
          e.preventDefault();
          e.stopPropagation();
          selectMember(i);
        }
      });

      // Standard Click
      itemEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        selectMember(i);
      });

      // Keyboard (Enter / Space)
      itemEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectMember(i);
        }
      });

      // Hover styles
      itemEl.addEventListener('mouseenter', () => {
        itemEl.classList.add('is-hovered');
      });

      itemEl.addEventListener('mouseleave', () => {
        itemEl.classList.remove('is-hovered');
      });

      stage.appendChild(itemEl);
      avatarElements.push(itemEl);
    });

    // Build Bottom Name Navigation Pills
    const pillElements = [];
    if (pillsRow) {
      pillsRow.innerHTML = '';
      team.forEach((member, i) => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'orbit-member-pill';
        pill.setAttribute('data-index', i);
        pill.setAttribute('aria-label', `Collaborator: ${member.name}`);

        pill.innerHTML = `
          <span class="orbit-pill-dot"></span>
          <span class="orbit-pill-name">${member.name}</span>
        `;

        // Clicking pill smoothly rotates that teammate to the front AND opens modal
        pill.addEventListener('click', (e) => {
          e.preventDefault();
          selectMember(i);
        });

        pillsRow.appendChild(pill);
        pillElements.push(pill);
      });
    }

    // Drag / Scrubbing support on stage background
    stage.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.orbit-avatar-item')) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartAngle = baseAngle;
      targetAngle = null;
    });

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      baseAngle = dragStartAngle + dx * 0.005;
    };

    const stopDrag = () => {
      isDragging = false;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);

    // Initial geometry setup
    updateGeometry();

    // Fluid Animation Loop (Guaranteed continuous 60fps orbit)
    function render(ts) {
      if (lastTs === null) lastTs = ts;
      const dt = Math.min(0.05, Math.max(0, ts - lastTs) / 1000);
      lastTs = ts;

      if (targetAngle !== null) {
        // Smooth asymptotic ease toward target angle
        const diff = targetAngle - baseAngle;
        baseAngle += diff * (1 - Math.exp(-dt / 0.18));
        if (Math.abs(diff) < 0.003) {
          baseAngle = targetAngle;
          targetAngle = null;
          // Pause briefly at the front (1.8s) before continuing orbit
          pauseUntilTs = ts + 1800;
        }
      } else if (!isDragging) {
        // Continuous fluid cruising orbit
        if (ts > pauseUntilTs) {
          baseAngle += cruiseSpeed * dt;
        }
      }

      const step = (2 * Math.PI) / N;
      let maxDepth = -999;
      let frontIdx = -1;

      for (let i = 0; i < N; i++) {
        const theta = baseAngle + i * step;
        const x = cx + rx * Math.cos(theta);
        const y = cy + ry * Math.sin(theta);

        // Depth d: 1 is closest to viewer (front), -1 is farthest (back)
        const d = Math.sin(theta);
        const k = (d + 1) / 2; // normalized 0 to 1

        if (d > maxDepth) {
          maxDepth = d;
          frontIdx = i;
        }

        // 3D Perspective scaling & opacity
        const scale = 0.74 + 0.44 * k;          // 0.74 (back) -> 1.18 (front)
        const opacity = 0.52 + 0.48 * k;        // 0.52 (back) -> 1.00 (front)
        const zIndex = Math.round(10 + 30 * k); // 10 -> 40

        const el = avatarElements[i];
        if (el) {
          el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
          el.style.opacity = opacity.toFixed(3);
          el.style.zIndex = zIndex;

          if (d > 0.65) {
            el.classList.add('is-front');
          } else {
            el.classList.remove('is-front');
          }
        }
      }

      // Sync active highlight on bottom pills
      if (frontIdx !== activeFrontIndex) {
        activeFrontIndex = frontIdx;
        pillElements.forEach((pill, idx) => {
          if (idx === frontIdx) {
            pill.classList.add('is-active');
          } else {
            pill.classList.remove('is-active');
          }
        });
      }

      rafId = requestAnimationFrame(render);
    }

    rafId = requestAnimationFrame(render);

    // Resize Observer
    const ro = new ResizeObserver(() => {
      updateGeometry();
    });
    ro.observe(stage);

    currentCleanup = () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', stopDrag);
      window.removeEventListener('pointercancel', stopDrag);
    };

    return currentCleanup;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOrbitCollaborators);
  } else {
    initOrbitCollaborators();
  }

  // Handle dynamic resize
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initOrbitCollaborators, 250);
  });
})();
