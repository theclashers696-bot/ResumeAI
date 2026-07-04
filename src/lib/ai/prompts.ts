export const RESUME_JSON_SHAPE = `{
  "summary": "string, 2-4 sentences, ATS-optimized professional summary",
  "workExperiences": [
    { "company": "string", "position": "string", "location": "string", "startDate": "YYYY-MM", "endDate": "YYYY-MM or empty if current", "current": boolean, "description": "string", "achievements": ["string (start with strong action verb, include metric)", "..."] }
  ],
  "educations": [
    { "institution": "string", "degree": "string", "fieldOfStudy": "string", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "description": "string" }
  ],
  "skills": [ { "name": "string", "category": "string (e.g. Frontend, Backend, Tools, Soft Skills)" } ],
  "projects": [ { "name": "string", "description": "string (2 sentences, quantify impact)", "technologies": ["string"] } ],
  "certifications": [ { "name": "string", "issuer": "string", "issueDate": "YYYY-MM" } ],
  "achievements": [ { "title": "string (strong action verb + quantified result)", "description": "string" } ]
}`;

export function buildResumeGenerationPrompt(input: {
  jobTitle: string;
  yearsOfExperience: string;
  education: string;
  keySkills: string;
  targetCompany: string;
  country: string;
  background: string;
}): string {
  return `You are an elite resume writer and ATS optimization expert. Generate a complete, ATS-optimized resume in strict JSON for this candidate.

Target Job Title: ${input.jobTitle}
Years of Experience: ${input.yearsOfExperience}
Education: ${input.education}
Key Skills: ${input.keySkills}
Target Company: ${input.targetCompany || "Not specified"}
Country / Job Market: ${input.country || "Not specified"}
Candidate Background Notes: ${input.background || "Not provided"}

Rules:
- Write realistic, specific, achievement-oriented content. Quantify impact (numbers, percentages, dollar amounts) wherever plausible.
- Use strong action verbs. Avoid clichés like "hard worker", "team player", "results-oriented".
- Tailor language and keywords to the target job title and company culture if specified.
- Include 2-3 relevant certifications common in this field.
- Include 2-3 measurable achievements as standalone items.
- Plausible generic company names are fine (e.g. "Nexus Technologies") — do NOT invent real employer names.
- For education: use the provided education field; if vague, create a realistic degree for the field.
- Return ONLY valid JSON matching this exact shape, no markdown, no commentary:
${RESUME_JSON_SHAPE}`;
}

export function buildSummaryPrompt(input: {
  jobTitle: string;
  yearsOfExperience: string;
  keySkills: string;
  tone: string;
}): string {
  return `Write a professional resume summary (2-4 sentences, ${input.tone} tone) for a ${input.jobTitle} with ${input.yearsOfExperience} years of experience. Key skills to highlight: ${input.keySkills}. Make it ATS-friendly with relevant keywords. Return ONLY the summary text, no quotes, no markdown, no preamble.`;
}

export function buildExperienceBulletsPrompt(input: {
  position: string;
  company: string;
  description: string;
  count: number;
}): string {
  return `You are a resume writing expert. Based on this role, write ${input.count} concise, achievement-oriented resume bullet points using strong action verbs and quantifiable impact where plausible.

Position: ${input.position}
Company: ${input.company}
Notes: ${input.description}

Return ONLY a JSON array of strings, no markdown, no commentary. Example: ["Led a team of...", "Increased revenue by..."]`;
}

export function buildSkillsSuggestPrompt(input: {
  jobTitle: string;
  existingSkills: string;
  industry?: string;
  country?: string;
}): string {
  const context = [
    input.industry ? `Industry: ${input.industry}` : "",
    input.country ? `Job market: ${input.country}` : "",
  ]
    .filter(Boolean)
    .join(". ");

  return `Suggest 12 relevant professional skills (mix of technical and soft skills, weighted toward in-demand and ATS-recognized terms) for a "${input.jobTitle}" role. ${context ? context + ". " : ""}Existing skills already listed: ${input.existingSkills || "none"}. Do not repeat existing skills. Return ONLY a JSON array of strings, no markdown, no commentary.`;
}

export function buildProjectDescriptionPrompt(input: {
  name: string;
  technologies: string;
  notes: string;
}): string {
  return `Write a concise, impactful resume-style project description (2-3 sentences) for a project called "${input.name}" using technologies: ${input.technologies}. Notes: ${input.notes}. Include what problem it solved and any measurable outcome if possible. Return ONLY the description text, no markdown, no quotes.`;
}

