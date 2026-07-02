const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Version extends Model {
    static associate(models) {
      Version.belongsTo(models.Trabajo, { foreignKey: 'trabajo_id', as: 'trabajo' });
      Version.belongsTo(models.Usuario, { foreignKey: 'created_by', as: 'creador' });
    }
  }

  Version.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    trabajo_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    datos: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    archivo_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Version',
    tableName: 'versiones',
    timestamps: true,
    updatedAt: false
  });

  return Version;
};
