import axios from 'axios';

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

/**
 * Normalize skills array - lowercase and trim
 */
export const normalizeSkills = (skills) => {
  return Array.from(new Set(
    skills
      .map(skill => skill.trim().toLowerCase())
      .filter(skill => skill.length > 0)
  )).sort();
};

/**
 * Extract URLs from text and return structured link objects
 */
function parseResourceLinks(resource) {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const urls = resource.match(urlRegex);

  if (urls && urls.length > 0) {
    let text = resource.replace(urlRegex, '').trim();
    text = text.replace(/[-:,]*\s*$/, '').trim();
    
    return {
      text: text || urls[0],
      url: urls[0],
      isLink: true
    };
  }

  return {
    text: resource,
    url: null,
    isLink: false
  };
}

/**
 * ONE COMPREHENSIVE API CALL - Does everything in a single request:
 * 1. Extracts skills from resume
 * 2. Performs gap analysis (matches with required skills)
 * 3. Generates roadmap and interview questions
 * 
 * Returns complete analysis in single combined format
 */
export const comprehensiveAnalysis = async (resumeText, requiredSkills, targetRole) => {
  try {
    console.log("🚀 Starting comprehensive single-API analysis...");

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured in .env');
    }

    const requiredSkillsList = requiredSkills.join(", ");

    const prompt = `You are a professional resume analyzer, skills matcher, and career development mentor. In ONE response, perform ALL of the following tasks:

TASK 1: EXTRACT SKILLS FROM RESUME
Resume Text:
${resumeText}

TASK 2: MATCH SKILLS & GAP ANALYSIS
Required Skills for ${targetRole}: ${requiredSkillsList}

TASK 3: GENERATE LEARNING ROADMAP
For the ${targetRole} role, considering the extracted skills.

TASK 4: GENERATE INTERVIEW QUESTIONS
Prepare 15-20 common interview questions for ${targetRole} positions.

=== REQUIRED JSON RESPONSE FORMAT ===
Return ONLY a valid JSON object (no markdown, no extra text) with this EXACT structure:
{
  "extractedSkills": ["skill1", "skill2", "skill3"],
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "matchPercentage": 50,
  "roadmap": [
    {
      "skill": "skill name",
      "resources": ["resource description with link - https://example.com", "another resource - https://example.com"],
      "project": "hands-on project description with guidance",
      "time_estimate": "estimated time (e.g., '2-3 weeks')"
    }
  ],
  "interviewQuestions": [
    {
      "question": "What is X and how do you use it?",
      "answer": "Detailed comprehensive answer explaining the concept, applications, examples, and best practices."
    }
  ]
}

=== DETAILED REQUIREMENTS ===

TASK 1 - SKILL EXTRACTION:
- Extract ALL technical skills from the resume
- Return as lowercase array
- Remove duplicates
- Keep skill names to 1-3 words

TASK 2 - SKILL MATCHING & GAP ANALYSIS:
- Match extracted skills with required skills
- Consider skill aliases and variations (JS=JavaScript, React=ReactJS, etc)
- Consider technology relationships (Django & Flask both map to Python web frameworks)
- matchedSkills: skills from required list that are present or closely related
- missingSkills: skills from required list that are NOT present
- matchPercentage: (matchedSkills.length / requiredSkills.length) * 100

TASK 3 - LEARNING ROADMAP:
- Create 8-10 entries for most important missing skills related to ${targetRole}
- For each skill include 3-4 practical learning resources with direct links
- Include beginner-friendly project ideas with clear step-by-step guidance
- Provide realistic time estimates in increasing order
- Resources should have direct URLs that are real and accessible
- Prioritize skills by importance for the ${targetRole}

TASK 4 - INTERVIEW QUESTIONS:
- Generate 15-20 common interview questions for ${targetRole}
- Include mix of: conceptual questions, hands-on scenarios, best practices, problem-solving
- Each answer should be 3-4 sentences, detailed but concise
- Focus on ${targetRole} role context
- Ensure answers are suitable for interview preparation

=== GENERAL REQUIREMENTS ===
- ALL data must be high quality and professional
- Include current industry best practices
- JSON ONLY - no markdown, no extra text, no code blocks
- Ensure matchPercentage is a number (0-100)
- Ensure all arrays exist and are valid JSON`;

    console.log("🔗 Calling Gemini API (single comprehensive call)...");

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("✅ Comprehensive API call succeeded");

    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No response from Gemini API");
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = generatedText.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    // Parse JSON
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (err) {
      console.error("❌ JSON Parse Error:", jsonStr);
      throw new Error("Invalid JSON from Gemini");
    }

    // Validate response structure
    if (!parsed.extractedSkills || !parsed.matchedSkills || !parsed.missingSkills || 
        !parsed.roadmap || !parsed.interviewQuestions) {
      throw new Error('Invalid comprehensive analysis format from Gemini API');
    }

    // Parse roadmap resources with links into clickable format
    const enhancedRoadmap = (parsed.roadmap || []).map((item) => ({
      ...item,
      resources: Array.isArray(item.resources)
        ? item.resources.map(parseResourceLinks)
        : []
    }));

    const result = {
      extractedSkills: parsed.extractedSkills || [],
      matchedSkills: parsed.matchedSkills || [],
      missingSkills: parsed.missingSkills || [],
      matchPercentage: parsed.matchPercentage || 0,
      roadmap: enhancedRoadmap,
      interviewQuestions: parsed.interviewQuestions || []
    };

    console.log(`✓ Single API call generated all data: ${result.extractedSkills.length} skills, ${result.roadmap.length} roadmap items, ${result.interviewQuestions.length} interview questions`);
    return result;

  } catch (error) {
    console.error('❌ Comprehensive API error:', error.message);
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);

    // Fallback: Generate basic analysis
    console.warn('⚠️ Falling back to basic analysis generation');
    return generateBasicComprehensiveAnalysis(resumeText, requiredSkills, targetRole);
  }
};