export function buildAchievementPrompt(input: { context: string }): string {
  return `Turn this rough note into a polished, quantified resume achievement statement (one sentence, strong action verb, specific metric or outcome): "${input.context}". Return ONLY the achievement text, no quotes, no markdown.`;
}

export function buildCoverLetterPrompt(input: {
  jobTitle: string;
  company: string;
  jobDescription: string;
  tone: string;
  candidateSummary: string;
}): string {
  return `Write a compelling, ${input.tone} cover letter for a "${input.jobTitle}" position at "${input.company}".

Job description: ${input.jobDescription || "Not provided"}
Candidate background: ${input.candidateSummary || "Not provided"}

Rules:
- 3-4 paragraphs, no more than 400 words.
- Mirror keywords from the job description for ATS compatibility.
- Do not use placeholder brackets like [Your Name] — write ready-to-send prose, using "Hiring Manager" as the greeting if no name is known.
- Paragraph 1: strong opening with why you're excited about this specific company/role.
- Paragraph 2-3: 2-3 specific relevant skills/achievements matching the job description.
- Final paragraph: clear call to action.
- Return ONLY the letter body text, no markdown, no commentary.`;
}

export const ATS_JSON_SHAPE = `{
  "score": number (0-100),
  "summary": "string, 1-2 sentences explaining the score",
  "keywordsFound": ["string", "..."],
  "keywordsMissing": ["string", "..."],
  "suggestions": ["string — actionable improvement", "..."],
  "weakSections": ["string — section name that needs work", "..."],
  "readabilityScore": number (0-100),
  "formattingIssues": ["string", "..."]
}`;

export function buildATSAnalysisPrompt(input: { resumeText: string; jobDescription: string }): string {
  return `You are an ATS (Applicant Tracking System) resume scoring expert with 15 years of HR technology experience. Analyze the resume below${
    input.jobDescription ? " against the target job description" : ""
  } and produce a detailed structured JSON report.

RESUME:
${input.resumeText}

${input.jobDescription ? `JOB DESCRIPTION:\n${input.jobDescription}` : ""}

Scoring criteria:
- Keywords & phrases (30%): ATS-critical terms, industry buzzwords, hard skills
- Formatting & structure (20%): sections present, logical order, dates consistent
- Readability (20%): action verbs, sentence clarity, no jargon
- Completeness (20%): all key sections present, sufficient detail
- Relevance to job (10% — only if JD provided): match quality

Return ONLY valid JSON matching this exact shape, no markdown, no commentary:
${ATS_JSON_SHAPE}`;
}

export const JOB_MATCH_JSON_SHAPE = `{
  "matchScore": number (0-100),
  "matchedSkills": ["string", "..."],
  "missingSkills": ["string", "..."],
  "recommendations": ["string — specific actionable improvement", "..."],
  "keywordGap": ["string — high-priority missing keywords from JD", "..."],
  "strengthAreas": ["string — resume areas that strongly match", "..."]
}`;

export function buildJobMatchPrompt(input: { resumeText: string; jobDescription: string }): string {
  return `You are a senior talent acquisition specialist. Compare this resume against the job description and produce a detailed match analysis.

RESUME:
${input.resumeText}

JOB DESCRIPTION:
${input.jobDescription}

Scoring criteria:
- Hard skill overlap (40%): direct technical skill matches
- Experience level fit (25%): years and seniority match
- Keyword density (20%): ATS-critical terms present in resume
- Role context (15%): domain, industry, and company type fit

Return ONLY valid JSON matching this exact shape, no markdown, no commentary:
${JOB_MATCH_JSON_SHAPE}`;
}

export function buildResumeImprovementPrompt(resumeText: string): string {
  return `You are an elite resume writer. Rewrite and improve this resume to maximize ATS compatibility, clarity, and impact.

CURRENT RESUME:
${resumeText}

Requirements:
- Strengthen all bullet points with action verbs and quantifiable metrics
- Improve keyword density for ATS
- Remove clichés and weak filler phrases
- Improve readability and parallel structure
- Ensure consistent date formats (YYYY-MM)

Return the improved resume as JSON matching this exact shape, no markdown, no commentary:
${RESUME_JSON_SHAPE}`;
}

