module.exports = {};

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const conf = require('../conf/conf.json');

const conexao = new Sequelize(conf.base, conf.usuario, conf.senha, {
  host: conf.servidor,
  dialect: 'mssql',
  pool: {
    max: 100,
    min: 0,
    idle: 10000
  }
});

const carregarModelos = () => {
  fs.readdir(diretorio, (err, arquivos) => {
    arquivos.forEach(arq => {
      let modelo = conexao.import(path.join(__dirname, `../models/${arq}`));
      conexao[modelo.name] = modelo;
    });    
  });
};

const testarConexao = () => {
  return new Promise((resolve, reject) => {
    let autenticar = conexao.authenticate();

    autenticar.catch(err => {
      reject(err);
    });
    
    autenticar.then(function() {
      resolve(null);
    });
  });
};

module.exports.getConexao = () => {
  return conexao;
};

module.exports.inicializar = () => {
  return new Promise((resolve) => {
    testarConexao().then(() => {
      carregarModelos();
      resolve(null);
      console.log('Conexão com a base iniciada');
    });
  });
};