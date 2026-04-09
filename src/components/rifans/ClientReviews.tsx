import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Section, SectionHeader } from './Shared';

interface Review {
  id: string;
  client_name: string;
  rating: number;
  comment: string;
}

const AUTO_SCROLL_SPEED = 28;

const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 10 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={size} className={i <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
    ))}
  </div>
);

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
  <div className="min-w-[180px] max-w-[180px] bg-white dark:bg-[#12031a] rounded-xl border border-gold/30 dark:border-white/10 p-2.5 shadow-sm flex shrink-0 flex-col gap-1">
    <span className="text-[11px] font-extrabold text-brand dark:text-gray-100">{review.client_name}</span>
    <StarRating rating={review.rating} />
    <p className="text-[9px] leading-[1.6] text-muted dark:text-gray-400 line-clamp-3">{review.comment}</p>
  </div>
);

const getGapValue = (element: HTMLDivElement) => {
  const styles = window.getComputedStyle(element);
  const gap = styles.columnGap || styles.gap || '0';
  const parsedGap = Number.parseFloat(gap);
  return Number.isFinite(parsedGap) ? parsedGap : 0;
};

const ClientReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstGroupRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const lastFrameTime = useRef<number | null>(null);
  const cycleWidthRef = useRef(0);
  const offsetRef = useRef(0);
  const isDragging = useRef(false);
  const isHovered = useRef(false);
  const startX = useRef(0);
  const dragStartOffset = useRef(0);

  const applyTransform = useCallback(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    }
  }, []);

  const normalizeOffset = useCallback(() => {
    const cycleWidth = cycleWidthRef.current;
    if (!cycleWidth) return;

    while (offsetRef.current <= -cycleWidth) {
      offsetRef.current += cycleWidth;
    }

    while (offsetRef.current > 0) {
      offsetRef.current -= cycleWidth;
    }
  }, []);

  const measureCycleWidth = useCallback(() => {
    if (!trackRef.current || !firstGroupRef.current) return;
    cycleWidthRef.current = firstGroupRef.current.getBoundingClientRect().width + getGapValue(trackRef.current);
    normalizeOffset();
    applyTransform();
  }, [applyTransform, normalizeOffset]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await (supabase as any)
        .from('client_reviews')
        .select('id, client_name, rating, comment')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (data) {
        setReviews(data as Review[]);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    if (reviews.length === 0 || !trackRef.current || !firstGroupRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    measureCycleWidth();

    const animate = (timestamp: number) => {
      if (lastFrameTime.current === null) {
        lastFrameTime.current = timestamp;
      }

      const delta = timestamp - lastFrameTime.current;
      lastFrameTime.current = timestamp;

      if (!prefersReducedMotion && !isDragging.current && !isHovered.current && cycleWidthRef.current > 0) {
        offsetRef.current += (AUTO_SCROLL_SPEED * delta) / 1000;
        normalizeOffset();
        applyTransform();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          measureCycleWidth();
        })
      : null;

    if (resizeObserver) {
      resizeObserver.observe(trackRef.current);
      resizeObserver.observe(firstGroupRef.current);
    } else {
      window.addEventListener('resize', measureCycleWidth);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      lastFrameTime.current = null;
      resizeObserver?.disconnect();
      if (!resizeObserver) {
        window.removeEventListener('resize', measureCycleWidth);
      }
    };
  }, [reviews, applyTransform, measureCycleWidth, normalizeOffset]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startX.current = e.clientX;
    dragStartOffset.current = offsetRef.current;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      offsetRef.current = dragStartOffset.current + (e.clientX - startX.current);
      normalizeOffset();
      applyTransform();
    },
    [applyTransform, normalizeOffset],
  );

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  if (reviews.length === 0) return null;

  return (
    <Section id="client-reviews">
      <div className="px-1">
        <SectionHeader eyebrow="آراء العملاء" title="تقييمات عملائنا" subtitle="تجارب حقيقية من عملاء استفادوا من خدماتنا" />

        <div className="mt-2 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <div
            className="cursor-grab select-none overflow-hidden active:cursor-grabbing"
            style={{ touchAction: 'pan-y' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onMouseEnter={() => {
              isHovered.current = true;
            }}
            onMouseLeave={() => {
              isHovered.current = false;
            }}
          >
            <div ref={trackRef} className="flex w-max gap-2" style={{ willChange: 'transform' }}>
              <div ref={firstGroupRef} className="flex shrink-0 gap-2">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              <div className="flex shrink-0 gap-2" aria-hidden="true">
                {reviews.map((review) => (
                  <ReviewCard key={`${review.id}-duplicate`} review={review} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default ClientReviews;
export { StarRating };
