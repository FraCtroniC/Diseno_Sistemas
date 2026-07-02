const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Estudiante extends Model {
    static associate(models) {
      Estudiante.belongsTo(models.Carrera, { foreignKey: 'carrera_id', as: 'carrera' });
      Estudiante.hasMany(models.Trabajo, { foreignKey: 'estudiante_id', as: 'trabajos' });
    }
  }

  Estudiante.init({
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
    },
    carrera_id: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Estudiante',
    tableName: 'estudiantes',
    timestamps: true
  });

  return Estudiante;
};
