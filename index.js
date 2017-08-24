const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const editor = require('./routes/editor');
const api = require('./routes/api');
//const persistencia = require('./controllers/persistencia');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('combined', {
  skip: function (req, res) { return res.statusCode < 400 }
}));

app.use(express.static('public'));
app.use('/editor', editor.rotas);
app.use('/api', api.rotas);

/*persistencia.inicializar().then(() => {
  api.setConexao(persistencia.getConexao());
  editor.setConexao(persistencia.getConexao());

  app.listen(8080, () => {
    console.log('Servidor HTTP executando na porta 8080');
  });
}).catch(err => console.error(err));*/

app.listen(8080, () => {
  console.log('Servidor HTTP executando na porta 8080');
});