import {
  FaExchangeAlt,
  FaSeedling,
  FaBriefcase,
  FaBook,
  FaDiscord,
  FaTwitter,
} from "react-icons/fa";

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

export default menuItems