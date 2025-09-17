const express = require('express');
const router = express.Router();
const Job = require('../models/job.model');

// A test endpoint to simulate loading
router.get('/load', (req, res) => {
  setTimeout(() => {
    res.json({ message: 'Done Loaded!' });
  }, 4000);
});

// Job status fetcher
router.get('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
