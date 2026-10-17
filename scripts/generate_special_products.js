import fs from 'fs';
import { execSync } from 'child_process';

const OUT_DIR = 'public/images/products';

// 1. 8K Rigid UV Photopolymer Resin Bottle
const svgResin8K = `
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#2a303c"/>
      <stop offset="60%" stop-color="#181c24"/>
      <stop offset="100%" stop-color="#0f1218"/>
    </radialGradient>
    <linearGradient id="pedestal" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#222733"/>
      <stop offset="100%" stop-color="#12161f"/>
    </linearGradient>
    <linearGradient id="bottleBody" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1e222b"/>
      <stop offset="25%" stop-color="#3d4454"/>
      <stop offset="50%" stop-color="#272c38"/>
      <stop offset="75%" stop-color="#1a1e27"/>
      <stop offset="100%" stop-color="#0f1218"/>
    </linearGradient>
    <linearGradient id="bottleCap" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#262b35"/>
      <stop offset="30%" stop-color="#555f73"/>
      <stop offset="70%" stop-color="#2a303b"/>
      <stop offset="100%" stop-color="#151821"/>
    </linearGradient>
    <linearGradient id="labelBg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#11151c"/>
      <stop offset="50%" stop-color="#1c222e"/>
      <stop offset="100%" stop-color="#0e1117"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="15"/>
      <feOffset dx="0" dy="18" result="offsetblur"/>
      <feFlood flood-color="#000000" flood-opacity="0.6"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Clean Subdued Studio Background -->
  <rect width="800" height="800" fill="url(#bg)"/>
  
  <!-- Studio Pedestal -->
  <ellipse cx="400" cy="680" rx="260" ry="40" fill="#000000" opacity="0.4" filter="blur(10px)"/>
  <ellipse cx="400" cy="670" rx="240" ry="32" fill="url(#pedestal)"/>
  <ellipse cx="400" cy="668" rx="238" ry="30" fill="#2d3342" stroke="#444d61" stroke-width="1.5"/>

  <!-- Bottle Drop Shadow -->
  <ellipse cx="400" cy="660" rx="140" ry="24" fill="#000000" opacity="0.7" filter="blur(8px)"/>

  <!-- 1000g Aluminum UV Resin Bottle -->
  <g filter="url(#softShadow)">
    <!-- Main Cylinder Body -->
    <rect x="270" y="270" width="260" height="380" rx="24" fill="url(#bottleBody)"/>
    
    <!-- Shoulder Cone -->
    <path d="M 270 290 Q 270 230 350 200 L 450 200 Q 530 230 530 290 Z" fill="url(#bottleBody)"/>

    <!-- Neck -->
    <rect x="350" y="150" width="100" height="55" rx="4" fill="url(#bottleBody)"/>
    <!-- Thread rings -->
    <rect x="345" y="165" width="110" height="6" rx="2" fill="#525d73"/>
    <rect x="345" y="180" width="110" height="6" rx="2" fill="#525d73"/>

    <!-- Cap with ribbed grip -->
    <rect x="335" y="90" width="130" height="75" rx="8" fill="url(#bottleCap)"/>
    <!-- Cap Grips -->
    <line x1="350" y1="95" x2="350" y2="160" stroke="#717d96" stroke-width="2"/>
    <line x1="365" y1="95" x2="365" y2="160" stroke="#717d96" stroke-width="2"/>
    <line x1="380" y1="95" x2="380" y2="160" stroke="#717d96" stroke-width="2"/>
    <line x1="400" y1="95" x2="400" y2="160" stroke="#717d96" stroke-width="2"/>
    <line x1="420" y1="95" x2="420" y2="160" stroke="#717d96" stroke-width="2"/>
    <line x1="435" y1="95" x2="435" y2="160" stroke="#717d96" stroke-width="2"/>
    <line x1="450" y1="95" x2="450" y2="160" stroke="#717d96" stroke-width="2"/>

    <!-- Front Technical Metallic Label -->
    <rect x="290" y="310" width="220" height="290" rx="12" fill="url(#labelBg)" stroke="#384252" stroke-width="1.5"/>
    
    <!-- Brand badge -->
    <rect x="310" y="330" width="70" height="20" rx="4" fill="#3b82f6"/>
    <text x="345" y="344" fill="#ffffff" font-family="Arial, sans-serif" font-weight="900" font-size="11" text-anchor="middle">SHINDOG</text>
    
    <text x="310" y="380" fill="#ffffff" font-family="Arial, sans-serif" font-weight="800" font-size="28" letter-spacing="1">8K RIGID</text>
    <text x="310" y="405" fill="#94a3b8" font-family="Arial, sans-serif" font-weight="700" font-size="13">PRECISION UV RESIN</text>
    
    <!-- Gold 8K Badge -->
    <rect x="310" y="420" width="180" height="2" fill="#eab308"/>
    
    <!-- Spec List -->
    <text x="310" y="450" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="13">▸ 405nm LCD/DLP Compatible</text>
    <text x="310" y="475" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="13">▸ Ultra-Low Shrinkage &lt;0.5%</text>
    <text x="310" y="500" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="13">▸ 85D High Shore Hardness</text>
    <text x="310" y="525" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="13">▸ Space Gray / 高精太空灰</text>

    <!-- Net weight stamp -->
    <rect x="310" y="550" width="90" height="28" rx="6" fill="#1e293b" stroke="#334155"/>
    <text x="355" y="569" fill="#38bdf8" font-family="monospace" font-weight="bold" font-size="14" text-anchor="middle">1000 g</text>
  </g>
</svg>
`;

