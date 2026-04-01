import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// ── Resilient PDF.js Worker Configuration ─────────────────────────────────────
const PDFJS_VER = pdfjsLib.version || '5.5.207';

// Try to use a local or standard CDN worker with multiple fallbacks
const workerSources = [
    `https://unpkg.com/pdfjs-dist@${PDFJS_VER}/build/pdf.worker.min.mjs`,
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VER}/pdf.worker.min.mjs`,
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VER}/build/pdf.worker.min.mjs`
];

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSources[0];






// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

export interface Section {
    id: string;
    title: string;
    level: number;
    subsections?: Section[];
}

export interface TemplateData {
    title: string;
    sections: Section[];
    metadata: {
        student_name: string | null;
        registration_number: string | null;
        course: string | null;
        date: string | null;
        institution: string | null;
    };
    style: {
        font_family: string | null;
        heading_font_size: number | null;
        body_font_size: number | null;
        alignment: string | null;
        line_spacing: number | null;
        margins: {
            top: number | null;
            bottom: number | null;
            left: number | null;
            right: number | null;
        };
    };
    rawText: string;
}

interface TextItem {
    str: string;
    height: number;
    width: number;
    fontName: string;
    bold: boolean;
    x: number;
    y: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════════════════════════

const uid = () => Math.random().toString(36).substr(2, 9);

function parseMetadata(text: string): TemplateData['metadata'] {
    const extract = (pattern: RegExp): string | null => {
        const match = text.match(pattern);
        return match?.[1]?.trim() || null;
    };

    // More robust name extraction: handle various separators and trailing labels
    const nameMatch = text.match(/(?:student\s*name|name|submitted\s*by|author)\s*[:\-]\s*([^\n\r]{2,60})/i) ||
                     text.match(/\n\s*Name\s*\r?\n\s*([^\n\r]{2,60})/i); // Name on separate line

    return {
        student_name: nameMatch?.[1]?.trim() || null,
        registration_number: extract(/(?:reg(?:istration)?\.?\s*(?:no|number|#)|roll\s*no\.?|student\s*id|id\s*no\.?|enrollment)\s*[:\-]\s*([^\n\r]{2,40})/i),
        course: extract(/(?:course|programme?|subject|module|degree)\s*[:\-]\s*([^\n\r]{2,80})/i),
        institution: extract(/(?:institution|university|college|school|campus|dept(?:artment)?)\s*[:\-]\s*([^\n\r]{2,120})/i),
        date: extract(/(?:date|submitted(?:\s*on)?|due\s*date)\s*[:\-]\s*([^\n\r]{2,40})/i),
    };
}

function buildHierarchy(flatSections: Array<{ title: string; level: number }>): Section[] {
    const result: Section[] = [];
    const stack: Section[] = [];

    for (const item of flatSections) {
        const section: Section = {
            id: uid(),
            title: item.title,
            level: item.level,
            subsections: [],
        };

        // Find parent level
        while (stack.length > 0 && stack[stack.length - 1].level >= section.level) {
            stack.pop();
        }

        if (stack.length === 0) {
            // Top level
            result.push(section);
        } else {
            // Add as subsection
            const parent = stack[stack.length - 1];
            if (!parent.subsections) parent.subsections = [];
            parent.subsections.push(section);
        }

        stack.push(section);
    }

    // Clean up empty subsections arrays
    const cleanSubsections = (sections: Section[]) => {
        sections.forEach(s => {
            if (s.subsections && s.subsections.length === 0) {
                delete s.subsections;
            } else if (s.subsections) {
                cleanSubsections(s.subsections);
            }
        });
    };
    cleanSubsections(result);

    return result;
}

function extractTitle(text: string, sections: Array<{ title: string; level: number }>): string {
    // Try to find title from metadata
    const titleMatch = text.match(/(?:title|assignment\s*title|topic)\s*[:\-]\s*([^\n\r]{2,120})/i);
    if (titleMatch) return titleMatch[1].trim();

    // Use first H1 heading if available
    const firstH1 = sections.find(s => s.level === 1);
    if (firstH1 && !firstH1.title.toLowerCase().includes('introduction')) {
        return firstH1.title;
    }

    // Extract from first few lines
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i].trim();
        if (line.length >= 10 && line.length <= 120 && !line.includes(':')) {
            return line;
        }
    }

    return 'Untitled Document';
}

// ══════════════════════════════════════════════════════════════════════════════
// DOCX EXTRACTION
// ══════════════════════════════════════════════════════════════════════════════

function isSubsectionPattern(text: string): boolean {
    const t = text.toLowerCase();
    // Force H2 keywords for technical phases
    if (/output|code|screenshot|result|observation|step|task|source|verification|evaluation|comparison|preparation|preprocessing/.test(t)) return true;
    
    // Pattern for "Model Verification", "Model Evaluation", etc.
    if (/^model\s+(verification|evaluation|comparison|analysis|details|selection)/i.test(t)) return true;

    // Standard patterns: Step 1, 1., 1.1, Task A
    return /^(step|task|experiment|part|module|ex|case)\s*[\dA-Z]/i.test(text) || 
           /^(\d+[\.\)])\s+/.test(text) || 
           /^(\d+\.)+\d+/.test(text);
}

function isMajorSectionPattern(text: string): boolean {
    const t = text.toLowerCase();
    // Protect subsections from being captured as major sections
    if (isSubsectionPattern(text)) return false;
    // Force H1 keywords for clear major sections
    return /introduction|abstract|theory|procedure|methodology|discussion|conclusion|references|aim|objective/.test(t);
}

export async function extractDocx(file: File): Promise<TemplateData> {

    const arrayBuffer = await file.arrayBuffer();

    const [htmlResult, rawTextResult] = await Promise.all([
        mammoth.convertToHtml({ arrayBuffer }, {
            styleMap: [
                "p[style-name='Heading 1'] => h1:fresh",
                "p[style-name='Heading 2'] => h2:fresh",
                "p[style-name='Heading 3'] => h3:fresh",
                "p[style-name='Heading 4'] => h4:fresh",
                "p[style-name='Heading 5'] => h5:fresh",
                "p[style-name='Heading 6'] => h6:fresh",
                "p[style-name='Title'] => h1:fresh",
                "p[style-name='Subtitle'] => h2:fresh"
            ]
        }),
        mammoth.extractRawText({ arrayBuffer }),
    ]);

    const html = htmlResult.value;
    const rawText = rawTextResult.value;
    const dom = new DOMParser().parseFromString(html, 'text/html');

    // Extract sections
    const seen = new Set<string>();
    const flatSections: Array<{ title: string; level: number }> = [];

    const elements = Array.from(dom.querySelectorAll('h1,h2,h3,h4,h5,h6,strong,b,u'));
    let lastLevel = 0;
    let lastElementIndex = -1;

    // Get all body text nodes to check for intervening content
    const allNodes = Array.from(dom.body.querySelectorAll('*'));

    elements.forEach((el, idx) => {
        const title = el.textContent?.trim() || '';
        const key = title.toLowerCase();

        if (!title || title.length < 3 || title.length > 200 || seen.has(key)) return;

        // Skip if it looks like metadata (e.g. "Name: ...")
        if (/^(name|reg|roll|id|date|course|subject|institution|faculty|dept)\s*[:\-]/i.test(title)) return;

        // Skip if it looks like a sentence (ends with period and has several words)
        if (title.endsWith('.') && title.split(' ').length > 4) return;

        let level = 1;
        const tagName = el.tagName.toLowerCase();

        if (tagName.startsWith('h')) {
            level = parseInt(tagName[1], 10);
            // Subsection patterns ALWAYS force H2, even for explicit h-tags
            if (isSubsectionPattern(title)) level = 2;
            else if (isMajorSectionPattern(title)) level = 1;
        } else {
            const parent = el.parentElement;
            const parentText = parent?.textContent?.trim() || '';
            // If the parent has a lot more text than this bold/underline element, it's just highlighting in a para
            if (parentText.length > title.length + 15) return;

            // Priority: Subsection Pattern (H2) > Major Pattern (H1) > Default
            if (isSubsectionPattern(title)) {
                level = 2;
            } else if (isMajorSectionPattern(title)) {
                level = 1;
            } else if (title.length > 70) {
                // Very long headings without patterns are likely subsections or detailed titles
                level = 2;
            } else {
                level = 1;
            }

            // Underlined short text is almost always a major section
            if (tagName === 'u' && title.length < 40) level = 1;
            
            if (/^[a-z]/.test(title)) return;
        }

        if (level > 0) {
            // Check if there's significant text between this and the last heading
            const elIdxInDom = allNodes.indexOf(el);
            let hasInterveningBodyText = false;
            
            if (lastElementIndex !== -1 && elIdxInDom - lastElementIndex > 2) {
                // Check if there are non-empty text blocks between them
                for (let i = lastElementIndex + 1; i < elIdxInDom; i++) {
                    const nodeText = allNodes[i].textContent?.trim();
                    if (nodeText && nodeText.length > 20 && !elements.includes(allNodes[i] as any)) {
                        hasInterveningBodyText = true;
                        break;
                    }
                }
            }

            // SMART DOWNGRADE: If this is H1 but follows another H1 immediately WITHOUT body text, treat as H2
            // ONLY if it's not at the very beginning (first 5 elements) where sub-titles are common
            // CRITICAL: NEVER downgrade major sections like 'Conclusion', 'Introduction', etc.
            if (level === 1 && lastLevel === 1 && !hasInterveningBodyText && flatSections.length > 2 && !isMajorSectionPattern(title)) {
                level = 2;
            }
            
            seen.add(key);
            flatSections.push({ title, level });
            lastLevel = level;
            lastElementIndex = elIdxInDom;
        }
    });

    // Extract style information from first paragraph
    let bodyFontSize = null;
    let fontFamily = null;
    let alignment = null;
    let lineSpacing = null;

    const firstPara = dom.querySelector('p');
    if (firstPara) {
        const style = window.getComputedStyle(firstPara);
        bodyFontSize = parseFloat(style.fontSize) || 12;
        fontFamily = style.fontFamily?.split(',')[0]?.replace(/['"]/g, '') || null;
        alignment = style.textAlign || null;
        lineSpacing = parseFloat(style.lineHeight) || null;
    }

    const headingFontSize = dom.querySelector('h1')
        ? parseFloat(window.getComputedStyle(dom.querySelector('h1')!).fontSize) || 16
        : null;

    const sections = buildHierarchy(flatSections);
    const title = extractTitle(rawText, flatSections);

    return {
        title,
        sections,
        metadata: parseMetadata(rawText),
        style: {
            font_family: fontFamily,
            heading_font_size: headingFontSize,
            body_font_size: bodyFontSize,
            alignment,
            line_spacing: lineSpacing,
            margins: {
                top: null,
                bottom: null,
                left: null,
                right: null,
            },
        },
        rawText: rawText.slice(0, 20000),
    };
}

// ══════════════════════════════════════════════════════════════════════════════
// PDF EXTRACTION - IMPROVED (NO TIMEOUT, BETTER HEADING DETECTION)
// ══════════════════════════════════════════════════════════════════════════════

export async function extractPdf(file: File, progressCallback?: (status: string) => void): Promise<TemplateData> {
    progressCallback?.('Loading PDF document...');

    const arrayBuffer = await file.arrayBuffer();
    
    // Safety check for worker loading
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.5.207/build/pdf.worker.min.mjs`;
    }

    const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch: false,
        isEvalSupported: false,
        disableFontFace: false,
    });

    let pdf: pdfjsLib.PDFDocumentProxy;
    try {
        // Initial handshake safety timeout
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('PDF initialization timed out (15s). Ensure you have an internet connection.')), 15000)
        );
        
        pdf = await Promise.race([loadingTask.promise, timeoutPromise]) as pdfjsLib.PDFDocumentProxy;
    } catch (error) {
        console.warn('First worker failed, trying fallback...', error);
        // Try next fallback if first one fails
        try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.5.207/pdf.worker.min.mjs`;
            const retryTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
            pdf = await retryTask.promise;
        } catch (retryError) {
            throw new Error(`Failed to load PDF library. Please try a Word (.docx) file instead. Details: ${retryError}`);
        }
    }


    const allItems: TextItem[] = [];
    let rawText = '';
    const maxPages = Math.min(pdf.numPages, 30); // Process up to 30 pages

    // Extract text items from all pages
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        progressCallback?.(`Analyzing page ${pageNum} of ${maxPages}...`);

        try {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent({
                includeMarkedContent: false,
                disableNormalization: false,
            } as any);

            for (const item of textContent.items as any[]) {
                if (!('str' in item) || !item.str?.trim()) continue;

                const str = item.str.trim();
                const height = Math.abs(item.height || item.transform?.[0] || 0);
                const width = Math.abs(item.width || 0);
                const fontName = item.fontName || '';
                const bold = /bold|black|heavy|semibold/i.test(fontName);
                const x = item.transform?.[4] || 0;
                const y = item.transform?.[5] || 0;

                allItems.push({ str, height, width, fontName, bold, x, y });
                rawText += str + ' ';
            }

            // Clean up page to free memory
            page.cleanup();
        } catch (error) {
            console.warn(`Failed to extract page ${pageNum}:`, error);
            continue;
        }

        if (rawText.length > 50000) break; // Limit total text size
    }

