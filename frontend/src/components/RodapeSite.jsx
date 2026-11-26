import { Link } from 'react-router-dom'

import { EMAIL_CONTATO } from '../conteudo/legal'

/** Rodapé de todas as páginas: links institucionais e legais. */
function RodapeSite() {
  return (
    <footer className="rodape">
      <div className="rodape__conteudo">
        <div className="rodape__marca">
          <strong>SIMUL</strong>
          <p>
            Coleta seletiva na hora certa. Projeto acadêmico de Análise e Desenvolvimento de
            Sistemas da Faculdade SENAI FATESG.
          </p>
        </div>

        <nav className="rodape__grupo" aria-label="Sobre o SIMUL">
          <h2 className="rodape__titulo">O SIMUL</h2>
          <ul>
            <li>
              <Link to="/">Consultar coleta</Link>
            </li>
            <li>
              <Link to="/guia-de-descarte">Guia de descarte</Link>
            </li>
            <li>
              <Link to="/quem-somos">Quem somos</Link>
            </li>
          </ul>
        </nav>

        <nav className="rodape__grupo" aria-label="Seus direitos">
          <h2 className="rodape__titulo">Seus direitos</h2>
          <ul>
            <li>
              <Link to="/termos">Termos de Uso</Link>
            </li>
            <li>
              <Link to="/privacidade">Privacidade e cookies</Link>
            </li>
            <li>
              <a href={`mailto:${EMAIL_CONTATO}`}>{EMAIL_CONTATO}</a>
            </li>
          </ul>
        </nav>
      </div>

      <p className="rodape__final">© 2026 SIMUL · Feito por estudantes, sem fins lucrativos.</p>
    </footer>
  )
}

export default RodapeSite
