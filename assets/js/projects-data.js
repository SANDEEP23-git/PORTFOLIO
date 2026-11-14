/**
 * SANVEX Portfolio - Real Projects Data
 * Centralized, editable data structure for live portfolio projects
 */
const SANVEX_PROJECTS = [
  {
    number: "01",
    name: "Nostalgic Radio",
    category: "Web Application / Audio",
    year: "2026",
    description: "A nostalgic music experience where users can explore music modes, enjoy YouTube-powered playback, and relive memories with a cinematic listening atmosphere.",
    technologies: ["HTML5", "CSS3", "JavaScript", "YouTube Embed"],
    image: "assets/images/projects/nostalgic-radio.png?v=3",
    liveUrl: "https://nostalgic-radio-liard.vercel.app/"
  },
  {
    number: "02",
    name: "Daily Life Reward",
    category: "Full-Stack Productivity",
    year: "2026",
    description: "A personal growth and daily habit reward system built to help users track progress, complete weekly challenges, cultivate consistency, and achieve personal milestones.",
    technologies: ["React", "Vite", "Tailwind CSS", "Lucide Icons", "JavaScript"],
    image: "assets/images/projects/daily-life-reward.png?v=3",
    liveUrl: "https://dalylifereword.vercel.app/"
  },
  {
    number: "03",
    name: "Ganesh Puja Committee",
    category: "Community & Culture",
    year: "2026",
    description: "A community festival portal for Maa Mangala Youth Club, showcasing cultural heritage, event celebration schedules, community member spotlights, and photo memories.",
    technologies: ["React", "Vite", "Tailwind CSS", "Modern UI", "JavaScript"],
    image: "assets/images/projects/ganesh-puja-committee.png?v=3",
    liveUrl: "https://ma-mangala-youth-club-website-2026.vercel.app/"
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = SANVEX_PROJECTS;
}

