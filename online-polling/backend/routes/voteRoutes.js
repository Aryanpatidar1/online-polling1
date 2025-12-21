import express from 'express'
import { castVote } from '../controllers/voteController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router();

router.post('/:pollId', castVote);         

export default router;