    progressCallback?.('Analyzing document structure...');

    // Calculate font size statistics
    const heights = allItems
        .map(i => i.height)
        .filter(h => h > 0)
        .sort((a, b) => a - b);

    if (heights.length === 0) {
        throw new Error('No text found in PDF');
    }

    // Calculate percentiles for better threshold detection
    const median = heights[Math.floor(heights.length * 0.5)];
    const p75 = heights[Math.floor(heights.length * 0.75)];
    const p90 = heights[Math.floor(heights.length * 0.90)];

    const bodyFontSize = median;

    // Adaptive thresholds based on document font distribution
    const h1Threshold = Math.min(median * 1.3, p90);
    const h2Threshold = Math.min(median * 1.1, p75);
    const h3Threshold = median * 1.05;

    // Group items into logical lines
    const lines: TextItem[] = [];
    let currentLine: TextItem | null = null;

    for (const item of allItems) {
        if (!currentLine) {
            currentLine = { ...item };
            continue;
        }

        const sameHeight = Math.abs(currentLine.height - item.height) < 0.5;
        const sameLine = Math.abs(currentLine.y - item.y) < 3;
        const canMerge = currentLine.str.length + item.str.length < 250;

        if (sameHeight && sameLine && canMerge) {
            currentLine.str += (currentLine.str.endsWith('-') ? '' : ' ') + item.str;
            currentLine.width += item.width;
            currentLine.bold = currentLine.bold || item.bold;
        } else {
            lines.push(currentLine);
            currentLine = { ...item };
        }
    }
    if (currentLine) lines.push(currentLine);

