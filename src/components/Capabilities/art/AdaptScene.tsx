import "./AdaptScene.css";

const rows = [
  { client: "Ferretería Sur", date: "12 nov", status: "Listo", tone: "ok" },
  { client: "Café Andino", date: "14 nov", status: "En curso", tone: "mid" },
  { client: "Taller Ríos", date: "18 nov", status: "Listo", tone: "ok" },
] as const;

/** "Software que calza contigo": la tabla suma una columna, reordena otra y se llena. */
export function AdaptScene() {
  return (
    <div className="scene scene--adapt" aria-hidden="true">
      <div className="adapt__win scene-panel">
        <span className="adapt__side">
          <i className="is-active" />
          <i />
          <i />
        </span>
        <div className="adapt__body">
          <p className="adapt__title">Pedidos</p>
          <div className="adapt__table">
            <span className="adapt__th">Cliente</span>
            <span className="adapt__th adapt__new">Entrega</span>
            <span className="adapt__th adapt__moved">Estado</span>
            {rows.map((row, index) => (
              <div className="adapt__row" key={row.client} style={{ ["--r" as string]: index }}>
                <span className="adapt__td">{row.client}</span>
                <span className="adapt__td adapt__new">{row.date}</span>
                <span className="adapt__td adapt__moved">
                  <em className={`scene-chip scene-chip--${row.tone}`}>{row.status}</em>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
