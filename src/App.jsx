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

function App() {
  const [activeDemoCategory, setActiveDemoCategory] = useState(null);

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