// 2. Tough ABS-Like Resin Bottle
const svgResinABS = svgResin8K
  .replace('8K RIGID', 'TOUGH ABS-LIKE')
  .replace('PRECISION UV RESIN', 'ENGINEERING UV RESIN')
  .replace('#3b82f6', '#10b981')
  .replace('85D High Shore Hardness', 'High Impact & Flex Resistance')
  .replace('Space Gray / 高精太空灰', 'Industrial Black / 曜石黑');

// 3. Dry S2 Smart Filament Dryer Box
const svgDryer = `
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgD" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#242833"/>
      <stop offset="60%" stop-color="#151820"/>
      <stop offset="100%" stop-color="#0a0c10"/>
    </radialGradient>
    <linearGradient id="dryerBody" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2d3340"/>
      <stop offset="50%" stop-color="#1c2029"/>
      <stop offset="100%" stop-color="#101218"/>
    </linearGradient>
    <linearGradient id="dome" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
      <stop offset="30%" stop-color="#38bdf8" stop-opacity="0.1"/>
      <stop offset="70%" stop-color="#0f172a" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#020617" stop-opacity="0.8"/>
    </linearGradient>
    <radialGradient id="heatingGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f97316" stop-opacity="0.45"/>
      <stop offset="70%" stop-color="#ea580c" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="800" height="800" fill="url(#bgD)"/>
  
  <!-- Desk reflection -->
  <ellipse cx="400" cy="690" rx="300" ry="30" fill="#000000" opacity="0.6" filter="blur(15px)"/>

  <!-- Dryer Base -->
  <rect x="180" y="440" width="440" height="220" rx="36" fill="url(#dryerBody)" stroke="#334155" stroke-width="2"/>
  
  <!-- Transparent Dome Cover -->
  <path d="M 200 440 C 200 180, 600 180, 600 440 Z" fill="url(#dome)" stroke="#475569" stroke-width="2.5"/>
  <ellipse cx="400" cy="440" rx="200" ry="16" fill="#1e293b" opacity="0.8"/>

  <!-- Filament Spool Visible Inside Chamber -->
  <ellipse cx="400" cy="340" rx="130" ry="130" fill="url(#heatingGlow)"/>
  <!-- Spool Flange -->
  <circle cx="400" cy="340" r="110" fill="#111827" stroke="#dc2626" stroke-width="20"/>
  <circle cx="400" cy="340" r="85" fill="#f97316" stroke="#ea580c" stroke-width="12"/>
  <circle cx="400" cy="340" r="45" fill="#0f172a" stroke="#64748b" stroke-width="3"/>

  <!-- Front Touch Display Console -->
  <rect x="290" y="500" width="220" height="110" rx="16" fill="#020617" stroke="#1e293b" stroke-width="2"/>
  
  <!-- Screen Glow & Digits -->
  <rect x="305" y="515" width="190" height="80" rx="10" fill="#090d16" stroke="#0284c7" stroke-width="1"/>
  
  <text x="330" y="555" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="34">55</text>
  <text x="375" y="540" fill="#38bdf8" font-family="Arial, sans-serif" font-size="16">°C</text>
  
  <text x="420" y="555" fill="#22c55e" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="30">18</text>
  <text x="460" y="540" fill="#22c55e" font-family="Arial, sans-serif" font-size="14">%RH</text>

  <text x="400" y="582" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle" letter-spacing="2">SMART DRY S2 CHAMBER</text>
</svg>
`;

