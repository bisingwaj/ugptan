#!/usr/bin/env bash
#
# Optimise la vidéo de fond du héros pour un chargement web rapide.
#
#   1. FASTSTART  → déplace l'atome `moov` au début : lecture progressive
#      (le navigateur démarre la vidéo sans avoir tout téléchargé).
#   2. COMPRESSION → 720p, sans piste audio (le fond est muet)
#      → typiquement 5,9 Mo ➜ ~1 Mo.
#
# H.264/MP4 est conservé seul : universel ET, à qualité égale ici, plus léger
# qu'une variante WebM/VP9. (Pour tenter un WebN plus petit : ajouter une passe
# `-c:v libvpx-vp9 -crf 40 -b:v 0 -an` et comparer les tailles avant de l'adopter.)
#
# Prérequis : ffmpeg   (macOS : brew install ffmpeg)
#
# Usage :
#   bash scripts/optimize-hero-video.sh              # ré-encode public/videos/hero-film.mp4
#   bash scripts/optimize-hero-video.sh source.mp4   # depuis une autre source
#
set -euo pipefail

DIR="public/videos"
DEST_MP4="$DIR/hero-film.mp4"
BACKUP="$DIR/hero-film.original.mp4"   # ignoré par git

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "❌ ffmpeg introuvable. Installer : brew install ffmpeg" >&2
  exit 1
fi

# Source = 1er argument, sinon la sauvegarde si elle existe, sinon le fichier courant.
if [ "${1:-}" != "" ]; then
  SRC="$1"
elif [ -f "$BACKUP" ]; then
  SRC="$BACKUP"
else
  SRC="$DEST_MP4"
fi

[ -f "$SRC" ] || { echo "❌ Source introuvable : $SRC" >&2; exit 1; }

# Sauvegarde de l'original (une seule fois) avant d'écraser hero-film.mp4.
if [ "$SRC" = "$DEST_MP4" ] && [ ! -f "$BACKUP" ]; then
  cp "$DEST_MP4" "$BACKUP"
  SRC="$BACKUP"
  echo "• Original sauvegardé → $BACKUP"
fi

echo "• Source : $SRC ($(du -h "$SRC" | cut -f1))"
echo "• Encodage MP4 (720p, faststart, sans audio)…"
#   -crf 27 : compromis qualité/poids (plus haut = plus léger). 24–30 = bonne plage héros.
#   -preset veryslow : meilleure compression (encodage plus lent, sans impact au runtime).
ffmpeg -y -loglevel error -i "$SRC" \
  -vf "scale=-2:720,fps=25" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 27 -preset veryslow \
  -movflags +faststart -an \
  "$DEST_MP4"

echo
echo "✅ Terminé : $(du -h "$DEST_MP4" | cut -f1) → $DEST_MP4"
echo "   (faststart activé, piste audio retirée)"
