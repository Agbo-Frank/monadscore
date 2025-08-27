import React from "react";
import { logo } from "../Assets";
import { FaDiscord, FaGithub, FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-transparent text-white px-6 py-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
        {/* Column 1: Logo + Description */}
        <div className="space-y-4">
          <img src={logo} alt="Logo" className="w-40" />
          <p className="text-sm">Get on-chain. Stay active. Get recognized.</p>
          <p className="text-xs text-gray-400">
            Powered by Monadscore © {currentYear} All rights reserved
          </p>
        </div>

        {/* Column 2: Social Icons */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Social</h4>
          <div className="flex items-center gap-4">
            <a href="https://discord.com" target="_blank" rel="noreferrer">
              <FaDiscord className="w-6 h-6 hover:text-[#7289DA]" />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer">
              <FaGithub className="w-6 h-6 hover:text-gray-300" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <FaXTwitter className="w-6 h-6 hover:text-blue-400" />
            </a>
          </div>
        </div>

        {/* Column 3: Explore */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/#" className="hover:text-gray-300">Whitepaper</a>
            </li>
            <li>
              <a href="/#" className="hover:text-gray-300">Docs</a>
            </li>
          </ul>
        </div>

        {/* Column 4: Resources */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/#" className="hover:text-gray-300">Run a Node</a>
            </li>
            <li>
              <a href="/#" className="hover:text-gray-300">Join Whitelist</a>
            </li>
            <li>
              <a href="/#" className="hover:text-gray-300">Check Your Score</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;