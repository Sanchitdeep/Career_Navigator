import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to CSV file - Now using IT_Job_Roles_Skills.csv with 4 columns
const CSV_PATH = path.join(__dirname, '../data/IT_Job_Roles_Skills.csv');

// In-memory cache for parsed CSV
let rolesCache = null;

/**
 * Parse CSV file and cache results
 * New CSV format: Job Title, Job Description, Skills, Certifications
 */
function parseCSVFile() {
  return new Promise((resolve, reject) => {
    const roles = {};
    let rowCount = 0;

    // Check if CSV file exists in data directory first
    let csvPath = CSV_PATH;
    console.log(`📂 Looking for CSV at: ${csvPath}`);
    
    if (!fs.existsSync(csvPath)) {
      // Fallback to root IT_Job_Roles_Skills.csv
      csvPath = path.join(__dirname, '../../IT_Job_Roles_Skills.csv');
      console.log(`📂 File not found. Trying fallback: ${csvPath}`);
    }

    if (!fs.existsSync(csvPath)) {
      console.error(`❌ CSV file not found at either location:
        - ${CSV_PATH}
        - ${path.join(__dirname, '../../IT_Job_Roles_Skills.csv')}`);
      reject(new Error(`CSV file not found`));
      return;
    }

    console.log(`✓ Found CSV file at: ${csvPath}`);

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        rowCount++;
        // New CSV columns: Job Title, Job Description, Skills, Certifications
        if (row['Job Title'] && row['Skills']) {
          roles[row['Job Title']] = {
            skills: row['Skills'],
            description: row['Job Description'] || '',
            certifications: row['Certifications'] || ''
          };
        } else if (rowCount > 1) {
          console.warn(`⚠️  Row ${rowCount} missing Job Title or Skills:`, row);
        }
      })
      .on('end', () => {
        console.log(`✓ CSV parsing complete. Parsed ${rowCount} rows, created ${Object.keys(roles).length} roles`);
        resolve(roles);
      })
      .on('error', (error) => {
        console.error(`❌ CSV parsing error:`, error);
        reject(error);
      });
  });
}

/**
 * Get roles and skills from CSV (with caching)
 */
export const getROLES = async () => {
  if (!rolesCache) {
    rolesCache = await parseCSVFile();
  }
  return rolesCache;
};

/**
 * Get all available roles from CSV (now supports 400+ IT roles dynamically)
 */
export const getAllRoles = () => {
  // If cache exists, return synchronously
  if (rolesCache) {
    const rolesList = Object.keys(rolesCache).sort();
    console.log(`📋 getAllRoles() returning ${rolesList.length} roles from cache`);
    return rolesList;
  }

  // Fallback: empty array (roles will be loaded dynamically)
  console.warn('⚠️  getAllRoles() - rolesCache is empty or not initialized yet');
  return [];
};

/**
 * Get required skills for a specific role
 * Returns skills string for backward compatibility
 */
export const getRoleSkills = (role) => {
  if (!rolesCache) {
    return '';
  }

  const roleData = rolesCache[role];
  if (!roleData) return '';
  if (typeof roleData === 'string') return roleData; // Old format compatibility
  return roleData.skills || '';
};

/**
 * Get full role data including description and certifications
 */
export const getRoleData = (role) => {
  if (!rolesCache) {
    return null;
  }

  return rolesCache[role] || null;
};

/**
 * Initialize CSV cache (call this during app startup)
 */
export const initializeCSVCache = async () => {
  try {
    console.log('🚀 Initializing CSV cache...');
    rolesCache = await parseCSVFile();
    console.log(`✅ CSV cache initialized successfully with ${Object.keys(rolesCache).length} roles`);
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize CSV cache:', error.message);
    console.error('📍 Stack trace:', error.stack);
    console.warn('⚠️  Using fallback empty cache');
    rolesCache = {}; // Initialize as empty object instead of null
    throw error; // Re-throw so server knows initialization failed
  }
};
