const { Router } = require('express');
const { rssFeed, atomFeed } = require('../services/rss.service');

const router = Router();

router.get('/rss', async (req, res) => {
  try {
    const xml = await rssFeed();
    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(xml);
  } catch (err) {
    console.error('RSS error:', err);
    res.status(500).send('Error generando el feed RSS');
  }
});

router.get('/atom', async (req, res) => {
  try {
    const xml = await atomFeed();
    res.set('Content-Type', 'application/atom+xml; charset=utf-8');
    res.send(xml);
  } catch (err) {
    console.error('Atom error:', err);
    res.status(500).send('Error generando el feed Atom');
  }
});

module.exports = router;