    // Extract headings with improved detection
    const seen = new Set<string>();
    const flatSections: Array<{ title: string; level: number }> = [];
    const fonts = new Set<string>();

    let lastHeadingIdx = -1;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const title = line.str.trim();
        const key = title.toLowerCase();

        if (!title || title.length < 3 || title.length > 200 || seen.has(key)) continue;

        const wordCount = title.split(/\s+/).length;

        // Skip body sentences or lowercase starts
        if (title.endsWith('.') && wordCount > 5) continue;
        if (/^[a-z]/.test(title)) continue; 
        if (wordCount > 10) continue; // Headings are rarely longer than 10 words

        // Skip metadata labels
        if (/^(name|reg|roll|id|date|course|subject|institution|faculty|dept|colleg|univers|campus|class|sem)\s*[:\-]/i.test(title)) continue;

        fonts.add(line.fontName);

        // Multi-factor heading detection
        const largeSize = line.height >= h1Threshold;
        const mediumSize = line.height >= h2Threshold;
        const slightlyLarge = line.height >= h3Threshold;
        const isBold = line.bold;
        const isUpperCase = title === title.toUpperCase() && /[A-Z]/.test(title);
        const hasNumberPrefix = /^(\d+(\.\d+)*)\s+/.test(title);
        const isStep = isSubsectionPattern(title);
        const isMajor = isMajorSectionPattern(title);
        const isVeryShort = title.length < 50; 
        const isShort = title.length < 80;

