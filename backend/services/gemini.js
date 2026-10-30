import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config();

function getApiKey() {
  return (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) || '';
}

function getModel() {
  return (process.env.GEMINI_MODEL && process.env.GEMINI_MODEL.trim()) || 'gemini-flash-latest';
}

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

function buildPrescriptionPrompt({ originalName, mimeType }) {
  return `You are the Expert Prescription OCR & Clinical Pharmacologist AI for MedVault AI.
You specialize in reading handwritten doctor prescriptions, clinic orders, and pharmacy slips.

Document details:
- File name: ${originalName}
- Document Type: Prescription / Clinical Medication Order (${mimeType})

YOUR CLINICAL OCR TASKS:
1. DECIPHER HANDWRITING & LATIN SHORTHAND:
   - Carefully read the doctor's handwriting, clinic/hospital letterhead, doctor registration number, diagnosis, complaints, and Rx items.
   - Decode all medical/Latin abbreviations into plain, patient-friendly language:
     * OD -> Once daily
     * BD / BID -> Twice daily
     * TDS / TID -> Three times daily
     * QID -> Four times daily
     * HS -> At bedtime
     * AC -> Before food / meals
     * PC -> After food / meals
     * SOS -> As needed / only when necessary
     * Stat -> Immediately
     * 1-0-1 -> Morning and Night
     * 1-1-1 -> Morning, Afternoon, and Night
     * 1-0-0 -> Morning only
     * 0-0-1 -> Night only

2. EXTRACT STRUCTURED MEDICATIONS:
   - For every prescribed medicine, extract:
     * "name": Brand name and Generic name (e.g. "Augmentin 625mg (Amoxicillin + Clavulanate)")
     * "dosage": Strength/form (e.g. "625mg Tablet", "5ml Syrup")
     * "frequency": Dosage schedule (e.g. "Twice daily (1-0-1)")
     * "timing": Relation to food (e.g. "After meals (PC)", "Before meals (AC)")
     * "duration": Duration (e.g. "5 days", "1 month")
     * "instructions": Plain language instructions (e.g. "Take with water. Do not skip doses.")
     * "purpose": Clinical purpose/indication (e.g. "Bacterial infection", "Blood pressure control")

3. SAFETY PRECAUTIONS & COURSE WARNINGS:
   - Highlight any antibiotic course completion rules, side effects, or drug interactions.

Return a JSON object ONLY (no markdown fences, no extra text) with this exact shape:
{
  "report": "A complete markdown document explaining the prescription in plain language (see REQUIRED STRUCTURE below).",
  "finding": "Primary diagnosis or key prescribed therapy (e.g. 'Prescribed 5-day antibiotic course for acute respiratory tract infection')",
  "findingType": "one of 'warning' or 'none'",
  "recommendation": "Key patient guidance (e.g. 'Complete the full 5-day course as prescribed and follow up if fever persists.').",
  "critical": false,
  "medications": [
    {
      "name": "Medicine Name",
      "dosage": "Strength / Form",
      "frequency": "Frequency",
      "timing": "Food Timing",
      "duration": "Duration",
      "instructions": "Patient Instructions",
      "purpose": "Clinical Purpose"
    }
  ]
}

REQUIRED OUTPUT STRUCTURE for "report":
## 1. 📋 PRESCRIPTION OVERVIEW & DIAGNOSIS
- Prescribing Doctor / Clinic: (Doctor name, qualifications, clinic if visible)
- Diagnosis / Symptoms Noted: (Stated diagnosis or reason for consultation)
- Date of Prescription: (Date if visible)

## 2. 💊 DECIPHERED MEDICATIONS & DOSAGE SCHEDULE
Present a clear, easy-to-read markdown table of all medications:
| Medicine | Strength / Form | Frequency | Food Timing | Duration | Purpose |
|---|---|---|---|---|---|
(Include all deciphered medicines with their decoded abbreviations)

## 3. ⚠️ IMPORTANT PATIENT INSTRUCTIONS & SAFETY
- Specific instructions for each medication (e.g. empty stomach, finish antibiotic course).
- Precautions (avoid alcohol, stay hydrated, etc.).

## 4. 🩺 FOLLOW-UP & RED FLAGS
- When to see the doctor again.
- Symptoms requiring immediate medical attention.

---
### ⚠️ Important Disclaimer
This prescription analysis was generated by MedVault AI using automated handwriting OCR. Always verify medications with your pharmacist and follow your doctor's exact instructions.`;
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
  const apiKey = getApiKey();
  const primaryModel = getModel();
  const candidateModels = [primaryModel, 'gemini-flash-latest', 'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-flash-lite-latest'];
  const models = candidateModels.filter((m, i, arr) => arr.indexOf(m) === i);
  const model = models[attempt % models.length];
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body,
  });
  const json = await res.json().catch(() => ({}));

  if (res.ok) return json;

  console.warn(`[Gemini API] Model ${model} returned ${res.status}:`, json?.error?.message || res.statusText);

  const retryable =
    res.status === 429 ||
    res.status === 503 ||
    res.status === 404 ||
    json?.error?.status === 'UNAVAILABLE' ||
    json?.error?.status === 'RESOURCE_EXHAUSTED' ||
    json?.error?.status === 'NOT_FOUND';

  if (retryable && attempt < models.length * 2 - 1) {
    await sleep(1200 * (attempt + 1));
    return callWithRetry(body, attempt + 1);
  }

  const err = new Error(json?.error?.message || `Gemini API error ${res.status}`);
  err.status = res.status;
  throw err;
}

