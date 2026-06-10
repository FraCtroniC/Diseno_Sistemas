const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Categoria extends Model {
    static associate(models) {
      Categoria.hasMany(models.Trabajo, { foreignKey: 'categoria_id', as: 'trabajos' });
    }
  }

  Categoria.init({
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
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Categoria',
    tableName: 'categorias',
    timestamps: true
  });

  return Categoria;
};
