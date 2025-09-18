// Advanced multilingual resume parser with language-specific patterns

interface ResumeData {
  personalInfo: {
    name: string;
    summary: string;
  };
  experience: {
    id: number;
    description: string;
  }[];
  skills: string[];
  education: {
    id: number;
    description: string;
  }[];
  language: string;
  generatedAt: string;
}

// Main parser function
export function parseTranscriptToResume(text: string, language: string): ResumeData {
  // Clean text - remove excessive spaces, normalize newlines
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Extract data based on language
  const name = extractName(cleanText, language);
  const experience = extractExperience(cleanText, language);
  const skills = extractSkills(cleanText, language);
  const education = extractEducation(cleanText, language);
  
  // Create summary - first 200 chars or so
  const summary = text.substring(0, Math.min(text.length, 250)).trim() + '...';

  return {
    personalInfo: {
      name,
      summary,
    },
    experience,
    skills,
    education,
    language,
    generatedAt: new Date().toISOString(),
  };
}

// =========================================================
// Name extraction with multilingual support
// =========================================================
function extractName(text: string, language: string): string {
  // Default patterns for each language
  const patterns: {[key: string]: RegExp[]} = {
    'en-US': [
      /my name is (\w+(?:\s+\w+){0,3})/i,
      /i am (\w+(?:\s+\w+){0,3})/i,
      /this is (\w+(?:\s+\w+){0,3})/i,
      /I['']m (\w+(?:\s+\w+){0,3})/i,
      /(\w+(?:\s+\w+){1,3}) speaking/i,
      /(\w+(?:\s+\w+){1,3}) here/i,
    ],
    'hi-IN': [
      /मेरा नाम (\S+(?:\s+\S+){0,3}) है/i,
      /मैं (\S+(?:\s+\S+){0,3}) हूं/i,
      /मैं (\S+(?:\s+\S+){0,3}) हूँ/i,
      /मेरा नाम (\S+(?:\s+\S+){0,3})/i,
      /(\S+(?:\s+\S+){0,3}) बोल रहा हूं/i,
      /(\S+(?:\s+\S+){0,3}) बोल रही हूं/i,
    ],
    'kn-IN': [
      /ನನ್ನ ಹೆಸರು (\S+(?:\s+\S+){0,3})/i,
      /ನಾನು (\S+(?:\s+\S+){0,3})/i,
      /ನನ್ನ ಹೆಸರು (\S+(?:\s+\S+){0,3}) ಆಗಿದೆ/i,
      /(\S+(?:\s+\S+){0,3}) ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ/i,
    ],
  };

  // Get the correct patterns for the language
  const langPatterns = patterns[language] || patterns['en-US'];
  
  // Try each pattern until we find a match
  for (const pattern of langPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Fallback: Use first few words if no name pattern found
  // This is a heuristic - people often start with their name
  const firstWords = text.split(/[.!?;]/)[0]; // First sentence
  const words = firstWords.split(/\s+/);
  const firstFewWords = words.slice(0, Math.min(3, words.length)).join(' ');

  if (firstFewWords.length > 3) {
    return firstFewWords;
  }
  
  // Last resort: generic applicant name
  return language === 'hi-IN' ? 'आवेदक' : 
         language === 'kn-IN' ? 'ಅರ್ಜಿದಾರ' : 
         'Applicant';
}

// =========================================================
// Experience extraction with multilingual support
// =========================================================
function extractExperience(text: string, language: string): { id: number; description: string }[] {
  // Keywords for each language
  const keywords: {[key: string]: string[]} = {
    'en-US': [
      'experience', 'worked', 'work', 'job', 'company', 'position', 
      'responsible', 'role', 'employment', 'career', 'profession',
      'project', 'managed', 'led', 'developed', 'implemented', 'created'
    ],
    'hi-IN': [
      'अनुभव', 'काम', 'नौकरी', 'कंपनी', 'पद', 'कार्य', 'जिम्मेदारी', 'भूमिका',
      'रोजगार', 'कैरियर', 'पेशा', 'परियोजना', 'विकसित', 'प्रबंधन', 'कार्यान्वयन'
    ],
    'kn-IN': [
      'ಅನುಭವ', 'ಕೆಲಸ', 'ಉದ್ಯೋಗ', 'ಕಂಪನಿ', 'ಸ್ಥಾನ', 'ಕಾರ್ಯ', 'ಜವಾಬ್ದಾರಿ',
      'ಪಾತ್ರ', 'ಉದ್ಯೋಗ', 'ವೃತ್ತಿ', 'ಯೋಜನೆ', 'ನಿರ್ವಹಿಸಿದ'
    ]
  };

  // Get keywords for the selected language
  const langKeywords = keywords[language] || keywords['en-US'];
  
  // Split text into sentences and filter for experience-related content
  const sentences = text.split(/[.!?]+/);
  
  const experienceSentences = sentences
    .filter(sentence => {
      const lowercaseSentence = sentence.toLowerCase();
      return langKeywords.some(keyword => lowercaseSentence.includes(keyword.toLowerCase()));
    })
    .filter(sentence => sentence.trim().length > 10) // Minimum length for meaningful content
    .map(sentence => sentence.trim());

  // Remove duplicates and limit to 5 experience items
  const uniqueExperiences = [...new Set(experienceSentences)].slice(0, 5);
  
  // Format the experience entries
  return uniqueExperiences.map((description, index) => ({
    id: index + 1,
    description
  }));
}

// =========================================================
// Skills extraction with multilingual support
// =========================================================
function extractSkills(text: string, language: string): string[] {
  // Keywords for each language
  const keywords: {[key: string]: string[]} = {
    'en-US': [
      'skill', 'know', 'good at', 'proficient', 'expert', 'familiar with',
      'trained in', 'knowledge of', 'experienced in', 'certified in',
      'ability to', 'competent in'
    ],
    'hi-IN': [
      'कौशल', 'जानता', 'अच्छा हूँ', 'निपुण', 'विशेषज्ञ', 'परिचित',
      'प्रशिक्षित', 'ज्ञान', 'अनुभवी', 'प्रमाणित', 'क्षमता', 'योग्य',
      'सक्षम', 'दक्ष', 'कुशल'
    ],
    'kn-IN': [
      'ಕೌಶಲ್ಯ', 'ತಿಳಿದಿರುವ', 'ಪರಿಣತಿ', 'ಜ್ಞಾನ', 'ಅನುಭವಿ', 'ಸಾಮರ್ಥ್ಯ',
      'ಕಲಿತ', 'ಪ್ರಮಾಣಿತ', 'ಚೆನ್ನಾಗಿ ಬಲ್ಲ', 'ತರಬೇತಿ'
    ]
  };

  // Common skills to look for across languages
  const commonSkills = [
    // Technical skills
    'java', 'python', 'javascript', 'typescript', 'html', 'css', 'react', 'angular',
    'vue', 'node', 'express', 'django', 'spring', 'php', 'laravel', 'dotnet', 'c#',
    'azure', 'aws', 'gcp', 'cloud', 'devops', 'docker', 'kubernetes', 'jenkins',
    'sql', 'mysql', 'postgresql', 'mongodb', 'database', 'nosql', 'git',
    'android', 'ios', 'mobile', 'web', 'ui', 'ux', 'design', 'figma',
    'data', 'analysis', 'ai', 'ml', 'machine learning', 'deep learning',
    // Soft skills
    'communication', 'leadership', 'teamwork', 'management', 'project management',
    'agile', 'scrum', 'problem solving', 'analytical', 'creative', 'critical thinking',
    'time management', 'organization', 'collaboration', 'presentation', 'customer service',
    'flexibility', 'adaptability', 'negotiation', 'conflict resolution',
  ];

  // Language-specific common skills
  const languageSpecificSkills: {[key: string]: string[]} = {
    'hi-IN': [
      'संचार', 'नेतृत्व', 'टीम वर्क', 'प्रबंधन', 'परियोजना प्रबंधन',
      'एजाइल', 'स्क्रम', 'समस्या समाधान', 'विश्लेषणात्मक', 'रचनात्मक',
      'समय प्रबंधन', 'संगठन', 'सहयोग', 'प्रस्तुति', 'ग्राहक सेवा',
      'लचीलापन', 'अनुकूलन क्षमता', 'बातचीत', 'संघर्ष समाधान'
    ],
    'kn-IN': [
      'ಸಂವಹನ', 'ನಾಯಕತ್ವ', 'ತಂಡದ ಕೆಲಸ', 'ನಿರ್ವಹಣೆ', 'ಯೋಜನಾ ನಿರ್ವಹಣೆ',
      'ಅಜೈಲ್', 'ಸ್ಕ್ರಮ್', 'ಸಮಸ್ಯೆ ಪರಿಹಾರ', 'ವಿಶ್ಲೇಷಣಾತ್ಮಕ', 'ಸೃಜನಶೀಲ',
      'ಸಮಯ ನಿರ್ವಹಣೆ', 'ಸಂಘಟನೆ', 'ಸಹಯೋಗ', 'ಪ್ರಸ್ತುತಿ', 'ಗ್ರಾಹಕ ಸೇವೆ'
    ]
  };

  // Get keywords for the selected language
  const langKeywords = keywords[language] || keywords['en-US'];
  
  // Combine common skills with language-specific skills
  const allSkills = [...commonSkills, ...(languageSpecificSkills[language] || [])];
  
  // Extract skills using keyword patterns
  const skillSentences: string[] = [];
  
  // First approach: Find sentences mentioning skills
  const sentences = text.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    const lowercaseSentence = sentence.toLowerCase();
    
    // Check if sentence contains skill keywords
    const hasSkillKeyword = langKeywords.some(keyword => 
      lowercaseSentence.includes(keyword.toLowerCase())
    );
    
    if (hasSkillKeyword) {
      skillSentences.push(sentence.trim());
    }
  });
  
  // Second approach: Direct skill matching
  const directSkills: string[] = [];
  
  allSkills.forEach(skill => {
    if (text.toLowerCase().includes(skill.toLowerCase())) {
      // Extract the context around the skill
      const regex = new RegExp(`[^.!?;]*\\b${skill}\\b[^.!?;]*`, 'i');
      const match = text.match(regex);
      
      if (match && match[0]) {
        directSkills.push(match[0].trim());
      } else {
        directSkills.push(skill);
      }
    }
  });
  
  // Combine both approaches, remove duplicates, and limit to 10 skills
  const combinedSkills = [...skillSentences, ...directSkills];
  const uniqueSkills = [...new Set(combinedSkills)].slice(0, 10);
  
  return uniqueSkills;
}

