const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Tutor extends Model {
    static associate(models) {
      Tutor.hasMany(models.Trabajo, { foreignKey: 'tutor_id', as: 'trabajos' });
    }
  }

  Tutor.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    cedula: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Tutor',
    tableName: 'tutores',
    timestamps: true
  });

  return Tutor;
};
