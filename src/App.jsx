import React, { useRef, useEffect, useState } from "react";
import coinvid from "./assets/SO9OPe44WRlyjzTQ0aZqqsQQN8.mp4";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

// Use multiple endpoints for better reliability
const endpoints = [
  "https://solana-devnet.g.alchemy.com/v2/JkrHjtVtHtegREvk8bi_D",
  clusterApiUrl("devnet"),
  "https://api.devnet.solana.com"
];

import "../src/App.css";

const App = () => {
  const hasMounted = useRef(false);
  const [Balance, setBalance] = useState(null);
  const [airdropAmount, setAirdropAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastAirdropTime, setLastAirdropTime] = useState(0);
  
  const { connected, publicKey } = useWallet();

  // Helper function to get a working connection
  const getConnection = async () => {
    for (const endpoint of endpoints) {
      try {
        const connection = new Connection(endpoint, "confirmed");
        // Test the connection
        await connection.getSlot();
        return connection;
      } catch (error) {
        console.log(`Endpoint ${endpoint} failed, trying next...`);
        continue;
      }
    }
    throw new Error("All RPC endpoints are unavailable");
  };

  const fetchdata = async () => {
    if (!publicKey) return;
    
    try {
      const connection = await getConnection();
      const Lampportbal = await connection.getBalance(publicKey);
      const BalInSol = Lampportbal / LAMPORTS_PER_SOL;
      setBalance(BalInSol.toFixed(4));
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      toast.error("Unable to fetch balance!", {
        position: "bottom-right",
        autoClose: 2000,
      });
    }
  };

  const copyhandle = () => {
    navigator.clipboard.writeText(publicKey.toBase58());
    toast.info("Copied to clipboard 📋", {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  const validateAirdropAmount = (amount) => {
    const numAmount = parseFloat(amount);
    
    if (!amount || amount.trim() === "") {
      toast.error("Please enter an airdrop amount!", {
        position: "bottom-right",
        autoClose: 2000,
      });
      return false;
    }
    
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid positive number!", {
        position: "bottom-right",
        autoClose: 2000,
      });
      return false;
    }
    
    if (numAmount > 2) {
      toast.error("Maximum airdrop amount is 2 SOL!", {
        position: "bottom-right",
        autoClose: 2000,
      });
      return false;
    }
    
    return true;
  };

  const checkRateLimit = () => {
    const now = Date.now();
    const timeSinceLastAirdrop = now - lastAirdropTime;
    const cooldownPeriod = 10000; // 10 seconds
    
    if (timeSinceLastAirdrop < cooldownPeriod) {
      const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastAirdrop) / 1000);
      toast.warn(`Please wait ${remainingTime} seconds before next airdrop`, {
        position: "bottom-right",
        autoClose: 2000,
      });
      return false;
    }
    
    return true;
  };

  const airdrophandle = async () => {
    if (isLoading) return;
    
    if (!validateAirdropAmount(airdropAmount)) return;
    if (!checkRateLimit()) return;
    
    setIsLoading(true);
    const numAmount = parseFloat(airdropAmount);
    
    try {
      const connection = await getConnection();
      const lamports = numAmount * LAMPORTS_PER_SOL;
      
      toast.info("Requesting airdrop...", {
        position: "bottom-right",
        autoClose: 1000,
      });
      
      const signature = await connection.requestAirdrop(publicKey, lamports);
      
      toast.info("Confirming transaction...", {
        position: "bottom-right",
        autoClose: 2000,
      });
      
      // Wait for confirmation with timeout
      const confirmation = await Promise.race([
        connection.confirmTransaction(signature, "confirmed"),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Transaction timeout")), 30000)
        )
      ]);
      
      if (confirmation.value.err) {
        throw new Error("Transaction failed");
      }
      
      toast.success(`🎉 Successfully received ${numAmount} SOL!`, {
        position: "bottom-right",
        autoClose: 3000,
      });
      
      setLastAirdropTime(Date.now());
      setAirdropAmount("");
      await fetchdata(); // Refresh balance
      
    } catch (error) {
      console.error("Airdrop error:", error);
      
      let errorMessage = "Airdrop failed. Please try again later.";
      
      if (error.message.includes("429") || 
          error.message.includes("Too many requests") ||
          error.message.includes("rate limit")) {
        errorMessage = "Rate limit exceeded. Please wait a few minutes and try again.";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Devnet faucet is temporarily empty. Try again later.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Transaction timed out. Please check your balance and try again.";
      } else if (error.message.includes("endpoints")) {
        errorMessage = "Network connection issues. Please try again.";
      }
      
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    
    const fetchAccount = async () => {
      if (connected && publicKey) {
        await fetchdata();
        toast.success("Wallet Connected Successfully!", {
          position: "bottom-right",
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
          delay: 100,
        });
      } else {
        setBalance(null);
        toast.info("Wallet Disconnected!", {
          position: "bottom-right",
          autoClose: 3000,
          delay: 100,
        });
      }
    };
    
    fetchAccount();
  }, [connected, publicKey]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAirdropAmount(value);
    }
  };

  return (
    <div className="Headpage">
      <div className="mainpage">
      <div className="Nav">
        <div className="Logo">
          <h1>
            DRIP<span>X</span>
          </h1>
        </div>
        <li>
          <ul>Home</ul>
          <ul>About</ul>
          <ul>Signup</ul>
        </li>
      </div>

      <div className="Hero">
        <div className="Herotitle">
          <div>
            <video width="200" height="160" autoPlay muted loop>
              <source src={coinvid} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <h1>
            <span>DripX</span>: The Airdrop Engine
          </h1>
          <h3>
            Claim what's rightfully yours. <br /> <span>Faster.</span> Smoother.
            On <span>Solana</span>.
          </h3>
        </div>

        <div className="Maincard">
          <div className="noise"></div>
          <WalletMultiButton>
            {connected ? (
              <h3 style={{ fontFamily: "NM1" }}>
                More options{" "}
                <span>
                  <i className="fi fi-sr-settings"></i>
                </span>
              </h3>
            ) : (
              <h3 style={{ fontFamily: "NM1" }}>
                Click to Connect{" "}
                <span style={{ margin: "3px" }}>
                  <i className="fi fi-bs-channel"></i>
                </span>
              </h3>
            )}
          </WalletMultiButton>
          
          {connected && publicKey && (
            <>
              <div className="publickey">
                <h2 onClick={copyhandle} style={{ cursor: "pointer" }}>
                  Public key <span>🔗</span>
                </h2>
                <p>{publicKey.toBase58()}</p>
                <div className="Bal">
                  <h2>Balance 💰</h2>
                  <span>
                    <h6>{Balance ? Balance + " SOL" : "fetching..."}</h6>
                  </span>
                  <button 
                    onClick={fetchdata} 
                    className="Refresh"
                  >
                    Refresh🌀
                  </button>
                </div>
              </div>
              
              <div className="Airdrop">
                <input
                  type="text"
                  value={airdropAmount}
                  onChange={handleInputChange}
                  placeholder="Enter SOL amount (max 2) 💸"
                  disabled={isLoading}
                  style={{ opacity: isLoading ? 0.6 : 1 }}
                />
                <span>
                  <button
                    onClick={airdrophandle}
                    disabled={isLoading}
                    style={{ 
                      opacity: isLoading ? 0.6 : 1,
                      cursor: isLoading ? "not-allowed" : "pointer"
                    }}
                  >
                    {isLoading ? "SENDING..." : "SEND ◈"}
                  </button>
                </span>
              </div>
              
              <div style={{ 
                marginTop: "10px", 
                fontSize: "12px", 
                color: "#ffff",
                textAlign: "center"
              }}>
                <p>💡 Devnet SOL has no real value • Wait 10s between requests</p>
              </div>
            </>
          )}
        </div>
      </div>
      <ToastContainer theme="dark" />
    </div>
    <div className="page2">
          <div className="bg">
            
          </div>
    </div>
    </div>
    
  );
};

export default App;