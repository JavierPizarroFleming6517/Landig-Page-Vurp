import { useEffect, useRef, type FormEvent, type RefObject } from "react";
import { useForm } from "@formspree/react";
import { contact } from "../data/content";
import { useWalter } from "./Mascot/useWalter";
import { Walter } from "./Mascot/Walter";

const FORM_ID_PATTERN = /^[a-z0-9]{8}$/i;
const configuredFormId = typeof import.meta.env.VITE_FORMSPREE_FORM_ID === "string"
  ? import.meta.env.VITE_FORMSPREE_FORM_ID.trim()
  : "";
const FORM_ID = FORM_ID_PATTERN.test(configuredFormId) ? configuredFormId : "";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const field = (form: HTMLFormElement, name: string) => {
  const element = form.elements.namedItem(name);
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement ? element : null;
};

/** Validación propia, además de la del navegador: espacios vacíos y un correo con dominio. */
const acceptForm = (form: HTMLFormElement) => {
  for (const name of ["nombre", "email", "mensaje"]) {
    const element = field(form, name);
    if (!element) continue;
    element.setCustomValidity("");
    if (element.value.trim() === "") {
      element.setCustomValidity("Completa este campo.");
      continue;
    }
    if (name === "email" && !EMAIL_PATTERN.test(element.value.trim())) {
      element.setCustomValidity("Ingresa un correo válido.");
    }
  }
  return form.reportValidity();
};

const clearCustomValidity = (event: FormEvent<HTMLFormElement>) => {
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    target.setCustomValidity("");
  }
};

export function Contact() {
  return FORM_ID ? <ContactReady formId={FORM_ID} /> : <ContactUnavailable />;
}

function ContactUnavailable() {
  const walter = useWalter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    console.warn("VITE_FORMSPREE_FORM_ID falta o no es válido. El formulario de contacto no enviará mensajes.");
  }, []);

  return (
    <ContactLayout
      walter={walter}
      formRef={formRef}
      configured={false}
      submitting={false}
      succeeded={false}
      failed={false}
      onSubmit={(event) => event.preventDefault()}
      onWriteAgain={() => {}}
    />
  );
}

function ContactReady({ formId }: { formId: string }) {
  const [state, handleSubmit, reset] = useForm(formId);
  const walter = useWalter();
  const formRef = useRef<HTMLFormElement>(null);
  const sending = useRef(false);
  const celebrated = useRef(false);
  const onSubmitted = walter.onSubmitted;

  useEffect(() => {
    if (!state.succeeded || celebrated.current) return;
    celebrated.current = true;
    formRef.current?.reset();
    onSubmitted();
  }, [state.succeeded, onSubmitted]);

  useEffect(() => {
    if (!state.succeeded) celebrated.current = false;
  }, [state.succeeded]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (sending.current || state.submitting) {
      event.preventDefault();
      return;
    }
    if (!acceptForm(event.currentTarget)) {
      event.preventDefault();
      return;
    }
    sending.current = true;
    void handleSubmit(event).finally(() => {
      sending.current = false;
    });
  };

  return (
    <ContactLayout
      walter={walter}
      formRef={formRef}
      configured
      submitting={state.submitting}
      succeeded={state.succeeded}
      failed={state.errors != null && !state.submitting && !state.succeeded}
      onSubmit={onSubmit}
      onWriteAgain={() => {
        reset();
        formRef.current?.reset();
      }}
    />
  );
}

function ContactLayout({
  walter,
  formRef,
  configured,
  submitting,
  succeeded,
  failed,
  onSubmit,
  onWriteAgain,
}: {
  walter: ReturnType<typeof useWalter>;
  formRef: RefObject<HTMLFormElement | null>;
  configured: boolean;
  submitting: boolean;
  succeeded: boolean;
  failed: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onWriteAgain: () => void;
}) {
  const status = !configured ? "unconfigured" : submitting ? "sending" : succeeded ? "success" : failed ? "error" : "idle";

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
        <div className="contact">
          <form
            className="form"
            id="escribir"
            ref={formRef}
            aria-busy={submitting}
            onSubmit={onSubmit}
            onInput={(event) => {
              clearCustomValidity(event);
              walter.formHandlers.onInput(event);
            }}
            onInvalidCapture={walter.formHandlers.onInvalidCapture}
          >
            <label className="field">
              Nombre
              <input name="nombre" required maxLength={80} autoComplete="name" />
            </label>
            <label className="field">
              Correo
              <input
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                placeholder="tu@empresa.com"
              />
            </label>
            <label className="field field--wide">
              Qué quieres ordenar
              <textarea name="mensaje" required maxLength={4000} />
            </label>
            <input type="hidden" name="_subject" value="Mensaje desde vurp.cl" />
            <div className="form__gotcha" aria-hidden="true">
              <label>
                No completar
                <input name="_gotcha" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <div className="form__end">
              <button
                className="btn btn--solid"
                type={succeeded ? "button" : "submit"}
                disabled={!configured || submitting}
                onClick={succeeded ? onWriteAgain : undefined}
              >
                {submitting ? "Enviando…" : succeeded ? "Escribir otro mensaje" : "Enviar mensaje"}
              </button>
              <p className="form__note" role={status === "error" ? "alert" : "status"}>
                <FormNote status={status} />
              </p>
            </div>
          </form>
          <Walter state={walter.state} />
        </div>
      </div>
    </section>
  );
}

function FormNote({ status }: { status: "unconfigured" | "sending" | "success" | "error" | "idle" }) {
  if (status === "success") {
    return (
      <>
        <strong>¡Mensaje enviado!</strong>
        <span>Recibimos tu mensaje. Nos pondremos en contacto contigo lo antes posible.</span>
      </>
    );
  }
  if (status === "error") {
    return (
      <>
        No pudimos enviar tu mensaje. Inténtalo nuevamente o escríbenos a{" "}
        <a href={`mailto:${contact.email}`}>{contact.email}</a>.
      </>
    );
  }
  if (status === "sending") return <>Enviando tu mensaje…</>;
  if (status === "unconfigured") {
    return import.meta.env.DEV ? (
      <>VITE_FORMSPREE_FORM_ID falta o no es válido. El envío está desactivado en este entorno.</>
    ) : (
      <>
        El envío en línea no está disponible. Escríbenos a <a href={`mailto:${contact.email}`}>{contact.email}</a>.
      </>
    );
  }
  return <>Te respondemos a {contact.email}.</>;
}
