// ============================================================
// IA LOCAL — IFSC Mobilidade
// Motor de regras + busca na base de conhecimento + memória de conversa
// Funciona 100% offline. Fallback para IA online quando não souber.
// ============================================================

const fs = require("fs");
const path = require("path");

const CAMINHO_BASE = path.join(__dirname, "baseConhecimento.json");

let BASE = null;

function carregarBase() {
    if (!BASE) {
        const conteudo = fs.readFileSync(CAMINHO_BASE, "utf-8");
        BASE = JSON.parse(conteudo);
        console.log("Base de conhecimento carregada - versão", BASE.versao);
    }
    return BASE;
}


// ============================================================
// GÍRIAS E SINÔNIMOS
// ============================================================

const GIRIAS = {
    "pila": "reais", "pilas": "reais", "conto": "reais", "contos": "reais",
    "mangos": "reais", "mango": "reais", "mangas": "reais",
    "onca": "reais", "prata": "reais", "bufunfa": "reais",
    "grana": "reais", "dindin": "reais", "dinhero": "dinheiro",

    "busao": "onibus", "busaum": "onibus", "bus": "onibus",
    "buzu": "onibus", "coletivo": "onibus", "onibos": "onibus",

    "facul": "ifsc", "faculdade": "ifsc", "semi": "seminario",

    "carteira": "cartao", "card": "cartao", "passe": "cartao", "meia": "cartao",

    "me ve": "calcular", "quanto ta": "quanto custa", "quanto e": "quanto custa",
    "vai dar": "calcular", "dura": "calcular", "acaba": "calcular", "sobra": "calcular",
    "da pra": "da para", "vale a pena": "compensa",

    "q horas": "que horas", "q hr": "que horas", "hrs": "horas",
    "min": "minutos", "minuto": "minutos",

    "salve": "ola", "eai": "ola", "e ai": "ola", "opa": "ola", "fala": "ola",
    "blz": "ola", "beleza": "ola", "vlw": "valeu", "flw": "valeu", "tmj": "valeu",

    "oq": "o que", "o q": "o que", "pq": "por que", "qnd": "quando",
    "qdo": "quando", "cm": "como",

    "terminal": "terminal urbano", "rodoviaria": "terminal urbano",
    "centro": "terminal urbano"
};


// ============================================================
// MEMÓRIA DE CONVERSA
// ============================================================

const conversas = {};

function obterContexto(usuarioId) {
    if (!conversas[usuarioId]) {
        conversas[usuarioId] = {
            etapa: null,
            dados: {},
            ultimaCategoria: null
        };
    }
    return conversas[usuarioId];
}

function limparContexto(usuarioId) {
    delete conversas[usuarioId];
}


// ============================================================
// NORMALIZAÇÃO
// ============================================================

function normalizar(texto) {
    let t = texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[?!.,;:]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    for (const [giria, padrao] of Object.entries(GIRIAS)) {
        const regex = new RegExp("\\b" + giria.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "\\b", "g");
        t = t.replace(regex, padrao);
    }

    return t;
}


// ============================================================
// EXTRAÇÃO DE DADOS
// ============================================================

function extrairValor(texto) {
    const match = texto.match(/(\d+[.,]?\d*)\s*(reais)?/);
    if (match) {
        const valor = parseFloat(match[1].replace(",", "."));
        if (!isNaN(valor) && valor > 0 && valor < 100000) return valor;
    }
    return null;
}

function extrairViagens(texto) {
    const match = texto.match(/(\d+)\s*(viagens?|vezes?|idas?)/);
    if (match) return parseInt(match[1]);
    return null;
}

function extrairDiaRecarga(texto) {
    const match = texto.match(/dia\s+(\d{1,2})/);
    if (match) {
        const dia = parseInt(match[1]);
        if (dia >= 1 && dia <= 31) return dia;
    }
    return null;
}

function extrairFaltas(texto) {
    const match = texto.match(/falt(ei|ou|amos)\s+(\d+)|(\d+)\s+faltas?/);
    if (match) return parseInt(match[2] || match[3]);
    return null;
}

function apenasNumero(msg) {
    return /^\d+[.,]?\d*$/.test(msg.trim());
}


// ============================================================
// DETECÇÃO DE INTENÇÃO
// ============================================================

