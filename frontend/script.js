// ============================================================
// CACHE OFFLINE
// ============================================================

const CACHE_KEY = "ifsc_mobilidade_cache";
const CACHE_TTL = 1000 * 60 * 60 * 24;

function salvarCache(chave, dados) {
    try { localStorage.setItem(CACHE_KEY + "_" + chave, JSON.stringify({ dados, timestamp: Date.now() })); } catch (e) {}
}

function lerCache(chave) {
    try {
        const item = localStorage.getItem(CACHE_KEY + "_" + chave);
        if (!item) return null;
        const obj = JSON.parse(item);
        if (Date.now() - obj.timestamp > CACHE_TTL) { localStorage.removeItem(CACHE_KEY + "_" + chave); return null; }
        return obj.dados;
    } catch (e) { return null; }
}

function estaOnline() { return navigator.onLine; }

async function fetchComFallback(url, chaveCache, dadosOffline) {
    if (estaOnline()) {
        try {
            const resposta = await fetch(url);
            if (resposta.ok) { const dados = await resposta.json(); salvarCache(chaveCache, dados); return dados; }
        } catch (e) { console.log("API offline"); }
    }
    return lerCache(chaveCache) || dadosOffline;
}

// ============================================================
// ESTATÍSTICAS (Dashboard)
// ============================================================

const STATS_KEY = "ifsc_mobilidade_stats";

