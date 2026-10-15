require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

app.use(cors());
app.use(express.json());


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// Lista de horários da Linha 08 (IFSC Seminário)
const horariosSeminario = [
    "05:35", "06:10", "06:35", "06:50", "07:10",
    "07:30", "07:45", "08:05", "08:20", "09:00",
    "09:40", "10:20", "11:00", "11:35", "11:45",
    "12:10", "12:20", "12:40", "13:05", "13:15",
    "13:30", "13:50", "14:20", "14:50", "15:30",
    "16:00", "16:15", "16:30", "16:50", "17:15",
    "17:20", "17:35", "17:45", "18:00", "18:10",
    "18:25", "18:35", "18:45", "19:00", "19:30",
    "20:00", "20:40", "21:15", "21:45", "21:55",
    "22:10", "22:40", "23:00"
];

// Lista de horários da Linha 26 (IFSC Progresso)
const horariosProgresso = [
    "04:50", "05:30", "05:55", "06:20", "06:45",
    "07:05", "07:20", "07:40", "08:00", "08:40",
    "09:20", "10:00", "10:40", "11:20", "11:40",
    "12:05", "12:35", "12:50", "13:20", "13:40",
    "14:20", "15:00", "15:40", "16:20", "17:00",
    "17:40", "18:05", "18:20", "18:50", "19:20",
    "20:10", "20:50", "21:30", "22:00", "22:40",
    "23:00", "23:40"
];


// Tempo estimado de viagem de cada linha
const TEMPO_SEMINARIO = "15-25";
const TEMPO_PROGRESSO = "8-15";


// Monta o array final de horários combinando as duas linhas
const horarios = [];

horariosSeminario.forEach((h, i) => {
    horarios.push({
        id: i + 1,
        linha: "Linha 08",
        origem: "Terminal Urbano",
        destino: "IFSC Seminário",
        horario: h,
        tempoEstimado: TEMPO_SEMINARIO
    });
});

horariosProgresso.forEach((h, i) => {
    horarios.push({
        id: 100 + i,
        linha: "Linha 26",
        origem: "Terminal Urbano",
        destino: "IFSC Progresso",
        horario: h,
        tempoEstimado: TEMPO_PROGRESSO
    });
});


// Rota que devolve a lista de horários das linhas 08 e 26 em formato JSON
app.get("/api/horarios", (req, res) => {
    res.json(horarios);
});


// Rota que calcula quantos dias o saldo do cartão dura, considerando integração
app.post("/api/calcular-saldo", (req, res) => {

    const { saldo, valorPassagem, viagensPorDia } = req.body;

    if (
        saldo === undefined ||
        valorPassagem === undefined ||
        viagensPorDia === undefined
    ) {
        return res.status(400).json({
            erro: "Informe saldo, valor da passagem e viagens por dia."
        });
    }

    if (saldo < 0 || valorPassagem <= 0 || viagensPorDia <= 0) {
        return res.status(400).json({
            erro: "Informe valores válidos."
        });
    }

    const viagensDisponiveisSemIntegracao =
        Math.floor(saldo / valorPassagem);

    const diasSemIntegracao =
        Math.floor(viagensDisponiveisSemIntegracao / viagensPorDia);

    const passagensCobradasPorDia =
        Math.ceil(viagensPorDia / 2);

    const custoDiarioComIntegracao =
        passagensCobradasPorDia * valorPassagem;

    const diasComIntegracao =
        Math.floor(saldo / custoDiarioComIntegracao);

    const custoDiarioSemIntegracao =
        viagensPorDia * valorPassagem;

    const economiaPorDia =
        custoDiarioSemIntegracao - custoDiarioComIntegracao;

    const economiaTotal =
        economiaPorDia * diasComIntegracao;

    const saldoRestante =
        saldo - (diasComIntegracao * custoDiarioComIntegracao);

    res.json({

        saldoAtual: saldo,
        valorPassagem: valorPassagem,
        viagensPorDia: viagensPorDia,

        viagensDisponiveisSemIntegracao: viagensDisponiveisSemIntegracao,
        diasSemIntegracao: diasSemIntegracao,

        passagensCobradasPorDia: passagensCobradasPorDia,
        custoDiarioComIntegracao: Number(custoDiarioComIntegracao.toFixed(2)),
        diasComIntegracao: diasComIntegracao,
        saldoRestante: Number(saldoRestante.toFixed(2)),

        economiaPorDia: Number(economiaPorDia.toFixed(2)),
        economiaTotal: Number(economiaTotal.toFixed(2))

    });

});