function detectarIntencao(msg) {

    if (/^(ola|bom dia|boa tarde|boa noite|hey|hi)/.test(msg)) return "saudacao";
    if (/^(valeu|obrigado|obrigada|flw|tchau)/.test(msg)) return "agradecimento";
    if (/^(ajuda|help|socorro)/.test(msg)) return "ajuda";

    if (/(recarreguei|coloquei|botei|carreguei).*(dia|ontem)/.test(msg) || /dia\s+\d+/.test(msg))
        return "calculo_historico";

    if (/(tenho|recarreguei|coloquei|botei|carreguei)\s+\d+/.test(msg))
        return "calculo_simples";

    if (/(sem integracao|com integracao|compara)/.test(msg)) return "comparacao";
    if (/(quantos dias|quanto dura|dura quanto|dias? ainda)/.test(msg)) return "dias_saldo";
    if (/(fim do mes|final do mes|ate o fim)/.test(msg)) return "fim_mes";
    if (/(economiz|economia|compensa)/.test(msg)) return "economia";
    if (/(saldo|quanto tenho|meu saldo)/.test(msg)) return "saldo_generico";

    if (/(proximo|proxima|quando passa|quando vem|qual onibus)/.test(msg)) return "proximo_onibus";
    if (/(tempo|demora|duracao|leva quanto)/.test(msg)) return "tempo";
    if (/(ultimo|ultima)/.test(msg)) return "ultimo_onibus";
    if (/(primeiro|primeira)/.test(msg)) return "primeiro_onibus";
    if (/(horario|horarios|que horas|saida|saidas|linha|quais)/.test(msg)) return "horarios";

    if (/(integracao|integrar)/.test(msg)) return "integracao";
    if (/(onde faz|como faz|documentos|desbloquear|cadastro|tirar o cartao)/.test(msg)) return "cartao_documentos";
    if (/(recarga|recarregar)/.test(msg)) return "recarga";
    if (/(atendimento|funciona|aberto|fecha|endereco)/.test(msg)) return "atendimento";
    if (/(quanto custa|preco|valor|tarifa)/.test(msg)) return "tarifa";
    if (/(gratuito|de graca|isento)/.test(msg)) return "gratuidade";

    return "desconhecido";
}

function detectarDestino(msg) {
    if (msg.includes("seminario")) return "linha-08";
    if (msg.includes("progresso")) return "linha-26";
    return null;
}


// ============================================================
// UTILITÁRIOS DE HORÁRIO
// ============================================================

function agora() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function diaAtual() {
    return new Date().getDate();
}

function diasAteOFimDoMes() {
    const d = new Date();
    const ultimo = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return ultimo - d.getDate();
}

function proximoDaLista(lista) {
    const agoraStr = agora();
    const futuros = lista.filter(h => h > agoraStr).sort();
    return futuros.length > 0 ? futuros[0] : lista[0];
}

function getLinha(id) {
    const base = carregarBase();
    return base.linhas.find(l => l.id === id);
}


// ============================================================
// RESPOSTA PRINCIPAL
// ============================================================

