#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="public/images/products"
mkdir -p "$OUT_DIR"

echo "Processing base images into tailored 800x800 filament product images..."

# 1. Spool-less refills
convert "$OUT_DIR/refill_yellow.jpg" -gravity center -crop 3000x3000+0+0 -resize 800x800 -quality 92 "$OUT_DIR/refill_yellow.webp"
convert "$OUT_DIR/refill_bambu_step1.jpg" -gravity center -crop 3400x3400+0+0 -resize 800x800 -quality 92 "$OUT_DIR/refill_bambu.webp"
convert "$OUT_DIR/refill_cardboard_1.jpg" -gravity center -crop 2800x2800+0+0 -resize 800x800 -quality 92 "$OUT_DIR/cardboard_spool.webp"

# 2. Hyper PLA & colored spools from red spool
convert "$OUT_DIR/filament_red_spool.jpg" -gravity center -crop 3800x3800+0+0 -resize 800x800 -quality 92 "$OUT_DIR/hyper_pla_red.webp"
# TPU Orange: warm vivid neon hue
convert "$OUT_DIR/filament_red_spool.jpg" -gravity center -crop 3800x3800+0+0 -modulate 105,145,95 -resize 800x800 -quality 92 "$OUT_DIR/tpu_orange.webp"
# Silk dual-color: metallic saturation and shifted hue
convert "$OUT_DIR/filament_red_spool.jpg" -gravity center -crop 3800x3800+0+0 -modulate 110,150,130 -resize 800x800 -quality 92 "$OUT_DIR/pla_silk.webp"
# Wood PLA: warm earthy wood tone
convert "$OUT_DIR/filament_red_spool.jpg" -gravity center -crop 3800x3800+0+0 -sepia-tone 75% -modulate 95,80,95 -resize 800x800 -quality 92 "$OUT_DIR/pla_wood.webp"

# 3. White PLA and derivatives
convert "$OUT_DIR/pla_white_spool.jpg" -gravity center -crop 2500x2500+0+0 -resize 800x800 -quality 92 "$OUT_DIR/pla_white.webp"
# PLA Glow: pale glowing mint green
convert "$OUT_DIR/pla_white_spool.jpg" -gravity center -crop 2500x2500+0+0 -modulate 108,60,140 -colorize 8,24,12 -resize 800x800 -quality 92 "$OUT_DIR/pla_glow.webp"
# LW-PLA: lightweight foaming ivory
convert "$OUT_DIR/pla_white_spool.jpg" -gravity center -crop 2500x2500+0+0 -modulate 98,25,95 -resize 800x800 -quality 92 "$OUT_DIR/lw_pla.webp"
# PLA-CF: Stealth matte black carbon fiber
convert "$OUT_DIR/pla_white_spool.jpg" -gravity center -crop 2500x2500+0+0 -modulate 38,0,100 -level 10%,90% -resize 800x800 -quality 92 "$OUT_DIR/pla_cf_black.webp"
# PA6-CF: High temp matte carbon nylon
convert "$OUT_DIR/pla_white_spool.jpg" -gravity center -crop 2500x2500+0+0 -modulate 34,0,100 -level 12%,88% -resize 800x800 -quality 92 "$OUT_DIR/pa6_cf.webp"
# PA12-CF: Deep stealth PA12-CF
convert "$OUT_DIR/pla_white_spool.jpg" -gravity center -crop 2500x2500+0+0 -modulate 30,0,100 -level 14%,86% -resize 800x800 -quality 92 "$OUT_DIR/pa12_cf.webp"
# PETG-CF: Carbon fiber PETG
convert "$OUT_DIR/pla_white_spool.jpg" -gravity center -crop 2500x2500+0+0 -modulate 42,0,100 -level 8%,92% -resize 800x800 -quality 92 "$OUT_DIR/petg_cf.webp"
# PETG-ESD: Anti-static conductive black
convert "$OUT_DIR/pla_white_spool.jpg" -gravity center -crop 2500x2500+0+0 -modulate 25,0,100 -level 18%,82% -resize 800x800 -quality 92 "$OUT_DIR/petg_esd.webp"
# PLA Matte: Morandi sage / earthy terracotta matte tone
convert "$OUT_DIR/pla_white_spool.jpg" -gravity center -crop 2500x2500+0+0 -modulate 95,55,75 -colorize 15,10,5 -resize 800x800 -quality 92 "$OUT_DIR/pla_matte.webp"
# Pure Nylon Natural: Semi-translucent white
convert "$OUT_DIR/pla_white_spool.jpg" -gravity center -crop 2500x2500+0+0 -modulate 102,15,98 -resize 800x800 -quality 92 "$OUT_DIR/nylon_natural.webp"
# PVA Support: Warm amber-cream soluble support
convert "$OUT_DIR/pla_white_spool.jpg" -gravity center -crop 2500x2500+0+0 -modulate 102,40,88 -colorize 12,8,2 -resize 800x800 -quality 92 "$OUT_DIR/pva_support.webp"
# PEEK / PEI: Translucent golden amber aerospace polymer
convert "$OUT_DIR/pla_white_spool.jpg" -gravity center -crop 2500x2500+0+0 -modulate 105,80,72 -colorize 25,18,0 -resize 800x800 -quality 92 "$OUT_DIR/peek_ultem.webp"

