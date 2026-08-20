import { useEffect, useState } from "react";
import FinalCTA from "./components/landing/FinalCTA.jsx";
import FloatingButtons from "./components/landing/FloatingButtons.jsx";
import Header from "./components/landing/Header.jsx";
import Hero from "./components/landing/Hero.jsx";
import Services from "./components/landing/Services.jsx";
import DemoShowcase from "./components/landing/DemoShowcase.jsx";
import Pricing from "./components/landing/Pricing.jsx";
import WhyChoose from "./components/landing/WhyChoose.jsx";
import Process from "./components/landing/Process.jsx";
import Feedback from "./components/landing/Feedback.jsx";
import FAQ from "./components/landing/FAQ.jsx";
import OrderContact from "./components/landing/OrderContact.jsx";
import AdminDashboard from "./components/admin/AdminDashboard.jsx";
import MusicPlanner from "./components/landing/MusicPlanner.jsx";

function App() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [activeDemoCategory, setActiveDemoCategory] = useState(null);
  useEffect(() => {
    const updatePathname = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", updatePathname);
    return () => window.removeEventListener("popstate", updatePathname);
  }, []);
  const navigateAdmin = (path) => {
    window.history.pushState({}, "", path);
    setPathname(path);
  };
  const adminRoutes = {
    "/admin": "dashboard",
    "/admin/dashboard": "dashboard",
    "/admin/templates": "templates",
    "/admin/orders": "orders",
    "/admin/music": "music",
    "/admin/backgrounds": "backgrounds",
    "/admin/slides": "slides",
    "/admin/settings": "settings",
    "/admin/users": "users",
  };
  const adminView = adminRoutes[pathname];

  if (adminView) return <AdminDashboard activeView={adminView} onNavigate={navigateAdmin} />;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#fafafa_46%,#ffffff_100%)] text-slate-950">
      <FloatingButtons />
      <Header />
      <main id="top">
        <Hero />
        <Services
          activeDemoCategory={activeDemoCategory}
          onSelectDemoCategory={setActiveDemoCategory}
        />
        <DemoShowcase activeCategory={activeDemoCategory} />
        <MusicPlanner />
        <Pricing />
        <WhyChoose />
        <Process />
        <Feedback />
        <FAQ />
        <OrderContact />
        <FinalCTA />
      </main>
    </div>
  );
}

export default App;
