/**
 * ==========================================================================
 * SANVEX PORTFOLIO — TEAM & COLLABORATORS DATA & SPOTLIGHTCARD MODAL
 * Section: "BUILT WITH GREAT PEOPLE."
 * ==========================================================================
 * 
 * Features:
 * 1. SANVEX_TEAM_MEMBERS with portfolio, GitHub, Instagram, and LinkedIn
 * 2. Exact React Bits SpotlightCard UI matching the reference design:
 *    - Left-aligned Avatar & Share button
 *    - Name & Role
 *    - Skill capsule tags
 *    - 3-column stats row: Instagram (Rating pos), GitHub (Earned pos), LinkedIn (Rate pos)
 *    - Bottom row: "Get in touch" (Portfolio link) + Bookmark button
 * 3. Complete <SpotlightCard /> physics engine (pointer tracking, softness, border glow, flare)
 */

const SANVEX_TEAM_MEMBERS = [
  {
    name: "Aarav Sharma",
    role: "Full-Stack Developer",
    handle: "aaravcodes",
    status: "Available for Projects",
    statusColor: "#22c55e",
    photo: "assets/images/team/person-01.svg",
    bio: "Passionate engineer crafting scalable web applications, REST APIs, and responsive architectures with modern JavaScript and Python.",
    skills: "React • FastAPI • Node.js",
    email: "aarav@example.com",
    portfolio: "https://aaravsharma.dev",
    github: "https://github.com/aaravcodes",
    instagram: "https://instagram.com/aaravcodes",
    linkedin: "https://linkedin.com/in/aaravcodes"
  },
  {
    name: "Priya Nair",
    role: "UI/UX Designer",
    handle: "priyadesigns",
    status: "Designing Experiences",
    statusColor: "#38bdf8",
    photo: "assets/images/team/person-02.svg",
    bio: "Obsessed with clean visual design systems, human-centered interfaces, typography, and crafting frictionless digital experiences.",
    skills: "Figma • UX Design • Wireframing",
    email: "priya@example.com",
    portfolio: "https://priyanair.design",
    github: "https://github.com/priyadesigns",
    instagram: "https://instagram.com/priyadesigns",
    linkedin: "https://linkedin.com/in/priyadesigns"
  },
  {
    name: "Rohan Verma",
    role: "Data Scientist & ML",
    handle: "rohandata",
    status: "Training Models",
    statusColor: "#10b981",
    photo: "assets/images/team/person-03.svg",
    bio: "Exploring machine learning models, predictive data analysis, and creating intuitive visual representations from complex datasets.",
    skills: "Python • PyTorch • Pandas",
    email: "rohan@example.com",
    portfolio: "https://rohanverma.ai",
    github: "https://github.com/rohandata",
    instagram: "https://instagram.com/rohandata",
    linkedin: "https://linkedin.com/in/rohandata"
  },
  {
    name: "Ananya Roy",
    role: "Frontend Engineer",
    handle: "ananyadev",
    status: "Building Interactions",
    statusColor: "#ec4899",
    photo: "assets/images/team/person-04.svg",
    bio: "Specializing in micro-interactions, smooth GSAP web animations, and clean semantic code that bridges creative design with performance.",
    skills: "GSAP • Tailwind CSS • HTML5",
    email: "ananya@example.com",
    portfolio: "https://ananyaroy.tech",
    github: "https://github.com/ananyadev",
    instagram: "https://instagram.com/ananyadev",
    linkedin: "https://linkedin.com/in/ananyadev"
  },
  {
    name: "Karan Patel",
    role: "Backend Architect",
    handle: "karanbuilds",
    status: "Optimizing Systems",
    statusColor: "#3b82f6",
    photo: "assets/images/team/person-05.svg",
    bio: "Architecting high-throughput distributed systems, secure cloud endpoints, and optimizing relational & NoSQL databases.",
    skills: "Go • PostgreSQL • Docker",
    email: "karan@example.com",
    portfolio: "https://karanpatel.dev",
    github: "https://github.com/karanbuilds",
    instagram: "https://instagram.com/karanbuilds",
    linkedin: "https://linkedin.com/in/karanbuilds"
  },
  {
    name: "Sneha Mukherjee",
    role: "Cloud & DevOps Specialist",
    handle: "snehacloud",
    status: "Deploying Stacks",
    statusColor: "#f59e0b",
    photo: "assets/images/team/person-06.svg",
    bio: "Automating cloud CI/CD pipelines, container orchestration, and ensuring resilient, high-availability deployments.",
    skills: "AWS • Docker • GitHub Actions",
    email: "sneha@example.com",
    portfolio: "https://snehamukherjee.cloud",
    github: "https://github.com/snehacloud",
    instagram: "https://instagram.com/snehacloud",
    linkedin: "https://linkedin.com/in/snehacloud"
  },
  {
    name: "Vikram Das",
    role: "Mobile App Developer",
    handle: "vikramapps",
    status: "Active Collaborator",
    statusColor: "#14b8a6",
    photo: "assets/images/team/person-07.svg",
    bio: "Building sleek cross-platform iOS and Android applications combining native performance with delightful design.",
    skills: "Flutter • Dart • React Native",
    email: "vikram@example.com",
    portfolio: "https://vikramdas.app",
    github: "https://github.com/vikramapps",
    instagram: "https://instagram.com/vikramapps",
    linkedin: "https://linkedin.com/in/vikramapps"
  },
  {
    name: "Tanvi Sen",
    role: "Creative Technologist",
    handle: "tanvisen",
    status: "Crafting Shaders",
    statusColor: "#8b5cf6",
    photo: "assets/images/team/person-08.svg",
    bio: "Pushing boundaries at the intersection of visual art and code with interactive WebGL shaders and creative algorithms.",
    skills: "Three.js • WebGL • GLSL",
    email: "tanvi@example.com",
    portfolio: "https://tanvisen.art",
    github: "https://github.com/tanvisen",
    instagram: "https://instagram.com/tanvisen",
    linkedin: "https://linkedin.com/in/tanvisen"
  }
];

