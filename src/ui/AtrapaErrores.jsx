import { Component } from 'react'

// Si algún componente falla, muestra un mensaje claro (sin código técnico)
// y permite copiar los detalles para soporte.
export default class AtrapaErrores extends Component {
  state = { error: null, copiado: false }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    this.detalle = `${error?.stack || error}\n${info.componentStack}`
    console.error('Error en HuellitaVet:', error)
  }

  copiar = async () => {
    try {
      await navigator.clipboard.writeText(this.detalle ?? String(this.state.error))
      this.setState({ copiado: true })
    } catch { /* el portapapeles no está disponible */ }
  }

  reiniciar = () => {
    try { localStorage.removeItem('huellitavet-carrito-v3') } catch { /* sin almacenamiento */ }
    window.location.href = '/'
  }

  render() {
    if (!this.state.error) return this.props.children
    const boton = { minHeight: 48, padding: '0 24px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 16 }
    return (
      <div style={{ maxWidth: 560, margin: '96px auto', padding: 24, fontFamily: 'Inter, sans-serif', color: '#264653' }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.2 }}>No pudimos mostrar esta página</h1>
        <p style={{ marginTop: 8, color: '#5E6F78', lineHeight: 1.5 }}>
          Ocurrió un problema al cargar el contenido. Vuelve al inicio para seguir navegando; si se repite, copia los detalles y compártelos con el equipo.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          <button onClick={this.reiniciar} style={{ ...boton, background: '#F4A261', color: '#264653', border: 0 }}>Volver al inicio</button>
          <button onClick={this.copiar} style={{ ...boton, background: '#fff', color: '#1E786E', border: '2px solid #2A9D8F' }}>
            {this.state.copiado ? 'Detalles copiados' : 'Copiar detalles del error'}
          </button>
        </div>
      </div>
    )
  }
}
