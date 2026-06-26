import { cn } from '@/lib/utils';

interface TagBadgeProps {
  label: string;
  color: string;
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
}

export default function TagBadge({ label, color, onClick, onDelete, className }: TagBadgeProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
        onClick && 'cursor-pointer hover:opacity-80 active:scale-95',
        color,
        className
      )}
    >
      {label}
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="ml-0.5 hover:text-destructive transition-colors"
        >
          ×
        </button>
      )}
    </span>
  );
}
