const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Carrera extends Model {
    static associate(models) {
      Carrera.hasMany(models.Trabajo, { foreignKey: 'carrera_id', as: 'trabajos' });
      Carrera.hasMany(models.Estudiante, { foreignKey: 'carrera_id', as: 'estudiantes' });
    }
  }

  Carrera.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    slug: {
      type: DataTypes.STRING(220),
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Carrera',
    tableName: 'carreras',
    timestamps: true
  });

  return Carrera;
};
