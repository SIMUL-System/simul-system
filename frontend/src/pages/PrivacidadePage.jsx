import { Link } from 'react-router-dom'

import '../App.css'
import '../styles/institucional.css'

import Icone from '../components/Icone'
import { DATA_TERMOS, EMAIL_CONTATO } from '../conteudo/legal'

// O que guardamos, para quê e quando. Fica numa lista (e não em tabela) para caber no celular.
const DADOS = [
  {
    dado: 'Nome',
    paraQue: 'Chamar você pelo nome nos e-mails do SIMUL.',
    quando: 'Ao criar a conta.',
  },
  {
    dado: 'E-mail',
    paraQue:
      'Entrar na conta, confirmar que o e-mail é seu, recuperar a senha e mandar os lembretes.',
    quando: 'Ao criar a conta. Fica criptografado no nosso banco de dados.',
  },
  {
    dado: 'Senha',
    paraQue: 'Proteger sua conta.',
    quando:
      'Ao criar a conta. Não guardamos a senha em si, só um resumo dela que não pode ser desfeito.',
  },
  {
    dado: 'Cidade e bairro',
    paraQue: 'Saber qual é a sua rota e em que dias e horários avisar você.',
    quando: 'Quando você configura o lembrete.',
  },
  {
    dado: 'Como quer ser avisado',
    paraQue:
      'Mandar o lembrete por e-mail, pelo navegador ou pelos dois, com a antecedência que escolheu.',
    quando: 'Quando você configura o lembrete.',
  },
  {
    dado: 'Inscrição do navegador',
    paraQue: 'Mostrar o lembrete como notificação no navegador.',
    quando:
      'Só se você autorizar as notificações. É um endereço técnico criado pelo próprio navegador.',
  },
  {
    dado: 'Histórico de lembretes',
    paraQue:
      'Não mandar o mesmo aviso duas vezes e tentar de novo quando um envio falha. Guarda a data da coleta, o canal e se o aviso chegou.',
    quando: 'Cada vez que um lembrete é enviado.',
  },
  {
    dado: 'Aceite destes termos',
    paraQue: 'Registrar quando você aceitou e qual versão do texto leu.',
    quando: 'Ao criar a conta ou quando o texto muda.',
  },
  {
    dado: 'Registros de acesso',
    paraQue: 'Segurança do site (por exemplo, investigar ataques).',
    quando:
      'A cada acesso: endereço IP e horário ficam nos registros da empresa que hospeda o SIMUL.',
  },
]

