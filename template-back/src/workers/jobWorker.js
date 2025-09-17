const Job = require("../models/job.model");
const { processBulkTemplate } = require("./processBulkService");

function startJobWorker() {
  setInterval(runJobProcessor, 5000);
}

const runJobProcessor = async () => {
  const job = await Job.findOneAndUpdate(
    { status: "pending", type: "bulk_template_process" },
    { status: "processing" },
    { new: true }
  );

  if (!job) return;

  try {
    console.log("🚀 Processing job:", job._id);
    const result = await processBulkTemplate(job.payload);
    job.status = "completed";
    job.result = result;
    job.updatedAt = new Date();
    await job.save();
  } catch (err) {
    console.error("❌ Job failed:", err);
    job.status = "failed";
    job.error = err.message;
    job.updatedAt = new Date();
    await job.save();
  }
};

module.exports = {
  startJobWorker,
  runJobProcessor,
};
