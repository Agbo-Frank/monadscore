import { ConnectKitButton } from "connectkit";
import { FaWallet } from "react-icons/fa";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

export default function ConnectButton() {
  const { isReconnecting, isConnecting } = useAccount();
  const [connectionTimeout, setConnectionTimeout] = useState(false);

  // Handle connection timeout at the component level, not inside render function
  useEffect(() => {
    let timeoutId;
    if (isConnecting && !isReconnecting) {
      timeoutId = setTimeout(() => {
        setConnectionTimeout(true);
      }, 15000); // 15 second timeout
    } else {
      setConnectionTimeout(false);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isConnecting, isReconnecting]);

  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, address, ensName }) => {
        const getButtonText = () => {
          if (isConnected) {
            return (
              <span className="font-medium">
                {ensName ?? `${address.slice(0, 6)}...${address.slice(-4)}`}
              </span>
            );
          }
          
          if (isReconnecting) {
            return "Reconnecting...";
          }
          
          if (isConnecting) {
            return connectionTimeout ? "Connection timeout - Try again" : "Connecting...";
          }
          
          return "Connect Wallet";
        };

        return (
          <button
            onClick={show}
            className="w-full justify-center flex items-center space-x-2 bg-[#1C001E] hover:bg-[#2A002C] text-white px-6 py-3 rounded-lg border border-[#F675FF]/20 transition-all duration-200"
          >
            <FaWallet className="size-4" />
            <span>{getButtonText()}</span>
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}