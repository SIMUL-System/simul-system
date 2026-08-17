# SIMUL — Sistema Integrado de Monitoramento Urbano de Limpeza

Plataforma web voltada à consulta de informações programadas da coleta seletiva, com o objetivo de melhorar a previsibilidade para os moradores e reduzir esquecimentos e descarte inadequado de resíduos recicláveis.

O SIMUL permite consultar regiões atendidas, rotas, dias e horários da coleta seletiva e oferece lembretes automáticos para usuários cadastrados.

> Projeto acadêmico desenvolvido no curso de Análise e Desenvolvimento de Sistemas da Faculdade SENAI FATESG — Goiânia, 2026.

## 🎯 Objetivo

A falta de previsibilidade sobre os dias e horários da coleta seletiva pode fazer com que moradores esqueçam de disponibilizar os resíduos no momento adequado ou realizem o descarte de forma incorreta.

O SIMUL busca centralizar essas informações em uma plataforma web simples e acessível.

A consulta das informações da coleta é pública. Usuários cadastrados podem configurar preferências para receber lembretes automaticamente, mesmo quando não estiverem utilizando o site.

## ✨ Funcionalidades

### Implementadas no back-end

- 🔎 Consulta pública de coleta seletiva por cidade e bairro
- 🗺️ Associação entre áreas atendidas, rotas e cronogramas
- 📅 Consulta de dias e horários programados da coleta
- 👤 Cadastro e autenticação de usuários
- 🔐 Autenticação stateless utilizando JWT
- 🔒 Armazenamento de senhas com BCrypt
- 🔔 Preferências personalizadas de notificação
- ✉️ Envio de lembretes por e-mail utilizando SMTP
- ⏰ Processamento automático de notificações por scheduler
- 🧾 Histórico e deduplicação de notificações
- 🔄 Política controlada de retry para falhas de envio
- 🛡️ Controle de acesso para funcionalidades administrativas

### Em desenvolvimento

- 🌐 Interface web em React.js com Vite
- 🗺️ Integração visual com OpenStreetMap
- 🔔 Canal Web Push para navegadores compatíveis
- 🖥️ Interface do painel administrativo
- ♻️ Guia visual de descarte consciente

### Funcionalidades futuras

- 📱 Aplicativo mobile
- 🚛 Rastreamento em tempo real do caminhão de coleta
- 📍 Localização GPS dos veículos
- 🔔 Alertas baseados na aproximação do caminhão

O rastreamento em tempo real não faz parte da versão acadêmica atual. A arquitetura é mantida preparada para permitir essa evolução posteriormente.

## 👥 Perfis de uso

### Visitante

Pode consultar gratuitamente as informações da coleta seletiva e acessar o guia de descarte consciente sem necessidade de cadastro.

### Usuário cadastrado

Além das consultas públicas, pode configurar preferências de notificação para receber lembretes automáticos da coleta.

O envio é realizado pelo back-end e não depende de o usuário estar com o site aberto ou autenticado no momento do disparo.

### Administrador

Possui acesso protegido às funcionalidades de gerenciamento das informações utilizadas pela plataforma, como rotas e cronogramas.

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
| Segurança | Spring Security + JWT + BCrypt |
| Notificações | SMTP + arquitetura Strategy |
| Mapas | OpenStreetMap |
| Hospedagem prevista | Render |
| Versionamento | Git + GitHub |
| IDE | Visual Studio Code |

## 🏗️ Arquitetura

O back-end utiliza uma arquitetura de **monólito modular por domínio**.

Os principais domínios atuais são:

```text
business/
├── usuario/
├── rota/
├── cronograma/
└── notificacao/
```

Código transversal e reutilizável é mantido em:

```text
core/
├── config/
├── exception/
└── security/
```

O projeto não utiliza microserviços nesta versão.

A comunicação entre as camadas segue, de forma geral:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
PostgreSQL
```

Controllers não acessam repositories diretamente.

## 📁 Estrutura do Repositório

```text
simul-system/
├── backend/          # API Java / Spring Boot
├── frontend/         # Plataforma web React + Vite
├── mobile/           # Reservado para evolução mobile futura
├── docs/             # Documentação acadêmica e técnica
├── .vscode/          # Configurações do ambiente de desenvolvimento
└── README.md
```

A existência da pasta `mobile/` representa somente uma preparação organizacional para uma versão futura e não significa que exista aplicativo mobile na entrega atual.

## 🚀 Executando o Back-end

### Pré-requisitos

- JDK 21
- PostgreSQL
- Maven Wrapper incluído no projeto
- Banco de dados configurado
- Variáveis de ambiente necessárias

Entre na pasta:

```powershell
cd backend
```

Execute os testes:

```powershell
.\mvnw.cmd clean test
```

Execute a aplicação:

```powershell
.\mvnw.cmd spring-boot:run
```

## 🔐 Variáveis de ambiente

Credenciais e informações sensíveis não devem ser inseridas diretamente no código-fonte.

Entre as configurações utilizadas pelo back-end estão:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
