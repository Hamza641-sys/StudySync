const dbService = require('../services/dbService');
const { v4: uuidv4 } = require('uuid');

const authController = {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      if (!email || !name) {
        return res.status(400).json({ success: false, error: 'Name and email are required.' });
      }

      const userId = `usr_${uuidv4().slice(0, 12)}`;
      const newUser = {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        level: 1,
        xp: 35,
        xpMax: 150,
        streaks: {
          visitStreak: 2,
          quizStreak: 1,
          reviewStreak: 1
        },
        createdAt: new Date().toISOString()
      };

      await dbService.saveUser(newUser);

      res.status(201).json({
        success: true,
        user: newUser,
        token: userId,
        message: 'Registration successful!'
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, userId: suppliedId } = req.body;
      if (!email && !suppliedId) {
        return res.status(400).json({ success: false, error: 'Email or User ID is required.' });
      }

      let user = null;
      if (suppliedId) {
        user = await dbService.getUser(suppliedId);
      }

      if (!user) {
        // Find by email or create demo student profile
        const id = suppliedId || `usr_${Buffer.from(email || 'demo').toString('hex').slice(0, 10)}`;
        user = {
          id,
          name: email ? email.split('@')[0] : 'Roshan Student',
          email: email || 'student@studysync.edu',
          level: 1,
          xp: 45,
          xpMax: 150,
          streaks: {
            visitStreak: 3,
            quizStreak: 2,
            reviewStreak: 1
          },
          createdAt: new Date().toISOString()
        };
        await dbService.saveUser(user);
      }

      res.json({
        success: true,
        user,
        token: user.id,
        message: 'Login successful'
      });
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await dbService.getUser(req.user.id);
      if (!user) {
        // Return active session user
        const defaultUser = {
          id: req.user.id,
          name: req.user.name || 'Student',
          email: req.user.email || 'student@studysync.edu',
          level: 1,
          xp: 65,
          xpMax: 150,
          streaks: {
            visitStreak: 2,
            quizStreak: 1,
            reviewStreak: 1
          }
        };
        return res.json({ success: true, user: defaultUser });
      }
      res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  },

  async updateStreaks(req, res, next) {
    try {
      const { streakType } = req.body; // 'visitStreak' | 'quizStreak' | 'reviewStreak'
      let user = await dbService.getUser(req.user.id);
      if (!user) {
        user = { id: req.user.id, streaks: { visitStreak: 1, quizStreak: 1, reviewStreak: 1 }, xp: 20, level: 1 };
      }

      if (streakType && user.streaks && user.streaks[streakType] !== undefined) {
        user.streaks[streakType] += 1;
      }
      user.xp = (user.xp || 0) + 15;
      if (user.xp >= 150) {
        user.level = (user.level || 1) + 1;
        user.xp = user.xp - 150;
      }

      await dbService.saveUser(user);
      res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
