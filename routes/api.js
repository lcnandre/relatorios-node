const express = require('express');
const api = require('../controllers/api');
const router = express.Router();
let conexao = undefined;

router.get('/relatorios', (req, res) => {
  api.listarRelatorios()
    .then(relatorios =>  res.json(relatorios))
    .catch(err => res.status(500).send(err));
});

router.get('/arquivo', (req, res) => {
  let relatorio = req.query.relatorio;
  let arquivo = req.query.arquivo;

  api.buscarArquivo(relatorio, arquivo)
    .then(conteudo => res.send(conteudo))
    .catch(err => res.status(500).send(err));
});

router.post('/arquivo', (req, res) => {
  let relatorio = req.query.relatorio;
  let arquivo = req.query.arquivo;
  let conteudo = req.body.data;

  api.salvarArquivo(relatorio, arquivo, conteudo)
    .then(() => res.end())
    .catch(err => res.status(500).send(err));
});

router.get('/novo', (req, res) => {
  let relatorio = req.query.relatorio;

  api.novoRelatorio(relatorio)
    .then(relatorios =>  res.json(relatorios))
    .catch(err => res.status(500).send(err));  
});

module.exports.rotas = router;
module.exports.setConexao = (con => conexao = con);