const Project = require("../models/project.schema.model"); // Import the model, not the schema
const LikeHistory = require("../models/likeHistory.model");
const mongoose = require("mongoose");

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create a new project
const createProject = async (req, res) => {
  try {
    const { title } = req.body;

    // Check if a project with the same title already exists for this owner
    const existingProject = await Project.findOne({ title });

    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: "A project with this title already exists for this user.",
      });
    }

    const project = await Project.create(req.body);

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format",
        error: {
          code: "INVALID_PROJECT_ID",
        },
      });
    }

    const project = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format",
        error: {
          code: "INVALID_PROJECT_ID",
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const likeProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const ip = req.ip; // get device/IP automatically

    if (!["like", "dislike"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "like" or "dislike".',
      });
    }

    const project = await Project.findById(id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format",
        error: {
          code: "INVALID_PROJECT_ID",
        },
      });
    }

    // Check cooldown (e.g., 10 seconds)
    const cooldown = 10 * 1000; // 10 sec
    const history = await LikeHistory.findOne({ projectId: id, ip });

    if (history && Date.now() - history.lastActionAt < cooldown) {
      return res.status(429).json({
        success: false,
        message: "You can like/dislike again in a few seconds",
      });
    }

    // Update likes
    if (action === "like") project.likesCount += 1;
    else project.likesCount = Math.max(project.likesCount - 1, 0);

    await project.save();

    // Update or create like history
    if (history) {
      history.lastActionAt = Date.now();
      await history.save();
    } else {
      await LikeHistory.create({ projectId: id, ip });
    }

    res.status(200).json({
      success: true,
      message: `Project ${action}d successfully`,
      likesCount: project.likesCount,
      data: project,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/projects/completed
const getCompletedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: "completed" }).sort({
      createdAt: -1,
    });
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const incrementViews = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    );

    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    res.json({ success: true, viewsCount: project.viewsCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  likeProject,
  getCompletedProjects,
  incrementViews,
};
