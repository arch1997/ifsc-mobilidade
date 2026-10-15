// ============================================================
// CACHE OFFLINE
// ============================================================

const CACHE_KEY = "ifsc_mobilidade_cache";
const CACHE_TTL = 1000 * 60 * 60 * 24;

function salvarCache(chave, dados) {
    try {
        localStorage.setItem(CACHE_KEY + "_" + chave, JSON.stringify({
            dados: dados,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.log("Cache indisponível");
    }
}

function lerCache(chave) {
    try {
        const item = localStorage.getItem(CACHE_KEY + "_" + chave);
        if (!item) return null;
        const obj = JSON.parse(item);
        if (Date.now() - obj.timestamp > CACHE_TTL) {
            localStorage.removeItem(CACHE_KEY + "_" + chave);
            return null;
        }
        return obj.dados;
    } catch (e) {
        return null;
    }
}

function estaOnline() {
    return navigator.onLine;
}

async function fetchComFallback(url, chaveCache, dadosOffline) {

    if (estaOnline()) {
        try {
            const resposta = await fetch(url);
            if (resposta.ok) {
                const dados = await resposta.json();
                salvarCache(chaveCache, dados);
                return dados;
            }
        } catch (e) {
            console.log("Falha na API, usando cache/dados offline");
        }
    }

    const cache = lerCache(chaveCache);
    if (cache) {
        console.log("Usando dados do cache");
        return cache;
    }

    console.log("Usando dados offline embutidos");
    return dadosOffline;
}


// ============================================================
// NAVEGAÇÃO ENTRE TELAS
// ============================================================

function trocarTela(nome) {

    document.querySelectorAll(".tela").forEach(t => {
        t.classList.remove("ativa");
    });

    document.querySelectorAll(".nav-link").forEach(l => {
        l.classList.remove("ativo");
    });

    const tela = document.getElementById("tela-" + nome);

    if (tela) tela.classList.add("ativa");

    document.querySelectorAll(".nav-link").forEach(l => {
        const attr = l.getAttribute("onclick") || "";
        if (attr.includes("'" + nome + "'")) {
            l.classList.add("ativo");
        }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

}


// ============================================================
// INDICADOR DE CONEXÃO
// ============================================================

function atualizarIndicador() {

    let indicador = document.getElementById("indicador-conexao");

    if (!indicador) {
        indicador = document.createElement("div");
        indicador.id = "indicador-conexao";
        document.body.appendChild(indicador);
    }

    if (estaOnline()) {
        indicador.className = "indicador-online";
        indicador.textContent = "Online";
    } else {
        indicador.className = "indicador-online offline";
        indicador.textContent = "Offline — dados salvos";
    }

}

window.addEventListener("online", atualizarIndicador);
window.addEventListener("offline", atualizarIndicador);


// ============================================================
// AGENDA — SELEÇÃO DE MODO
// ============================================================

function selecionarModo(el) {

    document.querySelectorAll(".agenda-modo").forEach(m => {
        m.classList.remove("ativo");
    });

    el.classList.add("ativo");

    const modo = el.getAttribute("data-modo");

    const label = document.getElementById("agenda-horario-label");
    const input = document.getElementById("agenda-horario");

    if (modo === "ida") {
        label.textContent = "Horário que quero chegar";
        input.value = "13:30";
    } else {
        label.textContent = "Horário que saio do IFSC";
        input.value = "17:00";
    }

}


// ============================================================
// HORÁRIOS — SELEÇÃO DE CAMPUS
// ============================================================

function selecionarDestino(el) {

    document.querySelectorAll(".horario-tab").forEach(t => {
        t.classList.remove("ativo");
    });

    el.classList.add("ativo");

    const destino = el.getAttribute("data-destino");

    document.getElementById("destino").value = destino;

    const tempoInfo = document.getElementById("tempoEstimadoInfo");

    if (destino === "IFSC Seminário") {
        tempoInfo.textContent = "15-25 min";
    } else {
        tempoInfo.textContent = "8-15 min";
    }

    const resultado = document.getElementById("resultado");

    resultado.innerHTML = "<p class='mensagem'>Clique em Ver horários para consultar.</p>";

}


// ============================================================
// BUSCAR HORÁRIOS
// ============================================================

async function buscarHorarios() {

    const destino = document.getElementById("destino").value;
    const resultado = document.getElementById("resultado");

    resultado.innerHTML = "<p class='mensagem'>Buscando horários...</p>";

    try {

        const horarios = await fetchComFallback(
            "http://localhost:3000/api/horarios",
            "horarios",
            DADOS_OFFLINE.horarios
        );

        const filtrados = horarios
            .filter(h => h.destino === destino)
            .sort((a, b) => a.horario.localeCompare(b.horario));

        if (filtrados.length === 0) {
            resultado.innerHTML = "<p class='mensagem'>Nenhum horário encontrado.</p>";
            return;
        }

        const agora = new Date();
        const hh = String(agora.getHours()).padStart(2, "0");
        const mm = String(agora.getMinutes()).padStart(2, "0");
        const agoraStr = `${hh}:${mm}`;

        let html = `<div class="horarios-grid">`;

        filtrados.forEach(h => {
            const passou = h.horario < agoraStr;
            html += `
                <div class="horario-card ${passou ? 'passou' : ''}">
                    <span class="horario-hora">${h.horario}</span>
                    <span class="horario-linha">${h.linha}</span>
                </div>
            `;
        });

        html += `</div>`;

        if (!estaOnline()) {
            html += `<p class="aviso-offline">Modo offline — mostrando dados salvos</p>`;
        }

        resultado.innerHTML = html;

    } catch (erro) {
        console.error(erro);
        resultado.innerHTML = "<p class='mensagem'>Não foi possível carregar os horários.</p>";
    }

}


// ============================================================
// CALCULAR AGENDA
// ============================================================

async function calcularAgenda() {

    const campus = document.getElementById("agenda-campus").value;
    const horarioUsuario = document.getElementById("agenda-horario").value;

    const modoSelecionado = document.querySelector(".agenda-modo.ativo");
    const modo = modoSelecionado ? modoSelecionado.getAttribute("data-modo") : "ida";

    const resultado = document.getElementById("agenda-resultado");

    if (!horarioUsuario) {
        resultado.innerHTML = "<p class='mensagem'>Informe o horário.</p>";
        return;
    }

    resultado.innerHTML = "<p class='mensagem'>Calculando...</p>";

    try {

        const resposta = await fetch("http://localhost:3000/api/agenda", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ modo, campus, horarioUsuario })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            resultado.innerHTML = `<p class='mensagem'>${dados.erro}</p>`;
            return;
        }

        if (dados.modo === "ida") {

            let statusClasse = "ok";
            let statusTexto = "Margem confortável";

            if (dados.margemSobra < 5) {
                statusClasse = "apertado";
                statusTexto = "Margem apertada — considere pegar o anterior";
            }
            if (dados.margemSobra < 0) {
                statusClasse = "atrasado";
                statusTexto = "Você pode se atrasar com esse ônibus";
            }

            resultado.innerHTML = `

                <div class="agenda-resultado">

                    <div class="agenda-header">
                        <span class="agenda-header-tag">Ida para o IFSC</span>
                        <h3>Quero chegar às ${dados.horarioDesejado}</h3>
                    </div>

                    <div class="agenda-resultado-topo">

                        <div class="agenda-destaque">
                            <span class="agenda-destaque-tag">Pegue este ônibus</span>
                            <div class="agenda-destaque-horario">${dados.horarioOnibus}</div>
                            <p class="agenda-destaque-desc">${dados.linha} — Terminal Urbano</p>
                        </div>

                        <div class="agenda-destaque agenda-destaque-verde">
                            <span class="agenda-destaque-tag">Chegada estimada</span>
                            <div class="agenda-destaque-horario">${dados.chegadaMin} - ${dados.chegadaMax}</div>
                            <p class="agenda-destaque-desc">Tempo de viagem: ${dados.tempoEstimado} min</p>
                        </div>

                    </div>

                    <div class="agenda-status ${statusClasse}">
                        <span class="agenda-status-titulo">Margem até o horário desejado</span>
                        <span class="agenda-status-valor">${dados.margemSobra > 0 ? "+" : ""}${dados.margemSobra} minutos</span>
                        <span class="agenda-status-desc">${statusTexto}</span>
                    </div>

                </div>

            `;

        } else {

            resultado.innerHTML = `

                <div class="agenda-resultado">

                    <div class="agenda-header">
                        <span class="agenda-header-tag">Volta pra casa</span>
                        <h3>Saio do IFSC às ${dados.horarioSaidaUsuario}</h3>
                    </div>

                    <div class="agenda-resultado-topo">

                        <div class="agenda-destaque">
                            <span class="agenda-destaque-tag">Ônibus passa no IFSC</span>
                            <div class="agenda-destaque-horario">${dados.horarioOnibus}</div>
                            <p class="agenda-destaque-desc">${dados.linha} — indo pro Terminal</p>
                        </div>

                        <div class="agenda-destaque agenda-destaque-verde">
                            <span class="agenda-destaque-tag">Chegada no Terminal</span>
                            <div class="agenda-destaque-horario">${dados.chegadaMin} - ${dados.chegadaMax}</div>
                            <p class="agenda-destaque-desc">Tempo de viagem: ${dados.tempoEstimado} min</p>
                        </div>

                    </div>

                    <div class="agenda-status ok">
                        <span class="agenda-status-titulo">Espera no ponto do IFSC</span>
                        <span class="agenda-status-valor">${dados.espera > 0 ? dados.espera + " minutos" : "Ônibus já está no ponto"}</span>
                        <span class="agenda-status-desc">Inclui tempo médio de embarque dos estudantes no fim da aula</span>
                    </div>

                </div>

            `;

        }

    } catch (erro) {
        console.error(erro);
        resultado.innerHTML = "<p class='mensagem'>Não foi possível conectar com o servidor.</p>";
    }

}


// ============================================================
// CALCULAR SALDO
// ============================================================

async function calcularSaldo() {

    const saldo = Number(document.getElementById("saldo").value);
    const valorPassagem = Number(document.getElementById("valorPassagem").value);
    const viagensPorDia = Number(document.getElementById("viagensPorDia").value);

    const resultado = document.getElementById("resultadoSaldo");

    if (
        isNaN(saldo) || saldo < 0 ||
        isNaN(valorPassagem) || valorPassagem <= 0 ||
        isNaN(viagensPorDia) || viagensPorDia <= 0
    ) {
        resultado.innerHTML = "<p class='mensagem'>Preencha todos os campos corretamente.</p>";
        return;
    }

    resultado.innerHTML = "<p class='mensagem'>Calculando...</p>";

    // Cálculo local — sempre funciona, mesmo offline
    const viagensDisponiveisSemIntegracao = Math.floor(saldo / valorPassagem);
    const diasSemIntegracao = Math.floor(viagensDisponiveisSemIntegracao / viagensPorDia);
    const passagensCobradasPorDia = Math.ceil(viagensPorDia / 2);
    const custoDiarioComIntegracao = passagensCobradasPorDia * valorPassagem;
    const diasComIntegracao = Math.floor(saldo / custoDiarioComIntegracao);
    const custoDiarioSemIntegracao = viagensPorDia * valorPassagem;
    const economiaPorDia = custoDiarioSemIntegracao - custoDiarioComIntegracao;
    const economiaTotal = economiaPorDia * diasComIntegracao;
    const saldoRestante = saldo - (diasComIntegracao * custoDiarioComIntegracao);

    resultado.innerHTML = `

        <div class="calc-resultado">

            <div class="calc-resultado-topo">

                <div class="calc-destaque">
                    <span class="calc-destaque-tag">Com integração</span>
                    <div class="calc-destaque-valor">${diasComIntegracao} <span class="calc-destaque-unidade">dias</span></div>
                    <p class="calc-destaque-desc">de transporte com o saldo atual</p>
                </div>

                <div class="calc-destaque calc-destaque-verde">
                    <span class="calc-destaque-tag">Economia total</span>
                    <div class="calc-destaque-valor"><span class="calc-moeda">R$</span> ${economiaTotal.toFixed(2)}</div>
                    <p class="calc-destaque-desc">em relação a não usar integração</p>
                </div>

            </div>

            <div class="calc-comparativo">

                <div class="calc-coluna">
                    <div class="calc-coluna-titulo">Sem integração</div>
                    <div class="calc-linha"><span>Viagens possíveis</span><strong>${viagensDisponiveisSemIntegracao}</strong></div>
                    <div class="calc-linha"><span>Dias de transporte</span><strong>${diasSemIntegracao}</strong></div>
                </div>

                <div class="calc-coluna">
                    <div class="calc-coluna-titulo">Com integração (1h)</div>
                    <div class="calc-linha"><span>Passagens por dia</span><strong>${passagensCobradasPorDia}</strong></div>
                    <div class="calc-linha"><span>Custo diário</span><strong>R$ ${custoDiarioComIntegracao.toFixed(2)}</strong></div>
                </div>

            </div>

            <div class="calc-rodape">
                <div class="calc-linha"><span>Saldo restante</span><strong>R$ ${saldoRestante.toFixed(2)}</strong></div>
                <div class="calc-linha"><span>Economia por dia</span><strong>R$ ${economiaPorDia.toFixed(2)}</strong></div>
            </div>

        </div>

    `;

}


// ============================================================
// CHAT COM IA
// ============================================================

function perguntaRapida(texto) {
    document.getElementById("perguntaIA").value = texto;
    perguntarIA();
}


async function perguntarIA() {

    const input = document.getElementById("perguntaIA");
    const chat = document.getElementById("chat");

    const pergunta = input.value.trim();

    if (!pergunta) return;

    chat.innerHTML += `

        <div class="msg-usuario">
            <div class="msg-bubble">
                ${pergunta}
                <span class="msg-hora">agora <span class="msg-check">✓✓</span></span>
            </div>
        </div>

    `;

    input.value = "";

    const idDigitando = "digitando-" + Date.now();

    chat.innerHTML += `

        <div class="msg-ia" id="${idDigitando}">
            <div class="msg-bubble">
                <span class="typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </div>
        </div>

    `;

    chat.scrollTop = chat.scrollHeight;

    try {

        const resposta = await fetch("http://localhost:3000/api/ia", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mensagem: pergunta,
                usuarioId: "usuario-web"
            })
        });

        const dados = await resposta.json();

        document.getElementById(idDigitando).remove();

        if (!resposta.ok) {

            chat.innerHTML += `

                <div class="msg-ia">
                    <div class="msg-bubble">
                        Não foi possível gerar a resposta no momento.
                        <span class="msg-hora">agora</span>
                    </div>
                </div>

            `;

            chat.scrollTop = chat.scrollHeight;
            return;

        }

        const fonteTexto = dados.fonte === "local" ? "resposta local" : "resposta online";

        chat.innerHTML += `

            <div class="msg-ia">
                <div class="msg-bubble">
                    ${dados.resposta.replace(/\n/g, "<br>")}
                    <span class="msg-hora">agora · ${fonteTexto}</span>
                </div>
            </div>

        `;

        chat.scrollTop = chat.scrollHeight;

    } catch (erro) {

        console.error(erro);

        document.getElementById(idDigitando).remove();

        chat.innerHTML += `

            <div class="msg-ia">
                <div class="msg-bubble">
                    Não foi possível conectar com o servidor.
                    <span class="msg-hora">agora</span>
                </div>
            </div>

        `;

    }

}


// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener("DOMContentLoaded", atualizarIndicador);