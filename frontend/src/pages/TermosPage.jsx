import { Link } from 'react-router-dom'

import '../App.css'
import '../styles/institucional.css'

import Icone from '../components/Icone'
import { DATA_TERMOS, EMAIL_CONTATO } from '../conteudo/legal'

/** Termos de Uso do SIMUL, em linguagem simples. */
function TermosPage() {
  return (
    <main className="legal" aria-labelledby="titulo-termos">
      <header className="legal__cabecalho">
        <p className="sobretitulo">Seus direitos</p>
        <h1 id="titulo-termos">Termos de Uso</h1>
        <p className="legal__data">Atualizados em {DATA_TERMOS}</p>
      </header>

      <section className="legal__resumo" aria-labelledby="titulo-resumo-termos">
        <h2 id="titulo-resumo-termos">Em poucas palavras</h2>
        <ul>
          <li>O SIMUL é gratuito e foi feito por estudantes, como projeto de faculdade.</li>
          <li>
            Os dias e horários mostrados podem mudar. Em feriados ou imprevistos, confira os avisos
            oficiais da prefeitura.
          </li>
          <li>O lembrete ajuda, mas pode atrasar ou não chegar. Não dependa só dele.</li>
          <li>Use o site com respeito e não tente atrapalhar o funcionamento dele.</li>
        </ul>
      </section>

      <section className="legal__secao">
        <h2>1. O que é o SIMUL</h2>
        <p>
          O SIMUL (Sistema Integrado de Monitoramento Urbano de Limpeza) mostra os dias e horários
          da coleta seletiva de cada bairro, manda lembretes antes da coleta para quem cria uma
          conta e ensina a separar o lixo no guia de descarte. É um projeto acadêmico do curso de
          Análise e Desenvolvimento de Sistemas da Faculdade SENAI FATESG, sem fins lucrativos.
          Conheça a equipe em <Link to="/quem-somos">Quem somos</Link>.
        </p>
      </section>

      <section className="legal__secao">
        <h2>2. Ao usar o site</h2>
        <p>
          Consultar a coleta e ler o guia não exige cadastro. Ao criar uma conta, você declara que
          leu e aceita estes Termos de Uso e a{' '}
          <Link to="/privacidade">Política de Privacidade</Link>, que explica quais dados guardamos
          e como protegemos.
        </p>
      </section>

      <section className="legal__secao">
        <h2>3. Sua conta</h2>
        <ul>
          <li>Use seu nome e um e-mail que seja seu. Cada e-mail pode ter uma conta só.</li>
          <li>
            Sua senha é pessoal. Não compartilhe e use uma senha que você não usa em outros sites.
          </li>
          <li>
            Se perceber que alguém entrou na sua conta, troque a senha em “Esqueci minha senha” e
            avise a gente.
          </li>
          <li>Quem tem menos de 18 anos deve criar a conta junto com um responsável.</li>
          <li>
            Você pode excluir sua conta quando quiser, em <Link to="/minha-conta">Minha conta</Link>
            .
          </li>
        </ul>
      </section>

      <section className="legal__secao">
        <h2>4. O que não é permitido</h2>
        <ul>
          <li>Tentar entrar em contas de outras pessoas ou em áreas restritas do site.</li>
          <li>Cadastrar o e-mail de outra pessoa sem autorização.</li>
          <li>
            Usar robôs ou programas para fazer muitas consultas seguidas e sobrecarregar o site.
          </li>
          <li>Tentar descobrir ou explorar falhas de segurança para causar dano.</li>
        </ul>
        <p>
          Se encontrar uma falha de segurança, conte para nós em{' '}
          <a href={`mailto:${EMAIL_CONTATO}`}>{EMAIL_CONTATO}</a>. Agradecemos!
        </p>
        <p>Contas usadas para essas práticas podem ser suspensas.</p>
      </section>

      <section className="legal__secao">
        <h2>5. Dias, horários e lembretes</h2>
        <ul>
          <li>
            As informações de coleta são cadastradas pela equipe do SIMUL com base nos dados
            divulgados pela prefeitura. Elas podem mudar sem aviso, por exemplo em feriados, chuvas
            fortes ou mudanças de rota.
          </li>
          <li>
            O lembrete é uma ajuda. Ele pode atrasar ou não chegar (por exemplo, se cair na caixa de
            spam ou se o servidor estiver fora do ar). Os avisos oficiais da prefeitura continuam
            valendo.
          </li>
          <li>
            O guia de descarte traz orientações gerais. Regras específicas da sua cidade têm
            prioridade.
          </li>
        </ul>
      </section>

      <section className="legal__secao">
        <h2>6. Disponibilidade</h2>
        <p>
          O SIMUL roda em uma hospedagem gratuita. Por isso, o primeiro acesso depois de um tempo
          parado pode demorar cerca de 1 minuto, e o site pode ficar fora do ar em alguns momentos.
          Como é um projeto acadêmico, ele também pode ser encerrado no futuro; se isso acontecer,
          avisaremos quem tem conta por e-mail.
        </p>
      </section>

      <section className="legal__secao">
        <h2>7. Conteúdo do site</h2>
        <p>
          Os textos e o código do SIMUL são da equipe do projeto. As fotos da instituição e da
          equipe pertencem aos seus autores. Os mapas vêm do OpenStreetMap, © colaboradores do
          OpenStreetMap, sob a licença aberta ODbL.
        </p>
      </section>

      <section className="legal__secao">
        <h2>8. Responsabilidades</h2>
        <p>
          Fazemos o possível para manter as informações certas e o site funcionando, mas não
          garantimos que ele esteja sempre disponível ou livre de erros. Isso não diminui nenhum
          direito que a lei garante a você.
        </p>
      </section>

      <section className="legal__secao">
        <h2>9. Mudanças nestes termos</h2>
        <p>
          Podemos atualizar estes termos. Quando a mudança for importante, a data no topo muda e, no
          seu próximo acesso, pedimos que você leia e aceite a nova versão.
        </p>
      </section>

      <section className="legal__secao">
        <h2>10. Leis que valem</h2>
        <p>
          Estes termos seguem as leis do Brasil, em especial o Marco Civil da Internet (Lei
          12.965/2014), a Lei Geral de Proteção de Dados (Lei 13.709/2018) e o Código de Defesa do
          Consumidor, quando aplicável.
        </p>
      </section>

      <p className="legal__contato">
        <Icone nome="email" tamanho={18} />
        Dúvidas? Escreva para <a href={`mailto:${EMAIL_CONTATO}`}>{EMAIL_CONTATO}</a>.
      </p>
    </main>
  )
}

export default TermosPage
