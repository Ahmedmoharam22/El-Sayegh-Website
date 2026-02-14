import express from "express";
import { registerTeam, getTeams, updateTeamStatus, deleteTeam } from '../controllers/footballController.js';
import auth from "../middleware/auth.js";
const router = express.Router();

// للمستخدمين
router.post('/register', registerTeam);

// للأدمن فقط
router.get('/all', auth, getTeams);
router.put('/update/:id', auth, updateTeamStatus);
router.delete('/delete/:id', auth, deleteTeam);

export default router;