// 4. Textured PEI Spring Steel Sheet
const svgPEI = `
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgPEI" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#242730"/>
      <stop offset="60%" stop-color="#141720"/>
      <stop offset="100%" stop-color="#0a0c10"/>
    </radialGradient>
    <linearGradient id="goldPEI" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="35%" stop-color="#d97706"/>
      <stop offset="70%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <filter id="noiseTexture" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.85  0 0 0 0 0.6  0 0 0 0 0.1  0 0 0 0.25 0"/>
      <feComposite in2="SourceGraphic" in="glare" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
    </filter>
  </defs>

  <rect width="800" height="800" fill="url(#bgPEI)"/>
  
  <!-- Desk Shadow -->
  <polygon points="120,620 680,620 640,680 160,680" fill="#000000" opacity="0.6" filter="blur(15px)"/>

  <!-- 3D Perspective PEI Bed Plate -->
  <g transform="translate(400, 420) rotate(-12) scale(0.95)">
    <!-- Plate base plate -->
    <rect x="-240" y="-240" width="480" height="480" rx="14" fill="url(#goldPEI)" stroke="#fbbf24" stroke-width="2"/>
    
    <!-- Alignment Notch Tabs -->
    <polygon points="-80,-240 -60,-260 60,-260 80,-240" fill="#d97706" stroke="#fbbf24" stroke-width="1.5"/>
    <text x="0" y="-245" fill="#ffffff" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">HANDLE TAB</text>

    <!-- Grid lines subtle -->
    <line x1="-200" y1="-200" x2="-200" y2="200" stroke="#fef3c7" stroke-width="0.5" opacity="0.4"/>
    <line x1="-100" y1="-200" x2="-100" y2="200" stroke="#fef3c7" stroke-width="0.5" opacity="0.4"/>
    <line x1="0" y1="-200" x2="0" y2="200" stroke="#fef3c7" stroke-width="0.5" opacity="0.4"/>
    <line x1="100" y1="-200" x2="100" y2="200" stroke="#fef3c7" stroke-width="0.5" opacity="0.4"/>
    <line x1="200" y1="-200" x2="200" y2="200" stroke="#fef3c7" stroke-width="0.5" opacity="0.4"/>

    <!-- Center Laser Etching Logo -->
    <circle cx="0" cy="0" r="70" fill="none" stroke="#fef3c7" stroke-width="2" opacity="0.7"/>
    <text x="0" y="-10" fill="#ffffff" font-family="Arial, sans-serif" font-weight="900" font-size="20" text-anchor="middle" letter-spacing="2">SHINDOG 3D</text>
    <text x="0" y="15" fill="#fef3c7" font-family="Arial, sans-serif" font-weight="bold" font-size="12" text-anchor="middle">TEXTURED PEI SHEET</text>
    <text x="0" y="35" fill="#fef3c7" font-family="'JetBrains Mono', monospace" font-size="11" text-anchor="middle">256 × 256 mm</text>
  </g>
</svg>
`;

fs.writeFileSync(`${OUT_DIR}/resin_8k_grey.svg`, svgResin8K);
fs.writeFileSync(`${OUT_DIR}/resin_abs_tough.svg`, svgResinABS);
fs.writeFileSync(`${OUT_DIR}/dryer_box_s2.svg`, svgDryer);
fs.writeFileSync(`${OUT_DIR}/pei_textured_sheet.svg`, svgPEI);

execSync(`convert ${OUT_DIR}/resin_8k_grey.svg -resize 800x800 -quality 92 ${OUT_DIR}/resin_8k_grey.webp`);
execSync(`convert ${OUT_DIR}/resin_abs_tough.svg -resize 800x800 -quality 92 ${OUT_DIR}/resin_abs_tough.webp`);
execSync(`convert ${OUT_DIR}/dryer_box_s2.svg -resize 800x800 -quality 92 ${OUT_DIR}/dryer_box_s2.webp`);
execSync(`convert ${OUT_DIR}/pei_textured_sheet.svg -resize 800x800 -quality 92 ${OUT_DIR}/pei_textured_sheet.webp`);

console.log('Successfully generated all specialized product images!');
