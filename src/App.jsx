import { useState } from "react";
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

function App() {
  const isMusicAdmin = window.location.pathname === "/admin/music";
  const isTemplatesAdmin = window.location.pathname === "/admin/templates";
  const isAdminDashboard = window.location.pathname === "/admin/dashboard" || window.location.pathname === "/admin";
  const adminSystemPage = window.location.pathname.split("/")[2];
  const showcasePage = window.location.pathname.split("/")[2];
  const [activeDemoCategory, setActiveDemoCategory] = useState(null);

  if (isMusicAdmin) return <AdminMusic />;
  if (isTemplatesAdmin) return <AdminTemplates />;
  if (showcasePage === "backgrounds") return <AdminShowcase type="background" />;
  if (showcasePage === "slides") return <AdminShowcase type="slide" />;
  if (["settings", "users", "activity"].includes(adminSystemPage)) return <AdminSystem page={adminSystemPage} />;
  if (isAdminDashboard) return <AdminDashboard />;

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
