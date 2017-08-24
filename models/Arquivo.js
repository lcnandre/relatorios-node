module.exports = function(conexao, DataTypes) {
  return conexao.define('Arquivo', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    relatorio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Relatorio,
        key: 'id'
      }
    },
    conteudo: {
      type: Datatypes.TEXT,
      allowNull: true
    }
  });
};