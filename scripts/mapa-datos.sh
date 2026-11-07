#!/bin/sh
# Genera public/mapa/mdp.pmtiles: el extracto de OpenStreetMap de Mar del Plata que dibuja el mapa de la app (lote 3.3).
# Gratis y sin cuentas: recorta la zona de un build diario público de Protomaps (datos de OpenStreetMap, ODbL) pidiendo
# solo los pedazos que necesita. Se corre a mano en una máquina con internet; la app nunca le pide nada a Protomaps.
#
# Requisitos: la herramienta `pmtiles` (https://github.com/protomaps/go-pmtiles/releases, un solo binario).
# Uso:  sh scripts/mapa-datos.sh [AAAAMMDD]     (sin fecha: el build de ayer; los builds se guardan unos días)
# Después: npm run mdp:verificar
set -eu

FECHA="${1:-$(date -u -d yesterday +%Y%m%d 2>/dev/null || date -u -v-1d +%Y%m%d)}"
ORIGEN="https://build.protomaps.com/${FECHA}.pmtiles"
DESTINO="public/mapa/mdp.pmtiles"
# Oeste, sur, este, norte: los mismos límites que LIMITES_MDP en src/geo/mdp.ts.
LIMITES="-57.7,-38.12,-57.48,-37.88"
ZOOM_MAXIMO=15

command -v pmtiles >/dev/null 2>&1 || {
  echo "Falta la herramienta pmtiles: https://github.com/protomaps/go-pmtiles/releases" >&2
  exit 1
}

echo "Recortando Mar del Plata de ${ORIGEN} (zoom 0-${ZOOM_MAXIMO})…"
pmtiles extract "$ORIGEN" "$DESTINO" --bbox="$LIMITES" --maxzoom="$ZOOM_MAXIMO"
ls -lh "$DESTINO"
echo "Listo. Verificá con: npm run mdp:verificar"
