import { marquee } from "../data/content";

const loop = [...marquee, ...marquee];

export function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="wrap">
        <div className="hero__panel">
          <div className="hero__layout">
          <div className="hero__copy">
            <p className="hero__badge">Software a medida y ciberseguridad</p>
            <h1 className="hero__title">
              Ordenamos tu operación
              <br />
              <em>en un sistema a medida.</em>
            </h1>
            <p className="hero__lead">
              Diseñamos software, automatizaciones y seguridad para la forma en que realmente trabajas. Sin
              plantillas genéricas y sin dejar la protección para el final.
            </p>
            <div className="hero__actions">
              <a className="btn btn--ghost" href="#soluciones">
                Ver soluciones
              </a>
              <a className="btn btn--solid" href="#contacto">
                Cotizar proyecto
              </a>
            </div>
          </div>
          <div className="stage" aria-hidden="true">
            <div className="stage__bar">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span>Operación · Vurp</span>
            </div>
            <div className="stage__grid">
              <article className="stage__card">
                <strong>Pedidos de hoy</strong>
                <div className="row">
                  <span>Revisión comercial</span>
                  <span className="pill-ok">En curso</span>
                </div>
                <div className="row">
                  <span>Datos del cliente</span>
                  <span>Listos</span>
                </div>
                <div className="row">
                  <span>Entrega</span>
                  <span className="pill-ok">Programada</span>
                </div>
              </article>
              <article className="stage__card">
                <strong>Equipo</strong>
                <div className="row">
                  <span>Operaciones</span>
                  <span>4</span>
                </div>
                <div className="row">
                  <span>Administración</span>
                  <span>2</span>
                </div>
              </article>
              <article className="stage__card">
                <strong>Accesos</strong>
                <div className="row">
                  <span>Roles activos</span>
                  <span className="pill-ok">3</span>
                </div>
                <div className="row">
                  <span>Respaldo</span>
                  <span>Hoy</span>
                </div>
              </article>
            </div>
          </div>
          </div>
        </div>
        <div className="marquee" aria-label="Qué construye Vurp">
          <div className="marquee__track">
            {loop.map((item, index) => (
              <span className="chip" key={`${item}-${index}`}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