# 4. Blue PETG and derivatives
convert "$OUT_DIR/filament_blue_spool.jpg" -gravity center -crop 2800x2800+0+0 -resize 800x800 -quality 92 "$OUT_DIR/petg_blue.webp"
# TPU 85A: Electric cyan flexible coil
convert "$OUT_DIR/filament_blue_spool.jpg" -gravity center -crop 2800x2800+0+0 -modulate 112,135,115 -resize 800x800 -quality 92 "$OUT_DIR/tpu_cyan.webp"
# ASA: Outdoor weather-resistant slate grey
convert "$OUT_DIR/filament_blue_spool.jpg" -gravity center -crop 2800x2800+0+0 -modulate 85,20,100 -resize 800x800 -quality 92 "$OUT_DIR/asa_grey.webp"
# TPU 64D: High durometer technical slate
convert "$OUT_DIR/filament_blue_spool.jpg" -gravity center -crop 2800x2800+0+0 -modulate 78,15,100 -resize 800x800 -quality 92 "$OUT_DIR/tpu_64d.webp"

# 5. ABS Black and derivatives
convert "$OUT_DIR/abs_black_spool.jpg" -gravity center -crop 1400x1400+0+0 -resize 800x800 -quality 92 "$OUT_DIR/abs_black.webp"
# PC-ABS: Impact alloy dark spool
convert "$OUT_DIR/abs_black_spool.jpg" -gravity center -crop 1400x1400+0+0 -modulate 100,0,100 -level 5%,95% -resize 800x800 -quality 92 "$OUT_DIR/pc_abs.webp"
# PA-GF: Glass fiber reinforced nylon
convert "$OUT_DIR/abs_black_spool.jpg" -gravity center -crop 1400x1400+0+0 -modulate 115,0,100 -level 8%,90% -resize 800x800 -quality 92 "$OUT_DIR/pa_gf.webp"

# 6. PETG Translucent and optical clear plastics
convert "$OUT_DIR/petg_packaged_spool.jpg" -gravity center -crop 3500x3500+0+0 -resize 800x800 -quality 92 "$OUT_DIR/petg_translucent.webp"
# PC Optical Clear
convert "$OUT_DIR/petg_packaged_spool.jpg" -gravity center -crop 3500x3500+0+0 -modulate 102,15,100 -resize 800x800 -quality 92 "$OUT_DIR/pc_clear.webp"
# PP Polypropylene
convert "$OUT_DIR/petg_packaged_spool.jpg" -gravity center -crop 3500x3500+0+0 -modulate 98,25,95 -resize 800x800 -quality 92 "$OUT_DIR/pp_poly.webp"

# 7. Nozzles
convert "$OUT_DIR/jhead_nozzle.jpg" -gravity center -crop 600x600+0+0 -modulate 95,20,100 -level 10%,90% -resize 800x800 -quality 92 "$OUT_DIR/nozzle_hardened_steel.webp"

echo "Image generation complete! Listing generated webp files:"
ls -lh "$OUT_DIR"/*.webp