function responderLocal(mensagem, usuarioId = "padrao") {

    const base = carregarBase();
    const contexto = obterContexto(usuarioId);
    const msg = normalizar(mensagem);

    // ---- CONTINUAR COLETA DE DADOS ----
    if (contexto.etapa === "coletando_saldo") {
        return continuarColetaSaldo(msg, contexto, usuarioId);
    }

    const intencao = detectarIntencao(msg);
    const destino = detectarDestino(msg);

    // ---- SAUDAÇÃO ----
    if (intencao === "saudacao") return base.categorias.saudacao.resposta;

    // ---- AGRADECIMENTO ----
    if (intencao === "agradecimento") return base.categorias.agradecimento.resposta;

    // ---- AJUDA ----
    if (intencao === "ajuda") return base.categorias.ajuda.resposta;

    // ---- CÁLCULOS ----
    if (intencao === "calculo_simples" || intencao === "calculo_historico" ||
        intencao === "dias_saldo" || intencao === "fim_mes") {

        const valor = extrairValor(msg);
        const viagens = extrairViagens(msg);
        const diaRecarga = extrairDiaRecarga(msg);
        const faltas = extrairFaltas(msg);

        if (!valor) {
            contexto.etapa = "coletando_saldo";
            contexto.dados = { intencao, viagens, diaRecarga, faltas };
            return "Pra calcular, me diz primeiro: quanto você tem no cartão? (ex: 100)";
        }

        if (!viagens) {
            contexto.etapa = "coletando_saldo";
            contexto.dados = { intencao, valor, diaRecarga, faltas };
            return `Ok, R$ ${valor.toFixed(2)}. Quantas viagens você faz por dia? (ida e volta = 2)`;
        }

        return calcularSaldoCompleto(valor, viagens, diaRecarga, faltas, intencao);
    }

    // ---- SALDO GENÉRICO ----
    if (intencao === "saldo_generico") {
        contexto.etapa = "coletando_saldo";
        contexto.dados = { intencao: "calculo_simples" };
        return "Claro! Pra calcular seu saldo, me diz: quanto você tem no cartão?";
    }

    // ---- PRÓXIMO ÔNIBUS ----
    if (intencao === "proximo_onibus") {

        if (destino) {
            const linha = getLinha(destino);
            const p = proximoDaLista(linha.horarios);
            return `O próximo ônibus para o ${linha.destino} sai do Terminal Urbano às ${p} (Linha ${linha.numero}). Tempo estimado: ${linha.tempoMinimo} a ${linha.tempoMaximo} minutos.`;
        }

        const l08 = getLinha("linha-08");
        const l26 = getLinha("linha-26");
        const p08 = proximoDaLista(l08.horarios);
        const p26 = proximoDaLista(l26.horarios);

        return `Próximos ônibus:\n• Linha 08 (Seminário): ${p08} — viagem de ${l08.tempoMinimo} a ${l08.tempoMaximo} min\n• Linha 26 (Progresso): ${p26} — viagem de ${l26.tempoMinimo} a ${l26.tempoMaximo} min`;
    }

    // ---- TEMPO ----
    if (intencao === "tempo") {
        if (destino) {
            const linha = getLinha(destino);
            return `O tempo estimado de viagem até o ${linha.destino} é de ${linha.tempoMinimo} a ${linha.tempoMaximo} minutos.`;
        }
        return "Tempo estimado de viagem:\n• IFSC Seminário: 15 a 25 minutos\n• IFSC Progresso: 8 a 15 minutos";
    }

    // ---- ÚLTIMO / PRIMEIRO ----
    if (intencao === "ultimo_onibus") {
        const linha = getLinha(destino || "linha-08");
        return `O último ônibus para o ${linha.destino} sai do Terminal Urbano às ${linha.horarios[linha.horarios.length - 1]} (Linha ${linha.numero}).`;
    }

    if (intencao === "primeiro_onibus") {
        const linha = getLinha(destino || "linha-08");
        return `O primeiro ônibus para o ${linha.destino} sai do Terminal Urbano às ${linha.horarios[0]} (Linha ${linha.numero}).`;
    }

    // ---- HORÁRIOS ----
    if (intencao === "horarios") {

        const agoraStr = agora();

        if (destino) {
            const linha = getLinha(destino);
            const prox = linha.horarios.filter(h => h > agoraStr).slice(0, 6);
            if (prox.length === 0) {
                return `Não há mais ônibus para o ${linha.destino} hoje. O último saiu às ${linha.horarios[linha.horarios.length - 1]}.`;
            }
            return `Próximos ônibus para o ${linha.destino} (Linha ${linha.numero}):\n• ${prox.join("\n• ")}`;
        }

        const l08 = getLinha("linha-08");
        const l26 = getLinha("linha-26");
        const p08 = l08.horarios.filter(h => h > agoraStr).slice(0, 4);
        const p26 = l26.horarios.filter(h => h > agoraStr).slice(0, 4);

        return `Próximos horários:\n\nLinha 08 (Seminário):\n${p08.join(", ")}\n\nLinha 26 (Progresso):\n${p26.join(", ")}`;
    }

    // ---- INTEGRAÇÃO ----
    if (intencao === "integracao") return base.categorias.integracao.resposta;

    // ---- ECONOMIA ----
    if (intencao === "economia") return base.categorias.economia.resposta;

    // ---- CARTÃO ----
    if (intencao === "cartao_documentos") return base.categorias.cartao_documentos.resposta;

    // ---- RECARGA ----
    if (intencao === "recarga") return base.categorias.recarga.resposta;

    // ---- ATENDIMENTO ----
    if (intencao === "atendimento") return base.categorias.atendimento.resposta;

    // ---- TARIFA ----
    if (intencao === "tarifa") return base.categorias.tarifa.resposta;

    // ---- GRATUIDADE ----
    if (intencao === "gratuidade") return base.categorias.gratuidade.resposta;

    // ---- DESCONHECIDO ----
    return null;
}


