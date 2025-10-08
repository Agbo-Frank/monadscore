import { useEffect, useState } from 'react';
import { useAccount, useDisconnect, useReconnect } from 'wagmi';

/**
 * Component to handle wallet connection state logging and debugging
 * ConnectKit handles persistence automatically with proper configuration
 */
export default function WalletConnectionManager({ children }) {
  const { isConnected, address, isReconnecting, isConnecting } = useAccount();
  const { reconnect } = useReconnect();
  const { disconnect } = useDisconnect();
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    // Log connection state for debugging purposes
    if (process.env.NODE_ENV === 'development') {
      console.log('Wallet Connection Status:', {
        isConnected,
        isConnecting,
        isReconnecting,
        address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null,
        reconnectAttempts,
        timestamp: new Date().toISOString()
      });
    }
  }, [isConnected, address, isConnecting, isReconnecting, reconnectAttempts]);

  useEffect(() => {
    // Handle stuck reconnection state
    let timeoutId;
    
    if (isReconnecting && reconnectAttempts < 3) {
      timeoutId = setTimeout(() => {
        console.warn('Reconnection taking too long, attempting manual reconnect...');
        setReconnectAttempts(prev => prev + 1);
        try {
          reconnect();
        } catch (error) {
          console.error('Manual reconnect failed:', error);
          if (reconnectAttempts >= 2) {
            console.log('Max reconnect attempts reached, disconnecting...');
            disconnect();
            setReconnectAttempts(0);
          }
        }
      }, 10000); // 10 second timeout for reconnection
    } else if (isConnected) {
      // Reset reconnect attempts when successfully connected
      setReconnectAttempts(0);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isReconnecting, reconnectAttempts, reconnect, disconnect, isConnected]);

  return children;
}
