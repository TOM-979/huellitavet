import { Aparecer, Contador, Rastro, TituloAnimado } from './Movimiento.jsx'

export default function CabeceraPagina({ titulo, destacado, descripcion, datos = [], lado, children }) {
  return (
    <header className={`relative pb-4 pt-6 md:pt-12 ${lado ? 'lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-10' : ''}`}>
      <div className="min-w-0">
        {!lado && <Rastro pasos={5} giro={60} separacion={34} tamano={20} retraso={0.6} className="absolute right-6 top-10 hidden text-primario/50 lg:block" />}
        <TituloAnimado texto={titulo} destacado={destacado} className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl" />
        <Aparecer retraso={0.35} distancia={12}>
          <p className="mt-5 max-w-2xl text-lg text-gris md:text-xl">{descripcion}</p>
        </Aparecer>
        {datos.length > 0 && (
          <Aparecer retraso={0.5} distancia={12} as="dl" className="mt-8 flex flex-wrap gap-3">
            {datos.map(([numero, etiqueta]) => (
              <div key={etiqueta} className="foco flex items-baseline gap-2 rounded-2xl bg-superficie/70 px-4 py-3 ring-1 ring-borde backdrop-blur-sm">
                <dt className="order-2 text-sm font-semibold text-gris">{etiqueta}</dt>
                <dd className="order-1 font-display text-2xl font-semibold text-acento">
                  {typeof numero === 'number' ? <Contador valor={numero} /> : numero}
                </dd>
              </div>
            ))}
          </Aparecer>
        )}
        {children}
      </div>
      {lado && <div className="hidden lg:block">{lado}</div>}
    </header>
  )
}
