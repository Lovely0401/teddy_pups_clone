'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CURTAIN_INNER_HTML } from './curtainInnerHtml';

type CurtainState = 'intro' | 'covering' | 'covered' | 'lifting' | 'idle';

export function PageCurtain() {
  const [state, setState] = useState<CurtainState>('intro');
  const pathname = usePathname();
  const router = useRouter();
  const isInitialMount = useRef(true);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial page load intro animation
  useEffect(() => {
    // The CSS animation for 'intro' lifts the blanket at 0.56s and finishes at 1.04s
    const timer = setTimeout(() => {
      setState('idle');
      isInitialMount.current = false;
    }, 1040);

    return () => clearTimeout(timer);
  }, []);

  // 2. React to Next.js route / pathname changes
  useEffect(() => {
    if (isInitialMount.current) return;

    // When the route has updated, lift the curtain to reveal the new page
    setState('lifting');
    const timer = setTimeout(() => {
      setState('idle');
    }, 480);

    return () => clearTimeout(timer);
  }, [pathname]);

  // 3. Intercept internal link clicks to trigger seamless curtain page transitions
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Don't intercept if modified click (CMD+click, Ctrl+click, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }

      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      // Ignore external links, downloads, new tabs, anchors, and tel/mailto/wa.me
      if (
        !href ||
        targetAttr === '_blank' ||
        target.hasAttribute('download') ||
        href.startsWith('#') ||
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.includes('wa.me')
      ) {
        return;
      }

      // Check if it's an internal route
      if (href.startsWith('/')) {
        e.preventDefault();

        // If clicking the current route, play a quick scurry
        if (href === pathname) {
          setState('covering');
          setTimeout(() => {
            setState('lifting');
            setTimeout(() => setState('idle'), 480);
          }, 280);
          return;
        }

        // Start covering transition
        setState('covering');
        if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);

        transitionTimerRef.current = setTimeout(() => {
          setState('covered');
          router.push(href);
        }, 300);
      }
    };

    document.addEventListener('click', handleDocumentClick, true);

    // Global helper to trigger the pet runner animation on demand
    (window as unknown as { triggerCurtainRunner: () => void }).triggerCurtainRunner = () => {
      setState('covering');
      setTimeout(() => {
        setState('covered');
        setTimeout(() => {
          setState('lifting');
          setTimeout(() => setState('idle'), 480);
        }, 120);
      }, 300);
    };

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [pathname, router]);

  return (
    <div
      className="tp-curtain"
      data-state={state}
      aria-hidden={state === 'idle'}
      dangerouslySetInnerHTML={{ __html: CURTAIN_INNER_HTML }}
    />
  );
}

