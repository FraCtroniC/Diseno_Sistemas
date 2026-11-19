const { NivelAcademico } = require('../models');

class NivelService {
  async listar() {
    return NivelAcademico.findAll({ order: [['orden', 'ASC'], ['nombre', 'ASC']] });
  }
}

module.exports = new NivelService();
