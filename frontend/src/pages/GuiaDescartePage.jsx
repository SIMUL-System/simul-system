import { Link } from 'react-router-dom'

import '../App.css'
import '../styles/guia.css'

import Icone from '../components/Icone'
import CartoesMateriais from '../components/guia/CartoesMateriais'
import JogoSeparacao from '../components/guia/JogoSeparacao'
import Lixeira from '../components/guia/Lixeira'
import MissaoSemana from '../components/guia/MissaoSemana'
import MitoVerdade from '../components/guia/MitoVerdade'

import { LIXEIRAS, PASSOS } from '../utils/guiaConteudo'

/**
 * Guia de descarte consciente (RF08): página pública e interativa.
 */
function GuiaDescartePage() {
  return (
    <main className="guia" aria-labelledby="titulo-guia">
      <section className="guia-hero">
        <div className="guia-hero__texto">
          <p className="sobretitulo sobretitulo--verde">Guia de descarte consciente</p>

          <h1 id="titulo-guia" className="guia-hero__titulo">
            Cada embalagem no lugar certo deixa seu bairro mais limpo.
          </h1>

          <p className="guia-hero__lead">
            Aprenda a separar o lixo brincando: jogue, descubra mitos e cumpra a missão da semana.
          </p>

          <a href="#jogo" className="botao botao--primario">
            Jogar “Para onde vai?”
          </a>
        </div>

        <div className="guia-hero__turma" aria-hidden="true">
          {LIXEIRAS.slice(0, 6).map((l, i) => (
            <div key={l.id} className="guia-hero__lixeira" style={{ '--atraso': `${i * 0.12}s` }}>
              <Lixeira cor={l.cor} humor="feliz" tamanho={72} />
              <span>{l.nome}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="jogo" className="guia-secao" aria-labelledby="titulo-jogo">
        <header className="guia-secao__cabecalho">
          <h2 id="titulo-jogo" className="titulo-secao">
            Para onde vai?
          </h2>

          <p>Toque na lixeira certa para cada item.</p>
        </header>

        <JogoSeparacao />
      </section>

      <section className="guia-secao" aria-labelledby="titulo-passos">
        <header className="guia-secao__cabecalho">
          <h2 id="titulo-passos" className="titulo-secao">
            Separar é fácil: 4 passos
          </h2>
        </header>

        <ol className="guia-passos">
          {PASSOS.map((passo, indice) => (
            <li key={passo.titulo} className="guia-passo">
              <span className="guia-passo__numero" aria-hidden="true">
                {indice + 1}
              </span>

              <h3>{passo.titulo}</h3>
              <p>{passo.texto}</p>
            </li>
          ))}
        </ol>

        <p className="guia-nota">
          <Icone nome="info" />
          <span>
            Na coleta seletiva, os recicláveis podem ir juntos no mesmo saco, separados do lixo
            comum e dos restos de comida. As cores ajudam a reconhecer cada material e aparecem nas
            lixeiras públicas. <Link to="/">Veja o dia da coleta no seu bairro</Link>.
          </span>
        </p>
      </section>

      <section className="guia-secao" aria-labelledby="titulo-materiais">
        <header className="guia-secao__cabecalho">
          <h2 id="titulo-materiais" className="titulo-secao">
            O que vai em cada lixeira
          </h2>

          <p>Toque em um material para abrir.</p>
        </header>

        <CartoesMateriais />
      </section>

      <section className="guia-secao" aria-labelledby="titulo-mitos">
        <header className="guia-secao__cabecalho">
          <h2 id="titulo-mitos" className="titulo-secao">
            Mito ou verdade?
          </h2>
        </header>

        <MitoVerdade />
      </section>

      <section className="guia-secao guia-secao--missao" aria-labelledby="titulo-missao">
        <header className="guia-secao__cabecalho">
          <h2 id="titulo-missao" className="titulo-secao">
            Missão da semana
          </h2>

          <p>Marque o que sua casa já fez. Pequenos hábitos, grande diferença.</p>
        </header>

        <MissaoSemana />
      </section>

      <footer className="guia-fontes">
        <h2 className="visualmente-oculto">Fontes</h2>

        <p>
          Fontes: Resolução CONAMA nº 275/2001 (código de cores da coleta seletiva); listas de
          materiais não recicláveis de órgãos públicos; Associação Brasileira do Alumínio (ABAL). As
          regras podem variar de cidade para cidade.
        </p>
      </footer>
    </main>
  )
}

export default GuiaDescartePage
