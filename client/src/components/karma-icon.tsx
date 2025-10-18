
import karmaLogo from "@/assets/karma.jpg";

export function KarmaIcon({ className }: { className?: string }) {
  return (
    <img 
      src={karmaLogo} 
      alt="KarmaGap" 
      className={className}
      style={{ objectFit: 'cover', borderRadius: '2px' }}
    />
  );
}
