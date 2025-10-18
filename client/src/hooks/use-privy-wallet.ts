
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useMemo } from 'react';

export function usePrivyWallet() {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();

  const wallet = useMemo(() => {
    if (!authenticated || !user?.wallet) return null;
    
    // Get the embedded wallet or connected wallet
    return wallets[0] || null;
  }, [authenticated, user, wallets]);

  const address = user?.wallet?.address;

  return {
    isReady: ready,
    isConnected: authenticated && !!address,
    address: address as `0x${string}` | undefined,
    wallet,
    user,
  };
}
