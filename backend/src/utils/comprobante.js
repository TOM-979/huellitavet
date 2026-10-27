// Evita que un nombre como "<script>" se ejecute en el comprobante
const texto = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export function generarComprobante(pedido, salida) {
  const soles = (n) => `S/ ${Number(n).toFixed(2)}`
  const fecha = new Date(pedido.creado_en ?? Date.now()).toLocaleString('es-PE', {
    timeZone: 'America/Lima', dateStyle: 'long', timeStyle: 'short'
  })

  const filas = (pedido.detalle || []).map(d => `
    <tr>
      <td>${d.cantidad}</td>
      <td>${texto(d.nombre)}<br><small style="color:#888">${texto(d.sku)}</small></td>
      <td style="text-align:right">${soles(d.precio_unitario ?? 0)}</td>
      <td style="text-align:right">${soles(d.importe)}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Comprobante ${pedido.codigo}</title>
<style>
  body{font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:24px;color:#1a1a1a}
  .header{background:#264653;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0}
  .header h1{margin:0;font-size:22px}
  .header p{margin:4px 0 0;font-size:11px;opacity:.8}
  .badge{background:#1E786E;display:inline-block;padding:4px 12px;border-radius:4px;font-size:13px;font-weight:bold;margin-top:8px}
  .info{display:flex;gap:24px;padding:16px 24px;background:#f5f5f5;border:1px solid #ddd}
  .info div{flex:1}
  .info label{font-size:11px;color:#888;display:block}
  .info span{font-size:13px;font-weight:600}
  table{width:100%;border-collapse:collapse;margin-top:16px}
  th{background:#264653;color:#fff;padding:8px 10px;text-align:left;font-size:12px}
  th:last-child,th:nth-child(3){text-align:right}
  td{padding:8px 10px;border-bottom:1px solid #eee;font-size:13px;vertical-align:top}
  td:last-child,td:nth-child(3){text-align:right}
  .totales{margin-top:8px;text-align:right;font-size:13px}
  .totales .total{font-size:16px;font-weight:bold;color:#264653}
  .footer{margin-top:24px;text-align:center;font-size:11px;color:#aaa}
  @media print{body{padding:0}.no-print{display:none}}
</style>
</head>
<body>
<div class="header">
  <h1>HuellitaVet</h1>
  <p>Clínica Veterinaria · Av. Alfredo Mendiola 3520, Independencia, Lima</p>
  <p>RUC 20601234567 · (01) 555-1234 · hola@huellitavet.pe</p>
  <div class="badge">NOTA DE VENTA &nbsp;${pedido.codigo}</div>
</div>
<div class="info">
  <div>
    <label>Cliente</label>
    <span>${texto(pedido.cliente ?? 'Cliente en tienda')}</span><br>
    ${pedido.telefono ? `<label>Teléfono</label><span>${texto(pedido.telefono)}</span>` : ''}
  </div>
  <div style="text-align:right">
    <label>Fecha de emisión</label>
    <span>${fecha}</span><br>
    <label>Estado</label>
    <span>${pedido.estado}</span>
  </div>
</div>
<table>
  <thead><tr><th>Cant.</th><th>Descripción</th><th>P. unit.</th><th>Importe</th></tr></thead>
  <tbody>${filas}</tbody>
</table>
<div class="totales">
  <p>Subtotal: ${soles(pedido.subtotal)}</p>
  <p>IGV (18%): ${soles(pedido.igv)}</p>
  <p class="total">TOTAL: ${soles(pedido.total)}</p>
</div>
<div class="footer">
  <p>Documento no válido como comprobante electrónico SUNAT</p>
  <button class="no-print" onclick="window.print()" style="margin-top:12px;padding:8px 20px;background:#264653;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px">Imprimir / Guardar PDF</button>
</div>
</body>
</html>`

  salida.setHeader('Content-Type', 'text/html; charset=utf-8')
  salida.send(html)
}