// =========================================================
// Education extraction with multilingual support
// =========================================================
function extractEducation(text: string, language: string): { id: number; description: string }[] {
  // Keywords for each language
  const keywords: {[key: string]: string[]} = {
    'en-US': [
      'education', 'degree', 'college', 'university', 'studied', 'graduated',
      'diploma', 'certification', 'school', 'institute', 'qualification',
      'bachelor', 'master', 'phd', 'doctorate', 'mba', 'engineering',
      'science', 'arts', 'commerce', 'btech', 'mtech', 'bsc', 'msc', 'ba', 'ma'
    ],
    'hi-IN': [
      'शिक्षा', 'डिग्री', 'कॉलेज', 'विश्वविद्यालय', 'पढ़ाई', 'स्नातक',
      'डिप्लोमा', 'प्रमाणपत्र', 'स्कूल', 'संस्थान', 'योग्यता',
      'बैचलर', 'मास्टर', 'पीएचडी', 'डॉक्टरेट', 'एमबीए', 'इंजीनियरिंग',
      'विज्ञान', 'कला', 'वाणिज्य', 'बीटेक', 'एमटेक', 'बीएससी', 'एमएससी', 'बीए', 'एमए'
    ],
    'kn-IN': [
      'ವಿದ್ಯಾಭ್ಯಾಸ', 'ಪದವಿ', 'ಕಾಲೇಜು', 'ವಿಶ್ವವಿದ್ಯಾಲಯ', 'ಅಧ್ಯಯನ', 'ಪದವೀಧರ',
      'ಡಿಪ್ಲೊಮಾ', 'ಪ್ರಮಾಣಪತ್ರ', 'ಶಾಲೆ', 'ಸಂಸ್ಥೆ', 'ಅರ್ಹತೆ',
      'ಬ್ಯಾಚೆಲರ್', 'ಮಾಸ್ಟರ್', 'ಪಿಎಚ್‌ಡಿ', 'ಡಾಕ್ಟರೇಟ್', 'ಎಂಬಿಎ', 'ಇಂಜಿನಿಯರಿಂಗ್',
      'ವಿಜ್ಞಾನ', 'ಕಲೆ', 'ವಾಣಿಜ್ಯ'
    ]
  };

  // Get keywords for the selected language
  const langKeywords = keywords[language] || keywords['en-US'];
  
  // Split text into sentences and filter for education-related content
  const sentences = text.split(/[.!?]+/);
  
  const educationSentences = sentences
    .filter(sentence => {
      const lowercaseSentence = sentence.toLowerCase();
      return langKeywords.some(keyword => lowercaseSentence.includes(keyword.toLowerCase()));
    })
    .filter(sentence => sentence.trim().length > 10) // Minimum length for meaningful content
    .map(sentence => sentence.trim());

  // Remove duplicates and limit to 3 education items
  const uniqueEducation = [...new Set(educationSentences)].slice(0, 3);
  
  // Format the education entries
  return uniqueEducation.map((description, index) => ({
    id: index + 1,
    description
  }));
}

