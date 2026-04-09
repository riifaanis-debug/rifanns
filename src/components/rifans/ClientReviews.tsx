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

const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 10 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={size} className={i <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
    ))}
  </div>
);

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
  <div className="min-w-[180px] max-w-[180px] bg-white dark:bg-[#12031a] rounded-xl border border-gold/30 dark:border-white/10 p-2.5 shadow-sm flex flex-col gap-1 shrink-0">
    <span className="text-[11px] font-extrabold text-brand dark:text-gray-100">{review.client_name}</span>
    <StarRating rating={review.rating} />
    <p className="text-[9px] leading-[1.6] text-muted dark:text-gray-400 line-clamp-3">{review.comment}</p>
  </div>
);

const ClientReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const speed = 0.5; // px per frame

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await (supabase as any)
        .from('client_reviews')
        .select('id, client_name, rating, comment')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (data) setReviews(data as Review[]);
    };
    fetchReviews();
  }, []);

  // Auto-scroll loop — never stops except on touch/drag
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || reviews.length === 0) return;

    const animate = () => {
      if (!isDragging.current && el) {
        el.scrollLeft += speed;
        const halfWidth = el.scrollWidth / 2;
        if (el.scrollLeft >= halfWidth) {
          el.scrollLeft -= halfWidth;
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [reviews]);

  // Touch/mouse drag
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    startX.current = e.clientX - el.offsetLeft;
    scrollLeft.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const x = e.clientX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  if (reviews.length === 0) return null;

  // Duplicate for seamless loop
  const loopedReviews = [...reviews, ...reviews];

  return (
    <Section id="client-reviews">
      <div className="px-1">
        <SectionHeader eyebrow="آراء العملاء" title="تقييمات عملائنا" subtitle="تجارب حقيقية من عملاء استفادوا من خدماتنا" />

        <div className="[mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] mt-2">
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <style>{`[id="client-reviews"] div::-webkit-scrollbar { display: none; }`}</style>
            {loopedReviews.map((review, i) => (
              <ReviewCard key={`r-${i}`} review={review} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default ClientReviews;
export { StarRating };
