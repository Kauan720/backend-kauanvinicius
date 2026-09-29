// ============================================================
// API do Diario de Treinos
// Back-End I - CEEP Pedro Boaretto Neto
// ============================================================

const express = require('express');
const servidor = express();

const PORTA = 3000;

// Faz o Express entender JSON
servidor.use(express.json());

// ============================================================
// DADOS
// ============================================================

let listaTreinos = [
    {
        id: 1,
        nome: "Peito e Tríceps",
        duracao: 60
    },
    {
        id: 2,
        nome: "Costas e Bíceps",
        duracao: 50
    },
    {
        id: 3,
        nome: "Pernas",
        duracao: 70
    }
];

let ultimoId = 3;

// ============================================================
// VALIDACAO
// ============================================================

function verificarTreino(dados) {

    if (
        !dados.nome ||
        typeof dados.nome !== "string" ||
        dados.nome.trim().length === 0
    ) {
        return "O campo nome é obrigatório e deve ser um texto.";
    }

    if (
        dados.duracao === undefined ||
        typeof dados.duracao !== "number" ||
        dados.duracao <= 0
    ) {
        return "O campo duração é obrigatório e deve ser um número maior que zero.";
    }

    return null;
}

// ============================================================
// GET /treinos
// Lista todos os treinos
// ============================================================

servidor.get("/treinos", (req, res) => {

    res.status(200).json(listaTreinos);

});

// ============================================================
// GET /treinos/:id
// Busca um treino pelo ID
// ============================================================

servidor.get("/treinos/:id", (req, res) => {

    const idProcurado = Number(req.params.id);

    const treinoEncontrado = listaTreinos.find(
        item => item.id === idProcurado
    );

    if (treinoEncontrado === undefined) {
        return res.status(404).json({
            erro: "Treino não encontrado"
        });
    }

    res.status(200).json(treinoEncontrado);

});

// ============================================================
// POST /treinos
// Cria um novo treino
// ============================================================

servidor.post("/treinos", (req, res) => {

    const mensagemErro = verificarTreino(req.body);

    if (mensagemErro) {
        return res.status(400).json({
            erro: mensagemErro
        });
    }

    ultimoId++;

    const novoTreino = {
        id: ultimoId,
        nome: req.body.nome.trim(),
        duracao: req.body.duracao
    };

    listaTreinos.push(novoTreino);

    res.status(201).json(novoTreino);

});

// ============================================================
// PUT /treinos/:id
// Altera um treino existente
// ============================================================

servidor.put("/treinos/:id", (req, res) => {

    const idProcurado = Number(req.params.id);

    const posicao = listaTreinos.findIndex(
        item => item.id === idProcurado
    );

    if (posicao === -1) {
        return res.status(404).json({
            erro: "Treino não encontrado"
        });
    }

    const mensagemErro = verificarTreino(req.body);

    if (mensagemErro) {
        return res.status(400).json({
            erro: mensagemErro
        });
    }

    const treinoAtualizado = {
        id: idProcurado,
        nome: req.body.nome.trim(),
        duracao: req.body.duracao
    };

    listaTreinos[posicao] = treinoAtualizado;

    res.status(200).json(treinoAtualizado);

});

// ============================================================
// DELETE /treinos/:id
// Remove um treino
// ============================================================

servidor.delete("/treinos/:id", (req, res) => {

    const idParaExcluir = Number(req.params.id);

    const posicao = listaTreinos.findIndex(
        item => item.id === idParaExcluir
    );

    if (posicao === -1) {
        return res.status(404).json({
            erro: "Treino não encontrado"
        });
    }

    listaTreinos.splice(posicao, 1);

    res.status(204).send();

});

// ============================================================
// INICIA O SERVIDOR
// ============================================================

servidor.listen(PORTA, () => {
    console.log(`API disponível em http://localhost:${PORTA}`);
});