// =========================================================
// Utility functions
// =========================================================

// Check if a specific language pattern is a better match than default English
export function detectLanguage(text: string): string {
  // Counts of language-specific characters/patterns
  let hindiCount = 0;
  let kannadaCount = 0;
  let englishCount = 0;
  
  // Hindi Unicode range: \u0900-\u097F
  const hindiPattern = /[\u0900-\u097F]/g;
  const hindiMatches = text.match(hindiPattern);
  hindiCount = hindiMatches ? hindiMatches.length : 0;
  
  // Kannada Unicode range: \u0C80-\u0CFF
  const kannadaPattern = /[\u0C80-\u0CFF]/g;
  const kannadaMatches = text.match(kannadaPattern);
  kannadaCount = kannadaMatches ? kannadaMatches.length : 0;
  
  // English pattern (simplified to ascii characters)
  const englishPattern = /[a-zA-Z]/g;
  const englishMatches = text.match(englishPattern);
  englishCount = englishMatches ? englishMatches.length : 0;
  
  // Determine dominant language
  if (hindiCount > kannadaCount && hindiCount > englishCount * 0.1) {
    return 'hi-IN';
  } else if (kannadaCount > hindiCount && kannadaCount > englishCount * 0.1) {
    return 'kn-IN';
  } else {
    return 'en-US';
  }
}

