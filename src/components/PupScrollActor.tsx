'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface StopData {
  element: HTMLElement;
  scale: number;
  restPageX: number;
  restPageY: number;
  pose: string;
  facing: number;
  behind: boolean;
  act?: string;
  holdStart: number;
  holdEnd: number;
  track: {
    kind: 'page' | 'pin';
    top: number;
    from?: number;
    to?: number;
  };
}

const POSE_BOXES: Record<string, [number, number, number, number]> = {
  sit: [50, 26, 284, 234],
  peek: [148, 34, 280, 163],
  snug: [148, 40, 280, 163],
  bow: [58, 56, 292, 236],
};

export function PupScrollActor() {
  const pathname = usePathname();

  useEffect(() => {
    // Only run on pages that have pup stops (such as home)
    const stopElements = Array.from(document.querySelectorAll<HTMLElement>('[data-pup-stop]'));
    const layer = document.querySelector<HTMLElement>('.pup-layer');
    const actor = document.querySelector<HTMLElement>('.pup-actor');
    const actorBody = document.querySelector<HTMLElement>('.pup-actor__body');
    const bubble = document.querySelector<HTMLElement>('.pup-bubble');
    const prints = Array.from(document.querySelectorAll<SVGElement>('.pup-prints > svg'));

    if (stopElements.length < 2 || !layer || !actor || !actorBody) {
      document.documentElement.removeAttribute('data-pup');
      if (layer) {
        layer.setAttribute('hidden', '');
        layer.hidden = true;
      }
      return;
    }

    // Enable live pup mode and reveal the actor layer
    document.documentElement.setAttribute('data-pup', 'live');
    layer.removeAttribute('hidden');
    layer.hidden = false;

    // References to SVG limb groups
    const root = actor.querySelector<SVGGElement>('[data-p="root"]');
    const shadow = actor.querySelector<SVGElement>('[data-p="shadow"]');
    const body = actor.querySelector<SVGGElement>('[data-p="body"]');
    const bf = actor.querySelector<SVGGElement>('[data-p="bf"]');
    const ff = actor.querySelector<SVGGElement>('[data-p="ff"]');
    const bn = actor.querySelector<SVGGElement>('[data-p="bn"]');
    const fn = actor.querySelector<SVGGElement>('[data-p="fn"]');
    const haunch = actor.querySelector<SVGGElement>('[data-p="haunch"]');
    const ledge = actor.querySelector<SVGGElement>('[data-p="ledge"]');
    const tail = actor.querySelector<SVGGElement>('[data-p="tail"]');
    const head = actor.querySelector<SVGGElement>('[data-p="head"]');
    const earL = actor.querySelector<SVGElement>('[data-p="earL"]');
    const earR = actor.querySelector<SVGElement>('[data-p="earR"]');
    const eyes = actor.querySelector<SVGGElement>('[data-p="eyes"]');
    const blink = actor.querySelector<SVGGElement>('[data-p="blink"]');
    const tongue = actor.querySelector<SVGElement>('[data-p="tongue"]');
    const mouth = actor.querySelector<SVGGElement>('[data-p="mouth"]');
    const happy = actor.querySelector<SVGElement>('[data-p="happy"]');
    const shut = actor.querySelector<SVGElement>('[data-p="shut"]');

    let stops: StopData[] = [];

    const computeStops = () => {
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      const windowH = window.innerHeight;
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - windowH);

      stops = stopElements.map((el, i) => {
        const r = el.getBoundingClientRect();
        const pose = el.dataset.pose || 'sit';
        const act = el.dataset.act || '';
        // In the SVG the puppy natively faces right. 'left' flips it (-1), 'right' keeps it (1)
        const facing = el.dataset.facing === 'left' ? -1 : 1;
        const behind = el.dataset.behind === 'true';

        // Exact formula matching live site
        const l = r.width / 300;
        const scale = act === 'basket' || isMobile ? l : 1.12 * l;
        const anchor = pose === 'peek' || pose === 'snug' ? { x: 150, y: 159 } : { x: 150, y: 228 };

        // Rest position relative to page
        const restPageX = r.left + scrollX + anchor.x * (l - scale);
        const restPageY = r.top + scrollY + anchor.y * (l - scale);

        const meetSection = el.closest<HTMLElement>('.tp-meet');
        const pinRange = meetSection?.querySelector<HTMLElement>('[data-pin-range]');
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
        const isMeetPinned = Boolean(meetSection && isDesktop);

        // Check for sticky ancestor container OR .tp-meet on desktop
        let stickyParent: HTMLElement | null = null;
        if (isMeetPinned) {
          stickyParent = meetSection?.querySelector<HTMLElement>('.tp-meet__stage') ?? null;
        } else {
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            if (getComputedStyle(p).position === 'sticky') {
              stickyParent = p;
              break;
            }
          }
        }

        let trackData: { kind: 'page' | 'pin'; top: number; from?: number; to?: number };
        let holdStart = 0;
        let holdEnd = 0;

        if (stickyParent) {
          const stickyTop = parseFloat(getComputedStyle(stickyParent).top) || 0;
          const offsetInSticky = r.top - stickyParent.getBoundingClientRect().top;

          let from = 0;
          let to = 0;
          if (meetSection && pinRange) {
            const meetTop = meetSection.getBoundingClientRect().top + scrollY;
            const scrollDist = Math.max(0, pinRange.offsetHeight - windowH);
            from = meetTop;
            to = from + scrollDist;
          } else {
            const container = stickyParent.parentElement;
            from = container ? container.getBoundingClientRect().top + scrollY - stickyTop : r.top + scrollY;
            to = container ? container.getBoundingClientRect().bottom + scrollY - stickyParent.offsetHeight - stickyTop : from + 800;
          }

          const screenY = stickyTop + offsetInSticky + anchor.y * (l - scale);
          trackData = {
            kind: 'pin',
            top: screenY,
            from,
            to,
          };
          holdStart = from;
          holdEnd = to;
        } else {
          trackData = {
            kind: 'page',
            top: restPageY,
          };
          const box = POSE_BOXES[pose] || [48, 30, 288, 236];
          const boxTop = restPageY + box[1] * scale;
          const boxBottom = restPageY + box[3] * scale;
          const boxCenterY = (boxTop + boxBottom) / 2;

          holdStart = boxCenterY - windowH * 0.72;
          holdEnd = boxCenterY - windowH * 0.38;

          if (i === 0) {
            holdStart = -100;
            holdEnd = Math.max(160, boxCenterY - windowH * 0.38);
          }

          if (i === stopElements.length - 1) {
            holdStart = Math.min(boxCenterY - windowH * 0.72, maxScroll - 200);
            holdEnd = 999999;
          }
        }

        return {
          element: el,
          scale,
          restPageX,
          restPageY,
          pose,
          facing,
          behind,
          act,
          holdStart,
          holdEnd,
          track: trackData,
        };
      });

      // Ensure hold ranges are strictly sequential
      for (let i = 0; i < stops.length - 1; i++) {
        if (stops[i].holdEnd >= stops[i + 1].holdStart) {
          const mid = (stops[i].holdEnd + stops[i + 1].holdStart) / 2;
          stops[i].holdEnd = mid - 20;
          stops[i + 1].holdStart = mid + 20;
        }
      }
    };

    computeStops();
    window.addEventListener('resize', computeStops);
    window.addEventListener('pup:recompute', computeStops);
    const recomputeTimer1 = setTimeout(computeStops, 60);
    const recomputeTimer2 = setTimeout(computeStops, 250);

    let currentPose = '';
    const applyPose = (pose: string, force = false) => {
      if (!force && pose === currentPose) return;
      currentPose = pose;

      if (pose === 'peek') {
        if (body) {
          body.style.opacity = '0';
          body.setAttribute('opacity', '0');
          body.setAttribute('transform', 'translate(0 0)');
          body.style.transform = '';
        }
        if (haunch) {
          haunch.style.opacity = '0';
          haunch.setAttribute('opacity', '0');
        }
        if (ledge) {
          ledge.style.opacity = '1';
          ledge.setAttribute('opacity', '1');
        }
        if (shadow) {
          shadow.style.opacity = '0';
          shadow.setAttribute('opacity', '0');
        }
        if (bf) {
          bf.style.opacity = '0';
          bf.setAttribute('opacity', '0');
        }
        if (ff) {
          ff.style.opacity = '0';
          ff.setAttribute('opacity', '0');
        }
        if (bn) {
          bn.style.opacity = '0';
          bn.setAttribute('opacity', '0');
        }
        if (fn) {
          fn.style.opacity = '0';
          fn.setAttribute('opacity', '0');
        }
        if (earL) earL.setAttribute('transform', 'rotate(-6 174 82)');
        if (earR) earR.setAttribute('transform', 'rotate(6 250 82)');
        if (tongue) {
          tongue.style.opacity = '1';
          tongue.setAttribute('opacity', '1');
        }
        if (mouth) {
          mouth.style.opacity = '0';
          mouth.setAttribute('opacity', '0');
        }
        if (happy) {
          happy.style.opacity = '0';
          happy.setAttribute('opacity', '0');
        }
        if (shut) {
          shut.style.opacity = '0';
          shut.setAttribute('opacity', '0');
        }
      } else if (pose === 'sit') {
        if (body) {
          body.style.opacity = '1';
          body.setAttribute('opacity', '1');
          body.setAttribute('transform', 'translate(0 -2) rotate(-24 196 206) translate(196 0) scale(1 1) translate(-196 0)');
          body.style.transform = '';
        }
        if (haunch) {
          haunch.style.opacity = '0.61';
          haunch.setAttribute('opacity', '0.61');
          haunch.setAttribute('transform', 'translate(0 0.88)');
        }
        if (ledge) {
          ledge.style.opacity = '0';
          ledge.setAttribute('opacity', '0');
        }
        if (shadow) {
          shadow.style.opacity = '0.12';
          shadow.setAttribute('opacity', '0.12');
        }
        if (bf) {
          bf.style.opacity = '0.39';
          bf.setAttribute('opacity', '0.39');
          bf.setAttribute('transform', 'translate(94 192) rotate(0)');
        }
        if (bn) {
          bn.style.opacity = '0.39';
          bn.setAttribute('opacity', '0.39');
          bn.setAttribute('transform', 'translate(110 194) rotate(0)');
        }
        if (ff) {
          ff.style.opacity = '1';
          ff.setAttribute('opacity', '1');
          ff.setAttribute('transform', 'translate(168 192) rotate(24)');
        }
        if (fn) {
          fn.style.opacity = '1';
          fn.setAttribute('opacity', '1');
          fn.setAttribute('transform', 'translate(186 194) rotate(24)');
        }
        if (tail) tail.setAttribute('transform', 'rotate(34 84 150)');
        if (earL) earL.setAttribute('transform', 'rotate(0 174 82)');
        if (earR) earR.setAttribute('transform', 'rotate(0 250 82)');
        if (tongue) {
          tongue.style.opacity = '1';
          tongue.setAttribute('opacity', '1');
        }
        if (mouth) {
          mouth.style.opacity = '0';
          mouth.setAttribute('opacity', '0');
        }
        if (happy) {
          happy.style.opacity = '0';
          happy.setAttribute('opacity', '0');
        }
        if (shut) {
          shut.style.opacity = '0';
          shut.setAttribute('opacity', '0');
        }
      } else if (pose === 'bow') {
        if (body) {
          body.style.opacity = '1';
          body.setAttribute('opacity', '1');
          body.setAttribute('transform', 'translate(0 2) rotate(15 196 206) translate(196 0) scale(1 1) translate(-196 0)');
          body.style.transform = '';
        }
        if (haunch) {
          haunch.style.opacity = '0';
          haunch.setAttribute('opacity', '0');
        }
        if (ledge) {
          ledge.style.opacity = '0';
          ledge.setAttribute('opacity', '0');
        }
        if (shadow) {
          shadow.style.opacity = '0.12';
          shadow.setAttribute('opacity', '0.12');
        }
        if (bf) {
          bf.style.opacity = '1';
          bf.setAttribute('opacity', '1');
        }
        if (ff) {
          ff.style.opacity = '1';
          ff.setAttribute('opacity', '1');
          ff.setAttribute('transform', 'translate(168 192) rotate(-52)');
        }
        if (bn) {
          bn.style.opacity = '1';
          bn.setAttribute('opacity', '1');
        }
        if (fn) {
          fn.style.opacity = '1';
          fn.setAttribute('opacity', '1');
          fn.setAttribute('transform', 'translate(186 194) rotate(-58)');
        }
        if (tail) tail.setAttribute('transform', 'rotate(-32 84 150)');
        if (earL) earL.setAttribute('transform', 'rotate(0 174 82)');
        if (earR) earR.setAttribute('transform', 'rotate(0 250 82)');
        if (tongue) {
          tongue.style.opacity = '1';
          tongue.setAttribute('opacity', '1');
        }
        if (mouth) {
          mouth.style.opacity = '0';
          mouth.setAttribute('opacity', '0');
        }
        if (happy) {
          happy.style.opacity = '1';
          happy.setAttribute('opacity', '1');
        }
        if (shut) {
          shut.style.opacity = '0';
          shut.setAttribute('opacity', '0');
        }
      } else if (pose === 'snug') {
        if (body) {
          body.style.opacity = '0';
          body.setAttribute('opacity', '0');
          body.setAttribute('transform', 'translate(0 0)');
          body.style.transform = '';
        }
        if (haunch) {
          haunch.style.opacity = '0';
          haunch.setAttribute('opacity', '0');
        }
        if (ledge) {
          ledge.style.opacity = '1';
          ledge.setAttribute('opacity', '1');
        }
        if (shadow) {
          shadow.style.opacity = '0';
          shadow.setAttribute('opacity', '0');
        }
        if (bf) {
          bf.style.opacity = '0';
          bf.setAttribute('opacity', '0');
        }
        if (ff) {
          ff.style.opacity = '0';
          ff.setAttribute('opacity', '0');
        }
        if (bn) {
          bn.style.opacity = '0';
          bn.setAttribute('opacity', '0');
        }
        if (fn) {
          fn.style.opacity = '0';
          fn.setAttribute('opacity', '0');
        }
        if (earL) earL.setAttribute('transform', 'rotate(3 174 82)');
        if (earR) earR.setAttribute('transform', 'rotate(-3 250 82)');
        if (tongue) {
          tongue.style.opacity = '0';
          tongue.setAttribute('opacity', '0');
        }
        if (mouth) {
          mouth.style.opacity = '0';
          mouth.setAttribute('opacity', '0');
        }
        if (happy) {
          happy.style.opacity = '0';
          happy.setAttribute('opacity', '0');
        }
        if (shut) {
          shut.style.opacity = '0';
          shut.setAttribute('opacity', '0');
        }
      } else {
        // walk / active
        if (body) {
          body.style.opacity = '1';
          body.setAttribute('opacity', '1');
          body.setAttribute('transform', 'translate(0 0) rotate(0 196 206) translate(196 0) scale(1 1) translate(-196 0)');
          body.style.transform = '';
        }
        if (haunch) {
          haunch.style.opacity = '0';
          haunch.setAttribute('opacity', '0');
        }
        if (ledge) {
          ledge.style.opacity = '0';
          ledge.setAttribute('opacity', '0');
        }
        if (shadow) {
          shadow.style.opacity = '0.12';
          shadow.setAttribute('opacity', '0.12');
        }
        if (bf) {
          bf.style.opacity = '1';
          bf.setAttribute('opacity', '1');
        }
        if (ff) {
          ff.style.opacity = '1';
          ff.setAttribute('opacity', '1');
        }
        if (bn) {
          bn.style.opacity = '1';
          bn.setAttribute('opacity', '1');
        }
        if (fn) {
          fn.style.opacity = '1';
          fn.setAttribute('opacity', '1');
        }
        if (earL) earL.setAttribute('transform', 'rotate(0 174 82)');
        if (earR) earR.setAttribute('transform', 'rotate(0 250 82)');
        if (tongue) {
          tongue.style.opacity = '1';
          tongue.setAttribute('opacity', '1');
        }
        if (mouth) {
          mouth.style.opacity = '0';
          mouth.setAttribute('opacity', '0');
        }
        if (happy) {
          happy.style.opacity = '0';
          happy.setAttribute('opacity', '0');
        }
        if (shut) {
          shut.style.opacity = '0';
          shut.setAttribute('opacity', '0');
        }
      }
    };

    let lastX = 0;
    let lastY = 0;
    let lastTreadmillScrollY = 0;
    let walkedDistance = 0;
    let printIdx = 0;
    let animFrameId: number;

    let lastTime = performance.now();
    let mouseTarget: { x: number; y: number; t: number } | null = null;
    let gazeX = 0;
    let gazeY = 0;
    let headTilt = 0;
    let nextBlink = 1.2;
    let blinkAt = -1;

    const onPointerMove = (e: MouseEvent | PointerEvent) => {
      mouseTarget = { x: e.clientX, y: e.clientY, t: performance.now() / 1000 };
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('mousemove', onPointerMove, { passive: true });

    const onFocusIn = (e: FocusEvent) => {
      const target = e.target;
      if (target instanceof HTMLElement && target.matches('a, button, input, textarea, select')) {
        const r = target.getBoundingClientRect();
        mouseTarget = {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
          t: performance.now() / 1000,
        };
      }
    };
    window.addEventListener('focusin', onFocusIn);

    const onPupCue = (e: Event) => {
      const ce = e as CustomEvent<{ look?: HTMLElement; secs?: number; say?: string }>;
      const detail = ce.detail;
      if (!detail) return;
      if (detail.look instanceof HTMLElement) {
        const r = detail.look.getBoundingClientRect();
        mouseTarget = {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
          t: performance.now() / 1000 + (detail.secs ?? 0.9),
        };
      }
      if (detail.say && bubble) {
        bubble.textContent = detail.say;
        bubble.setAttribute('data-show', 'true');
        setTimeout(() => bubble.setAttribute('data-show', 'false'), 2000);
      }
    };
    window.addEventListener('pup:cue', onPupCue);

    const BARK_PHRASES = ['Woof! 🐾', 'Wheee! ✨', 'I like you! 🐶', 'Boing! 🎾', 'Welcome! 🧸', 'Hi friend!'];
    let phraseIdx = 0;

    const onActorClick = () => {
      if (bubble) {
        bubble.textContent = BARK_PHRASES[phraseIdx++ % BARK_PHRASES.length];
        bubble.setAttribute('data-show', 'true');
        if (tail) {
          tail.setAttribute('transform', 'rotate(24 84 150)');
          setTimeout(() => tail.setAttribute('transform', 'rotate(-22 84 150)'), 180);
          setTimeout(() => tail.setAttribute('transform', 'rotate(18 84 150)'), 360);
          setTimeout(() => tail.setAttribute('transform', 'rotate(0 84 150)'), 540);
        }
        setTimeout(() => {
          bubble.setAttribute('data-show', 'false');
        }, 2100);
      }
    };

    actor.addEventListener('click', onActorClick);

    // Main animation frame loop
    const tick = (time: number) => {
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      if (stops.length >= 2) {
        let actorX = stops[0].restPageX - scrollX;
        let actorY = stops[0].restPageY - scrollY;
        let currentScale = stops[0].scale;
        let isHolding = false;
        let isBehind = stops[0].behind;
        let targetPose = stops[0].pose;
        let facingDir = stops[0].facing;

        // Check if holding at a stop
        let heldIndex = -1;
        for (let i = 0; i < stops.length; i++) {
          if (scrollY >= stops[i].holdStart && scrollY <= stops[i].holdEnd) {
            heldIndex = i;
            break;
          }
        }

        const getStopScreenPos = (s: StopData) => {
          const x = s.restPageX - scrollX;
          if (s.track.kind === 'pin') {
            const from = s.track.from ?? 0;
            const to = s.track.to ?? 0;
            if (scrollY < from) {
              return { x, y: s.track.top + (from - scrollY) };
            } else if (scrollY > to) {
              return { x, y: s.track.top - (scrollY - to) };
            } else {
              return { x, y: s.track.top };
            }
          }
          return { x, y: s.restPageY - scrollY };
        };

        if (heldIndex !== -1) {
          const s = stops[heldIndex];
          const pos = getStopScreenPos(s);
          actorX = pos.x;
          actorY = pos.y;
          currentScale = s.scale;
          isHolding = true;
          isBehind = s.behind;
          targetPose = s.pose;
          facingDir = s.facing;
        } else {
          // Traveling between stops along smooth spline
          let segIndex = 0;
          for (let i = 0; i < stops.length - 1; i++) {
            if (scrollY < stops[i + 1].holdStart) {
              segIndex = i;
              break;
            }
            segIndex = stops.length - 2;
          }

          const sA = stops[segIndex];
          const sB = stops[segIndex + 1];
          const posA = getStopScreenPos(sA);
          const posB = getStopScreenPos(sB);

          const travelDuration = Math.max(1, sB.holdStart - sA.holdEnd);
          const rawT = Math.min(1, Math.max(0, (scrollY - sA.holdEnd) / travelDuration));

          // Smooth cubic bezier easing
          const easeT = rawT * rawT * (3 - 2 * rawT);

          actorX = posA.x + (posB.x - posA.x) * easeT;
          let currentTargetY = posA.y + (posB.y - posA.y) * easeT;
          currentScale = sA.scale + (sB.scale - sA.scale) * rawT;

          // Gentle hop arc while travelling
          const arcHop = Math.sin(rawT * Math.PI) * 28;
          actorY = currentTargetY - arcHop;

          isHolding = false;
          isBehind = false;
          targetPose = 'walk';
          facingDir = posB.x >= posA.x ? 1 : -1;
        }

        actor.style.transform = `translate3d(${actorX.toFixed(2)}px, ${actorY.toFixed(2)}px, 0px)`;
        actorBody.style.transform = `scale(${currentScale.toFixed(4)})`;

        actor.setAttribute('data-holding', String(isHolding));
        layer.setAttribute('data-front', String(!isBehind));

        // Facing direction scale
        if (root) {
          root.setAttribute(
            'transform',
            `translate(0 0) translate(150 0) scale(${facingDir} 1) translate(-150 0)`
          );
        }

        applyPose(targetPose);

        const nowSec = performance.now() / 1000;
        const dt = Math.min(0.05, Math.max(0.001, (time - lastTime) / 1000));
        lastTime = time;

        // Cursor & focus tracking (lookAt)
        let gazeTarget = { x: 0, y: 0 };
        if (mouseTarget && nowSec - mouseTarget.t < 3.2) {
          const actorSvg = actor.querySelector('svg');
          if (actorSvg) {
            const svgRect = actorSvg.getBoundingClientRect();
            const pivotX = facingDir > 0 ? 212 : 300 - 212;
            const eyeScreenX = svgRect.left + (pivotX / 300) * svgRect.width;
            const eyeScreenY = svgRect.top + (98 / 240) * svgRect.height;
            const nX = mouseTarget.x - eyeScreenX;
            const nY = mouseTarget.y - eyeScreenY;
            const dist = Math.hypot(nX, nY) || 1;
            const reach = Math.min(1, dist / 110);
            gazeTarget = {
              x: (nX / dist) * reach * facingDir,
              y: (nY / dist) * reach,
            };
          }
        }

        // Smooth gaze interpolation
        const gazeSmooth = 1 - Math.exp(-dt / 0.06);
        gazeX += (gazeTarget.x - gazeX) * gazeSmooth;
        gazeY += (gazeTarget.y - gazeY) * gazeSmooth;

        // Smooth tilt interpolation
        const tiltSmooth = 1 - Math.exp(-dt / 0.12);
        headTilt += (8 * gazeX - headTilt) * tiltSmooth;

        // Natural blinking
        if (nowSec > nextBlink) {
          blinkAt = nowSec;
          nextBlink = nowSec + 2.2 + 3.8 * Math.random();
          if (Math.random() < 0.18) nextBlink = nowSec + 0.32;
        }
        const blinkFraction = (nowSec - blinkAt) / 0.15;
        const blinkVal = blinkFraction >= 0 && blinkFraction <= 1 ? Math.sin(blinkFraction * Math.PI) : 0;
        if (blink) {
          blink.setAttribute(
            'transform',
            `translate(0 ${(98 * blinkVal * 0.92).toFixed(2)}) scale(1 ${(1 - 0.92 * blinkVal).toFixed(2)})`
          );
        }

        // Update eyes (prominently tracks cursor)
        if (eyes) {
          const eyeX = (6.0 * gazeX).toFixed(2);
          const eyeY = (4.2 * gazeY).toFixed(2);
          eyes.setAttribute('transform', `translate(${eyeX} ${eyeY})`);
        }

        // Update head
        if (head) {
          let baseHeadX = 0;
          let baseHeadY = 0;
          let baseHeadRot = 0;
          if (targetPose === 'peek') {
            baseHeadY = 4;
          } else if (targetPose === 'snug') {
            baseHeadY = 9;
            baseHeadRot = 4;
          } else if (targetPose === 'sit') {
            baseHeadX = -10;
            baseHeadY = -6;
          } else if (targetPose === 'bow') {
            baseHeadX = 14;
            baseHeadY = 30;
          }

          if (isHolding && stops[heldIndex]?.act === 'tilt') {
            baseHeadRot += Math.sin(time * 0.0015) * 8;
          }

          const totalHeadRot = (baseHeadRot + headTilt).toFixed(2);
          head.setAttribute('transform', `translate(${baseHeadX.toFixed(2)} ${baseHeadY.toFixed(2)}) rotate(${totalHeadRot} 212 100)`);
        }

        // Walk cycle & leg motion
        const isTreadmill = isHolding && stops[heldIndex]?.act === 'treadmill';
        if (!isHolding || isTreadmill) {
          const scrollDelta = scrollY - lastTreadmillScrollY;
          const dx = actorX - lastX;
          const dy = actorY - lastY;
          const dist = isTreadmill ? Math.abs(scrollDelta) * 0.75 : Math.hypot(dx, dy);
          walkedDistance += dist;

          const stride = Math.sin(walkedDistance * 0.12) * 22;
          if (bf) bf.setAttribute('transform', `translate(94 192) rotate(${stride.toFixed(1)})`);
          if (ff) ff.setAttribute('transform', `translate(168 192) rotate(${(-stride).toFixed(1)})`);
          if (bn) bn.setAttribute('transform', `translate(110 194) rotate(${(-stride).toFixed(1)})`);
          if (fn) fn.setAttribute('transform', `translate(186 194) rotate(${stride.toFixed(1)})`);

          if (body) {
            const bob = Math.abs(Math.sin(walkedDistance * 0.12)) * -4;
            body.setAttribute('transform', `translate(0 ${bob.toFixed(1)}) rotate(0 196 206) translate(196 0) scale(1 1) translate(-196 0)`);
          }

          if (tail) {
            const wag = Math.sin(time * 0.008) * 16;
            tail.setAttribute('transform', `rotate(${wag.toFixed(1)} 84 150)`);
          }

          // Leave paw prints behind as it scurries
          if (!isTreadmill && dist > 1 && prints.length > 0 && walkedDistance % 36 < dist) {
            const printEl = prints[printIdx % prints.length];
            printIdx++;

            const printPageX = actorX + scrollX + 150 * currentScale + (printIdx % 2 === 0 ? 12 : -12) * currentScale;
            const printPageY = actorY + scrollY + 228 * currentScale - 12 * currentScale;
            const angle = Math.atan2(dy, dx) + Math.PI / 2;
            const size = Math.max(11, 14 * currentScale);

            printEl.style.transform = `translate(${(printPageX - size / 2).toFixed(1)}px, ${(printPageY - size / 2).toFixed(1)}px) rotate(${angle.toFixed(2)}rad)`;
            printEl.style.width = `${size.toFixed(1)}px`;
            printEl.style.height = `${size.toFixed(1)}px`;

            printEl.animate(
              [
                { opacity: 0, transform: `translate(${(printPageX - size / 2).toFixed(1)}px, ${(printPageY - size / 2).toFixed(1)}px) rotate(${angle.toFixed(2)}rad) scale(0.6)` },
                { opacity: 0.42, offset: 0.1, transform: `translate(${(printPageX - size / 2).toFixed(1)}px, ${(printPageY - size / 2).toFixed(1)}px) rotate(${angle.toFixed(2)}rad) scale(1)` },
                { opacity: 0.42, offset: 0.6 },
                { opacity: 0, transform: `translate(${(printPageX - size / 2).toFixed(1)}px, ${(printPageY - size / 2).toFixed(1)}px) rotate(${angle.toFixed(2)}rad) scale(0.85)` }
              ],
              { duration: 2500, easing: 'ease-out' }
            );
          }
        } else {
          // Idle breathing and tail wagging at stop
          if (targetPose === 'sit') {
            if (ff) ff.setAttribute('transform', 'translate(168 192) rotate(24)');
            if (fn) fn.setAttribute('transform', 'translate(186 194) rotate(24)');
            if (bf) bf.setAttribute('transform', 'translate(94 192) rotate(0)');
            if (bn) bn.setAttribute('transform', 'translate(110 194) rotate(0)');
            if (haunch) haunch.setAttribute('transform', 'translate(0 0.88)');
          } else if (targetPose === 'stand') {
            if (ff) ff.setAttribute('transform', 'translate(168 192) rotate(0)');
            if (fn) fn.setAttribute('transform', 'translate(186 194) rotate(0)');
            if (bf) bf.setAttribute('transform', 'translate(94 192) rotate(0)');
            if (bn) bn.setAttribute('transform', 'translate(110 194) rotate(0)');
          }
          if (tail) {
            const wagSpeed = stops[heldIndex]?.act === 'basket' ? 0.002 : 0.004;
            const wag = Math.sin(time * wagSpeed) * 10;
            tail.setAttribute('transform', `rotate(${wag.toFixed(1)} 84 150)`);
          }
        }

        lastTreadmillScrollY = scrollY;
        lastX = actorX;
        lastY = actorY;

        // Update data-visited and data-here on scenes
        const scenes = document.querySelectorAll<HTMLElement>('[data-pup-scene]');
        scenes.forEach((scene) => {
          const rect = scene.getBoundingClientRect();
          const inView = rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
          if (inView) {
            scene.setAttribute('data-visited', 'true');
          }
          const isHere = isHolding && stops[heldIndex]?.element.closest('[data-pup-scene]') === scene;
          scene.setAttribute('data-here', String(isHere));
        });
      }

      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrameId);
      clearTimeout(recomputeTimer1);
      clearTimeout(recomputeTimer2);
      window.removeEventListener('resize', computeStops);
      window.removeEventListener('pup:recompute', computeStops);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('focusin', onFocusIn);
      window.removeEventListener('pup:cue', onPupCue);
      actor.removeEventListener('click', onActorClick);
      document.documentElement.removeAttribute('data-pup');
      if (layer) {
        layer.setAttribute('hidden', '');
        layer.hidden = true;
      }
    };
  }, [pathname]);

  return null;
}