export async function summarizeRecord({ filePath, originalName, category, mimeType }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[Gemini] No GEMINI_API_KEY detected. Returning placeholder summary.');
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

  const isPrescription =
    (category && category.toLowerCase().includes('prescription')) ||
    originalName.toLowerCase().includes('prescription') ||
    originalName.toLowerCase().includes('rx');

  const prompt = isPrescription
    ? buildPrescriptionPrompt({ originalName, mimeType })
    : buildPrompt({ originalName, category, mimeType });
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
      medications: Array.isArray(parsed.medications) ? parsed.medications : [],
      isPrescription: Boolean(isPrescription),
      source: 'gemini',
    };
  } catch (err) {
    console.error('[Gemini Summarize Error]:', err.message);
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

export async function translateMedicalReport({ text, targetLanguage }) {
  if (!text || !text.trim()) {
    return '';
  }

  if (!targetLanguage || targetLanguage.toLowerCase() === 'english') {
    return text;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return `[${targetLanguage} Translation]\n\n*(AI service is in local mode. Live regional translations activate with GEMINI_API_KEY)*\n\n${text}`;
  }

  const prompt = `You are the expert Medical Translator for MedVault AI, an Indian healthcare record platform.
Your task is to accurately translate the provided medical summary from English into ${targetLanguage}.

Instructions:
1. Translate all explanatory text and headings into natural, culturally accessible, patient-friendly ${targetLanguage}.
2. Keep medical laboratory parameters, numbers, units (e.g. mg/dL, g/dL, bpm), and medications clearly recognizable (use transliteration or English acronyms where standard in clinical practice in India).
3. Preserve all markdown structure (##, ###, bullet points, tables, bold text) and severity emojis (🔴, 🟡, 🟢, ⚠️, 🧠, 🧪).
4. Return ONLY the translated markdown text. Do not wrap in JSON fences or add introductory remarks.

Medical Report Text to Translate:
${text}`;

  const body = JSON.stringify({
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,
    },
  });

  try {
    const json = await callWithRetry(body);
    const parts = json?.candidates?.[0]?.content?.parts || [];
    const translated = parts.map((p) => p.text || '').join('\n').trim();
    return translated || text;
  } catch (err) {
    console.error(`Gemini translation to ${targetLanguage} failed:`, err.message);
    throw new Error(`Failed to translate summary to ${targetLanguage}: ${err.message}`);
  }
}

