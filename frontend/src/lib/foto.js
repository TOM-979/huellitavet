export function foto(url, ancho = 800, alto) {
  if (!url) return ''
  const sep = url.includes('?') ? '&' : '?'
  const recorte = url.includes('crop=') ? '' : '&crop=faces,edges'
  return `${url}${sep}auto=format&fit=crop&q=75&w=${ancho}${alto ? `&h=${alto}` : ''}${recorte}`
}

export const srcSet = (url, ancho, alto) =>
  [1, 2].map(m => `${foto(url, ancho * m, alto ? alto * m : undefined)} ${m}x`).join(', ')
