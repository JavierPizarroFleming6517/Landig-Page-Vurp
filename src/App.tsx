import { Cases } from "./components/Cases";
import { Contact } from "./components/Contact";
import { Flow } from "./components/Flow";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Metrics } from "./components/Metrics";
import { Navbar } from "./components/Navbar";
import { Platform } from "./components/Platform";
import { Reasons } from "./components/Reasons";
import { Solutions } from "./components/Solutions";
import { Studio } from "./components/Studio";

export default function App() {
  return (
    <>
      <a className="skip" href="#inicio">
        Saltar al contenido
      </a>
      <Navbar />
      <main>
        <Hero />
        <Flow />
        <Solutions />
        <Metrics />
        <Platform />
        <Reasons />
        <Studio />
        <Cases />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
