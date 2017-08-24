const express = require('express');
const fs = require('fs');
const co = require('co');
const path = require('path');
const acorn = require('acorn');
const Phantom = require('phantom');
const router = express.Router();
const caminhoRelatorios = path.join(__dirname, '../views');
const HBS = require('express-handlebars');
const Helpers = require('handlebars-helpers')();
const api = require('../controllers/api');
let hbs = HBS.create({ helpers: Helpers });
let conexao = undefined;

let criarHelpers = (relatorio => {
  return new Promise((resolve, reject) => {
    let funcoes = {};
    let js = undefined;

    fs.readFile(path.join(caminhoRelatorios, relatorio, 'script.js'), 'utf-8', (err, conteudo) => {
      if (err) {
        reject(err);
        return;
      }

      js = acorn.parse(conteudo);

      for(let obj in js.body) {
        let funcao = js.body[obj];
        let nome = funcao.id.name;
        let params = funcao.params.map(p => p.name);   
        let corpo = conteudo.substring(funcao.body.start+1, funcao.body.end-1).trim();
        funcao = new Function(params, corpo);
        funcoes[nome] = funcao;
      }

      resolve(funcoes);
    });
  });
});

let montarParametros = (params) => {
  let retorno = '?';

  for (let chave in params) {
    retorno += `${chave}=${params[chave]}`;
  };

  return retorno.substring(0, retorno.length - 1);
};

let newId = () => {
  let S4 = function() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};

router.post('/renderizar/:relatorio', (req, res) => {
  let caminho = path.join(caminhoRelatorios, `${req.params.relatorio}/index.handlebars`);

  api.listarDiretorio(path.join(caminhoRelatorios, `${req.params.relatorio}`), false).then((assets) => {
    criarHelpers(req.params.relatorio).then(helpers => {
      hbs.render(caminho, req.body, {
        data: req.body,
        helpers: helpers
      }).then(html => {
        res.send(html);
      }).catch(err => {
        res.status(500).send(err);
      });
    });
  });  
});

router.get('/baixar/:arquivo', (req, res) => {
  let caminho = path.join(__dirname, `../output/${req.params.arquivo}`);

  res.download(caminho, (err) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    fs.unlink(caminho);
  });
});

router.post('/gerar/:relatorio', (req, res) => {
  co(function*() {
    let instance = yield Phantom.create();

    try {
      let url = `http://localhost:8080/editor/renderizar/${req.params.relatorio}`;
      var page = yield instance.createPage();
      let nomeArquivo = `${newId()}.pdf`;
      let caminho = path.join(__dirname, `../output/${nomeArquivo}`);

      page.on('onLoadFinished', () => {
        co(function* (){
          yield page.render(caminho);
          res.json({ arquivo: nomeArquivo });
          instance.exit();
        });
      });

      page.open(url, {
        operation: 'POST',
        encoding: 'UTF-8',
        headers: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(req.body)
      });
    } catch(err) {
      res.status(500).send(err);

      if (instance) {
        instance.exit();
      }
    }
  });
});

module.exports.rotas = router;
module.exports.setConexao = (con => conexao = con);