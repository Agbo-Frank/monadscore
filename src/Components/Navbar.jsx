import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logo } from "../Assets";
import { FaWallet, FaExchangeAlt, FaWater, FaSeedling, FaBriefcase } from "react-icons/fa";
import ConnectButton from "./ConnectButton";
import { useActiveAccount } from "thirdweb/react";
import { truncateAddress } from "../utils";

const menuItems = [
  { id: 1, label: "Swap", link: "/", icon: <FaExchangeAlt size={20} /> },
  { id: 2, label: "Pools", link: "/pools", icon: <FaWater size={20} /> },
  { id: 3, label: "Stake", link: "/stake", icon: <FaSeedling size={20} /> },
  { id: 4, label: "Portfolio", link: "/portfolio", icon: <FaBriefcase size={20} /> },
];

const Navbar = () => {
  const [scrolling, setScrolling] = useState(false);
  const location = useLocation();
  const account = useActiveAccount()

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top navbar with logo and connect wallet */}
      <nav
        className={`w-full fixed z-30 top-0 left-0 transition-all duration-300 ${scrolling ? "bg-[#300034]" : "bg-transparent"
          }`}
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="text-2xl text-white flex-1">
            <img src={logo} alt="Logo" className="w-60" />
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center lg:space-x-24 bg-[#F675FF]/20 rounded-md">
              {menuItems.map((item) => (
                <a
                  key={item.id}
                  href={item.link}
                  className={`${location.pathname === item.link
                    ? "border border-white rounded-lg px-10 py-3 text-white"
                    : "px-3 py-1 text-white/50"
                    }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Desktop Connect Wallet */}
          <div className="hidden md:flex flex-1 justify-end">
            <ConnectButton
              label={
                <>
                  <FaWallet className="size-4" />
                  <span>Connect Wallet</span>
                </>
              }
              style={{
                backgroundColor: '#1C001E',
                color: 'white',
                paddingLeft: '20px',
                paddingRight: '20px',
                paddingBottom: '12px',
                paddingTop: '12px',
                marginTop: 1,
                height: "100%",
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              render={() => (
                <button className="bg-[#1C001E] text-white mt-px h-full py-2 px-4 rounded-md flex items-center gap-2">
                  <FaWallet className="size-4" />
                  <span>{truncateAddress(account.address)}</span>
                </button>
              )}
            />
          </div>
        </div>
      </nav>

      {/* Mobile bottom menu */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#620268] text-white flex justify-around items-center py-3 z-40 rounded-t-lg">
        {menuItems.map((item) => (
          <a
            key={item.id}
            href={item.link}
            className={`text-center flex flex-col items-center text-xs ${location.pathname === item.link
              ? "text-white font-semibold"
              : "text-white/60"
              }`}
          >
            <div>{item.icon}</div>
            <span>{item.label}</span>
          </a>
        ))}
      </div>
    </>
  );
};

export default Navbar;