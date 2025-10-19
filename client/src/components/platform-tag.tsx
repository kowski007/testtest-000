import { PLATFORM_CONFIGS, PlatformCategory } from '../../shared/platform-config';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface PlatformTagProps {
  platform: string;
  className?: string;
}

export function PlatformTag({ platform, className = '' }: PlatformTagProps) {
  // Determine platform category from URL or platform string
  const getPlatformCategory = (platform: string): PlatformCategory => {
    const url = platform.toLowerCase();
    if (url.includes('gitcoin')) return 'gitcoin';
    if (url.includes('youtube') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('behance')) return 'behance';
    if (url.includes('github')) return 'github';
    if (url.includes('twitter')) return 'twitter';
    if (url.includes('farcaster')) return 'farcaster';
    if (url.includes('lens')) return 'lens';
    if (url.includes('discord')) return 'discord';
    if (url.includes('t.me') || url.includes('telegram')) return 'telegram';
    if (url.includes('devpost')) return 'devpost';
    if (url.includes('dribbble')) return 'dribbble';
    if (url.includes('medium')) return 'medium';
    return 'other';
  };

  const category = getPlatformCategory(platform);
  const config = PLATFORM_CONFIGS[category];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div
            className={`inline-flex items-center justify-center rounded-full p-1.5 ${className}`}
            style={{ backgroundColor: `${config.color}20` }}
          >
            <span className="text-sm" role="img" aria-label={config.category}>
              {config.icon}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="capitalize">
            {config.category} Project
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}