# SIMUL — Sistema Integrado de Monitoramento Urbano de Limpeza

Plataforma web para o morador consultar **dias, horários e área da coleta seletiva** do seu bairro, receber **lembretes automáticos** antes da coleta e aprender a **separar o lixo** com um guia interativo. A prefeitura (ou a equipe responsável) mantém rotas, bairros e horários por um **painel administrativo**.

> Projeto acadêmico do curso de Análise e Desenvolvimento de Sistemas — Faculdade SENAI FATESG, Goiânia, 2026.

---

## Sumário

1. [O problema e a proposta](#1-o-problema-e-a-proposta)
2. [O que o sistema faz](#2-o-que-o-sistema-faz)
3. [Escopo](#3-escopo)
4. [Tecnologias](#4-tecnologias)
5. [Arquitetura](#5-arquitetura)
6. [Estrutura do repositório](#6-estrutura-do-repositório)
7. [Como o sistema se comporta](#7-como-o-sistema-se-comporta)
8. [Lembretes: como funcionam por dentro](#8-lembretes-como-funcionam-por-dentro)
9. [Segurança](#9-segurança)
10. [API](#10-api)
11. [Banco de dados](#11-banco-de-dados)
12. [Front-end](#12-front-end)
13. [Executando localmente](#13-executando-localmente)
14. [Testes e integração contínua](#14-testes-e-integração-contínua)
15. [Deploy na Render](#15-deploy-na-render)
16. [Variáveis de ambiente](#16-variáveis-de-ambiente)
17. [Problemas comuns](#17-problemas-comuns)
18. [Padrões de código](#18-padrões-de-código)
19. [Fora do escopo e próximos passos](#19-fora-do-escopo-e-próximos-passos)
20. [Equipe](#20-equipe)

---

## 1. O problema e a proposta

Moradores nem sempre sabem em que dia e horário a coleta seletiva passa no seu bairro. Quando a informação está espalhada ou é difícil de achar, o reciclável é colocado na rua no dia errado, acaba indo para o lixo comum ou fica acumulado em casa.

O SIMUL reúne essa informação num **site responsivo** (computador e celular) e vai além da consulta:

- **lembra** o morador antes da coleta, por e-mail ou notificação do navegador;
- **ensina** a separar os materiais, com um guia em formato de jogo;
- **dá ao poder público** um painel simples para manter rotas, bairros e horários.

A entrega é uma **plataforma web**. Não há aplicativo nativo.

---

## 2. O que o sistema faz

### Para qualquer pessoa (sem login)

| Funcionalidade | Onde |
|---|---|
| Consultar a coleta: escolher cidade e bairro e ver a rota, os dias, os horários e a **próxima coleta** | Página inicial `/` |
| Ver o bairro no **mapa** (OpenStreetMap), com o contorno da área e a localização do próprio morador | Página inicial |
| Aprender a separar o lixo: jogo "Para onde vai?", cartões dos materiais, "mito ou verdade" e missão da semana | `/guia-de-descarte` |
| Criar conta, confirmar o e-mail, entrar e recuperar a senha | `/cadastro`, `/login`, `/recuperar-senha` |
| Alternar tema claro/escuro | Cabeçalho |

### Para o morador logado

| Funcionalidade | Onde |
|---|---|
| Escolher o bairro do lembrete, os canais (e-mail e/ou navegador) e a antecedência (0 a 72 horas) | `/preferencias` |
| Ativar notificações do navegador (Web Push) | `/preferencias` |
| Ver os próprios dados e o resumo do lembrete | `/minha-conta` |

### Para o administrador (perfil ADMIN)

| Funcionalidade | Onde |
|---|---|
| Visão geral: indicadores, pendências (bairros sem contorno, rotas sem horário etc.) e coletas da semana | `/admin` |
| Rotas: cartões com o padrão de cada rota; ao abrir, **dias e horário**, **bairros (seleção múltipla com pesquisa, cadastro e movimentação)** e nome, com dicas para o administrador | `/admin/rotas` |
| Áreas atendidas: tabela com busca e filtros, **desenho do contorno no mapa** e **importação dos contornos do OpenStreetMap** de uma vez | `/admin/areas` |
| Agenda da semana: quais rotas passam em cada dia; toque abre a rota; **alteração de horário de várias rotas** | `/admin/cronogramas` |

---

## 3. Escopo

**Dentro do escopo:** consulta pública por cidade e bairro; rota, dias e horários; cadastro, confirmação de e-mail e login com JWT; preferências de lembrete; envio automático com deduplicação e novas tentativas; guia de descarte; mapa OpenStreetMap com a localização do morador; painel administrativo.

**Canais de lembrete:** o **e-mail é o canal oficial**. O **Web Push** (notificação do navegador) é um canal **complementar**: foi implementado e funciona, mas depende de o morador permitir notificações no navegador.

**Fora do escopo:** rastreamento do caminhão em tempo real, GPS de veículos, alerta por aproximação do caminhão e aplicativo mobile nativo. O mapa mostra a **área** atendida e a localização do **morador**; ele não acompanha caminhões.

---

## 4. Tecnologias

| Camada | Tecnologia |
|---|---|
| Back-end | Java 21, Spring Boot 4.1 (Web MVC, Security, Data JPA, Validation, Mail, OAuth2 Resource Server), Maven Wrapper, Lombok |
| Banco | PostgreSQL, migrations com Flyway, Hibernate em modo `validate` |
| Autenticação | JWT HS256 (sem sessão no servidor) e senhas com BCrypt |
| E-mail | SMTP (local) ou API HTTPS do **Brevo** (produção na Render) |
| Web Push | `nl.martijndwars:web-push` com chaves VAPID e Bouncy Castle |
| Front-end | React 19, Vite 8, React Router 7 |
| Mapas | Leaflet + React-Leaflet, tiles do OpenStreetMap, Geoman (desenho do contorno no admin) e Nominatim (localizar bairros) |
| Infra | Docker (back-end), Render (web service + static site), GitHub Actions (CI) |

---

## 5. Arquitetura

### 5.1 Visão geral

```text
 Navegador (React + Vite)
        │  HTTPS / JSON  (JWT no cabeçalho Authorization)
        ▼
 API Spring Boot  ──────────────►  PostgreSQL (Flyway)
        │
        ├── Agendador (a cada minuto) ──► lembretes
        │        ├── EmailGateway ──► SMTP ou API do Brevo
        │        └── Web Push ─────► serviço de push do navegador (VAPID)
        │
        └── Front-end consulta direto o Nominatim (OpenStreetMap) para localizar bairros
```

### 5.2 Monólito modular

O back-end é **um único serviço** organizado por **domínio de negócio**. Para o tamanho do projeto, isso dá o melhor equilíbrio: um deploy só, uma transação só, e ainda assim cada assunto fica isolado na sua pasta.

```text
business/
  cidade/        cidades atendidas e indicadores do painel por cidade
  usuario/       cadastro, login, confirmação de e-mail, recuperação de senha
  rota/          rotas (sempre de uma cidade), áreas atendidas (bairros) e consulta pública
  cronograma/    coletas por rota, dia e turno (horário opcional)
  notificacao/   preferências, histórico, agendador, e-mail e Web Push
core/
  config/        CORS, relógio, Web Push, links para o front
  exception/     exceções de negócio e o GlobalExceptionHandler
  security/      JWT, BCrypt, regras de acesso, tokens dos links
  status/        GET /api/status (verificação de saúde)
  util/          utilidades de texto
```

### 5.3 Camadas

Cada domínio segue a mesma divisão:

```text
Controller  →  Service (interface + Impl)  →  Validation / Mapper  →  Repository  →  Model
```

| Camada | Responsabilidade |
|---|---|
| `controller` | Recebe a requisição HTTP, aplica `@Valid` e a regra de acesso. **Nunca acessa o repositório.** |
| `dto` | `record`s de entrada e saída, separados. Nunca expõem senha nem hash. |
| `service` | Regras de negócio. A interface documenta o contrato; a `Impl` implementa. |
| `validation` | Regras reutilizáveis ("já existe?", "pertence ao usuário?") que lançam exceções de negócio. |
| `mapper` | Conversão entre entidade e DTO. |
| `repository` | Spring Data JPA. |
| `model` | Entidades JPA e enums. |

Toda exceção de negócio vive em `core/exception` e é convertida pelo `GlobalExceptionHandler` em um **ProblemDetail** (RFC 9457) com o status certo (400, 401, 403, 404, 409 ou 503). Uma regra de negócio nunca vira erro 500.

### 5.4 Padrão Strategy nas notificações

Cada canal é uma `NotificacaoStrategy` (`EmailNotificacaoStrategy`, `WebPushNotificacaoStrategy`). O `EnvioNotificacaoService` recebe todas as estratégias e escolhe pela enum `CanalNotificacao`. Para criar um canal novo basta outra classe `@Component` que implemente a interface; o fluxo principal não muda.

O transporte do e-mail também é trocável: a interface `EmailGateway` tem as implementações `SmtpEmailGateway` e `BrevoEmailGateway`, escolhidas pela variável `SIMUL_MAIL_PROVEDOR`.

---

## 6. Estrutura do repositório

```text
simul-system/
├── .github/workflows/ci.yml      CI: testes do back-end, lint e build do front-end
├── .editorconfig                 indentação e fim de linha para todos os editores
├── README.md
├── docs/
│   ├── levantamento-dados-municipais.md   levantamento das fontes das prefeituras e pendências
│   └── importacao/                        scripts e dados que geraram a V25
├── backend/
│   ├── Dockerfile                build em duas etapas, executa sem root
│   ├── pom.xml
│   ├── mvnw, mvnw.cmd, .mvn/     Maven Wrapper (não precisa instalar o Maven)
│   └── src/
│       ├── main/java/com/simulsystem/backend/
│       │   ├── business/{cidade,usuario,rota,cronograma,notificacao,privacidade,institucional}/
│       │   └── core/{config,exception,migracao,security,status,util}/
│       ├── main/resources/
│       │   ├── application.properties
│       │   └── db/migration/      V1 … V25 (Flyway; V21 é Java, em core/migracao)
│       └── test/                  testes JUnit 5 + Mockito
└── frontend/
    ├── .prettierrc.json           estilo de formatação do front-end
    ├── index.html                 aplica o tema salvo antes de o React carregar
    ├── public/sw.js               service worker que exibe as notificações Web Push
    └── src/
        ├── App.jsx                rotas e tratamento de sessão expirada
        ├── components/            componentes (admin, coleta, form, guia, auth…)
        ├── hooks/                 tema claro/escuro, cores do mapa e cidade do painel admin
        ├── pages/                 uma página por rota (admin em pages/admin)
        ├── services/              ÚNICO lugar que chama a API (via apiRequest)
        ├── styles/                tokens do design system e CSS por área
        └── utils/                 funções puras (coleta, cronogramas, áreas, texto, guia)
```

---

## 7. Como o sistema se comporta

### 7.1 Consulta pública

1. A página inicial pede `GET /api/rotas/areas`, que devolve **só cidade e bairro de rotas ativas**.
2. O morador escolhe a cidade e o bairro (com busca que ignora acentos).
3. O front pede `GET /api/rotas/consulta?cidade=…&bairro=…` e recebe a rota, as **coletas ativas** (dia + turno, com horário só quando a prefeitura informa), o **tipo de coleta** e o contorno do bairro (se houver).
4. A tela mostra os dias da semana com coleta, o horário ou o turno e a **próxima coleta**, calculada no navegador. Quando a fonte informa só o turno, a tela mostra o turno com a **faixa média da cidade** ("Turno noturno · aprox. 19:00 – 04:00", informada pela operadora) e avisa que o horário exato varia por rua; a orientação é deixar o lixo na calçada até 1 hora antes do início do turno. O título diz o tipo: "Coleta seletiva em …" (Goiânia) ou "Coleta convencional em …" (Aparecida de Goiânia, Trindade e Senador Canedo, que só têm a coleta de lixo comum cadastrada).
5. O mapa enquadra o **contorno salvo no SIMUL**. Se o bairro ainda não tem contorno, usa o que o **Nominatim** (OpenStreetMap) encontrar. Se nada for encontrado, avisa que não conseguiu localizar a região.
6. O morador pode mostrar a própria localização no mapa (geolocalização do navegador, só com permissão dele).

Bairro de **rota inativa** não aparece na lista e a consulta direta responde 404.

### 7.2 Cadastro e confirmação de e-mail

1. `POST /api/usuarios` cria a conta com perfil **USUARIO**, e-mail em minúsculas e senha em BCrypt (8 a 72 caracteres, o limite do BCrypt).
2. O sistema gera um **token aleatório de 256 bits**, guarda **apenas o hash SHA-256** e envia o link `…/verificar-email?token=…` (válido por 24 horas, configurável).
3. Ao abrir o link, `POST /api/usuarios/verificar-email` confirma o e-mail e invalida o token (uso único).
4. **Só é possível entrar depois de confirmar o e-mail.** Na tela de login, quem ainda não confirmou vê a opção "Reenviar e-mail de confirmação".
5. Se o envio do e-mail falhar no cadastro, a **conta continua criada**: a pessoa reenvia a confirmação pelo login.

### 7.3 Login e sessão

- `POST /api/auth/login` devolve um **JWT** válido por **1 hora** (configurável). O front guarda o token na `sessionStorage`, então ele some ao fechar a aba.
- E-mail ou senha errados → 401. E-mail não confirmado → 403 ("E-mail não verificado").
- Quando o token vence, a primeira chamada recebe 401: o front **encerra a sessão e leva ao login** com o aviso "Sessão encerrada".

### 7.4 Recuperação de senha

1. `POST /api/usuarios/recuperar-senha` responde **sempre a mesma mensagem neutra**, exista ou não a conta, para não revelar quem é cadastrado.
2. Se a conta existe e está ativa, um link `…/redefinir-senha?token=…` é enviado (válido por 60 minutos e de uso único; só o mais recente vale).
3. `POST /api/usuarios/redefinir-senha` troca a senha (com confirmação) e invalida o token.

### 7.5 Preferências de lembrete

- Cada usuário tem **uma** preferência: o **bairro** (a rota e os horários vêm dele), e-mail ligado/desligado, navegador ligado/desligado e antecedência de **0 a 72 horas**.
- Ligar o canal "navegador" pede permissão de notificação, registra o `sw.js` e inscreve o navegador (`POST /api/notificacoes/push/subscriptions`). Um navegador só pode estar ligado a **uma conta**.

### 7.6 Guia de descarte

Página pública e lúdica, com conteúdo todo em `frontend/src/utils/guiaConteudo.js` (a equipe pode revisar o texto sem mexer nos componentes):

- **"Para onde vai?"**: 8 itens sorteados entre 16. A pessoa toca na lixeira certa (cores da Resolução CONAMA 275/2001), recebe a explicação e, no fim, um nível e o impacto ("7 itens foram para o lugar certo em vez do aterro").
- **4 passos** para separar.
- **Cartões dos materiais**, com o que vai e o que não vai em cada lixeira.
- **Mito ou verdade**: 5 afirmações com explicação.
- **Missão da semana**: hábitos para marcar, salvos no próprio navegador e reiniciados toda segunda-feira.

### 7.7 Painel administrativo

O painel é organizado **por cidade**. O menu tem Visão geral, Rotas, Áreas atendidas e Agenda da semana; a edição do "Quem somos" fica fora do menu e é aberta pelo botão **Editar esta página**, que só o administrador logado vê em `/quem-somos`. No topo de Visão geral, Rotas, Áreas atendidas e Agenda da semana fica o **seletor de cidade**, com o resumo dela (bairros, rotas ativas e coletas na semana). A cidade escolhida fica salva no navegador (`localStorage`, chave `simul.admin.cidade`) e vale para todas as seções; ao trocar, a seção recarrega só com os dados da nova cidade.

- **Visão geral:** indicadores da cidade, **Faixa dos turnos** (início e fim médios do turno diurno e do noturno na cidade, com a fonte; editável em `PUT /api/admin/cidades/{id}/turnos`), "Precisa de atenção" (áreas sem contorno, rotas ativas sem dia de coleta, rotas ativas sem bairros, bairros em rotas inativas), "O que a prefeitura não informa" (coletas só com turno e rotas sem tipo de coleta na fonte), a fonte dos dados da cidade e a tabela **Cidades atendidas**, que compara as cidades e permite trocar de cidade.
- **Rotas:** só as rotas da cidade. Cada rota é um padrão de coleta (**dias + turno**, horário opcional) e pertence a **uma única cidade**, definida na criação e que não muda depois. Só bairros da mesma cidade entram na rota; o back-end recusa com 409 qualquer tentativa de misturar cidades. A semana é editada **por turno** (bloco Diurno e bloco Noturno; um mesmo dia pode ter os dois) e salva de uma vez por `PUT /api/admin/cronogramas/rota/{rotaId}`. O horário só é preenchido quando a prefeitura informa ("A prefeitura informa o horário deste turno"). O tipo de coleta (seletiva ou não informado) e a fonte aparecem na rota. Desativar uma rota pede confirmação; **nada é apagado**. A preferência do morador guarda o **bairro** (V20): ao mover um bairro, os lembretes passam a seguir a nova rota sem ação do morador.
- **Áreas atendidas:** só os bairros da cidade. A cidade do bairro é a da rota (campo fixo no formulário); bairro é único por cidade. O contorno é desenhado no mapa (Polygon/MultiPolygon GeoJSON) ou buscado no OpenStreetMap ("Buscar contornos no mapa").
- **Agenda da semana:** coletas da cidade por dia, com o turno (e o horário, se houver). "Mudar horário de várias rotas" escolhe o **turno** e as rotas e aplica o novo horário — ou volta a mostrar só o turno — em todas de uma vez (`PUT /api/admin/cronogramas/lote/horario`, tudo ou nada). Só pode haver **uma coleta ativa por rota, dia e turno**.

### 7.8 Quando o servidor está "acordando"

Na hospedagem gratuita o back-end dorme depois de 15 minutos sem uso e a primeira resposta pode levar perto de 1 minuto. Quando uma requisição passa de 6 segundos, o site mostra "Conectando ao servidor…". O limite de espera é de 75 segundos; depois disso aparece uma mensagem clara para tentar de novo.

---

## 8. Lembretes: como funcionam por dentro

### 8.1 O ciclo

O `NotificacaoScheduler` roda **a cada minuto** (cron `0 * * * * *`, fuso `America/Sao_Paulo`) quando `NOTIFICACAO_SCHEDULER_ENABLED=true`. Cada ciclo tem duas etapas independentes; um erro numa não impede a outra:

1. **Lembretes do minuto** (`ProcessamentoNotificacaoLoteService`)
2. **Novas tentativas** das falhas (`ProcessamentoRetryNotificacaoService`)

### 8.2 Quando um lembrete "vence"

Para cada preferência elegível (usuário ativo, bairro numa rota ativa e pelo menos um canal ligado):

```text
coleta alvo = minuto atual (sem segundos) + antecedência
```

O lembrete vence se a rota tem um **cronograma ativo** naquele dia da semana e com aquele **horário de início**. Quando a prefeitura informa só o turno, o cálculo usa o **início do turno na cidade** (faixa da operadora, por exemplo 19:00 no noturno de Goiânia). Sem faixa cadastrada, usa a referência do turno: diurno 06:00, noturno 18:00 (`Turno.inicioReferencia`).

> Exemplo: coleta na quarta às 07:00 e antecedência de 48 h → o lembrete sai na **segunda às 07:00**.
> Calcular a partir da coleta alvo (e não da "próxima coleta a partir de agora") evita perder o lembrete quando a antecedência é maior que o intervalo entre duas coletas.

### 8.3 Sem lembrete duplicado

Antes de enviar, o sistema **reserva** o envio em `historico_notificacoes`. Uma restrição única em `(usuario, rota, data_hora_coleta, canal)` garante que, mesmo com o ciclo rodando duas vezes, cada lembrete sai **uma vez por canal**.

### 8.4 Situações e novas tentativas

| Situação | Significado |
|---|---|
| `PENDENTE` | reservado, sendo enviado |
| `ENVIADO` | entregue ao provedor |
| `FALHA` | não foi entregue; nova tentativa em **5 minutos**, até **3 tentativas** |
| `CANCELADO` | não será reenviado: o usuário desligou o canal, trocou de rota, ou a rota/conta foi desativada |

A nova tentativa usa o **mesmo canal** da falha (e-mail ou Web Push) e confere a configuração **atual** do usuário antes de reenviar.

### 8.5 Texto

> Assunto: **SIMUL - Lembrete de coleta**
> Com horário: "Olá, Ana! A coleta seletiva da rota Goiânia - Diurna (seg) está prevista para 30/11/2026 às 07:00."
> Só com turno: "Olá, Ana! A coleta convencional da rota Trindade - Noturna (seg) está prevista para 30/11/2026, no turno noturno (aprox. das 18:00 às 03:00; o horário exato varia por rua)."

O texto diz "coleta seletiva" ou "coleta convencional" conforme o tipo da rota (`SELETIVA`, `CONVENCIONAL`; `NAO_INFORMADO` vira só "coleta").

No Web Push, o assunto vira o título da notificação e o texto vira o corpo.

---

## 9. Segurança

| Proteção | Como |
|---|---|
| Senhas | BCrypt (custo 10). Nunca devolvidas pela API. |
| E-mail no banco | Criptografado com **AES-256-GCM** (IV aleatório a cada gravação). Login e unicidade usam o índice `email_hash` (**HMAC-SHA256**), sem decifrar a tabela. As duas chaves são derivadas de `SIMUL_DADOS_CHAVE`; sem ela, quem copiar o banco não lê os e-mails. A conversão é transparente (`EmailCriptografadoConverter`). |
| Fotos enviadas | Tipo conferido pelos primeiros bytes do arquivo (só JPEG, PNG e WebP; SVG recusado), até 3 MB. O front reduz para 1600 px e descarta metadados da câmera. |
| Autenticação | JWT HS256 sem sessão no servidor. `JWT_SECRET` em Base64 com no mínimo 256 bits; a aplicação não sobe sem ele. |
| Perfis | `USUARIO` e `ADMIN`, no claim `roles`. Endpoints de admin exigem `hasRole('ADMIN')`. O cadastro público sempre cria `USUARIO`. |
| Links por e-mail | Token aleatório de 256 bits, guardado só como hash SHA-256, com validade e uso único. |
| Contas | Resposta neutra em "esqueci minha senha" e "reenviar confirmação". Conta inativa não entra. |
| Erros | 401/403 em ProblemDetail. Exceções de negócio com status próprio; causas técnicas (como falha de SMTP) ficam só no log. |
| CORS | Só as origens de `SIMUL_CORS_ALLOWED_ORIGINS`, apenas em `/api/**`. |
| Segredos | Sempre em variáveis de ambiente; nenhum segredo no repositório. |
| LGPD | Aceite dos termos registrado (data e versão), cópia dos dados em JSON, exclusão da conta com senha, aviso de armazenamento essencial (sem cookies de rastreamento). Ver [9.1](#91-lgpd-e-privacidade). |
| Banco | Restrições no próprio PostgreSQL (ver [11.3](#113-regras-garantidas-pelo-banco)). |

### 9.1 LGPD e privacidade

| Direito ou obrigação | Onde está |
|---|---|
| Transparência | `/privacidade` (Política de Privacidade e cookies) e `/termos` (Termos de Uso), em linguagem simples, com link no rodapé |
| Registro do consentimento | Cadastro exige aceite; `usuarios.termos_aceitos_em` e `termos_versao` (V22). Ao mudar `VERSAO_TERMOS` em `frontend/src/conteudo/legal.js`, quem já tem conta recebe o pedido de novo aceite ao entrar |
| Acesso e portabilidade | Minha conta → "Baixar meus dados" (`GET /api/usuarios/me/dados`, JSON) |
| Eliminação | Minha conta → "Excluir minha conta" (`DELETE /api/usuarios/me`, pede a senha): apaga histórico, preferência, navegadores, links e a conta. A conta ADMIN não pode ser excluída por aqui |
| Revogação do consentimento | Desligar as notificações em Meus lembretes |
| Cookies | Só armazenamento essencial (sessão, tema, progresso do guia); aviso único na primeira visita |
| Segurança | E-mail criptografado, senha com BCrypt, HTTPS, sessão de 1 hora |

---

## 10. API

Base local: `http://localhost:8080`. Erros seguem o formato ProblemDetail:

```json
{ "type": "about:blank", "title": "Dados inválidos", "status": 400,
  "detail": "A senha deve possuir entre 8 e 72 caracteres.",
  "erros": { "senha": "A senha deve possuir entre 8 e 72 caracteres." } }
```

### 10.1 Públicos

| Método | Caminho | O que faz |
|---|---|---|
| GET | `/api/status` | Verificação de saúde: `{"status":"ok"}` |
| GET | `/api/rotas/areas` | Cidades e bairros de rotas ativas |
| GET | `/api/rotas/consulta?cidade=&bairro=` | Rota, contorno e horários ativos do bairro |
| POST | `/api/usuarios` | Cadastro |
| POST | `/api/usuarios/verificar-email` | Confirma o e-mail pelo token |
| POST | `/api/usuarios/reenviar-verificacao` | Reenvia o link (resposta neutra) |
| POST | `/api/usuarios/recuperar-senha` | Envia o link de redefinição (resposta neutra) |
| POST | `/api/usuarios/redefinir-senha` | Troca a senha pelo token |
| POST | `/api/auth/login` | Devolve o JWT |
| GET | `/api/notificacoes/push/public-key` | Chave pública VAPID |
| GET | `/api/institucional` | Textos, fotos da faculdade e equipe do "Quem somos" |
| GET | `/api/institucional/imagens/{id}` | Arquivo da imagem (cache de 30 dias) |

### 10.2 Usuário logado

| Método | Caminho | O que faz |
|---|---|---|
| GET | `/api/usuarios/me` | Dados do usuário logado |
| GET | `/api/usuarios/me/dados` | Cópia dos dados pessoais (LGPD) |
| DELETE | `/api/usuarios/me` | Excluir a conta (corpo: `{ "senha": "..." }`) |
| PUT | `/api/usuarios/me/termos` | Aceitar a versão atual dos termos (corpo: `{ "versao": "2026-11" }`) |
| GET / POST / PUT | `/api/notificacoes/preferencias` | Ler, criar e alterar a preferência de lembrete |
| GET / POST | `/api/notificacoes/push/subscriptions` | Listar e inscrever navegadores |
| DELETE | `/api/notificacoes/push/subscriptions?endpoint=` | Cancelar a inscrição do navegador |

### 10.3 Administrador

| Método | Caminho | O que faz |
|---|---|---|
| GET | `/api/admin/cidades` | Cidades com indicadores (rotas, bairros, coletas, pendências) |
| GET | `/api/admin/cidades/{id}` | Uma cidade com indicadores |
| PUT | `/api/admin/cidades/{id}/turnos` | Faixa média do turno diurno e do noturno na cidade (e a fonte) |
| GET / POST | `/api/admin/rotas` | Listar (`?cidadeId=` filtra) e criar rotas (`cidadeId` obrigatório, `tipoColeta` opcional) |
| PUT | `/api/admin/rotas/{id}` | Editar nome, descrição e tipo (a cidade não muda: 409) |
| PATCH | `/api/admin/rotas/{id}/status?ativo=` | Ativar/desativar |
| GET / POST | `/api/admin/rotas/areas` | Listar (`?cidadeId=` filtra) e criar áreas (a cidade é a da rota) |
| PUT | `/api/admin/rotas/areas/{id}` | Editar bairro e rota (rota de outra cidade: 409) |
| PUT | `/api/admin/rotas/areas/{id}/geometria` | Salvar o contorno GeoJSON |
| PUT | `/api/admin/rotas/{id}/bairros` | Cadastrar bairros novos na rota e mover para ela os de outra rota da mesma cidade |
| GET / POST | `/api/admin/cronogramas` | Listar (`?cidadeId=` filtra) e criar coletas (dia + `turno`, horário opcional) |
| PUT | `/api/admin/cronogramas/{id}` | Editar um horário |
| PATCH | `/api/admin/cronogramas/{id}/status?ativo=` | Ativar/desativar |
| PUT | `/api/admin/cronogramas/lote/horario` | Mudar início e fim de várias coletas, ou limpar o horário (tudo ou nada) |
| PUT | `/api/admin/cronogramas/rota/{rotaId}` | Definir dias e turnos da semana da rota (tudo ou nada) |
| GET | `/api/admin/usuarios/verificar-acesso` | 204 para ADMIN (usado nos testes de segurança) |
| PUT | `/api/admin/institucional` | Textos do "Quem somos" |
| POST | `/api/admin/institucional/fotos` | Nova foto da faculdade (multipart: `arquivo`, `legenda`) |
| PUT / DELETE | `/api/admin/institucional/fotos/{id}` | Trocar a legenda / remover |
| PUT | `/api/admin/institucional/fotos/ordem` | Nova ordem da galeria (`{ "ids": [...] }`) |
| POST | `/api/admin/institucional/integrantes` | Novo integrante |
| PUT / DELETE | `/api/admin/institucional/integrantes/{id}` | Editar / remover |
| PUT / DELETE | `/api/admin/institucional/integrantes/{id}/foto` | Trocar (multipart `arquivo`) / tirar a foto |
| PUT | `/api/admin/institucional/integrantes/ordem` | Nova ordem da equipe |

Exemplo do lote:

```json
PUT /api/admin/cronogramas/lote/horario
{ "ids": [1, 2, 3], "horarioInicio": "19:00", "horarioFim": "23:59" }
```

---

## 11. Banco de dados

### 11.1 Regras gerais

- `spring.jpa.hibernate.ddl-auto=validate`: o Hibernate **só confere** o schema; quem cria e altera é o **Flyway**.
- Toda mudança estrutural é uma **migration nova**. **Nunca edite uma migration já aplicada**: o Flyway confere o checksum e a aplicação deixa de subir (ver [17](#17-problemas-comuns)).

### 11.2 Migrations

| Versão | Conteúdo |
|---|---|
| V1 | `usuarios` |
| V2 | `rotas` e `areas_atendidas` |
| V3 | `cronogramas` |
| V4 | `preferencias_notificacao` |
| V5 | rota na preferência |
| V6 | Web Push na preferência |
| V7 | `historico_notificacoes` |
| V8 | campos de nova tentativa |
| V9 | contorno GeoJSON das áreas |
| V10 | `push_subscriptions` |
| V11 | `email_verificado` |
| V12 | `tokens_verificacao_email` |
| V13 | `tokens_recuperacao_senha` |
| V14 | horários sem segundos |
| V15 | carga de Senador Canedo (109 bairros) |
| V16 | conta admin de teste (legado) |
| V17 | integridade e índices |
| V18 | consolidação das rotas de Senador Canedo (109 → 5) |
| V19 | conta admin fixa do sistema |
| V20 | preferência ligada ao **bairro** (`area_atendida_id`); a rota passa a vir do bairro |
| V21 | **migration em Java** (`core/migracao/V21__CriptografarEmails`): cifra os e-mails existentes e cria `email_hash` único |
| V22 | registro do aceite dos termos (`termos_aceitos_em`, `termos_versao`) |
| V23 | "Quem somos": `conteudo_institucional`, `imagens` (BYTEA), `fotos_instituicao`, `integrantes` |
| V24 | tabela `cidades`; `rotas.cidade_id`, `tipo_coleta`, `fonte`; `areas_atendidas.cidade_id` com FK composta para a rota da mesma cidade; `cronogramas.turno` e horário opcional; os horários-padrão da carga de Senador Canedo viram turno sem horário |
| V26 | faixa média dos turnos por cidade (`cidades.diurno_*`, `noturno_*`, `fonte_turnos`) e tipo de coleta `CONVENCIONAL` para Aparecida de Goiânia, Trindade e Senador Canedo |
| V25 | importação das quatro cidades a partir das fontes municipais (gerada pelo levantamento; ver [docs/levantamento-dados-municipais.md](docs/levantamento-dados-municipais.md)) |

### 11.3 Regras garantidas pelo banco

| Regra | Como |
|---|---|
| E-mail único | índice único em `email_hash` (V21) |
| Um bairro por cidade | índice único em `(cidade_id, UPPER(bairro))` (V24) |
| Rota numa única cidade | `rotas.cidade_id NOT NULL` (V24) |
| Bairro só em rota da própria cidade | FK composta `areas_atendidas (rota_id, cidade_id) → rotas (id, cidade_id)` (V24) |
| Uma coleta **ativa** por rota, dia e turno | índice único parcial `(rota_id, dia_semana, turno) WHERE ativo` (V24) |
| Horário completo ou nenhum | `CHECK ((horario_inicio IS NULL) = (horario_fim IS NULL))` (V24) |
| Turno e tipo de coleta válidos | `CHECK` (V24) |
| Antecedência de 0 a 72 horas | `CHECK` |
| Canal e situação da notificação válidos | `CHECK` |
| Início do cronograma diferente do fim | `CHECK` (fim menor que o início é permitido: coleta que passa da meia-noite) |

### 11.4 Dados que já vêm no banco

As cidades, bairros, rotas e coletas vêm das fontes municipais de `Cidade.Bairros.Horarios.zip` (V15/V18 para a carga inicial de Senador Canedo e V25 para as quatro cidades). O levantamento completo, com padrões, inconsistências e pendências, está em [docs/levantamento-dados-municipais.md](docs/levantamento-dados-municipais.md).

| Cidade | Bairros | Rotas | Coletas na semana | Tipo de coleta | Turno diurno (média) | Turno noturno (média) | Operadora |
|---|---:|---:|---:|---|---|---|---|
| Goiânia | 492 | 18 | 30 | Seletiva | 07:00 – 16:00 | 19:00 – 04:00 | Consórcio LimpaGyn |
| Aparecida de Goiânia | 226 | 11 | 62 | Convencional | 06:00 – 16:00 | 18:00 – 03:00 | Consórcio Aparecida Limpa |
| Trindade | 120 | 19 | 51 | Convencional | 07:00 – 16:00 | 18:00 – 03:00 | Quebec Ambiental |
| Senador Canedo | 109 | 5 | 18 | Convencional | 06:00 – 16:00 | 18:00 – 03:00 | Prefeitura de Senador Canedo |
| **Total** | **947** | **53** | **161** | | | | |

- **Dias e turnos** vêm das fontes municipais (V25). **Nenhuma fonte informa o horário exato** de cada rota: as coletas guardam só o turno.
- A **faixa média dos turnos** (V26) foi definida pela equipe a partir das informações das operadoras e é mostrada como horário aproximado. O horário exato varia por rua; o painel permite corrigir a faixa e registrar o horário exato de uma rota quando a prefeitura divulgar.
- Cada **rota** é o grupo de bairros com **exatamente os mesmos dias e turnos** na cidade; ela não representa o trajeto do caminhão. Bairro que aparece em mais de um grupo da fonte recebe a soma dos dias (nada é descartado).
- Em Senador Canedo, os 109 bairros já cadastrados conferem com a imagem oficial (mesmas 5 rotas); as grafias com erro da imagem ("Fransciso", "Industrias", "Sitio") foram mantidas corretas como já estavam. Os horários 06:00–18:00 e 18:00–23:59 da carga antiga não vinham da prefeitura e viraram turno sem horário.

**Conta administrativa (V19):** `simul.sistema@gmail.com`, com senha combinada com a equipe (só o hash BCrypt fica no banco). Troque a senha pelo "Esqueci minha senha" depois da apresentação.

Para promover outra conta a admin (localmente):

```sql
UPDATE usuarios SET perfil = 'ADMIN' WHERE email = 'pessoa@exemplo.com';
```

Depois, saia e entre de novo para receber um JWT com o perfil novo.

---

## 12. Front-end

### 12.1 Rotas

| Caminho | Acesso | Página |
|---|---|---|
| `/` | público | Consulta da coleta |
| `/quem-somos`, `/termos`, `/privacidade` | público | Quem somos, Termos de Uso e Política de Privacidade |
| `/guia-de-descarte` | público | Guia interativo |
| `/cadastro`, `/login` | público | Criar conta e entrar |
| `/verificar-email`, `/recuperar-senha`, `/redefinir-senha` | público | Links enviados por e-mail |
| `/minha-conta`, `/preferencias` | logado (`RotaProtegida`) | Conta e lembretes |
| `/admin`, `/admin/rotas`, `/admin/areas`, `/admin/cronogramas`, `/admin/quem-somos` | ADMIN (`RotaAdmin`) | Painel |

Todas as páginas são carregadas sob demanda (`React.lazy`), e o mapa só é baixado quando aparece.

### 12.2 Camada de serviços

As páginas **nunca** chamam `fetch` diretamente. Tudo passa por `src/services/*`, que usa `apiRequest` (`services/api.js`). Ele cuida de:

- JSON e cabeçalho `Authorization: Bearer …`;
- mensagens de erro legíveis (lê o `detail` do ProblemDetail);
- tempo-limite de 75 segundos e o aviso "Conectando ao servidor…" depois de 6 segundos;
- evento de **sessão expirada** quando uma chamada autenticada recebe 401.

### 12.3 Design system e acessibilidade

- **Identidade:** azul institucional `#0b5cad`, verde `#1a7a43` e amarelo de destaque `#f2b705`; fonte Public Sans; **tema claro e escuro** (salvo no navegador e aplicado antes do React, sem piscar).
- **Tokens** em `src/styles/tokens.css`; componentes reutilizáveis como `Alerta`, `CampoTexto`, `CampoSenha`, `Interruptor`, `DialogoConfirmacao` e `PainelLateral`.
- **Acessibilidade:** contraste mínimo de 4,5:1 no texto, foco visível, navegação por teclado, áreas de toque de 44 px, `aria-live` nas mensagens, link "Pular para o conteúdo", diálogos modais nativos (`<dialog>`) e respeito a "reduzir movimento".
- **Responsivo** a partir de 360 px de largura.

---

## 13. Executando localmente

### 13.1 Pré-requisitos

- Git, **JDK 21**, **Node 22** (o Vite exige Node ^20.19 ou ≥ 22.12) e **PostgreSQL**.
- Recomendados: VS Code e pgAdmin.

### 13.2 Banco

```sql
CREATE DATABASE simul;
```

O Flyway cria as tabelas e carrega os dados na primeira execução do back-end.

### 13.3 Segredos de desenvolvimento

**JWT_SECRET** (Base64, mínimo 256 bits):

```powershell
# PowerShell (Windows)
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

```bash
# Linux/macOS
openssl rand -base64 32
```

**SIMUL_DADOS_CHAVE** (32 bytes em Base64, protege os e-mails no banco): gere com os mesmos comandos do `JWT_SECRET`, mas use **outro valor**. Guarde uma cópia em lugar seguro: se a chave for perdida, os e-mails gravados não podem mais ser lidos (e ninguém consegue entrar). Use a mesma chave no computador onde o banco foi criado; outra chave não decifra os e-mails já gravados.

**Chaves VAPID** (Web Push):

```bash
npx web-push generate-vapid-keys
```

O pacote `web-push` só é usado para gerar as chaves; ele não entra nas dependências do projeto. Nunca publique a chave privada.

**E-mail local:** use um SMTP de desenvolvimento (Gmail com senha de aplicativo, Mailtrap etc.) ou o Brevo (ver [15.3](#153-e-mail-na-render-brevo)).

### 13.4 Variáveis do back-end

O back-end lê **variáveis de ambiente** (não carrega `.env`). PowerShell:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/simul"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="<senha do postgres>"
$env:JWT_SECRET="<JWT_SECRET>"
$env:SIMUL_DADOS_CHAVE="<SIMUL_DADOS_CHAVE>"
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_USERNAME="<usuario>"
$env:SMTP_PASSWORD="<senha de aplicativo>"
$env:SMTP_FROM="<remetente>"
$env:WEB_PUSH_VAPID_PUBLIC_KEY="<chave pública>"
$env:WEB_PUSH_VAPID_PRIVATE_KEY="<chave privada>"
$env:WEB_PUSH_VAPID_SUBJECT="mailto:<seu e-mail>"
$env:NOTIFICACAO_SCHEDULER_ENABLED="true"
```

Linux/macOS: as mesmas variáveis com `export NOME="valor"`. Os demais valores têm padrão adequado para uso local (ver [16](#16-variáveis-de-ambiente)).

### 13.5 Subir

```bash
# Terminal 1 — back-end (http://localhost:8080)
cd backend
./mvnw spring-boot:run          # Windows: .\mvnw.cmd spring-boot:run

# Terminal 2 — front-end (http://localhost:5173)
cd frontend
npm ci
npm run dev
```

O Vite encaminha `/api` para `http://localhost:8080`, então **não é preciso** criar `.env.local` no front. Ordem: PostgreSQL → back-end → front-end → navegador.

### 13.6 Atalho de desenvolvimento

Sem e-mail configurado, dá para liberar uma conta manualmente (nunca em produção):

```sql
UPDATE usuarios SET email_verificado = TRUE WHERE email = 'pessoa@exemplo.com';
```

---

## 14. Testes e integração contínua

### 14.1 Back-end

24 classes de teste (JUnit 5 + Mockito), com 107 testes e 2 testes parametrizados. Cobrem:

- cálculo e decisão do lembrete, histórico, deduplicação, novas tentativas (e-mail e Web Push) e agendador;
- cronogramas (inclusive a alteração em massa), rotas e áreas;
- usuários, login, BCrypt e envio pelo Brevo;
- segurança HTTP (401/403, perfis), CORS e o formato ProblemDetail.

```bash
cd backend
./mvnw clean test        # esperado: BUILD SUCCESS, Failures: 0, Errors: 0
```

O teste de contexto (`BackendApplicationTests`) sobe a aplicação inteira e precisa de um PostgreSQL e das variáveis de ambiente, como no CI.

### 14.2 Front-end

```bash
cd frontend
npm run lint
npm run build
```

### 14.3 GitHub Actions

`.github/workflows/ci.yml` roda em todo push e pull request para a `main`:

| Job | O que faz |
|---|---|
| Back-end | PostgreSQL 16 temporário, `JWT_SECRET`, `SIMUL_DADOS_CHAVE` e chaves VAPID descartáveis, `./mvnw clean test` |
| Front-end | `npm ci`, `npm run lint`, `npm run build` |

Nenhum segredo real é usado no CI.

---

## 15. Deploy na Render

### 15.1 Back-end (Web Service)

| Configuração | Valor |
|---|---|
| Root Directory | `backend` |
| Runtime | Docker (usa o `backend/Dockerfile`) |
| Health Check Path | `/api/status` |
| Auto-Deploy | **After CI Checks Pass** (só publica se o CI passar) |

O Dockerfile compila com JDK 21, executa com JRE 21 **sem root** e limita o heap (`-XX:MaxRAMPercentage=70`), porque a instância gratuita tem 512 MB.

Cadastre as variáveis da seção [16](#16-variáveis-de-ambiente), com `NOTIFICACAO_SCHEDULER_ENABLED=true` e `SIMUL_FRONTEND_URL` apontando para o site.

**Antes do deploy da V21**, cadastre `SIMUL_DADOS_CHAVE` no Render: sem ela o serviço não sobe, e a V21 usa essa chave para cifrar os e-mails já gravados. Depois disso, a chave não pode mais mudar.

### 15.2 Front-end (Static Site)

| Configuração | Valor |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm ci && npm run build` |
| Publish Directory | `dist` |
| Variável | `VITE_API_URL=https://<back-end>.onrender.com` |
| **Redirects/Rewrites** | Source `/*` → Destination `/index.html` → Action **Rewrite** |

- **Rewrite obrigatório:** sem ele, abrir `/login` direto ou recarregar uma página interna mostra "Not Found". A regra só vale quando não existe arquivo no caminho, então CSS, JS e imagens continuam normais.
- **`VITE_API_URL`:** entra no JavaScript no momento do build. Depois de alterá-la, faça **Save, rebuild, and deploy**.

### 15.3 E-mail na Render (Brevo)

Desde setembro de 2025, os web services **gratuitos** da Render **bloqueiam as portas SMTP** (25, 465 e 587), então o envio pelo Gmail via SMTP não funciona lá. Use a API HTTPS do Brevo (plano gratuito de 300 e-mails por dia):

1. Crie a conta em brevo.com.
2. Em *Senders, Domains & Dedicated IPs*, cadastre e confirme o remetente (o mesmo e-mail de `SMTP_FROM`).
3. Em *SMTP & API → API Keys*, gere uma chave.
4. Na Render: `SIMUL_MAIL_PROVEDOR=brevo` e `BREVO_API_KEY=<chave>`.

Como o remetente é um Gmail enviando por outro serviço, os primeiros e-mails podem cair no **spam**.

### 15.4 Manter o servidor acordado

O web service gratuito para depois de 15 minutos sem acesso. Enquanto dorme, **o agendador dos lembretes também para**. Cadastre um ping gratuito (cron-job.org ou UptimeRobot) fazendo `GET https://<back-end>.onrender.com/api/status` **a cada 10 minutos**. Um único serviço ligado o mês todo cabe nas horas gratuitas.

### 15.5 Banco gratuito

O PostgreSQL gratuito da Render tem **prazo de expiração**: confira a data no painel e planeje o backup antes da apresentação.

---

## 16. Variáveis de ambiente

### 16.1 Back-end

| Variável | Obrigatória | Padrão | Uso |
|---|---|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | sim | — | Conexão com o PostgreSQL |
| `JWT_SECRET` | sim | — | Chave HS256 em Base64 (≥ 256 bits) |
| `SIMUL_DADOS_CHAVE` | sim | — | Chave (32 bytes em Base64) da criptografia dos e-mails. Nunca troque depois de criar o banco |
| `JWT_EXPIRATION_SECONDS` | não | `3600` | Validade do token |
| `SMTP_FROM` | sim | — | Remetente dos e-mails (nos dois provedores) |
| `SIMUL_MAIL_PROVEDOR` | não (Render: **sim**) | `smtp` | `smtp` ou `brevo` |
| `BREVO_API_KEY` | com `brevo` | vazio | Chave da API do Brevo |
| `SIMUL_MAIL_NOME_REMETENTE` | não | `SIMUL` | Nome exibido no e-mail (Brevo) |
| `SMTP_HOST`, `SMTP_USERNAME`, `SMTP_PASSWORD` | com `smtp` | vazio | Servidor SMTP |
| `SMTP_PORT` | não | `587` | Porta SMTP |
| `WEB_PUSH_VAPID_PUBLIC_KEY`, `WEB_PUSH_VAPID_PRIVATE_KEY`, `WEB_PUSH_VAPID_SUBJECT` | **sim** | — | Web Push; a aplicação não sobe sem elas |
| `NOTIFICACAO_SCHEDULER_ENABLED` | não | `false` | Liga o envio automático de lembretes |
| `NOTIFICACAO_SCHEDULER_CRON` | não | `0 * * * * *` | Frequência do ciclo |
| `SIMUL_TIME_ZONE` | não | `America/Sao_Paulo` | Fuso dos horários de coleta |
| `SIMUL_CORS_ALLOWED_ORIGINS` | não | `http://localhost:5173` | Origens do front (separadas por vírgula) |
| `SIMUL_FRONTEND_URL` | não | `http://localhost:5173` | Base dos links enviados por e-mail |
| `EMAIL_VERIFICATION_EXPIRATION_HOURS` | não | `24` | Validade do link de confirmação |
| `PASSWORD_RECOVERY_EXPIRATION_MINUTES` | não | `60` | Validade do link de recuperação |
| `PORT` | não | `8080` | Porta HTTP (a Render define) |

### 16.2 Front-end

| Variável | Quando | Uso |
|---|---|---|
| `VITE_API_URL` | produção (build) | URL pública do back-end. Localmente não é necessária. |

---

## 17. Problemas comuns

| Sintoma | Causa e solução |
|---|---|
| `JWT_SECRET deve estar em Base64 válido` / `pelo menos 256 bits` | Gere de novo com os comandos de [13.3](#133-segredos-de-desenvolvimento). |
| Back-end não sobe por VAPID | As três variáveis `WEB_PUSH_VAPID_*` são obrigatórias. |
| `Migration checksum mismatch for migration version N` | Uma migration já aplicada foi editada. Volte o arquivo ao conteúdo original (`git log` / `git checkout <commit> -- <arquivo>`) e crie uma migration nova para a mudança. Use `flyway repair` só se a alteração foi apenas de comentário/formatação e a equipe concordar. |
| `password authentication failed` / `Connection refused` | Confira `DB_*` e se o PostgreSQL está rodando. |
| E-mail não chega e o console mostra 503 "E-mail não enviado" | Na Render, use o Brevo ([15.3](#153-e-mail-na-render-brevo)). Localmente, confira as variáveis `SMTP_*` e a senha de aplicativo. Olhe também a caixa de spam. |
| "Not Found" ao abrir `/login` direto ou ao recarregar | Falta o rewrite do Static Site ([15.2](#152-front-end-static-site)). |
| Primeira requisição demora quase 1 minuto | Servidor gratuito acordando; configure o ping ([15.4](#154-manter-o-servidor-acordado)). |
| "Sessão encerrada" na tela de login | O JWT venceu (1 hora); entre de novo. |
| Cadastro funcionou, mas o login é bloqueado | O e-mail ainda não foi confirmado; use "Reenviar e-mail de confirmação". |
| Erro de CORS no navegador | Inclua a URL do front em `SIMUL_CORS_ALLOWED_ORIGINS`. |
| Front mostra erro de API em produção | Confira `VITE_API_URL` e refaça o build do Static Site. |
| Web Push não ativa | O navegador precisa permitir notificações e o site precisa estar em HTTPS (ou `localhost`). |
| Lembretes não saem | Confira `NOTIFICACAO_SCHEDULER_ENABLED=true`, a preferência com um canal ligado, se a rota tem cronograma ativo e se o servidor não estava dormindo. |

---

## 18. Padrões de código

- **Java:** 4 espaços, até 120 colunas, um Javadoc curto em cada classe e nos métodos públicos das interfaces, validações, mappers, repositórios e controllers. As classes `Impl` herdam a documentação da interface. Imports em grupos: pacote do SIMUL, bibliotecas, `java.*` e `import static`.
- **JavaScript/React:** 2 espaços, sem ponto e vírgula, aspas simples, até 100 colunas (`frontend/.prettierrc.json`). Formatar com `npx prettier --write src`.
- **Todos os editores:** `.editorconfig` na raiz.
- **Commits:** Conventional Commits (`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`), por exemplo `fix(notificacao): reenvia Web Push pelo mesmo canal`.
- **Banco:** só por migration nova (`V20__descricao.sql`, `V21__…`).

---

## 19. Fora do escopo e próximos passos

Não fazem parte desta entrega: rastreamento do caminhão em tempo real, GPS de veículos, alerta por aproximação e aplicativo nativo. A arquitetura permite evoluir nessa direção depois, sem confundir essas funções com a geolocalização atual, que é a do **morador**.

Melhorias possíveis:

- tela de histórico de envios no painel admin;
- importação de bairros e horários por planilha;
- domínio próprio de e-mail (melhor entrega que o remetente Gmail).

---

## 20. Equipe

- Caio Vinicius Souza Martins
- Davi Martins Alexandre
- Enzo Aquino Guimarães
- Fernando Papacosta Porta Pereira
- Renato Borges Campos

**SIMUL — Sistema Integrado de Monitoramento Urbano de Limpeza**
Faculdade SENAI FATESG · Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas · Goiânia, 2026
