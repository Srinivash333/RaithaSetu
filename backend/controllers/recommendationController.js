const { rankWorkersForJob, rankWorkersForCriteria, estimateWage } = require('../services/recommendationEngine');

exports.getWorkerRecommendations = async (req, res) => {
  try {
    const { jobId } = req.params;
    const recommendations = await rankWorkersForJob(jobId);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    console.error('Worker Recommendation Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate recommendations' });
  }
};

exports.getWageEstimate = async (req, res) => {
  try {
    const estimate = estimateWage(req.body);
    let availableWorkers = [];
    try {
      availableWorkers = await rankWorkersForCriteria(req.body);
    } catch (err) {
      console.warn('Worker ranking for criteria warning:', err.message);
    }

    res.status(200).json({
      success: true,
      estimate,
      availableWorkers
    });
  } catch (error) {
    console.error('Wage Estimate Error:', error);
    res.status(500).json({ success: false, error: 'Failed to estimate wage' });
  }
};
