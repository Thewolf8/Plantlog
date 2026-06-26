import { Link } from 'react-router-dom';
import { GitFork } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenerationBadgeProps {
  generation: { number: number; parentPlantId: string | null };
  className?: string;
}

export default function GenerationBadge({ generation, className }: GenerationBadgeProps) {
  if (generation.number <= 1) return null;

  return (
    <div className={cn('flex items-center gap-1.5 text-xs', className)}>
      <GitFork className="w-3.5 h-3.5 text-primary" />
      <span className="font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded">
        G{generation.number}
      </span>
      {generation.parentPlantId && (
        <Link
          to={`/plant/${generation.parentPlantId}`}
          className="text-muted-foreground hover:text-primary transition-colors underline"
        >
          View Parent
        </Link>
      )}
    </div>
  );
}