// Format resume as HTML
export function formatResumeAsHTML(resumeData: ResumeData, applicantName: string): string {
  // Use the detected name or fallback to provided name
  const displayName = resumeData.personalInfo.name || applicantName;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${displayName} - Resume</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0B63E5; padding-bottom: 20px; }
        .name { font-size: 28px; font-weight: bold; color: #0B63E5; margin-bottom: 10px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; color: #0B63E5; margin-bottom: 10px; border-left: 4px solid #0B63E5; padding-left: 10px; }
        .summary { font-style: italic; color: #666; margin-bottom: 20px; }
        .item { margin-bottom: 8px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #888; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">${displayName}</div>
        <div class="summary">${resumeData.personalInfo.summary}</div>
    </div>
    
    <div class="section">
        <div class="section-title">EXPERIENCE</div>
        ${resumeData.experience.map(exp => `<div class="item">• ${exp.description}</div>`).join('')}
        ${resumeData.experience.length === 0 ? '<div class="item">No specific experience details provided in recording.</div>' : ''}
    </div>
    
    <div class="section">
        <div class="section-title">SKILLS</div>
        ${resumeData.skills.map(skill => `<div class="item">• ${skill}</div>`).join('')}
        ${resumeData.skills.length === 0 ? '<div class="item">No specific skills mentioned in recording.</div>' : ''}
    </div>
    
    <div class="section">
        <div class="section-title">EDUCATION</div>
        ${resumeData.education.map(edu => `<div class="item">• ${edu.description}</div>`).join('')}
        ${resumeData.education.length === 0 ? '<div class="item">No education details provided in recording.</div>' : ''}
    </div>
    
    <div class="footer">
        Generated from voice application in ${getLanguageName(resumeData.language)}<br>
        Generated on: ${new Date(resumeData.generatedAt).toLocaleDateString()}
    </div>
</body>
</html>`;
}

// Get language name from code
function getLanguageName(languageCode: string): string {
  const languages: {[key: string]: string} = {
    'en-US': 'English',
    'hi-IN': 'Hindi (हिन्दी)',
    'kn-IN': 'Kannada (ಕನ್ನಡ)'
  };
  
  return languages[languageCode] || languageCode;
}