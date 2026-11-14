/**
 * ==========================================================================
 * SANVEX PORTFOLIO — TEAM & COLLABORATORS DATA & INTERACTION
 * Section: "BUILT WITH GREAT PEOPLE."
 * ==========================================================================
 * 
 * INSTRUCTIONS FOR ADDING / EDITING MEMBERS:
 * 1. To change someone's photo:
 *    Drop their image (JPG/PNG) into `assets/images/team/` and update `photo: "assets/images/team/your-file.jpg"`
 * 2. To change names, roles, bios or social links:
 *    Edit the properties below.
 * 3. If a member does NOT have a social link (e.g. no Instagram or portfolio):
 *    Set it to null or "" (empty string). That button will be automatically hidden!
 * 4. To add more members:
 *    Duplicate one of the profile blocks below.
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
    skills: "React • FastAPI • Node.js • MongoDB",
    email: null,
    portfolio: null,
    github: null,
    instagram: null
  },
  {
    name: "Priya Nair",
    role: "UI/UX Designer",
    handle: "priyadesigns",
    status: "Designing Experiences",
    statusColor: "#38bdf8",
    photo: "assets/images/team/person-02.svg",
    bio: "Obsessed with clean visual design systems, human-centered interfaces, typography, and crafting frictionless digital experiences.",
    skills: "Figma • Design Systems • Wireframing",
    email: null,
    portfolio: null,
    github: null,
    instagram: null
  },
  {
    name: "Rohan Verma",
    role: "Data Scientist & ML",
    handle: "rohandata",
    status: "Training Models",
    statusColor: "#10b981",
    photo: "assets/images/team/person-03.svg",
    bio: "Exploring machine learning models, predictive data analysis, and creating intuitive visual representations from complex datasets.",
    skills: "Python • PyTorch • Pandas • Scikit-Learn",
    email: null,
    portfolio: null,
    github: null,
    instagram: null
  },
  {
    name: "Ananya Roy",
    role: "Frontend Engineer",
    handle: "ananyadev",
    status: "Building Interactions",
    statusColor: "#ec4899",
    photo: "assets/images/team/person-04.svg",
    bio: "Specializing in micro-interactions, smooth GSAP web animations, and clean semantic code that bridges creative design with performance.",
    skills: "JavaScript • GSAP • Tailwind CSS • HTML5",
    email: null,
    portfolio: null,
    github: null,
    instagram: null
  },
  {
    name: "Karan Patel",
    role: "Backend Architect",
    handle: "karanbuilds",
    status: "Optimizing Systems",
    statusColor: "#3b82f6",
    photo: "assets/images/team/person-05.svg",
    bio: "Architecting high-throughput distributed systems, secure cloud endpoints, and optimizing relational & NoSQL databases.",
    skills: "Go • Python • PostgreSQL • Docker",
    email: null,
    portfolio: null,
    github: null,
    instagram: null
  },
  {
    name: "Sneha Mukherjee",
    role: "Cloud & DevOps Specialist",
    handle: "snehacloud",
    status: "Deploying Stacks",
    statusColor: "#f59e0b",
    photo: "assets/images/team/person-06.svg",
    bio: "Automating cloud CI/CD pipelines, container orchestration, and ensuring resilient, high-availability deployments.",
    skills: "AWS • Docker • GitHub Actions • Linux",
    email: null,
    portfolio: null,
    github: null,
    instagram: null
  },
  {
    name: "Vikram Das",
    role: "Mobile App Developer",
    handle: "vikramapps",
    status: "Active Collaborator",
    statusColor: "#14b8a6",
    photo: "assets/images/team/person-07.svg",
    bio: "Building sleek cross-platform iOS and Android applications combining native performance with delightful design.",
    skills: "Flutter • Dart • React Native • Firebase",
    email: null,
    portfolio: null,
    github: null,
    instagram: null
  },
  {
    name: "Tanvi Sen",
    role: "Creative Technologist",
    handle: "tanvisen",
    status: "Crafting Shaders",
    statusColor: "#8b5cf6",
    photo: "assets/images/team/person-08.svg",
    bio: "Pushing boundaries at the intersection of visual art and code with interactive WebGL shaders and creative algorithms.",
    skills: "Three.js • WebGL • Creative Coding • GLSL",
    email: null,
    portfolio: null,
    github: null,
    instagram: null
  }
];

// Expose globally for developer access
window.SANVEX_TEAM_MEMBERS = SANVEX_TEAM_MEMBERS;

(function () {
  'use strict';

  function initTeamProfiles() {
    const modal = document.getElementById('sanvexTeamModal');
    const backdrop = document.getElementById('sanvexTeamModalBackdrop');
    const closeBtn = document.getElementById('sanvexTeamModalCloseBtn');

    const modalPhoto = document.getElementById('teamModalPhoto');
    const modalName = document.getElementById('teamModalName');
    const modalRole = document.getElementById('teamModalRole');
    const modalBio = document.getElementById('teamModalBio');
    const modalSkills = document.getElementById('teamModalSkills');
    const linkPortfolio = document.getElementById('teamModalPortfolio');
    const linkGithub = document.getElementById('teamModalGithub');
    const linkInstagram = document.getElementById('teamModalInstagram');

    // Populate all cards in the section grid with team data
    const cards = document.querySelectorAll('.sanvex-team-card');
    cards.forEach((card, idx) => {
      const member = SANVEX_TEAM_MEMBERS[idx];
      if (!member) return;

      const img = card.querySelector('.team-photo');
      const nameEl = card.querySelector('.team-name');
      const roleEl = card.querySelector('.team-role');

      if (img) {
        img.src = member.photo;
        img.alt = member.name;
      }
      if (nameEl) nameEl.textContent = member.name;
      if (roleEl) roleEl.textContent = member.role;

      card.setAttribute('aria-label', `View profile of ${member.name}`);
    });

    // Open Modal function - populates the ivory profile modal
    function openTeamModal(index) {
      const member = SANVEX_TEAM_MEMBERS[index];
      if (!member || !modal) return;

      if (modalPhoto) {
        modalPhoto.src = member.photo;
        modalPhoto.alt = member.name;
      }
      if (modalName) modalName.textContent = member.name;
      if (modalRole) modalRole.textContent = member.role;
      if (modalBio) modalBio.textContent = member.bio || '';

      // Skills / contribution tags
      if (modalSkills) {
        if (member.skills) {
          const tags = member.skills.split('•').map(s => s.trim()).filter(Boolean);
          modalSkills.innerHTML = tags
            .map(t => `<span class="sanvex-team-skill-pill">${t}</span>`)
            .join('');
          modalSkills.style.display = 'flex';
        } else {
          modalSkills.innerHTML = '';
          modalSkills.style.display = 'none';
        }
      }

      // Social Links handling - strictly show only if provided
      function configureLink(el, url) {
        if (!el) return;
        if (url && typeof url === 'string' && url.trim().length > 0) {
          el.href = url.trim();
          el.target = '_blank';
          el.rel = 'noopener noreferrer';
          el.style.display = 'inline-flex';
        } else {
          el.removeAttribute('href');
          el.style.display = 'none';
        }
      }

      configureLink(linkPortfolio, member.portfolio);
      configureLink(linkGithub, member.github);
      configureLink(linkInstagram, member.instagram);

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    // Close Modal function
    function closeTeamModal() {
      if (!modal) return;
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // Bind card click & keyboard activation (Enter / Space)
    document.addEventListener('click', function (e) {
      const card = e.target.closest('.sanvex-team-card');
      if (card) {
        e.preventDefault();
        const idx = parseInt(card.getAttribute('data-member-index'), 10);
        if (!isNaN(idx)) {
          openTeamModal(idx);
        }
      }
    });

    document.addEventListener('keydown', function (e) {
      const card = e.target.closest('.sanvex-team-card');
      if (card && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        const idx = parseInt(card.getAttribute('data-member-index'), 10);
        if (!isNaN(idx)) {
          openTeamModal(idx);
        }
      }
    });

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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTeamProfiles);
  } else {
    initTeamProfiles();
  }
})();
