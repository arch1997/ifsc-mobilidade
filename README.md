# IFSC Mobilidade

Aplicação web que centraliza informações sobre o transporte público
de Chapecó para estudantes que vão ao IFSC, com consulta de horários,
cálculo de saldo do cartão estudante e um assistente com IA generativa.

---

## Problema

Alunos do IFSC dependem de duas linhas de ônibus (Linha 08 — Seminário
e Linha 26 — Progresso) para chegar ao câmpus, mas não existe um canal
único e acessível que reúna horários, regras de integração tarifária e
informações sobre o cartão estudante. Isso gera dúvidas constantes,
perda de ônibus e uso ineficiente do saldo do cartão.

## Solução

Um site com três módulos:

1. **Consulta de horários** — dados das linhas 08 e 26 com filtro por campus.
2. **Calculadora de saldo** — simula quantos dias o saldo dura,
   considerando as regras de integração tarifária temporal de Chapecó.
3. **Assistente com IA** — chat em linguagem natural que responde
   dúvidas sobre horários, tempo de viagem, integração e cartão,
   usando IA generativa real (Google Gemini).

## Papel da IA

O módulo de IA é o **assistente virtual** disponível na aba "Assistente".
Ele recebe a pergunta do usuário em linguagem natural e gera uma
resposta personalizada com base nos dados reais do sistema, que são
injetados como contexto antes da chamada ao modelo.

Isso permite responder perguntas abertas ("quanto tempo até o Seminário?",
"como funciona a integração?", "onde faço o cartão?") sem precisar
cadastrar respostas prontas no código.

**Modelo utilizado:** `gemini-3.8-flash` (Google AI Studio).

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
  ├──► /api/horarios ........... dados locais de horários
  ├──► /api/calcular-saldo ..... regras de integração tarifária
  └──► /api/ia ................. chamada ao Google Gemini
                                     │
                                     ▼
                             API generativa do Google
```

- **Frontend:** HTML, CSS e JavaScript puro (sem frameworks).
- **Backend:** Node.js com Express, retornando JSON.
- **IA:** integração com a API do Google Gemini via SDK oficial.

---

## Como rodar o projeto em 5 passos

### 1. Clonar o repositório e instalar dependências

```bash
git clone https://github.com/arch1997/ifsc-transporte.git
cd ifsc-mobilidade
npm install
```

### 2. Configurar a chave da API do Gemini

Crie um arquivo `.env` na raiz do projeto:

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

- **Aba Horários** — escolha o campus e clique em "Ver horários".
- **Aba Cartão** — preencha saldo, passagem e viagens, clique em "Calcular".
- **Aba Assistente** — envie perguntas em linguagem natural para a IA.

---

## Estrutura de arquivos

```
ifsc-mobilidade/
├── backend/
│   └── server.js          # API Express
├── frontend/
│   ├── index.html         # Interface
│   ├── style.css          # Estilos
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

| Método | Rota                    | Descrição                              |
|--------|-------------------------|----------------------------------------|
| GET    | `/api/horarios`         | Retorna a lista de horários em JSON    |
| POST   | `/api/calcular-saldo`   | Calcula dias restantes do cartão       |
| POST   | `/api/ia`               | Envia pergunta ao assistente com IA    |

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
  saindo às 14:20, com previsão de viagem de 15 a 25 minutos."
}
```

---

## Tecnologias utilizadas

- Node.js
- Express
- Google Generative AI SDK (@google/generative-ai)
- HTML, CSS e JavaScript
- dotenv

---

## Projeto acadêmico

Desenvolvido como MVP para o desafio de aplicação web com IA e
arquitetura full stack integrada.