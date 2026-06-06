import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Sparkles, LayoutDashboard, User as UserIcon, BookOpen,
    SearchCode, RefreshCw, Upload, Plus, X, ArrowRight, ArrowLeft,
    Code, Check, FileText, Bookmark, Save
} from 'lucide-react';

import toast from 'react-hot-toast';
import clsx from 'clsx';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { useAuth } from '../../auth/context/AuthContext';
import { createDocument, saveAsTemplate } from '../../../shared/services/db';
import { performTask, AcademicTone } from '../../../shared/services/ai';
import { AppLayout as Layout } from '../../../app/layout/AppLayout';


import Aurora from '../../editor/components/Aurora';
import GeneratingLoader from '../../../shared/components/GeneratingLoader';
import { extractTemplateData, Section as ExtractedSection, TemplateData, formatAsStrictJSON } from '../../../shared/utils/templateExtractor';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Section {
    id: string;
    title: string;
    level: number;
    subsections?: Section[];
}

// ── Utilities ─────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).substr(2, 9);

// Convert extracted sections to internal format with unique IDs
function convertExtractedSections(sections: ExtractedSection[]): Section[] {
    return sections.map(s => ({
        id: uid(),
        title: s.title,
        level: s.level,
        subsections: s.subsections ? convertExtractedSections(s.subsections) : undefined,
    }));
}

// Flatten hierarchical sections for editing UI
function flattenSections(sections: Section[]): Array<Section & { depth: number }> {
    const result: Array<Section & { depth: number }> = [];

    const traverse = (secs: Section[], depth = 0) => {
        secs.forEach(s => {
            result.push({ ...s, depth });
            if (s.subsections && s.subsections.length > 0) {
                traverse(s.subsections, depth + 1);
            }
        });
    };

    traverse(sections);
    return result;
}

// ── Built-in templates ────────────────────────────────────────────────────────

const BUILT_IN_TEMPLATES = [
    {
        id: 'lab-report',
        name: 'Lab Report',
        icon: SearchCode,
        sections: [
            { title: 'Abstract', level: 1 },
            { title: 'Introduction', level: 1 },
            { title: 'Methodology', level: 1 },
            { title: 'Results', level: 1 },
            { title: 'Discussion', level: 1 },
            { title: 'Conclusion', level: 1 },
            { title: 'References', level: 1 },
        ],
    },
    {
        id: 'case-study',
        name: 'Case Study',
        icon: BookOpen,
        sections: [
            { title: 'Executive Summary', level: 1 },
            { title: 'Introduction', level: 1 },
            { title: 'Case Overview', level: 1 },
            { title: 'Analysis', level: 1 },
            { title: 'Recommendations', level: 1 },
            { title: 'Conclusion', level: 1 },
        ],
    },
    {
        id: 'research-paper',
        name: 'Research Paper',
        icon: FileText,
        sections: [
            { title: 'Abstract', level: 1 },
            { title: 'Introduction', level: 1 },
            { title: 'Literature Review', level: 1 },
            { title: 'Research Methodology', level: 1 },
            { title: 'Data Analysis & Findings', level: 1 },
            { title: 'Discussion', level: 1 },
            { title: 'Conclusion', level: 1 },
            { title: 'References', level: 1 },
        ],
    },
];

// ── Component ─────────────────────────────────────────────────────────────────