function registrarEstatistica(tipo) {
    let stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{"consultas":0,"perguntas":0,"linhaMaisVista":"-"}');
    if (tipo === "consulta") stats.consultas++;
    if (tipo === "pergunta") stats.perguntas++;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function registrarLinha(destino) {
    let stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{"consultas":0,"perguntas":0,"linhaMaisVista":"-"}');
    stats.linhaMaisVista = destino;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function carregarDashboard() {
    let stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{"consultas":0,"perguntas":0,"linhaMaisVista":"-"}');
    const container = document.getElementById("dashboard-stats");
    if (!container) return;

    container.innerHTML = `
        <div class="dash-card">
            <span class="dash-card-titulo">Consultas de Horários</span>
            <span class="dash-card-valor">${stats.consultas}</span>
            <span class="dash-card-desc">Vezes que você buscou os horários das linhas.</span>
        </div>
        <div class="dash-card">
            <span class="dash-card-titulo">Perguntas para a IA</span>
            <span class="dash-card-valor">${stats.perguntas}</span>
            <span class="dash-card-desc">Interações com o assistente virtual.</span>
        </div>
        <div class="dash-card">
            <span class="dash-card-titulo">Linha Mais Vista</span>
            <span class="dash-card-valor" style="font-size: 22px; color: #fff;">${stats.linhaMaisVista}</span>
            <span class="dash-card-desc">O campus que você mais consultou.</span>
        </div>
    `;
}

// ============================================================
// NAVEGAÇÃO E INDICADOR
// ============================================================

function trocarTela(nome) {
    document.querySelectorAll(".tela").forEach(t => t.classList.remove("ativa"));
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("ativo"));

    const tela = document.getElementById("tela-" + nome);
    if (tela) tela.classList.add("ativa");

    document.querySelectorAll(".nav-link").forEach(l => {
        if ((l.getAttribute("onclick") || "").includes("'" + nome + "'")) l.classList.add("ativo");
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
    
    if (nome === "juncao") carregarLinhasJuncao();
    if (nome === "dashboard") carregarDashboard();
}

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

// ============================================================
// AGENDA
// ============================================================

function selecionarModo(el) {
    document.querySelectorAll(".agenda-modo").forEach(m => m.classList.remove("ativo"));
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

async function calcularAgenda() {
    const campus = document.getElementById("agenda-campus").value;
    const horarioUsuario = document.getElementById("agenda-horario").value;
    const modo = document.querySelector(".agenda-modo.ativo").getAttribute("data-modo");
    const resultado = document.getElementById("agenda-resultado");

    if (!horarioUsuario) { resultado.innerHTML = "<p class='mensagem'>Informe o horário.</p>"; return; }
    resultado.innerHTML = "<p class='mensagem'>Calculando...</p>";

    try {
        const resposta = await fetch("http://localhost:3000/api/agenda", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ modo, campus, horarioUsuario })
        });
        const dados = await resposta.json();
        if (!resposta.ok) { resultado.innerHTML = `<p class='mensagem'>${dados.erro}</p>`; return; }

        if (dados.modo === "ida") {
            let statusClasse = dados.margemSobra < 0 ? "atrasado" : (dados.margemSobra < 5 ? "apertado" : "ok");
            let statusTexto = dados.margemSobra < 0 ? "Você pode se atrasar" : (dados.margemSobra < 5 ? "Margem apertada" : "Margem confortável");
            resultado.innerHTML = `
                <div class="agenda-resultado">
                    <div class="agenda-header"><span class="agenda-header-tag">Ida para o IFSC</span><h3>Quero chegar às ${dados.horarioDesejado}</h3></div>
                    <div class="agenda-resultado-topo">
                        <div class="agenda-destaque"><span class="agenda-destaque-tag">Pegue este ônibus</span><div class="agenda-destaque-horario">${dados.horarioOnibus}</div><p class="agenda-destaque-desc">${dados.linha}</p></div>
                        <div class="agenda-destaque agenda-destaque-verde"><span class="agenda-destaque-tag">Chegada estimada</span><div class="agenda-destaque-horario">${dados.chegadaMin} - ${dados.chegadaMax}</div></div>
                    </div>
                    <div class="agenda-status ${statusClasse}"><span class="agenda-status-titulo">Margem</span><span class="agenda-status-valor">${dados.margemSobra > 0 ? "+" : ""}${dados.margemSobra} min</span><span class="agenda-status-desc">${statusTexto}</span></div>
                </div>`;
        } else {
            resultado.innerHTML = `
                <div class="agenda-resultado">
                    <div class="agenda-header"><span class="agenda-header-tag">Volta pra casa</span><h3>Saio do IFSC às ${dados.horarioSaidaUsuario}</h3></div>
                    <div class="agenda-resultado-topo">
                        <div class="agenda-destaque"><span class="agenda-destaque-tag">Ônibus passa no IFSC</span><div class="agenda-destaque-horario">${dados.horarioOnibus}</div><p class="agenda-destaque-desc">${dados.linha}</p></div>
                        <div class="agenda-destaque agenda-destaque-verde"><span class="agenda-destaque-tag">Chegada no Terminal</span><div class="agenda-destaque-horario">${dados.chegadaMin} - ${dados.chegadaMax}</div></div>
                    </div>
                    <div class="agenda-status ok"><span class="agenda-status-titulo">Espera no ponto</span><span class="agenda-status-valor">${dados.espera} min</span></div>
                </div>`;
        }
    } catch (erro) { resultado.innerHTML = "<p class='mensagem'>Não foi possível conectar com o servidor.</p>"; }
}

// ============================================================
// JUNÇÃO + EXPORTAÇÃO
// ============================================================

let diaSelecionado = "segSex";
let linhasDisponiveis = DADOS_OFFLINE.linhasJuncao;
let dadosJuncaoAtual = null;

function selecionarDia(el) {
    document.querySelectorAll(".juncao-dia").forEach(d => d.classList.remove("ativo"));
    el.classList.add("ativo");
    diaSelecionado = el.getAttribute("data-dia");
    juntarHorariosOffline();
}

function carregarLinhasJuncao() {
    const container = document.getElementById("juncao-linhas");
    let html = "";
    linhasDisponiveis.forEach(linha => {
        const badge = linha.passaIFSC ? '<span class="juncao-ifsc">IFSC</span>' : '';
        html += `<label class="juncao-linha"><input type="checkbox" value="${linha.id}" checked onchange="juntarHorariosOffline()"><span class="juncao-linha-info"><strong>Linha ${linha.numero}</strong><span>${linha.nome}</span></span>${badge}</label>`;
    });
    container.innerHTML = html;
    juntarHorariosOffline();
}

function juntarHorariosOffline() {
    const selecionadas = Array.from(document.querySelectorAll("#juncao-linhas input[type=checkbox]:checked")).map(cb => cb.value);
    const resultado = document.getElementById("juncao-resultado");
    if (selecionadas.length === 0) { resultado.innerHTML = "<p class='mensagem'>Selecione pelo menos uma linha.</p>"; return; }

    const todosHorarios = [];
    linhasDisponiveis.forEach(linha => {
        if (!selecionadas.includes(linha.id)) return;
        const horariosDia = linha.horarios[diaSelecionado] || [];
        horariosDia.forEach(h => {
            todosHorarios.push({ horario: h, linha: `Linha ${linha.numero}`, nome: linha.nome, destino: linha.nome, passaIFSC: linha.passaIFSC });
        });
    });
    todosHorarios.sort((a, b) => a.horario.localeCompare(b.horario));
    dadosJuncaoAtual = { total: todosHorarios.length, dia: diaSelecionado, horarios: todosHorarios };

    if (dadosJuncaoAtual.total === 0) { resultado.innerHTML = "<p class='mensagem'>Nenhum horário encontrado.</p>"; return; }

    const buscaAtual = document.querySelector(".juncao-busca");
    const textoBusca = buscaAtual ? buscaAtual.value : "";

    let html = `
        <div class="juncao-header">
            <span class="juncao-total">${dadosJuncaoAtual.total} horários</span>
            <div class="juncao-acoes">
                <input type="text" class="juncao-busca" placeholder="Buscar (ex: 14:)" value="${textoBusca}" oninput="filtrarJuncao(this.value)">
                <button class="btn-exportar whatsapp" onclick="compartilharWhatsApp()"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button>
                <button class="btn-exportar pdf" onclick="exportarPDF()"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg></button>
            </div>
        </div>
        <div class="juncao-grid">
    `;
    dadosJuncaoAtual.horarios.forEach(h => {
        const badge = h.passaIFSC ? '<span class="juncao-ifsc">IFSC</span>' : '';
        html += `<div class="juncao-item" data-horario="${h.horario}"><span class="juncao-horario">${h.horario}</span><span class="juncao-linha-nome">${h.linha}</span><span class="juncao-destino">${h.destino}</span>${badge}</div>`;
    });
    html += "</div>";
    resultado.innerHTML = html;
    if (textoBusca) filtrarJuncao(textoBusca);
}

function filtrarJuncao(texto) {
    const busca = texto.trim().toLowerCase();
    document.querySelectorAll(".juncao-item").forEach(item => {
        item.style.display = (busca === "" || item.getAttribute("data-horario").includes(busca)) ? "flex" : "none";
    });
}

function compartilharWhatsApp() {
    if (!dadosJuncaoAtual) return;
    const diaNome = { "segSex": "Segunda a Sexta", "sabado": "Sábado", "domingo": "Domingo" }[dadosJuncaoAtual.dia];
    let texto = `*IFSC Mobilidade - Horários*\n*Dia:* ${diaNome}\n\n`;
    dadosJuncaoAtual.horarios.forEach(h => { texto += `🕐 ${h.horario} | ${h.linha} - ${h.destino}\n`; });
    texto += `\n_Compartilhado via IFSC Mobilidade_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
}

function exportarPDF() {
    if (!dadosJuncaoAtual) return;
    const diaNome = { "segSex": "Segunda a Sexta", "sabado": "Sábado", "domingo": "Domingo" }[dadosJuncaoAtual.dia];
    const element = document.createElement("div");
    element.style.cssText = "padding:40px;background:#fff;color:#000;font-family:Arial,sans-serif;";
    let html = `<h1 style="color:#006633;margin-bottom:5px;">IFSC Mobilidade</h1><h3 style="margin-top:0;margin-bottom:20px;">Horários - ${diaNome}</h3><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#f0f0f0;border-bottom:2px solid #ccc;"><th style="padding:8px;text-align:left;">Horário</th><th style="padding:8px;text-align:left;">Linha</th><th style="padding:8px;text-align:left;">Destino</th></tr></thead><tbody>`;
    dadosJuncaoAtual.horarios.forEach((h, i) => {
        html += `<tr style="background:${i%2===0?'#fff':'#f9f9f9'};border-bottom:1px solid #eee;"><td style="padding:8px;font-weight:bold;">${h.horario}</td><td style="padding:8px;">${h.linha}</td><td style="padding:8px;">${h.destino}</td></tr>`;
    });
    html += `</tbody></table><p style="margin-top:30px;font-size:12px;color:#777;text-align:center;">Gerado por IFSC Mobilidade</p>`;
    element.innerHTML = html;
    html2pdf().set({ margin:10, filename:`horarios_${dadosJuncaoAtual.dia}.pdf`, html2canvas:{scale:2}, jsPDF:{unit:'mm',format:'a4',orientation:'portrait'} }).from(element).save();
}

// ============================================================
// CALCULAR SALDO E GRÁFICO
// ============================================================

let meuGrafico = null;

function calcularSaldo() {
    const saldo = Number(document.getElementById("saldo").value);
    const valorPassagem = Number(document.getElementById("valorPassagem").value);
    const viagensPorDia = Number(document.getElementById("viagensPorDia").value);
    const resultado = document.getElementById("resultadoSaldo");
    const graficoBloco = document.getElementById("grafico-bloco");

    if (isNaN(saldo) || saldo < 0 || isNaN(valorPassagem) || valorPassagem <= 0 || isNaN(viagensPorDia) || viagensPorDia <= 0) {
        resultado.innerHTML = "<p class='mensagem'>Preencha todos os campos corretamente.</p>";
        return;
    }

    const viagensDispSem = Math.floor(saldo / valorPassagem);
    const diasSem = Math.floor(viagensDispSem / viagensPorDia);
    const passagensCobradasDia = Math.ceil(viagensPorDia / 2);
    const custoDiarioCom = passagensCobradasDia * valorPassagem;
    const diasCom = Math.floor(saldo / custoDiarioCom);
    const custoDiarioSem = viagensPorDia * valorPassagem;
    const economiaDia = custoDiarioSem - custoDiarioCom;
    const economiaTotal = economiaDia * diasCom;
    const saldoRestante = saldo - (diasCom * custoDiarioCom);

    resultado.innerHTML = `
        <div class="calc-resultado">
            <div class="calc-resultado-topo">
                <div class="calc-destaque"><span class="calc-destaque-tag">Com integração</span><div class="calc-destaque-valor">${diasCom} <span class="calc-destaque-unidade">dias</span></div><p class="calc-destaque-desc">de transporte com o saldo atual</p></div>
                <div class="calc-destaque calc-destaque-verde"><span class="calc-destaque-tag">Economia total</span><div class="calc-destaque-valor"><span class="calc-moeda">R$</span> ${economiaTotal.toFixed(2)}</div></div>
            </div>
            <div class="calc-comparativo">
                <div class="calc-coluna"><div class="calc-coluna-titulo">Sem integração</div><div class="calc-linha"><span>Viagens possíveis</span><strong>${viagensDispSem}</strong></div><div class="calc-linha"><span>Dias</span><strong>${diasSem}</strong></div></div>
                <div class="calc-coluna"><div class="calc-coluna-titulo">Com integração</div><div class="calc-linha"><span>Passagens/dia</span><strong>${passagensCobradasDia}</strong></div><div class="calc-linha"><span>Custo diário</span><strong>R$ ${custoDiarioCom.toFixed(2)}</strong></div></div>
            </div>
            <div class="calc-rodape"><div class="calc-linha"><span>Saldo restante</span><strong>R$ ${saldoRestante.toFixed(2)}</strong></div><div class="calc-linha"><span>Economia/dia</span><strong>R$ ${economiaDia.toFixed(2)}</strong></div></div>
        </div>
    `;

    graficoBloco.style.display = "block";
    gerarGrafico(saldo, diasCom, custoDiarioCom, valorPassagem, viagensPorDia);
}

function gerarGrafico(saldoInicial, totalDias, custoDiario, tarifa, viagensDia) {
    const ctx = document.getElementById('graficoSaldo').getContext('2d');
    if (meuGrafico) meuGrafico.destroy();

    const labels = ["Hoje"], dadosCom = [saldoInicial], dadosSem = [saldoInicial];
    let saldoCom = saldoInicial, saldoSem = saldoInicial;
    const custoSem = viagensDia * tarifa;
    const maxDias = Math.min(totalDias + 2, 30);

    for (let i = 1; i <= maxDias; i++) {
        labels.push(`Dia ${i}`);
        saldoCom -= custoDiario;
        saldoSem -= custoSem;
        dadosCom.push(saldoCom > 0 ? saldoCom : 0);
        dadosSem.push(saldoSem > 0 ? saldoSem : 0);
    }

    meuGrafico = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [{ label: 'Com Integração (R$)', data: dadosCom, borderColor: '#00b35f', backgroundColor: 'rgba(0,179,95,0.1)', borderWidth: 3, tension: 0.3, fill: true }, { label: 'Sem Integração (R$)', data: dadosSem, borderColor: '#ff5252', backgroundColor: 'rgba(255,82,82,0.1)', borderWidth: 3, tension: 0.3, fill: true }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#fff' } } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#a0a0a0', callback: v => 'R$ ' + v } }, x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#a0a0a0' } } } }
    });
}

