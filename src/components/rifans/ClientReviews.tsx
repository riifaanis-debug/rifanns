import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Section, Card, SectionHeader } from './Shared';

interface Review {
  id: string;
  client_name: string;
  rating: number;
  comment: string;
}

const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 12 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={size} className={i <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
    ))}
  </div>
);

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
  <div className="min-w-[240px] max-w-[240px] bg-white dark:bg-[#12031a] rounded-2xl border border-gold/30 dark:border-white/10 p-4 shadow-sm flex flex-col gap-2 shrink-0">
    <div className="flex items-center justify-between">
      <span className="text-[13px] font-extrabold text-brand dark:text-gray-100">{review.client_name}</span>
    </div>
    <StarRating rating={review.rating} />
    <p className="text-[11px] leading-[1.8] text-muted dark:text-gray-400 line-clamp-5">{review.comment}</p>
  </div>
);

const ClientReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('client_reviews')
        .select('id, client_name, rating, comment')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (data) setReviews(data);
    };
    fetchReviews();
  }, []);

  if (reviews.length === 0) return null;

  const half = Math.ceil(reviews.length / 2);
  const row1 = reviews.slice(0, half);
  const row2 = reviews.slice(half);

  return (
    <Section id="client-reviews">
      <Card className="overflow-hidden">
        <SectionHeader eyebrow="آراء العملاء" title="تقييمات عملائنا" subtitle="تجارب حقيقية من عملاء استفادوا من خدماتنا" />
        
        <div className="space-y-3 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          {/* Row 1 - moves right */}
          <div className="relative w-full overflow-hidden">
            <motion.div
              className="flex gap-3"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ x: { repeat: Infinity, repeatType: 'loop', duration: 40, ease: 'linear' } }}
              style={{ width: 'max-content' }}
            >
              {[...row1, ...row1].map((review, i) => (
                <ReviewCard key={`r1-${i}`} review={review} />
              ))}
            </motion.div>
          </div>

          {/* Row 2 - moves left */}
          <div className="relative w-full overflow-hidden">
            <motion.div
              className="flex gap-3"
              animate={{ x: ['-50%', '0%'] }}
              transition={{ x: { repeat: Infinity, repeatType: 'loop', duration: 45, ease: 'linear' } }}
              style={{ width: 'max-content' }}
            >
              {[...row2, ...row2].map((review, i) => (
                <ReviewCard key={`r2-${i}`} review={review} />
              ))}
            </motion.div>
          </div>
        </div>
      </Card>
    </Section>
  );
};

export default ClientReviews;
export { StarRating };
