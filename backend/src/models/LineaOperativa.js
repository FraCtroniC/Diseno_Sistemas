const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class LineaOperativa extends Model {
    static associate(models) {
      LineaOperativa.hasMany(models.AreaEstrategica, {
        foreignKey: 'linea_operativa_id',
        as: 'areasEstrategicas'
      });
    }
  }

  LineaOperativa.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    sigla: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'LineaOperativa',
    tableName: 'lineas_operativas',
    timestamps: true
  });

  return LineaOperativa;
};