// ============================================================
// HORÁRIOS (COM SIMULADOR DE LOTAÇÃO)
// ============================================================

function selecionarDestino(el) {
    document.querySelectorAll(".horario-tab").forEach(t => t.classList.remove("ativo"));
    el.classList.add("ativo");
    const destino = el.getAttribute("data-destino");
    document.getElementById("destino").value = destino;
    document.getElementById("tempoEstimadoInfo").textContent = destino === "IFSC Seminário" ? "15-25 min" : "8-15 min";
    document.getElementById("resultado").innerHTML = "<p class='mensagem'>Clique em Ver horários para consultar.</p>";
}

function calcularLotacao(horario) {
    const [h, m] = horario.split(":").map(Number);
    const minutos = h * 60 + m;
    
    // 12:00 (720) até 13:30 (810) - Pico do almoço
    const picoAlmoco = (minutos >= 720 && minutos <= 810);
    
    // 17:00 (1020) até 18:00 (1080) - Pico da tarde
    const picoTarde = (minutos >= 1020 && minutos <= 1080);

    if (picoAlmoco || picoTarde) {
        return { status: "lotado", label: "", icone: "🔴" };
    }
    
    // 13:31 (811) até 16:59 (1019) - Movimento médio
    if (minutos > 810 && minutos < 1020) {
        return { status: "medio", label: "", icone: "🟡" };
    }
    
    // Resto do dia - Tranquilo
    return { status: "vazio", label: "", icone: "🟢" };
}

