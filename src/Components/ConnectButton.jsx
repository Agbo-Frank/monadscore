import { ConnectButton as ThirdWebButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import client, { chain } from "../thirdweb/clients";

const defaultStyle = {
  height: '60px',
  width: '100%',
  borderRadius: '15px',
  backgroundColor: '#F675FF',
  border: '1px solid #300034',
  color: '#300034',
  marginTop: '16px',
  maxWidth: '100%',
  margin: '16px auto 0 auto'
}

export default function ConnectButton(props) {
  return (
    <ThirdWebButton
      client={client}
      chain={chain}
      detailsModal={{ assetTabs: ["token"] }}
      detailsButton={{

        displayBalanceToken: {
          [chain.id]: "0x0000000000000000000000000000000000000000",
        },
        style: {
          ...defaultStyle,
          ...(props?.style || {})
        },
        ...(props?.render ? { render: props.render } : {})
      }}
      connectButton={{
        label: "Connect Wallet",
        style: defaultStyle,
        ...props
      }}
      connectModal={{ showThirdwebBranding: false, size: "compact" }}
      wallets={[
        createWallet("io.metamask"),
        createWallet("com.coinbase.wallet"),
        createWallet("app.phantom")
      ]}
    />
  )
}