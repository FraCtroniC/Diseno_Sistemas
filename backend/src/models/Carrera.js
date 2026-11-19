const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Carrera extends Model {
    static associate(models) {
      Carrera.hasMany(models.Trabajo, { foreignKey: 'carrera_id', as: 'trabajos' });
      Carrera.hasMany(models.Estudiante, { foreignKey: 'carrera_id', as: 'estudiantes' });
      Carrera.belongsTo(models.NivelAcademico, { foreignKey: 'nivel_id', as: 'nivel' });
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
    nivel_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'niveles_academicos', key: 'id' }
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