async function buscarHorarios() {
    const destino = document.getElementById("destino").value;
    const resultado = document.getElementById("resultado");
    resultado.innerHTML = "<p class='mensagem'>Buscando horários...</p>";
    
    registrarEstatistica("consulta");
    registrarLinha(destino);

    try {
        const horarios = await fetchComFallback("http://localhost:3000/api/horarios", "horarios", DADOS_OFFLINE.horarios);
        const filtrados = horarios.filter(h => h.destino === destino).sort((a, b) => a.horario.localeCompare(b.horario));

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
            const lotacao = calcularLotacao(h.horario);
            html += `
                <div class="horario-card ${passou ? 'passou' : ''}">
                    <span class="horario-hora">${h.horario}</span>
                    <span class="horario-linha">${h.linha}</span>
                    <span class="lotacao ${lotacao.status}">${lotacao.icone} ${lotacao.label}</span>
                </div>
            `;
        });
        html += `</div>`;

        if (!estaOnline()) html += `<p class="aviso-offline">Modo offline — mostrando dados salvos</p>`;
        resultado.innerHTML = html;
    } catch (erro) {
        console.error(erro);
        resultado.innerHTML = "<p class='mensagem'>Não foi possível carregar os horários.</p>";
    }
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
    registrarEstatistica("pergunta");

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
                <span class="typing"><span></span><span></span><span></span></span>
            </div>
        </div>
    `;
    chat.scrollTop = chat.scrollHeight;

    try {
        const resposta = await fetch("http://localhost:3000/api/ia", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensagem: pergunta, usuarioId: "usuario-web" })
        });

        const dados = await resposta.json();
        document.getElementById(idDigitando).remove();

        if (!resposta.ok) {
            chat.innerHTML += `<div class="msg-ia"><div class="msg-bubble">Não foi possível gerar a resposta no momento.<span class="msg-hora">agora</span></div></div>`;
            chat.scrollTop = chat.scrollHeight;
            return;
        }

        const fonteTexto = dados.fonte === "local" ? "resposta local" : "resposta online";
        const idCopia = "texto-" + Date.now(); 
        
        chat.innerHTML += `
            <div class="msg-ia">
                <div class="msg-bubble">
                    <div id="${idCopia}">${dados.resposta.replace(/\n/g, "<br>")}</div>
                    <button class="btn-copiar" onclick="copiarResposta('${idCopia}', this)" title="Copiar resposta">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"/></svg>
                    </button>
                    <span class="msg-hora">agora · ${fonteTexto}</span>
                </div>
            </div>
        `;
        chat.scrollTop = chat.scrollHeight;

    } catch (erro) {
        console.error(erro);
        document.getElementById(idDigitando).remove();
        chat.innerHTML += `<div class="msg-ia"><div class="msg-bubble">Não foi possível conectar com o servidor.<span class="msg-hora">agora</span></div></div>`;
    }
}

function copiarResposta(idElemento, botao) {
    const elemento = document.getElementById(idElemento);
    if (!elemento) return;
    const texto = elemento.innerText;
    navigator.clipboard.writeText(texto).then(() => {
        const textoOriginal = botao.innerHTML;
        botao.innerHTML = `<span style="font-size: 12px; font-weight: 600; color: #00b35f;">Copiado!</span>`;
        setTimeout(() => { botao.innerHTML = textoOriginal; }, 2000);
    }).catch(err => { console.error('Erro ao copiar: ', err); });
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener("DOMContentLoaded", atualizarIndicador);
window.addEventListener("online", atualizarIndicador);
window.addEventListener("offline", atualizarIndicador);