# SIMUL — Sistema Integrado de Monitoramento Urbano de Limpeza

Plataforma web para consulta de informações programadas da coleta seletiva, desenvolvida com o objetivo de aumentar a previsibilidade para os moradores e contribuir para a redução de esquecimentos e do descarte inadequado de materiais recicláveis.

O SIMUL centraliza informações sobre regiões atendidas, rotas oficiais, dias e horários da coleta seletiva e permite que usuários cadastrados configurem lembretes automáticos.

> Projeto acadêmico desenvolvido no curso de Análise e Desenvolvimento de Sistemas da Faculdade SENAI FATESG — Goiânia, 2026.

---

## 🎯 Objetivo

A divulgação dos cronogramas da coleta seletiva muitas vezes ocorre de forma estática ou pouco acessível, dificultando o acompanhamento pelos moradores.

O SIMUL busca tornar essas informações mais fáceis de consultar por meio de uma plataforma web.

A consulta das informações da coleta é pública e não exige cadastro.

Usuários cadastrados podem configurar preferências para receber lembretes automáticos relacionados à coleta de sua região.

---

## ✨ Funcionalidades

### ✅ Implementadas no back-end

- Consulta pública da coleta seletiva por cidade e bairro
- Cadastro e manutenção de rotas oficiais da coleta
- Cadastro de áreas atendidas
- Cadastro e manutenção de cronogramas
- Ativação e desativação de rotas e cronogramas
- Cadastro de usuários
- Autenticação stateless com JWT
- Autorização por perfil de usuário
- Perfis `USUARIO` e `ADMIN`
- Senhas protegidas com BCrypt
- Normalização de e-mail
- Preferências de notificação por usuário e rota
- Envio de lembretes por e-mail via SMTP
- Processamento automático de notificações por scheduler
- Histórico de notificações
- Deduplicação de envios
- Política automática de retry para falhas de envio
- Cancelamento de retries quando a preferência deixa de ser válida
- Proteção dos endpoints administrativos
- CORS configurável e restrito às origens permitidas
- Tratamento padronizado de erros da API
- Migrações de banco controladas pelo Flyway
- Testes automatizados das principais regras de negócio e segurança

### 🚧 Em desenvolvimento

- Interface web utilizando React.js e Vite
- Integração do front-end com a API
- Interface pública de consulta da coleta
- Interface de cadastro e autenticação
- Interface de preferências de notificação
- Painel administrativo web
- Integração visual com OpenStreetMap
- Guia visual de descarte consciente
- Canal de notificações Web Push

### 🔮 Funcionalidades futuras

- Aplicativo mobile
- Rastreamento em tempo real do caminhão de coleta
- Localização GPS dos veículos
- Notificações baseadas na aproximação do caminhão

O rastreamento em tempo real não faz parte da versão acadêmica atual.

A arquitetura é mantida preparada para permitir essa evolução posteriormente, sem implementar GPS, WebSocket ou monitoramento de posição nesta entrega.

---

## 👥 Perfis de utilização

### Visitante

O visitante pode utilizar as funcionalidades públicas sem criar uma conta.

Entre elas:

- consultar a coleta seletiva por região;
- visualizar rota, dias e horários disponíveis;
- acessar o guia de descarte consciente.

### Usuário cadastrado

Além das funcionalidades públicas, o usuário cadastrado pode configurar preferências para receber lembretes automáticos.

O envio das notificações é executado pelo back-end e não depende de o usuário estar:

- autenticado naquele momento;
- com o navegador aberto;
- acessando o site.

Cada nova ocorrência válida da coleta pode gerar um novo lembrete.

A mesma ocorrência é protegida contra envio duplicado.

### Administrador

O administrador possui acesso aos recursos protegidos responsáveis pela manutenção das informações utilizadas pela plataforma.

O painel administrativo será utilizado para manutenção de:

- rotas oficiais;
- áreas atendidas;
- cronogramas;
- dias e horários;
- informações operacionais necessárias às notificações.

