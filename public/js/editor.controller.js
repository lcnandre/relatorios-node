Editor.controller('PrincipalCtr', function($scope, $timeout, ngDialog, editorApiService) {
  editorApiService.listarRelatorios().then(function(rels) {
    $scope.relatorios = rels;
  });

  $scope.selecionarRelatorio = function(idx, evt) {
    evt.preventDefault();
    $scope.relatorioSelecionado = $scope.relatorios[idx];
  };

  $scope.salvarArquivo = function() {
    editorApiService.salvarArquivo($scope.arquivoSelecionado, $scope.relatorioSelecionado.nome).then(function() {
      swal('Gravado!', 'Arquivo gravado com sucesso.', 'success');
    });
  }

  $scope.executar = function(salvo) {
    if ($scope.arquivoSelecionado && !salvo) {
      editorApiService.salvarArquivo($scope.arquivoSelecionado, $scope.relatorioSelecionado.nome).then(function() {
        $scope.executar(true);
        return;
      });
    }

    editorApiService.executar($scope.relatorioSelecionado.nome).then(function(html) {
      var iframe = document.getElementById('preview');
      iframe = iframe.contentWindow || ( iframe.contentDocument.document || iframe.contentDocument);
      
      iframe.document.open();
      iframe.document.write(html);
      iframe.document.close();
    });
  };
  
  $scope.novoRelatorio = function() {
    swal({
      title: 'Novo relatório',
      text: 'Informe o nome do relatório:',
      type: 'input',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      closeOnConfirm: false,
      animation: 'slide-from-top'
    },
    function(nome){
      if (nome === false) {
        return;
      }
      
      if (nome === '') {
        swal.showInputError('O nome do relatório é obrigatório');
        return;
      }

      editorApiService.novoRelatorio(nome).then(function(rels) {
        $timeout(function() {
          if (rels.data.erro) {
            swal('Erro!', rels.data.erro, 'error');
            return;
          }

          $scope.relatorios = rels.data;
          swal('Sucesso!', 'Relatório ' + nome + ' criado com sucesso', 'success');
        }, 0);
      });
    });
  };

  $scope.selecionarArquivo = function(idx, evt) {
    evt.preventDefault();
    var relatorio = $scope.relatorioSelecionado.nome;
    var arquivo = $scope.relatorioSelecionado.arquivos[idx];
    let extensao = arquivo.split('.');
    extensao = extensao[extensao.length - 1];
    
    editorApiService.buscarArquivo(relatorio, arquivo).then(function(arq) {
      $scope.arquivoSelecionado = arq.data;
      editor.setValue($scope.arquivoSelecionado.conteudo);

      switch(extensao) {
        case 'js':
          editor.getSession().setMode("ace/mode/javascript");
          break;
        case 'css':
          editor.getSession().setMode("ace/mode/css");
          break;
        case 'json':
          editor.getSession().setMode("ace/mode/json");
          break;
        default:
          editor.getSession().setMode("ace/mode/handlebars");
          break;
      };
    });
  };
});