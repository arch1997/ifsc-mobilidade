require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

app.use(cors());
app.use(express.json());


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


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


const TEMPO_SEMINARIO = "15-25";
const TEMPO_PROGRESSO = "8-15";
const TARIFA = 2.45;


const MODELOS_DISPONIVEIS = [
    "gemini-2.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-2.5-flash",
    "gemini-flash-latest"
];


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


app.get("/api/horarios", (req, res) => {
    res.json(horarios);
});


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

    const viagensDisponiveisSemIntegracao = Math.floor(saldo / valorPassagem);
    const diasSemIntegracao = Math.floor(viagensDisponiveisSemIntegracao / viagensPorDia);
    const passagensCobradasPorDia = Math.ceil(viagensPorDia / 2);
    const custoDiarioComIntegracao = passagensCobradasPorDia * valorPassagem;
    const diasComIntegracao = Math.floor(saldo / custoDiarioComIntegracao);
    const custoDiarioSemIntegracao = viagensPorDia * valorPassagem;
    const economiaPorDia = custoDiarioSemIntegracao - custoDiarioComIntegracao;
    const economiaTotal = economiaPorDia * diasComIntegracao;
    const saldoRestante = saldo - (diasComIntegracao * custoDiarioComIntegracao);

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


function paraMinutos(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}


function paraHorario(total) {
    const h = String(Math.floor(total / 60) % 24).padStart(2, "0");
    const m = String(total % 60).padStart(2, "0");
    return `${h}:${m}`;
}


// Rota que calcula o ônibus ideal para ida ou volta do IFSC
app.post("/api/agenda", (req, res) => {

    const { modo, campus, horarioUsuario } = req.body;

    if (!modo || (modo !== "ida" && modo !== "volta")) {
        return res.status(400).json({
            erro: "Informe o modo: 'ida' ou 'volta'."
        });
    }

    if (!horarioUsuario || !/^\d{2}:\d{2}$/.test(horarioUsuario)) {
        return res.status(400).json({
            erro: "Informe o horário no formato HH:MM."
        });
    }

    const destinoFinal = campus === "IFSC Progresso" ? "IFSC Progresso" : "IFSC Seminário";
    const tempoMinimo = destinoFinal === "IFSC Seminário" ? 15 : 8;
    const tempoMaximo = destinoFinal === "IFSC Seminário" ? 25 : 15;

    const horariosDaLinha = horarios
        .filter(h => h.destino === destinoFinal)
        .sort((a, b) => a.horario.localeCompare(b.horario));

    const minutosUsuario = paraMinutos(horarioUsuario);

    let resultado = {};

    if (modo === "ida") {

        const margem = 5;
        const limiteSaida = minutosUsuario - tempoMaximo - margem;

        let ideal = null;
        for (const h of horariosDaLinha) {
            const min = paraMinutos(h.horario);
            if (min <= limiteSaida) {
                ideal = h;
            } else {
                break;
            }
        }

        if (!ideal) {
            return res.status(404).json({
                erro: "Não encontramos ônibus que chegue a tempo. Considere pegar o primeiro do dia."
            });
        }

        const saida = paraMinutos(ideal.horario);
        const chegadaMin = saida + tempoMinimo;
        const chegadaMax = saida + tempoMaximo;

        resultado = {
            modo: "ida",
            linha: ideal.linha,
            campus: destinoFinal,
            horarioOnibus: ideal.horario,
            chegadaMin: paraHorario(chegadaMin),
            chegadaMax: paraHorario(chegadaMax),
            horarioDesejado: horarioUsuario,
            margemSobra: minutosUsuario - chegadaMax,
            tempoEstimado: ideal.tempoEstimado
        };

    } else {

        const tempoEmbarque = 8;
        const tempoViagemMedio = tempoMaximo + tempoEmbarque;

        let melhor = null;
        let menorDiferenca = Infinity;

        for (const h of horariosDaLinha) {
            const saidaTerminal = paraMinutos(h.horario);
            const chegadaIFSC = saidaTerminal + tempoViagemMedio;
            const diferenca = chegadaIFSC - minutosUsuario;
            if (diferenca >= 0 && diferenca < menorDiferenca) {
                menorDiferenca = diferenca;
                melhor = {
                    horario: h.horario,
                    linha: h.linha,
                    tempoEstimado: h.tempoEstimado,
                    chegadaIFSC: chegadaIFSC
                };
            }
        }

        if (!melhor) {
            return res.status(404).json({
                erro: "Não há mais ônibus do IFSC depois desse horário."
            });
        }

        const saidaIFSC = melhor.chegadaIFSC;
        const chegadaTerminal = saidaIFSC + tempoViagemMedio;

        resultado = {
            modo: "volta",
            linha: melhor.linha,
            campus: destinoFinal,
            horarioSaidaUsuario: horarioUsuario,
            horarioOnibus: paraHorario(saidaIFSC),
            chegadaMin: paraHorario(chegadaTerminal),
            chegadaMax: paraHorario(chegadaTerminal + 8),
            espera: menorDiferenca,
            tempoEstimado: melhor.tempoEstimado
        };

    }

    res.json(resultado);

});