O SIMUL não cria ou calcula operacionalmente novas rotas de coleta. As rotas cadastradas representam informações oficiais provenientes da operação responsável pela coleta seletiva.

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Front-end | React.js + Vite |
| Back-end | Java 21 + Spring Boot |
| Gerenciamento de dependências | Maven |
| Banco de dados | PostgreSQL |
| Administração do banco | pgAdmin |
| Persistência | Spring Data JPA / Hibernate |
| Migrações | Flyway |
| Segurança | Spring Security |
| Autenticação | JWT |
| Criptografia de senha | BCrypt |
| Notificações | SMTP + arquitetura Strategy |
| Mapas | OpenStreetMap |
| Hospedagem prevista | Render |
| Versionamento | Git + GitHub |
| IDE | Visual Studio Code |

---

## 🏗️ Arquitetura

O back-end do SIMUL utiliza uma arquitetura de **monólito modular organizado por domínio**.

Não são utilizados microserviços nesta versão.

### Domínios atuais

```text
business/
├── usuario/
├── rota/
├── cronograma/
└── notificacao/
```

Cada domínio mantém suas próprias responsabilidades e segue a separação entre as camadas da aplicação.

O fluxo principal é:

```text
Controller
    ↓
Service
    ↓
Validation / Mapper
    ↓
Repository
    ↓
PostgreSQL
```

Controllers não acessam repositories diretamente.

Código transversal e reutilizável fica centralizado em `core/`.

Exemplo:

```text
core/
├── config/
├── exception/
└── security/
```

A comunicação entre domínios procura utilizar contratos de Service em vez de acessar diretamente repositories pertencentes a outro domínio.

---

## 📁 Estrutura do repositório

```text
simul-system/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   └── test/
│   ├── pom.xml
│   └── mvnw.cmd
│
├── frontend/
│   └── estrutura React/Vite em desenvolvimento
│
├── mobile/
│   └── reservado para evolução futura do projeto
│
├── docs/
│   └── documentação acadêmica
│
├── .vscode/
└── README.md
```

A pasta `mobile/` permanece no repositório como preparação organizacional para uma futura versão mobile.

O aplicativo mobile não faz parte da entrega web atual.

---

## 🔎 Consulta pública da coleta

A consulta pública pode ser realizada sem autenticação.

Exemplo:

```http
GET /api/rotas/consulta?cidade=Senador%20Canedo&bairro=Jardim%20Nova%20Goiânia
```

O fluxo atual é:

```text
Cidade + bairro
       ↓
Área atendida
       ↓
Rota oficial ativa
       ↓
Cronogramas ativos
       ↓
Dias e horários da coleta
```

Rotas desativadas não são disponibilizadas na consulta pública.

Os dados antigos permanecem preservados no banco para manter relacionamentos e histórico.

---

## 🔐 Segurança

O SIMUL utiliza Spring Security com autenticação stateless baseada em JWT.

A aplicação possui três situações principais de acesso:

```text
VISITANTE
    ↓
Endpoints públicos

USUARIO
    ↓
Endpoints autenticados

ADMIN
    ↓
Endpoints administrativos
```

### Controles implementados

- JWT stateless
- BCrypt para armazenamento de senhas
- `@PreAuthorize` em recursos administrativos
- DTOs separados para entrada e saída
- senha nunca retornada pela API
- perfil administrativo não pode ser escolhido no cadastro público
- novos usuários recebem perfil `USUARIO`
- usuários inativos não podem realizar nova autenticação
- validação dos dados no back-end
- CORS limitado às origens configuradas
- credenciais externas configuráveis por variável de ambiente
- tratamento de respostas `401 Unauthorized`
- tratamento de respostas `403 Forbidden`

Os testes automatizados de segurança verificam, entre outros cenários:

```text
Visitante → consulta pública         PERMITIDO

Visitante → recurso protegido        401

USUARIO → recurso administrativo     403

ADMIN → recurso administrativo       PERMITIDO
```

---

## 🔑 Cadastro de usuários

O cadastro público aceita somente:

```text
nome
email
senha
```

O cliente não pode escolher o próprio perfil.

Durante a persistência:

```text
perfil = USUARIO
ativo = true
```

