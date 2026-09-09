# SIMUL — Sistema Integrado de Monitoramento Urbano de Limpeza

Plataforma web para consulta de informações programadas da coleta seletiva, gerenciamento de rotas/áreas/cronogramas e envio de lembretes aos moradores.

> Projeto acadêmico desenvolvido no curso de Análise e Desenvolvimento de Sistemas da Faculdade SENAI FATESG — Goiânia, 2026.

---

## Sumário

- [1. Visão geral](#1-visão-geral)
- [2. Como o projeto começou](#2-como-o-projeto-começou)
- [3. Decisões de arquitetura](#3-decisões-de-arquitetura)
- [4. Evolução do sistema](#4-evolução-do-sistema)
- [5. Estado atual](#5-estado-atual)
- [6. Como o SIMUL funciona](#6-como-o-simul-funciona)
- [7. Perfis de acesso](#7-perfis-de-acesso)
- [8. Tecnologias](#8-tecnologias)
- [9. Estrutura do repositório](#9-estrutura-do-repositório)
- [10. Arquitetura do back-end](#10-arquitetura-do-back-end)
- [11. Arquitetura do front-end](#11-arquitetura-do-front-end)
- [12. Banco de dados e Flyway](#12-banco-de-dados-e-flyway)
- [13. Segurança](#13-segurança)
- [14. Cadastro, verificação de e-mail e recuperação de senha](#14-cadastro-verificação-de-e-mail-e-recuperação-de-senha)
- [15. Sistema de notificações](#15-sistema-de-notificações)
- [16. Mapas, geolocalização e geometrias](#16-mapas-geolocalização-e-geometrias)
- [17. API atual](#17-api-atual)
- [18. Como utilizar o sistema](#18-como-utilizar-o-sistema)
- [19. Executando localmente em outro computador](#19-executando-localmente-em-outro-computador)
- [20. Carga acadêmica de Senador Canedo](#20-carga-acadêmica-de-senador-canedo)
- [21. Criando um administrador local](#21-criando-um-administrador-local)
- [22. Testes e qualidade](#22-testes-e-qualidade)
- [23. Deploy na Render](#23-deploy-na-render)
- [24. Variáveis de ambiente](#24-variáveis-de-ambiente)
- [25. Problemas comuns](#25-problemas-comuns)
- [26. Funcionalidades ainda não implementadas](#26-funcionalidades-ainda-não-implementadas)
- [27. Equipe](#27-equipe)

---

# 1. Visão geral

O SIMUL foi criado para enfrentar um problema simples, mas recorrente: moradores nem sempre sabem com clareza em quais dias e horários a coleta seletiva passa em sua região.

Quando a informação está espalhada, desatualizada ou difícil de consultar, aumenta a chance de:

- o morador esquecer o dia da coleta;
- o material reciclável ser colocado para fora no horário errado;
- resíduos recicláveis acabarem descartados de forma inadequada;
- a população depender de consultas manuais e pouco práticas.

A proposta do SIMUL é centralizar essas informações em um **site responsivo**, acessível por computador ou celular, permitindo que qualquer pessoa consulte a coleta da sua região e que usuários cadastrados recebam lembretes.

A versão atual é uma **plataforma web**. Não existe aplicativo mobile nativo nesta entrega.

---

# 2. Como o projeto começou

O projeto começou pela definição do problema, do escopo acadêmico e das decisões arquiteturais antes da implementação.

A sequência geral de evolução foi:

```text
Problema e escopo
        ↓
Arquitetura monolítica modular
        ↓
Base Java 21 / Spring Boot
        ↓
PostgreSQL + Flyway
        ↓
Usuários + JWT + BCrypt
        ↓
Rotas + áreas atendidas
        ↓
Cronogramas + consulta pública
        ↓
Notificações por e-mail
        ↓
Histórico + deduplicação + retry
        ↓
Scheduler
        ↓
Front-end React/Vite
        ↓
Mapas + geometrias
        ↓
Painel administrativo
        ↓
Web Push
        ↓
Verificação de e-mail
        ↓
Recuperação de senha
        ↓
Responsividade + acessibilidade
        ↓
Code splitting e lazy loading
        ↓
Deploy na Render
```

O histórico Git do projeto também mostra essa construção incremental: primeiro a estrutura do repositório e a documentação, depois o back-end, segurança, domínios de negócio, notificações, front-end, mapas, Web Push, Docker e por fim os fluxos de verificação de e-mail e recuperação de senha.

Essa evolução incremental foi intencional: cada etapa foi consolidada antes de adicionar novas funcionalidades.

---

# 3. Decisões de arquitetura

## 3.1 Por que monólito modular?

O SIMUL utiliza um **monólito modular organizado por domínio**.

A decisão foi tomada porque o projeto:

- é acadêmico;
- possui uma equipe pequena;
- não precisa da complexidade operacional de microserviços;
- exige fácil manutenção;
- precisa continuar simples de executar localmente;
- deve permitir evolução futura sem misturar responsabilidades.

Não são utilizados microserviços nesta versão.

O objetivo é obter as vantagens de uma organização modular sem introduzir:

- vários deploys independentes;
- comunicação distribuída;
- filas obrigatórias entre serviços;
- descoberta de serviços;
- observabilidade distribuída;
- complexidade extra de infraestrutura.

## 3.2 Organização por domínio

Os principais domínios implementados no back-end são:

```text
business/
├── usuario/
├── rota/
├── cronograma/
└── notificacao/
```

Cada domínio mantém suas próprias regras e segue uma separação por camadas.

A base utilizada no projeto é:

```text
Model
  ↓
Repository
  ↓
DTO
  ↓
Mapper
  ↓
Validation
  ↓
Service
  ↓
Controller
```

Domínios mais complexos, como `notificacao`, possuem classes adicionais dentro dessas mesmas responsabilidades.

## 3.3 Regra de dependência

A regra principal é:

```text
Controller
   ↓
Service
   ↓
Validation / Mapper / outros Services
   ↓
Repository
   ↓
PostgreSQL
```

Um Controller não acessa Repository diretamente.

Código reutilizável e transversal fica em:

```text
core/
├── config/
├── exception/
└── security/
```

---

# 4. Evolução do sistema

A construção do SIMUL pode ser dividida em fases.

## Fase 1 — Fundação

- estrutura Git/GitHub;
- organização `backend/`, `frontend/`, `docs/` e `mobile/`;
- Java 21;
- Spring Boot;
- Maven;
- PostgreSQL;
- Flyway;
- VS Code.

## Fase 2 — Usuários e segurança

Foram adicionados:

- cadastro de usuários;
- normalização de e-mail;
- BCrypt;
- autenticação JWT stateless;
- perfis `USUARIO` e `ADMIN`;
- proteção de endpoints;
- `401 Unauthorized`;
- `403 Forbidden`;
- CORS configurável;
- DTOs de entrada e saída separados.

## Fase 3 — Coleta seletiva

Foram adicionados:

- rotas;
- áreas atendidas;
- cronogramas;
- ativação/desativação de rotas;
- ativação/desativação de cronogramas;
- consulta pública por cidade e bairro.

## Fase 4 — Notificações

O sistema evoluiu para possuir:

- preferências por usuário e rota;
- SMTP;
- Strategy Pattern;
- cálculo do momento do lembrete;
- processamento individual;
- processamento em lote;
- histórico;
- deduplicação;
- retries;
- scheduler;
- Web Push.

## Fase 5 — Front-end

Foi criado o front-end completo em React + Vite com:

- consulta pública;
- mapa;
- cadastro;
- login;
- Minha Conta;
- preferências;
- Web Push;
- painel administrativo;
- gerenciamento de rotas;
- gerenciamento de áreas;
- editor de geometria;
- gerenciamento de cronogramas.

## Fase 6 — Segurança da conta

Foram adicionados:

- confirmação obrigatória do e-mail;
- reenvio de confirmação;
- token de verificação com armazenamento por hash;
- recuperação de senha;
- token de recuperação de uso único;
- expiração de tokens;
- confirmação da nova senha.

## Fase 7 — UX, acessibilidade e desempenho

O front-end recebeu:

- responsividade para desktop e celular;
- foco visível;
- navegação por teclado;
- `aria-live`;
- `aria-busy`;
- mensagens de erro associadas aos campos;
- mostrar/ocultar senha;
- confirmação de senha;
- comboboxes/listas de cidade e bairro;
- skip link para o conteúdo principal;
- títulos por rota;
- suporte a `prefers-reduced-motion`;
- code splitting com `React.lazy`;
- lazy loading dos mapas.

---

# 5. Estado atual

## Implementado

| Funcionalidade | Estado |
|---|---:|
| Site React/Vite | ✅ |
| API Spring Boot | ✅ |
| PostgreSQL | ✅ |
| Flyway | ✅ |
| Cadastro de usuário | ✅ |
| Login JWT | ✅ |
| BCrypt | ✅ |
| Verificação de e-mail | ✅ |
| Recuperação de senha | ✅ |
| Consulta pública por cidade/bairro | ✅ |
| Rotas | ✅ |
| Áreas atendidas | ✅ |
| Geometria GeoJSON | ✅ |
| Cronogramas | ✅ |
| OpenStreetMap / Leaflet | ✅ |
| Geolocalização do morador | ✅ |
| Preferências de notificação | ✅ |
| SMTP | ✅ |
| Web Push | ✅ |
| Histórico de notificações | ✅ |
| Deduplicação | ✅ |
| Retry de e-mail | ✅ |
| Scheduler | ✅ |
| Painel administrativo | ✅ |
| Responsividade | ✅ |
| Melhorias de acessibilidade | ✅ |
| Code splitting | ✅ |
| Lazy loading dos mapas | ✅ |
| Dockerfile do back-end | ✅ |
| Deploy preparado para Render | ✅ |

## Ainda não implementado neste snapshot

| Funcionalidade | Estado |
|---|---:|
| Guia de descarte consciente | ⚠️ Pendente |
| Aplicativo mobile nativo | 🔮 Futuro |
| Rastreamento em tempo real do caminhão | 🔮 Futuro |
| GPS dos veículos | 🔮 Futuro |
| Alertas por aproximação do caminhão | 🔮 Futuro |

> O rastreamento em tempo real continua propositalmente fora do escopo atual. O mapa existente mostra áreas, geometrias e a localização do próprio usuário; ele não acompanha caminhões.

---

# 6. Como o SIMUL funciona

## 6.1 Fluxo da consulta pública

```text
Visitante acessa o site
        ↓
Front-end carrega as áreas disponíveis
        ↓
Usuário escolhe cidade
        ↓
Usuário escolhe bairro
        ↓
GET /api/rotas/consulta
        ↓
Área atendida
        ↓
Rota ativa
        ↓
Cronogramas ativos
        ↓
Dias e horários são exibidos
        ↓
Mapa mostra a região
```

Se existir `geometria_geojson` cadastrada no SIMUL, ela é utilizada no mapa.

Quando a geometria própria não está disponível, o front-end pode utilizar a localização/geometria obtida via Nominatim/OpenStreetMap como fallback.

## 6.2 Fluxo de usuário cadastrado

```text
Cadastro
   ↓
Senha criptografada com BCrypt
   ↓
Usuário criado como USUARIO
   ↓
E-mail ainda não verificado
   ↓
Token seguro enviado por e-mail
   ↓
Usuário confirma o e-mail
   ↓
Login liberado
   ↓
JWT emitido
   ↓
Minha Conta / Preferências
```

## 6.3 Fluxo administrativo

```text
ADMIN faz login
      ↓
JWT contém role ADMIN
      ↓
Painel administrativo
      ↓
Rotas
Áreas
Geometrias
Cronogramas
```

---

# 7. Perfis de acesso

## Visitante

Não precisa de conta.

Pode:

- consultar cidades e bairros atendidos;
- consultar cronogramas;
- visualizar a área no mapa.

## USUARIO

Além da consulta pública, pode:

- acessar Minha Conta;
- configurar uma região para lembretes;
- ativar/desativar e-mail;
- ativar/desativar Web Push;
- definir antecedência;
- gerenciar a inscrição Web Push do navegador.

## ADMIN

Além das funções de usuário, pode:

- acessar o dashboard administrativo;
- cadastrar e editar rotas;
- ativar/desativar rotas;
- cadastrar e editar áreas;
- vincular área a rota;
- desenhar/editar geometria da área;
- cadastrar e editar cronogramas;
- ativar/desativar cronogramas.

---

# 8. Tecnologias

## Back-end

| Tecnologia | Uso |
|---|---|
| Java 21 | Linguagem |
| Spring Boot 4.1.0 | Framework |
| Spring Web MVC | API REST |
| Spring Data JPA | Persistência |
| Hibernate | ORM/validação de schema |
| Spring Security | Segurança |
| OAuth2 Resource Server | Validação de JWT |
| BCrypt | Hash de senha |
| Bean Validation | Validação |
| Spring Mail | SMTP |
| Flyway | Migrations |
| Lombok | Redução de boilerplate |
| PostgreSQL | Banco relacional |
| Maven | Build/dependências |

## Web Push no back-end

| Biblioteca | Versão no projeto |
|---|---:|
| `nl.martijndwars:web-push` | `5.1.1` |
| BouncyCastle | `1.85` |
| Apache HttpClient | `4.5.14` |
| Apache HttpAsyncClient | `4.1.5` |
| jose4j | `0.7.9` |

## Front-end

| Tecnologia | Versão declarada |
|---|---:|
| React | `19.2.8` |
| React DOM | `19.2.8` |
| React Router DOM | `7.18.3` |
| Vite | `8.2.2` |
| Leaflet | `1.9.4` |
| React Leaflet | `5.0.0` |
| Leaflet-Geoman | `2.20.0` |
| ESLint | `10.9.0` |

## Infraestrutura

- Render;
- Docker para o back-end;
- PostgreSQL;
- OpenStreetMap;
- Nominatim;
- Git/GitHub;
- VS Code.

---

# 9. Estrutura do repositório

```text
simul-system/
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   ├── mvnw
│   ├── mvnw.cmd
│   └── src/
│       ├── main/
│       │   ├── java/
│       │   └── resources/
│       │       ├── application.properties
│       │       └── db/
│       │           ├── migration/
│       │           └── dev/
│       └── test/
│
├── frontend/
│   ├── public/
│   │   └── sw.js
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   └── admin/
│   │   └── services/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── mobile/
│   └── .gitkeep
│
├── docs/
│   └── documentação acadêmica
│
├── .vscode/
├── .gitignore
└── README.md
```

A pasta `mobile/` é apenas uma reserva organizacional. Não existe aplicativo mobile implementado nesta entrega.

---

# 10. Arquitetura do back-end

Pacote base:

```text
com.simulsystem.backend
```

Estrutura principal:

```text
com.simulsystem.backend/
├── business/
│   ├── usuario/
│   ├── rota/
│   ├── cronograma/
│   └── notificacao/
│
└── core/
    ├── config/
    ├── exception/
    └── security/
```

## Domínio `usuario`

Responsável por:

- cadastro;
- autenticação;
- perfil;
- verificação de e-mail;
- recuperação de senha.

## Domínio `rota`

Responsável por:

- rotas;
- áreas atendidas;
- geometrias;
- consulta pública.

## Domínio `cronograma`

Responsável por:

- dias da semana;
- horários;
- cálculo da próxima coleta.

## Domínio `notificacao`

Responsável por:

- preferências;
- SMTP;
- Web Push;
- subscriptions;
- cálculo do lembrete;
- histórico;
- deduplicação;
- retries;
- processamento em lote;
- scheduler.

---

# 11. Arquitetura do front-end

O front-end usa React e React Router.

Rotas principais:

```text
/
├── /cadastro
├── /login
├── /verificar-email
├── /recuperar-senha
├── /redefinir-senha
├── /minha-conta
├── /preferencias
└── /admin
    ├── /admin/rotas
    ├── /admin/areas
    └── /admin/cronogramas
```

As páginas são carregadas com `React.lazy`, reduzindo o JavaScript inicial.

Os mapas também são carregados sob demanda:

```text
ConsultaPage
└── MapaColeta → lazy

AreasAdminPage
└── MapaEdicaoArea → lazy
```

## Camada de serviços

A comunicação com a API fica em:

```text
frontend/src/services/
```

Exemplos:

```text
api.js
authService.js
usuarioService.js
rotaService.js
notificacaoService.js
webPushService.js
adminRotaService.js
adminAreaService.js
adminCronogramaService.js
geocodingService.js
```

`api.js` centraliza:

- URL base;
- headers;
- JWT;
- serialização JSON;
- tratamento de erros.

---

# 12. Banco de dados e Flyway

O PostgreSQL é a fonte persistente do sistema.

O Hibernate está configurado com:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

Portanto, o Hibernate **não deve criar ou alterar o schema**.

Toda alteração estrutural deve ser feita por Flyway.

O snapshot atual contém migrations de `V1` até `V13`:

```text
V1   usuarios
V2   rotas + areas_atendidas
V3   cronogramas
V4   preferencias_notificacao
V5   rota em preferencias_notificacao
V6   Web Push em preferencias
V7   historico_notificacoes
V8   retry
V9   geometria GeoJSON
V10  push_subscriptions
V11  email_verificado
V12  tokens_verificacao_email
V13  tokens_recuperacao_senha
```

Principais tabelas:

```text
usuarios
rotas
areas_atendidas
cronogramas
preferencias_notificacao
historico_notificacoes
push_subscriptions
tokens_verificacao_email
tokens_recuperacao_senha
flyway_schema_history
```

> Nunca altere uma migration `V*.sql` que já tenha sido aplicada em um ambiente compartilhado. Crie uma nova migration.

---

# 13. Segurança

O SIMUL utiliza JWT stateless.

```text
Cliente
  ↓
POST /api/auth/login
  ↓
Spring Security autentica
  ↓
JWT é gerado
  ↓
Cliente envia:
Authorization: Bearer <token>
```

## Proteções atuais

- BCrypt;
- JWT HS256;
- secret em Base64;
- mínimo de 256 bits para `JWT_SECRET`;
- DTOs separados;
- Bean Validation;
- `@Valid`;
- `@PreAuthorize`;
- roles;
- CORS restrito;
- segredos por variável de ambiente;
- API stateless;
- tratamento padronizado de `401` e `403`;
- e-mail normalizado;
- verificação de e-mail antes do login.

## Perfis

```text
USUARIO
ADMIN
```

O cadastro público não permite escolher `ADMIN`.

---

# 14. Cadastro, verificação de e-mail e recuperação de senha

## 14.1 Cadastro

O cadastro recebe:

```text
nome
email
senha
```

A senha é codificada com BCrypt.

O novo usuário é criado com:

```text
perfil = USUARIO
email_verificado = false
```

## 14.2 Verificação de e-mail

Depois do cadastro:

1. o back-end gera 32 bytes aleatórios;
2. o token bruto é enviado somente no link do e-mail;
3. o banco armazena apenas SHA-256 do token;
4. por padrão, o token expira em 24 horas;
5. depois de usado, é marcado como utilizado;
6. o usuário passa a possuir `email_verificado = true`.

O login é bloqueado enquanto o e-mail não estiver verificado.

## 14.3 Recuperação de senha

Fluxo:

```text
Esqueci minha senha
      ↓
Usuário informa e-mail
      ↓
Resposta neutra
      ↓
Token de recuperação
      ↓
Link por SMTP
      ↓
Nova senha + confirmação
      ↓
BCrypt
      ↓
Token marcado como utilizado
```

O token:

- é aleatório;
- é armazenado somente por hash SHA-256;
- é de uso único;
- expira por padrão em 60 minutos.

As respostas da solicitação de recuperação são neutras para reduzir enumeração de usuários.

---

# 15. Sistema de notificações

O módulo usa Strategy Pattern.

```text
NotificacaoStrategy
├── EmailNotificacaoStrategy
└── WebPushNotificacaoStrategy
```

O serviço de envio escolhe a estratégia pelo tipo:

```text
EMAIL
WEB_PUSH
```

## 15.1 Fluxo automático

```text
Scheduler
   ↓
CicloNotificacaoService
   ↓
Processamento em lote
   ↓
Preferências válidas
   ↓
Próxima coleta
   ↓
Cálculo da antecedência
   ↓
Histórico / reserva da ocorrência
   ↓
Strategy
   ├── SMTP
   └── Web Push
```

## 15.2 Deduplicação

A combinação:

```text
usuario
+
rota
+
data_hora_coleta
+
canal
```

é única no histórico.

Isso evita enviar duas vezes o mesmo canal para a mesma ocorrência.

## 15.3 Retry

O retry atual foi implementado para o canal de e-mail.

Regra:

```text
até 3 tentativas totais
intervalo de 5 minutos
```

Antes do retry o sistema verifica novamente se a configuração ainda permite o envio.

Se não permitir, o histórico é marcado como cancelado.

## 15.4 Scheduler

Configuração padrão:

```properties
simul.notificacao.scheduler.enabled=${NOTIFICACAO_SCHEDULER_ENABLED:false}
simul.notificacao.scheduler.cron=${NOTIFICACAO_SCHEDULER_CRON:0 * * * * *}
```

Por padrão ele fica desativado localmente.

Para testar lembretes automáticos:

```text
NOTIFICACAO_SCHEDULER_ENABLED=true
```

O cron padrão verifica a cada minuto.

> Verificação de e-mail e recuperação de senha usam SMTP diretamente e não dependem desse scheduler.

---

# 16. Mapas, geolocalização e geometrias

O SIMUL utiliza:

- Leaflet;
- React Leaflet;
- OpenStreetMap;
- Nominatim;
- Leaflet-Geoman;
- GeoJSON.

## Consulta pública

O mapa pode mostrar:

- geometria da área cadastrada pelo SIMUL;
- localização aproximada da região;
- posição do próprio usuário, se ele autorizar geolocalização.

## Painel administrativo

O administrador pode:

- abrir o editor de uma área;
- desenhar um polígono;
- editar vértices;
- salvar `Polygon` ou `MultiPolygon` em GeoJSON.

O mapa **não rastreia caminhões**.

```text
Geolocalização atual
→ posição do navegador do morador

Geometria atual
→ área atendida

Rastreamento futuro
→ posição de veículo
```

São recursos diferentes.

---

# 17. API atual

## Endpoints públicos

| Método | Endpoint | Uso |
|---|---|---|
| `POST` | `/api/usuarios` | Cadastro |
| `POST` | `/api/usuarios/verificar-email` | Confirmar e-mail |
| `POST` | `/api/usuarios/reenviar-verificacao` | Reenviar confirmação |
| `POST` | `/api/usuarios/recuperar-senha` | Solicitar recuperação |
| `POST` | `/api/usuarios/redefinir-senha` | Redefinir senha |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/rotas/areas` | Cidades/bairros disponíveis |
| `GET` | `/api/rotas/consulta` | Consulta pública |
| `GET` | `/api/notificacoes/push/public-key` | Chave pública VAPID |

## Endpoints autenticados

| Método | Endpoint | Uso |
|---|---|---|
| `GET` | `/api/usuarios/me` | Dados da conta |
| `POST` | `/api/notificacoes/preferencias` | Criar preferência |
| `GET` | `/api/notificacoes/preferencias` | Consultar preferência |
| `PUT` | `/api/notificacoes/preferencias` | Atualizar preferência |
| `POST` | `/api/notificacoes/push/subscriptions` | Salvar Web Push |
| `GET` | `/api/notificacoes/push/subscriptions` | Listar subscriptions |
| `DELETE` | `/api/notificacoes/push/subscriptions` | Remover subscription |

## Endpoints administrativos

Base de rotas:

```text
/api/admin/rotas
```

| Método | Endpoint |
|---|---|
| `POST` | `/api/admin/rotas` |
| `GET` | `/api/admin/rotas` |
| `PUT` | `/api/admin/rotas/{id}` |
| `PATCH` | `/api/admin/rotas/{id}/status` |
| `POST` | `/api/admin/rotas/areas` |
| `GET` | `/api/admin/rotas/areas` |
| `PUT` | `/api/admin/rotas/areas/{id}` |
| `PUT` | `/api/admin/rotas/areas/{id}/geometria` |

Cronogramas:

```text
/api/admin/cronogramas
```

| Método | Endpoint |
|---|---|
| `POST` | `/api/admin/cronogramas` |
| `GET` | `/api/admin/cronogramas` |
| `PUT` | `/api/admin/cronogramas/{id}` |
| `PATCH` | `/api/admin/cronogramas/{id}/status` |

Teste de autorização administrativa:

```text
GET /api/admin/usuarios/verificar-acesso
```

---

# 18. Como utilizar o sistema

## Visitante

1. Acesse `/`.
2. Selecione uma cidade.
3. Selecione um bairro.
4. Aguarde a consulta automática.
5. Veja dias/horários.
6. Consulte o mapa.

## Criar conta

1. Acesse `/cadastro`.
2. Informe nome, e-mail, senha e confirmação.
3. Abra o e-mail enviado pelo SIMUL.
4. Clique no link de verificação.
5. Aguarde a confirmação.
6. Faça login.

## Login

1. Acesse `/login`.
2. Informe e-mail e senha.
3. O e-mail precisa estar confirmado.
4. Depois do login, o usuário é redirecionado para Minha Conta.

## Esqueci minha senha

1. Clique em **Esqueci minha senha**.
2. Informe o e-mail.
3. Abra a mensagem recebida.
4. Acesse o link.
5. Informe a nova senha.
6. Confirme a nova senha.
7. Volte ao login.

## Preferências

1. Faça login.
2. Abra **Notificações**.
3. Escolha cidade e bairro.
4. Selecione a região.
5. Ative e-mail e/ou Web Push.
6. Defina a antecedência.
7. Salve.

## Painel administrativo

O usuário precisa possuir perfil `ADMIN`.

Acesse:

```text
/admin
```

Use as seções:

```text
Visão geral
Rotas
Áreas atendidas
Cronogramas
```

---

# 19. Executando localmente em outro computador

Esta seção descreve a instalação do zero.

## 19.1 Pré-requisitos

Instale:

### Obrigatórios

- Git;
- JDK 21;
- Node.js;
- PostgreSQL.

### Recomendados

- pgAdmin;
- Visual Studio Code.

### Versões recomendadas para reproduzir o ambiente

```text
Java: 21
PostgreSQL: 18
Node: 22 LTS
```

O `package-lock.json` atual do projeto exige, por causa do Vite:

```text
Node ^20.19.0 ou >=22.12.0
```

Por simplicidade, use Node 22 atualizado.

Verifique:

```powershell
java -version
javac -version
node --version
npm --version
```

---

## 19.2 Obter o projeto

### Usando Git

```powershell
git clone https://github.com/SIMUL-System/simul-system.git
cd simul-system
```

Se o repositório exigir autenticação, faça login no GitHub antes.

### Usando ZIP

1. Extraia o ZIP.
2. Abra a pasta `simul-system`.
3. Abra essa pasta no VS Code.

---

## 19.3 Criar o banco local

No pgAdmin ou `psql`, crie:

```sql
CREATE DATABASE simul;
```

Exemplo de conexão:

```text
Host: localhost
Port: 5432
Database: simul
Username: postgres
Password: <sua senha local>
```

A URL JDBC será:

```text
jdbc:postgresql://localhost:5432/simul
```

---

## 19.4 Gerar um JWT_SECRET

O projeto exige um secret:

- Base64 válido;
- pelo menos 256 bits.

### PowerShell

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$jwtSecret = [Convert]::ToBase64String($bytes)
$rng.Dispose()
$jwtSecret
```

Copie a saída e use como `JWT_SECRET`.

### Linux/macOS com OpenSSL

```bash
openssl rand -base64 32
```

Não faça commit do valor.

---

## 19.5 Gerar chaves VAPID

O back-end atual exige chave pública, chave privada e subject VAPID para inicializar o Web Push.

Se a equipe já possui um par VAPID de desenvolvimento armazenado com segurança, use-o.

Para gerar um novo par de desenvolvimento, uma opção é:

```powershell
npx web-push generate-vapid-keys
```

O comando é apenas um utilitário de geração; o pacote `web-push` não precisa ser adicionado às dependências do front-end.

Exemplo de subject:

```text
mailto:seu-email@exemplo.com
```

Nunca publique a chave privada VAPID.

---

## 19.6 Configurar SMTP

O sistema usa SMTP para:

- confirmação de e-mail;
- recuperação de senha;
- lembretes por e-mail.

Você precisa de uma conta/servidor SMTP válido.

Exemplo genérico:

```text
SMTP_HOST=<host smtp>
SMTP_PORT=587
SMTP_USERNAME=<usuario>
SMTP_PASSWORD=<senha ou app password>
SMTP_FROM=<email remetente>
```

Se utilizar um provedor que exige senha de aplicativo, use a senha de aplicativo em vez da senha comum da conta.

---

## 19.7 Configurar variáveis do back-end — Windows PowerShell

Abra um terminal na pasta do projeto e execute:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/simul"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="<SENHA_LOCAL_DO_POSTGRES>"

$env:JWT_SECRET="<JWT_SECRET_BASE64>"
$env:JWT_EXPIRATION_SECONDS="3600"

$env:SMTP_HOST="<SMTP_HOST>"
$env:SMTP_PORT="587"
$env:SMTP_USERNAME="<SMTP_USERNAME>"
$env:SMTP_PASSWORD="<SMTP_PASSWORD>"
$env:SMTP_FROM="<SMTP_FROM>"

$env:SIMUL_TIME_ZONE="America/Sao_Paulo"

$env:NOTIFICACAO_SCHEDULER_ENABLED="false"
$env:NOTIFICACAO_SCHEDULER_CRON="0 * * * * *"

$env:SIMUL_CORS_ALLOWED_ORIGINS="http://localhost:5173"

$env:WEB_PUSH_VAPID_PUBLIC_KEY="<VAPID_PUBLIC_KEY>"
$env:WEB_PUSH_VAPID_PRIVATE_KEY="<VAPID_PRIVATE_KEY>"
$env:WEB_PUSH_VAPID_SUBJECT="mailto:<SEU_EMAIL>"

$env:EMAIL_VERIFICATION_EXPIRATION_HOURS="24"
$env:PASSWORD_RECOVERY_EXPIRATION_MINUTES="60"

$env:SIMUL_FRONTEND_URL="http://localhost:5173"
```

Essas variáveis valem apenas para a sessão atual do PowerShell.

> O back-end não carrega automaticamente um arquivo `.env`. Ele lê variáveis do ambiente do processo.

---

## 19.8 Configurar variáveis do back-end — Linux/macOS

```bash
export DB_URL="jdbc:postgresql://localhost:5432/simul"
export DB_USERNAME="postgres"
export DB_PASSWORD="<SENHA_LOCAL_DO_POSTGRES>"

export JWT_SECRET="<JWT_SECRET_BASE64>"
export JWT_EXPIRATION_SECONDS="3600"

export SMTP_HOST="<SMTP_HOST>"
export SMTP_PORT="587"
export SMTP_USERNAME="<SMTP_USERNAME>"
export SMTP_PASSWORD="<SMTP_PASSWORD>"
export SMTP_FROM="<SMTP_FROM>"

export SIMUL_TIME_ZONE="America/Sao_Paulo"

export NOTIFICACAO_SCHEDULER_ENABLED="false"
export NOTIFICACAO_SCHEDULER_CRON="0 * * * * *"

export SIMUL_CORS_ALLOWED_ORIGINS="http://localhost:5173"

export WEB_PUSH_VAPID_PUBLIC_KEY="<VAPID_PUBLIC_KEY>"
export WEB_PUSH_VAPID_PRIVATE_KEY="<VAPID_PRIVATE_KEY>"
export WEB_PUSH_VAPID_SUBJECT="mailto:<SEU_EMAIL>"

export EMAIL_VERIFICATION_EXPIRATION_HOURS="24"
export PASSWORD_RECOVERY_EXPIRATION_MINUTES="60"

export SIMUL_FRONTEND_URL="http://localhost:5173"
```

---

## 19.9 Executar o back-end

### Windows

```powershell
cd backend
.\mvnw.cmd clean test
.\mvnw.cmd spring-boot:run
```

### Linux/macOS

```bash
cd backend
chmod +x mvnw
./mvnw clean test
./mvnw spring-boot:run
```

Na primeira execução, o Maven Wrapper pode precisar baixar o Maven e as dependências.

O back-end ficará em:

```text
http://localhost:8080
```

O Flyway executará automaticamente as migrations.

Nos logs, verifique:

```text
Flyway
HikariPool
Tomcat
Started BackendApplication
```

---

## 19.10 Configurar o front-end

Abra outro terminal:

```powershell
cd frontend
```

Copie o exemplo:

### PowerShell

```powershell
Copy-Item .env.example .env.local
```

### Linux/macOS

```bash
cp .env.example .env.local
```

Conteúdo esperado:

```env
VITE_API_URL=http://localhost:8080
```

`frontend/.env.local` não deve ser versionado.

---

## 19.11 Instalar e executar o front-end

```powershell
npm ci
npm run dev
```

Abra:

```text
http://localhost:5173
```

Para validar o código:

```powershell
npm run lint
npm run build
```

Para visualizar o build local:

```powershell
npm run preview
```

---

## 19.12 Ordem recomendada para iniciar o ambiente

```text
1. PostgreSQL
2. Back-end Spring Boot
3. Carga acadêmica, se necessária
4. Front-end Vite
5. Navegador
```

---

# 20. Carga acadêmica de Senador Canedo

As migrations criam a estrutura do banco, mas não inserem automaticamente o conjunto acadêmico de coleta.

O projeto contém:

```text
backend/src/main/resources/db/dev/popular-coleta-senador-canedo.sql
```

Essa carga foi construída para o ambiente acadêmico.

Ela valida:

```text
109 áreas
109 rotas internas
333 cronogramas
```

Convenções utilizadas no script:

```text
DIURNO
06:00 até 18:00

NOTURNO
18:00 até 23:59
```

A rota interna criada por área serve para administração do cronograma e **não representa necessariamente a trajetória física do caminhão**.

## Executar pelo pgAdmin

1. Conecte ao banco `simul`.
2. Abra Query Tool.
3. Abra `popular-coleta-senador-canedo.sql`.
4. Execute o script.
5. Verifique a saída.

## Executar pelo psql

A partir da raiz:

```powershell
psql -U postgres -d simul -f backend/src/main/resources/db/dev/popular-coleta-senador-canedo.sql
```

> Execute essa carga somente em ambiente apropriado e preferencialmente sobre uma base de desenvolvimento sem a mesma carga já duplicada.

Existe também:

```text
backend/src/main/resources/db/dev/limpar-dados-coleta.sql
```

Esse arquivo é destrutivo e deve ser usado **somente em desenvolvimento**.

---

# 21. Criando um administrador local

O cadastro público sempre cria `USUARIO`.

A forma recomendada para desenvolvimento é:

1. cadastrar normalmente pelo site;
2. verificar o e-mail;
3. promover a conta pelo banco local.

```sql
UPDATE usuarios
SET perfil = 'ADMIN'
WHERE email = 'admin@exemplo.com';
```

Depois:

1. faça logout;
2. faça login novamente;
3. um novo JWT será emitido com a role `ADMIN`.

## Atalho somente para desenvolvimento

Se você estiver montando um ambiente local sem SMTP funcional e precisar apenas testar telas, pode marcar manualmente:

```sql
UPDATE usuarios
SET email_verificado = TRUE
WHERE email = 'usuario@exemplo.com';
```

Não use esse atalho em produção.

---

# 22. Testes e qualidade

O snapshot analisado possui:

```text
19 classes de teste
86 métodos anotados com @Test
```

Os testes cobrem áreas como:

- contexto Spring;
- cronogramas;
- cálculo de coleta;
- cálculo de notificação;
- decisão do lembrete;
- histórico;
- deduplicação;
- retries;
- scheduler;
- preferências;
- rota;
- áreas;
- usuários;
- autenticação;
- BCrypt;
- CORS;
- ProblemDetail;
- segurança HTTP;
- autorização administrativa.

## Back-end

```powershell
cd backend
.\mvnw.cmd clean test
```

Antes de consolidar uma alteração:

```text
Failures: 0
Errors: 0
BUILD SUCCESS
```

## Front-end

```powershell
cd frontend
npm run lint
npm run build
```

---

# 23. Deploy na Render

## 23.1 Back-end

O repositório possui:

```text
backend/Dockerfile
```

O Dockerfile usa build em duas etapas:

```text
eclipse-temurin:21-jdk
        ↓
Maven package
        ↓
eclipse-temurin:21-jre
        ↓
java -jar app.jar
```

A porta usa:

```properties
server.port=${PORT:8080}
```

### Configuração típica na Render

```text
Root Directory: backend
Runtime: Docker
```

Cadastre todas as variáveis de ambiente necessárias.

## 23.2 Front-end

O front-end gera os arquivos estáticos em:

```text
frontend/dist
```

Configuração típica:

```text
Root Directory: frontend
Build Command: npm ci && npm run build
Publish Directory: dist
```

Configure:

```text
VITE_API_URL=https://<URL_DO_BACKEND>
```

Como o projeto usa `BrowserRouter`, a hospedagem precisa redirecionar rotas do SPA para `index.html`.

## 23.3 Produção

Em produção:

- use HTTPS;
- restrinja CORS ao domínio do front-end;
- não use secrets hardcoded;
- configure SMTP;
- configure VAPID;
- avalie se o scheduler precisa ficar ativo;
- monitore logs;
- preserve backups do PostgreSQL.

---

# 24. Variáveis de ambiente

## Back-end

| Variável | Obrigatória para o ambiente atual | Padrão |
|---|---:|---|
| `PORT` | Não | `8080` |
| `DB_URL` | Sim | — |
| `DB_USERNAME` | Sim | — |
| `DB_PASSWORD` | Sim | — |
| `JWT_SECRET` | Sim | — |
| `JWT_EXPIRATION_SECONDS` | Não | `3600` |
| `SMTP_HOST` | Sim | — |
| `SMTP_PORT` | Sim | — |
| `SMTP_USERNAME` | Sim | — |
| `SMTP_PASSWORD` | Sim | — |
| `SMTP_FROM` | Sim | — |
| `SIMUL_TIME_ZONE` | Não | `America/Sao_Paulo` |
| `NOTIFICACAO_SCHEDULER_ENABLED` | Não | `false` |
| `NOTIFICACAO_SCHEDULER_CRON` | Não | `0 * * * * *` |
| `SIMUL_CORS_ALLOWED_ORIGINS` | Não | `http://localhost:5173` |
| `WEB_PUSH_VAPID_PUBLIC_KEY` | **Na prática, sim** | vazio |
| `WEB_PUSH_VAPID_PRIVATE_KEY` | **Na prática, sim** | vazio |
| `WEB_PUSH_VAPID_SUBJECT` | **Na prática, sim** | vazio |
| `EMAIL_VERIFICATION_EXPIRATION_HOURS` | Não | `24` |
| `PASSWORD_RECOVERY_EXPIRATION_MINUTES` | Não | `60` |
| `SIMUL_FRONTEND_URL` | Não | `http://localhost:5173` |

> Embora as propriedades VAPID tenham fallback vazio no `application.properties`, `WebPushConfig` rejeita valores vazios durante a inicialização. Portanto, configure as três variáveis no ambiente atual.

## Front-end

```env
VITE_API_URL=http://localhost:8080
```

---

# 25. Problemas comuns

## `JWT_SECRET deve estar em Base64 válido`

Gere um novo secret Base64.

## `JWT_SECRET deve possuir pelo menos 256 bits`

Use pelo menos 32 bytes aleatórios antes de converter para Base64.

## Back-end não inicia por VAPID

Confira:

```text
WEB_PUSH_VAPID_PUBLIC_KEY
WEB_PUSH_VAPID_PRIVATE_KEY
WEB_PUSH_VAPID_SUBJECT
```

## `password authentication failed`

Confira:

```text
DB_USERNAME
DB_PASSWORD
DB_URL
```

## `Connection refused` no PostgreSQL

Verifique:

- serviço PostgreSQL ativo;
- porta 5432;
- banco `simul`;
- firewall;
- credenciais.

## Flyway acusa schema incompatível

Não use `ddl-auto=create`.

Confirme:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

Confira `flyway_schema_history`.

## Front-end mostra erro de API

Confira:

```env
VITE_API_URL=http://localhost:8080
```

Depois reinicie o Vite.

## CORS

Em desenvolvimento:

```text
SIMUL_CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Se a porta do Vite mudar, atualize a origem.

## Web Push não ativa

Confirme:

- navegador compatível;
- permissão de notificações;
- VAPID correto;
- usuário autenticado;
- Service Worker `/sw.js`;
- HTTPS em produção.

`localhost` é aceito pelos navegadores como contexto apropriado para desenvolvimento de Service Workers.

## Cadastro funciona, mas login é bloqueado

O e-mail ainda pode estar não verificado.

Use o link enviado por SMTP.

## Token de recuperação retorna 400

Se o token já foi usado, expirou ou está inválido, o back-end retorna erro de requisição e o front-end mostra a mensagem correspondente.

---

# 26. Funcionalidades ainda não implementadas

## Guia de descarte consciente

O guia continua no escopo acadêmico/documental, porém **não existe uma página ou domínio funcional de descarte no snapshot atual do código**.

Portanto, ele não deve ser apresentado como implementado até que a funcionalidade seja adicionada.

## Rastreamento de caminhão

Continua fora do escopo atual.

Não existem nesta versão:

- GPS do caminhão;
- WebSocket de rastreamento;
- posição do veículo em tempo real;
- previsão por aproximação do caminhão.

A arquitetura pode evoluir posteriormente, mas essa funcionalidade não deve ser confundida com a geolocalização atual do morador.

## Aplicativo mobile

A pasta `mobile/` é apenas um placeholder.

A entrega atual é um site responsivo.

---

# 27. Equipe

- Caio Vinicius Souza Martins
- Davi Martins Alexandre
- Enzo Aquino Guimarães
- Fernando Papacosta Porta Pereira
- Renato Borges Campos

---

## Projeto acadêmico

**SIMUL — Sistema Integrado de Monitoramento Urbano de Limpeza**

Faculdade SENAI FATESG  
Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas  
Goiânia — 2026

---

## Observação final

Este README descreve o **snapshot atual do código analisado**, e não somente o planejamento inicial.

Sempre que uma nova funcionalidade relevante for implementada, atualize:

1. a tabela de estado atual;
2. as variáveis de ambiente;
3. os endpoints;
4. as migrations;
5. o procedimento de execução local;
6. as funcionalidades pendentes.

Sugestão de commit para esta atualização:

```text
docs: update project README with architecture and setup guide
```