export const RESUME_HEALTH_JSON_SHAPE = `{
  "overallScore": number (0-100),
  "formattingScore": number (0-100),
  "contentScore": number (0-100),
  "keywordScore": number (0-100),
  "grammarScore": number (0-100),
  "readabilityScore": number (0-100),
  "recruiterScore": number (0-100),
  "weakSections": [{ "section": "string", "issue": "string", "fix": "string" }],
  "strongSections": ["string"],
  "longSentences": ["string — example of a sentence that is too long"],
  "passiveVoice": ["string — example passive voice phrase found"],
  "actionVerbsUsed": ["string — strong action verbs found"],
  "buzzwords": ["string — overused/cliché buzzwords found"],
  "grammarIssues": ["string — specific grammar or punctuation issue"],
  "suggestions": ["string — actionable improvement tip"]
}`;

export function buildResumeHealthPrompt(resumeText: string): string {
  return `You are an elite resume editor and ATS expert. Perform a deep health analysis of this resume across 7 dimensions and identify specific issues.

RESUME:
${resumeText}

Score each dimension (0-100):
- Formatting Score: section structure, bullet consistency, date formats, spacing
- Content Score: achievement detail, quantification, specificity, depth
- Keyword Score: industry terminology, ATS keywords, technical terms density
- Grammar Score: correct grammar, punctuation, tense consistency
- Readability Score: sentence length, clarity, action verbs, jargon-free
- Recruiter Score: overall impression, professional tone, impact statements
- Overall Score: weighted average of all dimensions

Also identify:
- weakSections: sections that need improvement (name + specific issue + how to fix)
- strongSections: sections done well
- longSentences: copy 2-3 examples of sentences that are too long (>25 words)
- passiveVoice: copy 2-3 passive voice examples found ("was managed by", "were responsible for")
- actionVerbsUsed: list 5-8 strong action verbs found in the resume
- buzzwords: overused clichés like "results-oriented", "passionate", "self-starter"
- grammarIssues: specific issues found (tense mismatch, missing period, etc.)
- suggestions: 5-7 specific, actionable improvements

Return ONLY valid JSON matching this exact shape, no markdown, no commentary:
${RESUME_HEALTH_JSON_SHAPE}`;
}

export const CAREER_INTELLIGENCE_JSON_SHAPE = `{
  "currentRole": "string — inferred current/target role",
  "experienceLevel": "string — Junior/Mid/Senior/Lead/Executive",
  "careerPaths": [
    {
      "title": "string",
      "description": "string — 1-2 sentences on this path",
      "salaryRange": { "min": number, "max": number, "currency": "USD" },
      "yearsToAchieve": "string (e.g. 1-2 years)",
      "requiredSkills": ["string"],
      "difficulty": "Easy|Medium|Hard"
    }
  ],
  "currentSalaryRange": { "min": number, "max": number, "currency": "USD", "level": "string" },
  "popularSkills": ["string — in-demand skills for this role"],
  "trendingTechnologies": ["string — trending tech in this field"],
  "suggestedCertifications": [
    { "name": "string", "provider": "string", "priority": "High|Medium|Low", "reason": "string" }
  ],
  "learningRoadmap": [
    { "step": number, "title": "string", "description": "string", "timeframe": "string", "skills": ["string"] }
  ]
}`;

export function buildCareerIntelligencePrompt(resumeText: string): string {
  return `You are a senior career strategist and labor market expert. Analyze this resume and generate a comprehensive career intelligence report.

RESUME:
${resumeText}

Generate:
1. 3-4 realistic career paths (lateral moves, promotions, pivots)
2. Current market salary range for their role/level (USD, US market)
3. 8-10 most in-demand skills for their field right now
4. 6-8 trending technologies in their industry
5. 3-4 high-value certifications they should consider
6. A 5-step learning roadmap to reach their next career level

Be specific and realistic. Base salary estimates on current US tech market (2024-2025).

Return ONLY valid JSON matching this exact shape, no markdown, no commentary:
${CAREER_INTELLIGENCE_JSON_SHAPE}`;
}

export const INTERVIEW_PREP_JSON_SHAPE = `{
  "jobTitle": "string",
  "technical": [
    { "question": "string", "answer": "string (detailed, 2-4 sentences)", "difficulty": "Easy|Medium|Hard", "tip": "string — what interviewers look for" }
  ],
  "behavioral": [
    { "question": "string", "answer": "string — STAR-format suggested answer", "framework": "STAR|CAR|SOAR", "competency": "string — leadership/teamwork/problem-solving/etc" }
  ],
  "hr": [
    { "question": "string", "answer": "string — honest, professional suggested answer" }
  ]
}`;