function horaAgora() {
    const agora = new Date();
    const hh = String(agora.getHours()).padStart(2, "0");
    const mm = String(agora.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}


function dataCompleta() {
    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, "0");
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const ano = agora.getFullYear();
    return `${dia}/${mes}/${ano}`;
}


function diasAteOFimDoMes() {
    const agora = new Date();
    const ultimoDia = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).getDate();
    return ultimoDia - agora.getDate();
}


function diaDoMesAtual() {
    return new Date().getDate();
}


function proximoHorario(lista) {
    const agoraStr = horaAgora();
    const futuros = lista
        .filter(h => h.horario > agoraStr)
        .sort((a, b) => a.horario.localeCompare(b.horario));
    if (futuros.length > 0) return futuros[0];
    return lista[0];
}


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

Data de hoje: ${dataCompleta()}
Hora atual do servidor: ${horaAgora()}
Dia do mês atual: dia ${diaDoMesAtual()}
Dias que faltam até o fim do mês: ${diasAteOFimDoMes()}
Valor da passagem estudante: R$ ${TARIFA.toFixed(2)}

### Linhas que vão para o IFSC
- Linha 08 (IFSC Seminário) - sai do Terminal Urbano, tempo estimado 15-25 min
- Linha 26 (IFSC Progresso) - sai do Terminal Urbano, tempo estimado 8-15 min

### Próximo ônibus (baseado na hora atual)
- IFSC Seminário: ${proximoSeminario.linha} às ${proximoSeminario.horario}
- IFSC Progresso: ${proximoProgresso.linha} às ${proximoProgresso.horario}

### Horários completos das linhas

**Linha 08 (IFSC Seminário)**:
${horariosSeminario.join(", ")}

**Linha 26 (IFSC Progresso)**:
${horariosProgresso.join(", ")}

### Aulas do IFSC (turno da tarde)
- Início: 13h30
- Intervalo: 15h20
- Fim: 17h00 (podendo estender até 17h30)

## REGRA DE INTEGRAÇÃO TARIFÁRIA

- Vale por até 1 hora entre viagens
- 1 integração a cada 2 passagens pagas
- Ou seja: em 2 viagens, o aluno paga apenas 1 passagem (R$ ${TARIFA.toFixed(2)})
- Em 4 viagens, paga 2 passagens (R$ ${(TARIFA * 2).toFixed(2)})
- Fórmula: passagens pagas = arredondar pra cima (viagens ÷ 2)

## COMO CALCULAR SALDO — REGRAS GERAIS

### Fórmulas básicas

**Passagens pagas por dia:**
- passagensPagasDia = arredondar_pra_cima(viagensPorDia ÷ 2)

**Custo por dia:**
- custoDiario = passagensPagasDia × ${TARIFA.toFixed(2)}

**Saldo restante após X dias:**
- saldoRestante = saldo − (X × custoDiario)

**Dias que o saldo ainda dura:**
- diasRestantes = arredondar_pra_baixo(saldoAtual ÷ custoDiario)

### Regras de comportamento

1. SEMPRE use R$ ${TARIFA.toFixed(2)} como valor da passagem
2. Se o usuário não informar viagens por dia, ASSUMA 2 (ida e volta)
3. Se o usuário não informar o saldo, PERGUNTE antes de calcular
4. Nunca diga "não tenho essa informação" para perguntas de cálculo
5. Responda em no máximo 4 frases
6. Sempre mostre o cálculo de forma resumida na resposta
7. Se sobrar saldo, mencione quanto sobra

## CÁLCULO SIMPLES (sem histórico)

**Exemplo:** "Tenho 100 reais, faço 2 viagens por dia, quanto tempo dura?"
- Passagens pagas por dia: ceil(2÷2) = 1
- Custo diário: 1 × 2,45 = R$ 2,45
- Dias: floor(100 ÷ 2,45) = 40 dias
- Resposta: "Com R$ 100 e 2 viagens por dia, seu saldo dura cerca de 40 dias."

## CÁLCULO COM HISTÓRICO (recarga em data passada)

**PASSO 1 — Descobrir quantos dias se passaram**
- diasPassados = diaDoMesAtual − diaDaRecarga

**PASSO 2 — Calcular quantos dias o aluno realmente foi**
- Comece com diasPassados
- Se o usuário disser que faltou X dias, subtraia: diasUsados = diasPassados − faltas
- Se não houver info de faltas, use diasPassados

