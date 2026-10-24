// Genera el comprobante de pago en PDF (nota de venta, no válida como comprobante electrónico SUNAT)
import PDFDocument from 'pdfkit'

const VERDE = '#1E786E'
const OSCURO = '#264653'
const GRIS = '#5E6F78'
const soles = (n) => `S/ ${Number(n).toFixed(2)}`

export function generarComprobante(pedido, salida) {
  const doc = new PDFDocument({ size: 'A4', margin: 48, info: { Title: `Comprobante ${pedido.codigo}`, Author: 'HuellitaVet' } })
  doc.pipe(salida)

  doc.rect(0, 0, doc.page.width, 110).fill(OSCURO)
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(24).text('HuellitaVet', 48, 36)
  doc.font('Helvetica').fontSize(10).fillColor('#D5E4E7')
    .text('Clínica veterinaria · Av. Alfredo Mendiola 3520, Independencia, Lima', 48, 68)
    .text('RUC 20601234567 · (01) 555-1234 · hola@huellitavet.pe', 48, 82)
  doc.roundedRect(doc.page.width - 230, 30, 182, 56, 8).fill('#FFFFFF')
  doc.fillColor(OSCURO).font('Helvetica-Bold').fontSize(10).text('NOTA DE VENTA', doc.page.width - 220, 40, { width: 162, align: 'center' })
  doc.fillColor(VERDE).fontSize(13).text(pedido.codigo, doc.page.width - 220, 58, { width: 162, align: 'center' })

  const fecha = new Date(`${pedido.creado_en.replace(' ', 'T')}Z`).toLocaleString('es-PE', { timeZone: 'America/Lima', dateStyle: 'long', timeStyle: 'short' })
  doc.fillColor(OSCURO).font('Helvetica-Bold').fontSize(11).text('Cliente', 48, 140)
  doc.font('Helvetica').fillColor(GRIS).text(pedido.cliente ?? 'Cliente en tienda', 48, 156).text(pedido.telefono ? `Cel. ${pedido.telefono}` : '', 48, 171)
  doc.fillColor(OSCURO).font('Helvetica-Bold').text('Fecha de emisión', 330, 140)
  doc.font('Helvetica').fillColor(GRIS).text(fecha, 330, 156).text(`Estado: ${pedido.estado}`, 330, 171)

  let y = 215
  const col = { cant: 48, desc: 98, pu: 360, imp: 450 }
  doc.rect(48, y, doc.page.width - 96, 26).fill('#E6F4F2')
  doc.fillColor(OSCURO).font('Helvetica-Bold').fontSize(10)
  doc.text('Cant.', col.cant + 8, y + 8).text('Descripción', col.desc, y + 8).text('P. unit.', col.pu, y + 8, { width: 80, align: 'right' }).text('Importe', col.imp, y + 8, { width: 90, align: 'right' })
  y += 34
  doc.font('Helvetica').fontSize(10)
  for (const d of pedido.detalle) {
    doc.fillColor(OSCURO).text(String(d.cantidad), col.cant + 8, y)
      .text(d.nombre, col.desc, y, { width: 250 })
      .text(soles(d.precio_unitario), col.pu, y, { width: 80, align: 'right' })
      .text(soles(d.importe), col.imp, y, { width: 90, align: 'right' })
    doc.fillColor(GRIS).fontSize(8).text(d.sku, col.desc, y + 13).fontSize(10)
    y += 32
    doc.moveTo(48, y - 6).lineTo(doc.page.width - 48, y - 6).strokeColor('#E3E8EB').lineWidth(1).stroke()
  }

  y += 8
  const fila = (etiqueta, valor, negrita = false) => {
    doc.font(negrita ? 'Helvetica-Bold' : 'Helvetica').fontSize(negrita ? 13 : 10).fillColor(negrita ? VERDE : OSCURO)
      .text(etiqueta, 330, y, { width: 110 }).text(valor, col.imp, y, { width: 90, align: 'right' })
    y += negrita ? 24 : 18
  }
  fila('Op. gravada', soles(pedido.subtotal))
  fila('IGV (18 %)', soles(pedido.igv))
  fila('Total', soles(pedido.total), true)

  doc.font('Helvetica').fontSize(9).fillColor(GRIS)
    .text('Recoge tu pedido en la clínica presentando este código. Horario: lunes a sábado de 9:00 a 19:00.', 48, y + 30, { width: doc.page.width - 96 })
    .text('Documento de uso académico: no válido como comprobante electrónico SUNAT.', 48, y + 46, { width: doc.page.width - 96 })
  doc.end()
}
