import { useState, type FormEvent } from "react";
import { contact } from "../data/content";

export function Contact() {
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
    <section className="section" id="contacto" aria-labelledby="contacto-titulo">
      <div className="wrap">
        <div className="intro">
          <p className="eyebrow">Conversemos</p>
          <h2 className="section__title" id="contacto-titulo">
            Cuéntanos qué quieres <em>ordenar.</em>
          </h2>
          <p className="section__lead">
            La primera conversación sirve para ver el alcance. Sin compromiso y sin presentación inflada.
          </p>
        </div>
        <form className="form" id="escribir" onSubmit={onSubmit}>
          <label className="field">
            Nombre
            <input name="nombre" required autoComplete="name" />
          </label>
          <label className="field">
            Correo
            <input name="email" type="email" required autoComplete="email" placeholder="tu@empresa.com" />
          </label>
          <label className="field field--wide">
            Qué quieres ordenar
            <textarea name="mensaje" required />
          </label>
          <div className="form__end">
            <button className="btn btn--solid" type="submit">
              Abrir correo
            </button>
            <p className="form__note">
              {sent
                ? "Se abrió tu correo con el mensaje listo para enviar."
                : `El mensaje se arma en tu correo hacia ${contact.email}.`}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
