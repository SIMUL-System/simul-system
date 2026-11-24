/**
 * Lixeira-personagem do guia (ilustração original do SIMUL).
 * humor: 'neutro' | 'feliz' | 'triste'. Sempre decorativa (aria-hidden):
 * o nome da lixeira vem em texto ao lado.
 */
function Lixeira({
  cor,
  humor = 'neutro',
  tamanho = 64,
}) {
  const boca = {
    neutro: 'M26 47 Q32 50 38 47',
    feliz: 'M24 45 Q32 54 40 45',
    triste: 'M25 50 Q32 44 39 50',
  }[humor]

  return (
    <svg
      className={`lixeira lixeira--${humor}`}
      style={{ '--cor-lixeira': `var(--${cor})` }}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      {/* tampa */}
      <rect
        className="lixeira__tampa"
        x="10"
        y="10"
        width="44"
        height="8"
        rx="4"
      />
      <rect
        className="lixeira__tampa"
        x="26"
        y="5"
        width="12"
        height="6"
        rx="3"
      />
      {/* corpo */}
      <path
        className="lixeira__corpo"
        d="M13 20 H51 L47 58 Q46.6 61 43.5 61 H20.5 Q17.4 61 17 58 Z"
      />
      {/* olhos */}
      <circle
        className="lixeira__olho"
        cx="25"
        cy="35"
        r="5"
      />
      <circle
        className="lixeira__olho"
        cx="39"
        cy="35"
        r="5"
      />
      <circle
        className="lixeira__pupila"
        cx={humor === 'triste' ? 25 : 26}
        cy={humor === 'triste' ? 37 : 35}
        r="2.4"
      />
      <circle
        className="lixeira__pupila"
        cx={humor === 'triste' ? 39 : 40}
        cy={humor === 'triste' ? 37 : 35}
        r="2.4"
      />
      {/* boca */}
      <path
        className="lixeira__boca"
        d={boca}
      />
    </svg>
  )
}

export default Lixeira
