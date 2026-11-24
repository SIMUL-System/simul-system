import Icone from './Icone'

const ICONES = {
  info: 'info',
  sucesso: 'sucesso',
  aviso: 'aviso',
  erro: 'erro',
}

/**
 * Alert do Design System. Erro usa role="alert"; os demais, role="status".
 */
function Alerta({ tipo = 'info', titulo, children }) {
  return (
    <div className={`alerta alerta--${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      <Icone nome={ICONES[tipo]} />

      <div>
        {titulo && <strong>{titulo}</strong>}
        {children}
      </div>
    </div>
  )
}

export default Alerta
