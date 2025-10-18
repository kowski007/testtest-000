
import farcasterLogo from "@/assets/farcaster-seeklogo.png";

export function FarcasterIcon({ className }: { className?: string }) {
  return (
    <img 
      src={farcasterLogo} 
      alt="Farcaster" 
      className={className}
      style={{ objectFit: 'cover', borderRadius: '2px' }}
    />
  );
}