/** Política de Privacidade e de cookies, em linguagem simples (LGPD, Lei 13.709/2018). */
function PrivacidadePage() {
  return (
    <main className="legal" aria-labelledby="titulo-privacidade">
      <header className="legal__cabecalho">
        <p className="sobretitulo">Seus direitos</p>
        <h1 id="titulo-privacidade">Política de Privacidade</h1>
        <p className="legal__data">Atualizada em {DATA_TERMOS}</p>
      </header>

      <section className="legal__resumo" aria-labelledby="titulo-resumo-privacidade">
        <h2 id="titulo-resumo-privacidade">Em poucas palavras</h2>
        <ul>
          <li>
            Guardamos só o necessário: nome, e-mail, senha protegida, seu bairro e como você quer
            ser avisado.
          </li>
          <li>Usamos esses dados apenas para mostrar sua coleta e mandar seus lembretes.</li>
          <li>Não vendemos seus dados e não usamos cookies de propaganda.</li>
          <li>
            Você pode baixar uma cópia dos seus dados ou apagar sua conta quando quiser, em{' '}
            <Link to="/minha-conta">Minha conta</Link>.
          </li>
        </ul>
      </section>

      <nav className="legal__indice" aria-label="Nesta página">
        <h2>Nesta página</h2>
        <ol>
          <li>
            <a href="#quem-cuida">Quem cuida dos seus dados</a>
          </li>
          <li>
            <a href="#o-que-guardamos">O que guardamos e por quê</a>
          </li>
          <li>
            <a href="#base-legal">O que nos permite usar os dados</a>
          </li>
          <li>
            <a href="#compartilhamento">Com quem compartilhamos</a>
          </li>
          <li>
            <a href="#armazenamento">Cookies e armazenamento no navegador</a>
          </li>
          <li>
            <a href="#tempo">Por quanto tempo guardamos</a>
          </li>
          <li>
            <a href="#seguranca">Como protegemos</a>
          </li>
          <li>
            <a href="#direitos">Seus direitos</a>
          </li>
          <li>
            <a href="#menores">Crianças e adolescentes</a>
          </li>
          <li>
            <a href="#mudancas">Mudanças nesta política</a>
          </li>
        </ol>
      </nav>

      <section id="quem-cuida" className="legal__secao">
        <h2>1. Quem cuida dos seus dados</h2>
        <p>
          O SIMUL é um projeto acadêmico, sem fins lucrativos, feito por estudantes do curso de
          Análise e Desenvolvimento de Sistemas da Faculdade SENAI FATESG, em Goiânia. A equipe do
          projeto é a responsável pelos dados tratados aqui (o “controlador”, nas palavras da lei).
        </p>
        <p>
          Para qualquer dúvida ou pedido sobre seus dados, escreva para{' '}
          <a href={`mailto:${EMAIL_CONTATO}`}>{EMAIL_CONTATO}</a>. Conheça a equipe em{' '}
          <Link to="/quem-somos">Quem somos</Link>.
        </p>
      </section>

      <section id="o-que-guardamos" className="legal__secao">
        <h2>2. O que guardamos e por quê</h2>
        <p>
          Para <strong>consultar a coleta</strong> e ler o <strong>guia de descarte</strong> você
          não precisa de conta, e o bairro que você pesquisa não fica guardado no nosso servidor. Os
          dados abaixo só existem para quem cria uma conta para receber lembretes.
        </p>

        <ul className="legal__dados">
          {DADOS.map((item) => (
            <li key={item.dado} className="legal__dado">
              <h3>{item.dado}</h3>
              <dl>
                <div>
                  <dt>Para quê</dt>
                  <dd>{item.paraQue}</dd>
                </div>
                <div>
                  <dt>Quando</dt>
                  <dd>{item.quando}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>

        <p>
          Não pedimos CPF, telefone nem endereço completo. Se você permitir que o navegador mostre
          sua localização no mapa, ela é usada só no seu aparelho para marcar onde você está e não é
          enviada ao SIMUL (o mapa apenas baixa do OpenStreetMap as imagens daquela região).
        </p>
      </section>

      <section id="base-legal" className="legal__secao">
        <h2>3. O que nos permite usar os dados</h2>
        <p>
          A Lei Geral de Proteção de Dados (LGPD) só permite usar dados pessoais com um motivo
          válido. Os nossos são:
        </p>
        <ul>
          <li>
            <strong>Prestar o serviço que você pediu</strong>: sem nome, e-mail e bairro não há como
            criar sua conta e mandar seus lembretes.
          </li>
          <li>
            <strong>Seu consentimento</strong>: para as notificações no navegador, que só são
            ligadas quando você autoriza. Você pode desligar a qualquer momento.
          </li>
          <li>
            <strong>Segurança</strong>: os registros de acesso ajudam a proteger o site e quem usa
            ele.
          </li>
          <li>
            <strong>Obrigação legal</strong>: se uma autoridade pedir dados nos termos da lei.
          </li>
        </ul>
      </section>

      <section id="compartilhamento" className="legal__secao">
        <h2>4. Com quem compartilhamos</h2>
        <p>
          Não vendemos nem alugamos seus dados. Para o site funcionar, usamos alguns serviços de
          outras empresas, que recebem apenas o necessário:
        </p>
        <ul>
          <li>
            <strong>Render</strong>: hospeda o site e o banco de dados.
          </li>
          <li>
            <strong>Brevo</strong>: entrega os e-mails de confirmação, de recuperação de senha e os
            lembretes. Recebe seu nome, seu e-mail e o texto da mensagem.
          </li>
          <li>
            <strong>OpenStreetMap</strong>: fornece o mapa e localiza os bairros. Recebe o endereço
            IP de quem abre o mapa e o nome do bairro pesquisado.
          </li>
          <li>
            <strong>Google Fonts</strong>: fornece o tipo de letra do site. Recebe o endereço IP de
            quem visita.
          </li>
          <li>
            <strong>Serviço de notificações do seu navegador</strong> (Google, Mozilla, Apple ou
            Microsoft): entrega as notificações, só se você as ativar.
          </li>
        </ul>
        <p>
          Algumas dessas empresas têm servidores fora do Brasil. Elas seguem regras próprias de
          proteção de dados, e usamos apenas o mínimo necessário de cada uma.
        </p>
      </section>

      <section id="armazenamento" className="legal__secao">
        <h2>5. Cookies e armazenamento no navegador</h2>
        <p>
          O SIMUL <strong>não usa cookies de propaganda, de rastreamento nem de estatística</strong>
          . Usamos só o armazenamento do seu navegador para o site funcionar:
        </p>
        <ul>
          <li>
            <strong>Sessão de login</strong>: mantém você conectado e some ao fechar a aba (ou
            depois de 1 hora).
          </li>
          <li>
            <strong>Tema claro ou escuro</strong>: lembra a sua escolha.
          </li>
          <li>
            <strong>Missão da semana do guia</strong>: guarda o seu progresso no jogo.
          </li>
          <li>
            <strong>Aviso de cookies</strong>: lembra que você já viu o aviso.
          </li>
        </ul>
        <p>
          Como tudo isso é necessário para o funcionamento, não pedimos autorização, apenas
          avisamos. Você pode apagar esses dados quando quiser nas configurações do navegador.
        </p>
      </section>

      <section id="tempo" className="legal__secao">
        <h2>6. Por quanto tempo guardamos</h2>
        <ul>
          <li>Seus dados ficam guardados enquanto a sua conta existir.</li>
          <li>
            Quando você <strong>exclui a conta</strong>, apagamos na hora a conta, o lembrete, as
            inscrições do navegador e o histórico de avisos.
          </li>
          <li>
            Os links enviados por e-mail valem por pouco tempo: 24 horas para confirmar o e-mail e 1
            hora para trocar a senha.
          </li>
          <li>
            Os registros de acesso ficam com a empresa de hospedagem pelo prazo que ela define e que
            a lei exige.
          </li>
        </ul>
      </section>

      <section id="seguranca" className="legal__secao">
        <h2>7. Como protegemos</h2>
        <ul>
          <li>Todo o tráfego entre você e o site é criptografado (HTTPS).</li>
          <li>
            O <strong>e-mail fica criptografado</strong> no banco de dados. Sem a chave, que fica
            separada do banco, ninguém consegue lê-lo.
          </li>
          <li>
            A <strong>senha não é guardada</strong>, só um resumo que não pode ser transformado de
            volta na senha.
          </li>
          <li>A sessão de login expira em 1 hora.</li>
          <li>
            Só a administração do sistema acessa o painel de gestão, e ele não mostra e-mails.
          </li>
        </ul>
        <p>
          Se acontecer algum incidente de segurança que possa trazer risco a você, vamos avisar por
          e-mail e comunicar a Autoridade Nacional de Proteção de Dados (ANPD), como a lei manda.
        </p>
      </section>

      <section id="direitos" className="legal__secao">
        <h2>8. Seus direitos</h2>
        <p>A LGPD garante a você, sobre os seus dados:</p>
        <ul>
          <li>
            <strong>Saber e ver</strong> quais dados temos: use “Baixar meus dados” em{' '}
            <Link to="/minha-conta">Minha conta</Link>.
          </li>
          <li>
            <strong>Levar seus dados</strong> para outro serviço: o mesmo arquivo serve para isso.
          </li>
          <li>
            <strong>Corrigir</strong> dados errados: troque o bairro em{' '}
            <Link to="/preferencias">Meus lembretes</Link> ou peça a correção por e-mail.
          </li>
          <li>
            <strong>Apagar</strong> seus dados: use “Excluir minha conta” em Minha conta.
          </li>
          <li>
            <strong>Retirar uma autorização</strong>: desligue as notificações em Meus lembretes.
          </li>
          <li>
            <strong>Reclamar</strong> com a Autoridade Nacional de Proteção de Dados, pelo site{' '}
            <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">
              gov.br/anpd
            </a>
            .
          </li>
        </ul>
        <p>
          Pedidos por e-mail são respondidos em até 15 dias. Para sua segurança, podemos pedir que
          você confirme que é o dono da conta.
        </p>
      </section>

      <section id="menores" className="legal__secao">
        <h2>9. Crianças e adolescentes</h2>
        <p>
          A consulta da coleta e o guia de descarte são livres para todas as idades e não pedem
          nenhum dado. Para criar uma conta, quem tem menos de 18 anos deve fazer isso junto com um
          responsável.
        </p>
      </section>

      <section id="mudancas" className="legal__secao">
        <h2>10. Mudanças nesta política</h2>
        <p>
          Se mudarmos algo importante, a data no topo desta página muda e, no seu próximo acesso,
          pedimos que você leia e aceite a nova versão.
        </p>
      </section>

      <p className="legal__contato">
        <Icone nome="email" tamanho={18} />
        Dúvidas? Escreva para <a href={`mailto:${EMAIL_CONTATO}`}>{EMAIL_CONTATO}</a>.
      </p>
    </main>
  )
}

export default PrivacidadePage
