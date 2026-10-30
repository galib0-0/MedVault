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
  return (process.env.GEMINI_MODEL && process.env.GEMINI_MODEL.trim()) || 'gemini-3-flash-preview';
}

function detectMimeType(buffer, originalName, fallbackMime) {
  if (buffer && buffer.length >= 4) {
    // PDF: %PDF
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
      return 'application/pdf';
    }
    // JPEG: 0xFF 0xD8 0xFF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'image/jpeg';
    }
    // PNG: 0x89 0x50 0x4E 0x47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return 'image/png';
    }
    // WebP: RIFF...WEBP
    if (
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer.length >= 12 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    ) {
      return 'image/webp';
    }
  }

  const ext = path.extname(originalName || '').toLowerCase();
  if (ext === '.pdf') return 'application/pdf';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';

  if (fallbackMime && fallbackMime.startsWith('image/')) {
    return fallbackMime === 'image/jpg' ? 'image/jpeg' : fallbackMime;
  }
  return 'application/pdf';
}

function buildPrompt({ originalName, category, mimeType }) {
  return `You are the Expert Medical Document Analysis AI for MedVault AI, a digital healthcare platform.

Document details:
- File name: ${originalName}
- Category: ${category}
- Document Type: ${mimeType}

INSTRUCTIONS FOR ALL MEDICAL DOCUMENTS (TYPED & HANDWRITTEN):
1. Carefully inspect the entire document regardless of whether it is typed or handwritten:
   - If it is a doctor prescription or clinical note (handwritten or typed):
     * Decipher the handwriting, clinic/hospital header, doctor details, and Latin shorthand (OD, BD, TDS, HS, AC, PC, SOS, 1-0-1, etc.).
     * Extract all prescribed medicines with brand name, dosage, frequency, food timing, duration, instructions, and clinical purpose into the "medications" array.
     * Include a clear medication schedule table in the report.
   - If it is a laboratory or diagnostic test report:
     * Compare every reported parameter with its provided reference range.
     * Identify and group abnormal, borderline, and normal results.
     * Extract all doctor impressions, clinical observations, and diagnosis notes.
   - If it is an imaging, radiology scan, or discharge document:
     * Summarize key findings, hospital course, and discharge instructions.

2. Accuracy & Completeness:
   - Do NOT skip abnormal values or omit findings.
   - Do NOT invent values or reference ranges not present in the document.
   - Use simple, compassionate, patient-friendly language.
   - If handwritten text is ambiguous, provide the most plausible deciphering with a note to verify with a pharmacist.

Return a JSON object ONLY (no markdown fences, no extra text) with this exact shape:
{
  "report": "A COMPLETE markdown document (see REQUIRED OUTPUT STRUCTURE below) for the patient.",
  "finding": "The single most important clinical finding or diagnosis to highlight in the summary box.",
  "findingType": "one of 'critical', 'warning', or 'none'",
  "recommendation": "A practical next step to share with a doctor (1-2 sentences).",
  "critical": true or false,
  "medications": [
    {
      "name": "Medicine Name",
      "dosage": "Strength / Form",
      "frequency": "Frequency (e.g. Twice daily)",
      "timing": "Food Timing (e.g. After food)",
      "duration": "Duration (e.g. 5 days)",
      "instructions": "Patient Instructions",
      "purpose": "Clinical Indication"
    }
  ]
}

REQUIRED OUTPUT STRUCTURE for "report":
## 1. OVERALL HEALTH SUMMARY
Plain-language overview of the document: key findings, reason for visit/test, or primary diagnosis.

## 2. 🔴 REQUIRES ACTION — IMPORTANT FINDINGS
Any abnormal results, severe findings, or urgent clinical instructions.

## 3. 🟡 NEEDS ATTENTION — ABNORMAL OR BORDERLINE FINDINGS
Table of abnormal parameters (or doctor's secondary observations):
Test/Observation | Result | Reference Range | Status | Clinical Meaning

## 4. 💊 MEDICATIONS & TREATMENT SCHEDULE (if applicable)
If any medications or treatments are prescribed (typed or handwritten), provide a clear schedule table:
Medicine | Strength | Frequency | Food Timing | Duration | Purpose

## 5. 🟢 NORMAL AND REASSURING FINDINGS
Summary of normal tests, stable findings, or reassuring clinical indicators.

## 6. URGENT OR PRIORITY FOLLOW-UP
Next steps, recommended doctor consultations, and tests to repeat.

---
### ⚠️ Important Disclaimer
This summary was generated by MedVault AI using automated medical document analysis. It is intended to help you understand and organize your health information but does not replace a qualified doctor's diagnosis, examination, or medical advice. Always consult a licensed healthcare professional.`;
}