const GeneratePage = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const fileRef = useRef<HTMLInputElement>(null);

    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const [studentName, setStudentName] = useState('');
    const [regNo, setRegNo] = useState('');
    const [course, setCourse] = useState('');
    const [institution, setInstitution] = useState('');
    const [tone, setTone] = useState<AcademicTone>('formal');

    const [sections, setSections] = useState<Section[]>([]);
    const [templateText, setTemplateText] = useState('');
    const [templateFile, setTemplateFile] = useState<File | null>(null);
    const [extractedData, setExtractedData] = useState<TemplateData | null>(null);
    const [extractionDetails, setExtractionDetails] = useState<{ raw?: any, ai?: any }>({});

    const [parsingFile, setParsingFile] = useState(false);
    const [parseStatus, setParseStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const [showTemplateInput, setShowTemplateInput] = useState(false);
    const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
    const [showPasteInput, setShowPasteInput] = useState(false);
    const [pastedHeadings, setPastedHeadings] = useState('');
    const [activeStep, setActiveStep] = useState(0);

    // Apply template from router navigation state
    useEffect(() => {
        if (!location.state?.template) return;
        const t = location.state.template;
        setSections(
            (t.sections ?? []).map((s: any) => ({
                id: uid(),
                title: typeof s === 'string' ? s : s.title,
                level: s.level ?? 1,
            }))
        );
        setTopic(t.topic || '');
        setDescription(t.description || '');
        setTone(t.tone || 'formal');

        // Also restore metadata if available
        if (t.metadataFields) {
            if (t.metadataFields.student_name) setStudentName(t.metadataFields.student_name);
            if (t.metadataFields.registration_number) setRegNo(t.metadataFields.registration_number);
            if (t.metadataFields.course) setCourse(t.metadataFields.course);
            if (t.metadataFields.institution) setInstitution(t.metadataFields.institution);
        }

        setTemplateText(`Follow the structure of ${t.title || t.name}.`);
        toast.success(`${t.title || t.name} applied!`);
    }, [location.state]);

    // ── Reset ──────────────────────────────────────────────────────────────────

    const handleReset = () => {
        setSections([]);
        setTemplateFile(null);
        setTemplateText('');
        setExtractedData(null);
        setTopic('');
        setDescription('');
        setTone('formal');
        setStudentName('');
        setRegNo('');
        setCourse('');
        setInstitution('');
        setActiveStep(0);
        setParseStatus('');
        setPastedHeadings('');
        setShowPasteInput(false);
        if (fileRef.current) fileRef.current.value = '';
        toast.success('Reset complete');
    };

    // ── Built-in template ──────────────────────────────────────────────────────

    const handleSelectTemplate = (t: typeof BUILT_IN_TEMPLATES[0]) => {
        setSections(t.sections.map(s => ({ id: uid(), ...s })));
        setTemplateText(`Follow the structure of a ${t.name}.`);
        setShowTemplateLibrary(false);
        toast.success(`${t.name} applied!`);
    };

    // ── File upload — improved extraction ─────────────────────────────────────

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setTemplateFile(file);
        setParsingFile(true);
        setSections([]);
        setExtractedData(null);

        try {
            const data = await extractTemplateData(file, (status) => {
                setParseStatus(status);
            });

            setExtractedData(data);

            // Auto-fill metadata (never overwrite user input)
            const m = data.metadata;
            if (m.student_name && !studentName) setStudentName(m.student_name);
            if (m.registration_number && !regNo) setRegNo(m.registration_number);
            if (m.course && !course) setCourse(m.course);
            if (m.institution && !institution) setInstitution(m.institution);
            if (data.title && !topic && data.title !== 'Untitled Document') {
                setTopic(data.title);
            }

            // Set raw text for AI style matching
            setTemplateText(data.rawText);

            // 1. Initial Local Extraction Success (Immediate feedback for user)
            if (data.sections.length > 0) {
                setSections(convertExtractedSections(data.sections));
                setExtractionDetails(prev => ({ ...prev, raw: data }));
            }

            // 2. AI Refinement (Universal Logic)
            setParseStatus('Refining blueprint with Universal AI...');
            try {
                const aiResult = await performTask({
                    task_type: 'parse_structure',
                    content: data.rawText.slice(0, 15000)
                });

                const aiData = JSON.parse(aiResult);

                if (aiData && aiData.sections && aiData.sections.length > 0) {
                    setSections(convertExtractedSections(aiData.sections));
                    setExtractionDetails(prev => ({ ...prev, ai: aiData }));
                    if (aiData.title) setTopic(aiData.title);

                    // Update metadata if AI found better values
                    const m = aiData.metadata;
                    if (m?.student_name) setStudentName(m.student_name);
                    if (m?.registration_number) setRegNo(m.registration_number);
                    if (m?.course) setCourse(m.course);
                    if (m?.institution) setInstitution(m.institution);

                    toast.success('Structure refined with Universal AI');
                } else if (data.sections.length > 0) {
                    toast.success('Local extraction successful');
                } else {
                    throw new Error('AI returned no sections');
                }
            } catch (aiErr) {
                console.error('AI refinement failed:', aiErr);
                if (data.sections.length === 0) {
                    // Fallback to defaults only if everything failed
                    setSections([
                        { id: uid(), title: 'Introduction', level: 1 },
                        { id: uid(), title: 'Main Body', level: 1 },
                        { id: uid(), title: 'Conclusion', level: 1 },
                        { id: uid(), title: 'References', level: 1 },
                    ]);
                    toast('Using basic structure fallback.', { icon: '⚠️' });
                }
            }

            // Show extraction summary
            if (data.style.body_font_size || data.style.font_family) {
                const styleInfo = [];
                if (data.style.font_family) styleInfo.push(data.style.font_family);
                if (data.style.body_font_size) styleInfo.push(`${Math.round(data.style.body_font_size)}pt`);

                console.log('Extracted style:', styleInfo.join(', '));
            }

        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Failed to parse file. Try a different format.');
            setTemplateFile(null);
            setExtractedData(null);
            if (fileRef.current) fileRef.current.value = '';
        } finally {
            setParsingFile(false);
            setParseStatus('');
        }
    };

    const handleApplyPastedHeadings = () => {
        if (!pastedHeadings.trim()) {
            toast.error('Please paste some headings first');
            return;
        }
        const lines = pastedHeadings.split('\n').filter(line => line.trim());
        const newSections = lines.map(line => ({
            id: uid(),
            title: line.trim(),
            level: 1,
        }));
        setSections(prev => [...prev, ...newSections]);
        setPastedHeadings('');
        setShowPasteInput(false);
        toast.success(`${newSections.length} headings added!`);
    };

    // ── Section CRUD (works with hierarchical structure) ──────────────────────

    const addSection = (level = 1) => {
        setSections(prev => [...prev, { id: uid(), title: 'New Section', level }]);
    };

    const removeSection = (id: string) => {
        const removeFromTree = (secs: Section[]): Section[] => {
            return secs
                .filter(s => s.id !== id)
                .map(s => ({
                    ...s,
                    subsections: s.subsections ? removeFromTree(s.subsections) : undefined,
                }));
        };
        setSections(prev => removeFromTree(prev));
    };

    const editSection = (id: string, title: string) => {
        const updateInTree = (secs: Section[]): Section[] => {
            return secs.map(s => {
                if (s.id === id) return { ...s, title };
                if (s.subsections) return { ...s, subsections: updateInTree(s.subsections) };
                return s;
            });
        };
        setSections(prev => updateInTree(prev));
    };

    const cycleLevel = (id: string) => {
        const updateInTree = (secs: Section[]): Section[] => {
            return secs.map(s => {
                if (s.id === id) {
                    const newLevel = s.level === 1 ? 2 : s.level === 2 ? 3 : 1;
                    return { ...s, level: newLevel };
                }
                if (s.subsections) return { ...s, subsections: updateInTree(s.subsections) };
                return s;
            });
        };
        setSections(prev => updateInTree(prev));
    };

    const handleExportJSON = () => {
        if (!extractedData) return;
        const json = formatAsStrictJSON(extractedData);
        const blob = new Blob([json], { type: 'application/json' });
        saveAs(blob, `${topic || 'template'}-structure.json`);
        toast.success('JSON structure exported!');
    };

    const handleSaveAsTemplate = async () => {
        if (!user) {
            toast.error('Please login to save templates');
            return;
        }

        if (flatSections.length === 0) {
            toast.error('No structure to save');
            return;
        }

        try {
            const name = prompt('Enter a name for this blueprint:', topic || 'Custom Lab Report');
            if (!name) return;

            const res = await saveAsTemplate(user.uid, {
                name,
                sections: flatSections.map(s => ({ title: s.title, level: s.level })),
                metadataFields: extractedData?.metadata || {},
                style: extractedData?.style || {},
                topic: topic || '',
                extractionDetails: extractionDetails
            });

            if (res && (res.id || res.success)) {
                toast.success('Blueprint saved to your Archives');
            } else {
                throw new Error('No success response from server');
            }

        } catch (error) {
            console.error('Save template error:', error);
            toast.error('Failed to save blueprint');
        }
    };

    // ── Generate ───────────────────────────────────────────────────────────────

    const handleGenerate = async (e: React.FormEvent, downloadDocx = false) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            // Flatten sections for AI
            const flatSections = flattenSections(sections);
            const sectionsForAI = flatSections.map(s => ({
                title: s.title,
                level: s.level,
            }));

            const result = await performTask({
                task_type: 'generate',
                topic,
                description,
                tone,
                template: templateText || undefined,
                sections: sectionsForAI.length > 0 ? sectionsForAI : undefined,
                studentName,
                regNo,
                course,
                institution,
            });

            const newDoc = await createDocument(
                user.uid,
                topic || 'Untitled',
                result,
                topic,
                description,
                tone
            );

            if (!newDoc) throw new Error('Failed to save document');

            toast.success('Assignment generated!');

            if (downloadDocx) {
                const plain = (() => {
                    const d = document.createElement('div');
                    d.innerHTML = result;
                    return d.textContent || '';
                })();

                const doc = new Document({
                    sections: [
                        {
                            properties: {},
                            children: [
                                new Paragraph({
                                    text: topic || 'Untitled',
                                    heading: HeadingLevel.HEADING_1,
                                }),
                                ...flatSections.map(s =>
                                    new Paragraph({
                                        text: s.title,
                                        heading:
                                            s.level === 1
                                                ? HeadingLevel.HEADING_2
                                                : s.level === 2
                                                    ? HeadingLevel.HEADING_3
                                                    : HeadingLevel.HEADING_4,
                                    })
                                ),
                                new Paragraph({ text: plain }),
                            ],
                        },
                    ],
                });

                saveAs(await Packer.toBlob(doc), `${topic || 'Assignment'}.docx`);
                toast.success('DOCX downloaded!');
            }

            navigate(`/editor/${newDoc.id}`);
        } catch (err: any) {
            const msg = err?.message && typeof err.message === 'string' ? err.message : 'Generation failed — please try again';
            toast.error(msg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ── Step config ────────────────────────────────────────────────────────────

    const steps = [
        { title: 'Structure', icon: LayoutDashboard },
        { title: 'Core Concept', icon: Sparkles },
        { title: 'Personalize', icon: UserIcon },
    ];

    const LEVEL_BADGE: Record<number, string> = {
        1: 'bg-stone-900 text-white',
        2: 'bg-stone-200 text-stone-700',
        3: 'bg-stone-100 text-stone-400',
    };

    const LEVEL_INDENT: Record<number, string> = {
        0: 'ml-0',
        1: 'ml-6',
        2: 'ml-12',
        3: 'ml-18',
    };

    // Flatten for rendering
    const flatSections = flattenSections(sections);

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <Layout>
            <AnimatePresence>{loading && <GeneratingLoader topic={topic} />}</AnimatePresence>

            <div className="min-h-screen bg-[var(--bg-app)] relative overflow-hidden">
                {/* Immersive Background */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                    <Aurora
                        colorStops={['#F5F5F0', '#E4E3E0', '#F5F5F0']}
                        speed={0.2}
                        amplitude={0.8}
                    />
                </div>

                <div className="relative z-10 p-6 md:p-12 max-w-6xl mx-auto pt-6 md:pt-12">
                    {/* Header */}
                    <header className="mb-10 text-center space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--text-main)] text-[var(--bg-card)] text-[10px] font-black uppercase tracking-[0.25em] shadow-lg shadow-black/10"
                        >
                            <Zap size={12} className="text-amber-400 fill-amber-400" /> AI-Powered Synthesis
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-6xl font-bold text-[var(--text-main)] tracking-tight"
                        >
                            Create your <span className="italic font-serif text-amber-600">masterpiece</span>.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-stone-500 text-lg max-w-2xl mx-auto"
                        >
                            Advanced AI extracts structure, formatting, and content from your templates —
                            headings detected by size and bold formatting, with no timeouts.
                        </motion.p>
                    </header>

                    <div className="grid lg:grid-cols-12 gap-12 items-start">
                        {/* Left: progress sidebar */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 border border-[var(--border-main)] shadow-xl shadow-black/5">
                                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-8">
                                    Generation Progress
                                </h3>
                                <div className="space-y-6">
                                    {steps.map((s, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div
                                                className={clsx(
                                                    'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 shadow-sm',
                                                    activeStep === i
                                                        ? 'bg-[var(--text-main)] text-[var(--bg-card)] scale-110 shadow-lg'
                                                        : activeStep > i
                                                            ? 'bg-emerald-500/20 text-emerald-500'
                                                            : 'bg-[var(--bg-app)] text-[var(--text-muted)]/40'
                                                )}
                                            >
                                                {activeStep > i ? <Check size={20} /> : <s.icon size={20} />}
                                            </div>
                                            <div className="flex-1">
                                                <p
                                                    className={clsx(
                                                        'text-sm font-bold transition-colors',
                                                        activeStep === i ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'
                                                    )}
                                                >
                                                    {s.title}
                                                </p>
                                                <div className="h-1.5 bg-[var(--bg-app)] rounded-full mt-2 overflow-hidden border border-[var(--border-main)]/30 shadow-inner">
                                                    <motion.div
                                                        animate={{
                                                            width:
                                                                activeStep === i
                                                                    ? '50%'
                                                                    : activeStep > i
                                                                        ? '100%'
                                                                        : '0%',
                                                        }}
                                                        className="h-full bg-[var(--text-main)] shadow-[0_0_8px_rgba(0,0,0,0.1)]"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-amber-400/10 rounded-[2.5rem] p-8 border border-amber-400/20 shadow-lg shadow-amber-900/5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-900/20">
                                        <Zap size={18} />
                                    </div>
                                    <h4 className="font-bold text-amber-500">Enhanced Extraction</h4>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-sm text-[var(--text-main)] opacity-70 leading-relaxed font-medium">
                                        Upload any template — PDF, DOCX, or TXT. Headings are detected by font size,
                                        bold formatting, and academic structure.
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30">
                                        <Sparkles size={12} className="text-amber-500" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                                            Tip: Upload .DOCX for superior extraction
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Extracted data summary */}
                            {extractedData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-emerald-500/5 rounded-[2.5rem] p-6 border border-emerald-500/20 space-y-3 shadow-lg shadow-emerald-900/5"
                                >
                                    <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                                        Extraction Summary
                                    </h4>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-2">
                                        {extractedData.style.font_family && (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/40">Font Family</span>
                                                <span className="text-[13px] font-bold text-emerald-500 truncate">{extractedData.style.font_family.split(',')[0]}</span>
                                            </div>
                                        )}
                                        {extractedData.style.body_font_size && (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/40">Base Scale</span>
                                                <span className="text-[13px] font-bold text-emerald-500">{Math.round(extractedData.style.body_font_size)}pt</span>
                                            </div>
                                        )}
                                        {extractedData.style.heading_font_size && (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/40">Heading Scale</span>
                                                <span className="text-[13px] font-bold text-emerald-500">{Math.round(extractedData.style.heading_font_size)}pt</span>
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/40">Research Units</span>
                                            <span className="text-[13px] font-bold text-emerald-500">{flatSections.length} Sections</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-emerald-500/10">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Blueprint Synchronized</span>
                                        </div>
                                    </div>
                                </motion.div>

                            )}
                        </div>

                        {/* Right: multi-step form */}
                        <div className="lg:col-span-8">
                            <form onSubmit={handleGenerate} className="space-y-8">
                                <AnimatePresence mode="wait">
                                    {/* ── Step 0: Structure ── */}
                                    {activeStep === 0 && (
                                        <motion.div
                                            key="step0"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="bg-[var(--bg-card)] rounded-[3rem] p-10 md:p-14 border border-[var(--border-main)] shadow-2xl shadow-black/5 space-y-10"
                                        >
                                            <div className="space-y-5">
                                                {/* Toolbar */}
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                                                        Structure & Template
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(sections.length > 0 || templateFile) && (
                                                            <button
                                                                type="button"
                                                                onClick={handleReset}
                                                                className="text-xs font-bold text-red-500 flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-all"
                                                            >
                                                                <RefreshCw size={14} /> Reset
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowTemplateLibrary(v => !v)}
                                                            className="text-xs font-bold text-[var(--text-main)] flex items-center gap-2 px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-full hover:bg-[var(--bg-card)] transition-all"
                                                        >
                                                            <BookOpen size={14} />{' '}
                                                            {showTemplateLibrary ? 'Hide Library' : 'Browse Library'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPasteInput(v => !v)}
                                                            className="text-xs font-bold text-[var(--text-main)] flex items-center gap-2 px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-full hover:bg-[var(--bg-card)] transition-all"
                                                        >
                                                            <Plus size={14} /> Bulk Add
                                                        </button>
                                                        <label className="text-xs font-bold text-[var(--text-main)] flex items-center gap-2 px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-full hover:bg-[var(--bg-card)] transition-all cursor-pointer">
                                                            <Upload size={14} /> Upload Template
                                                            <input
                                                                ref={fileRef}
                                                                type="file"
                                                                className="hidden"
                                                                onChange={handleFileChange}
                                                                accept=".pdf,.docx,.txt"
                                                            />
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Bulk Paste Input */}
                                                {showPasteInput && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="space-y-4 p-6 bg-[var(--bg-app)]/50 rounded-3xl border border-[var(--border-main)] backdrop-blur-sm shadow-inner"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-widest">
                                                                Paste Side Headings (One per line)
                                                            </h4>
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPasteInput(false)}
                                                                className="text-stone-400 hover:text-red-500"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                        <textarea
                                                            rows={5}
                                                            value={pastedHeadings}
                                                            onChange={e => setPastedHeadings(e.target.value)}
                                                            placeholder="Introduction&#10;Literature Review&#10;Methodology..."
                                                            className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl px-6 py-4 text-sm font-medium text-[var(--text-main)] focus:ring-2 focus:ring-[var(--text-main)] transition-all outline-none resize-none placeholder:text-[var(--text-muted)]/30"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleApplyPastedHeadings}
                                                            className="w-full py-3 bg-[var(--text-main)] text-[var(--bg-card)] rounded-xl text-xs font-bold hover:scale-[1.02] transition-all shadow-lg"
                                                        >
                                                            Add These Headings
                                                        </button>
                                                    </motion.div>
                                                )}

                                                {/* Built-in library */}
                                                {showTemplateLibrary && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-[var(--bg-app)]/50 rounded-3xl border border-[var(--border-main)] backdrop-blur-sm shadow-inner"
                                                    >
                                                        {BUILT_IN_TEMPLATES.map(t => (
                                                            <button
                                                                key={t.id}
                                                                type="button"
                                                                onClick={() => handleSelectTemplate(t)}
                                                                className="flex items-start gap-4 p-4 bg-[var(--bg-card)]/50 border border-[var(--border-main)] rounded-2xl hover:border-[var(--text-main)] hover:shadow-lg transition-all text-left group backdrop-blur-sm"
                                                            >
                                                                <div className="w-10 h-10 bg-[var(--bg-app)]/80 rounded-xl flex items-center justify-center text-[var(--text-muted)] group-hover:bg-[var(--text-main)] group-hover:text-[var(--bg-card)] transition-all shrink-0 shadow-sm">
                                                                    <t.icon size={20} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-[var(--text-main)] text-sm group-hover:text-[var(--text-main)] transition-colors">
                                                                        {t.name}
                                                                    </h4>
                                                                    <p className="text-[10px] text-[var(--text-muted)] mt-1 uppercase tracking-wider font-black">
                                                                        {t.sections.length} Sections
                                                                    </p>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}

                                                {/* Parse progress */}
                                                {parsingFile && (
                                                    <div className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 animate-pulse">
                                                        <RefreshCw size={16} className="text-amber-500 animate-spin" />
                                                        <p className="text-xs font-bold text-amber-500">{parseStatus}</p>
                                                    </div>
                                                )}

                                                {/* File name badge */}
                                                {templateFile && !parsingFile && (
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl w-fit shadow-sm">
                                                        <FileText size={14} className="text-[var(--text-muted)]" />
                                                        <span className="text-xs font-medium text-[var(--text-main)] truncate max-w-[240px]">
                                                            {templateFile.name}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={handleReset}
                                                            className="text-[var(--text-muted)] hover:text-red-500 transition-colors"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Section list with hierarchy */}
                                                <div className="space-y-2">
                                                    {flatSections.map((section, idx) => (
                                                        <motion.div
                                                            key={section.id}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: Math.min(idx * 0.025, 0.25) }}
                                                            className={clsx(
                                                                'flex items-center gap-3',
                                                                LEVEL_INDENT[section.depth] ?? 'ml-0'
                                                            )}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() => cycleLevel(section.id)}
                                                                title="Click to change level (H1 → H2 → H3)"
                                                                className={clsx(
                                                                    'w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black transition-all shrink-0 shadow-sm',
                                                                    LEVEL_BADGE[section.level] ??
                                                                    'bg-[var(--bg-app)] text-[var(--text-muted)]'
                                                                )}
                                                            >
                                                                H{section.level}
                                                            </button>

                                                            <input
                                                                type="text"
                                                                value={section.title}
                                                                onChange={e => editSection(section.id, e.target.value)}
                                                                className="flex-1 bg-[var(--bg-app)] border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[var(--text-main)] text-[var(--text-main)] transition-all outline-none"
                                                            />

                                                            <button
                                                                type="button"
                                                                onClick={() => removeSection(section.id)}
                                                                className="p-2 text-stone-300 hover:text-red-500 transition-colors shrink-0"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </div>

                                                {/* Add section */}
                                                <div className="flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => addSection(1)}
                                                        className="flex-1 py-3 border-2 border-dashed border-[var(--border-main)] rounded-xl text-[var(--text-muted)] text-xs font-bold hover:border-[var(--text-main)] hover:text-[var(--text-main)] transition-all flex items-center justify-center gap-2 px-4"
                                                    >
                                                        <Plus size={14} /> Section (H1)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => addSection(2)}
                                                        className="flex-1 py-3 border-2 border-dashed border-[var(--border-main)] rounded-xl text-[var(--text-muted)] text-xs font-bold hover:border-[var(--text-main)] hover:text-[var(--text-main)] transition-all flex items-center justify-center gap-2 px-4"
                                                    >
                                                        <Plus size={14} /> Subsection (H2)
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-6 border-t border-[var(--border-main)]/50">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        sections.length > 0
                                                            ? setActiveStep(1)
                                                            : toast.error('Add at least one section first')
                                                    }
                                                    className="px-10 py-5 bg-[var(--text-main)] text-[var(--bg-card)] rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-black/20 flex items-center gap-2"
                                                >
                                                    Next Step <ArrowRight size={20} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* ── Step 1: Core Concept ── */}
                                    {activeStep === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="bg-[var(--bg-card)] rounded-[3rem] p-10 md:p-14 border border-[var(--border-main)] shadow-2xl shadow-black/5 space-y-10"
                                        >
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                                                        Assignment Topic
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={topic}
                                                        onChange={e => setTopic(e.target.value)}
                                                        placeholder="e.g. The Impact of Quantum Computing on Modern Cryptography"
                                                        className="w-full bg-[var(--bg-app)] border-2 border-[var(--border-main)] rounded-2xl px-8 py-5 text-lg font-medium focus:border-[var(--text-main)] transition-all outline-none text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 shadow-sm"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                                                            Detailed Context & Core Content
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowTemplateInput(v => !v)}
                                                            className="text-[10px] font-bold text-stone-900 flex items-center gap-2 px-3 py-1 bg-stone-50 rounded-full hover:bg-stone-100 transition-all"
                                                        >
                                                            <Code size={12} />{' '}
                                                            {showTemplateInput ? 'Hide' : 'Direct Content Input'}
                                                        </button>
                                                    </div>

                                                    {showTemplateInput && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="mb-4"
                                                        >
                                                            <div className="p-6 bg-stone-900 rounded-3xl space-y-4">
                                                                <div className="flex items-center gap-2 text-amber-400">
                                                                    <Sparkles size={16} />
                                                                    <h4 className="text-xs font-bold uppercase tracking-widest">
                                                                        AI Guidance / Reference Material
                                                                    </h4>
                                                                </div>
                                                                <textarea
                                                                    rows={6}
                                                                    value={templateText}
                                                                    onChange={e => setTemplateText(e.target.value)}
                                                                    placeholder="Paste core content, structure requirements, or reference text…"
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-white focus:ring-2 focus:ring-amber-400 transition-all outline-none resize-none placeholder:text-stone-600"
                                                                />
                                                                <p className="text-[10px] text-stone-500 italic">
                                                                    * Extracted template content auto-filled above
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    <textarea
                                                        rows={5}
                                                        required
                                                        value={description}
                                                        onChange={e => setDescription(e.target.value)}
                                                        placeholder="Describe key points, required theories, or specific focus areas…"
                                                        className="w-full bg-[var(--bg-app)] border-2 border-[var(--border-main)] rounded-2xl px-8 py-5 text-lg font-medium focus:border-[var(--text-main)] transition-all outline-none resize-none text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 shadow-sm"
                                                    />
                                                </div>

                                                <div className="space-y-4 pt-4">
                                                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                                                        Academic Tone
                                                    </label>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        {(['formal', 'analytical', 'persuasive', 'descriptive'] as AcademicTone[]).map(
                                                            t => (
                                                                <button
                                                                    key={t}
                                                                    type="button"
                                                                    onClick={() => setTone(t)}
                                                                    className={clsx(
                                                                        'py-3 px-4 rounded-xl text-xs font-bold capitalize transition-all border shadow-sm',
                                                                        tone === t
                                                                            ? 'bg-[var(--text-main)] text-[var(--bg-card)] border-[var(--text-main)] shadow-lg'
                                                                            : 'bg-[var(--bg-app)] text-[var(--text-muted)] border-[var(--border-main)] hover:border-[var(--text-main)]'
                                                                    )}
                                                                >
                                                                    {t}
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between">
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveStep(0)}
                                                    className="px-8 py-4 text-[var(--text-muted)] font-black uppercase tracking-widest text-xs hover:text-[var(--text-main)] transition-all flex items-center gap-2"
                                                >
                                                    <ArrowLeft size={20} /> Back
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        topic && description
                                                            ? setActiveStep(2)
                                                            : toast.error('Fill in the topic and description first')
                                                    }
                                                    className="px-10 py-5 bg-stone-900 text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-xl flex items-center gap-2"
                                                >
                                                    Next Step <ArrowRight size={20} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* ── Step 2: Personalize ── */}
                                    {activeStep === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="bg-[var(--bg-card)] rounded-[3rem] p-10 md:p-14 border border-[var(--border-main)] shadow-2xl shadow-black/5 space-y-10"
                                        >
                                            <div className="space-y-8">
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    {(
                                                        [
                                                            {
                                                                label: 'Student Name',
                                                                val: studentName,
                                                                set: setStudentName,
                                                                ph: 'Full Name',
                                                                req: true,
                                                            },
                                                            {
                                                                label: 'Registration Number',
                                                                val: regNo,
                                                                set: setRegNo,
                                                                ph: 'ID / Roll Number',
                                                                req: true,
                                                            },
                                                            {
                                                                label: 'Course / Subject',
                                                                val: course,
                                                                set: setCourse,
                                                                ph: 'e.g. Computer Science 301',
                                                                req: false,
                                                            },
                                                            {
                                                                label: 'Institution',
                                                                val: institution,
                                                                set: setInstitution,
                                                                ph: 'University / College',
                                                                req: false,
                                                            },
                                                        ] as const
                                                    ).map(({ label, val, set, ph, req }) => (
                                                        <div key={label} className="space-y-2">
                                                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                                                                {label}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={val}
                                                                onChange={e => (set as any)(e.target.value)}
                                                                placeholder={ph}
                                                                required={req}
                                                                className="w-full bg-[var(--bg-app)] border-2 border-[var(--border-main)] rounded-2xl px-6 py-4 text-lg font-medium focus:border-[var(--text-main)] transition-all outline-none text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 shadow-sm"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Summary */}
                                                <div className="p-8 bg-stone-900 rounded-[2.5rem] text-white space-y-4">
                                                    <h4 className="text-xl font-bold">Ready for Generation</h4>
                                                    <p className="text-stone-400 text-sm leading-relaxed">
                                                        Generating <span className="text-white font-bold">"{topic}"</span> in{' '}
                                                        <span className="text-white font-bold">{tone}</span> tone with{' '}
                                                        <span className="text-white font-bold">
                                                            {sections.filter(s => s.level === 1).length} section
                                                            {sections.filter(s => s.level === 1).length !== 1 ? 's' : ''}
                                                        </span>
                                                        {flatSections.filter(s => s.level >= 2).length > 0 && (
                                                            <>
                                                                {' '}
                                                                and{' '}
                                                                <span className="text-white font-bold">
                                                                    {flatSections.filter(s => s.level >= 2).length}{' '}
                                                                    subsection
                                                                    {flatSections.filter(s => s.level >= 2).length !== 1
                                                                        ? 's'
                                                                        : ''}
                                                                </span>
                                                            </>
                                                        )}
                                                        .
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {sections
                                                            .filter(s => s.level === 1)
                                                            .slice(0, 7)
                                                            .map(s => (
                                                                <span
                                                                    key={s.id}
                                                                    className="text-[10px] font-bold px-3 py-1 bg-white/10 rounded-full"
                                                                >
                                                                    {s.title}
                                                                </span>
                                                            ))}
                                                        {sections.filter(s => s.level === 1).length > 7 && (
                                                            <span className="text-[10px] font-bold px-3 py-1 bg-white/10 rounded-full">
                                                                +{sections.filter(s => s.level === 1).length - 7} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between">
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveStep(1)}
                                                    className="px-8 py-4 text-[var(--text-muted)] font-black uppercase tracking-widest text-xs hover:text-[var(--text-main)] transition-all flex items-center gap-2"
                                                >
                                                    <ArrowLeft size={20} /> Back
                                                </button>
                                                <div className="flex flex-col sm:flex-row gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={e => handleGenerate(e as any, true)}
                                                        className="px-8 py-4 bg-[var(--bg-card)] border-2 border-[var(--text-main)] text-[var(--text-main)] rounded-2xl font-bold hover:bg-[var(--bg-app)] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                                                    >
                                                        Generate &amp; Download DOCX
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="px-10 py-5 bg-[var(--text-main)] text-[var(--bg-card)] rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-2"
                                                    >
                                                        Generate in Editor <ArrowRight size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default GeneratePage;