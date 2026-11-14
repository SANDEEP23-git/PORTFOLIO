/**
 * SANVEX - My Learning Universe Data File
 * 10 Curated YouTube Resources (5 Individual Videos + 5 Playlists)
 */
const SANVEX_LEARNING_RESOURCES = {
  videos: [
    {
      id: "vid-1",
      type: "video",
      youtubeId: "mj4kU-XDI3I",
      title: "Data Structures & Algorithms using Python | Full Course",
      channel: "Sagar Chouksey",
      category: "DSA & Python",
      thumbnail: "https://img.youtube.com/vi/mj4kU-XDI3I/hqdefault.jpg",
      description: "Complete DSA in Python in one comprehensive tutorial covering arrays, linked lists, trees, graphs, sorting, and algorithmic complexity.",
      embedUrl: "https://www.youtube-nocookie.com/embed/mj4kU-XDI3I",
      duration: "Full Course"
    },
    {
      id: "vid-2",
      type: "video",
      youtubeId: "ie4oGI85SAE",
      title: "Machine Learning Full Course with Scikit-Learn | Math + Python + AI",
      channel: "Sagar Chouksey",
      category: "Machine Learning",
      thumbnail: "https://img.youtube.com/vi/ie4oGI85SAE/hqdefault.jpg",
      description: "End-to-end Machine Learning guide covering mathematical foundations, supervised & unsupervised learning, model evaluation, and Scikit-Learn pipelines.",
      embedUrl: "https://www.youtube-nocookie.com/embed/ie4oGI85SAE",
      duration: "Complete Guide"
    },
    {
      id: "vid-3",
      type: "video",
      youtubeId: "52c7Kxp_14E",
      title: "Build a Notes App using FastAPI, MongoDB & Bootstrap",
      channel: "CodeWithHarry",
      category: "Backend & FastAPI",
      thumbnail: "https://img.youtube.com/vi/52c7Kxp_14E/hqdefault.jpg",
      description: "Practical modern web application development using high-performance Python FastAPI backend, MongoDB database, and responsive frontend UI.",
      embedUrl: "https://www.youtube-nocookie.com/embed/52c7Kxp_14E",
      duration: "Hands-on Project"
    },
    {
      id: "vid-4",
      type: "video",
      youtubeId: "EXIgjIBu4EU",
      title: "Learn Pandas in 30 Minutes - Python Pandas Tutorial",
      channel: "Tech With Tim",
      category: "Data Science",
      thumbnail: "https://img.youtube.com/vi/EXIgjIBu4EU/hqdefault.jpg",
      description: "Essential data analysis and manipulation with Pandas: DataFrames, series, filtering, grouping, aggregation, and data cleaning techniques.",
      embedUrl: "https://www.youtube-nocookie.com/embed/EXIgjIBu4EU",
      duration: "30 Min Crash Course"
    },
    {
      id: "vid-5",
      type: "video",
      youtubeId: "hlGoQC332VM",
      title: "Complete Course in 3 Hours | SQL One Shot using MySQL",
      channel: "Apna College",
      category: "Database & SQL",
      thumbnail: "https://img.youtube.com/vi/hlGoQC332VM/hqdefault.jpg",
      description: "Complete database engineering with MySQL: CRUD operations, relational schema design, primary & foreign keys, joins, subqueries, and indexing.",
      embedUrl: "https://www.youtube-nocookie.com/embed/hlGoQC332VM",
      duration: "3 Hours One Shot"
    }
  ],
  playlists: [
    {
      id: "list-1",
      type: "playlist",
      playlistId: "PLfqMhTWNBTe137I_EPQd34TsgV6IO55pt",
      title: "Complete C++ & DSA Course Playlist",
      channel: "Apna College",
      category: "DSA & C++",
      thumbnail: "https://img.youtube.com/vi/z9bZufPHFLU/hqdefault.jpg",
      description: "Comprehensive structured roadmap for mastering Data Structures, Algorithms, problem solving, and competitive programming with C++.",
      embedUrl: "https://www.youtube-nocookie.com/embed/videoseries?list=PLfqMhTWNBTe137I_EPQd34TsgV6IO55pt"
    },
    {
      id: "list-2",
      type: "playlist",
      playlistId: "PLP9IO4UYNF0UCaUSF3XNZ1U9f01E5h5PM",
      title: "Modern Web Design & CSS Mastery Series",
      channel: "Web Engineering",
      category: "Frontend & CSS",
      thumbnail: "https://img.youtube.com/vi/AGDDdsiZ0Ko/hqdefault.jpg",
      description: "In-depth series on modern responsive layout techniques, Flexbox, CSS Grid, custom properties, animations, and clean semantic architecture.",
      embedUrl: "https://www.youtube-nocookie.com/embed/videoseries?list=PLP9IO4UYNF0UCaUSF3XNZ1U9f01E5h5PM"
    },
    {
      id: "list-3",
      type: "playlist",
      playlistId: "PLImps_mlpW359BrOz2ySa4G20-bhIWaeK",
      title: "Machine Learning & Intelligent Systems Track",
      channel: "AI & Data Science",
      category: "Machine Learning",
      thumbnail: "assets/images/thumbs/playlist-thumb-ml.png",
      description: "Curated learning sequence covering core algorithms, statistical modeling, data preparation, feature engineering, and predictive pipelines.",
      embedUrl: "https://www.youtube-nocookie.com/embed/videoseries?list=PLImps_mlpW359BrOz2ySa4G20-bhIWaeK"
    },
    {
      id: "list-4",
      type: "playlist",
      playlistId: "PLsyeobzWxl7rtdN-coP0XxS8DyTGNUR89",
      title: "Core Programming, Architecture & Systems",
      channel: "Telusko & Architecture",
      category: "Programming",
      thumbnail: "assets/images/thumbs/playlist-thumb-prog.png",
      description: "Fundamental computer science, language paradigms, object-oriented principles, modular design, and robust backend engineering practices.",
      embedUrl: "https://www.youtube-nocookie.com/embed/videoseries?list=PLsyeobzWxl7rtdN-coP0XxS8DyTGNUR89"
    },
    {
      id: "list-5",
      type: "playlist",
      playlistId: "PLbtI3_MArDOlJ4036mWiUKaQToUS8MZVu",
      title: "Modern Full-Stack Development & Applied Projects",
      channel: "Applied Engineering",
      category: "Full Stack",
      thumbnail: "assets/images/thumbs/playlist-thumb-fullstack.png",
      description: "Comprehensive end-to-end web engineering track from API design and database modeling to responsive UI deployment and cloud integration.",
      embedUrl: "https://www.youtube-nocookie.com/embed/videoseries?list=PLbtI3_MArDOlJ4036mWiUKaQToUS8MZVu"
    }
  ]
};

if (typeof window !== "undefined") {
  window.SANVEX_LEARNING_RESOURCES = SANVEX_LEARNING_RESOURCES;
}
