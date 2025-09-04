import { ConnectKitButton } from "connectkit";
import { FaWallet } from "react-icons/fa";

export default function ConnectButton() {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
        return (
          <button
            onClick={show}
            className="w-full justify-center flex items-center space-x-2 bg-[#1C001E] hover:bg-[#2A002C] text-white px-6 py-3 rounded-lg border border-[#F675FF]/20 transition-all duration-200"
          >
            <FaWallet className="size-4" />
            <span>
              {isConnected ? (
                <span className="font-medium">
                  {ensName ?? `${address.slice(0, 6)}...${address.slice(-4)}`}
                </span>
              ) : isConnecting ? (
                "Connecting..."
              ) : (
                "Connect Wallet"
              )}
            </span>
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  )
}