/**
 * Fallback comprehensive analysis (no AI)
 * Enhanced with intelligent skill matching and context awareness
 */
function generateBasicComprehensiveAnalysis(resumeText, requiredSkills, targetRole) {
  // Extract skills using enhanced method with synonyms and context
  const extractedSkills = extractBasicSkillsEnhanced(resumeText);
  
  // Perform intelligent matching
  const matchedSkills = requiredSkills.filter(skill => 
    isSkillMatchFallback(skill, extractedSkills)
  );

  const missingSkills = requiredSkills.filter(skill => !matchedSkills.includes(skill));
  
  const matchPercentage = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  return {
    extractedSkills,
    matchedSkills,
    missingSkills,
    matchPercentage,
    roadmap: generateBasicRoadmap(missingSkills),
    interviewQuestions: generateBasicInterviewQuestions(extractedSkills, targetRole)
  };
}

/**
 * Enhanced skill extraction with aliases, variations, and context awareness
 */
function extractBasicSkillsEnhanced(text) {
  const skillAliasMap = {
    'javascript': ['js', 'ecmascript', 'es6', 'es5'],
    'python': ['py'],
    'typescript': ['ts'],
    'cpp': ['c++', 'c\\+\\+'],
    'csharp': ['c#'],
    'react': ['reactjs', 'react.js'],
    'vuejs': ['vue', 'vue.js'],
    'angularjs': ['angular'],
    'nodejs': ['node.js', 'node'],
    'nextjs': ['next.js', 'next'],
    'rest api': ['restful', 'rest', 'api'],
    'graphql': ['graph ql'],
    'kubernetes': ['k8s'],
    'postgres': ['postgresql', 'psql'],
    'mongo': ['mongodb'],
    'docker': ['containerization'],
    'cicd': ['ci/cd', 'continuous integration'],
    'machine learning': ['ml'],
    'tensorflow': ['tf'],
    'ui design': ['ui/ux', 'user interface'],
    'ux design': ['user experience'],
    'shell scripting': ['bash', 'shell'],
    'git': ['version control'],
    'agile': ['agile development'],
    'scrum': ['scrum master'],
    'aws': ['amazon web services'],
    'azure': ['microsoft azure'],
    'gcp': ['google cloud'],
  };

  // Primary skills dictionary (expanded with more variations)
  const primarySkills = [
    'javascript', 'python', 'java', 'cpp', 'csharp', 'ruby', 'php', 'go', 'rust', 'kotlin', 'scala',
    'react', 'vuejs', 'angularjs', 'svelte', 'nextjs', 'nodejs', 'express', 'django', 'flask', 'fastapi',
    'mongodb', 'sql', 'postgres', 'mysql', 'redis', 'elasticsearch', 'cassandra', 'firestore',
    'html', 'css', 'sass', 'tailwind', 'bootstrap', 'material ui',
    'git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'ansible',
    'typescript', 'rest api', 'graphql', 'jwt', 'oauth', 'soap',
    'linux', 'bash', 'powershell', 'shell scripting', 'unix',
    'machine learning', 'tensorflow', 'pytorch', 'scikit-learn', 'keras', 'opencv', 'pandas', 'numpy',
    'figma', 'adobe xd', 'sketch', 'ui design', 'ux design', 'responsive design',
    'cicd', 'jenkins', 'gitlab', 'github', 'agile', 'scrum', 'jira', 'trello',
    'jest', 'mocha', 'pytest', 'selenium', 'cypress', 'junit', 'unit testing', 'e2e testing',
    'kafka', 'rabbitmq', 'microservices', 'serverless', 'lambda', 'websockets'
  ];

  const normalizedText = text.toLowerCase().replace(/[^\w\s+#.]/g, ' ');
  const foundSkills = new Map();

  // Primary skill extraction with aliases
  for (const skill of primarySkills) {
    const patterns = [skill];
    if (skillAliasMap[skill]) {
      patterns.push(...skillAliasMap[skill]);
    }

    for (const pattern of patterns) {
      try {
        const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
        if (regex.test(normalizedText)) {
          foundSkills.set(skill, true);
          break;
        }
      } catch (e) {
        // Skip invalid regex patterns
      }
    }
  }

  // Context-aware extraction: "X years in Y" or "Proficient in Z"
  const contextSkills = extractContextAwareSkills(normalizedText);
  contextSkills.forEach(skill => foundSkills.set(skill, true));

  return Array.from(foundSkills.keys()).sort();
}

/**
 * Extract skills from context patterns like "5 years in JavaScript" or "Proficient in Python"
 */
function extractContextAwareSkills(text) {
  const foundSkills = new Set();

  // Pattern: "X years[+] [in|of|with] SKILL"
  const yearsPattern = /(\d+\+?\s*(?:months?|years?)\s*(?:in|of|with|experience)\s*)\w+\s+([a-z\s+#.]+?)(?=[,;.!?]|$|\n)/gi;
  let match;
  while ((match = yearsPattern.exec(text)) !== null) {
    const skillText = match[2].trim();
    if (skillText.length > 0 && skillText.length < 50) {
      foundSkills.add(skillText);
    }
  }

  // Pattern: "Proficient/Skilled/Expert [in|with] X[, Y, Z]"
  const proficientPattern = /(?:proficient|skilled?|experienced|expert|certified|worked with|knowledge of)\s+(?:in|with)\s+([a-z\s+#.,&\-]+?)(?=[.!?]|$|\n)/gi;
  while ((match = proficientPattern.exec(text)) !== null) {
    const skills = match[1].split(/[,&]|and/).map(s => s.trim()).filter(s => s && s.length < 50);
    skills.forEach(skill => foundSkills.add(skill));
  }

  return Array.from(foundSkills);
}

/**
 * Intelligent skill matching for fallback (understands aliases and relationships)
 */
function isSkillMatchFallback(requiredSkill, extractedSkills) {
  const skillAliasMap = {
    'javascript': ['js', 'ecmascript', 'es6', 'es5'],
    'python': ['py'],
    'typescript': ['ts'],
    'cpp': ['c++'],
    'csharp': ['c#'],
    'react': ['reactjs'],
    'vuejs': ['vue'],
    'angularjs': ['angular'],
    'nodejs': ['node.js', 'node'],
    'nextjs': ['next.js', 'next'],
    'postgresql': ['postgres', 'psql'],
    'mongodb': ['mongo'],
    'docker': ['containerization'],
    'kubernetes': ['k8s'],
  };

  // Normalize for comparison
  const normalize = (skill) => {
    return skill
      .toLowerCase()
      .replace(/\s*\(?api\)?/gi, '')
      .replace(/\s*framework/gi, '')
      .replace(/\s*library/gi, '')
      .replace(/\.js$/i, '')
      .replace(/\.py$/i, '')
      .trim();
  };

  const normalizedRequired = normalize(requiredSkill);

  // Check each extracted skill
  for (const extracted of extractedSkills) {
    const normalizedExtracted = normalize(extracted);

    // Exact match
    if (normalizedRequired === normalizedExtracted) {
      return true;
    }

    // Alias match
    if (skillAliasMap[normalizedRequired]) {
      for (const alias of skillAliasMap[normalizedRequired]) {
        if (alias.includes(normalizedExtracted) || normalizedExtracted.includes(alias)) {
          return true;
        }
      }
    }

    // Reverse alias match
    if (skillAliasMap[normalizedExtracted]) {
      for (const alias of skillAliasMap[normalizedExtracted]) {
        if (alias.includes(normalizedRequired) || normalizedRequired.includes(alias)) {
          return true;
        }
      }
    }

    // Substring match with minimum length check
    const minLength = Math.min(normalizedRequired.length, normalizedExtracted.length);
    if (minLength >= 4) {
      if (normalizedRequired.includes(normalizedExtracted) || normalizedExtracted.includes(normalizedRequired)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Generate basic roadmap
 */
function generateBasicRoadmap(missingSkills) {
  return missingSkills.map((skill) => ({
    skill,
    resources: [
      `Learn ${skill} from official documentation`,
      `Watch ${skill} tutorials on YouTube`,
      `Practice ${skill} on freeCodeCamp`,
    ],
    project: `Build a project using ${skill}`,
    time_estimate: "2-3 weeks",
  }));
}

/**
 * Generate basic interview questions
 */
function generateBasicInterviewQuestions(skills, targetRole) {
  const basicQuestions = [
    {
      question: `What experience do you have with ${skills[0] || 'the required technologies'}?`,
      answer: `I have hands-on experience with ${skills[0] || 'these technologies'} and have applied them in real-world projects to solve practical problems.`
    },
    {
      question: `How do you stay updated with the latest developments in ${skills[1] || 'your field'}?`,
      answer: `I regularly follow industry blogs, attend webinars, and participate in online communities to stay current with best practices and new technologies.`
    },
    {
      question: `Describe a challenging project where you used ${skills[0] || 'your technical skills'}.`,
      answer: `I worked on a complex project that required deep knowledge of ${skills[0] || 'my core skills'}. I approached it systematically, broke down the problem, and implemented a scalable solution.`
    },
    {
      question: `How do you ensure code quality and best practices in your work?`,
      answer: `I follow established coding standards, conduct code reviews, write comprehensive tests, and continuously refactor for maintainability and performance.`
    },
    {
      question: `What interests you about the ${targetRole} role?`,
      answer: `I'm passionate about ${targetRole} work because it aligns with my skills and interests. I'm excited about the opportunity to grow and contribute to your team.`
    }
  ];

  return basicQuestions;
}