// ============================================================
// CÁLCULO DE SALDO COMPLETO
// ============================================================

function calcularSaldoCompleto(valor, viagens, diaRecarga, faltas, intencao) {

    const base = carregarBase();
    const TARIFA = base.tarifas.estudante;

    const passagensPorDia = Math.ceil(viagens / 2);
    const custoDiario = passagensPorDia * TARIFA;

    // Com histórico
    if (diaRecarga) {

        const hoje = diaAtual();
        const diasPassados = Math.max(0, hoje - diaRecarga);
        const diasUsados = Math.max(0, diasPassados - (faltas || 0));

        const gasto = diasUsados * custoDiario;
        const restante = Math.max(0, valor - gasto);
        const diasRestantes = Math.floor(restante / custoDiario);

        let resp = `Você recarregou R$ ${valor.toFixed(2)} no dia ${diaRecarga}. `;

        if (faltas && faltas > 0) {
            resp += `Como faltou ${faltas} dia${faltas > 1 ? "s" : ""}, foram ${diasUsados} dias de uso. `;
        } else {
            resp += `Já se passaram ${diasUsados} dias. `;
        }

        resp += `Gastou aproximadamente R$ ${gasto.toFixed(2)} e restam R$ ${restante.toFixed(2)}. `;

        if (diasRestantes > 0) {
            resp += `Isso cobre mais ${diasRestantes} dias.`;
        } else {
            resp += `O saldo já acabou.`;
        }

        return resp;
    }

    const dias = Math.floor(valor / custoDiario);
    const sobra = valor - (dias * custoDiario);

    // Fim do mês
    if (intencao === "fim_mes") {

        const diasRestantesMes = diasAteOFimDoMes();

        if (dias >= diasRestantesMes) {
            return `Sim! Com R$ ${valor.toFixed(2)} e ${viagens} viagens por dia, seu saldo cobre os ${diasRestantesMes} dias que faltam até o fim do mês (dura cerca de ${dias} dias). Ainda sobram aproximadamente ${dias - diasRestantesMes} dias de saldo.`;
        } else {
            const faltam = diasRestantesMes - dias;
            return `Não. Com R$ ${valor.toFixed(2)} e ${viagens} viagens por dia, seu saldo dura aproximadamente ${dias} dias. Como faltam ${diasRestantesMes} dias até o fim do mês, vai faltar saldo para os últimos ${faltam} dias.`;
        }
    }

    // Cálculo padrão com comparação
    const viagensSemIntegracao = Math.floor(valor / TARIFA);
    const diasSemIntegracao = Math.floor(viagensSemIntegracao / viagens);

    return `Com R$ ${valor.toFixed(2)} e ${viagens} viagens por dia:\n\n• Com integração: ${dias} dias\n• Sem integração: ${diasSemIntegracao} dias\n• Economia: +${dias - diasSemIntegracao} dias usando integração\n\nSobra R$ ${sobra.toFixed(2)} no cartão.`;
}


// ============================================================
// COLETA DE DADOS EM ETAPAS
// ============================================================

function continuarColetaSaldo(msg, contexto, usuarioId) {

    const base = carregarBase();
    const TARIFA = base.tarifas.estudante;

    const dados = contexto.dados;

    // Usuário respondeu só o número
    if (apenasNumero(msg)) {
        const valor = parseFloat(msg.replace(",", "."));

        if (!dados.valor) {
            dados.valor = valor;
            return `Ok, R$ ${valor.toFixed(2)}. Agora me diz: quantas viagens você faz por dia? (ida e volta = 2)`;
        }

        if (!dados.viagens) {
            dados.viagens = valor;
            const resp = calcularSaldoCompleto(dados.valor, dados.viagens, dados.diaRecarga, dados.faltas, dados.intencao || "calculo_simples");
            limparContexto(usuarioId);
            return resp;
        }
    }

    // Usuário respondeu com texto contendo número
    const viagens = extrairViagens(msg);

    if (viagens && dados.valor) {
        const resp = calcularSaldoCompleto(dados.valor, viagens, dados.diaRecarga, dados.faltas, dados.intencao || "calculo_simples");
        limparContexto(usuarioId);
        return resp;
    }

    return "Desculpa, não entendi. Me diga só o número, por favor. (ex: 2)";
}


module.exports = { responderLocal, carregarBase };