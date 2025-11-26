const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a cover letter using Gemini AI
 * @param {Object} jobDetails - Job details (title, location, requirements, employer)
 * @param {Object} userProfile - User profile (skills, summary)
 * @param {Object} resumeData - Resume highlights (optional)
 * @returns {Promise<string>} Generated cover letter
 */
async function generateCoverLetter(jobDetails, userProfile, resumeData = null) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Generate a professional cover letter for an NHS job application in the UK.

Job Details:
- Title: ${jobDetails.title}
- Location: ${jobDetails.location}
- Employer: ${jobDetails.employer || 'NHS'}
- Requirements: ${jobDetails.requirements || 'Not specified'}

Applicant Profile:
- Skills: ${userProfile.skills}
- Experience Summary: ${userProfile.summary || 'Healthcare professional with relevant experience'}

${resumeData ? `Resume Highlights:\n${resumeData}` : ''}

Instructions:
1. Write a compelling, professional cover letter
2. Show genuine enthusiasm for the NHS and healthcare
3. Highlight relevant skills and experience from the applicant profile
4. Keep it concise (under 400 words)
5. Follow UK business letter conventions
6. Use formal but warm tone
7. Do not include placeholder addresses or dates (the applicant will add these)
8. Start with "Dear Hiring Manager,"
9. Focus on why the applicant is a great fit for this specific role

Write only the cover letter body, without any additional formatting or comments.
    `.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const coverLetter = response.text();

    return coverLetter;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate cover letter');
  }
}

/**
 * Generate a professional summary from skills and experience
 * @param {string} skills - User skills
 * @param {string} experience - User experience
 * @returns {Promise<string>} Generated summary
 */
async function generateProfileSummary(skills, experience = '') {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Generate a concise professional summary (2-3 sentences) for an NHS healthcare professional.

Skills: ${skills}
Experience: ${experience || 'Not specified'}

Make it professional, engaging, and suitable for NHS job applications.
Write only the summary, without any additional formatting or introduction.
    `.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return summary.trim();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate profile summary');
  }
}

module.exports = {
  generateCoverLetter,
  generateProfileSummary
};