// Expose globally for DriftWall & developer access
window.SANVEX_TEAM_MEMBERS = SANVEX_TEAM_MEMBERS;

(function () {
  'use strict';

  let currentActiveMember = null;

  function initTeamProfiles() {
    const modal = document.getElementById('sanvexTeamModal');
    const backdrop = document.getElementById('sanvexTeamModalBackdrop');
    const closeBtn = document.getElementById('sanvexTeamModalCloseBtn');
    const shareBtn = document.getElementById('teamModalShareBtn');
    const bookmarkBtn = document.getElementById('teamModalBookmarkBtn');

    const modalPhoto = document.getElementById('teamModalPhoto');
    const modalName = document.getElementById('teamModalName');
    const modalRole = document.getElementById('teamModalRole');
    const modalSkills = document.getElementById('teamModalSkills');

    const linkInstagram = document.getElementById('teamModalInstagram');
    const linkGithub = document.getElementById('teamModalGithub');
    const linkLinkedin = document.getElementById('teamModalLinkedin');
    const linkPortfolio = document.getElementById('teamModalPortfolio');

    // Open Modal function - populates the SpotlightCard profile modal
    function openTeamModal(index) {
      const member = SANVEX_TEAM_MEMBERS[index];
      if (!member || !modal) return;
      currentActiveMember = member;

      // Photo, Name, Role
      if (modalPhoto) {
        modalPhoto.src = member.photo;
        modalPhoto.alt = member.name;
      }
      if (modalName) modalName.textContent = member.name;
      if (modalRole) modalRole.textContent = member.role;

      // Skills tags (e.g. Figma, UX Design)
      if (modalSkills) {
        if (member.skills) {
          const tags = member.skills.split('•').map(s => s.trim()).filter(Boolean);
          modalSkills.innerHTML = tags
            .slice(0, 3)
            .map(t => `<span class="spotlight-skill-tag">${t}</span>`)
            .join('');
          modalSkills.style.display = 'flex';
        } else {
          modalSkills.innerHTML = '';
          modalSkills.style.display = 'none';
        }
      }

      // Three-column stats links:
      // Position 1: Instagram (Rating pos)
      if (linkInstagram) {
        if (member.instagram) {
          linkInstagram.href = member.instagram;
          linkInstagram.style.display = 'flex';
        } else {
          linkInstagram.style.display = 'none';
        }
      }

      // Position 2: GitHub (Earned pos)
      if (linkGithub) {
        if (member.github) {
          linkGithub.href = member.github;
          linkGithub.style.display = 'flex';
        } else {
          linkGithub.style.display = 'none';
        }
      }

      // Position 3: LinkedIn (Rate pos)
      if (linkLinkedin) {
        if (member.linkedin) {
          linkLinkedin.href = member.linkedin;
          linkLinkedin.style.display = 'flex';
        } else {
          linkLinkedin.style.display = 'none';
        }
      }

      // "Get in touch" button -> opens member portfolio link
      if (linkPortfolio) {
        linkPortfolio.href = member.portfolio || '#';
      }

      // Reset bookmark state for new member
      if (bookmarkBtn) {
        bookmarkBtn.classList.remove('bookmarked');
        const icon = bookmarkBtn.querySelector('i');
        if (icon) {
          icon.className = 'ph ph-bookmark-simple';
        }
      }

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Wake up spotlight card effect on modal open
      if (typeof window.wakeSpotlightCard === 'function') {
        window.wakeSpotlightCard();
      }
    }

    // Close Modal function
    function closeTeamModal() {
      if (!modal) return;
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      currentActiveMember = null;
    }

    // Expose open and close functions globally
    window.openTeamModal = openTeamModal;
    window.closeTeamModal = closeTeamModal;

    // Close on Close button click
    if (closeBtn) closeBtn.addEventListener('click', closeTeamModal);

    // Close on Backdrop click
    if (backdrop) backdrop.addEventListener('click', closeTeamModal);

    // Close on Escape key
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeTeamModal();
      }
    });

    // Share button handler
    if (shareBtn) {
      shareBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!currentActiveMember) return;
        const shareUrl = currentActiveMember.portfolio || window.location.href;
        if (navigator.share) {
          navigator.share({
            title: `${currentActiveMember.name} - ${currentActiveMember.role}`,
            text: `Check out ${currentActiveMember.name}'s profile on SANVEX!`,
            url: shareUrl
          }).catch(() => {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(shareUrl).then(() => {
            const origIcon = shareBtn.innerHTML;
            shareBtn.innerHTML = '<i class="ph-bold ph-check" style="color: #22c55e;"></i>';
            setTimeout(() => { shareBtn.innerHTML = origIcon; }, 1600);
          }).catch(() => {});
        }
      });
    }

    // Bookmark button handler
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        bookmarkBtn.classList.toggle('bookmarked');
        const icon = bookmarkBtn.querySelector('i');
        if (icon) {
          if (bookmarkBtn.classList.contains('bookmarked')) {
            icon.className = 'ph-fill ph-bookmark-simple';
          } else {
            icon.className = 'ph ph-bookmark-simple';
          }
        }
      });
    }

    // Initialize React Bits <SpotlightCard /> Effect
    initSpotlightCard();
  }

  /**
   * React Bits - <SpotlightCard /> Component (Vanilla JavaScript Implementation)
   * Exact matching physics & math from React Bits:
   * theme: 'dark'
   * spotlightColor: '#ffffff'
   * intensity: 0.15
   * spotlightSize: 240
   * softness: 0.7
   * shape: 'circle'
   * borderGlow: 0.6
   * proximity: 80
   * smoothing: 0.3
   * flare: true
   */
  function initSpotlightCard() {
    const root = document.getElementById('sanvexSpotlightCard');
    const light = document.getElementById('spotlightLight');
    const edge = document.getElementById('spotlightEdge');
    const noise = document.getElementById('spotlightNoise');
    if (!root || !light || !edge) return;

    const THEME_DARK = {
      surface: '#111111',
      border: 'rgba(255, 255, 255, 0.08)',
      shadow: '0 24px 48px -24px rgba(0, 0, 0, 0.6)',
      light: '#ffffff',
      fill: 1,
      edge: 1
    };

    const color = THEME_DARK.light;
    const softness = 0.7;
    const intensity = 0.15;
    const spotlightSize = 240;
    const borderGlow = 0.6;
    const proximity = 80;
    const smoothing = 0.3;
    const flare = true;

    const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

    // Falloff calculation matching React Bits formula
    const falloff = (col, softVal) => {
      const soft = clamp(softVal, 0, 1);
      const core = (1 - soft) ** 1.5 * 0.85;
      const stop = (alpha, at) =>
        `color-mix(in srgb, ${col} ${(alpha * 100).toFixed(2)}%, transparent) ${(at * 100).toFixed(2)}%`;
      const list = [stop(1, 0)];
      for (let i = 0; i <= 14; i++) {
        const t = core + ((1 - core) * i) / 14;
        const g = (t - core) / (1 - core);
        const smooth = 1 - g * g * (3 - 2 * g);
        const glow = Math.exp(-4.6 * g * g) * (1 - g ** 6);
        list.push(stop(smooth + (glow - smooth) * soft, t));
      }
      return list.join(', ');
    };

    const fillStops = falloff(color, softness);
    const edgeStops = falloff(color, 1);

    const s = {
      fill: fillStops,
      edge: edgeStops,
      size: Math.max(20, spotlightSize),
      intensity: clamp(intensity, 0, 1) * THEME_DARK.fill,
      borderGlow: clamp(borderGlow, 0, 1) * THEME_DARK.edge,
      proximity: Math.max(0, proximity),
      smoothing: clamp(smoothing, 0, 1),
      flare: flare
    };

    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const state = { x: 0, y: 0, presence: 0, flare: 0, time: Math.random() * 60, pressed: false, visible: true };
    const pointer = { x: 0, y: 0, active: false };
    const drawn = { light: '', edge: '' };
    let raf = 0;
    let last = 0;
    let alive = true;

    const gradient = (size, x, y, stops) => {
      return `radial-gradient(circle ${size.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px, ${stops})`;
    };

    const paint = () => {
      const size = s.size * (1 + 0.2 * state.flare);
      const boost = 1 + 0.7 * state.flare;
      const fill = gradient(size, state.x, state.y, s.fill);
      const rim = gradient(size * 0.6, state.x, state.y, s.edge);

      if (fill !== drawn.light) {
        drawn.light = fill;
        light.style.background = fill;
      }
      if (rim !== drawn.edge) {
        drawn.edge = rim;
        edge.style.background = rim;
      }

      light.style.opacity = String(Math.min(1, state.presence * s.intensity * boost));
      edge.style.opacity = String(Math.min(1, state.presence * s.borderGlow * boost));
    };

    const tick = now => {
      raf = 0;
      if (!alive) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;

      const rect = root.getBoundingClientRect();
      let tx = state.x;
      let ty = state.y;
      let target = 0;

      if (pointer.active) {
        tx = pointer.x - rect.left;
        ty = pointer.y - rect.top;
        const gap = Math.hypot(Math.max(0, -tx, tx - rect.width), Math.max(0, -ty, ty - rect.height));
        if (gap === 0) target = 1;
        else if (s.proximity > 0) target = Math.max(0, 1 - gap / s.proximity) ** 2;
      }

      if (state.presence < 0.02 && target > 0) {
        state.x = tx;
        state.y = ty;
      }

      const follow = reduce || s.smoothing === 0 ? 1 : 1 - Math.exp(-dt / (0.015 + s.smoothing * 0.22));
      state.x += (tx - state.x) * follow;
      state.y += (ty - state.y) * follow;

      const fade = reduce ? 1 : 1 - Math.exp(-dt / (target > state.presence ? 0.1 : 0.32));
      state.presence += (target - state.presence) * fade;
      if (Math.abs(target - state.presence) < 0.002) state.presence = target;

      const press = state.pressed && s.flare && !reduce ? 1 : 0;
      state.flare += (press - state.flare) * (1 - Math.exp(-dt / (press ? 0.05 : 0.28)));
      if (Math.abs(press - state.flare) < 0.002) state.flare = press;

      paint();

      const moving = Math.abs(tx - state.x) > 0.1 || Math.abs(ty - state.y) > 0.1;
      const settled = !moving && state.presence === target && state.flare === press;

      if (!settled) {
        raf = requestAnimationFrame(tick);
      }
    };

    const wake = () => {
      if (raf || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    window.wakeSpotlightCard = () => {
      const rect = root.getBoundingClientRect();
      pointer.x = rect.left + rect.width / 2;
      pointer.y = rect.top + rect.height / 2;
      pointer.active = true;
      wake();
      setTimeout(() => {
        if (!root.matches(':hover')) {
          pointer.active = false;
          wake();
        }
      }, 1000);
    };

    const onMove = event => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      if (state.presence > 0 || s.proximity > 0 || root.contains(event.target)) wake();
    };

    const onOut = event => {
      if (event.relatedTarget) return;
      pointer.active = false;
      wake();
    };

    const onDown = event => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      state.pressed = true;
      wake();
    };

    const onUp = event => {
      if (event.pointerType !== 'mouse') pointer.active = false;
      if (!state.pressed && event.pointerType === 'mouse') return;
      state.pressed = false;
      wake();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    document.addEventListener('pointerout', onOut);
    root.addEventListener('pointerdown', onDown);

    // Initial paint
    paint();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTeamProfiles);
  } else {
    initTeamProfiles();
  }
})();
