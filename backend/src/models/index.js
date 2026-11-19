const { Sequelize } = require('sequelize');
const environment = require('../../config/environment');
const databaseConfig = require('../../config/database');

const env = environment.nodeEnv || 'development';
const config = databaseConfig[env];

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const UsuarioModel = require('./Usuario');
const CategoriaModel = require('./Categoria');
const TrabajoModel = require('./Trabajo');
const RevisionModel = require('./Revision');
const CarreraModel = require('./Carrera');
const NivelAcademicoModel = require('./NivelAcademico');
const TutorModel = require('./Tutor');
const EstudianteModel = require('./Estudiante');
const VisitaModel = require('./Visita');
const NotificacionModel = require('./Notificacion');
const ComentarioModel = require('./Comentario');
const VersionModel = require('./Version');
const LineaOperativaModel = require('./LineaOperativa');
const AreaEstrategicaModel = require('./AreaEstrategica');

const Usuario = UsuarioModel(sequelize);
const Categoria = CategoriaModel(sequelize);
const Trabajo = TrabajoModel(sequelize);
const Revision = RevisionModel(sequelize);
const Carrera = CarreraModel(sequelize);
const NivelAcademico = NivelAcademicoModel(sequelize);
const Tutor = TutorModel(sequelize);
const Estudiante = EstudianteModel(sequelize);
const Visita = VisitaModel(sequelize);
const Notificacion = NotificacionModel(sequelize);
const Comentario = ComentarioModel(sequelize);
const Version = VersionModel(sequelize);
const LineaOperativa = LineaOperativaModel(sequelize);
const AreaEstrategica = AreaEstrategicaModel(sequelize);

Object.values({ Usuario, Categoria, Trabajo, Revision, Carrera, NivelAcademico, Tutor, Estudiante, Visita, Notificacion, Comentario, Version, LineaOperativa, AreaEstrategica }).forEach((model) => {
  if (model.associate) {
    model.associate({ Usuario, Categoria, Trabajo, Revision, Carrera, NivelAcademico, Tutor, Estudiante, Visita, Notificacion, Comentario, Version, LineaOperativa, AreaEstrategica });
  }
});

const db = {
  sequelize,
  Sequelize,
  Usuario,
  Categoria,
  Trabajo,
  Revision,
  Carrera,
  NivelAcademico,
  Tutor,
  Estudiante,
  Visita,
  Notificacion,
  Comentario,
  Version,
  LineaOperativa,
  AreaEstrategica
};

module.exports = db;
