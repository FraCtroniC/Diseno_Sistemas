const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Revision extends Model {
    static associate(models) {
      Revision.belongsTo(models.Trabajo, { foreignKey: 'trabajo_id', as: 'trabajo' });
      Revision.belongsTo(models.Usuario, { foreignKey: 'revisor_id', as: 'revisor' });
    }
  }

  Revision.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    trabajo_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    revisor_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    estado_anterior: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    estado_nuevo: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    comentario: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Revision',
    tableName: 'revisiones',
    timestamps: true
  });

  return Revision;
};
