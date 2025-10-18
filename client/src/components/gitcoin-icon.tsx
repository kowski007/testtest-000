
import gitcoinLogo from "@/assets/gitcoin.png";

export function GitcoinIcon({ className }: { className?: string }) {
  return (
    <img 
      src={gitcoinLogo} 
      alt="Gitcoin" 
      className={className}
      style={{ objectFit: 'cover', borderRadius: '2px' }}
    />
  );
}
