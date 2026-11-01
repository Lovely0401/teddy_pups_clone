'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export function AnimationController() {
  useEffect(() => {
    // 1. Initialize Lenis Smooth Scrolling (matching 1:1 with original site)
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    (window as unknown as { lenis: Lenis }).lenis = lenis;
    document.documentElement.classList.add('lenis');

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    // 2. Smart Scroll Header Controller (data-scrolled, data-hidden)
    let lastScrollY = window.scrollY;
    const header = document.getElementById('site-header');

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (header) {
        if (currentScrollY > 20) {
          header.setAttribute('data-scrolled', 'true');
        } else {
          header.setAttribute('data-scrolled', 'false');
        }

        if (currentScrollY > 160 && currentScrollY > lastScrollY + 6) {
          header.setAttribute('data-hidden', 'true');
        } else if (currentScrollY < lastScrollY - 6) {
          header.setAttribute('data-hidden', 'false');
        }
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // 3. Interactive Lineup Puppies (pop animation on hover/focus)
    const pups = document.querySelectorAll('.tp-lineup__pup');
    const cleanups: (() => void)[] = [];

    pups.forEach((pup) => {
      const onEnter = () => {
        pup.setAttribute('data-state', 'pop');
        setTimeout(() => {
          if (pup.getAttribute('data-state') === 'pop') {
            pup.removeAttribute('data-state');
          }
        }, 650);
      };
      pup.addEventListener('mouseenter', onEnter);
      cleanups.push(() => pup.removeEventListener('mouseenter', onEnter));
    });

    // 4. "Meet the pups" Hallway Treadmill & Door Animation (.tp-meet)
    const meetSection = document.querySelector<HTMLElement>('.tp-meet');
    const pinRange = meetSection?.querySelector<HTMLElement>('[data-pin-range]');
    const meetHall = meetSection?.querySelector<HTMLElement>('.tp-meet__hall');
    const meetTrack = meetSection?.querySelector<HTMLElement>('.tp-meet__track');
    const meetDoors = meetSection ? Array.from(meetSection.querySelectorAll<HTMLElement>('.tp-door')) : [];
    const meetTeddy = meetSection?.querySelector<HTMLElement>('.tp-meet__teddy');

    if (meetSection && pinRange && meetHall && meetTrack && meetDoors.length > 0) {
      const updateMeetLayout = () => {
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
        if (isDesktop) {
          meetSection.setAttribute('data-pinned', 'true');
          pinRange.style.setProperty('--pinned', '1');
          if (meetTeddy) {
            meetTeddy.setAttribute('data-pose', 'walk');
            meetTeddy.setAttribute('data-act', 'treadmill');
          }

          const stage = meetHall.parentElement;
          const head = stage?.querySelector<HTMLElement>('.tp-meet__head');
          const plates = Array.from(meetTrack.querySelectorAll<HTMLElement>('.tp-door__plate'));
          const plateMaxH = Math.max(64, ...plates.map((e) => e.offsetHeight));
          const floorH = (meetHall.querySelector('.tp-meet__floor') as HTMLElement)?.offsetHeight ?? 0;
          const headBottom = head ? head.offsetTop + head.offsetHeight : 0;
          const stageH = stage?.clientHeight ?? window.innerHeight;
          const doorW = Math.max(
            128,
            Math.min(256, 0.15 * window.innerWidth, (stageH - headBottom - floorH - plateMaxH - 40) / 1.3)
          );
          meetHall.style.setProperty('--door-w', `${doorW.toFixed(0)}px`);

          const maxScroll = Math.max(0, meetTrack.scrollWidth - window.innerWidth);
          pinRange.style.height = `calc(100vh + ${Math.round(0.8 * maxScroll)}px)`;

          updateMeetScroll();
          window.dispatchEvent(new Event('pup:recompute'));
        } else {
          meetSection.removeAttribute('data-pinned');
          pinRange.style.removeProperty('--pinned');
          pinRange.style.height = '';
          meetHall.style.removeProperty('--door-w');
          meetHall.style.removeProperty('--floor-x');
          meetTrack.style.transform = '';
          if (meetTeddy) {
            meetTeddy.setAttribute('data-pose', 'sit');
            meetTeddy.removeAttribute('data-act');
          }
          meetDoors.forEach((door) => door.setAttribute('data-open', 'true'));
          window.dispatchEvent(new Event('pup:recompute'));
        }
      };

      const updateMeetScroll = () => {
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
        if (!isDesktop) return;

        const maxScroll = Math.max(0, meetTrack.scrollWidth - window.innerWidth);
        const pinRangeTop = pinRange.getBoundingClientRect().top + window.scrollY;
        const scrollDist = pinRange.offsetHeight - window.innerHeight;

        if (scrollDist > 0) {
          const progress = Math.max(0, Math.min(1, (window.scrollY - pinRangeTop) / scrollDist));
          const currentX = -(progress * maxScroll);

          meetTrack.style.transform = `translateX(${currentX.toFixed(2)}px)`;
          meetHall.style.setProperty('--floor-x', `${currentX.toFixed(1)}px`);

          const threshold = 0.36 * window.innerWidth;
          meetDoors.forEach((door) => {
            if (door.classList.contains('tp-door--all')) {
              door.setAttribute('data-open', 'true');
              return;
            }
            const isOpen = door.offsetLeft + currentX < threshold;
            const wasOpen = door.getAttribute('data-open') === 'true';
            if (wasOpen !== isOpen) {
              door.setAttribute('data-open', String(isOpen));
              if (isOpen) {
                window.dispatchEvent(
                  new CustomEvent('pup:cue', {
                    detail: { look: door, secs: 0.9 },
                  })
                );
              }
            }
          });
        }
      };

      // Hover on door opens it
      meetDoors.forEach((door) => {
        const link = door.querySelector('.tp-door__link');
        if (link) {
          const onEnter = () => door.setAttribute('data-open', 'true');
          link.addEventListener('mouseenter', onEnter);
          cleanups.push(() => link.removeEventListener('mouseenter', onEnter));
        }
      });

      updateMeetLayout();
      window.addEventListener('resize', updateMeetLayout);
      window.addEventListener('scroll', updateMeetScroll, { passive: true });

      if (lenis) {
        lenis.on('scroll', updateMeetScroll);
      }

      cleanups.push(() => {
        window.removeEventListener('resize', updateMeetLayout);
        window.removeEventListener('scroll', updateMeetScroll);
      });
    }

    // 5. Interactive Teddy Buddy (peeking, speech bubble, tail wagging)
    const teddyStops = document.querySelectorAll('.pup-stop');
    const BARK_PHRASES = ['Woof! 🐾', 'Arf! 🐶', 'Hi friend! ✨', 'Yip yip! 🦴', 'Welcome! 🧸'];
    let phraseIdx = 0;

    teddyStops.forEach((stop) => {
      const bubble = stop.querySelector('.pup-bubble');
      const tail = stop.querySelector('[data-p="tail"]');
      const tongue = stop.querySelector('[data-p="tongue"]');

      if (bubble) {
        const onInteraction = () => {
          bubble.textContent = BARK_PHRASES[phraseIdx % BARK_PHRASES.length];
          phraseIdx++;
          bubble.setAttribute('data-show', 'true');

          if (tail) {
            tail.setAttribute('transform', 'rotate(25 84 150)');
            setTimeout(() => tail.setAttribute('transform', 'rotate(-20 84 150)'), 300);
            setTimeout(() => tail.setAttribute('transform', 'rotate(20 84 150)'), 600);
            setTimeout(() => tail.setAttribute('transform', 'rotate(-20 84 150)'), 900);
          }

          if (tongue) {
            tongue.setAttribute('opacity', '1');
            setTimeout(() => tongue.setAttribute('opacity', '0'), 1400);
          }

          setTimeout(() => {
            bubble.setAttribute('data-show', 'false');
          }, 2200);
        };

        stop.addEventListener('mouseenter', onInteraction);
        stop.addEventListener('click', onInteraction);
        cleanups.push(() => {
          stop.removeEventListener('mouseenter', onInteraction);
          stop.removeEventListener('click', onInteraction);
        });
      }
    });

    // 6. Interactive Journey Tabs on /how-it-works
    const switchTabs = document.querySelectorAll('.tp-switch__tab');
    switchTabs.forEach((tab) => {
      const onClick = () => {
        switchTabs.forEach((t) => {
          t.setAttribute('aria-selected', 'false');
          t.setAttribute('data-active', 'false');
        });
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('data-active', 'true');

        const journeys = document.querySelector('.tp-journeys');
        if (journeys) {
          journeys.setAttribute('data-ready', 'true');
        }
      };
      tab.addEventListener('click', onClick);
      cleanups.push(() => tab.removeEventListener('click', onClick));
    });

    // 7. Intersection Observer for Scroll Reveals
    const revealEls = document.querySelectorAll('[data-reveal="true"], .tp-step, .tp-stamp');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => observer.observe(el));
    cleanups.push(() => observer.disconnect());

    // 8. Auto-mark journeys as ready
    const journeys = document.querySelector('.tp-journeys');
    if (journeys) {
      journeys.setAttribute('data-ready', 'true');
    }

    // 9. Interactive filter chips on /puppies
    const chips = document.querySelectorAll<HTMLButtonElement>('.tp-sticker-chip');
    if (chips.length > 0) {
      chips.forEach((chip) => {
        const onChipClick = () => {
          const rawName = chip.textContent?.trim().toLowerCase() || '';
          const isPressed = chip.getAttribute('aria-pressed') === 'true';

          chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
          if (!isPressed) {
            chip.setAttribute('aria-pressed', 'true');
          }

          const sketches = document.querySelectorAll<HTMLElement>('.tp-sketches > li');
          sketches.forEach((sketch) => {
            if (!isPressed && rawName !== 'everywhere') {
              const text = sketch.textContent?.toLowerCase() || '';
              // Handle gender and origin filters
              let matches = false;
              if (rawName === 'boys') {
                matches = text.includes('male') || text.includes('boy');
              } else if (rawName === 'girls') {
                matches = text.includes('female') || text.includes('girl');
              } else if (rawName === 'imported') {
                matches = text.includes('imported');
              } else if (rawName === 'korean teacup') {
                matches = text.includes('korean') || text.includes('teacup');
              } else {
                matches = text.includes(rawName);
              }
              sketch.style.display = matches ? '' : 'none';
            } else {
              sketch.style.display = '';
            }
          });
        };
        chip.addEventListener('click', onChipClick);
        cleanups.push(() => chip.removeEventListener('click', onChipClick));
      });
    }

    // 10. Interactive FAQ Note Accordion on /faq
    const faqButtons = document.querySelectorAll<HTMLButtonElement>('.tp-note__q button');
    faqButtons.forEach((btn) => {
      const onFaqClick = () => {
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        const note = btn.closest<HTMLElement>('.tp-note');
        const answer = note?.querySelector<HTMLElement>('.tp-note__answer');

        if (isExpanded) {
          btn.setAttribute('aria-expanded', 'false');
          if (note) note.removeAttribute('data-unfolded');
          if (answer) answer.setAttribute('inert', '');
        } else {
          btn.setAttribute('aria-expanded', 'true');
          if (note) note.setAttribute('data-unfolded', 'true');
          if (answer) answer.removeAttribute('inert');
        }
      };
      btn.addEventListener('click', onFaqClick);
      cleanups.push(() => btn.removeEventListener('click', onFaqClick));
    });

    // 11. Interactive Contact Form -> WhatsApp
    const contactForm = document.querySelector<HTMLFormElement>('.tp-letterform');
    if (contactForm) {
      const onSubmit = (e: Event) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        const name = (formData.get('name') as string) || '';
        const phone = (formData.get('phone') as string) || '';
        const area = (formData.get('area') as string) || '';
        const message = (formData.get('message') as string) || '';

        const text = `Hi TeddyPups! I'd like to enquire.\n\nName: ${name}\nPhone: ${phone}\nArea: ${area}\nMessage: ${message}`;
        const waUrl = `https://wa.me/971541676733?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      };
      contactForm.addEventListener('submit', onSubmit);
      cleanups.push(() => contactForm.removeEventListener('submit', onSubmit));
    }

    // 12. Interactive Puppy Detail Photo/Video Carousel
    const prevBtn = document.querySelector<HTMLButtonElement>('button[aria-label="Previous photo"]');
    const nextBtn = document.querySelector<HTMLButtonElement>('button[aria-label="Next photo"]');
    const storyPage = document.querySelector<HTMLElement>('.tp-storypage');
    if (storyPage && (prevBtn || nextBtn)) {
      const mediaItems = storyPage.querySelectorAll<HTMLElement>('img, video');
      let currentIdx = 0;
      const countEl = storyPage.querySelector('.bottom-4 span');

      const updateCarousel = (newIdx: number) => {
        if (mediaItems.length === 0) return;
        currentIdx = (newIdx + mediaItems.length) % mediaItems.length;
        mediaItems.forEach((m, i) => {
          m.style.display = i === currentIdx ? 'block' : 'none';
        });
        if (countEl) {
          countEl.textContent = `${currentIdx + 1} / ${mediaItems.length}`;
        }
      };

      if (prevBtn) {
        const onPrev = () => updateCarousel(currentIdx - 1);
        prevBtn.addEventListener('click', onPrev);
        cleanups.push(() => prevBtn.removeEventListener('click', onPrev));
      }
      if (nextBtn) {
        const onNext = () => updateCarousel(currentIdx + 1);
        nextBtn.addEventListener('click', onNext);
        cleanups.push(() => nextBtn.removeEventListener('click', onNext));
      }
    }

    // 13. Interactive WhatsApp Journey Steps Controller (.tp-chat)
    const chatSection = document.querySelector<HTMLElement>('.tp-chat');
    if (chatSection) {
      const stepItems = Array.from(chatSection.querySelectorAll<HTMLElement>('.tp-chat__step'));
      const msgGroups = Array.from(chatSection.querySelectorAll<HTMLElement>('.tp-msg-group'));
      const typingEl = chatSection.querySelector<HTMLElement>('.tp-typing');
      const statusEl = chatSection.querySelector<HTMLElement>('.tp-phone__status');
      const screenEl = chatSection.querySelector<HTMLElement>('.tp-phone__screen');
      const playBtn = chatSection.querySelector<HTMLButtonElement>('.tp-clip__play');
      const videoEl = chatSection.querySelector<HTMLVideoElement>('.tp-clip video');

      let currentStepIdx = -1;
      let typingTimer: NodeJS.Timeout | null = null;

      const setStep = (k: number) => {
        if (k === currentStepIdx || k < 0 || k >= stepItems.length) return;
        const isAdvance = k > currentStepIdx;
        currentStepIdx = k;

        // Update step states (done, active)
        stepItems.forEach((step, a) => {
          if (a < k) {
            step.setAttribute('data-done', 'true');
            step.removeAttribute('data-active');
          } else if (a === k) {
            step.setAttribute('data-active', 'true');
            step.removeAttribute('data-done');
          } else {
            step.removeAttribute('data-active');
            step.removeAttribute('data-done');
          }
        });

        if (isAdvance) {
          // Show typing state
          if (typingEl) typingEl.setAttribute('data-show', 'true');
          if (statusEl) statusEl.textContent = 'typing…';

          // Show previous groups, hide new group until typing completes
          msgGroups.forEach((g) => {
            const stepNum = parseInt(g.getAttribute('data-step') || '-1', 10);
            g.setAttribute('data-show', stepNum < k ? 'true' : 'false');
          });

          if (typingTimer) clearTimeout(typingTimer);
          typingTimer = setTimeout(() => {
            if (typingEl) typingEl.setAttribute('data-show', 'false');
            if (statusEl) statusEl.textContent = 'online';

            msgGroups.forEach((g) => {
              const stepNum = parseInt(g.getAttribute('data-step') || '-1', 10);
              g.setAttribute('data-show', stepNum <= k ? 'true' : 'false');
            });

            // Cue Teddy to look at revealed messages
            const revealedGroup = screenEl?.querySelector(`[data-step="${k}"]`);
            if (revealedGroup) {
              window.dispatchEvent(
                new CustomEvent('pup:cue', {
                  detail: {
                    look: revealedGroup,
                    secs: 1.4,
                    say: k === 1 ? 'ooh, photos!' : k === 2 ? 'home soon!' : undefined,
                  },
                })
              );
            }
          }, 750);
        } else {
          // Backward scroll: immediate update
          if (typingEl) typingEl.setAttribute('data-show', 'false');
          if (statusEl) statusEl.textContent = 'online';
          msgGroups.forEach((g) => {
            const stepNum = parseInt(g.getAttribute('data-step') || '-1', 10);
            g.setAttribute('data-show', stepNum <= k ? 'true' : 'false');
          });
        }
      };

      // Set initial step 0
      setStep(0);

      // IntersectionObserver matching rootMargin: "-28% 0px -62% 0px"
      const stepObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const idx = stepItems.indexOf(entry.target as HTMLElement);
              if (idx !== -1) setStep(idx);
            }
          }
        },
        { rootMargin: '-28% 0px -62% 0px' }
      );

      stepItems.forEach((step) => stepObserver.observe(step));
      cleanups.push(() => {
        stepObserver.disconnect();
        if (typingTimer) clearTimeout(typingTimer);
      });

      // Video Play / Pause button in WhatsApp phone
      if (playBtn && videoEl) {
        const toggleVideo = () => {
          if (videoEl.paused) {
            videoEl.play().then(() => {
              playBtn.setAttribute('aria-pressed', 'true');
            }).catch(() => {});
          } else {
            videoEl.pause();
            playBtn.setAttribute('aria-pressed', 'false');
          }
        };
        const onEnded = () => playBtn.setAttribute('aria-pressed', 'false');

        playBtn.addEventListener('click', toggleVideo);
        videoEl.addEventListener('ended', onEnded);
        cleanups.push(() => {
          playBtn.removeEventListener('click', toggleVideo);
          videoEl.removeEventListener('ended', onEnded);
        });
      }
    }

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      document.documentElement.classList.remove('lenis');
      window.removeEventListener('scroll', handleScroll);
      cleanups.forEach((c) => c());
    };
  }, []);

  return null;
}

