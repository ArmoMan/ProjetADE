
const express = require('express');
const router = express.Router();

/* Route pour la premiere page d'affichage */

router.get('/', (req, res) => {
  res.render('index', {estConnecter: req.session.estConnecter || false})
});

module.exports = router;