function buildPrescriptionPrompt({ originalName, mimeType }) {
  return buildPrompt({ originalName, category: 'Prescriptions', mimeType });
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
    report: '',
    summary: `GEMINI_API_KEY is not configured on the backend hosting server. If deployed to Render, please add GEMINI_API_KEY into your Render Dashboard (Environment -> Environment Variables).`,
    finding: 'Gemini API Key Missing on Server',
    findingType: 'warning',
    recommendation: 'Add GEMINI_API_KEY to Render Environment Variables and click retry.',
    critical: false,
    source: 'error',
    errorDetails: 'Missing GEMINI_API_KEY in process.env',
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callWithRetry(body, attempt = 0) {
  const apiKey = getApiKey();
  const candidateModels = [
    'gemini-3-flash-preview',
    'gemini-3.1-flash-lite-preview',
  ];
  const primaryModel = getModel();
  const models = [primaryModel, ...candidateModels].filter((m, i, arr) => arr.indexOf(m) === i);
  const model = models[attempt % models.length];
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  let res;
  let json;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);
    res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    json = await res.json().catch(() => ({}));
  } catch (netErr) {
    console.warn(`[Gemini API] Network/Timeout error on model ${model} (attempt ${attempt}):`, netErr.message);
    if (attempt < models.length * 2 - 1) {
      await sleep(1500 * (attempt + 1));
      return callWithRetry(body, attempt + 1);
    }
    const err = new Error(
      netErr.name === 'AbortError'
        ? `Request to Google Gemini timed out after 35 seconds on ${model}.`
        : `Network connection to Google Gemini failed: ${netErr.message}`
    );
    err.status = 504;
    throw err;
  }

  if (res.ok) return json;

  const errMsg = json?.error?.message || res.statusText || `HTTP ${res.status}`;
  console.warn(`[Gemini API] Model ${model} returned ${res.status}:`, errMsg);

  const retryable =
    res.status === 429 ||
    res.status === 503 ||
    json?.error?.status === 'UNAVAILABLE' ||
    json?.error?.status === 'RESOURCE_EXHAUSTED';

  if (retryable && attempt < models.length * 2 - 1) {
    await sleep(2000 * (attempt + 1));
    return callWithRetry(body, attempt + 1);
  }

  let formattedMessage = errMsg;
  if (res.status === 429 || json?.error?.status === 'RESOURCE_EXHAUSTED') {
    formattedMessage = `Gemini API rate limit or free-tier quota exceeded (429). Please wait a moment before retrying.`;
  } else if (res.status === 403 || json?.error?.status === 'PERMISSION_DENIED') {
    formattedMessage = `Gemini API Key rejected by Google (403 Permission Denied): ${errMsg}`;
  } else if (res.status === 404 || json?.error?.status === 'NOT_FOUND') {
    formattedMessage = `Gemini model ${model} was not found (404): ${errMsg}`;
  }

  const err = new Error(formattedMessage);
  err.status = res.status;
  err.details = json?.error;
  throw err;
}

export async function summarizeRecord({ filePath, originalName, category, mimeType }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[Gemini] No GEMINI_API_KEY detected. Returning error.');
    return { ...localSummary({ originalName, category }), source: 'error' };
  }

  let fileData;
  try {
    fileData = await fs.readFile(filePath);
  } catch (err) {
    return {
      report: '',
      summary: `The uploaded document could not be accessed on this server instance (${err.message}). If the document was uploaded to a cloud container that restarted or a different host, please re-upload the file.`,
      finding: 'Original File Not Found On Server',
      findingType: 'warning',
      recommendation: 'Please delete and re-upload the document in PDF, JPEG, or PNG format.',
      critical: false,
      source: 'error',
      errorDetails: err.message,
    };
  }

  const isPrescription =
    (category && category.toLowerCase().includes('prescription')) ||
    originalName.toLowerCase().includes('prescription') ||
    originalName.toLowerCase().includes('rx') ||
    originalName.toLowerCase().includes('whatsapp');

  const prompt = isPrescription
    ? buildPrescriptionPrompt({ originalName, mimeType })
    : buildPrompt({ originalName, category, mimeType });

  // Guarantee valid Gemini-supported MIME type using actual buffer magic bytes
  const safeMime = detectMimeType(fileData, originalName, mimeType);

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
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  });

  try {
    const json = await callWithRetry(body);
    const parts = json?.candidates?.[0]?.content?.parts || [];
    const contentParts = parts.filter((p) => !p.thought);
    const texts = (contentParts.length ? contentParts : parts)
      .map((p) => p.text || '')
      .filter(Boolean);
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
        report: '',
        summary: 'We received a response from Google Gemini but could not parse the structured clinical output. Click below to retry.',
        finding: 'Summary Parsing Error',
        findingType: 'warning',
        recommendation: 'Click retry to re-analyze with Gemini.',
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

    let findingHeadline = 'AI Analysis Encountered An Issue';
    let rec = 'Click below to re-run AI summarization with Google Gemini.';

    if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('rate limit')) {
      findingHeadline = 'Gemini Rate Limit / Quota Exceeded (429)';
      rec = 'Google Gemini free-tier rate limit reached. Please wait 30 seconds and click retry.';
    } else if (err.message?.includes('403') || err.message?.includes('PERMISSION_DENIED')) {
      findingHeadline = 'Gemini API Key Unauthorized (403)';
      rec = 'Verify your GEMINI_API_KEY in Google AI Studio or check Render Environment Variables.';
    } else if (err.message?.includes('404')) {
      findingHeadline = 'Gemini Model Unavailable (404)';
      rec = 'The requested AI model was not found. Retrying with gemini-3-flash-preview.';
    } else if (err.message?.includes('timed out')) {
      findingHeadline = 'AI Analysis Timed Out';
      rec = 'The document took longer than 35s to analyze. Click retry to process again.';
    } else if (err.message?.includes('no pages') || err.message?.includes('document')) {
      findingHeadline = 'Document Content Unreadable';
      rec = 'The document appears to be empty or corrupted. Please verify the uploaded file.';
    }

    return {
      report: '',
      summary: `AI summarization could not be completed: ${err.message}`,
      finding: findingHeadline,
      findingType: 'warning',
      recommendation: rec,
      critical: false,
      source: 'error',
      errorDetails: err.message,
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

