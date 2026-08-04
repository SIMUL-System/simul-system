# SIMUL — Sistema Integrado de Monitoramento Urbano de Limpeza

Plataforma de gestão de resíduos urbanos para Smart Cities, que conecta a administração pública aos cidadãos através de rastreamento em tempo real da coleta seletiva.

## 📋 Sobre o Projeto

A falta de previsibilidade sobre o horário de passagem dos caminhões de coleta seletiva gera acúmulo de resíduos, descarte incorreto e exposição prolongada de lixo nas vias públicas. O SIMUL resolve esse problema disponibilizando, em tempo real, informações sobre itinerários, dias e horários da coleta para os moradores.

Projeto acadêmico desenvolvido no curso de Análise e Desenvolvimento de Sistemas da Faculdade SENAI FATESG (Goiânia, 2026).

## ✨ Funcionalidades

- 🚛 **Rastreamento em tempo real** do caminhão de coleta em mapa interativo
- 🔔 **Notificações push** avisando a aproximação do veículo
- 📅 **Consulta de cronogramas e rotas** por endereço
- ♻️ **Guia de descarte consciente** com orientações de separação de recicláveis
- 🖥️ **Painel administrativo web** para gestão de rotas, horários e avisos

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Front-end (painel admin) | React.js |
| Back-end | Java + Maven |
| Banco de dados | PostgreSQL (pgAdmin) |
| Mapas / Geolocalização | OpenStreetMap ou Google Maps API |
| Notificações | SMTP + alertas visuais |
| Versionamento | Git / GitHub |
| Ambiente de desenvolvimento | Visual Studio Code |

## 📁 Estrutura do Repositório

```
simul-system/
├── backend/          # API Java + Maven
├── frontend/         # Painel administrativo em React.js
├── mobile/           # Aplicativo do cidadão
├── docs/             # Documentação do projeto
├── .vscode/          # Configurações e extensões recomendadas
├── .gitignore
└── README.md
```

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Java 17+ e Maven
- Node.js 18+
- PostgreSQL

### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 👥 Equipe

- Caio Vinicius Souza Martins
- Davi Martins Alexandre
- Enzo Aquino Guimarães
- Fernando Papacosta Porta Pereira
- Renato Borges Campos

## 📄 Licença

Projeto acadêmico — Faculdade SENAI FATESG.
