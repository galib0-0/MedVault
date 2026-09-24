import fs from 'node:fs/promises';

const API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const FALLBACK_MODELS = ['gemini-3.6-flash', 'gemini-flash-lite-latest'].filter(
  (m) => m !== MODEL
);
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

function buildPrompt({ originalName, category, mimeType }) {
  return `You are the Medical Report Analysis AI for MedVault AI, a patient-focused digital healthcare platform.

Document details:
- File name: ${originalName}
- Category: ${category}
- Type: ${mimeType}

Your task is to carefully analyze the ENTIRE medical report, including:
- Laboratory test results
- Reference ranges
- Doctor's observations
- Clinical impressions or diagnoses
- Radiology/imaging findings
- Risk scores
- Recommendations already present in the report

CRITICAL: Analyze the entire report. Do NOT only identify the headline abnormalities.
1. Compare every reported value with its provided reference range.
2. Identify every value that is above, below, marked abnormal/high/low/borderline/positive, or otherwise clinically significant.
3. Extract all doctor impressions, diagnoses, observations, and recommendations.
4. Extract all imaging or radiology findings.
5. Extract any risk scores or health assessment scores.
6. Identify important normal findings to provide reassurance.
7. Do not ignore a finding simply because it is less severe than another abnormal result.
If the report contains an abnormal value, it must either be included in the summary OR grouped with related findings under an appropriate category. Never silently omit an abnormal result.

Return a JSON object ONLY (no markdown fences, no extra text) with this exact shape:
{
  "report": "A COMPLETE markdown document (see REQUIRED OUTPUT STRUCTURE below) for the patient.",
  "finding": "The single most important clinical finding to highlight in the summary box, or 'No significant findings'.",
  "findingType": "one of 'critical', 'warning', or 'none'",
  "recommendation": "A practical next step to share with a doctor (1-2 sentences).",
  "critical": true or false
}

REQUIRED OUTPUT STRUCTURE — the "report" field MUST follow this structure exactly, in order:

## 1. OVERALL HEALTH SUMMARY
Short, simple overview: most important findings, main health areas requiring attention, important positive/normal findings. Simple language for a non-medical person.

## 2. 🔴 REQUIRES ACTION — IMPORTANT FINDINGS
Findings that may require timely medical attention, specialist review, follow-up, or treatment. For EACH finding provide: Finding; Actual Value / Result; Reference Range (only if in the report); What it means; Why it matters; Recommended next step. Use a "### [Condition Name]" sub-heading per finding. Do NOT invent reference ranges.

## 3. 🟡 NEEDS ATTENTION — ABNORMAL OR BORDERLINE FINDINGS
Every remaining abnormal or borderline parameter (blood values, lipids, blood indices, kidney values, metabolic values, anything outside the report's reference range). For each: Test name, Actual value, Reference range, High/Low/Borderline status, Simple explanation. Use a markdown table with columns: Test | Result | Reference Range | Status | Simple Meaning. Group related findings. Do not omit minor abnormalities.

## 4. DOCTOR'S CLINICAL IMPRESSIONS AND DIAGNOSES
All clinical impressions, diagnoses, observations explicitly mentioned in the report. For each use "### [Condition Name]" with: Reported Impression; Simple Explanation; Importance; Suggested Follow-up. If Bilateral Carotid Plaques or another significant cardiovascular finding is explicitly mentioned, clearly highlight it and recommend appropriate medical evaluation—do not hide it among minor findings.

## 5. 🧠 HEART AND CARDIOVASCULAR HEALTH
Dedicated section for blood pressure, cholesterol, LDL, HDL, triglycerides, VLDL, carotid findings, ECG findings, cardiac risk scores, any cardiovascular observations. Clearly connect related findings. Do not diagnose additional diseases not stated in the report.

## 6. 🧪 RISK SCORES AND HEALTH ASSESSMENTS
All AI-generated, clinical, or health risk scores present in the report. For each: Name of the risk assessment; Score or percentage; Risk category exactly as stated; Simple explanation. Include a caution that risk scores are assessments and do not guarantee a disease is or is not present.

## 7. 🟢 NORMAL AND REASSURING FINDINGS
Key health parameters within the report's normal range. Summarize key normal areas (e.g., liver function, kidney function, thyroid function, blood counts, blood sugar). Do NOT list every single normal test. Use "### 🟢 [System]" sub-headings. Only call a result normal if it is actually within the reference range provided in the report.

## 8. URGENT OR PRIORITY FOLLOW-UP
Prioritized action list with three sub-sections:
- "### 🔴 Priority Follow-up" — findings requiring timely medical evaluation.
- "### 🟡 Follow-up Recommended" — abnormalities to discuss at a medical consultation.
- "### 🟢 Continue Healthy Monitoring" — normal or stable areas.
Suggest the relevant type of specialist where appropriate (e.g., "Consider discussing this with a cardiologist or your treating physician for further evaluation."). Do not present specialist referral as confirmed medical necessity unless the report explicitly states it.

## 9. LIFESTYLE AND GENERAL HEALTH RECOMMENDATIONS
General wellness recommendations relevant to the findings: balanced diet, reducing excess sugar intake, physical activity appropriate to the condition, weight management where relevant, blood pressure monitoring, lipid management, follow-up testing, adequate sunlight/nutrition, avoiding smoking/tobacco where applicable. Do NOT prescribe medications, provide medication dosages, or tell the patient to start/stop medication. Clearly distinguish general wellness recommendations from medical treatment.

End the report with:

---
### ⚠️ Important Disclaimer
This summary was generated by MedVault AI using automated analysis of the uploaded medical report. It is intended to help you understand and organize your health information but does not replace a qualified doctor's diagnosis, examination, or medical advice. Always discuss abnormal results, symptoms, and treatment decisions with a licensed healthcare professional.

SEVERITY INDICATORS — use consistently throughout the report:
- 🔴 Requires Action: potentially significant findings needing timely attention or follow-up.
- 🟡 Needs Attention: abnormal, borderline, or non-urgent findings to monitor or discuss.
- 🟢 Normal / Reassuring: important results within the stated normal range.
Do not exaggerate severity. Do not label a finding as an emergency unless the report or result clearly supports that conclusion.

ACCURACY / COMPLETENESS RULES:
1. Do not skip abnormal values.
2. Do not invent missing values or diagnoses.
3. Do not invent reference ranges.
4. Do not claim something is normal if it is outside the report's reference range.
5. Do not ignore doctor's impressions or imaging findings.
6. Do not ignore risk scores.
7. Include important normal findings too.
8. Use simple, patient-friendly language.
9. If information is unclear or unreadable, explicitly state that it could not be confidently interpreted.
10. Preserve actual values exactly as present in the report.
11. Compare every value against the reference ranges provided in the report whenever available.
12. Be calm and non-alarming; write as markdown with clear headings, bullet points, and tables where useful.

"finding": the single most important immediate result to highlight; set findingType to 'critical' when a genuinely urgent finding exists (e.g., dangerously abnormal vital or lab result), otherwise 'warning' or 'none'. "critical" is true only when there is a genuinely urgent finding.`;
}

