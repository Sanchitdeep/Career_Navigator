import pdfParse from 'pdf-parse';
import { comprehensiveAnalysis, normalizeSkills } from '../utils/comprehensiveAnalyzer.js';
import { getRoleSkills, getAllRoles } from '../utils/csvParser.js';

/**
 * Get all available job roles from CSV
 */
export const getRoles = (req, res) => {
  try {
    console.log('🔍 GET /api/roles - Fetching available roles...');
    const roles = getAllRoles();
    console.log(`✅ Fetched ${roles.length} roles from cache`);
    
    if (roles.length === 0) {
      console.warn('⚠️  WARNING: No roles returned from getAllRoles()');
      return res.status(500).json({
        success: false,
        error: 'No roles available - CSV cache may not be initialized',
        count: 0,
        roles: []
      });
    }
    
    res.json({
      success: true,
      roles: roles,
      count: roles.length
    });
  } catch (error) {
    console.error('❌ Error fetching roles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available roles',
      details: error.message
    });
  }
};

/**
 * Upload and extract text from PDF resume
 */
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from PDF' });
    }

    res.json({
      success: true,
      resumeText: extractedText.trim(),
      message: 'Resume uploaded and processed successfully'
    });
  } catch (error) {
    console.error('PDF extraction error:', error);
    res.status(500).json({
      error: 'Failed to extract text from PDF',
      details: error.message
    });
  }
};

/**
 * Analyze resume against selected role
 * Input: { resumeText, targetRole }
 * Output: { extractedSkills, requiredSkills, missingSkills, matchPercentage, roadmap }
 */
export const analyzeResume = async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;

    // Validation
    if (!resumeText || !targetRole) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['resumeText', 'targetRole']
      });
    }

    if (resumeText.trim().length === 0) {
      return res.status(400).json({ error: 'Resume text is empty' });
    }

    // Get available roles from CSV
    const availableRoles = getAllRoles();

    // Validate target role
    const roleExists = availableRoles.some(
      role => role.toLowerCase() === targetRole.toLowerCase()
    );

    if (!roleExists) {
      return res.status(400).json({
        error: `Invalid role: ${targetRole}`,
        availableRoles: availableRoles
      });
    }

    console.log(`📋 Analyzing resume for role: ${targetRole}`);

    // Get required skills for the role
    console.log(`📖 Fetching required skills for ${targetRole}...`);
    const requiredSkillsStr = getRoleSkills(targetRole);
    const requiredSkills = normalizeSkills(
      requiredSkillsStr.split(',').map(s => s.trim())
    );
    console.log('✓ Required skills:', requiredSkills);

    // SINGLE API CALL: Extract skills, perform gap analysis, and generate roadmap + interview questions
    console.log('🚀 Starting comprehensive analysis (1 API call for everything)...');
    const analysis = await comprehensiveAnalysis(resumeText, requiredSkills, targetRole);
    console.log(`✓ Comprehensive analysis complete in single API call`);

    // Return comprehensive analysis
    const response = {
      extractedSkills: analysis.extractedSkills,
      requiredSkills: requiredSkills,
      matchedSkills: analysis.matchedSkills,
      missingSkills: analysis.missingSkills,
      matchPercentage: analysis.matchPercentage,
      roadmap: analysis.roadmap,
      interviewQuestions: analysis.interviewQuestions,
      summary: {
        totalRequired: requiredSkills.length,
        totalMatched: analysis.matchedSkills.length,
        totalMissing: analysis.missingSkills.length
      }
    };

    console.log('✅ Analysis complete');
    res.json(response);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze resume',
      details: error.message
    });
  }
};
