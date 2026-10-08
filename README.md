# IFSC Mobilidade

Aplicação web full stack que centraliza informações sobre o
transporte público de Chapecó para estudantes que vão ao IFSC.
Inclui consulta de horários, cálculo de saldo do cartão estudante,
planejamento de agenda e um assistente virtual com inteligência
artificial generativa.

---

## Problema

Alunos do IFSC dependem das linhas 08 (Seminário) e 26 (Progresso)
para chegar ao câmpus, mas não existe um canal único e acessível
que reúna horários, regras de integração tarifária e informações
sobre o cartão estudante. Isso gera dúvidas constantes, perda de
ônibus e uso ineficiente do saldo do cartão.

## Solução

Uma aplicação web com quatro módulos integrados:

1. **Consulta de horários** — dados completos das linhas 08 e 26,
   com filtro por campus e destaque dos próximos horários.

2. **Calculadora de saldo** — simula quantos dias o saldo dura,
   aplicando as regras de integração tarifária temporal de Chapecó
   (1 integração a cada 2 passagens pagas).

3. **Agenda de transporte** — o usuário informa o horário que quer
   chegar no IFSC ou o horário que sai da aula, e o sistema calcula
   qual ônibus pegar, com margem de segurança.

4. **Assistente com IA** — chat em linguagem natural que responde
   dúvidas sobre horários, cálculo de saldo, integração e cartão,
   usando IA generativa real do Google Gemini.

## Papel da IA

O assistente virtual é o módulo de IA do projeto. Ele recebe a
pergunta do usuário em linguagem natural e gera uma resposta
personalizada com base nos dados reais do sistema, injetados
como contexto antes da chamada ao modelo.

Isso permite responder perguntas abertas sem precisar cadastrar
respostas prontas no código. Exemplos:

- "Qual o próximo ônibus para o Seminário?"
- "Recarreguei 100 reais dia 2, faço 4 viagens por dia, quanto tenho?"
- "Como funciona a integração tarifária?"
- "Quanto tempo leva até o Progresso?"

**Modelo utilizado:** `gemini-2.5-flash-lite` (Google AI Studio),
com fallback automático entre 4 modelos em caso de sobrecarga.

## Arquitetura

```
Usuário
  │
  ▼
Frontend (HTML + CSS + JS)
  │  fetch() ──► HTTP/JSON
  ▼
Backend (Node.js + Express)
  │
  ├──► GET  /api/horarios ......... lista de horários das linhas
  ├──► POST /api/calcular-saldo ... cálculo de saldo com integração
  ├──► POST /api/agenda ........... cálculo de ida e volta do IFSC
  └──► POST /api/ia ............... chamada ao Google Gemini
                                       │
                                       ▼
                                Google Gemini API
                                (geração de texto)
```

- **Frontend:** HTML, CSS e JavaScript puro (sem frameworks).
- **Backend:** Node.js com Express, retornando JSON.
- **IA:** integração com a API do Google Gemini via SDK oficial.

---

## Como rodar o projeto em 5 passos

### 1. Clonar o repositório e instalar dependências

```bash
git clone https://github.com/arch1997/ifsc-mobilidade.git
cd ifsc-mobilidade
npm install
```

### 2. Configurar a chave da API do Gemini

Crie um arquivo `.env` na raiz do projeto copiando o exemplo:

```bash
cp .env.example .env
```

Depois edite o `.env` e insira sua chave:

```
GEMINI_API_KEY=sua_chave_aqui
PORT=3000
```

Para gerar uma chave gratuita: https://aistudio.google.com/app/apikey

### 3. Iniciar o servidor

```bash
node backend/server.js
```

O terminal deve exibir:

```
IFSC Mobilidade funcionando!
Servidor: http://localhost:3000
```

### 4. Abrir o frontend

Abra o arquivo `frontend/index.html` diretamente no navegador
(duplo clique no arquivo) ou use a extensão Live Server do VS Code.

### 5. Testar a aplicação

- **Início** — apresentação do projeto
- **Assistente** — envie perguntas em linguagem natural para a IA
- **Horários** — escolha o campus e veja os horários
- **Agenda** — informe um horário e veja qual ônibus pegar
- **Cartão** — calcule quantos dias o saldo dura

---

## Estrutura de arquivos

```
ifsc-mobilidade/
├── backend/
│   └── server.js          # API Express com 4 rotas autorais
├── frontend/
│   ├── index.html         # Interface com 5 telas
│   ├── style.css          # Estilos responsivos
│   ├── script.js          # Lógica de chamadas à API
│   └── imgs/              # Imagens do projeto
├── .env.example           # Modelo de variáveis de ambiente
├── .gitignore             # Arquivos ignorados pelo Git
├── package.json
├── package-lock.json
└── README.md
```

---

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/horarios` | Lista horários das linhas 08 e 26 |
| POST | `/api/calcular-saldo` | Calcula dias restantes do cartão |
| POST | `/api/agenda` | Calcula ônibus ideal para ida ou volta |
| POST | `/api/ia` | Assistente com IA generativa |

### Exemplo — `/api/calcular-saldo`

**Requisição:**

```json
POST /api/calcular-saldo
{
  "saldo": 50,
  "valorPassagem": 2.45,
  "viagensPorDia": 2
}
```

**Resposta:**

```json
{
  "saldoAtual": 50,
  "diasSemIntegracao": 10,
  "diasComIntegracao": 20,
  "economiaTotal": 24.5
}
```

### Exemplo — `/api/ia`

**Requisição:**

```json
POST /api/ia
{
  "mensagem": "qual o próximo ônibus para o seminário?"
}
```

**Resposta:**

```json
{
  "pergunta": "qual o próximo ônibus para o seminário?",
  "resposta": "O próximo ônibus para o IFSC Seminário é a Linha 08,
  saindo às 14:20, com previsão de viagem de 15 a 25 minutos.",
  "modelo": "gemini-2.5-flash-lite"
}
```

---

## Tecnologias utilizadas

- **Node.js** — runtime do backend
- **Express** — framework HTTP
- **@google/generative-ai** — SDK oficial do Gemini
- **dotenv** — variáveis de ambiente
- **HTML5, CSS3, JavaScript (ES6+)** — frontend sem frameworks

---

## Projeto acadêmico

Desenvolvido como MVP para o desafio de aplicação web com
inteligência artificial e arquitetura full stack integrada,
do curso técnico em Informática do IFSC — Chapecó.