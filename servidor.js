// ============================================================
// API do Diario de Treinos
// Back-End I - CEEP Pedro Boaretto Neto
// ============================================================
const { DatabaseSync } = require('node:sqlite');
const express = require('express');

const servidor = express();
const PORTA = 3000;

servidor.use(express.json());

// ============================================================
// BANCO DE DADOS
// ============================================================

const db = new DatabaseSync('treinos.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS treinos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        duracao INTEGER NOT NULL
    )
`);

// ============================================================
// VALIDACAO
// ============================================================

function verificarTreino(dados) {
    if (
        !dados ||
        !dados.nome ||
        typeof dados.nome !== 'string' ||
        dados.nome.trim().length === 0
    ) {
        return 'O campo nome é obrigatório e deve ser um texto.';
    }

    if (
        dados.duracao === undefined ||
        typeof dados.duracao !== 'number' ||
        !Number.isFinite(dados.duracao) ||
        dados.duracao <= 0 ||
        !Number.isInteger(dados.duracao)
    ) {
        return 'O campo duração é obrigatório e deve ser um número inteiro maior que zero.';
    }

    return null;
}

// ============================================================
// GET /treinos
// Lista todos os treinos
// ============================================================

servidor.get('/treinos', (req, res) => {
    const treinos = db.prepare(
        'SELECT * FROM treinos'
    ).all();

    res.status(200).json(treinos);
});

// ============================================================
// GET /treinos/:id
// Busca um treino pelo ID
// ============================================================

servidor.get('/treinos/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            erro: 'ID inválido'
        });
    }

    const treino = db.prepare(
        'SELECT * FROM treinos WHERE id = ?'
    ).get(id);

    if (!treino) {
        return res.status(404).json({
            erro: 'Treino não encontrado'
        });
    }

    res.status(200).json(treino);
});

// ============================================================
// POST /treinos
// Cria um novo treino
// ============================================================

servidor.post('/treinos', (req, res) => {
    const mensagemErro = verificarTreino(req.body);

    if (mensagemErro) {
        return res.status(400).json({
            erro: mensagemErro
        });
    }

    const resultado = db.prepare(
        'INSERT INTO treinos (nome, duracao) VALUES (?, ?)'
    ).run(
        req.body.nome.trim(),
        req.body.duracao
    );

    const novoTreino = db.prepare(
        'SELECT * FROM treinos WHERE id = ?'
    ).get(Number(resultado.lastInsertRowid));

    res.status(201).json(novoTreino);
});

// ============================================================
// PUT /treinos/:id
// Altera um treino existente
// ============================================================

servidor.put('/treinos/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            erro: 'ID inválido'
        });
    }

    const treinoExistente = db.prepare(
        'SELECT * FROM treinos WHERE id = ?'
    ).get(id);

    if (!treinoExistente) {
        return res.status(404).json({
            erro: 'Treino não encontrado'
        });
    }

    const mensagemErro = verificarTreino(req.body);

    if (mensagemErro) {
        return res.status(400).json({
            erro: mensagemErro
        });
    }

    db.prepare(`
        UPDATE treinos
        SET nome = ?, duracao = ?
        WHERE id = ?
    `).run(
        req.body.nome.trim(),
        req.body.duracao,
        id
    );

    const treinoAtualizado = db.prepare(
        'SELECT * FROM treinos WHERE id = ?'
    ).get(id);

    res.status(200).json(treinoAtualizado);
});

// ============================================================
// DELETE /treinos/:id
// Remove um treino
// ============================================================

servidor.delete('/treinos/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            erro: 'ID inválido'
        });
    }

    const resultado = db.prepare(
        'DELETE FROM treinos WHERE id = ?'
    ).run(id);

    if (resultado.changes === 0) {
        return res.status(404).json({
            erro: 'Treino não encontrado'
        });
    }

    res.status(204).send();
});

// ============================================================
// INICIA O SERVIDOR
// ============================================================

servidor.listen(PORTA, () => {
    console.log(
        `API disponível em http://localhost:${PORTA}`
    );
});
