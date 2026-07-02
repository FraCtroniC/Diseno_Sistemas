const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Trabajo extends Model {
    static associate(models) {
      Trabajo.belongsTo(models.Categoria, { foreignKey: 'categoria_id', as: 'categoria' });
      Trabajo.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
      Trabajo.belongsTo(models.Carrera, { foreignKey: 'carrera_id', as: 'carrera' });
      Trabajo.belongsTo(models.Tutor, { foreignKey: 'tutor_id', as: 'tutorAsignado' });
      Trabajo.belongsTo(models.Estudiante, { foreignKey: 'estudiante_id', as: 'estudiante' });
      Trabajo.hasMany(models.Revision, { foreignKey: 'trabajo_id', as: 'revisiones' });
    }
  }

  Trabajo.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    titulo: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    autor: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    tutor: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    resumen: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    palabras_clave: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    categoria_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categorias',
        key: 'id'
      }
    },
    archivo_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadatos: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    identificador: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
    },
    texto_completo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('borrador', 'en_revision', 'publicado', 'archivado'),
      defaultValue: 'borrador'
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Trabajo',
    tableName: 'trabajos',
    timestamps: true
  });

  return Trabajo;
};
