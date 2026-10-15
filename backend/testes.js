// ============================================================
// Testes automatizados da IA local
// Roda com: node backend/testes.js
// ============================================================

const { responderLocal } = require("./iaLocal");

const testes = [

    // Saudações
    { input: "oi", esperado: "contém", valor: "Olá" },
    { input: "opa", esperado: "contém", valor: "Olá" },
    { input: "bom dia", esperado: "contém", valor: "Olá" },

    // Próximo ônibus
    { input: "qual o proximo onibus pro seminario", esperado: "contém", valor: "Linha 08" },
    { input: "quando passa o busao pro progresso", esperado: "contém", valor: "Linha 26" },

    // Gírias
    { input: "tenho 100 pila", esperado: "contém", valor: "100" },
    { input: "50 conto", esperado: "contém", valor: "50" },

    // Tempo
    { input: "quanto tempo pro seminario", esperado: "contém", valor: "15" },

    // Integração
    { input: "como funciona a integracao", esperado: "contém", valor: "1 hora" },

    // Cartão
    { input: "quais documentos pra fazer o cartao", esperado: "contém", valor: "RG" },

    // Tarifa
    { input: "quanto custa a passagem", esperado: "contém", valor: "2,45" },

    // Recarga
    { input: "como faz recarga online", esperado: "contém", valor: "recarga" },

    // Atendimento
    { input: "onde fica o atendimento", esperado: "contém", valor: "Clevelândia" },

    // Último ônibus
    { input: "qual o ultimo onibus", esperado: "contém", valor: "23" },

    // Desconhecido (deve retornar null)
    { input: "qual a previsao do tempo pra amanha", esperado: "nulo" }

];


function rodarTestes() {

    console.log("===== TESTES DA IA LOCAL =====\n");

    let passou = 0;
    let falhou = 0;

    for (const t of testes) {

        const resposta = responderLocal(t.input, "teste");

        let ok = false;
        let detalhe = "";

        if (t.esperado === "nulo") {
            ok = resposta === null;
            detalhe = resposta === null ? "Retornou null (correto)" : `Retornou: ${resposta.substring(0, 50)}...`;
        } else if (t.esperado === "contém") {
            ok = resposta && resposta.includes(t.valor);
            detalhe = ok ? `Contém "${t.valor}"` : `Não contém "${t.valor}". Resposta: ${resposta ? resposta.substring(0, 80) : "null"}`;
        }

        if (ok) {
            console.log(`✓ "${t.input}"`);
            passou++;
        } else {
            console.log(`✗ "${t.input}" — ${detalhe}`);
            falhou++;
        }
    }

    console.log(`\n===== RESULTADO: ${passou} passou, ${falhou} falhou =====`);

}


rodarTestes();