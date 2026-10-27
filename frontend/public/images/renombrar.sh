#!/bin/bash
# Ejecutar DENTRO de frontend/public/images:  bash renombrar-servicios.sh
# Agrega el prefijo srv- a las 16 imágenes de servicios.
for n in consulta vacunacion desparasitacion grooming unas-pico dental laboratorio ecografia rayos-x cirugia aves exoticos microchip nutricion hospitalizacion teleconsulta; do
  if [ -f "$n.jpg" ]; then mv -n "$n.jpg" "srv-$n.jpg"; else echo "FALTA $n.jpg"; fi
done
ls srv-*.jpg | wc -l
ls srv-*.jpg