export function buildInterviewPrepPrompt(input: { resumeText: string; jobTitle: string }): string {
  return `You are an expert interview coach with 15 years of experience helping candidates land jobs at top companies. Generate a comprehensive interview prep guide tailored to this candidate's resume and target role.

TARGET ROLE: ${input.jobTitle}

CANDIDATE RESUME:
${input.resumeText}

Generate:
- 6 technical interview questions (relevant to their skills and target role) with detailed answers
- 5 behavioral questions using STAR format with suggested answers based on their experience
- 4 HR/culture fit questions with suggested honest, professional answers

Questions should be specific to their background — reference their actual experience, skills, and projects where possible.

Return ONLY valid JSON matching this exact shape, no markdown, no commentary:
${INTERVIEW_PREP_JSON_SHAPE}`;
}

export const SKILL_GAP_JSON_SHAPE = `{
  "currentLevel": "string — assessed level for target role",
  "matchScore": number (0-100),
  "summary": "string — 2-3 sentence assessment",
  "missingSkills": [
    { "skill": "string", "priority": "High|Medium|Low", "reason": "string — why this skill matters for the target role" }
  ],
  "courses": [
    { "title": "string", "provider": "string (Coursera/Udemy/LinkedIn Learning/edX/etc)", "duration": "string", "level": "Beginner|Intermediate|Advanced", "focus": "string — what you will learn" }
  ],
  "roadmap": [
    { "step": number, "milestone": "string", "description": "string", "timeframe": "string", "skills": ["string"] }
  ]
}`;

export function buildSkillGapPrompt(input: { resumeText: string; targetRole: string }): string {
  return `You are a career development expert and technical skills assessor. Analyze this candidate's resume against their target role and produce a detailed skill gap analysis.

TARGET ROLE: ${input.targetRole}

CANDIDATE RESUME:
${input.resumeText}

Analyze:
1. What percentage of required skills they already have (matchScore)
2. 6-8 missing skills ranked by priority (High/Medium/Low)
3. 4-5 specific online courses to close the gaps (real providers: Coursera, Udemy, LinkedIn Learning, edX, Pluralsight)
4. A 4-5 step learning roadmap with realistic timeframes

Be specific — reference their actual existing skills when explaining gaps.

Return ONLY valid JSON matching this exact shape, no markdown, no commentary:
${SKILL_GAP_JSON_SHAPE}`;
}

export const RESUME_COMPARISON_JSON_SHAPE = `{
  "resume1Score": number (0-100),
  "resume2Score": number (0-100),
  "winner": "resume1|resume2|tie",
  "recommendation": "string — 2-3 sentence verdict explaining which is better and why",
  "differences": [
    { "section": "string", "resume1": "string — what resume 1 does here", "resume2": "string — what resume 2 does here", "verdict": "resume1_better|resume2_better|equal", "reason": "string" }
  ],
  "resume1Strengths": ["string"],
  "resume2Strengths": ["string"],
  "improvements": ["string — specific things to borrow from the better resume or add to both"]
}`;

export function buildResumeComparisonPrompt(input: { resumeText1: string; resumeText2: string }): string {
  return `You are a senior resume reviewer and ATS expert. Compare these two resume versions and provide a detailed assessment of which is stronger and why.

RESUME 1:
${input.resumeText1}

---

RESUME 2:
${input.resumeText2}

Evaluate across: keyword density, impact of achievements, content depth, formatting signals, section completeness, and overall ATS-friendliness.

Score each resume 0-100 overall. Identify key differences section by section. Declare a winner with a clear recommendation.

Return ONLY valid JSON matching this exact shape, no markdown, no commentary:
${RESUME_COMPARISON_JSON_SHAPE}`;
}

export const CHAT_SYSTEM_INSTRUCTION = `You are the ResumeAI Assistant, a friendly, knowledgeable career and resume-writing coach embedded inside a resume builder app. You help users:
- Improve their resumes and bullet points
- Prepare for job interviews
- Give job search strategy and salary advice
- Create career roadmaps
- Answer questions about ATS systems and hiring processes

Style guidelines:
- Keep answers concise, practical, and encouraging
- Use short paragraphs or bullet points for readability
- Be specific — give examples when helpful
- Format with markdown (bold key terms, use lists)
- Do not claim to submit applications or take actions outside the chat
- Do not make up specific company data`;
