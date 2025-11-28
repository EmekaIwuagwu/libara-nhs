// src/controllers/textResumeController.js

const TextResume = require('../models/TextResume');

/**
 * Get all text resumes for a user
 */
exports.getAll = async (req, res) => {
    try {
        const userId = req.session.userId;
        const textResumes = await TextResume.findByUserId(userId);

        res.json({
            success: true,
            textResumes
        });

    } catch (error) {
        console.error('[TEXT RESUME] Get all error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch text resumes'
        });
    }
};

/**
 * Get a single text resume by ID
 */
exports.getById = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { id } = req.params;

        const textResume = await TextResume.findById(id, userId);

        if (!textResume) {
            return res.status(404).json({
                success: false,
                message: 'Text resume not found'
            });
        }

        res.json({
            success: true,
            textResume
        });

    } catch (error) {
        console.error('[TEXT RESUME] Get by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch text resume'
        });
    }
};

/**
 * Create a new text resume
 */
exports.create = async (req, res) => {
    try {
        const userId = req.session.userId;
        const {
            resume_name,
            personal_statement,
            work_experience,
            education,
            skills,
            certifications,
            references_text,
            full_cv_text
        } = req.body;

        // Validate required fields
        if (!full_cv_text || full_cv_text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'CV text is required'
            });
        }

        const resumeId = await TextResume.create({
            user_id: userId,
            resume_name: resume_name || 'My Text Resume',
            personal_statement,
            work_experience,
            education,
            skills,
            certifications,
            references_text,
            full_cv_text,
            is_default: false
        });

        res.json({
            success: true,
            message: 'Text resume created successfully',
            resumeId
        });

    } catch (error) {
        console.error('[TEXT RESUME] Create error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create text resume'
        });
    }
};

/**
 * Update a text resume
 */
exports.update = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { id } = req.params;
        const {
            resume_name,
            personal_statement,
            work_experience,
            education,
            skills,
            certifications,
            references_text,
            full_cv_text
        } = req.body;

        // Validate required fields
        if (!full_cv_text || full_cv_text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'CV text is required'
            });
        }

        const success = await TextResume.update(id, userId, {
            resume_name: resume_name || 'My Text Resume',
            personal_statement,
            work_experience,
            education,
            skills,
            certifications,
            references_text,
            full_cv_text
        });

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Text resume not found or update failed'
            });
        }

        res.json({
            success: true,
            message: 'Text resume updated successfully'
        });

    } catch (error) {
        console.error('[TEXT RESUME] Update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update text resume'
        });
    }
};

/**
 * Delete a text resume
 */
exports.delete = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { id } = req.params;

        const success = await TextResume.delete(id, userId);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Text resume not found'
            });
        }

        res.json({
            success: true,
            message: 'Text resume deleted successfully'
        });

    } catch (error) {
        console.error('[TEXT RESUME] Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete text resume'
        });
    }
};

/**
 * Set a text resume as default
 */
exports.setDefault = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { id } = req.params;

        const success = await TextResume.setDefault(id, userId);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Text resume not found'
            });
        }

        res.json({
            success: true,
            message: 'Default text resume updated successfully'
        });

    } catch (error) {
        console.error('[TEXT RESUME] Set default error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to set default text resume'
        });
    }
};
