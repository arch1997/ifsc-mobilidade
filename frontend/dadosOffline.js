// ============================================================
// Dados offline do IFSC Mobilidade
// Embute horários e linhas para funcionar sem servidor/internet.
// ============================================================

const DADOS_OFFLINE = {

    horarios: [
        // Linha 08 — Seminário
        { id: 1, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "05:35", tempoEstimado: "15-25" },
        { id: 2, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "06:10", tempoEstimado: "15-25" },
        { id: 3, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "06:35", tempoEstimado: "15-25" },
        { id: 4, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "06:50", tempoEstimado: "15-25" },
        { id: 5, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "07:10", tempoEstimado: "15-25" },
        { id: 6, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "07:30", tempoEstimado: "15-25" },
        { id: 7, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "07:45", tempoEstimado: "15-25" },
        { id: 8, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "08:05", tempoEstimado: "15-25" },
        { id: 9, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "08:20", tempoEstimado: "15-25" },
        { id: 10, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "09:00", tempoEstimado: "15-25" },
        { id: 11, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "09:40", tempoEstimado: "15-25" },
        { id: 12, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "10:20", tempoEstimado: "15-25" },
        { id: 13, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "11:00", tempoEstimado: "15-25" },
        { id: 14, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "11:35", tempoEstimado: "15-25" },
        { id: 15, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "11:45", tempoEstimado: "15-25" },
        { id: 16, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "12:10", tempoEstimado: "15-25" },
        { id: 17, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "12:20", tempoEstimado: "15-25" },
        { id: 18, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "12:40", tempoEstimado: "15-25" },
        { id: 19, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "13:05", tempoEstimado: "15-25" },
        { id: 20, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "13:15", tempoEstimado: "15-25" },
        { id: 21, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "13:30", tempoEstimado: "15-25" },
        { id: 22, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "13:50", tempoEstimado: "15-25" },
        { id: 23, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "14:20", tempoEstimado: "15-25" },
        { id: 24, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "14:50", tempoEstimado: "15-25" },
        { id: 25, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "15:30", tempoEstimado: "15-25" },
        { id: 26, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "16:00", tempoEstimado: "15-25" },
        { id: 27, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "16:15", tempoEstimado: "15-25" },
        { id: 28, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "16:30", tempoEstimado: "15-25" },
        { id: 29, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "16:50", tempoEstimado: "15-25" },
        { id: 30, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "17:15", tempoEstimado: "15-25" },
        { id: 31, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "17:20", tempoEstimado: "15-25" },
        { id: 32, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "17:35", tempoEstimado: "15-25" },
        { id: 33, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "17:45", tempoEstimado: "15-25" },
        { id: 34, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "18:00", tempoEstimado: "15-25" },
        { id: 35, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "18:10", tempoEstimado: "15-25" },
        { id: 36, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "18:25", tempoEstimado: "15-25" },
        { id: 37, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "18:35", tempoEstimado: "15-25" },
        { id: 38, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "18:45", tempoEstimado: "15-25" },
        { id: 39, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "19:00", tempoEstimado: "15-25" },
        { id: 40, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "19:30", tempoEstimado: "15-25" },
        { id: 41, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "20:00", tempoEstimado: "15-25" },
        { id: 42, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "20:40", tempoEstimado: "15-25" },
        { id: 43, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "21:15", tempoEstimado: "15-25" },
        { id: 44, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "21:45", tempoEstimado: "15-25" },
        { id: 45, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "21:55", tempoEstimado: "15-25" },
        { id: 46, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "22:10", tempoEstimado: "15-25" },
        { id: 47, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "22:40", tempoEstimado: "15-25" },
        { id: 48, linha: "Linha 08", origem: "Terminal Urbano", destino: "IFSC Seminário", horario: "23:00", tempoEstimado: "15-25" },

        // Linha 26 — Progresso
        { id: 100, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "04:50", tempoEstimado: "8-15" },
        { id: 101, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "05:30", tempoEstimado: "8-15" },
        { id: 102, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "05:55", tempoEstimado: "8-15" },
        { id: 103, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "06:20", tempoEstimado: "8-15" },
        { id: 104, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "06:45", tempoEstimado: "8-15" },
        { id: 105, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "07:05", tempoEstimado: "8-15" },
        { id: 106, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "07:20", tempoEstimado: "8-15" },
        { id: 107, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "07:40", tempoEstimado: "8-15" },
        { id: 108, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "08:00", tempoEstimado: "8-15" },
        { id: 109, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "08:40", tempoEstimado: "8-15" },
        { id: 110, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "09:20", tempoEstimado: "8-15" },
        { id: 111, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "10:00", tempoEstimado: "8-15" },
        { id: 112, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "10:40", tempoEstimado: "8-15" },
        { id: 113, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "11:20", tempoEstimado: "8-15" },
        { id: 114, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "11:40", tempoEstimado: "8-15" },
        { id: 115, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "12:05", tempoEstimado: "8-15" },
        { id: 116, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "12:35", tempoEstimado: "8-15" },
        { id: 117, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "12:50", tempoEstimado: "8-15" },
        { id: 118, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "13:20", tempoEstimado: "8-15" },
        { id: 119, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "13:40", tempoEstimado: "8-15" },
        { id: 120, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "14:20", tempoEstimado: "8-15" },
        { id: 121, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "15:00", tempoEstimado: "8-15" },
        { id: 122, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "15:40", tempoEstimado: "8-15" },
        { id: 123, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "16:20", tempoEstimado: "8-15" },
        { id: 124, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "17:00", tempoEstimado: "8-15" },
        { id: 125, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "17:40", tempoEstimado: "8-15" },
        { id: 126, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "18:05", tempoEstimado: "8-15" },
        { id: 127, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "18:20", tempoEstimado: "8-15" },
        { id: 128, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "18:50", tempoEstimado: "8-15" },
        { id: 129, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "19:20", tempoEstimado: "8-15" },
        { id: 130, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "20:10", tempoEstimado: "8-15" },
        { id: 131, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "20:50", tempoEstimado: "8-15" },
        { id: 132, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "21:30", tempoEstimado: "8-15" },
        { id: 133, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "22:00", tempoEstimado: "8-15" },
        { id: 134, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "22:40", tempoEstimado: "8-15" },
        { id: 135, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "23:00", tempoEstimado: "8-15" },
        { id: 136, linha: "Linha 26", origem: "Terminal Urbano", destino: "IFSC Progresso", horario: "23:40", tempoEstimado: "8-15" }
    ],

    tarifa: 2.45,

    config: {
        tempoSeminarioMin: 15,
        tempoSeminarioMax: 25,
        tempoProgressoMin: 8,
        tempoProgressoMax: 15
    },

    // Linhas para a tela de Junção (Offline)
    linhasJuncao: [
        {
            id: "linha-08", numero: "08", nome: "Seminário", categoria: "IFSC", passaIFSC: true,
            horarios: {
                segSex: ["06:10", "06:35", "06:50", "07:10", "07:30", "07:45", "08:05", "08:20", "09:00", "09:40", "10:20", "11:00", "11:35", "11:45", "12:10", "12:20", "12:40", "13:05", "13:15", "13:30", "13:50", "14:20", "14:50", "15:30", "16:00", "16:15", "16:30", "16:50", "17:15", "17:20", "17:35", "17:45", "18:00", "18:10", "18:25", "18:35", "18:45", "19:00", "19:30", "20:00", "20:40"],
                sabado: [], domingo: []
            }
        },
        {
            id: "linha-26", numero: "26", nome: "Progresso", categoria: "IFSC", passaIFSC: true,
            horarios: {
                segSex: ["06:20", "06:45", "07:05", "07:20", "07:40", "08:00", "08:40", "09:20", "10:00", "10:40", "11:20", "11:40", "12:05", "12:35", "12:50", "13:20", "13:40", "14:20", "15:00", "15:40", "16:20", "17:00", "17:40", "18:05", "18:20", "18:50", "19:20", "20:10", "20:50"],
                sabado: [], domingo: []
            }
        },
        {
            id: "linha-03", numero: "03", nome: "Parque das Palmeiras", categoria: "Lotação", passaIFSC: false,
            horarios: {
                segSex: ["06:10", "06:25", "06:50", "07:10", "07:50", "08:35", "09:10", "09:50", "10:30", "11:00", "11:15", "11:45", "12:05", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:45", "16:20", "17:00", "17:30", "17:50", "18:15", "18:45", "19:20", "20:15", "21:00"],
                sabado: ["06:35", "07:10", "07:25", "07:50", "08:30", "09:00", "09:45", "10:15", "11:00", "11:30", "12:10", "12:45", "13:30", "14:15", "15:00", "15:45", "16:30", "17:15", "18:00", "20:40"],
                domingo: ["06:30", "07:30", "08:30", "10:00", "11:00", "12:05", "13:30", "14:30", "15:30", "16:20", "17:30", "18:10", "19:10"]
            }
        },
        {
            id: "linha-04", numero: "04", nome: "Vila Real", categoria: "Lotação", passaIFSC: false,
            horarios: {
                segSex: ["06:00", "06:20", "06:50", "07:25", "08:00", "08:40", "09:15", "09:45", "10:10", "10:40", "11:10", "11:40", "12:05", "12:25", "12:40", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "16:55", "17:15", "17:35", "18:10", "18:50", "19:30", "20:10", "20:50", "21:00"],
                sabado: ["06:25", "07:00", "07:25", "08:00", "08:30", "09:10", "09:45", "10:25", "10:55", "11:30", "12:15", "12:45", "13:15", "13:50", "14:25", "15:00", "15:30", "16:10", "16:45", "17:20", "18:30", "19:30", "21:00"],
                domingo: ["06:00", "07:00", "08:00", "08:45", "09:30", "10:30", "11:30", "12:15", "13:00", "13:50", "14:40", "15:30", "16:30", "17:00", "17:30", "18:30", "19:30", "20:30"]
            }
        },
        {
            id: "linha-07", numero: "07", nome: "Trevo", categoria: "Lotação", passaIFSC: false,
            horarios: {
                segSex: ["06:15", "06:35", "07:10", "07:30", "08:00", "08:30", "09:20", "10:10", "11:00", "11:30", "12:10", "12:30", "12:50", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:25", "18:05", "18:35", "19:15", "20:10", "21:00"],
                sabado: ["06:20", "06:45", "07:30", "08:00", "09:00", "10:00", "11:00", "11:30", "12:10", "13:10", "14:10", "15:20", "16:30", "17:30", "18:40", "20:30"],
                domingo: ["07:00", "08:30", "10:00", "11:10", "14:30", "16:00", "17:30", "18:30", "19:30", "20:30"]
            }
        },
        {
            id: "linha-25", numero: "25", nome: "Desbravador", categoria: "Lotação", passaIFSC: false,
            horarios: {
                segSex: ["06:15", "06:30", "07:10", "07:40", "08:25", "09:40", "10:30", "11:25", "11:55", "12:15", "12:45", "13:15", "13:40", "14:40", "15:40", "16:40", "17:25", "17:50", "18:20", "18:50", "19:30", "20:30", "20:50"],
                sabado: ["06:40", "07:10", "08:35", "10:15", "12:10", "13:15", "15:35", "16:10", "18:30", "19:30", "21:00"],
                domingo: []
            }
        }
    ]
};