        let level = 0;

        // H2 Priority for steps/implementation (Always beats other detections)
        if (isStep && wordCount < 12) {
            level = 2;
        }
        // H1 Priority for major sections
        else if (isMajor && wordCount < 8) {
            level = 1;
        }
        // H1: Very large OR large+bold OR uppercase+large
        else if (largeSize || (mediumSize && isBold) || (isUpperCase && slightlyLarge)) {
            if (wordCount < 10 && !title.endsWith('.')) level = 1;
        }
        
        // H2 fallback for medium formatting
        if (level === 0) {
            // Must be bold, very short, and not a sentence
            if ((isBold && isVeryShort && !title.endsWith('.')) || (isBold && hasNumberPrefix)) {
                level = 2;
            }
            // H3: Slightly large + bold OR numbered
            else if ((slightlyLarge && isBold && isVeryShort) || (hasNumberPrefix && isVeryShort)) {
                level = 3;
            }
        }

        if (level > 0) {
            // SMART DOWNGRADE: If detected as H1 but follows another H1 very closely
            // ONLY if there is no significant text between them AND we're not at the very start
            let hasInterveningBodyText = false;
            if (lastHeadingIdx !== -1 && i - lastHeadingIdx > 1) {
                for (let k = lastHeadingIdx + 1; k < i; k++) {
                    if (lines[k].str.trim().length > 30) {
                        hasInterveningBodyText = true;
                        break;
                    }
                }
            }

            if (level === 1 && flatSections.length > 0 && flatSections[flatSections.length - 1].level === 1) {
                // Be more permissive at the beginning for titles and experiment names
                const atStart = flatSections.length < 3;
                if (!hasInterveningBodyText && lastHeadingIdx !== -1 && (i - lastHeadingIdx) <= (atStart ? 5 : 4)) {
                    // NEVER downgrade major sections
                    if (!atStart && !isMajorSectionPattern(title)) {
                        level = 2;
                    }
                }
            }

            seen.add(key);
            flatSections.push({ title, level });
            lastHeadingIdx = i;
        }
    }

    progressCallback?.('Building document structure...');

    // Extract style information
    const headingFontSize = flatSections.length > 0
        ? lines.find(l => flatSections[0].title === l.str.trim())?.height || null
        : null;

    const mostCommonFont = [...fonts].sort((a, b) =>
        lines.filter(l => l.fontName === b).length - lines.filter(l => l.fontName === a).length
    )[0] || null;

    const sections = buildHierarchy(flatSections);
    const title = extractTitle(rawText, flatSections);

    return {
        title,
        sections,
        metadata: parseMetadata(rawText),
        style: {
            font_family: mostCommonFont?.replace(/[+\-_]/g, ' ') || null,
            heading_font_size: headingFontSize,
            body_font_size: bodyFontSize,
            alignment: null,
            line_spacing: null,
            margins: {
                top: null,
                bottom: null,
                left: null,
                right: null,
            },
        },
        rawText: rawText.slice(0, 20000),
    };
}

