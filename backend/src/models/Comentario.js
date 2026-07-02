const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Comentario extends Model {
    static associate(models) {
      Comentario.belongsTo(models.Trabajo, { foreignKey: 'trabajo_id', as: 'trabajo' });
      Comentario.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
    }
  }

  Comentario.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    trabajo_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    comentario: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    calificacion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 5 }
    }
  }, {
    sequelize,
    modelName: 'Comentario',
    tableName: 'comentarios',
    timestamps: true
  });

  return Comentario;
};
