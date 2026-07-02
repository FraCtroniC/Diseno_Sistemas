const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Visita extends Model {
    static associate(models) {
      Visita.belongsTo(models.Trabajo, { foreignKey: 'trabajo_id', as: 'trabajo' });
    }
  }

  Visita.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    trabajo_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    tipo: {
      type: DataTypes.ENUM('vista', 'descarga'),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Visita',
    tableName: 'visitas',
    timestamps: true,
    updatedAt: false
  });

  return Visita;
};
