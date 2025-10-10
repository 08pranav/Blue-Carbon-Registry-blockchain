import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'

interface ConnectWalletButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ConnectWalletButton({ className, variant = 'outline', size = 'sm' }: ConnectWalletButtonProps) {
  const handleClick = () => {
    // Simple fallback - just show a message
    alert('Wallet connection temporarily disabled. Using demo mode with fixed wallets.');
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
    >
      <Wallet className="h-4 w-4 mr-2" />
      Connect Wallet
    </Button>
  );
}