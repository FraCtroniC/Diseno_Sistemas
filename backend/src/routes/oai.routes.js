const { Router } = require('express');
const oaiService = require('../services/oai.service');

const router = Router();

const VERBS = new Set(['Identify', 'ListMetadataFormats', 'ListSets', 'GetRecord', 'ListIdentifiers', 'ListRecords']);

router.all('/', async (req, res) => {
  try {
    const verb = req.query.verb;
    if (!verb || !VERBS.has(verb)) {
      const xml = oaiService.errorXml('badVerb', 'Verbo OAI-PMH inválido o no especificado.');
      res.set('Content-Type', 'application/xml');
      return res.status(400).send(xml);
    }

    let xml;
    switch (verb) {
      case 'Identify':
        xml = await oaiService.identify();
        break;
      case 'ListMetadataFormats':
        xml = await oaiService.listMetadataFormats(req.query.identifier);
        break;
      case 'ListSets':
        xml = await oaiService.listSets();
        break;
      case 'GetRecord':
        if (!req.query.identifier || !req.query.metadataPrefix) {
          xml = oaiService.errorXml('badArgument', 'Faltan argumentos requeridos (identifier, metadataPrefix).');
        } else {
          xml = await oaiService.getRecord(req.query.identifier);
        }
        break;
      case 'ListIdentifiers':
        xml = await oaiService.listIdentifiers(
          req.query.metadataPrefix, req.query.set,
          req.query.from, req.query.until, req.query.resumptionToken
        );
        break;
      case 'ListRecords':
        xml = await oaiService.listRecords(
          req.query.metadataPrefix, req.query.set,
          req.query.from, req.query.until, req.query.resumptionToken
        );
        break;
    }

    res.set('Content-Type', 'application/xml');
    res.status(xml.includes('<error') ? 400 : 200).send(xml);
  } catch (err) {
    console.error('OAI-PMH error:', err);
    const xml = oaiService.errorXml('internalError', 'Error interno del servidor.');
    res.set('Content-Type', 'application/xml');
    res.status(500).send(xml);
  }
});

module.exports = router;
