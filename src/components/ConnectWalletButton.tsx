import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'
import { Wallet, ChevronDown, Copy, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

interface ConnectWalletButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ConnectWalletButton({ className, variant = 'outline', size = 'sm' }: ConnectWalletButtonProps) {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast.success('Address copied to clipboard')
    }
  }

  const openEtherscan = () => {
    if (address) {
      const baseUrl = chainId === 1 ? 'https://etherscan.io' : 
                     chainId === 11155111 ? 'https://sepolia.etherscan.io' :
                     chainId === 137 ? 'https://polygonscan.com' :
                     'https://etherscan.io'
      window.open(`${baseUrl}/address/${address}`, '_blank')
    }
  }

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum'
      case 11155111: return 'Sepolia'
      case 137: return 'Polygon'
      default: return `Chain ${chainId}`
    }
  }

  const getChainColor = (chainId: number) => {
    switch (chainId) {
      case 1: return 'bg-blue-500'
      case 11155111: return 'bg-purple-500'
      case 137: return 'bg-violet-500'
      default: return 'bg-gray-500'
    }
  }

  if (isConnected && address) {
    const shortAddress = `${address.slice(0, 6)}…${address.slice(-4)}`
    
    return (
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className={className}>
            <div className={`w-2 h-2 rounded-full mr-2 ${getChainColor(chainId)}`} />
            <Wallet className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{shortAddress}</span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Wallet Connected</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-xs text-gray-500 mb-2">
              <Badge variant="outline" className="text-xs">
                {getChainName(chainId)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1">
                {shortAddress}
              </code>
            </div>
          </div>
          <DropdownMenuItem onClick={copyAddress}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openEtherscan}>
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Explorer
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => disconnect()}
            className="text-red-600 focus:text-red-600"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (isConnecting || isPending) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse" />
        <Wallet className="h-4 w-4 mr-2" />
        Connecting...
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {connectors.map((connector) => (
          <DropdownMenuItem
            key={connector.id}
            onClick={() => {
              try {
                connect({ connector })
              } catch (error) {
                console.error('Connection error:', error)
                toast.error('Failed to connect wallet')
              }
            }}
            disabled={!connector.ready}
          >
            <Wallet className="h-4 w-4 mr-2" />
            {connector.name}
            {!connector.ready && ' (not detected)'}
          </DropdownMenuItem>
        ))}
        
        {error && (
          <div className="px-2 py-1.5 text-xs text-red-600 border-t">
            <AlertTriangle className="h-3 w-3 mr-1 inline" />
            Connection failed
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
