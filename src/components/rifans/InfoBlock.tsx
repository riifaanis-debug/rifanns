import React, { useEffect, useState } from 'react';
import { Section, SectionHeader, Card } from './Shared';

const InfoBlock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Section id="contact-block">
      <Card>
        <SectionHeader 
          eyebrow="معلومات تهمك" 
          title="الوقت الآن – وساعات العمل"
        />
        <div className="grid grid-cols-1 gap-2">
          <div className="rounded-[14px] bg-white border border-gold/50 p-2.5">
            <div className="text-[11px] text-gold mb-0.5">الوقت الآن (تلقائي)</div>
            <div className="text-[14px] font-extrabold text-brand mb-0.5 tabular-nums">
              {time.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[12px] text-muted">
              {time.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </Card>
    </Section>
  );
};

export default InfoBlock;
