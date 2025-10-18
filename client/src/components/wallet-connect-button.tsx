import { usePrivy } from '@privy-io/react-auth';
import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";

export default function WalletConnectButton() {
  const { ready, authenticated, login, logout, user } = usePrivy();

  if (!ready) {
    return (
      <Button disabled variant="outline" className="rounded-xl">
        Loading...
      </Button>
    );
  }

  if (authenticated && user) {
    const address = user.wallet?.address;
    const displayAddress = address 
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : 'Connected';

    return (
      <div className="flex gap-2 items-center">
        <div className="text-xs text-muted-foreground hidden sm:block">
          {displayAddress}
        </div>
        <Button 
          onClick={logout}
          variant="outline" 
          className="rounded-full h-8 px-3 text-sm"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={login}
      variant="default"
      className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold text-sm px-3 h-8 whitespace-nowrap rounded-full"
      data-testid="button-wallet-connect"
    >
      <Wallet className="w-3.5 h-3.5 mr-1.5" />
      Connect
    </Button>
  );
}