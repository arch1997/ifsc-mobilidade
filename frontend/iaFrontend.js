// ============================================================
// IA LOCAL (RODA NO NAVEGADOR - SEM SERVIDOR)
// ============================================================

function responderIAOffline(mensagem) {
    const msg = mensagem.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // 1. Saudações
    if (/\b(oi|ola|bom dia|boa tarde|boa noite|eai)\b/.test(msg)) {
        return "Olá! Sou o assistente do IFSC Mobilidade. Posso ajudar com horários, saldo do cartão, integração e informações do transporte. O que você precisa?";
    }

    // 2. Cartão
    if (/\b(cartao|cadastro|fazer|tirar|documentos|desbloquear)\b/.test(msg)) {
        return "Para tirar o cartão estudante: RG, CPF, comprovante de residência e atestado de frequência. Alunos de instituições integradas (como o IFSC) precisam apenas de RG e CPF. O local é na Auto Viação Chapecó, Rua Clevelândia, 75d, das 07h às 19h.";
    }

    // 3. Integração
    if (/\b(integracao|integrar|baldeacao)\b/.test(msg)) {
        return "A integração tarifária de Chapecó vale por até 1 hora entre viagens e permite 1 integração a cada 2 passagens pagas. Não vale em linhas sobrepostas e nem no retorno ao ponto de origem.";
    }

    // 4. Saldo / Cálculo
    if (/\b(saldo|calcular|quanto|dura|reais|pila|conto)\b/.test(msg)) {
        return "A passagem custa R$ 2,45. Para calcular quantos dias o saldo dura, use a aba 'Saldo' aqui no site. Lá você pode simular com o seu valor exato e ver o gráfico de gastos.";
    }

    // 5. Tempo de viagem
    if (/\b(tempo|demora|quanto tempo|leva)\b/.test(msg)) {
        return "O tempo estimado de viagem:\n• Até o IFSC Seminário (Linha 08): 15 a 25 minutos.\n• Até o IFSC Progresso (Linha 26): 8 a 15 minutos.";
    }

    // 6. Próximo ônibus / Horários
    if (/\b(proximo|horario|onibus|seminario|progresso|quando passa)\b/.test(msg)) {
        // Pega a hora atual
        const agora = new Date();
        const hh = String(agora.getHours()).padStart(2, "0");
        const mm = String(agora.getMinutes()).padStart(2, "0");
        const horaAtual = `${hh}:${mm}`;

        // Filtra a lista de horários do arquivo dadosOffline.js
        const lista = destino === "IFSC Seminário" ? DADOS_OFFLINE.horarios.filter(h => h.destino === "IFSC Seminário") : DADOS_OFFLINE.horarios;
        
        const futuros = lista.filter(h => h.horario > horaAtual).sort((a, b) => a.horario.localeCompare(b.horario));
        
        if (futuros.length > 0) {
            const p = futuros[0];
            return `O próximo ônibus é a ${p.linha}, saindo às ${p.horario}. Tempo estimado de viagem: ${p.tempoEstimado} minutos.`;
        } else {
            return "Não há mais ônibus para hoje. O último já passou.";
        }
    }

    // 7. Fallback (se não entender)
    return "Desculpe, não entendi. Você pode perguntar sobre horários (ex: 'próximo ônibus para o Seminário'), cartão estudante (ex: 'onde faço o cartão') ou integração (ex: 'como funciona a integração').";
}