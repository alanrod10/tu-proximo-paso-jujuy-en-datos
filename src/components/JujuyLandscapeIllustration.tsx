import React from 'react';

/**
 * Componente Visual Protagonista — Jujuy en Datos (G9.1)
 * Gran composición gráfica vectorial inmersiva para el stand interactivo:
 * - Serranías del Hornocal (14 colores) y Quebrada de Humahuaca con estratos policromáticos.
 * - Sol Andino (Inti) radiante en tonalidades doradas y cálidas.
 * - Salinas y litio con reflejos cristalinos andinos.
 * - Parque Solar Cauchari (energía renovable fotovoltaica).
 * - Tren Solar de la Quebrada sobre vía andina.
 * - Valles y Yungas fértiles con cultivos y vegetación.
 * - Siluetas de jóvenes exploradores descubriendo el horizonte provincial.
 * - 100% SVG vectorial puro, responsivo, nítido en pantallas 4K y liviano (<10 KB).
 */
export const JujuyLandscapeIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-full overflow-hidden select-none ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1000 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-2xl"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Cielo al amanecer andino: gradiente profundo a celeste diáfano */}
          <linearGradient id="g9Sky" x1="500" y1="0" x2="500" y2="440" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="25%" stopColor="#1C2541" />
            <stop offset="55%" stopColor="#2A3D66" />
            <stop offset="85%" stopColor="#4A6984" />
            <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.3" />
          </linearGradient>

          {/* Gran Sol Andino (Inti) */}
          <radialGradient id="g9Sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="80%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
          </radialGradient>

          {/* Cordillera Andina de Fondo (Tonos Violeta y Añil) */}
          <linearGradient id="g9MountainBack" x1="0" y1="140" x2="1000" y2="360" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#312E81" />
            <stop offset="40%" stopColor="#4C1D95" />
            <stop offset="80%" stopColor="#581C87" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>

          {/* Hornocal - Capa Media 1 (Terracotas, Rojos y Ocres Quebradeños) */}
          <linearGradient id="g9MountainHornocal1" x1="0" y1="180" x2="1000" y2="400" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7F1D1D" />
            <stop offset="25%" stopColor="#9A3412" />
            <stop offset="50%" stopColor="#C2410C" />
            <stop offset="75%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#831843" />
          </linearGradient>

          {/* Hornocal - Capa Media 2 (Siena, Dorado y Arcilla) */}
          <linearGradient id="g9MountainHornocal2" x1="0" y1="210" x2="1000" y2="420" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="30%" stopColor="#EA580C" />
            <stop offset="65%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#9A3412" />
          </linearGradient>

          {/* Salinas Grandes y Meseta (Reflejos Blancos y Litio) */}
          <linearGradient id="g9Salinas" x1="0" y1="280" x2="600" y2="380" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="45%" stopColor="#BAE6FD" />
            <stop offset="85%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          {/* Valles y Yungas (Verdes intensos y fértiles) */}
          <linearGradient id="g9Yungas" x1="0" y1="320" x2="1000" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="35%" stopColor="#065F46" />
            <stop offset="70%" stopColor="#064E3B" />
            <stop offset="100%" stopColor="#022C22" />
          </linearGradient>

          {/* Paneles Solares Cauchari */}
          <linearGradient id="g9Solar" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          {/* Resplandor del sol */}
          <filter id="g9Glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Fondo del Cielo */}
        <rect width="1000" height="480" rx="28" fill="url(#g9Sky)" />

        {/* Sol Andino Radiante (Inti) */}
        <circle cx="720" cy="140" r="130" fill="url(#g9Sun)" opacity="0.85" filter="url(#g9Glow)" />
        <circle cx="720" cy="140" r="54" fill="#FEF08A" opacity="0.95" />

        {/* Rayos geométricos de sol andino */}
        <g stroke="#FEF08A" strokeWidth="2" strokeDasharray="8 10" opacity="0.45">
          <line x1="720" y1="60" x2="720" y2="20" />
          <line x1="780" y1="80" x2="815" y2="50" />
          <line x1="800" y1="140" x2="845" y2="140" />
          <line x1="780" y1="200" x2="815" y2="230" />
          <line x1="660" y1="80" x2="625" y2="50" />
          <line x1="640" y1="140" x2="595" y2="140" />
        </g>

        {/* Capa 1: Cordillera profunda (violetas y azules andinos) */}
        <path
          d="M0 320L100 260L200 305L310 225L420 280L530 205L640 270L750 190L860 255L1000 185V480H0Z"
          fill="url(#g9MountainBack)"
          opacity="0.9"
        />

        {/* Capa 2: Serranías del Hornocal (zigzag policromático de 14 colores) */}
        <path
          d="M0 355L80 295L170 335L260 260L350 325L440 245L535 315L630 230L730 300L830 220L920 280L1000 235V480H0Z"
          fill="url(#g9MountainHornocal1)"
        />

        {/* Capa 3: Cerros quebradeños rojizos y ocres */}
        <path
          d="M0 390L90 335L190 375L290 305L390 360L490 285L590 350L690 275L790 335L890 270L1000 325V480H0Z"
          fill="url(#g9MountainHornocal2)"
        />

        {/* Capa 4: Altiplano, salares y meseta (litio y recursos) */}
        <path
          d="M0 425C150 395 280 410 420 385C560 360 700 380 840 365C900 360 950 362 1000 368V480H0Z"
          fill="url(#g9Salinas)"
          opacity="0.75"
        />

        {/* Capa 5: Valles fértiles y Yungas en primer plano */}
        <path
          d="M0 445C160 415 320 435 500 410C680 385 840 405 1000 395V480H0Z"
          fill="url(#g9Yungas)"
        />

        {/* ============================================================== */}
        {/* HITOS DE LA MATRIZ PRODUCTIVA Y LABORAL DE JUJUY               */}
        {/* ============================================================== */}

        {/* Parque Solar Cauchari (energía renovable del altiplano) */}
        <g transform="translate(130, 325) scale(1)">
          {/* Panel 1 */}
          <polygon points="0,22 45,5 72,24 28,42" fill="url(#g9Solar)" stroke="#BAE6FD" strokeWidth="1.2" />
          <line x1="22" y1="13" x2="50" y2="33" stroke="#E0F2FE" strokeWidth="0.9" />
          <line x1="14" y1="31" x2="58" y2="15" stroke="#E0F2FE" strokeWidth="0.9" />

          {/* Panel 2 */}
          <polygon points="56,25 102,8 130,27 84,45" fill="url(#g9Solar)" stroke="#BAE6FD" strokeWidth="1.2" />
          <line x1="78" y1="16" x2="108" y2="36" stroke="#E0F2FE" strokeWidth="0.9" />
          <line x1="70" y1="35" x2="116" y2="18" stroke="#E0F2FE" strokeWidth="0.9" />

          {/* Poste de distribución eléctrica limpia */}
          <line x1="150" y1="8" x2="150" y2="46" stroke="#FEF08A" strokeWidth="1.8" />
          <line x1="142" y1="16" x2="158" y2="16" stroke="#FEF08A" strokeWidth="1.2" />
          <line x1="140" y1="26" x2="160" y2="26" stroke="#FEF08A" strokeWidth="1.2" />
          <circle cx="150" cy="8" r="3" fill="#FEF08A" />
        </g>

        {/* Minería y Litio (Vagoneta minera estilizada en la ladera) */}
        <g transform="translate(330, 365) scale(0.9)">
          <path d="M0 16 L60 16" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 3" />
          <polygon points="12,14 48,14 44,4 16,4" fill="#64748B" stroke="#CBD5E1" strokeWidth="1" />
          <circle cx="20" cy="16" r="3.5" fill="#334155" />
          <circle cx="40" cy="16" r="3.5" fill="#334155" />
          {/* Brillo de mineral / litio */}
          <polygon points="26,2 32,8 38,2 32,-4" fill="#38BDF8" opacity="0.9" />
        </g>

        {/* Tren Solar de la Quebrada (transporte y turismo sostenible) */}
        <g transform="translate(520, 355) scale(0.95)">
          {/* Vías férreas estilizadas */}
          <path d="M0 14 L180 5" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" opacity="0.75" />
          {/* Vagón 1 */}
          <rect x="40" y="5" width="34" height="11" rx="2.5" fill="#0284C7" stroke="#38BDF8" strokeWidth="1" />
          <rect x="44" y="7" width="7" height="5" rx="1" fill="#0F172A" />
          <rect x="54" y="7" width="7" height="5" rx="1" fill="#0F172A" />
          <rect x="64" y="7" width="7" height="5" rx="1" fill="#0F172A" />
          {/* Vagón 2 */}
          <rect x="78" y="3" width="34" height="11" rx="2.5" fill="#0369A1" stroke="#38BDF8" strokeWidth="1" />
          <rect x="82" y="5" width="7" height="5" rx="1" fill="#0F172A" />
          <rect x="92" y="5" width="7" height="5" rx="1" fill="#0F172A" />
          <rect x="102" y="5" width="7" height="5" rx="1" fill="#0F172A" />
        </g>

        {/* Brotes agrícolas y viñedos de valles jujeños */}
        <g transform="translate(290, 420)" stroke="#34D399" strokeWidth="2" strokeLinecap="round">
          <path d="M0 14 C-5 6 -10 5 -14 7 C-12 13 -5 13 0 14 C5 13 12 13 14 7 C10 5 5 6 0 14 Z" fill="#10B981" />
          <line x1="0" y1="14" x2="0" y2="24" />
        </g>
        <g transform="translate(330, 428)" stroke="#34D399" strokeWidth="1.6" strokeLinecap="round">
          <path d="M0 11 C-4 5 -8 4 -11 5 C-9 10 -4 10 0 11 C4 10 9 10 11 5 C8 4 4 5 0 11 Z" fill="#10B981" />
          <line x1="0" y1="11" x2="0" y2="19" />
        </g>

        {/* Siluetas de Jóvenes Explorando en la Loma Andina */}
        <g transform="translate(840, 335)" fill="#F8FAFC">
          {/* Joven 1 con prismáticos explorando el paisaje */}
          <circle cx="12" cy="12" r="5" />
          <path d="M7 19 C7 19 12 18 17 19 L19 35 L14 35 L13 49 L10 49 L10 35 L7 35 Z" />
          <rect x="15" y="10" width="8" height="4" rx="1.2" transform="rotate(-15 15 10)" fill="#FCD34D" />

          {/* Joven 2 señalando con entusiasmo el horizonte productivo */}
          <circle cx="42" cy="14" r="4.8" />
          <path d="M37 21 C37 21 42 20 47 21 L48 36 L44 36 L43 48 L40 48 L40 36 L38 36 Z" />
          <line x1="45" y1="22" x2="58" y2="14" stroke="#F8FAFC" strokeWidth="2.8" strokeLinecap="round" />
        </g>

        {/* Tarjetas Flotantes Visuales con Estilo Editorial */}
        <g transform="translate(60, 100)">
          <rect width="165" height="58" rx="16" fill="#0F172A" fillOpacity="0.85" stroke="#38BDF8" strokeWidth="1.4" />
          <circle cx="30" cy="29" r="15" fill="#0284C7" fillOpacity="0.35" />
          <text x="30" y="35" textAnchor="middle" fill="#38BDF8" fontSize="16" fontWeight="bold">✨</text>
          <text x="56" y="25" fill="#F8FAFC" fontSize="13" fontWeight="bold" fontFamily="system-ui, sans-serif">12 Actividades</text>
          <text x="56" y="42" fill="#94A3B8" fontSize="11" fontFamily="system-ui, sans-serif">para descubrir</text>
        </g>

        <g transform="translate(775, 55)">
          <rect width="165" height="58" rx="16" fill="#0F172A" fillOpacity="0.85" stroke="#F59E0B" strokeWidth="1.4" />
          <circle cx="30" cy="29" r="15" fill="#D97706" fillOpacity="0.35" />
          <text x="30" y="35" textAnchor="middle" fill="#F59E0B" fontSize="16" fontWeight="bold">🧭</text>
          <text x="56" y="25" fill="#F8FAFC" fontSize="13" fontWeight="bold" fontFamily="system-ui, sans-serif">Explorá Jujuy</text>
          <text x="56" y="42" fill="#FDE047" fontSize="11" fontFamily="system-ui, sans-serif">A tu propio ritmo</text>
        </g>
      </svg>
    </div>
  );
};
