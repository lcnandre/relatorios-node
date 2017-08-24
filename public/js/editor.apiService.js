Editor.factory('editorApiService', function($q, $http) {
  var relatorios = undefined;

  function salvarArquivo(arquivo, relatorio) {
    var config = {
      params: {
        relatorio: relatorio,
        arquivo: arquivo.nome
      }
    };
    
    return $http.post('./api/arquivo', { data: editor.getValue() }, config);
  }

  function listarRelatorios() {
    return $q(function(resolve) {
      if (!relatorios) {
        $http.get('./api/relatorios').then(function(res) {
          relatorios = res.data;
          resolve(relatorios);
        });
      } else {
        resolve(relatorios);
      }
    });
  }

  function novoRelatorio(relatorio) {
    var config = {
      params: {
        relatorio: relatorio
      }
    };

    return $http.get('./api/novo', config);
  }

  function executar(relatorio) {
    return $q(function(resolve) {
      buscarArquivo(relatorio, 'dados.json').then(function(dados) {
        dados = dados.data.conteudo;
        dados = dados.length ? JSON.parse(dados) : undefined;

        $http.post('./editor/renderizar/' + relatorio, dados).then(function(res) {
          resolve(res.data);
        });
      });
    });
  }

  function buscarArquivo(relatorio, arquivo) {
    var config = {
      params: {
        relatorio: relatorio,
        arquivo: arquivo
      }
    };

    return $http.get('./api/arquivo', config);
  }

  return {
    listarRelatorios: listarRelatorios,
    buscarArquivo: buscarArquivo,
    salvarArquivo: salvarArquivo,
    novoRelatorio: novoRelatorio,
    executar: executar
  }
});