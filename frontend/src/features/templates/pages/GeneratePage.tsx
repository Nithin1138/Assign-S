import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Sparkles, LayoutDashboard, User as UserIcon, BookOpen,
    SearchCode, RefreshCw, Upload, Plus, X, ArrowRight, ArrowLeft,
    Code, Check, FileText, Bookmark, Save, Sparkle
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
import DotField from '../../../shared/components/DotField';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Section {
    id: string;
    title: string;
    level: number;
    subsections?: Section[];
}

// ── Utilities ─────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).substr(2, 9);

function convertExtractedSections(sections: ExtractedSection[]): Section[] {
    return sections.map(s => ({
        id: uid(),
        title: s.title,
        level: s.level,
        subsections: s.subsections ? convertExtractedSections(s.subsections) : undefined,
    }));
}

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

    const [isDarkMode, setIsDarkMode] = useState(false);

    // Dynamic Theme Listener
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
                    setIsDarkMode(isDark);
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
        setIsDarkMode(document.documentElement.classList.contains('dark') || document.body.classList.contains('dark'));

        return () => observer.disconnect();
    }, []);

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

    // ── File upload ───────────────────────────────────────────────────────────

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

            const m = data.metadata;
            if (m.student_name && !studentName) setStudentName(m.student_name);
            if (m.registration_number && !regNo) setRegNo(m.registration_number);
            if (m.course && !course) setCourse(m.course);
            if (m.institution && !institution) setInstitution(m.institution);
            if (data.title && !topic && data.title !== 'Untitled Document') {
                setTopic(data.title);
            }

            setTemplateText(data.rawText);

            if (data.sections.length > 0) {
                setSections(convertExtractedSections(data.sections));
                setExtractionDetails(prev => ({ ...prev, raw: data }));
            }

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
                    setSections([
                        { id: uid(), title: 'Introduction', level: 1 },
                        { id: uid(), title: 'Main Body', level: 1 },
                        { id: uid(), title: 'Conclusion', level: 1 },
                        { id: uid(), title: 'References', level: 1 },
                    ]);
                    toast('Using basic structure fallback.', { icon: '⚠️' });
                }
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

    // ── Section CRUD ──────────────────────────────────────────────────────────

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

    // ── Steps Config ──────────────────────────────────────────────────────────

    const steps = [
        { label: 'Step 01', title: 'Thesis & Topic', desc: 'Core research scope' },
        { label: 'Step 02', title: 'Credentials', desc: 'Student cover metadata' },
        { label: 'Step 03', title: 'Outline Builder', desc: 'Structure blueprint' }
    ];

    const LEVEL_INDENT: Record<number, string> = {
        0: 'ml-0',
        1: 'ml-4',
        2: 'ml-8',
        3: 'ml-12',
    };

    const flatSections = flattenSections(sections);

    // Color configurations per card stack index - vibrant, high contrast, matching themes
    const CARD_THEMES = [
        {
            bg: isDarkMode 
                ? "from-[#1B0B3A]/75 to-[#0C061C]/80 border-violet-500/25 backdrop-blur-xl hover:shadow-[0_0_55px_rgba(139,92,246,0.45)] hover:border-violet-400/40" 
                : "from-[#F5F3FF] to-[#DDD6FE] border-violet-300/80 shadow-[25px_25px_60px_rgba(139,92,246,0.15)] hover:shadow-[0_0_45px_rgba(139,92,246,0.3)] hover:border-violet-400/40",
            badge: isDarkMode ? "text-violet-200 bg-violet-950/60 border-violet-800" : "text-violet-850 bg-violet-100 border-violet-200",
            btn: "clay-btn-violet text-white",
            text: isDarkMode ? "text-violet-50 placeholder-violet-400/80" : "text-violet-950 placeholder-violet-500/80",
            border: isDarkMode ? "border-violet-700/40 focus:border-violet-400" : "border-violet-300/60 focus:border-violet-650",
            label: isDarkMode ? "text-violet-300/90 font-bold" : "text-violet-750/90 font-bold"
        },
        {
            bg: isDarkMode 
                ? "from-[#042433]/75 to-[#050D1D]/80 border-cyan-500/25 backdrop-blur-xl hover:shadow-[0_0_55px_rgba(6,182,212,0.45)] hover:border-cyan-400/40" 
                : "from-[#E0F2FE] to-[#BAE6FD] border-cyan-300/80 shadow-[25px_25px_60px_rgba(6,182,212,0.15)] hover:shadow-[0_0_45px_rgba(6,182,212,0.3)] hover:border-cyan-400/40",
            badge: isDarkMode ? "text-cyan-200 bg-cyan-950/60 border-cyan-800" : "text-cyan-900 bg-cyan-100 border-cyan-200",
            btn: "clay-btn-cyan text-white",
            text: isDarkMode ? "text-cyan-50 placeholder-cyan-400/80" : "text-cyan-950 placeholder-cyan-600/80",
            border: isDarkMode ? "border-cyan-700/40 focus:border-cyan-400" : "border-cyan-300/60 focus:border-cyan-600",
            label: isDarkMode ? "text-cyan-300/90 font-bold" : "text-cyan-800/90 font-bold"
        },
        {
            bg: isDarkMode 
                ? "from-[#033024]/75 to-[#011610]/80 border-emerald-500/25 backdrop-blur-xl hover:shadow-[0_0_55px_rgba(16,185,129,0.45)] hover:border-emerald-400/40" 
                : "from-[#ECFDF5] to-[#A7F3D0] border-emerald-300/80 shadow-[25px_25px_60px_rgba(16,185,129,0.15)] hover:shadow-[0_0_45px_rgba(16,185,129,0.3)] hover:border-emerald-400/40",
            badge: isDarkMode ? "text-emerald-250 bg-emerald-950/60 border-emerald-800" : "text-emerald-900 bg-emerald-100 border-emerald-200",
            btn: "clay-btn-emerald text-white",
            text: isDarkMode ? "text-emerald-50 placeholder-emerald-400/80" : "text-emerald-950 placeholder-emerald-700/85",
            border: isDarkMode ? "border-emerald-700/40 focus:border-emerald-400" : "border-emerald-300/60 focus:border-emerald-600",
            label: isDarkMode ? "text-emerald-300/90 font-bold" : "text-emerald-800/90 font-bold"
        }
    ];

    const getCardStyle = (idx: number) => {
        const diff = idx - activeStep;
        if (diff < 0) {
            return {
                x: -1000,
                rotate: -12,
                opacity: 0,
                scale: 1,
                y: 0,
                zIndex: 0,
                pointerEvents: 'none' as const
            };
        } else if (diff === 0) {
            return {
                x: 0,
                y: 0,
                rotate: 0,
                opacity: 1,
                scale: 1,
                zIndex: 30,
                pointerEvents: 'auto' as const
            };
        } else if (diff === 1) {
            return {
                x: 24,
                y: 16,
                rotate: 2,
                scale: 1,
                opacity: 0.95,
                zIndex: 20,
                pointerEvents: 'none' as const
            };
        } else {
            return {
                x: 48,
                y: 32,
                rotate: 4,
                scale: 1,
                opacity: 0.85,
                zIndex: 10,
                pointerEvents: 'none' as const
            };
        }
    };

    return (
        <Layout>
            <AnimatePresence>{loading && <GeneratingLoader topic={topic} />}</AnimatePresence>

            <div className="min-h-screen bg-[var(--bg-app)] relative overflow-hidden font-sans text-[var(--text-main)] flex flex-col justify-between p-6 md:p-12 transition-colors duration-500">
                {/* Dynamic Theme Aurora Background */}
                <div className="absolute inset-0 z-0 opacity-35 dark:opacity-20 pointer-events-none">
                    <Aurora
                        colorStops={
                            isDarkMode 
                                ? ['#1E1B4B', '#083344', '#064E3B'] 
                                : ['#EEF2FF', '#E0F2FE', '#ECFDF5']
                        }
                        speed={0.2}
                        amplitude={0.8}
                    />
                </div>

                {/* Dot background field */}
                <div className="absolute inset-0 opacity-15 dark:opacity-5 pointer-events-none z-0">
                    <DotField
                        dotRadius={1.5}
                        dotSpacing={26}
                        bulgeOnly={false}
                        bulgeStrength={40}
                        glowRadius={140}
                        sparkle={true}
                        waveAmplitude={0.2}
                        gradientFrom={isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(139, 92, 246, 0.1)"}
                        gradientTo={isDarkMode ? "rgba(255, 255, 255, 0.01)" : "rgba(6, 182, 212, 0.05)"}
                        glowColor={isDarkMode ? "#090514" : "#F5F3FF"}
                    />
                </div>

                {/* Header */}
                <header className="relative z-20 flex justify-between items-center max-w-5xl mx-auto w-full mb-6">
                    <div className="flex items-center gap-2">
                        <Sparkle size={20} className="text-[var(--text-main)] shrink-0" />
                        <span className="font-serif italic text-xl font-bold tracking-tight text-[var(--text-main)]">
                            Synthesis Desk
                        </span>
                    </div>

                    {/* Circular Orbital Progress Ring */}
                    <div className="flex items-center gap-3 bg-[var(--bg-card)] px-5 py-2 rounded-full border border-[var(--border-main)] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                        <svg className="w-5 h-5 transform -rotate-90">
                            <circle cx="10" cy="10" r="8" className="stroke-stone-200 dark:stroke-stone-800" strokeWidth="2" fill="transparent" />
                            <circle
                                cx="10"
                                cy="10"
                                r="8"
                                className="stroke-stone-900 dark:stroke-stone-100"
                                strokeWidth="2"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 8}
                                strokeDashoffset={2 * Math.PI * 8 * (1 - (activeStep + 1) / steps.length)}
                            />
                        </svg>
                        <span className="text-[10px] font-bold text-[var(--text-main)] uppercase tracking-wider">
                            Step {activeStep + 1} of {steps.length}
                        </span>
                    </div>
                </header>

                {/* Upscaled Card Stack Workspace */}
                <main className="flex-1 relative z-10 flex items-center justify-center max-w-5xl mx-auto w-full my-4">
                    <div className="relative w-full max-w-4xl h-[620px]">
                        
                        {steps.map((s, idx) => {
                            const isCurrent = activeStep === idx;
                            const theme = CARD_THEMES[idx] || CARD_THEMES[0];
                            return (
                                <motion.div
                                    key={idx}
                                    style={{ position: 'absolute', width: '100%', top: 0, left: 0 }}
                                    animate={getCardStyle(idx)}
                                    transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                                    className={clsx(
                                        "clay-card p-8 md:p-10 h-full bg-gradient-to-br border flex flex-col justify-between",
                                        theme.bg
                                    )}
                                >
                                    {/* Card Header */}
                                    <div className="flex justify-between items-start border-b border-stone-250/30 pb-5">
                                        <div>
                                            <span className={clsx("text-[10px] font-black tracking-widest block uppercase mb-1", theme.label)}>{s.label}</span>
                                            <h2 className={clsx("text-2xl font-serif italic font-bold leading-tight", isDarkMode ? "text-white" : "text-stone-950")}>{s.title}</h2>
                                        </div>
                                        <div className={clsx(
                                            "text-[10px] font-bold uppercase border rounded px-2.5 py-1",
                                            theme.badge
                                        )}>
                                            {s.desc}
                                        </div>
                                    </div>

                                    {/* Card Content Panel */}
                                    <div className="flex-1 py-6">
                                        {idx === 0 && (
                                            <div className="space-y-8">
                                                <input
                                                    type="text"
                                                    required={isCurrent}
                                                    value={topic}
                                                    onChange={e => setTopic(e.target.value)}
                                                    placeholder="Enter your research topic..."
                                                    className={clsx(
                                                        "clay-input w-full px-5 py-4 text-2xl md:text-3xl font-serif italic focus:bg-[var(--bg-card)]",
                                                        theme.text
                                                    )}
                                                />
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center pb-1">
                                                        <span className={clsx("text-[11px] font-black tracking-widest uppercase", theme.label)}>Writing Guidelines</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowTemplateInput(v => !v)}
                                                            className="clay-btn-light px-3 py-1 text-[9px] font-bold uppercase transition-colors hover:opacity-85 cursor-pointer"
                                                        >
                                                            {showTemplateInput ? '- Hide Context' : '+ Add Reference Context'}
                                                        </button>
                                                    </div>
                                                    <AnimatePresence>
                                                        {showTemplateInput && (
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                                <textarea
                                                                    rows={3}
                                                                    value={templateText}
                                                                    onChange={e => setTemplateText(e.target.value)}
                                                                    placeholder="Paste document reference notes or styling requirements..."
                                                                    className={clsx(
                                                                        "clay-input w-full p-4 text-sm resize-none mb-3",
                                                                        theme.text
                                                                    )}
                                                                />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                    <textarea
                                                        rows={4}
                                                        required={isCurrent}
                                                        value={description}
                                                        onChange={e => setDescription(e.target.value)}
                                                        placeholder="Describe specific requests, required theories, formatting rules..."
                                                        className={clsx(
                                                            "clay-input w-full p-4 text-base resize-none",
                                                            theme.text
                                                        )}
                                                    />
                                                </div>
                                                <div className="space-y-3 pt-1">
                                                    <span className={clsx("text-[11px] font-black tracking-widest uppercase block", theme.label)}>Academic Tone</span>
                                                    <div className="flex flex-wrap gap-2.5">
                                                        {(['formal', 'analytical', 'persuasive', 'descriptive'] as AcademicTone[]).map(t => (
                                                            <button
                                                                key={t}
                                                                type="button"
                                                                onClick={() => setTone(t)}
                                                                className={clsx(
                                                                    'py-2.5 px-6 rounded-full text-xs font-bold capitalize transition-all cursor-pointer',
                                                                    tone === t
                                                                        ? 'clay-btn border-none scale-[1.02]'
                                                                        : 'clay-btn-light border border-[var(--border-main)]'
                                                                )}
                                                            >
                                                                {t}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {idx === 1 && (
                                            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-7 py-4">
                                                {[
                                                    { label: 'Student Name', val: studentName, set: setStudentName, ph: 'Full Name', req: true },
                                                    { label: 'Registration ID', val: regNo, set: setRegNo, ph: 'Roll / ID number', req: true },
                                                    { label: 'Course Title', val: course, set: setCourse, ph: 'e.g. Computer Science 101', req: false },
                                                    { label: 'Institution Name', val: institution, set: setInstitution, ph: 'University / College', req: false },
                                                ].map(({ label, val, set, ph, req }) => (
                                                    <div key={label} className="space-y-2">
                                                        <label className={clsx("text-[11px] font-black tracking-widest block uppercase", theme.label)}>
                                                            {label}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={val}
                                                            onChange={e => (set as any)(e.target.value)}
                                                            placeholder={ph}
                                                            required={req && isCurrent}
                                                            className={clsx(
                                                                "clay-input w-full px-5 py-3.5 text-base focus:bg-[var(--bg-card)]",
                                                                theme.text
                                                            )}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {idx === 2 && (
                                            <div className="space-y-6">
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowTemplateLibrary(v => !v)}
                                                        className="clay-btn-light py-2 px-5 text-xs font-bold cursor-pointer"
                                                    >
                                                        Library Templates
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPasteInput(v => !v)}
                                                        className="clay-btn-light py-2 px-5 text-xs font-bold cursor-pointer"
                                                    >
                                                        Bulk Add Outline
                                                    </button>
                                                </div>

                                                <div className={clsx(
                                                    "clay-card border-2 border-dashed p-6 text-center transition-all relative group bg-[var(--bg-card)]/20 dark:bg-black/10",
                                                    theme.border,
                                                    "hover:bg-[var(--bg-card)]/40"
                                                )}>
                                                    <Upload size={22} className={clsx("mx-auto mb-2 transition-colors", theme.text)} />
                                                    <p className={clsx("text-xs font-bold", theme.text)}>Drop template brief or click upload</p>
                                                    <input
                                                        ref={fileRef}
                                                        type="file"
                                                        className="absolute inset-0 cursor-pointer opacity-0"
                                                        onChange={handleFileChange}
                                                        accept=".pdf,.docx,.txt"
                                                    />
                                                </div>

                                                {parsingFile && (
                                                    <div className="clay-card flex items-center gap-3 p-3 bg-[var(--bg-card)]/40 border border-[var(--border-main)]/50 text-sm font-semibold text-[var(--text-main)]">
                                                        <RefreshCw size={14} className="animate-spin text-stone-500" />
                                                        <span>{parseStatus}</span>
                                                    </div>
                                                )}

                                                {templateFile && !parsingFile && (
                                                    <div className="clay-card flex items-center gap-2 px-3 py-1.5 bg-emerald-550 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 rounded-lg w-fit text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                                                        <FileText size={12} className="text-emerald-700 dark:text-emerald-400" />
                                                        <span className="truncate max-w-[200px]">{templateFile.name}</span>
                                                        <button type="button" onClick={handleReset} className="text-emerald-600 dark:text-emerald-400 hover:text-red-500 cursor-pointer">
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                )}

                                                <AnimatePresence>
                                                    {showPasteInput && (
                                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                            <div className="clay-card p-4 bg-[var(--bg-card)]/40 border border-[var(--border-main)]/40 space-y-2">
                                                                <textarea
                                                                    rows={3}
                                                                    value={pastedHeadings}
                                                                    onChange={e => setPastedHeadings(e.target.value)}
                                                                    placeholder="Abstract&#10;Introduction&#10;Methodology..."
                                                                    className="clay-input w-full p-3 text-xs focus:bg-[var(--bg-card)]"
                                                                />
                                                                <button type="button" onClick={handleApplyPastedHeadings} className="clay-btn w-full py-2.5 text-xs font-bold cursor-pointer">
                                                                    Apply
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <AnimatePresence>
                                                    {showTemplateLibrary && (
                                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                            <div className="clay-card grid grid-cols-3 gap-3 p-4 bg-[var(--bg-card)]/40 border border-[var(--border-main)]/45">
                                                                {BUILT_IN_TEMPLATES.map(t => (
                                                                    <button
                                                                        key={t.id}
                                                                        type="button"
                                                                        onClick={() => handleSelectTemplate(t)}
                                                                        className="clay-btn-light p-3 text-center text-xs font-bold transition-colors cursor-pointer"
                                                                    >
                                                                        {t.name}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 sidebar-scroll">
                                                    {flatSections.map((section) => (
                                                        <div key={section.id} className={clsx('flex items-center gap-3 group', LEVEL_INDENT[section.depth] ?? 'ml-0')}>
                                                            <button
                                                                type="button"
                                                                onClick={() => cycleLevel(section.id)}
                                                                className={clsx(
                                                                    'w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold border transition-all shrink-0 cursor-pointer',
                                                                    section.level === 1 ? 'clay-btn border-none' : 'clay-btn-light'
                                                                )}
                                                            >
                                                                H{section.level}
                                                            </button>
                                                            <input
                                                                type="text"
                                                                value={section.title}
                                                                onChange={e => editSection(section.id, e.target.value)}
                                                                className={clsx(
                                                                    "clay-input w-full px-3 py-1.5 text-xs font-semibold focus:bg-[var(--bg-card)]",
                                                                    theme.text
                                                                )}
                                                                placeholder="Section Title..."
                                                            />
                                                            <button type="button" onClick={() => removeSection(section.id)} className="text-stone-450 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex gap-3">
                                                    <button type="button" onClick={() => addSection(1)} className="clay-btn-light flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                                                        <Plus size={12} /> H1 Header
                                                    </button>
                                                    <button type="button" onClick={() => addSection(2)} className="clay-btn-light flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                                                        <Plus size={12} /> H2 Subheading
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Action Controls Footer */}
                                    <div className="flex justify-between items-center pt-6 border-t border-stone-250/20 relative z-30">
                                        {activeStep > 0 ? (
                                            <button
                                                type="button"
                                                onClick={() => setActiveStep(prev => prev - 1)}
                                                className="clay-btn-light px-5 py-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <ArrowLeft size={14} /> BACK
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                {extractedData && (
                                                    <button type="button" onClick={handleExportJSON} className="clay-btn-light py-2.5 px-5 text-xs font-bold cursor-pointer">
                                                        Export JSON
                                                    </button>
                                                )}
                                                {flatSections.length > 0 && (
                                                    <button type="button" onClick={handleSaveAsTemplate} className="clay-btn-light py-2.5 px-5 text-xs font-bold cursor-pointer">
                                                        Archive Style
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {activeStep < steps.length - 1 ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (activeStep === 0 && (!topic || !description)) {
                                                        toast.error('Fill in the topic and description');
                                                        return;
                                                    }
                                                    if (activeStep === 1 && (!studentName || !regNo)) {
                                                        toast.error('Student Name and Registration ID are required');
                                                        return;
                                                    }
                                                    setActiveStep(prev => prev + 1);
                                                }}
                                                className={clsx(
                                                    "px-7 py-3.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow active:translate-y-0.5 cursor-pointer",
                                                    theme.btn
                                                )}
                                            >
                                                CONTINUE <ArrowRight size={14} />
                                            </button>
                                        ) : (
                                            <div className="flex gap-2.5">
                                                <button
                                                    type="button"
                                                    onClick={e => handleGenerate(e as any, true)}
                                                    className="clay-btn-light py-3 px-5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <FileText size={14} /> DOCX
                                                </button>
                                                <button
                                                    type="submit"
                                                    className={clsx(
                                                        "px-7 py-3.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 shadow cursor-pointer",
                                                        theme.btn
                                                    )}
                                                >
                                                    SYNTHESIZE <Sparkles size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                </motion.div>
                            );
                        })}
                    </div>
                </main>
            </div>
        </Layout>
    );
};

export default GeneratePage;