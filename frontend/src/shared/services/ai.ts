import { marked } from "marked";
import { config } from "../config";


export type TaskType =
  | "generateAssignment"
  | "improveContent"
  | "summarizeContent"
  | "expandContent"
  | "shortenContent"
  | "rewriteContent"
  | "checkQuality"
  | "generateConclusion"
  | "extractKeywords"
  | "bulletPoints"
  | "addExamples"
  | "generateTitle"
  | "generate"
  | "parse_structure"
  | "improve"
  | "expand"
  | "shorten"
  | "rewrite"
  | "summarize"
  | "bullet_points"
  | "add_examples"
  | "simplify"
  | "generate_title"
  | "generate_abstract"
  | "generate_conclusion"
  | "check_quality"
  | "plagiarism_check"
  | "extract_keywords"
  | "custom";

export type AcademicTone = "formal" | "critical" | "persuasive" | "descriptive" | "analytical" | "simple";

interface TaskInput {
  task_type: TaskType;
  topic?: string;
  description?: string;
  content?: string;
  tone?: AcademicTone;
  selection?: string;
  template?: string | any;
  sections?: string[] | { title: string, level: number }[];
  studentName?: string;
  regNo?: string;
  course?: string;
  institution?: string;
}

const getPrompt = (input: TaskInput): string => {
  const { task_type, topic, description, content, tone = "formal", selection, template, sections, studentName, regNo, course, institution } = input;
  const targetText = selection || content;

  const baseContext = `You are an advanced academic writing assistant for the platform "Doxio". 
  GENERAL RULES:
  - Always produce structured, academic, clean output.
  - Avoid unnecessary fluff.
  - Maintain clarity and readability.
  - Use a ${tone} academic tone.
  - Do not repeat instructions in output.
  - Output only the result.
  - Use Markdown for formatting (headings, lists, etc.).
  - IMPORTANT: If you generate code snippets, ALWAYS wrap them in triple backticks with the language name (e.g., \`\`\`python).
  - IMPORTANT: Ensure code snippets are clean, well-commented, and look like they would in a professional IDE.
  - IMPORTANT: Do NOT wrap the entire output in quotes.
  - IMPORTANT: Do NOT include any introductory or concluding remarks like "Here is your assignment".
  `;

  let taskInstruction = "";

  switch (task_type) {
    case "generate":
      taskInstruction = `Generate a full academic assignment on the topic: "${topic}". 
      Description: ${description || "N/A"}.
      
      ${template ? `TEMPLATE CONTEXT:
      The user has provided a template structure. Follow this structure closely.
      TEMPLATE TEXT:
      """
      ${typeof template === 'string' ? template : JSON.stringify(template, null, 2)}
      """
      
      CRITICAL INSTRUCTION:
      1. METADATA PRESERVATION: If the template contains metadata fields or headers like "Name", "Reg No", "Reg Nod", "Faculty ID", "College", "Campus", "Department", "Course", "Date", etc., you MUST extract them from the template and include them at the very beginning of the generated document exactly as they appear in the template.
      2. FORMATTING: Maintain the exact same formatting for these fields as seen in the template.
      3. VALUES: 
         - If the user provided a Student Name: "${studentName || ''}", use it.
         - If the user provided a Registration Number: "${regNo || ''}", use it.
         - Otherwise keep placeholders.
      4. ALIGNMENT: Preserve structure.
      5. NO INVENTION.` : ""}

      ${sections ? `STRUCTURE / SECTIONS:
      The user wants to follow this specific hierarchical structure:
      ${sections.map((s, i) => typeof s === 'string' ? `${i + 1}. ${s}` : `${'  '.repeat(s.level - 1)}${s.level === 1 ? 'Section' : 'Sub'}: ${s.title}`).join('\n')}
      
      CRITICAL: You MUST generate detailed academic content for EVERY section and subsection listed above. Do NOT skip any headings. The final document must be complete and follow the structure exactly.
      ` : ''}
      
      ${studentName || regNo || course || institution ? `STUDENT / ACADEMIC CONTEXT:
      ${studentName ? `- Student: ${studentName}` : ''}
      ${regNo ? `- Reg/Roll No: ${regNo}` : ''}
      ${course ? `- Course: ${course}` : ''}
      ${institution ? `- Institution: ${institution}` : ''}
      ` : ''}
    Ensure deep academic content and full coverage of the structure.`;
      break;

    case "parse_structure":
      taskInstruction = `You are an advanced academic document structure extraction engine.
      TASK: Extract a complete structured representation of the document provided below.

      STRICT REQUIREMENTS:
      1. STRUCTURE EXTRACTION: Identify Main title, All headings, Subheadings, Section hierarchy, and Section order.
      2. METADATA DETECTION: Extract fields like Student Name, Registration Number, Course, Date, College / University. Use null for missing fields.
      3. STYLE ANALYSIS: Infer dominant font family, heading font sizes, alignment, line spacing, and margins (best-effort).
      4. OUTPUT FORMAT: STRICT JSON only. Do not include explanations.
      
      JSON SCHEMA:
      {
        "title": "",
        "sections": [
          { "title": "", "level": 1, "subsections": [] }
        ],
        "metadata": {
          "student_name": "",
          "registration_number": "",
          "course": "",
          "date": "",
          "institution": ""
        },
        "style": {
          "font_family": "",
          "heading_font_size": "",
          "body_font_size": "",
          "alignment": "",
          "line_spacing": "",
          "margins": { "top": "", "bottom": "", "left": "", "right": "" }
        }
      }

      TEMPLATE TEXT TO ANALYZE:
      """
      ${content}
      """`;
      break;

    case "generateAssignment":
      taskInstruction = `Generate assignment on "${topic}" with sections.`;
      break;

    case "improveContent":
    case "improve":
      taskInstruction = `Improve:
      "${targetText}"`;
      break;

    case "summarizeContent":
    case "summarize":
      taskInstruction = `Summarize:
      "${targetText}"`;
      break;

    case "expandContent":
    case "expand":
      taskInstruction = `Expand:
      "${targetText}"`;
      break;

    case "shortenContent":
    case "shorten":
      taskInstruction = `Shorten:
      "${targetText}"`;
      break;

    case "rewriteContent":
    case "rewrite":
      taskInstruction = `Rewrite:
      "${targetText}"`;
      break;

    case "checkQuality":
    case "check_quality":
      taskInstruction = `Check quality:
      "${targetText}"`;
      break;

    case "generateTitle":
    case "generate_title":
      taskInstruction = `Generate title:
      "${targetText}"`;
      break;

    case "extractKeywords":
    case "extract_keywords":
      taskInstruction = `Extract keywords:
      "${targetText}"`;
      break;

    case "generateConclusion":
    case "generate_conclusion":
      taskInstruction = `Generate conclusion:
      "${targetText}"`;
      break;

    case "bulletPoints":
    case "bullet_points":
      taskInstruction = `Convert to bullet points:
      "${targetText}"`;
      break;

    case "addExamples":
    case "add_examples":
      taskInstruction = `Add examples:
      "${targetText}"`;
      break;

    case "simplify":
      taskInstruction = `Simplify:
      "${targetText}"`;
      break;

    case "generate_abstract":
      taskInstruction = `Generate abstract:
      "${targetText}"`;
      break;

    case "plagiarism_check":
      taskInstruction = `Check plagiarism:
      "${targetText}"`;
      break;

    case "custom":
      taskInstruction = `${description}
      "${targetText}"`;
      break;

    default:
      taskInstruction = "Invalid task type.";
  }

  return `${baseContext}\n\nTASK: ${taskInstruction}`;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Normalize markdown → HTML; never return empty when source text is non-empty. */
async function markdownToHtml(markdown: string): Promise<string> {
  const raw = markdown.trim();
  if (!raw) return "";

  const parsed = await marked.parse(raw);
  const html = typeof parsed === "string" ? parsed : String(parsed);
  const trimmed = html.trim();
  if (trimmed) return html;

  // Rare: markdown parses to nothing (e.g. only comments) — show escaped source
  return `<p>${escapeHtml(raw)}</p>`;
}

export const performTask = async (input: TaskInput): Promise<string> => {
  try {

    const prompt = getPrompt(input);

    const token = localStorage.getItem('am_access_token');
    const res = await fetch(`${config.apiUrl}/documents/ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        prompt: prompt,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const detail = data?.detail ?? data?.error ?? res.statusText;
      throw new Error(typeof detail === "string" ? detail : "AI request failed");
    }

    let text =
      typeof data.content === "string"
        ? data.content
        : data.content != null
          ? String(data.content)
          : "";
    text = text.trim().replace(/^["']|["']$/g, "");

    if (!text) {
      throw new Error(
        "The model returned no text. Check that your Gemini API key is set on the backend (GEMINI_API_KEY or VITE_GEMINI_API_KEY) and try again."
      );
    }

    if (input.task_type === 'parse_structure') {
      return text.replace(/```json|```/g, '').trim();
    }

    const html = await markdownToHtml(text);
    if (!html.trim()) {
      throw new Error("Could not turn the model output into editor content.");
    }
    return html;

  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to perform academic task. Please try again.");
  }
};