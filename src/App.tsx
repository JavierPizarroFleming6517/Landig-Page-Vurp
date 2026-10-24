import { useCallback, useState } from "react";
import { CallToAction } from "./components/CallToAction";
import { DynamicShowcase } from "./components/DynamicShowcase";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Intro } from "./components/Intro";
import { Navbar } from "./components/Navbar";
import { SecurityHighlight } from "./components/SecurityHighlight";
import { Services } from "./components/Services";
import { ValueProposition } from "./components/ValueProposition";
import { Welcome } from "./components/Welcome/Welcome";
import { useTheme } from "./hooks/useTheme";

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashFinish = useCallback(() => setSplashDone(true), []);

  return (
    <>
      <Intro onFinish={handleSplashFinish} />
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Welcome started={splashDone} />
        <Hero />
        <ValueProposition />
        <DynamicShowcase />
        <Services />
        <SecurityHighlight />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
