import { Button } from '@/components/ui/button'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { Wallet } from 'lucide-react'

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    const short = `${address?.slice(0, 6)}…${address?.slice(-4)}`
    return (
      <Button variant="outline" size="sm" onClick={() => disconnect()}>
        <Wallet className="h-4 w-4 mr-2" /> {short}
      </Button>
    )
  }

  return (
    <Button size="sm" onClick={() => connect({ connector: injected() })} disabled={isPending}>
      <Wallet className="h-4 w-4 mr-2" /> Connect Wallet
    </Button>
  )
}