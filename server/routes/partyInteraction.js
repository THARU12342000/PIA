import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import PartyInteraction from '../models/PartyInteraction.js';

const router = express.Router();

// GET /partyInteraction - List all interactions with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      status,
      direction,
      priority,
      partyId,
      channel,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (direction) filter.direction = direction;
    if (priority) filter.priority = priority;
    if (partyId) filter['relatedParty.partyOrPartyRole.id'] = partyId;
    if (channel) filter['relatedChannel.channel.name'] = channel;
    
    if (startDate || endDate) {
      filter['interactionDate.startDateTime'] = {};
      if (startDate) filter['interactionDate.startDateTime'].$gte = new Date(startDate);
      if (endDate) filter['interactionDate.startDateTime'].$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const interactions = await PartyInteraction.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PartyInteraction.countDocuments(filter);

    res.json({
      data: interactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /partyInteraction/:id - Get specific interaction
router.get('/:id', async (req, res) => {
  try {
    const interaction = await PartyInteraction.findOne({ id: req.params.id });
    
    if (!interaction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }
    
    res.json(interaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /partyInteraction - Create new interaction
router.post('/', async (req, res) => {
  try {
    const interactionId = uuidv4();
    const interactionData = {
      ...req.body,
      id: interactionId,
      href: `${req.protocol}://${req.get('host')}/api/partyInteraction/${interactionId}`
    };

    // Generate IDs for interaction items if not provided
    if (interactionData.interactionItem) {
      interactionData.interactionItem = interactionData.interactionItem.map(item => ({
        ...item,
        id: item.id || uuidv4()
      }));
    }

    // Generate IDs for notes if not provided
    if (interactionData.note) {
      interactionData.note = interactionData.note.map(note => ({
        ...note,
        id: note.id || uuidv4(),
        date: note.date || new Date()
      }));
    }

    const interaction = new PartyInteraction(interactionData);
    const savedInteraction = await interaction.save();
    
    res.status(201).json(savedInteraction);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// PATCH /partyInteraction/:id - Update interaction
router.patch('/:id', async (req, res) => {
  try {
    const interaction = await PartyInteraction.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!interaction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }
    
    res.json(interaction);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /partyInteraction/:id - Delete interaction
router.delete('/:id', async (req, res) => {
  try {
    const interaction = await PartyInteraction.findOneAndDelete({ id: req.params.id });
    
    if (!interaction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /partyInteraction/:id/notes - Add note to interaction
router.post('/:id/notes', async (req, res) => {
  try {
    const { text, author } = req.body;
    
    if (!text || !author) {
      return res.status(400).json({ error: 'Text and author are required' });
    }

    const interaction = await PartyInteraction.findOne({ id: req.params.id });
    
    if (!interaction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }

    const newNote = {
      id: uuidv4(),
      text,
      author,
      date: new Date()
    };

    interaction.note.push(newNote);
    await interaction.save();
    
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /partyInteraction/stats/summary - Get interaction statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await PartyInteraction.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          opened: { $sum: { $cond: [{ $eq: ['$status', 'opened'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'inProgress'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          inbound: { $sum: { $cond: [{ $eq: ['$direction', 'inbound'] }, 1, 0] } },
          outbound: { $sum: { $cond: [{ $eq: ['$direction', 'outbound'] }, 1, 0] } }
        }
      }
    ]);

    const channelStats = await PartyInteraction.aggregate([
      { $unwind: '$relatedChannel' },
      {
        $group: {
          _id: '$relatedChannel.channel.name',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      summary: stats[0] || {
        total: 0, opened: 0, inProgress: 0, completed: 0, cancelled: 0,
        inbound: 0, outbound: 0
      },
      channelBreakdown: channelStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;