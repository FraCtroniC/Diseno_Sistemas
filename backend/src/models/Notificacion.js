const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Notificacion extends Model {
    static associate(models) {
      Notificacion.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
      Notificacion.belongsTo(models.Trabajo, { foreignKey: 'trabajo_id', as: 'trabajo' });
    }
  }

  Notificacion.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    tipo: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    trabajo_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    leida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Notificacion',
    tableName: 'notificaciones',
    timestamps: true
  });

  return Notificacion;
};