// ══════════════════════════════════════════════════════════════════════════════
// TXT EXTRACTION - IMPROVED
// ══════════════════════════════════════════════════════════════════════════════

export async function extractTxt(file: File): Promise<TemplateData> {
    const rawText = (await file.text()).slice(0, 30000);
    const lines = rawText.split(/\r?\n/);

    const seen = new Set<string>();
    const flatSections: Array<{ title: string; level: number }> = [];

    const NUMBERED_PATTERN = /^(\d+(\.\d+)*)\s+(.+)/;
    const HEADER_PATTERN = /^((\d+\.)+\s+|[IVX]+\.\s+)?[A-Z][A-Za-z\s\-:&]{2,120}$/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.length < 3 || line.length > 150) continue;

        const prevBlank = i === 0 || !lines[i - 1].trim();
        const nextBlank = i === lines.length - 1 || !lines[i + 1].trim();
        const isAllCaps = line === line.toUpperCase() && /[A-Z]/.test(line);
        const numbered = NUMBERED_PATTERN.test(line);
        const matchesPattern = HEADER_PATTERN.test(line);

        // Skip sentences
        if (line.endsWith('.') && line.split(' ').length > 8) continue;

        // Scoring system
        let score = 0;
        if (prevBlank) score += 2;
        if (nextBlank) score += 2;
        if (isAllCaps) score += 3;
        if (numbered) score += 2;
        if (matchesPattern) score += 1;

        if (score >= 3 && !seen.has(line.toLowerCase())) {
            seen.add(line.toLowerCase());

            // Determine level
            let level = 1;
            if (numbered) {
                const match = line.match(NUMBERED_PATTERN);
                const numParts = match?.[1].split('.').length || 1;
                level = Math.min(numParts, 3);
            } else if (!isAllCaps && matchesPattern) {
                level = 2;
            }

            flatSections.push({ title: line, level });
        }
    }

    const sections = buildHierarchy(flatSections);
    const title = extractTitle(rawText, flatSections);

    return {
        title,
        sections,
        metadata: parseMetadata(rawText),
        style: {
            font_family: null,
            heading_font_size: null,
            body_font_size: null,
            alignment: null,
            line_spacing: null,
            margins: {
                top: null,
                bottom: null,
                left: null,
                right: null,
            },
        },
        rawText,
    };
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ══════════════════════════════════════════════════════════════════════════════

export async function extractTemplateData(
    file: File,
    progressCallback?: (status: string) => void
): Promise<TemplateData> {
    const ext = file.name.split('.').pop()?.toLowerCase();

    try {
        if (ext === 'docx') {
            progressCallback?.('Reading Word document...');
            return await extractDocx(file);
        } else if (ext === 'pdf') {
            return await extractPdf(file, progressCallback);
        } else {
            progressCallback?.('Analyzing text file...');
            return await extractTxt(file);
        }
    } catch (error) {
        console.error('Extraction error:', error);
        throw new Error(`Failed to extract template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// JSON OUTPUT FORMATTER
// ══════════════════════════════════════════════════════════════════════════════

export function formatAsStrictJSON(data: TemplateData): string {
    return JSON.stringify(data, null, 2);
}
