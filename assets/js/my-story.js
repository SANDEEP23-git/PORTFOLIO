/**
 * SANVEX Portfolio — My Story Minimalist Editorial Timeline Controller
 * Powered by GSAP & ScrollTrigger
 * Features:
 *  - Dynamic year transitions with subtle vertical slide and fade
 *  - Active date range display under the year (e.g. AUG 2025 — NOV 2025)
 *  - Minimalist progress counter (⏱ 02 / 05) with horizontal line progress
 *  - Spotlight opacity for active milestone on the right (NO boxes, pure text)
 *  - Natural bidirectional scrolling
 */

(function () {
  "use strict";

  function initMyStoryTimeline() {
    const storySection = document.getElementById("story");
    if (!storySection) return;

    const entries = document.querySelectorAll(".story-editorial-entry");
    const yearEl = document.getElementById("storyCurrentYear");
    const activeDateEl = document.getElementById("storyActiveDate");
    const stepCurrentEl = document.getElementById("storyStepCurrent");
    const stepTotalEl = document.getElementById("storyStepTotal");
    const progressBarFill = document.getElementById("storyProgressBarFill");

    if (!entries.length) return;

    const totalItems = entries.length;
    if (stepTotalEl) {
      stepTotalEl.textContent = String(totalItems).padStart(2, "0");
    }

    let currentIndex = 0;

    // Initialize with first milestone
    const initialData = (typeof SANVEX_STORY_DATA !== "undefined" && SANVEX_STORY_DATA[0])
      ? SANVEX_STORY_DATA[0]
      : {
          year: entries[0].getAttribute("data-year") || "2026",
          dateRange: entries[0].getAttribute("data-date") || "JUN 2026 — AUG 2026",
          step: "01"
        };

    if (yearEl) yearEl.textContent = initialData.year;
    if (activeDateEl) activeDateEl.textContent = initialData.dateRange;
    if (stepCurrentEl) stepCurrentEl.textContent = initialData.step;
    if (progressBarFill) {
      progressBarFill.style.width = `${(1 / totalItems) * 100}%`;
    }
    entries[0].classList.add("active");

    function updateActiveMilestone(newIndex, scrollDir) {
      if (newIndex < 0 || newIndex >= totalItems) return;
      if (newIndex === currentIndex && entries[newIndex].classList.contains("active")) return;

      currentIndex = newIndex;

      // 1. Highlight active text entry (dim inactive ones)
      entries.forEach((item, idx) => {
        if (idx === newIndex) {
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });

      // Data lookup
      const currentData = (typeof SANVEX_STORY_DATA !== "undefined" && SANVEX_STORY_DATA[newIndex])
        ? SANVEX_STORY_DATA[newIndex]
        : {
            year: entries[newIndex].getAttribute("data-year") || "2025",
            dateRange: entries[newIndex].getAttribute("data-date") || "",
            step: String(newIndex + 1).padStart(2, "0")
          };

      // 2. Animate Dynamic Year with GSAP
      if (yearEl && typeof gsap !== "undefined") {
        const dir = scrollDir === "up" ? 1 : -1;
        gsap.killTweensOf(yearEl);
        gsap.to(yearEl, {
          y: dir * 14,
          opacity: 0,
          duration: 0.16,
          ease: "power2.in",
          onComplete: function () {
            yearEl.textContent = currentData.year;
            gsap.fromTo(
              yearEl,
              { y: -dir * 14, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.24, ease: "power2.out" }
            );
          }
        });
      } else if (yearEl) {
        yearEl.textContent = currentData.year;
      }

      // 3. Animate Active Date Range below Year
      if (activeDateEl && typeof gsap !== "undefined") {
        gsap.killTweensOf(activeDateEl);
        gsap.to(activeDateEl, {
          opacity: 0,
          duration: 0.12,
          onComplete: function () {
            activeDateEl.textContent = currentData.dateRange;
            gsap.to(activeDateEl, { opacity: 1, duration: 0.2 });
          }
        });
      } else if (activeDateEl) {
        activeDateEl.textContent = currentData.dateRange;
      }

      // 4. Animate Step Number (01 / 02 / 03 / 04 / 05)
      if (stepCurrentEl && typeof gsap !== "undefined") {
        gsap.killTweensOf(stepCurrentEl);
        gsap.to(stepCurrentEl, {
          opacity: 0,
          duration: 0.1,
          onComplete: function () {
            stepCurrentEl.textContent = currentData.step;
            gsap.to(stepCurrentEl, { opacity: 1, duration: 0.18 });
          }
        });
      } else if (stepCurrentEl) {
        stepCurrentEl.textContent = currentData.step;
      }

      // 5. Update Horizontal Progress Bar Fill
      const progressPercent = ((newIndex + 1) / totalItems) * 100;
      if (progressBarFill) {
        progressBarFill.style.width = `${progressPercent}%`;
      }
    }

    // GSAP ScrollTrigger Integration
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      entries.forEach((item, index) => {
        ScrollTrigger.create({
          trigger: item,
          start: "top 55%",
          end: "bottom 55%",
          onEnter: function () {
            updateActiveMilestone(index, "down");
          },
          onEnterBack: function () {
            updateActiveMilestone(index, "up");
          }
        });
      });

      setTimeout(function () {
        ScrollTrigger.refresh();
      }, 500);
    } else {
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          (observerEntries) => {
            observerEntries.forEach((entry) => {
              if (entry.isIntersecting) {
                const idx = Array.prototype.indexOf.call(entries, entry.target);
                if (idx !== -1) {
                  updateActiveMilestone(idx, "down");
                }
              }
            });
          },
          { threshold: 0.5 }
        );
        entries.forEach((item) => observer.observe(item));
      }
    }

    // Click on any entry to smoothly scroll to it
    entries.forEach((item) => {
      item.addEventListener("click", function (e) {
        if (e.target.closest("a")) return;
        if (typeof ScrollSmoother !== "undefined" && ScrollSmoother.get && ScrollSmoother.get()) {
          ScrollSmoother.get().scrollTo(item, true, "center center");
        } else {
          item.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMyStoryTimeline);
  } else {
    initMyStoryTimeline();
  }

  window.addEventListener("load", function () {
    setTimeout(initMyStoryTimeline, 200);
  });
})();
