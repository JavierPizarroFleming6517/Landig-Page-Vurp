import { ChevronDown } from "lucide-react";
import { useState, type FormEvent } from "react";
import { contact, faqs } from "../data/content";

export function Contact() {
  const [open, setOpen] = useState(0);
  const [sent, setSent] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("nombre") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("mensaje") ?? "");
    const body = encodeURIComponent(`Nombre: ${name}\nCorreo: ${email}\n\n${message}`);
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent("Proyecto con Vurp")}&body=${body}`;
    setSent(true);
  };

  return (
    <section className="section" id="contacto">
      <div className="wrap">
        <div className="band" id="aviso">
          <div className="band__panel">
            <div className="band__copy">
              <p className="eyebrow">Conversemos</p>
              <h2 className="section__title">Cuéntanos qué quieres ordenar.</h2>
              <p>La primera conversación sirve para ver el alcance. Sin compromiso y sin presentación inflada.</p>
            </div>
            <a className="btn btn--solid" href="#escribir">
              Escribir a Vurp
            </a>
          </div>
        </div>
        <div className="contact__grid">
          <form className="form" id="escribir" onSubmit={onSubmit}>
            <p className="eyebrow">Contacto</p>
            <h2 className="card-title">Escríbenos.</h2>
            <label className="field">
              Nombre
              <input name="nombre" required autoComplete="name" />
            </label>
            <label className="field">
              Correo
              <input name="email" type="email" required autoComplete="email" placeholder="tu@empresa.com" />
            </label>
            <label className="field">
              Qué quieres ordenar
              <textarea name="mensaje" required />
            </label>
            <button className="btn btn--solid" type="submit">
              Abrir correo
            </button>
            <p className="form__note">
              {sent
                ? "Se abrió tu correo con el mensaje listo para enviar."
                : `El mensaje se arma en tu correo hacia ${contact.email}.`}
            </p>
          </form>
          <div className="faq" id="preguntas">
            <p className="eyebrow">Preguntas frecuentes</p>
            <h2 className="card-title">Lo que suele preguntarse.</h2>
            {faqs.map((item, index) => {
              const expanded = open === index;
              return (
                <div className="faq__item" key={item.q}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpen(expanded ? -1 : index)}
                  >
                    {item.q}
                    <ChevronDown size={18} />
                  </button>
                  {expanded ? <p>{item.a}</p> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
