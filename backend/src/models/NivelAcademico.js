const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class NivelAcademico extends Model {
    static associate(models) {
      NivelAcademico.hasMany(models.Carrera, { foreignKey: 'nivel_id', as: 'carreras' });
    }
  }

  NivelAcademico.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    slug: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    grupo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['pregrado', 'postgrado']]
      }
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'NivelAcademico',
    tableName: 'niveles_academicos',
    timestamps: true
  });

  return NivelAcademico;
};
