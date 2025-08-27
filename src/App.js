import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { FloatButton } from "antd";
import { Navbar } from "./Components";
import { Home, NoPage, Pools, Portfolio } from "./Pages";
import { Toaster } from "sonner";


function App() {
  return (
    <div className="App scroll-smooth bg-gradient-to-b from-[#300034] to-black">

      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/*" element={<NoPage />} />
          <Route path="/pools" element={<Pools />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </BrowserRouter>

      <FloatButton.BackTop />
      <Toaster
        richColors
        closeButton
        duration={4000}
      />
    </div>
  );
}

export default App;