// Retorna a hora atual no formato HH:MM
function horaAgora() {
    const agora = new Date();
    const hh = String(agora.getHours()).padStart(2, "0");
    const mm = String(agora.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}


// Encontra o próximo horário da lista com base na hora atual
function proximoHorario(lista) {

    const agoraStr = horaAgora();

    const futuros = lista
        .filter(h => h.horario > agoraStr)
        .sort((a, b) => a.horario.localeCompare(b.horario));

    if (futuros.length > 0) return futuros[0];
    return lista[0];
}


// Monta o contexto com os dados reais que será enviado ao Gemini
function montarContexto() {

    const proximoSeminario = proximoHorario(
        horarios.filter(h => h.destino === "IFSC Seminário")
    );

    const proximoProgresso = proximoHorario(
        horarios.filter(h => h.destino === "IFSC Progresso")
    );

    return `
Você é o assistente virtual do IFSC Mobilidade, um sistema acadêmico de
consulta de horários e informações sobre o transporte público de Chapecó - SC.

## Dados reais do sistema

Hora atual do servidor: ${horaAgora()}

### Linhas que vão para o IFSC
- Linha 08 (IFSC Seminário) - sai do Terminal Urbano, tempo estimado 15-25 min
- Linha 26 (IFSC Progresso) - sai do Terminal Urbano, tempo estimado 8-15 min

### Próximo ônibus (baseado na hora atual)
- IFSC Seminário: ${proximoSeminario.linha} às ${proximoSeminario.horario}
- IFSC Progresso: ${proximoProgresso.linha} às ${proximoProgresso.horario}

### Primeiros horários do dia
- Linha 08 (Seminário): ${horariosSeminario.slice(0, 6).join(", ")}
- Linha 26 (Progresso): ${horariosProgresso.slice(0, 6).join(", ")}

### Tarifa
- Cartão estudante: R$ 2,45 por passagem

### Regras de integração tarifária temporal de Chapecó
- Válida por até 1 hora entre as viagens
- Vale em qualquer ponto de embarque e desembarque do município
- NÃO vale em linhas sobrepostas
- NÃO vale retornando ao ponto de origem
- Cartões estudante, passe urbano e vale transporte têm direito a
  1 integração a cada 2 passagens pagas
- Cartões gratuitos registram a passagem normalmente

### Atendimento presencial do cartão
- Auto Viação Chapecó
- Rua Clevelândia, 75d - dentro do Terminal Urbano de Chapecó
- Segunda a sexta, das 07:00 às 19:00

### Documentos para o primeiro cartão
- RG e CPF
- Comprovante de residência (nome do estudante ou dos pais)
- Atestado de frequência carimbado e assinado pela instituição
- Alunos da UNOCHAPECÓ, UNOESC, SENAI, UFFS, IFSC, UCEFF e UDESC
  precisam apenas de RG e CPF

### Recarga on-line
- Disponível para alunos das instituições integradas
- Gera boleto bancário
- Crédito disponível em até 2 dias úteis

## Instruções de comportamento
- Responda sempre em português do Brasil
- Seja direto e objetivo - no máximo 5 linhas por resposta
- Use os dados acima para dar respostas precisas
- Se a pergunta for sobre algo que você não sabe, diga que não tem
  essa informação e sugira consultar a Auto Viação Chapecó
- Não invente horários, valores ou endereços
- Não use emojis
`;
}


// Rota que envia a pergunta do usuário ao Gemini e devolve a resposta gerada
app.post("/api/ia", async (req, res) => {

    const { mensagem } = req.body;

    if (!mensagem || typeof mensagem !== "string") {
        return res.status(400).json({
            erro: "Envie uma mensagem de texto."
        });
    }

    try {

        const model = genAI.getGenerativeModel({
            model: "gemini-3.8-flash",
            systemInstruction: montarContexto()
        });

        const resultado = await model.generateContent(mensagem);

        const resposta = resultado.response.text();

        res.json({
            pergunta: mensagem,
            resposta: resposta
        });

    } catch (erro) {

        console.log("===== ERRO NA IA =====");
        console.log("Nome:", erro.name);
        console.log("Mensagem:", erro.message);
        console.log("Status:", erro.status);
        console.log("======================");

        res.status(500).json({
            erro: "Não foi possível gerar a resposta no momento.",
            detalhe: erro.message || String(erro),
            nome: erro.name || "Desconhecido",
            status: erro.status || null
        });

    }

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("IFSC Mobilidade funcionando!");
    console.log(`Servidor: http://localhost:${PORT}`);
});