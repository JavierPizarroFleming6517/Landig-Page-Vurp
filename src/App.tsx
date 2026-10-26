import { Capabilities } from "./components/Capabilities";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero/Hero";
import { Intro } from "./components/Intro";
import { Navbar } from "./components/Navbar";
import { Process } from "./components/Process";
import { Reasons } from "./components/Reasons";
import { Solutions } from "./components/Solutions";
import { ServicePage } from "./components/ServicePage";
import { serviceByPath } from "./data/services";

function finishIntro() {
  /* La landing ya está debajo. El cierre solo suelta el scroll. */
}

export default function App({ path: requestedPath }: { path?: string }) {
  const path = requestedPath ?? (typeof window === "undefined" ? "/" : window.location.pathname);
  const service = serviceByPath(path);
  if (service) return <ServicePage service={service} />;

  return (
    <>
      <Intro onFinish={finishIntro} />
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      <Navbar />
      <main>
        <Hero />
        <Capabilities />
        <Solutions />
        <Process />
        <Reasons />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