A senha recebida é processada pelo `PasswordEncoder` antes da persistência.

O sistema também normaliza endereços de e-mail.

Exemplo:

```text
Usuario@SIMUL.COM
        ↓
usuario@simul.com
```

Isso evita duplicidade causada apenas por diferenças entre letras maiúsculas e minúsculas.

---

## 🔔 Sistema de notificações

O módulo de notificações utiliza uma estrutura extensível baseada em Strategy.

Fluxo principal:

```text
Preferência do usuário
        ↓
Rota
        ↓
Cronograma
        ↓
Scheduler
        ↓
Processamento da ocorrência
        ↓
Histórico / deduplicação
        ↓
Estratégia do canal
        ↓
SMTP
```

### E-mail

O canal atualmente operacional utiliza SMTP.

O usuário pode configurar uma antecedência para receber o lembrete antes da coleta.

O processamento ocorre automaticamente no servidor.

### Deduplicação

O sistema registra cada ocorrência processada.

A combinação de:

```text
usuário
+
rota
+
ocorrência
+
canal
```

é utilizada para impedir que a mesma ocorrência gere envios duplicados.

Uma nova ocorrência da coleta pode gerar normalmente um novo lembrete.

### Retry

Quando ocorre uma falha técnica durante o envio por e-mail, o sistema possui uma política automática de novas tentativas.

A implementação atual realiza até:

```text
3 tentativas totais
```

com intervalo configurado na regra atual de:

```text
5 minutos
```

Antes de realizar um retry, o sistema verifica novamente se:

- o usuário continua ativo;
- a rota continua ativa;
- o e-mail continua habilitado;
- a preferência continua vinculada àquela rota.

Quando essas condições deixam de ser válidas, o retry é cancelado.

### Web Push

A arquitetura de notificações foi preparada para trabalhar com diferentes canais sem refatorar o fluxo principal.

O Web Push está previsto na evolução da versão web atual, mas o transporte e a inscrição do navegador ainda não foram implementados.

---

## ♻️ Guia de descarte consciente

O guia de descarte consciente será uma funcionalidade educativa da interface web.

Ele apresentará informações como:

- materiais recicláveis;
- separação adequada;
- higienização;
- preparação dos resíduos;
- orientações de descarte consciente.

O guia não é um sistema de registro individual de resíduos.

Portanto, nesta versão não existe uma tabela de banco de dados específica para armazenar quais materiais cada usuário descartou.

O conteúdo será disponibilizado diretamente pelo front-end.

---

## 🗺️ Mapas e localização

A base cartográfica definida para o SIMUL é o **OpenStreetMap**.

Na versão atual, o mapa será utilizado para apoiar a apresentação das informações geográficas relacionadas às regiões e rotas cadastradas.

Isso não significa rastreamento em tempo real.

```text
OpenStreetMap na versão atual
→ representação geográfica

GPS futuro
→ posição do caminhão em tempo real
```

São funcionalidades diferentes.

---

## 🗄️ Banco de dados

O SIMUL utiliza PostgreSQL.

A evolução estrutural do banco é controlada pelo Flyway.

O Hibernate é utilizado em modo de validação:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

Isso significa que alterações estruturais devem ser realizadas por migrations e não criadas automaticamente pelo Hibernate.

---

## ⚙️ Variáveis de ambiente

Informações sensíveis não devem ser inseridas diretamente no código-fonte.

Entre as variáveis utilizadas estão:

```text
DB_URL
DB_USERNAME
DB_PASSWORD

JWT_SECRET
JWT_EXPIRATION_SECONDS

SMTP_HOST
SMTP_PORT
SMTP_USERNAME
SMTP_PASSWORD
SMTP_FROM

SIMUL_TIME_ZONE
NOTIFICACAO_SCHEDULER_ENABLED
SIMUL_CORS_ALLOWED_ORIGINS
```

Em desenvolvimento, essas variáveis podem ser configuradas localmente.

Em produção, deverão ser configuradas no ambiente de hospedagem.

Credenciais reais não devem ser incluídas no repositório.

---

## 🚀 Executando o back-end

### Pré-requisitos

