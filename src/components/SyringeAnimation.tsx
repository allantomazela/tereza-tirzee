import { useMemo } from 'react'

interface SyringeAnimationProps {
  units: number // 0 to 60 (or up to 100)
  maxUnits?: number
}

/**
 * Seringa de Insulina U-100 (1ml) Animada
 * Baseada fielmente no modelo real com:
 * - Tampa de agulha protetora na cor LARANJA no topo/ponta (com nervuras verticais e borda saliente)
 * - Bico/cânula metálica ultrafina sob a tampa
 * - Cilindro transparente e alongado
 * - Graduações pretas numeradas de 10 em 10 (10, 20, 30 ... 100) e traços intermediários
 * - Rótulo "UNITS" próximo à marca de 100
 * - Êmbolo com pistão/borracha preta de vedação e haste branca/translúcida com nervuras
 * - Apoio para dedos (flange com abas circulares) e disco do êmbolo na base
 * - Líquido rosa translúcido preenchendo até a marca selecionada (0 a 60 un) com bolhas animadas
 */
export default function SyringeAnimation({ units, maxUnits = 60 }: SyringeAnimationProps) {
  // Garantir limites
  const safeUnits = Math.max(0, Math.min(maxUnits, units))

  // Escala total do corpo da seringa de insulina U-100 vai de 0 a 100 unidades
  const totalScaleUnits = 100

  // Coordenadas horizontais do viewBox SVG (0 0 760 170)
  // Eixo central horizontal: y = 85
  // Altura do cilindro transparente: 34px (y: 68 a 102) -> formato fino e alongado característico de insulina
  // A escala de 0 a 100 units fica entre x = 180 (0 un) e x = 500 (100 un), comprimento de 320px
  const scaleStartX = 180 // marca 0 UNITS
  const scaleEndX = 500 // marca 100 UNITS
  const scaleLength = scaleEndX - scaleStartX // 320px (3.2px por unidade)

  // Altura e limites verticais do cilindro
  const barrelY = 68
  const barrelHeight = 34
  const barrelStartX = 166 // onde começa o cilindro junto ao bico/cone
  const barrelEndX = 540 // onde termina o corpo e se junta à flange

  // Posição x correspondente às unidades selecionadas
  const liquidTargetX = scaleStartX + (safeUnits / totalScaleUnits) * scaleLength
  const liquidWidth = Math.max(0, liquidTargetX - barrelStartX)

  // O pistão/borracha de vedação preta fica exatamente encostado no líquido
  // xFront é a frente da borracha (onde alinha com a graduação)
  const pistonFrontX = barrelStartX + liquidWidth
  const pistonWidth = 14 // espessura da borracha dupla preta de vedação

  // Haste do êmbolo sai de trás do pistão e vai até o disco do botão
  // O botão recua conforme o êmbolo é puxado para trás
  // Distância fixa da haste: da borracha até o disco
  const rodLength = 160
  const thumbDiscX = pistonFrontX + pistonWidth + rodLength

  // Gerador das marcas da escala de insulina U-100 (0 a 100)
  // Cada unidade tem um traço curto, a cada 5 um médio, a cada 10 um longo com número
  const graduationMarks = useMemo(() => {
    const marks = []
    for (let u = 0; u <= 100; u += 2) {
      const x = scaleStartX + (u / totalScaleUnits) * scaleLength
      const isMajor = u % 10 === 0
      const isMid = !isMajor && u % 5 === 0 // ou divisíveis por 2/5

      marks.push({
        unit: u,
        x,
        isMajor,
        isMid,
        height: isMajor ? 11 : isMid ? 8 : 5,
      })
    }
    return marks
  }, [scaleStartX, scaleLength, totalScaleUnits])

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      <div className="w-full relative overflow-hidden bg-gradient-to-b from-[#FFF5F8] via-white to-[#FCE4EC]/30 rounded-3xl p-3 sm:p-5 border border-[#F9A8C9]/40 shadow-inner">
        <svg
          viewBox="0 0 760 170"
          className="w-full h-auto drop-shadow-sm overflow-visible"
          role="img"
          aria-label={`Seringa de insulina U-100 marcando ${safeUnits} unidades`}
        >
          <defs>
            {/* Gradiente da tampa laranja brilhante (como na foto) */}
            <linearGradient id="orangeCapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFA126" />
              <stop offset="35%" stopColor="#FF7700" />
              <stop offset="70%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>

            {/* Brilho da tampa de plástico laranja */}
            <linearGradient id="orangeCapHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
              <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
            </linearGradient>

            {/* Gradiente do líquido rosa Tirzepatida */}
            <linearGradient id="liquidPinkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F9A8C9" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#F43F8E" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#D63370" stopOpacity="0.9" />
            </linearGradient>

            {/* Gradiente da haste do êmbolo (plástico branco translúcido) */}
            <linearGradient id="plungerWhitePlast" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>

            {/* Gradiente do reflexo do cilindro de vidro/plástico cristalino */}
            <linearGradient id="barrelGlassShine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="85%" stopColor="#0F172A" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.5" />
            </linearGradient>

            {/* Gradiente da borracha preta do êmbolo */}
            <linearGradient id="blackPistonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="35%" stopColor="#1E293B" />
              <stop offset="70%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Filtro de sombra suave */}
            <filter id="softGlow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000" floodOpacity="0.1" />
            </filter>
          </defs>

          {/* ============================================================== */}
          {/* 1. ÊMBOLO MÓVEL: Borracha preta + Haste branca + Disco de apoio */}
          {/* ============================================================== */}
          <g className="transition-all duration-150 ease-out">
            {/* Haste do êmbolo (formato de cruz/I-beam plástico branco) */}
            {/* Haste horizontal central */}
            <rect
              x={pistonFrontX + pistonWidth}
              y="80"
              width={Math.max(0, thumbDiscX - (pistonFrontX + pistonWidth))}
              height="10"
              fill="url(#plungerWhitePlast)"
              stroke="#CBD5E1"
              strokeWidth="0.8"
            />
            {/* Linha de nervura central da haste cruciforme */}
            <line
              x1={pistonFrontX + pistonWidth}
              y1="85"
              x2={thumbDiscX}
              y2="85"
              stroke="#94A3B8"
              strokeWidth="1.2"
              opacity="0.7"
            />

            {/* Aleta/guia perto do pistão */}
            <rect
              x={pistonFrontX + pistonWidth + 8}
              y="74"
              width="4"
              height="22"
              fill="#E2E8F0"
              stroke="#94A3B8"
              strokeWidth="0.6"
              rx="1"
            />

            {/* Apoio do polegar na ponta do êmbolo (disco transversal circular/oval) */}
            {/* Borda externa com flange suave */}
            <g>
              <ellipse
                cx={thumbDiscX + 4}
                cy="85"
                rx="4"
                ry="17"
                fill="#E2E8F0"
                stroke="#94A3B8"
                strokeWidth="1"
              />
              <ellipse
                cx={thumbDiscX + 2}
                cy="85"
                rx="3.5"
                ry="15"
                fill="url(#plungerWhitePlast)"
              />
              {/* Linha de detalhe no disco */}
              <line
                x1={thumbDiscX + 2}
                y1="72"
                x2={thumbDiscX + 2}
                y2="98"
                stroke="#FFFFFF"
                strokeWidth="1"
              />
            </g>

            {/* PISTÃO / BORRACHA DE VEDAÇÃO PRETA (dentro do cilindro) */}
            {/* O anel de vedação dianteiro fica alinhado exatamente em pistonFrontX */}
            <g>
              {/* Corpo principal da borracha preta */}
              <rect
                x={pistonFrontX}
                y={barrelY + 1}
                width={pistonWidth}
                height={barrelHeight - 2}
                fill="url(#blackPistonGrad)"
                rx="1.5"
              />
              {/* Anel dianteiro de vedação (primeira marca preta) */}
              <line
                x1={pistonFrontX + 2}
                y1={barrelY + 1}
                x2={pistonFrontX + 2}
                y2={barrelY + barrelHeight - 1}
                stroke="#475569"
                strokeWidth="1.5"
              />
              {/* Ranhura interna de lubrificação entre os dois anéis */}
              <line
                x1={pistonFrontX + 7}
                y1={barrelY + 2}
                x2={pistonFrontX + 7}
                y2={barrelY + barrelHeight - 2}
                stroke="#090D16"
                strokeWidth="2.5"
              />
              {/* Anel traseiro de vedação */}
              <line
                x1={pistonFrontX + 12}
                y1={barrelY + 1}
                x2={pistonFrontX + 12}
                y2={barrelY + barrelHeight - 1}
                stroke="#334155"
                strokeWidth="1.5"
              />
              {/* Reflexo no topo da borracha preta */}
              <line
                x1={pistonFrontX + 1}
                y1={barrelY + 3}
                x2={pistonFrontX + pistonWidth - 1}
                y2={barrelY + 3}
                stroke="#64748B"
                strokeWidth="1"
                opacity="0.8"
              />
            </g>
          </g>

          {/* ============================================================== */}
          {/* 2. LÍQUIDO ROSA TRANSLÚCIDO (da ponta até a borracha)          */}
          {/* ============================================================== */}
          <g>
            <rect
              x={barrelStartX}
              y={barrelY + 1.2}
              width={liquidWidth}
              height={barrelHeight - 2.4}
              fill="url(#liquidPinkGrad)"
              className="transition-all duration-150 ease-out"
            />

            {/* Menisco / interface do líquido na frente da borracha */}
            {liquidWidth > 2 && (
              <line
                x1={liquidTargetX}
                y1={barrelY + 1.5}
                x2={liquidTargetX}
                y2={barrelY + barrelHeight - 1.5}
                stroke="#BE185D"
                strokeWidth="1.5"
                opacity="0.9"
              />
            )}

            {/* BOLHAS DE AR ANIMADAS NO LÍQUIDO ROSA */}
            {liquidWidth > 30 && (
              <g className="pointer-events-none">
                <circle
                  cx={barrelStartX + Math.min(liquidWidth - 18, 30)}
                  cy="82"
                  r="2.2"
                  fill="#FFFFFF"
                  opacity="0.8"
                  className="animate-bubble-1"
                />
                <circle
                  cx={barrelStartX + Math.min(liquidWidth - 12, Math.max(20, liquidWidth * 0.45))}
                  cy="77"
                  r="1.7"
                  fill="#FFFFFF"
                  opacity="0.7"
                  className="animate-bubble-2"
                />
                <circle
                  cx={barrelStartX + Math.min(liquidWidth - 8, Math.max(15, liquidWidth * 0.75))}
                  cy="89"
                  r="2.4"
                  fill="#FFFFFF"
                  opacity="0.75"
                  className="animate-bubble-3"
                />
              </g>
            )}
          </g>

          {/* ============================================================== */}
          {/* 3. CORPO TRANSPARENTE DA SERINGA (vidro/plástico fino)        */}
          {/* ============================================================== */}
          <g>
            {/* Parede do cilindro (transparente com contorno fino e suave) */}
            <rect
              x={barrelStartX}
              y={barrelY}
              width={barrelEndX - barrelStartX}
              height={barrelHeight}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.6"
              rx="2"
            />

            {/* Suporte cilíndrico traseiro (pescoço que segura a flange) */}
            <rect
              x={barrelEndX}
              y={barrelY + 3}
              width="20"
              height={barrelHeight - 6}
              fill="#F8FAFC"
              stroke="#CBD5E1"
              strokeWidth="1.2"
              opacity="0.9"
            />
            {/* Reforços longitudinais do suporte traseiro */}
            <line
              x1={barrelEndX}
              y1="76"
              x2={barrelEndX + 20}
              y2="76"
              stroke="#94A3B8"
              strokeWidth="0.8"
            />
            <line
              x1={barrelEndX}
              y1="94"
              x2={barrelEndX + 20}
              y2="94"
              stroke="#94A3B8"
              strokeWidth="0.8"
            />

            {/* FLANGE / ABA DE APOIO PARA OS DEDOS (disco oval transparente na base) */}
            <g>
              {/* Sombra da flange */}
              <ellipse
                cx={barrelEndX + 22}
                cy="85"
                rx="6"
                ry="36"
                fill="#F1F5F9"
                stroke="#94A3B8"
                strokeWidth="1.6"
              />
              {/* Abertura interna / relevo da flange */}
              <ellipse
                cx={barrelEndX + 22}
                cy="85"
                rx="4"
                ry="32"
                fill="#FFFFFF"
                fillOpacity="0.5"
                stroke="#CBD5E1"
                strokeWidth="1"
              />
              {/* Brilho da flange plástica */}
              <path
                d={`M ${barrelEndX + 20} 54 Q ${barrelEndX + 24} 60 ${barrelEndX + 23} 72`}
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* Cone / ponta Luer onde a agulha é fixada */}
            <path
              d={`M ${barrelStartX} ${barrelY} L 150 ${barrelY + 8} L 150 ${barrelY + barrelHeight - 8} L ${barrelStartX} ${barrelY + barrelHeight} Z`}
              fill="#F1F5F9"
              stroke="#94A3B8"
              strokeWidth="1.4"
            />
            {/* Anel do hub na base da agulha */}
            <rect
              x="142"
              y={barrelY + 8}
              width="8"
              height={barrelHeight - 16}
              fill="#CBD5E1"
              stroke="#94A3B8"
              strokeWidth="1"
              rx="1"
            />
          </g>

          {/* ============================================================== */}
          {/* 4. ESCALA GRADUADA U-100 (0 A 100 COM TEXTO "UNITS")           */}
          {/* ============================================================== */}
          <g className="pointer-events-none select-none">
            {/* Traço da marca 0 (zero) */}
            <line
              x1={scaleStartX}
              y1={barrelY + 1}
              x2={scaleStartX}
              y2={barrelY + 12}
              stroke="#0F172A"
              strokeWidth="1.5"
            />
            <line
              x1={scaleStartX}
              y1={barrelY + barrelHeight - 1}
              x2={scaleStartX}
              y2={barrelY + barrelHeight - 12}
              stroke="#0F172A"
              strokeWidth="1.5"
            />
            <text
              x={scaleStartX}
              y={barrelY + barrelHeight / 2 + 3.5}
              textAnchor="middle"
              fill="#0F172A"
              fontSize="9"
              fontWeight="700"
              fontFamily="Poppins, sans-serif"
            >
              0
            </text>

            {/* Graduações de 2 a 100 */}
            {graduationMarks.map((mark) => {
              if (mark.unit === 0) return null

              return (
                <g key={mark.unit}>
                  {/* Traço superior da escala */}
                  <line
                    x1={mark.x}
                    y1={barrelY + 1}
                    x2={mark.x}
                    y2={barrelY + 1 + mark.height}
                    stroke="#0F172A"
                    strokeWidth={mark.isMajor ? 1.4 : mark.isMid ? 1 : 0.7}
                    strokeLinecap="square"
                  />

                  {/* Traço inferior simétrico */}
                  <line
                    x1={mark.x}
                    y1={barrelY + barrelHeight - 1}
                    x2={mark.x}
                    y2={barrelY + barrelHeight - 1 - mark.height}
                    stroke="#0F172A"
                    strokeWidth={mark.isMajor ? 1.4 : mark.isMid ? 1 : 0.7}
                    strokeLinecap="square"
                  />

                  {/* Números apenas nas marcas maiores de 10 em 10 (10, 20, 30 ... 100) */}
                  {mark.isMajor && (
                    <text
                      x={mark.x}
                      y={barrelY + barrelHeight / 2 + 3.5}
                      textAnchor="middle"
                      fill="#0F172A"
                      fontSize={mark.unit === 100 ? '8' : '8.5'}
                      fontWeight="700"
                      fontFamily="Poppins, sans-serif"
                      letterSpacing="-0.3px"
                    >
                      {mark.unit}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Rótulo "UNITS" próximo à marca de 100 na extremidade */}
            <text
              x={scaleEndX + 2}
              y={barrelY + barrelHeight + 11}
              textAnchor="middle"
              fill="#1E293B"
              fontSize="7"
              fontWeight="800"
              fontFamily="Poppins, sans-serif"
              letterSpacing="0.5px"
            >
              UNITS
            </text>
          </g>

          {/* ============================================================== */}
          {/* 5. REFLEXO CRISTALINO DO VIDRO (sobreposto)                    */}
          {/* ============================================================== */}
          <rect
            x={barrelStartX}
            y={barrelY}
            width={barrelEndX - barrelStartX}
            height={barrelHeight}
            fill="url(#barrelGlassShine)"
            rx="2"
            pointerEvents="none"
          />

          {/* ============================================================== */}
          {/* 6. TAMPA / CAPA DE AGULHA LARANJA NO TOPO (Ponta esquerda)     */}
          {/*    Com nervuras longitudinais e borda saliente na ponta        */}
          {/* ============================================================== */}
          <g filter="url(#softGlow)">
            {/* Cânula metálica da agulha ultrafina saindo do hub até dentro da tampa */}
            <line
              x1="30"
              y1="85"
              x2="142"
              y2="85"
              stroke="#64748B"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            {/* Bisel da agulha (visível sob leve transparência ou se retirada) */}
            <polygon points="30,85 36,83.5 36,86.5" fill="#475569" />

            {/* CAPA PROTETORA LARANJA (encaixada sobre a agulha até o hub) */}
            {/* A capa de insulina vai de x = 20 até x = 146 */}
            {/* Borda saliente na ponta superior da tampa (disco/colar da tampa) */}
            <rect
              x="20"
              y="69"
              width="8"
              height="32"
              rx="3"
              fill="url(#orangeCapGrad)"
              stroke="#C2410C"
              strokeWidth="1"
            />
            <rect x="22" y="70" width="3" height="30" fill="#FFA126" opacity="0.6" rx="1.5" />

            {/* Corpo principal da tampa laranja */}
            <rect
              x="27"
              y="71"
              width="118"
              height="28"
              rx="2"
              fill="url(#orangeCapGrad)"
              stroke="#C2410C"
              strokeWidth="1"
            />

            {/* Nervuras verticais/longitudinais características da tampa de insulina */}
            <line
              x1="34"
              y1="74"
              x2="136"
              y2="74"
              stroke="#FFA126"
              strokeWidth="1.5"
              opacity="0.8"
            />
            <line
              x1="34"
              y1="78"
              x2="136"
              y2="78"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              opacity="0.5"
            />
            <line
              x1="34"
              y1="85"
              x2="136"
              y2="85"
              stroke="#C2410C"
              strokeWidth="1.2"
              opacity="0.6"
            />
            <line
              x1="34"
              y1="92"
              x2="136"
              y2="92"
              stroke="#9A3412"
              strokeWidth="1.2"
              opacity="0.7"
            />
            <line
              x1="34"
              y1="96"
              x2="136"
              y2="96"
              stroke="#7C2D12"
              strokeWidth="1.5"
              opacity="0.8"
            />

            {/* Nervuras em relevo (grip) */}
            {[45, 60, 75, 90, 105, 120].map((rxPos) => (
              <line
                key={rxPos}
                x1={rxPos}
                y1="72"
                x2={rxPos}
                y2="98"
                stroke="#C2410C"
                strokeWidth="0.8"
                opacity="0.4"
              />
            ))}

            {/* Base da tampa que se conecta ao corpo com anel alargado */}
            <rect
              x="140"
              y="70"
              width="6"
              height="30"
              rx="2"
              fill="url(#orangeCapGrad)"
              stroke="#C2410C"
              strokeWidth="0.8"
            />

            {/* Brilho na tampa */}
            <rect
              x="27"
              y="71"
              width="118"
              height="28"
              rx="2"
              fill="url(#orangeCapHighlight)"
              pointerEvents="none"
            />
          </g>

          {/* ============================================================== */}
          {/* 7. INDICADOR FLUTUANTE DE DOSE ATUAL ALINHADO AO PISTÃO        */}
          {/* ============================================================== */}
          <g
            className="transition-all duration-150 ease-out pointer-events-none"
            transform={`translate(${liquidTargetX}, 0)`}
          >
            {/* Linha vertical pontilhada indicando o nível selecionado */}
            <line
              x1="0"
              y1={barrelY - 14}
              x2="0"
              y2={barrelY}
              stroke="#F43F8E"
              strokeWidth="1.8"
              strokeDasharray="2 2"
            />
            {/* Tag flutuante com a quantidade de unidades */}
            <rect
              x="-22"
              y={barrelY - 34}
              width="44"
              height="18"
              rx="9"
              fill="#F43F8E"
              filter="url(#softGlow)"
            />
            <text
              x="0"
              y={barrelY - 21.5}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="10"
              fontWeight="800"
              fontFamily="Poppins, sans-serif"
            >
              {safeUnits} un
            </text>
            {/* Pequena setinha apontando para a marca da seringa */}
            <polygon
              points="-4,48 4,48 0,53"
              transform={`translate(0, ${barrelY - 48})`}
              fill="#F43F8E"
            />
          </g>
        </svg>

        {/* Indicador visual de nível abaixo da seringa alinhado à escala */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 px-3 sm:px-8 mt-2">
          <span>0 un</span>
          <span>20 un</span>
          <span>40 un</span>
          <span className="text-[#F43F8E] font-bold">60 un (Limite Tereza)</span>
          <span>80 un</span>
          <span>100 un (1.0 ml)</span>
        </div>
      </div>
    </div>
  )
}
