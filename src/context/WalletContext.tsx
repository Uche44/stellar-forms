import React, { createContext, useContext, useState, useEffect } from "react";
import { Horizon } from "@stellar/stellar-sdk";
import { StellarWalletsKit, Networks } from "@creit.tech/stellar-wallets-kit";
import { FreighterModule } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { AlbedoModule } from "@creit.tech/stellar-wallets-kit/modules/albedo";
import { xBullModule } from "@creit.tech/stellar-wallets-kit/modules/xbull";
import { WalletModal, WalletType } from "../components/WalletModal";
import toast from "react-hot-toast";

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  walletType: WalletType | null;
  isLoadingBalance: boolean;
  isWalletModalOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  connect: (walletType: WalletType) => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  signTransaction: (xdr: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Initialize the static StellarWalletsKit
StellarWalletsKit.init({
  modules: [new FreighterModule(), new AlbedoModule(), new xBullModule()],
  network: Networks.TESTNET,
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);

  // Stellar Testnet Horizon server
  const horizonServer = new Horizon.Server(
    "https://horizon-testnet.stellar.org",
  );

  useEffect(() => {
    // Restore session
    const savedAddress = localStorage.getItem("stellarforms_address");
    const savedWallet = localStorage.getItem(
      "stellarforms_wallet_type",
    ) as WalletType | null;

    if (savedAddress && savedWallet) {
      setAddress(savedAddress);
      setWalletType(savedWallet);
      setIsConnected(true);
    }
  }, []);

  useEffect(() => {
    if (address) {
      refreshBalance();
    } else {
      setBalance(null);
    }
  }, [address]);

  const refreshBalance = async () => {
    if (!address) return;
    setIsLoadingBalance(true);
    try {
      const accountInfo = await horizonServer.loadAccount(address);
      const nativeBalance = accountInfo.balances.find(
        (b) => b.asset_type === "native",
      );
      if (nativeBalance) {
        setBalance(parseFloat(nativeBalance.balance).toFixed(2));
      } else {
        setBalance("0.00");
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("0.00 (Unfunded Account)");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const connect = async (type: WalletType) => {
    const loadingToast = toast.loading(`Connecting to ${type} wallet...`);
    try {
      StellarWalletsKit.setWallet(type);
      const { address: publicKey } = await StellarWalletsKit.fetchAddress();

      if (publicKey) {
        setAddress(publicKey);
        setWalletType(type);
        setIsConnected(true);
        localStorage.setItem("stellarforms_address", publicKey);
        localStorage.setItem("stellarforms_wallet_type", type);
        toast.success(`${type} wallet connected!`, { id: loadingToast });
      }
    } catch (error: any) {
      console.error("Connection failed:", error);
      toast.error(error.message || "Failed to connect wallet.", {
        id: loadingToast,
      });
    }
  };

  const disconnect = () => {
    setAddress(null);
    setWalletType(null);
    setIsConnected(false);
    setBalance(null);
    localStorage.removeItem("stellarforms_address");
    localStorage.removeItem("stellarforms_wallet_type");
    toast.success("Wallet disconnected.");
  };

  const signTransaction = async (xdr: string): Promise<string> => {
    if (!walletType || !address) {
      throw new Error("Wallet not connected.");
    }
    StellarWalletsKit.setWallet(walletType);
    const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
      address,
    });
    return signedTxXdr;
  };

  const openWalletModal = () => setIsWalletModalOpen(true);
  const closeWalletModal = () => setIsWalletModalOpen(false);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        balance,
        walletType,
        isLoadingBalance,
        isWalletModalOpen,
        openWalletModal,
        closeWalletModal,
        connect,
        disconnect,
        refreshBalance,
        signTransaction,
      }}
    >
      {children}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={closeWalletModal}
        onSelect={(type) => connect(type)}
      />
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