- JDK 21
- PostgreSQL
- banco de dados criado e acessível
- variáveis de ambiente configuradas

Entre na pasta:

```powershell
cd backend
```

Verifique o Java:

```powershell
java -version
```

A versão utilizada pelo projeto deve ser Java 21.

Execute os testes:

```powershell
.\mvnw.cmd clean test
```

Execute a aplicação:

```powershell
.\mvnw.cmd spring-boot:run
```

Por padrão, o back-end é disponibilizado localmente em:

```text
http://localhost:8080
```

---

## 🌐 Front-end

O front-end será desenvolvido com:

```text
React.js
+
Vite
```

Durante o desenvolvimento local, a origem prevista é:

```text
http://localhost:5173
```

O CORS do back-end já está preparado para aceitar origens configuráveis por ambiente.

A implementação do front-end será iniciada após a consolidação da base atual do back-end.

---

## 🧪 Testes

O projeto possui testes automatizados para regras críticas do sistema.

Entre os fluxos cobertos estão:

- cronogramas;
- cálculo da próxima coleta;
- cálculo do momento de notificação;
- processamento individual;
- processamento em lote;
- scheduler;
- histórico de notificações;
- deduplicação;
- retry;
- cancelamento de retry inválido;
- preferências de notificação;
- consulta de rotas;
- rotas inativas;
- cadastro de usuários;
- criptografia de senha;
- autenticação;
- normalização de e-mail;
- perfis `USUARIO` e `ADMIN`;
- usuário inativo;
- CORS;
- respostas de erro da API;
- acesso público;
- autenticação obrigatória;
- autorização administrativa;
- bloqueio de usuários comuns em recursos administrativos.

A suíte completa deve permanecer com:

```text
Failures: 0
Errors: 0
```

antes de uma alteração ser considerada consolidada.

---

## 📊 Estado atual do projeto

### Back-end

```text
Base Java 21 / Spring Boot          ✅
PostgreSQL                          ✅
Flyway                              ✅
Usuários                            ✅
JWT                                 ✅
BCrypt                              ✅
Autorização                         ✅
CORS                                ✅
Rotas                               ✅
Áreas atendidas                     ✅
Cronogramas                         ✅
Consulta pública                    ✅
Preferências de notificação         ✅
SMTP                                ✅
Scheduler                           ✅
Histórico                           ✅
Deduplicação                        ✅
Retry                               ✅
Testes principais                   ✅
```

### Front-end

```text
React + Vite                        ⏳
Consulta pública visual             ⏳
Cadastro / login                    ⏳
Preferências                        ⏳
Guia de descarte                    ⏳
Painel administrativo               ⏳
OpenStreetMap                       ⏳
Web Push                            ⏳
```

### Futuro

```text
Aplicativo mobile                   🔮
GPS dos veículos                    🔮
Rastreamento em tempo real          🔮
Alertas de aproximação              🔮
```

---

## 🧭 Primeiro fluxo integrado previsto

```text
Morador acessa o SIMUL
        ↓
Informa sua cidade e bairro
        ↓
Sistema encontra área atendida
        ↓
Apresenta rota oficial
        ↓
Apresenta dias e horários
        ↓
Morador pode criar uma conta
        ↓
Configura lembrete
        ↓
Backend processa automaticamente
        ↓
Morador recebe a notificação
```

---

## 👥 Equipe

- Caio Vinicius Souza Martins
- Davi Martins Alexandre
- Enzo Aquino Guimarães
- Fernando Papacosta Porta Pereira
- Renato Borges Campos

---

## 🎓 Projeto acadêmico

**SIMUL — Sistema Integrado de Monitoramento Urbano de Limpeza**

Faculdade SENAI FATESG  
Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas  
Goiânia — 2026

---

## 📌 Observação sobre evolução do projeto

O SIMUL está sendo desenvolvido de forma incremental.

As funcionalidades classificadas como futuras não fazem parte da entrega acadêmica atual e não devem ser interpretadas como já implementadas.

O projeto mantém uma arquitetura preparada para evolução sem adicionar complexidade desnecessária à primeira versão.