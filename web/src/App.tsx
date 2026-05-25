import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { useHashScroll } from "@/hooks/useHashScroll";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Borrow from "@/pages/Borrow";
import Repay from "@/pages/Repay";
import History from "@/pages/History";
import Card from "@/pages/Card";
import CardActivate from "@/pages/CardActivate";
import CheckoutDemo from "@/pages/CheckoutDemo";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

export default function App() {
  useHashScroll();

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main
        id="main-content"
        className="main-with-tabbar"
        style={{ flex: 1 }}
      >
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/"               element={<Landing />} />
            <Route path="/dashboard"      element={<Dashboard />} />
            <Route path="/borrow"         element={<Borrow />} />
            <Route path="/repay"          element={<Repay />} />
            <Route path="/history"        element={<History />} />
            <Route path="/card"           element={<Card />} />
            <Route path="/card/activate"  element={<CardActivate />} />
            <Route path="/checkout-demo"  element={<CheckoutDemo />} />
            <Route path="/settings"       element={<Settings />} />
            <Route path="*"              element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}
