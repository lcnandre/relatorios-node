module.exports = {};

const co = require('co');
const fs = require('fs');
const path = require('path');
const CAMINHO = path.join( __dirname, '../views');
let conexao = undefined;

function listarDiretorio(diretorio, apenasPastas) {
  return new Promise((resolve, reject) => {
    fs.readdir(diretorio, (err, arquivos) => {
      if (err) {
        reject(err);
        return;
      }

      if (!arquivos) {
        resolve([]);
        return;
      }

      resolve(arquivos.filter((arq) => {
        if (apenasPastas) {
          return arq !== 'layouts' && fs.lstatSync(path.join(CAMINHO, arq)).isDirectory();
        } else {
          return arq !== 'layouts';
        }
      }));
    });
  });
}

module.exports.listarRelatorios = () => {
  return new Promise((resolve, reject) => {
    let retorno = [];

    listarDiretorio(CAMINHO, true).then((relatorios) => {
      co(function* () {
        for(let rel in relatorios) {
          let ret = {
            nome: relatorios[rel]
          };

          ret.arquivos = yield listarDiretorio(path.join(CAMINHO, relatorios[rel]), false);
          retorno.push(ret);
        }

        resolve(retorno);
      });
    });
  });
};

module.exports.buscarArquivo = (relatorio, arquivo) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(CAMINHO, relatorio, arquivo), 'utf8', (err, conteudo) => {
      if (err) {
        reject(err);
        return;
      }

      resolve({
        nome: arquivo,
        conteudo: conteudo
      });
    });
  });
};

module.exports.salvarArquivo = (relatorio, arquivo, conteudo) => {
  return new Promise((resolve, reject) => {
    fs.truncate(path.join(CAMINHO, relatorio, arquivo), 0, () => {
      fs.writeFile(path.join(CAMINHO, relatorio, arquivo), conteudo, 'utf-8', err => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
      });
    });
  });
};

module.exports.novoRelatorio = (relatorio) => {
  return new Promise((resolve, reject) => {
    let caminhoRelatorio = path.join(CAMINHO, relatorio);
    let caminhoHb = path.join(CAMINHO, relatorio, 'index.handlebars');
    let caminhoScript = path.join(CAMINHO, relatorio, 'script.js');
    let caminhoCss = path.join(CAMINHO, relatorio, 'estilo.js');
    let caminhoDados = path.join(CAMINHO, relatorio, 'dados.json');
  
    if (fs.existsSync(caminhoRelatorio)){
      resolve({erro: `O relatório ${relatorio} já existe. Utilize um nome diferente.`});
      return;
    }

    fs.mkdirSync(caminhoRelatorio);
    fs.closeSync(fs.openSync(caminhoHb, 'w'));
    fs.closeSync(fs.openSync(caminhoScript, 'w'));
    fs.closeSync(fs.openSync(caminhoCss, 'w'));
    fs.closeSync(fs.openSync(caminhoDados, 'w'));

    module.exports.listarRelatorios().then((relatorios) => {
      resolve(relatorios);
    });
  });
};

module.exports.setConexao = (con => conexao = con);

module.exports.listarDiretorio = listarDiretorio;