import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logo } from "../Assets";
import { FaWallet, FaExchangeAlt, FaSeedling, FaBriefcase, FaBook, FaDiscord, FaTwitter, FaBars, FaTimes } from "react-icons/fa";
import ConnectButton from "./ConnectButton";
import { useActiveAccount } from "thirdweb/react";
import { truncateAddress } from "../utils";

const menuItems = [
  { id: 1, label: "Swap", link: "/", icon: <FaExchangeAlt size={20} /> },
  { id: 2, label: "TG Trading Bot", link: "/tg-bot", icon: <FaSeedling size={20} /> },
  { id: 3, label: "Portfolio", link: "/portfolio", icon: <FaBriefcase size={20} /> },
  {
    id: 4,
    label: "More",
    icon: <FaBook size={20} />,
    subItems: [
      { id: 1, label: "Documentation", link: "/docs", icon: <FaBook size={16} /> },
      { id: 2, label: "Discord", link: "/discord", icon: <FaDiscord size={16} /> },
      { id: 3, label: "X", link: "/x", icon: <FaTwitter size={16} /> },
    ],
  },
];

const Navbar = () => {
  const [scrolling, setScrolling] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const account = useActiveAccount();

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Add click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  const isActiveLink = (link) => location.pathname === link;

  const renderMenuItem = (item) => {
    if (item.subItems) {
      return (
        <div key={item.id} className="relative dropdown-container">
          <button
            className="px-4 py-2 text-white/70 hover:text-white focus:outline-none flex items-center space-x-2 transition-colors duration-200"
            onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
          >
            <span>{item.label}</span>
            <svg
              className={`w-4 h-4 text-white/50 transition-transform duration-200 ${activeDropdown === item.id ? 'rotate-180' : ''
                }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          {activeDropdown === item.id && (
            <div className="absolute left-0 mt-2 w-48 bg-[#300034] border border-[#F675FF]/20 rounded-lg shadow-xl z-50 transform scale-100 transition-all duration-200">
              {item.subItems.map((subItem) => (
                <a
                  key={subItem.id}
                  href={subItem.link}
                  className={`px-4 py-3 text-white/80 hover:bg-[#620268] hover:text-white transition-all duration-200 flex items-center space-x-3 ${isActiveLink(subItem.link) ? "bg-[#620268] text-white font-medium" : ""
                    }`}
                  onClick={() => setActiveDropdown(null)}
                >
                  {subItem.icon}
                  <span>{subItem.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <a
        key={item.id}
        href={item.link}
        className={`px-4 py-2 text-white/70 hover:text-white transition-all duration-200 ${isActiveLink(item.link)
          ? "text-white font-medium bg-[#F675FF]/20 rounded-lg border border-[#F675FF]/40"
          : ""
          }`}
      >
        {item.label}
      </a>
    );
  };

  return (
    <>
      {/* Main Navigation Bar */}
      <nav
        className={`w-full fixed z-30 top-0 left-0 transition-all duration-300 ${scrolling ? "bg-[#300034]/95 backdrop-blur-sm border-b border-[#F675FF]/20" : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center">
                <img src={logo} alt="MonadScore" className="h-14 w-auto" />
              </a>
            </div>

            {/* Desktop Navigation Menu */}
            <div className="hidden lg:flex items-center space-x-1">
              <div className="flex items-center bg-[#F675FF]/10 rounded-xl p-1 border border-[#F675FF]/20">
                {menuItems.map(renderMenuItem)}
              </div>
            </div>

            {/* Desktop Connect Wallet */}
            <div className="hidden lg:flex items-center">
              <ConnectButton
                label={
                  <div className="flex items-center space-x-2 bg-[#1C001E] hover:bg-[#2A002C] text-white px-6 py-3 rounded-lg border border-[#F675FF]/20 transition-all duration-200">
                    <FaWallet className="size-4" />
                    <span>Connect Wallet</span>
                  </div>
                }
                style={{
                  backgroundColor: 'transparent',
                  color: 'white',
                  padding: 0,
                  margin: 0,
                  height: "auto",
                  borderRadius: '0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0'
                }}
                render={() => (
                  <div className="flex items-center space-x-3 bg-[#1C001E] hover:bg-[#2A002C] text-white px-6 py-3 rounded-lg border border-[#F675FF]/20 transition-all duration-200">
                    <FaWallet className="size-4" />
                    <span className="font-medium">{truncateAddress(account.address)}</span>
                  </div>
                )}
              />
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-[#F675FF]/10 transition-colors duration-200"
              >
                {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-4 py-6 space-y-4 bg-[#300034]/95 backdrop-blur-sm border-t border-[#F675FF]/20">
              {menuItems.map((item) => (
                <div key={item.id}>
                  {item.subItems ? (
                    <div className="space-y-2">
                      <div className="text-white/50 text-sm font-medium px-2 py-1">
                        {item.label}
                      </div>
                      {item.subItems.map((subItem) => (
                        <a
                          key={subItem.id}
                          href={subItem.link}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`px-4 py-3 text-white/70 hover:text-white rounded-lg transition-colors duration-200 flex items-center space-x-3 ${isActiveLink(subItem.link) ? "bg-[#620268] text-white" : ""
                            }`}
                        >
                          {subItem.icon}
                          <span>{subItem.label}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <a
                      href={item.link}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-3 text-white/70 hover:text-white rounded-lg transition-colors duration-200 ${isActiveLink(item.link) ? "bg-[#620268] text-white font-medium" : ""
                        }`}
                    >
                      {item.label}
                    </a>
                  )}
                </div>
              ))}

              {/* Mobile Connect Wallet */}
              <div className="pt-4 border-t border-[#F675FF]/20">
                <ConnectButton
                  label={
                    <div className="w-full bg-[#1C001E] hover:bg-[#2A002C] text-white px-6 py-3 rounded-lg border border-[#F675FF]/20 transition-all duration-200 text-center">
                      <FaWallet className="size-4 inline mr-2" />
                      <span>Connect Wallet</span>
                    </div>
                  }
                  style={{
                    backgroundColor: 'transparent',
                    color: 'white',
                    padding: 0,
                    margin: 0,
                    height: "auto",
                    borderRadius: '0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0',
                    width: '100%'
                  }}
                  render={() => (
                    <div className="w-full bg-[#1C001E] hover:bg-[#2A002C] text-white px-6 py-3 rounded-lg border border-[#F675FF]/20 transition-all duration-200 text-center">
                      <FaWallet className="size-4 inline mr-2" />
                      <span className="font-medium">{truncateAddress(account.address)}</span>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#300034]/95 backdrop-blur-sm border-t border-[#F675FF]/20 z-40">
        <div className="flex justify-around items-center py-3">
          {menuItems.slice(0, 3).map((item) => (
            <a
              key={item.id}
              href={item.link}
              className={`text-center flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${isActiveLink(item.link)
                ? "text-white bg-[#F675FF]/20"
                : "text-white/60 hover:text-white hover:bg-[#F675FF]/10"
                }`}
            >
              <div className="text-lg">{item.icon}</div>
              <span className="text-xs font-medium">{item.label}</span>
            </a>
          ))}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`text-center flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${mobileMenuOpen
              ? "text-white bg-[#F675FF]/20"
              : "text-white/60 hover:text-white hover:bg-[#F675FF]/10"
              }`}
          >
            <div className="text-lg">{<FaBars size={20} />}</div>
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;