function parseJSON(text) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        /* fall through */
      }
    }
    return null;
  }
}

function localSummary({ originalName, category }) {
  const base = originalName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
  return {
    summary: `This is a ${category.toLowerCase()} document named "${base}". We could not connect to the AI service, so this is a locally generated placeholder summary. Please re-run summarization when the AI service is available.`,
    finding: 'Summary pending — AI service unavailable',
    findingType: 'none',
    recommendation: 'Try uploading again later, or ask your doctor to review the document.',
    critical: false,
    source: 'local',
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callWithRetry(body, attempt = 0) {
  const models = [MODEL, ...FALLBACK_MODELS];
  const model = models[attempt % models.length];
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': API_KEY,
    },
    body,
  });
  const json = await res.json().catch(() => ({}));

  if (res.ok) return json;

  const retryable =
    res.status === 429 ||
    res.status === 503 ||
    json?.error?.status === 'UNAVAILABLE' ||
    json?.error?.status === 'RESOURCE_EXHAUSTED';

  if (retryable && attempt < models.length * 2 - 1) {
    await sleep(1500 * (attempt + 1));
    return callWithRetry(body, attempt + 1);
  }

  const err = new Error(json?.error?.message || `Gemini API error ${res.status}`);
  err.status = res.status;
  throw err;
}

export async function summarizeRecord({ filePath, originalName, category, mimeType }) {
  if (!API_KEY) {
    return { ...localSummary({ originalName, category }), source: 'local' };
  }

  let fileData;
  try {
    fileData = await fs.readFile(filePath);
  } catch (err) {
    return {
      summary: `The uploaded file could not be read for summarization (${err.message}).`,
      finding: 'Unable to read file',
      findingType: 'none',
      recommendation: 'Re-upload the document in PDF or common image format.',
      critical: false,
      source: 'error',
    };
  }

  const prompt = buildPrompt({ originalName, category, mimeType });
  const safeMime = mimeType || 'application/octet-stream';
  const body = JSON.stringify({
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: safeMime, data: fileData.toString('base64') } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 16384,
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 1024 },
    },
  });

  try {
    const json = await callWithRetry(body);
    const parts = json?.candidates?.[0]?.content?.parts || [];
    const texts = parts.map((p) => p.text || '').filter(Boolean);
    let parsed = null;
    for (const t of texts) {
      parsed = parseJSON(t);
      if (parsed) break;
    }
    if (!parsed) {
      parsed = parseJSON(texts.join('\n'));
    }

    if (!parsed) {
      return {
        summary: 'We received a response from the AI but could not parse it. Please retry.',
        finding: 'Summary could not be generated',
        findingType: 'none',
        recommendation: 'Try uploading again later.',
        critical: false,
        source: 'error',
      };
    }

    return {
      report: parsed.report || '',
      summary: parsed.summary || '',
      finding: parsed.finding || 'No significant findings',
      findingType: ['critical', 'warning', 'none'].includes(parsed.findingType)
        ? parsed.findingType
        : 'none',
      recommendation: parsed.recommendation || '',
      critical: Boolean(parsed.critical),
      source: 'gemini',
    };
  } catch (err) {
    return {
      summary: `AI summarization failed (${err.message}). The file is stored safely in your vault.`,
      finding: 'AI service error',
      findingType: 'none',
      recommendation: 'Retry summarization, or ask your doctor to review the document.',
      critical: false,
      source: 'error',
    };
  }
}
