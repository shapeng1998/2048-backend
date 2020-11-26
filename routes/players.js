const express = require('express');
const Player = require('../models/Player');
const router = express.Router();

// Middleware
async function getPlayer(req, res, next) {
  let player;

  try {
    player = await Player.findById(req.params.id);
    if (player == null) {
      return res.status(404).json({ message: 'Cannot find player!' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.player = player;
  next();
}

/**
 * @api {get} /players/top5 Request top 5 players info
 * @apiVersion 1.0.0
 * @apiName GetTop5Players
 * @apiGroup Player
 */
router.get('/top5', async (req, res) => {
  try {
    const players = await Player.find()
      .sort({
        score: -1,
      })
      .limit(5);
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @api {get} /players Request all players info
 * @apiVersion 1.0.0
 * @apiName GetPlayers
 * @apiGroup Player
 */
router.get('/', async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// router.get('/:id', getPlayer, async (req, res) => {
//   res.json(res.player);
// });

/**
 * @api {get} /players/:nickname Request one player info
 * @apiVersion 1.0.0
 * @apiName GetOnePlayer
 * @apiGroup Player
 * @apiParam  {String} nickname the player nickname
 */
router.get('/:nickname', async (req, res) => {
  try {
    const player = await Player.findOne({
      nickname: req.params.nickname,
    });
    res.json(player);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @api {post} /players Create one player
 * @apiVersion 1.0.0
 * @apiName PostOnePlayer
 * @apiGroup Player
 * @apiParam  {String} nickname the nickname of the player
 * @apiParam  {String} score the score of the player, default is 0
 */
router.post('/', async (req, res) => {
  const player = new Player({
    nickname: req.body.nickname,
    score: req.body.score,
  });

  try {
    const newPlayer = await player.save();
    res.status(201).json(newPlayer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @api {patch} /players/:id Update one player
 * @apiVersion 1.0.0
 * @apiName UpdateOnePlayer
 * @apiGroup Player
 * @apiParam  {Number} id the player id
 * @apiParam  {String} nickname the updated nickname of the player
 * @apiParam  {String} score the updated score of the player
 */
router.patch('/:id', getPlayer, async (req, res) => {
  if (req.body.nickname != null) {
    res.player.nickname = req.body.nickname;
  }
  if (req.body.score != null) {
    res.player.score = req.body.score;
  }

  try {
    const updatedPlayer = await res.player.save();
    res.json(updatedPlayer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @api {delete} /players/:id Delete one player
 * @apiVersion 1.0.0
 * @apiName DeleteOnePlayer
 * @apiGroup Player
 * @apiParam  {Number} id the player id
 */
router.delete('/:id', getPlayer, async (req, res) => {
  try {
    await res.player.remove();
    res.json({ message: 'Player deleted!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
