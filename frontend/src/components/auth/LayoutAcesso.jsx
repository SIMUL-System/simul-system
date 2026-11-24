import { Link } from 'react-router-dom'

import '../../styles/acesso.css'

import Icone from '../Icone'
import simboloApp from '../../assets/marca/simul-icone-app.svg'

const BENEFICIOS = [
  'Dias e horários da coleta do seu bairro',
  'Lembrete por e-mail antes de cada coleta',
  'Você escolhe a antecedência do aviso',
]

/**
 * Layout das telas de acesso (login, cadastro, verificação e senha):
 * painel da marca à esquerda (desktop) e cartão do formulário à direita.
 */
function LayoutAcesso({
  idTitulo,
  titulo,
  descricao,
  ocupado = false,
  children,
  rodape,
}) {
  return (
    <main className="acesso">
      <aside
        className="acesso__marca"
        aria-hidden="true"
      >
        <img
          src={simboloApp}
          alt=""
          width="56"
          height="56"
        />

        <p className="acesso__slogan">
          Coleta seletiva sem esquecimento.
        </p>

        <ul className="acesso__beneficios">
          {BENEFICIOS.map((texto) => (
            <li key={texto}>
              <Icone
                nome="sucesso"
                tamanho={20}
              />
              {texto}
            </li>
          ))}
        </ul>
      </aside>

      <section
        className="acesso__conteudo"
        aria-labelledby={idTitulo}
        aria-busy={ocupado}
      >
        <div className="acesso__cartao">
          <header className="acesso__cabecalho">
            <h1
              id={idTitulo}
              className="acesso__titulo"
            >
              {titulo}
            </h1>

            {descricao && (
              <p className="acesso__descricao">
                {descricao}
              </p>
            )}
          </header>

          {children}
        </div>

        <div className="acesso__rodape">
          {rodape}

          <Link
            to="/"
            className="acesso__voltar"
          >
            Voltar para a consulta
          </Link>
        </div>
      </section>
    </main>
  )
}

export default LayoutAcesso
