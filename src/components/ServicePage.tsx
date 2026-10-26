import { ArrowRight, Check, ChevronRight, Mail } from "lucide-react";
import type { ServiceContent } from "../data/services";
import { ThemeToggle } from "./ThemeToggle";
import "./ServicePage.css";

export function ServicePage({ service }: { service: ServiceContent }) {
  return (
    <div className="service-page">
      <a className="skip" href="#contenido-servicio">Saltar al contenido</a>
      <header className="service-nav">
        <div className="wrap service-nav__inner">
          <a className="service-nav__logo" href="/" aria-label="Vurp, inicio">
            <img src="/brand/logo-horizontal-blanco.svg" alt="Vurp" data-theme-only="dark" width="138" height="40" />
            <img src="/brand/logo-horizontal.svg" alt="" data-theme-only="light" width="138" height="40" />
          </a>
          <nav aria-label="Navegación principal">
            <a href="/#soluciones">Servicios</a>
            <a href="/#proceso">Proceso</a>
            <a href="/#contacto">Contacto</a>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main id="contenido-servicio">
        <section className="service-hero">
          <div className="wrap service-hero__grid">
            <div>
              <nav className="breadcrumbs" aria-label="Migas de pan">
                <ol>
                  <li><a href="/">Inicio</a></li>
                  <li><ChevronRight size={14} aria-hidden="true" /><span>Servicios</span></li>
                  <li aria-current="page"><ChevronRight size={14} aria-hidden="true" /><span>{service.eyebrow}</span></li>
                </ol>
              </nav>
              <p className="eyebrow">{service.eyebrow}</p>
              <h1>{service.title}</h1>
              <p className="service-hero__lead">{service.lead}</p>
              <div className="service-hero__actions">
                <a className="btn btn--solid" href="/#contacto">Cotizar proyecto</a>
                <a className="service-text-link" href="#que-incluye">Ver qué incluye <ArrowRight size={17} /></a>
              </div>
            </div>
            <aside className="service-hero__card" aria-label="Cobertura del servicio">
              <img src="/brand/simbolo-blanco.svg" alt="" data-theme-only="dark" width="70" height="51" />
              <img src="/brand/simbolo.svg" alt="" data-theme-only="light" width="70" height="51" />
              <p className="eyebrow">Desde Coquimbo para Chile</p>
              <p>Trabajamos con emprendedores, pymes y organizaciones que necesitan una solución adaptada a su proyecto.</p>
              <a href="mailto:contacto@vurp.cl"><Mail size={17} /> contacto@vurp.cl</a>
            </aside>
          </div>
        </section>

        <section className="service-section service-problem" aria-labelledby="problema-titulo">
          <div className="wrap service-narrow">
            <p className="eyebrow">El desafío</p>
            <h2 id="problema-titulo">{service.problemTitle}</h2>
            <p>{service.problemText}</p>
          </div>
        </section>

        <section className="service-section" id="que-incluye" aria-labelledby="incluye-titulo">
          <div className="wrap">
            <div className="service-heading">
              <p className="eyebrow">Qué incluye</p>
              <h2 id="incluye-titulo">Un alcance definido para cada proyecto</h2>
              <p>La combinación final depende de los objetivos, sistemas existentes y riesgos del proyecto.</p>
            </div>
            <div className="service-cards">
              {service.includes.map((item) => {
                const Icon = item.icon;
                return <article key={item.title}><span className="service-card__icon"><Icon size={24} /></span><h3>{item.title}</h3><p>{item.text}</p></article>;
              })}
            </div>
          </div>
        </section>

        <section className="service-section service-process" aria-labelledby="metodo-titulo">
          <div className="wrap">
            <div className="service-heading">
              <p className="eyebrow">Cómo trabajamos</p>
              <h2 id="metodo-titulo">Claridad antes de construir o evaluar</h2>
            </div>
            <ol className="service-steps">
              {service.process.map((step, index) => <li key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}
            </ol>
          </div>
        </section>

        <section className="service-section" aria-labelledby="dirigido-titulo">
          <div className="wrap service-split">
            <div className="service-heading">
              <p className="eyebrow">A quién está dirigido</p>
              <h2 id="dirigido-titulo">Proyectos que necesitan una respuesta concreta</h2>
            </div>
            <ul className="service-audience">
              {service.audience.map((item) => <li key={item}><Check size={20} aria-hidden="true" /><span>{item}</span></li>)}
            </ul>
          </div>
        </section>

        <section className="service-section service-faq" aria-labelledby="faq-titulo">
          <div className="wrap service-narrow">
            <p className="eyebrow">Preguntas frecuentes</p>
            <h2 id="faq-titulo">Antes de conversar</h2>
            <div className="service-faq__list">
              {service.faqs.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
            </div>
          </div>
        </section>

        <section className="service-section service-related" aria-labelledby="relacionados-titulo">
          <div className="wrap">
            <p className="eyebrow">Servicios relacionados</p>
            <h2 id="relacionados-titulo">Una solución puede combinar capacidades</h2>
            <div className="service-related__links">
              {service.related.map((item) => <a key={item.href} href={item.href}>{item.label}<ArrowRight size={18} /></a>)}
            </div>
          </div>
        </section>

        <section className="service-cta" aria-labelledby="cta-titulo">
          <div className="wrap service-cta__inner">
            <div><p className="eyebrow">Conversemos</p><h2 id="cta-titulo">Cuéntanos qué necesitas resolver</h2><p>La primera conversación sirve para revisar el contexto y definir si podemos ayudarte.</p></div>
            <a className="btn btn--solid" href="/#contacto">Contactar a Vurp</a>
          </div>
        </section>
      </main>

      <footer className="service-footer">
        <div className="wrap service-footer__inner">
          <a href="/" aria-label="Vurp, inicio"><img src="/brand/logo-horizontal-blanco.svg" alt="Vurp" data-theme-only="dark" width="125" height="36" /><img src="/brand/logo-horizontal.svg" alt="" data-theme-only="light" width="125" height="36" /></a>
          <p>Vurp · Software a medida, automatización y ciberseguridad.</p>
          <p>Coquimbo, Chile · <a href="mailto:contacto@vurp.cl">contacto@vurp.cl</a></p>
        </div>
      </footer>
    </div>
  );
}
