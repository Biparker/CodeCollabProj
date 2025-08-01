const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');

// Create new project
const createProject = async (req, res) => {
  try {
    console.log('Project creation request received:', {
      body: req.body,
      file: req.file,
      user: req.user
    });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, technologies, githubUrl, liveUrl, requiredSkills, tags, resources } = req.body;
    const owner = req.user._id;

    // Handle image upload
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    // Parse technologies if it's a JSON string
    let parsedTechnologies = [];
    if (technologies) {
      try {
        parsedTechnologies = JSON.parse(technologies);
      } catch (e) {
        parsedTechnologies = Array.isArray(technologies) ? technologies : [technologies];
      }
    }

    const project = new Project({
      title,
      description,
      image: imagePath,
      technologies: parsedTechnologies,
      githubUrl,
      liveUrl,
      requiredSkills,
      tags,
      resources,
      owner
    });

    await project.save();
    await project.populate('owner', 'username email');

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('owner', '_id username')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};

// Get project by ID
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', '_id username')
      .populate('collaborators.userId', '_id username');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, status, requiredSkills, tags, resources } = req.body;
    const projectId = req.params.id;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (status) updateFields.status = status;
    if (requiredSkills) updateFields.requiredSkills = requiredSkills;
    if (tags) updateFields.tags = tags;
    if (resources) updateFields.resources = resources;

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $set: updateFields },
      { new: true }
    ).populate('owner', 'name email');

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
};

// Request collaboration
const requestCollaboration = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is already a collaborator
    const isCollaborator = project.collaborators.some(
      collab => collab.userId.toString() === req.user._id.toString()
    );

    if (isCollaborator) {
      return res.status(400).json({ message: 'Already a collaborator or pending request' });
    }

    project.collaborators.push({
      userId: req.user._id,
      status: 'pending'
    });

    await project.save();
    res.json({ message: 'Collaboration request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error requesting collaboration', error: error.message });
  }
};

// Handle collaboration request
const handleCollaborationRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const { projectId, userId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to handle collaboration requests' });
    }

    const collaborator = project.collaborators.find(
      collab => collab.userId.toString() === userId
    );

    if (!collaborator) {
      return res.status(404).json({ message: 'Collaboration request not found' });
    }

    collaborator.status = status;
    await project.save();

    res.json({ message: `Collaboration request ${status} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Error handling collaboration request', error: error.message });
  }
};

// Search projects
const searchProjects = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const projects = await Project.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
        { requiredSkills: { $regex: query, $options: 'i' } }
      ]
    })
    .populate('owner', 'name email')
    .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error searching projects', error: error.message });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  requestCollaboration,
  handleCollaborationRequest,
  searchProjects
}; 