import { Bell, Menu, Search, ShieldCheck } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { heroErp } from "../../data/content";
import "./Erp.css";

const CHART = { width: 320, height: 120, padX: 12, top: 14, bottom: 104 } as const;

/** Variables CSS en línea (índice de entrada, nivel de stock, período del gráfico). */
const vars = (values: Record<string, string | number>) => values as CSSProperties;

/** Curva suave (Catmull-Rom a Bézier) por los puntos dados. */
function smoothPath(points: ReadonlyArray<readonly [number, number]>) {
  return points.reduce((path, point, index) => {
    if (index === 0) return `M${point[0]} ${point[1]}`;
    const p0 = points[index - 2] ?? points[index - 1] ?? point;
    const p1 = points[index - 1] ?? point;
    const p2 = point;
    const p3 = points[index + 1] ?? point;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    return `${path}C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }, "");
}

function SalesChart() {
  const { amounts, orders, days } = heroErp.sales;
  const step = (CHART.width - 2 * CHART.padX) / (amounts.length - 1);
  const x = (index: number) => CHART.padX + index * step;
  const y = (value: number) => CHART.bottom - (value / Math.max(...amounts)) * (CHART.bottom - CHART.top);
  const maxOrders = Math.max(...orders);
  // Línea periódica para el loop: un punto antes, dos semanas y dos puntos después, así el tramo visible al final
  // del desplazamiento (un período) tiene exactamente la misma forma que al inicio.
  const last = amounts[amounts.length - 1] ?? 0;
  const series = [last, ...amounts, ...amounts, amounts[0] ?? 0, amounts[1] ?? 0];
  const line = smoothPath(series.map((value, index) => [x(index - 1), y(value)] as const));
  const area = `${line}L${x(series.length - 2)} ${CHART.bottom}L${x(-1)} ${CHART.bottom}Z`;
  const viewBox = `0 0 ${CHART.width} ${CHART.height}`;

  return (
    <div className="erp-chart">
      <div className="erp-chart__plot">
        <svg className="erp-chart__bars" viewBox={viewBox} preserveAspectRatio="none">
          {[0.25, 0.5, 0.75].map((share) => (
            <line
              key={share}
              className="erp-chart__grid"
              x1={0}
              x2={CHART.width}
              y1={CHART.top + share * (CHART.bottom - CHART.top)}
              y2={CHART.top + share * (CHART.bottom - CHART.top)}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {orders.map((value, index) => {
            const height = (value / maxOrders) * 46;
            return (
              <rect
                key={index}
                className="erp-chart__bar"
                style={vars({ "--i": index })}
                x={x(index) - 7}
                y={CHART.bottom - height}
                width={14}
                height={height}
                rx={3}
              />
            );
          })}
        </svg>
        {/* La línea se revela de izquierda a derecha con el scroll y, ya viva, avanza en loop. */}
        <div className="erp-chart__reveal">
          <div className="erp-chart__reveal-inner">
            <svg viewBox={viewBox} preserveAspectRatio="none">
              <defs>
                <linearGradient id="erp-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#8b46ab" stopOpacity="0.22" />
                  <stop offset="1" stopColor="#8b46ab" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g className="erp-chart__flow" style={vars({ "--period": `${-amounts.length * step}px` })}>
                <path d={area} fill="url(#erp-area)" />
                <path d={line} className="erp-chart__line" vectorEffect="non-scaling-stroke" />
              </g>
            </svg>
          </div>
        </div>
      </div>
      <div className="erp-chart__days">
        {days.map((day, index) => (
          <span key={index}>{day}</span>
        ))}
      </div>
    </div>
  );
}

/** Tarjeta que entra en el armado (`index` escalona la entrada) y pasa de skeleton a datos. */
function Card({ index, className, skeleton, children }: {
  index: number;
  className: string;
  skeleton: readonly number[];
  children: ReactNode;
}) {
  return (
    <div className={`erp-card erp-in ${className}`} style={vars({ "--i": index })}>
      <span className="erp-skel">
        {skeleton.map((width, line) => (
          <i key={line} style={{ width: `${width * 100}%` }} />
        ))}
      </span>
      <div className="erp-fill">{children}</div>
    </div>
  );
}

function OrderRow({ row, incoming = false }: { row: (typeof heroErp.orders.rows)[number] | typeof heroErp.orders.incoming; incoming?: boolean }) {
  return (
    <div className={`erp-order${incoming ? " erp-order--incoming" : ""}`}>
      <strong>{row.id}</strong>
      <span>{row.detail}</span>
      <em className={`erp-tag erp-tag--${row.tone}`}>{row.status}</em>
    </div>
  );
}

/**
 * Mock decorativo de un ERP de Vurp (aria-hidden en el Hero). El armado lo conducen variables CSS que escribe el
 * timeline; los loops corren en CSS cuando el contenedor tiene `is-live`.
 */
export function Erp() {
  const { modules, kpis, orders, tickets, security, inventory, notification } = heroErp;
  return (
    <div className="erp">
      <div className="erp__window">
        <div className="erp__top">
          <span className="erp__menu">
            <Menu size={16} />
          </span>
          <img className="erp__mark" src="/brand/simbolo.svg" alt="" width={24} height={17} />
          <span className="erp__workspace">
            <strong>{heroErp.workspace}</strong>
            <span>{heroErp.site}</span>
          </span>
          <span className="erp__search">
            <Search size={14} />
            {heroErp.search}
          </span>
          <span className="erp__status">
            <span className="erp__pulse" />
            <span className="erp__status-text">
              {heroErp.status.map((text) => (
                <span key={text}>{text}</span>
              ))}
            </span>
          </span>
          <span className="erp__icon">
            <Bell size={15} />
          </span>
          <span className="erp__avatar">{heroErp.user}</span>
        </div>

        <div className="erp__body">
          <div className="erp__side">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <span key={module.label} className={`erp__nav${"active" in module ? " is-active" : ""}`}>
                  <Icon size={15} />
                  {module.label}
                  {"badge" in module && <em>{module.badge}</em>}
                </span>
              );
            })}
            <div className="erp__access">
              <ShieldCheck size={16} />
              <strong>{heroErp.access.title}</strong>
              <span>{heroErp.access.text}</span>
            </div>
          </div>

          <div className="erp__main">
            <div className="erp__head erp-in" style={vars({ "--i": 0 })}>
              <div>
                <strong>{heroErp.heading.title}</strong>
                <span>{heroErp.heading.meta}</span>
              </div>
              <div className="erp__ranges">
                {heroErp.ranges.map((range, index) => (
                  <span key={range} className={index === 0 ? "is-on" : undefined}>
                    {range}
                  </span>
                ))}
              </div>
            </div>

            <div className="erp__kpis">
              {kpis.map((kpi, index) => (
                <Card key={kpi.label} index={index + 1} className="erp-kpi" skeleton={[0.5, 0.35, 0.6]}>
                  <span>{kpi.label}</span>
                  <strong>
                    {"ticker" in kpi ? (
                      <span className={`erp-ticker erp-ticker--${kpi.ticker.length}`}>
                        <span className="erp-ticker__strip">
                          {kpi.ticker.map((value) => (
                            <span key={value}>{value}</span>
                          ))}
                        </span>
                      </span>
                    ) : (
                      kpi.value
                    )}
                  </strong>
                  <em>{kpi.delta}</em>
                </Card>
              ))}
            </div>

            <div className="erp__grid">
              <Card index={5} className="erp-card--sales" skeleton={[0.4, 1, 1, 1, 0.7]}>
                <div className="erp-card__head">
                  <strong>{heroErp.sales.title}</strong>
                  <span>{heroErp.sales.total}</span>
                </div>
                <SalesChart />
              </Card>

              <Card index={6} className="erp-card--orders" skeleton={[0.4, 0.9, 0.85, 0.9, 0.8]}>
                <div className="erp-card__head">
                  <strong>{orders.title}</strong>
                  <span>Hoy</span>
                </div>
                <div className="erp-orders">
                  <div className="erp-orders__track">
                    <OrderRow row={orders.incoming} incoming />
                    {orders.rows.map((row) => (
                      <OrderRow key={row.id} row={row} />
                    ))}
                  </div>
                </div>
              </Card>

              <Card index={7} className="erp-card--tickets" skeleton={[0.3, 0.9, 0.9, 0.6]}>
                <div className="erp-card__head">
                  <strong>{tickets.title}</strong>
                  <span>Esta semana</span>
                </div>
                <div className="erp-kanban">
                  {tickets.columns.map((column, index) => (
                    <div key={column.label} className="erp-kanban__col">
                      <span>{column.label}</span>
                      {/* En "Resuelto" queda reservado el lugar al que llega la tarjeta que se mueve. */}
                      {index === tickets.columns.length - 1 && <p className="erp-kanban__slot">{tickets.moving}</p>}
                      {column.cards.map((card) => (
                        <p key={card} className={card === tickets.moving ? "erp-kanban__moving" : undefined}>
                          {card}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </Card>

              <Card index={8} className="erp-card--security" skeleton={[0.4, 0.9, 0.9, 0.9, 0.9]}>
                <div className="erp-card__head">
                  <strong>{security.title}</strong>
                  <ShieldCheck size={15} />
                </div>
                {security.items.map((item) => (
                  <div key={item.label} className="erp-check">
                    <span className="erp-check__dot" />
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </Card>

              <Card index={9} className="erp-card--inventory" skeleton={[0.4, 0.8, 0.8, 0.8]}>
                <div className="erp-card__head">
                  <strong>{inventory.title}</strong>
                  <span>Stock</span>
                </div>
                {inventory.items.map((item) => (
                  <div key={item.label} className="erp-stock">
                    <span>{item.label}</span>
                    <span className="erp-stock__bar">
                      <span style={vars({ "--level": item.level })} />
                    </span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </div>

        <div className="erp__toast">
          <span className="erp__pulse" />
          <div>
            <strong>{notification.title}</strong>
            <span>{notification.meta}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
