import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

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

    return {
        student_name: extract(/(?:student\s*name|name|submitted\s*by)\s*[:\-]\s*([^\n\r]{2,60})/i),
        registration_number: extract(/(?:reg(?:istration)?\.?\s*(?:no|number|#)|roll\s*no\.?|student\s*id|id\s*no\.?)\s*[:\-]\s*([^\n\r]{2,40})/i),
        course: extract(/(?:course|programme?|subject|module)\s*[:\-]\s*([^\n\r]{2,80})/i),
        institution: extract(/(?:institution|university|college|school)\s*[:\-]\s*([^\n\r]{2,120})/i),
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

export async function extractDocx(file: File): Promise<TemplateData> {
    const arrayBuffer = await file.arrayBuffer();

    const [htmlResult, rawTextResult, styleResult] = await Promise.all([
        mammoth.convertToHtml({ arrayBuffer }),
        mammoth.extractRawText({ arrayBuffer }),
        mammoth.convertToHtml(
            { arrayBuffer },
            {
                styleMap: [
                    "p[style-name='Heading 1'] => h1:fresh",
                    "p[style-name='Heading 2'] => h2:fresh",
                    "p[style-name='Heading 3'] => h3:fresh",
                    "p[style-name='Heading 4'] => h4:fresh",
                    "p[style-name='Heading 5'] => h5:fresh",
                    "p[style-name='Heading 6'] => h6:fresh",
                ]
            }
        ),
    ]);

    const html = htmlResult.value;
    const rawText = rawTextResult.value;
    const dom = new DOMParser().parseFromString(html, 'text/html');

    // Extract sections
    const seen = new Set<string>();
    const flatSections: Array<{ title: string; level: number }> = [];

    dom.querySelectorAll('h1,h2,h3,h4,h5,h6,strong,b').forEach(el => {
        const title = el.textContent?.trim() || '';
        const key = title.toLowerCase();

        if (!title || title.length < 3 || title.length > 200 || seen.has(key)) return;

        // Skip if it looks like a sentence (ends with period and has many words)
        if (title.endsWith('.') && title.split(' ').length > 10) return;

        let level = 1;
        const tagName = el.tagName.toLowerCase();

        if (tagName.startsWith('h')) {
            level = parseInt(tagName[1], 10);
        } else if (tagName === 'strong' || tagName === 'b') {
            // Bold text - check context for level
            const parent = el.parentElement;
            if (parent?.tagName.toLowerCase().startsWith('h')) {
                level = parseInt(parent.tagName[1], 10);
            } else {
                // Determine level by content length and position
                level = title.length > 50 ? 2 : 1;
            }
        }

        seen.add(key);
        flatSections.push({ title, level });
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
    const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch: false,
        isEvalSupported: false,
        disableFontFace: true,
        useSystemFonts: true,
    });

    let pdf: pdfjsLib.PDFDocumentProxy;
    try {
        pdf = await loadingTask.promise;
    } catch (error) {
        throw new Error(`Failed to load PDF: ${error}`);
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
    const max = heights[heights.length - 1];

    const bodyFontSize = median;

    // Adaptive thresholds based on document font distribution
    const h1Threshold = Math.min(median * 1.4, p90);
    const h2Threshold = Math.min(median * 1.15, p75);
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

    for (const line of lines) {
        const title = line.str.trim();
        const key = title.toLowerCase();

        if (!title || title.length < 3 || title.length > 200 || seen.has(key)) continue;

        // Skip body sentences
        if (title.endsWith('.') && title.split(' ').length > 10) continue;
        if (title.match(/^[a-z]/)) continue; // Starts with lowercase

        fonts.add(line.fontName);

        // Multi-factor heading detection
        const largeSize = line.height >= h1Threshold;
        const mediumSize = line.height >= h2Threshold;
        const slightlyLarge = line.height >= h3Threshold;
        const isBold = line.bold;
        const isUpperCase = title === title.toUpperCase() && /[A-Z]/.test(title);
        const hasNumberPrefix = /^(\d+(\.\d+)*)\s+/.test(title);
        const isShort = title.length < 80;

        let level = 0;

        // H1: Very large OR large+bold OR uppercase+large
        if (largeSize || (mediumSize && isBold) || (isUpperCase && slightlyLarge)) {
            level = 1;
        }
        // H2: Medium size OR bold+numbered OR bold+short
        else if (mediumSize || (isBold && hasNumberPrefix) || (isBold && isShort)) {
            level = 2;
        }
        // H3: Slightly large + bold OR numbered
        else if ((slightlyLarge && isBold) || (hasNumberPrefix && isShort)) {
            level = 3;
        }

        if (level > 0) {
            seen.add(key);
            flatSections.push({ title, level });
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