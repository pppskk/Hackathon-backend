const Round = require('../models/productionRounds');

exports.getRounds = async (req, res) => {
  try {
    const { plot_id } = req.query;
    
    // Validate input
    if (!plot_id) {
      return res.status(400).json({ error: 'plot_id is required' });
    }

    const rounds = await Round.findAll({ where: { plot_id } });
    res.json(rounds);

  } catch (err) {
    console.error('Error getting rounds:', err);
    res.status(500).json({ error: 'Failed to retrieve rounds' });
  }
};

exports.createRound = async (req, res) => {
  try {
    const { plot_id, user_id, round_name, start_date, end_date } = req.body;

    // Validate required fields
    if (!plot_id || !user_id || !round_name || !start_date) {
      return res.status(400).json({ 
        error: 'Missing required fields: plot_id, user_id, round_name, start_date' 
      });
    }

    // Validate date format 
    if (end_date && new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ 
        error: 'start_date must be before end_date' 
      });
    }

    const data = await Round.create({
      plot_id,
      user_id,
      round_name,
      start_date,
      end_date
    });

    res.status(201).json(data);

  } catch (err) {
    console.error('Error creating round:', err);
    

    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors.map(e => e.message) });
    }
    
    res.status(500).json({ error: 'Failed to create round' });
  }
};