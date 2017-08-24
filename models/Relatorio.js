module.exports = function(conexao, DataTypes) {
  return conexao.define('Relatorio', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });
};