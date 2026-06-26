import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  index?: number;
}

export default function StatCard({ label, value, icon, color = 'text-primary', index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="rounded-xl border bg-card p-3 flex flex-col items-center text-center gap-1"
    >
      <div className={cn('p-2 rounded-lg bg-muted', color)}>{icon}</div>
      <span className="text-lg font-bold leading-tight">{value}</span>
      <span className="text-[10px] text-muted-foreground leading-tight">{label}</span>
    </motion.div>
  );
}
