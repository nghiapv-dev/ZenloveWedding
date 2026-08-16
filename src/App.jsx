import { useEffect, useState } from "react";
import FinalCTA from "./components/FinalCTA.jsx";
import FloatingButtons from "./components/FloatingButtons.jsx";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Services from "./components/Services.jsx";
import DemoShowcase from "./components/DemoShowcase.jsx";
import Pricing from "./components/Pricing.jsx";
import WhyChoose from "./components/WhyChoose.jsx";
import Process from "./components/Process.jsx";
import Feedback from "./components/Feedback.jsx";
import FAQ from "./components/FAQ.jsx";
import OrderContact from "./components/OrderContact.jsx";
import AdminMusic from "./components/AdminMusic.jsx";
import AdminTemplates from "./components/AdminTemplates.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import AdminSystem from "./components/AdminSystem.jsx";
import AdminShowcase from "./components/AdminShowcase.jsx";
import MusicPlanner from "./components/MusicPlanner.jsx";

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
