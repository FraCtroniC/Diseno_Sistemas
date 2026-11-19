const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class AreaEstrategica extends Model {
    static associate(models) {
      AreaEstrategica.belongsTo(models.LineaOperativa, {
        foreignKey: 'linea_operativa_id',
        as: 'lineaOperativa'
      });
      AreaEstrategica.belongsToMany(models.Trabajo, {
        through: 'trabajo_area_estrategica',
        foreignKey: 'area_estrategica_id',
        otherKey: 'trabajo_id',
        as: 'trabajos'
      });
    }
  }

  AreaEstrategica.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    linea_operativa_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'lineas_operativas',
        key: 'id'
      }
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    slug: {
      type: DataTypes.STRING(160),
      allowNull: false
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
    modelName: 'AreaEstrategica',
    tableName: 'areas_estrategicas',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['linea_operativa_id', 'slug']
      }
    ]
  });

  return AreaEstrategica;
};