**PASSO 3 — Calcular o saldo já gasto**
- saldoGasto = diasUsados × passagensPagasDia × ${TARIFA.toFixed(2)}

**PASSO 4 — Calcular o saldo restante**
- saldoRestante = saldoInicial − saldoGasto

**PASSO 5 — Calcular quantos dias ainda dura**
- diasRestantes = floor(saldoRestante ÷ (passagensPagasDia × ${TARIFA.toFixed(2)}))

**PASSO 6 — Comparar com o fim do mês**
- Use "Dias que faltam até o fim do mês" do topo do contexto

### Exemplos completos

**Exemplo 1:** "Recarreguei 100 reais dia 2, faço 2 viagens por dia, quanto tenho agora?"
- Hoje é dia 8, então: 8 − 2 = 6 dias
- Passagens pagas por dia: 1
- Saldo gasto: 6 × 1 × 2,45 = R$ 14,70
- Saldo atual: R$ 85,30
- Dias restantes: floor(85,30 ÷ 2,45) = 34 dias

**Exemplo 2:** "Recarreguei 50 reais dia 5, faço 2 viagens por dia, dá até o fim do mês?"
- Hoje é dia 8, então: 8 − 5 = 3 dias
- Saldo gasto: 3 × 1 × 2,45 = R$ 7,35
- Saldo atual: R$ 42,65
- Dias restantes: 17 dias
- Faltam 22 dias pro fim do mês → NÃO dá

**Exemplo 3:** "Recarreguei 20 reais dia 1, faço 2 viagens por dia, ainda tenho?"
- Hoje é dia 8: 8 − 1 = 7 dias
- Saldo gasto: 7 × 1 × 2,45 = R$ 17,15
- Saldo atual: R$ 2,85
- Dura mais 1 dia

## OUTRAS INFORMAÇÕES

### Atendimento presencial
- Auto Viação Chapecó
- Rua Clevelândia, 75d — Terminal Urbano de Chapecó
- Segunda a sexta, 07:00 às 19:00

### Documentos para o primeiro cartão
- RG e CPF
- Comprovante de residência
- Atestado de frequência
- Alunos da UNOCHAPECÓ, UNOESC, SENAI, UFFS, IFSC, UCEFF e UDESC: apenas RG e CPF

### Recarga on-line
- Disponível para alunos das instituições integradas
- Gera boleto bancário
- Crédito em até 2 dias úteis

## REGRAS FINAIS DE COMPORTAMENTO

- Responda SEMPRE em português do Brasil
- Seja direto e objetivo
- NUNCA invente valores — use sempre R$ ${TARIFA.toFixed(2)} como passagem
- NUNCA diga "não tenho essa informação" para perguntas de cálculo
- Não use emojis
`;
}


async function tentarModelo(nomeModelo, mensagem) {

    const model = genAI.getGenerativeModel({
        model: nomeModelo,
        systemInstruction: montarContexto()
    });

    try {
        return await model.generateContent(mensagem);
    } catch (erro) {
        console.log(`Primeira tentativa com ${nomeModelo} falhou. Tentando de novo em 1s...`);
        await new Promise(r => setTimeout(r, 1000));
        return await model.generateContent(mensagem);
    }

}


app.post("/api/ia", async (req, res) => {

    const { mensagem } = req.body;

    if (!mensagem || typeof mensagem !== "string") {
        return res.status(400).json({
            erro: "Envie uma mensagem de texto."
        });
    }

    let resultado = null;
    let ultimoErro = null;
    let modeloUsado = null;

    for (const nomeModelo of MODELOS_DISPONIVEIS) {

        try {

            console.log(`Tentando modelo: ${nomeModelo}`);

            resultado = await tentarModelo(nomeModelo, mensagem);
            modeloUsado = nomeModelo;

            console.log(`Sucesso com: ${nomeModelo}`);
            break;

        } catch (erro) {

            console.log(`Falhou ${nomeModelo}: ${erro.message}`);
            ultimoErro = erro;

            await new Promise(r => setTimeout(r, 600));

        }

    }

    if (!resultado) {

        console.log("========== TODOS OS MODELOS FALHARAM ==========");
        console.log("Último erro:", ultimoErro ? ultimoErro.message : "desconhecido");
        console.log("================================================");

        return res.status(500).json({
            erro: "Não foi possível gerar a resposta no momento.",
            detalhe: ultimoErro ? ultimoErro.message : "Todos os modelos falharam",
            modelosTentados: MODELOS_DISPONIVEIS
        });

    }

    const resposta = resultado.response.text();

    res.json({
        pergunta: mensagem,
        resposta: resposta,
        modelo: modeloUsado
    });

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("IFSC Mobilidade funcionando!");
    console.log(`Servidor: http://localhost:${PORT}`);
});