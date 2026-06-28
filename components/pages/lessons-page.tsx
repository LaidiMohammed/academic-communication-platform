'use client';

import { useState, useMemo } from 'react';
import {
  Calculator, BookOpen, Atom, FlaskConical, Landmark, Dna,
  Search, Filter, ExternalLink, ChevronRight, FileText, Play,
  Languages, Shield,
} from 'lucide-react';

const subjects = [
  { id: 'mathematics', icon: Calculator, color: 'from-blue-500 to-blue-600', name: 'Mathematics', ar: 'الرياضيات' },
  { id: 'physics', icon: Atom, color: 'from-purple-500 to-purple-600', name: 'Physics', ar: 'العلوم الفيزيائية' },
  { id: 'chemistry', icon: FlaskConical, color: 'from-orange-500 to-orange-600', name: 'Chemistry', ar: 'الكيمياء' },
  { id: 'english', icon: BookOpen, color: 'from-green-500 to-green-600', name: 'English', ar: 'الإنجليزية' },
  { id: 'history', icon: Landmark, color: 'from-amber-500 to-amber-600', name: 'History', ar: 'التاريخ والجغرافيا' },
  { id: 'biology', icon: Dna, color: 'from-emerald-500 to-emerald-600', name: 'Biology', ar: 'علوم الطبيعة والحياة' },
  { id: 'arabic', icon: Languages, color: 'from-red-500 to-red-600', name: 'Arabic', ar: 'اللغة العربية' },
  { id: 'french', icon: Languages, color: 'from-indigo-500 to-indigo-600', name: 'French', ar: 'اللغة الفرنسية' },
  { id: 'islamic', icon: BookOpen, color: 'from-teal-500 to-teal-600', name: 'Islamic Education', ar: 'التربية الإسلامية' },
  { id: 'civic', icon: Shield, color: 'from-rose-500 to-rose-600', name: 'Civic Education', ar: 'التربية المدنية' },
];

const allLevels = ['1AM', '2AM', '3AM', '4AM', '1AS', '2AS', '3AS'];
const bemYears = Array.from({ length: 25 }, (_, i) => (2000 + i).toString());
const bacYears = Array.from({ length: 25 }, (_, i) => (2000 + i).toString());

const dzexamsSubject: Record<string, string> = {
  mathematics: 'mathematiques',
  physics: 'physique',
  chemistry: 'chimie',
  english: 'anglais',
  history: 'histoire-geographie',
  biology: 'sciences-naturelles',
  arabic: 'arabe',
  french: 'francais',
  islamic: 'tarbia-islamia',
  civic: 'education-civique',
};

const linkTypes: Record<string, string> = {
  course: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  exam: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  td: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  tp: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
  video: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};

const levelBadge: Record<string, string> = {
  '1AM': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  '2AM': 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  '3AM': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
  '4AM': 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
  '1AS': 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  '2AS': 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300',
  '3AS': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
};

interface LinkItem { label: string; url: string; type: string; }
interface LevelRes { level: string; title: string; links: LinkItem[]; }

/* ===== DATA: Algerian education resources ===== */
const bemLinks: LinkItem[] = bemYears.flatMap(y => ([
  { label: `BEM ${y} — Sujet + Corrigé (${subjects.map(s => s.ar).join('/')})`, url: `https://www.dzexams.com/fr/bem`, type: 'exam' },
]));
const bacLinks: LinkItem[] = bacYears.flatMap(y => ([
  { label: `BAC ${y} — Sujet + Corrigé`, url: `https://www.dzexams.com/fr/bac`, type: 'exam' },
]));

function subjUrl(subj: string, page: string): string {
  const s = dzexamsSubject[subj] || subj;
  return `https://www.dzexams.com/fr/${page}/${s}`;
}

const resourceData: Record<string, LevelRes[]> = {
  mathematics: [
    { level: '1AM', title: 'الأعداد الطبيعية والأعداد العشرية', links: [
      { label: 'درس: الأعداد الطبيعية', url: subjUrl('mathematics', '1am'), type: 'course' },
      { label: 'تمارين: العمليات الأربع', url: subjUrl('mathematics', '1am'), type: 'td' },
      { label: 'فروض واختبارات 1AM', url: 'https://www.dzexams.com/fr/1am/mathematiques', type: 'exam' },
    ]},
    { level: '2AM', title: 'الحساب الحرفي والمعادلات', links: [
      { label: 'درس: الحساب الحرفي', url: subjUrl('mathematics', '2am'), type: 'course' },
      { label: 'تمارين: المعادلات', url: subjUrl('mathematics', '2am'), type: 'td' },
      { label: 'فروض واختبارات 2AM', url: 'https://www.dzexams.com/fr/2am/mathematiques', type: 'exam' },
    ]},
    { level: '3AM', title: 'الدوال الخطية والدوال التآلفية', links: [
      { label: 'درس: الدوال', url: subjUrl('mathematics', '3am'), type: 'course' },
      { label: 'تمارين: الدوال الخطية', url: subjUrl('mathematics', '3am'), type: 'td' },
      { label: 'فروض واختبارات 3AM', url: 'https://www.dzexams.com/fr/3am/mathematiques', type: 'exam' },
    ]},
    { level: '4AM', title: 'الإحصاء والهندسة في الفضاء — تحضير BEM', links: [
      { label: 'دروس 4AM رياضيات', url: subjUrl('mathematics', '4am'), type: 'course' },
      { label: 'تمارين شاملة لتحضير BEM', url: subjUrl('mathematics', '4am'), type: 'td' },
      { label: 'فروض واختبارات 4AM', url: 'https://www.dzexams.com/fr/4am/mathematiques', type: 'exam' },
      { label: 'BEM 2025 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bem/mathematiques', type: 'exam' },
      { label: 'BEM 2024 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bem/mathematiques', type: 'exam' },
      { label: 'BEM 2023 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bem/mathematiques', type: 'exam' },
      { label: 'BEM 2022 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bem/mathematiques', type: 'exam' },
      { label: 'BEM 2021 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bem/mathematiques', type: 'exam' },
      { label: 'BEM 2020 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bem/mathematiques', type: 'exam' },
      { label: 'BEM 2019 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bem/mathematiques', type: 'exam' },
      { label: 'BEM 2018 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bem/mathematiques', type: 'exam' },
      { label: 'BEM 2017 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bem/mathematiques', type: 'exam' },
      { label: 'BEM 2016 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bem/mathematiques', type: 'exam' },
      { label: 'BEM 2015 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bem/mathematiques', type: 'exam' },
      { label: 'BEM 2014 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bem/mathematiques', type: 'exam' },
      { label: 'BEM 2013 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bem/mathematiques', type: 'exam' },
      { label: 'BEM 2012 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bem/mathematiques', type: 'exam' },
      { label: 'BEM 2011 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bem/mathematiques', type: 'exam' },
      { label: 'BEM 2010 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bem/mathematiques', type: 'exam' },
      { label: 'BEM 2009 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bem/mathematiques', type: 'exam' },
      { label: 'BEM 2008 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bem/mathematiques', type: 'exam' },
    ]},
    { level: '1AS', title: 'الدوال المرجعية والنهايات', links: [
      { label: 'درس: النهايات', url: subjUrl('mathematics', '1as'), type: 'course' },
      { label: 'تمارين: الدوال', url: subjUrl('mathematics', '1as'), type: 'td' },
      { label: 'فروض واختبارات 1AS', url: 'https://www.dzexams.com/fr/1as/mathematiques', type: 'exam' },
    ]},
    { level: '2AS', title: 'الاشتقاقية والدوال الأسية', links: [
      { label: 'درس: الاشتقاقية', url: subjUrl('mathematics', '2as'), type: 'course' },
      { label: 'تمارين: الدوال الأسية', url: subjUrl('mathematics', '2as'), type: 'td' },
      { label: 'فروض واختبارات 2AS', url: 'https://www.dzexams.com/fr/2as/mathematiques', type: 'exam' },
    ]},
    { level: '3AS', title: 'الدوال اللوغاريتمية والتكامل — تحضير BAC', links: [
      { label: 'درس: التكامل', url: subjUrl('mathematics', '3as'), type: 'course' },
      { label: 'تمارين: الدوال اللوغاريتمية', url: subjUrl('mathematics', '3as'), type: 'td' },
      { label: 'فروض واختبارات 3AS', url: 'https://www.dzexams.com/fr/3as/mathematiques', type: 'exam' },
      { label: 'BAC 2025 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
      { label: 'BAC 2024 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
      { label: 'BAC 2023 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
      { label: 'BAC 2022 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
      { label: 'BAC 2021 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
      { label: 'BAC 2020 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
      { label: 'BAC 2019 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
      { label: 'BAC 2018 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
      { label: 'BAC 2017 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
      { label: 'BAC 2016 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
      { label: 'BAC 2015 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
      { label: 'BAC 2014 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
      { label: 'BAC 2013 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
      { label: 'BAC 2012 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
      { label: 'BAC 2011 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
      { label: 'BAC 2010 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
      { label: 'BAC 2009 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
      { label: 'BAC 2008 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
      { label: 'BAC 2007 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
      { label: 'BAC 2006 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
      { label: 'BAC 2005 — Sujet Math + Corrigé', url: 'https://www.dzexams.com/fr/bac/mathematiques', type: 'exam' },
    ]},
  ],
  physics: [
    { level: '1AM', title: 'المادة وتحولاتها', links: [
      { label: 'درس: حالات المادة', url: subjUrl('physics', '1am'), type: 'course' },
      { label: 'تمارين: الكتلة والحجم', url: subjUrl('physics', '1am'), type: 'td' },
      { label: 'فروض واختبارات', url: 'https://www.dzexams.com/fr/1am/physique', type: 'exam' },
    ]},
    { level: '2AM', title: 'الكهرباء والمغناطيسية', links: [
      { label: 'درس: التيار الكهربائي', url: subjUrl('physics', '2am'), type: 'course' },
      { label: 'تمارين: قانون أوم', url: subjUrl('physics', '2am'), type: 'td' },
      { label: 'فروض واختبارات', url: 'https://www.dzexams.com/fr/2am/physique', type: 'exam' },
    ]},
    { level: '3AM', title: 'البصريات والأمواج', links: [
      { label: 'درس: الضوء والعدسات', url: subjUrl('physics', '3am'), type: 'course' },
      { label: 'تمارين: الأمواج', url: subjUrl('physics', '3am'), type: 'td' },
      { label: 'فروض واختبارات', url: 'https://www.dzexams.com/fr/3am/physique', type: 'exam' },
    ]},
    { level: '4AM', title: 'الميكانيكا والطاقة — تحضير BEM', links: [
      { label: 'درس: القوى والحركة', url: subjUrl('physics', '4am'), type: 'course' },
      { label: 'تمارين: الطاقة', url: subjUrl('physics', '4am'), type: 'td' },
      { label: 'فروض واختبارات 4AM', url: 'https://www.dzexams.com/fr/4am/physique', type: 'exam' },
      { label: 'BEM Physique 2025', url: 'https://www.dzexams.com/fr/bem/physique', type: 'exam' },
      { label: 'BEM Physique 2024', url: 'https://www.dzexams.com/fr/bem/physique', type: 'exam' },
      { label: 'BEM Physique 2023', url: 'https://www.dzexams.com/fr/bem/physique', type: 'exam' },
      { label: 'BEM Physique 2022', url: 'https://www.dzexams.com/fr/bem/physique', type: 'exam' },
      { label: 'BEM Physique 2021', url: 'https://www.dzexams.com/fr/bem/physique', type: 'exam' },
      { label: 'BEM Physique 2020', url: 'https://www.dzexams.com/fr/bem/physique', type: 'exam' },
    ]},
    { level: '1AS', title: 'القوى الأساسية في الطبيعة', links: [
      { label: 'درس: التفاعلات', url: subjUrl('physics', '1as'), type: 'course' },
      { label: 'تمارين: القوى', url: subjUrl('physics', '1as'), type: 'td' },
      { label: 'فروض واختبارات', url: 'https://www.dzexams.com/fr/1as/physique', type: 'exam' },
    ]},
    { level: '2AS', title: 'الكهرباء والمغناطيسية', links: [
      { label: 'درس: الحقل المغناطيسي', url: subjUrl('physics', '2as'), type: 'course' },
      { label: 'تمارين: التحريض', url: subjUrl('physics', '2as'), type: 'td' },
      { label: 'فروض واختبارات', url: 'https://www.dzexams.com/fr/2as/physique', type: 'exam' },
    ]},
    { level: '3AS', title: 'النووي والكمي — تحضير BAC', links: [
      { label: 'درس: النشاط الإشعاعي', url: subjUrl('physics', '3as'), type: 'course' },
      { label: 'تمارين: التفاعلات النووية', url: subjUrl('physics', '3as'), type: 'td' },
      { label: 'فروض واختبارات 3AS', url: 'https://www.dzexams.com/fr/3as/physique', type: 'exam' },
      { label: 'BAC Physique 2025', url: 'https://www.dzexams.com/fr/bac/physique', type: 'exam' },
      { label: 'BAC Physique 2024', url: 'https://www.dzexams.com/fr/bac/physique', type: 'exam' },
      { label: 'BAC Physique 2023', url: 'https://www.dzexams.com/fr/bac/physique', type: 'exam' },
      { label: 'BAC Physique 2022', url: 'https://www.dzexams.com/fr/bac/physique', type: 'exam' },
      { label: 'BAC Physique 2021', url: 'https://www.dzexams.com/fr/bac/physique', type: 'exam' },
    ]},
  ],
  chemistry: [
    { level: '1AM', title: 'المادة والخليط', links: [
      { label: 'درس: أنواع المخاليط', url: subjUrl('chemistry', '1am'), type: 'course' },
      { label: 'تمارين: فصل المخاليط', url: subjUrl('chemistry', '1am'), type: 'td' },
    ]},
    { level: '2AM', title: 'الذرة والجدول الدوري', links: [
      { label: 'درس: بنية الذرة', url: subjUrl('chemistry', '2am'), type: 'course' },
      { label: 'تمارين: الجدول الدوري', url: subjUrl('chemistry', '2am'), type: 'td' },
    ]},
    { level: '3AM', title: 'التفاعلات الكيميائية', links: [
      { label: 'درس: المعادلات الكيميائية', url: subjUrl('chemistry', '3am'), type: 'course' },
      { label: 'تمارين: وزن المعادلات', url: subjUrl('chemistry', '3am'), type: 'td' },
    ]},
    { level: '4AM', title: 'الأحماض والقواعد — تحضير BEM', links: [
      { label: 'درس: الأحماض والقواعد', url: subjUrl('chemistry', '4am'), type: 'course' },
      { label: 'تمارين: تفاعلات حمض-قاعدة', url: subjUrl('chemistry', '4am'), type: 'td' },
      { label: 'جميع مواضيع BEM', url: 'https://www.dzexams.com/fr/bem', type: 'exam' },
    ]},
    { level: '1AS', title: 'التفاعلات الكيميائية', links: [
      { label: 'درس: المردودية', url: subjUrl('chemistry', '1as'), type: 'course' },
      { label: 'تمارين: الحساب ستوكيومتري', url: subjUrl('chemistry', '1as'), type: 'td' },
    ]},
    { level: '2AS', title: 'الكيمياء العضوية', links: [
      { label: 'درس: المركبات العضوية', url: subjUrl('chemistry', '2as'), type: 'course' },
      { label: 'تمارين: التسمية', url: subjUrl('chemistry', '2as'), type: 'td' },
    ]},
    { level: '3AS', title: 'الكيمياء الكهربائية — تحضير BAC', links: [
      { label: 'درس: الأكسدة والاختزال', url: subjUrl('chemistry', '3as'), type: 'course' },
      { label: 'تمارين: التفاعلات الكهربائية', url: subjUrl('chemistry', '3as'), type: 'td' },
      { label: 'جميع مواضيع BAC', url: 'https://www.dzexams.com/fr/bac', type: 'exam' },
    ]},
  ],
  english: [
    { level: '1AM', title: 'Introduction to English', links: [
      { label: 'درس: Greetings & Alphabet', url: subjUrl('english', '1am'), type: 'course' },
      { label: 'تمارين: Basic Vocabulary', url: subjUrl('english', '1am'), type: 'td' },
      { label: 'فروض واختبارات', url: 'https://www.dzexams.com/fr/1am/anglais', type: 'exam' },
    ]},
    { level: '2AM', title: 'Grammar & Reading', links: [
      { label: 'درس: Present Simple', url: subjUrl('english', '2am'), type: 'course' },
      { label: 'تمارين: Reading Comprehension', url: subjUrl('english', '2am'), type: 'td' },
      { label: 'فروض واختبارات', url: 'https://www.dzexams.com/fr/2am/anglais', type: 'exam' },
    ]},
    { level: '3AM', title: 'Writing & Communication', links: [
      { label: 'درس: Past Tenses', url: subjUrl('english', '3am'), type: 'course' },
      { label: 'تمارين: Essay Writing', url: subjUrl('english', '3am'), type: 'td' },
      { label: 'فروض واختبارات', url: 'https://www.dzexams.com/fr/3am/anglais', type: 'exam' },
    ]},
    { level: '4AM', title: 'Consolidation — BEM Prep', links: [
      { label: 'درس: All Tenses Review', url: subjUrl('english', '4am'), type: 'course' },
      { label: 'BEM English 2025', url: 'https://www.dzexams.com/fr/bem/anglais', type: 'exam' },
      { label: 'BEM English 2024', url: 'https://www.dzexams.com/fr/bem/anglais', type: 'exam' },
      { label: 'BEM English 2023', url: 'https://www.dzexams.com/fr/bem/anglais', type: 'exam' },
      { label: 'BEM English 2022', url: 'https://www.dzexams.com/fr/bem/anglais', type: 'exam' },
      { label: 'BEM English 2021', url: 'https://www.dzexams.com/fr/bem/anglais', type: 'exam' },
    ]},
    { level: '1AS', title: 'Advanced Grammar', links: [
      { label: 'درس: Conditionals', url: subjUrl('english', '1as'), type: 'course' },
      { label: 'تمارين: Passive Voice', url: subjUrl('english', '1as'), type: 'td' },
      { label: 'فروض واختبارات', url: 'https://www.dzexams.com/fr/1as/anglais', type: 'exam' },
    ]},
    { level: '2AS', title: 'Literature & Translation', links: [
      { label: 'درس: Literary Texts', url: subjUrl('english', '2as'), type: 'course' },
      { label: 'تمارين: Translation', url: subjUrl('english', '2as'), type: 'td' },
      { label: 'فروض واختبارات', url: 'https://www.dzexams.com/fr/2as/anglais', type: 'exam' },
    ]},
    { level: '3AS', title: 'Bac Exam Preparation', links: [
      { label: 'درس: Written Expression', url: subjUrl('english', '3as'), type: 'course' },
      { label: 'BAC English 2025', url: 'https://www.dzexams.com/fr/bac/anglais', type: 'exam' },
      { label: 'BAC English 2024', url: 'https://www.dzexams.com/fr/bac/anglais', type: 'exam' },
      { label: 'BAC English 2023', url: 'https://www.dzexams.com/fr/bac/anglais', type: 'exam' },
      { label: 'BAC English 2022', url: 'https://www.dzexams.com/fr/bac/anglais', type: 'exam' },
    ]},
  ],
  history: [
    { level: '1AM', title: 'الحضارات القديمة', links: [
      { label: 'درس: مصر القديمة', url: subjUrl('history', '1am'), type: 'course' },
      { label: 'تمارين: الخرائط التاريخية', url: subjUrl('history', '1am'), type: 'td' },
      { label: 'فروض واختبارات', url: 'https://www.dzexams.com/fr/1am/histoire-geographie', type: 'exam' },
    ]},
    { level: '2AM', title: 'العصور الوسطى', links: [
      { label: 'درس: الفتح الإسلامي', url: subjUrl('history', '2am'), type: 'course' },
      { label: 'تمارين: الحضارة الإسلامية', url: subjUrl('history', '2am'), type: 'td' },
      { label: 'فروض واختبارات', url: 'https://www.dzexams.com/fr/1am/histoire-geographie', type: 'exam' },
    ]},
    { level: '3AM', title: 'العصر الحديث', links: [
      { label: 'درس: النهضة الأوروبية', url: subjUrl('history', '3am'), type: 'course' },
      { label: 'تمارين: الثورة الفرنسية', url: subjUrl('history', '3am'), type: 'td' },
    ]},
    { level: '4AM', title: 'الجزائر الحديثة — BEM', links: [
      { label: 'درس: المقاومة الجزائرية', url: subjUrl('history', '4am'), type: 'course' },
      { label: 'BEM Histoire-Géo 2025', url: 'https://www.dzexams.com/fr/bem/histoire-geographie', type: 'exam' },
      { label: 'BEM Histoire-Géo 2024', url: 'https://www.dzexams.com/fr/bem/histoire-geographie', type: 'exam' },
      { label: 'BEM Histoire-Géo 2023', url: 'https://www.dzexams.com/fr/bem/histoire-geographie', type: 'exam' },
      { label: 'BEM Histoire-Géo 2022', url: 'https://www.dzexams.com/fr/bem/histoire-geographie', type: 'exam' },
    ]},
    { level: '1AS', title: 'العالم في القرن 20', links: [
      { label: 'درس: الحرب العالمية الأولى', url: subjUrl('history', '1as'), type: 'course' },
      { label: 'تمارين: خرائط تاريخية', url: subjUrl('history', '1as'), type: 'td' },
    ]},
    { level: '2AS', title: 'الثورة الجزائرية', links: [
      { label: 'درس: ثورة التحرير', url: subjUrl('history', '2as'), type: 'course' },
      { label: 'تمارين: بيان أول نوفمبر', url: subjUrl('history', '2as'), type: 'td' },
    ]},
    { level: '3AS', title: 'الجيوسياسية — BAC', links: [
      { label: 'درس: النظام العالمي الجديد', url: subjUrl('history', '3as'), type: 'course' },
      { label: 'BAC Histoire-Géo 2025', url: 'https://www.dzexams.com/fr/bac/histoire-geographie', type: 'exam' },
      { label: 'BAC Histoire-Géo 2024', url: 'https://www.dzexams.com/fr/bac/histoire-geographie', type: 'exam' },
      { label: 'BAC Histoire-Géo 2023', url: 'https://www.dzexams.com/fr/bac/histoire-geographie', type: 'exam' },
    ]},
  ],
  biology: [
    { level: '1AM', title: 'العالم الحي', links: [
      { label: 'درس: الخلية الحية', url: subjUrl('biology', '1am'), type: 'course' },
      { label: 'تمارين: تصنيف الكائنات', url: subjUrl('biology', '1am'), type: 'td' },
      { label: 'فروض واختبارات', url: 'https://www.dzexams.com/fr/1am/sciences-naturelles', type: 'exam' },
    ]},
    { level: '2AM', title: 'التغذية والهضم', links: [
      { label: 'درس: الجهاز الهضمي', url: subjUrl('biology', '2am'), type: 'course' },
      { label: 'تمارين: التغذية', url: subjUrl('biology', '2am'), type: 'td' },
      { label: 'فروض واختبارات', url: 'https://www.dzexams.com/fr/2am/sciences-naturelles', type: 'exam' },
    ]},
    { level: '3AM', title: 'التنفس والدوران', links: [
      { label: 'درس: الجهاز التنفسي', url: subjUrl('biology', '3am'), type: 'course' },
      { label: 'تمارين: الدورة الدموية', url: subjUrl('biology', '3am'), type: 'td' },
      { label: 'فروض واختبارات', url: 'https://www.dzexams.com/fr/3am/sciences-naturelles', type: 'exam' },
    ]},
    { level: '4AM', title: 'الوراثة — BEM', links: [
      { label: 'درس: الوراثة عند الإنسان', url: subjUrl('biology', '4am'), type: 'course' },
      { label: 'BEM Sciences 2025', url: 'https://www.dzexams.com/fr/bem/sciences-naturelles', type: 'exam' },
      { label: 'BEM Sciences 2024', url: 'https://www.dzexams.com/fr/bem/sciences-naturelles', type: 'exam' },
      { label: 'BEM Sciences 2023', url: 'https://www.dzexams.com/fr/bem/sciences-naturelles', type: 'exam' },
    ]},
    { level: '1AS', title: 'الخلية والوراثة', links: [
      { label: 'درس: الانقسام الخلوي', url: subjUrl('biology', '1as'), type: 'course' },
      { label: 'تمارين: الوراثة', url: subjUrl('biology', '1as'), type: 'td' },
    ]},
    { level: '2AS', title: 'التطور والبيئة', links: [
      { label: 'درس: التطور', url: subjUrl('biology', '2as'), type: 'course' },
      { label: 'تمارين: النظام البيئي', url: subjUrl('biology', '2as'), type: 'td' },
    ]},
    { level: '3AS', title: 'البيولوجيا الجزيئية — BAC', links: [
      { label: 'درس: ADN والجينات', url: subjUrl('biology', '3as'), type: 'course' },
      { label: 'BAC Sciences 2025', url: 'https://www.dzexams.com/fr/bac/sciences-naturelles', type: 'exam' },
      { label: 'BAC Sciences 2024', url: 'https://www.dzexams.com/fr/bac/sciences-naturelles', type: 'exam' },
      { label: 'BAC Sciences 2023', url: 'https://www.dzexams.com/fr/bac/sciences-naturelles', type: 'exam' },
    ]},
  ],
  arabic: [
    { level: '1AM', title: 'النصوص الأدبية والقواعد', links: [
      { label: 'درس: أنواع الكلمة', url: subjUrl('arabic', '1am'), type: 'course' },
      { label: 'تمارين: الإعراب والبناء', url: subjUrl('arabic', '1am'), type: 'td' },
      { label: 'فروض واختبارات 1AM', url: 'https://www.dzexams.com/fr/1am/arabe', type: 'exam' },
    ]},
    { level: '2AM', title: 'البلاغة والعروض', links: [
      { label: 'درس: التشبيه والاستعارة', url: subjUrl('arabic', '2am'), type: 'course' },
      { label: 'تمارين: البلاغة', url: subjUrl('arabic', '2am'), type: 'td' },
      { label: 'فروض واختبارات 2AM', url: 'https://www.dzexams.com/fr/2am/arabe', type: 'exam' },
    ]},
    { level: '3AM', title: 'النحو والصرف', links: [
      { label: 'درس: الفعل المعتل', url: subjUrl('arabic', '3am'), type: 'course' },
      { label: 'تمارين: التصريف', url: subjUrl('arabic', '3am'), type: 'td' },
      { label: 'فروض واختبارات 3AM', url: 'https://www.dzexams.com/fr/3am/arabe', type: 'exam' },
    ]},
    { level: '4AM', title: 'المطالعة والنصوص — تحضير BEM', links: [
      { label: 'دروس 4AM لغة عربية', url: subjUrl('arabic', '4am'), type: 'course' },
      { label: 'تمارين شاملة', url: subjUrl('arabic', '4am'), type: 'td' },
      { label: 'فروض واختبارات 4AM', url: 'https://www.dzexams.com/fr/4am/arabe', type: 'exam' },
      { label: 'BEM 2025 — Arabe + Corrigé', url: 'https://www.dzexams.com/fr/bem/arabe', type: 'exam' },
      { label: 'BEM 2024 — Arabe + Corrigé', url: 'https://www.dzexams.com/fr/bem/arabe', type: 'exam' },
      { label: 'BEM 2023 — Arabe + Corrigé', url: 'https://www.dzexams.com/fr/bem/arabe', type: 'exam' },
      { label: 'BEM 2022 — Arabe + Corrigé', url: 'https://www.dzexams.com/fr/bem/arabe', type: 'exam' },
      { label: 'BEM 2021 — Arabe + Corrigé', url: 'https://www.dzexams.com/fr/bem/arabe', type: 'exam' },
      { label: 'BEM 2020 — Arabe + Corrigé', url: 'https://www.dzexams.com/fr/bem/arabe', type: 'exam' },
      { label: 'BEM 2019 — Arabe + Corrigé', url: 'https://www.dzexams.com/fr/bem/arabe', type: 'exam' },
      { label: 'BEM 2018 — Arabe + Corrigé', url: 'https://www.dzexams.com/fr/bem/arabe', type: 'exam' },
    ]},
    { level: '1AS', title: 'الأدب العربي القديم', links: [
      { label: 'درس: العصر الجاهلي', url: subjUrl('arabic', '1as'), type: 'course' },
      { label: 'تمارين: تحليل النصوص', url: subjUrl('arabic', '1as'), type: 'td' },
      { label: 'فروض واختبارات 1AS', url: 'https://www.dzexams.com/fr/1as/arabe', type: 'exam' },
    ]},
    { level: '2AS', title: 'الأدب في العصر الإسلامي', links: [
      { label: 'درس: الشعر الإسلامي', url: subjUrl('arabic', '2as'), type: 'course' },
      { label: 'تمارين: البلاغة المتقدمة', url: subjUrl('arabic', '2as'), type: 'td' },
      { label: 'فروض واختبارات 2AS', url: 'https://www.dzexams.com/fr/2as/arabe', type: 'exam' },
    ]},
    { level: '3AS', title: 'الأدب الحديث والموازنات — تحضير BAC', links: [
      { label: 'درس: مدارس الشعر الحديث', url: subjUrl('arabic', '3as'), type: 'course' },
      { label: 'تمارين: الموازنة النقدية', url: subjUrl('arabic', '3as'), type: 'td' },
      { label: 'فروض واختبارات 3AS', url: 'https://www.dzexams.com/fr/3as/arabe', type: 'exam' },
      { label: 'BAC 2025 — Arabe + Corrigé', url: 'https://www.dzexams.com/fr/bac/arabe', type: 'exam' },
      { label: 'BAC 2024 — Arabe + Corrigé', url: 'https://www.dzexams.com/fr/bac/arabe', type: 'exam' },
      { label: 'BAC 2023 — Arabe + Corrigé', url: 'https://www.dzexams.com/fr/bac/arabe', type: 'exam' },
      { label: 'BAC 2022 — Arabe + Corrigé', url: 'https://www.dzexams.com/fr/bac/arabe', type: 'exam' },
      { label: 'BAC 2021 — Arabe + Corrigé', url: 'https://www.dzexams.com/fr/bac/arabe', type: 'exam' },
      { label: 'BAC 2020 — Arabe + Corrigé', url: 'https://www.dzexams.com/fr/bac/arabe', type: 'exam' },
    ]},
  ],
  french: [
    { level: '1AM', title: 'Grammaire et Conjugaison', links: [
      { label: 'Cours: Les verbes', url: subjUrl('french', '1am'), type: 'course' },
      { label: 'Exercices: Conjugaison', url: subjUrl('french', '1am'), type: 'td' },
      { label: 'Devoirs et examens 1AM', url: 'https://www.dzexams.com/fr/1am/francais', type: 'exam' },
    ]},
    { level: '2AM', title: 'Compréhension et Production', links: [
      { label: 'Cours: Types de textes', url: subjUrl('french', '2am'), type: 'course' },
      { label: 'Exercices: Rédaction', url: subjUrl('french', '2am'), type: 'td' },
      { label: 'Devoirs et examens 2AM', url: 'https://www.dzexams.com/fr/2am/francais', type: 'exam' },
    ]},
    { level: '3AM', title: 'Littérature et Analyse', links: [
      { label: 'Cours: Figures de style', url: subjUrl('french', '3am'), type: 'course' },
      { label: 'Exercices: Analyse textuelle', url: subjUrl('french', '3am'), type: 'td' },
      { label: 'Devoirs et examens 3AM', url: 'https://www.dzexams.com/fr/3am/francais', type: 'exam' },
    ]},
    { level: '4AM', title: 'Préparation BEM — Synthèse', links: [
      { label: 'Cours: Révision grammaticale', url: subjUrl('french', '4am'), type: 'course' },
      { label: 'Exercices: Expression écrite', url: subjUrl('french', '4am'), type: 'td' },
      { label: 'Devoirs et examens 4AM', url: 'https://www.dzexams.com/fr/4am/francais', type: 'exam' },
      { label: 'BEM 2025 — Français + Corrigé', url: 'https://www.dzexams.com/fr/bem/francais', type: 'exam' },
      { label: 'BEM 2024 — Français + Corrigé', url: 'https://www.dzexams.com/fr/bem/francais', type: 'exam' },
      { label: 'BEM 2023 — Français + Corrigé', url: 'https://www.dzexams.com/fr/bem/francais', type: 'exam' },
      { label: 'BEM 2022 — Français + Corrigé', url: 'https://www.dzexams.com/fr/bem/francais', type: 'exam' },
      { label: 'BEM 2021 — Français + Corrigé', url: 'https://www.dzexams.com/fr/bem/francais', type: 'exam' },
    ]},
    { level: '1AS', title: 'Littérature française', links: [
      { label: 'Cours: Le roman', url: subjUrl('french', '1as'), type: 'course' },
      { label: 'Exercices: Commentaire', url: subjUrl('french', '1as'), type: 'td' },
      { label: 'Devoirs et examens 1AS', url: 'https://www.dzexams.com/fr/1as/francais', type: 'exam' },
    ]},
    { level: '2AS', title: 'Poésie et Théâtre', links: [
      { label: 'Cours: La poésie', url: subjUrl('french', '2as'), type: 'course' },
      { label: 'Exercices: Dissertation', url: subjUrl('french', '2as'), type: 'td' },
      { label: 'Devoirs et examens 2AS', url: 'https://www.dzexams.com/fr/2as/francais', type: 'exam' },
    ]},
    { level: '3AS', title: 'Préparation BAC — Synthèse', links: [
      { label: 'Cours: Méthodologie', url: subjUrl('french', '3as'), type: 'course' },
      { label: 'BAC 2025 — Français + Corrigé', url: 'https://www.dzexams.com/fr/bac/francais', type: 'exam' },
      { label: 'BAC 2024 — Français + Corrigé', url: 'https://www.dzexams.com/fr/bac/francais', type: 'exam' },
      { label: 'BAC 2023 — Français + Corrigé', url: 'https://www.dzexams.com/fr/bac/francais', type: 'exam' },
      { label: 'BAC 2022 — Français + Corrigé', url: 'https://www.dzexams.com/fr/bac/francais', type: 'exam' },
      { label: 'BAC 2021 — Français + Corrigé', url: 'https://www.dzexams.com/fr/bac/francais', type: 'exam' },
    ]},
  ],
  islamic: [
    { level: '1AM', title: 'العقيدة والعبادات', links: [
      { label: 'درس: أركان الإسلام', url: subjUrl('islamic', '1am'), type: 'course' },
      { label: 'تمارين: الوضوء والصلاة', url: subjUrl('islamic', '1am'), type: 'td' },
      { label: 'فروض واختبارات 1AM', url: 'https://www.dzexams.com/fr/1am/tarbia-islamia', type: 'exam' },
    ]},
    { level: '2AM', title: 'الهدي النبوي والأخلاق', links: [
      { label: 'درس: الحديث الشريف', url: subjUrl('islamic', '2am'), type: 'course' },
      { label: 'تمارين: الأخلاق الإسلامية', url: subjUrl('islamic', '2am'), type: 'td' },
      { label: 'فروض واختبارات 2AM', url: 'https://www.dzexams.com/fr/2am/tarbia-islamia', type: 'exam' },
    ]},
    { level: '3AM', title: 'الفقه وأحكام الزكاة', links: [
      { label: 'درس: أحكام الزكاة', url: subjUrl('islamic', '3am'), type: 'course' },
      { label: 'تمارين: فقه العبادات', url: subjUrl('islamic', '3am'), type: 'td' },
      { label: 'فروض واختبارات 3AM', url: 'https://www.dzexams.com/fr/3am/tarbia-islamia', type: 'exam' },
    ]},
    { level: '4AM', title: 'القرآن والحديث — تحضير BEM', links: [
      { label: 'دروس 4AM تربية إسلامية', url: subjUrl('islamic', '4am'), type: 'course' },
      { label: 'تمارين شاملة', url: subjUrl('islamic', '4am'), type: 'td' },
      { label: 'فروض واختبارات 4AM', url: 'https://www.dzexams.com/fr/4am/tarbia-islamia', type: 'exam' },
      { label: 'BEM Tarbia Islamia 2025', url: 'https://www.dzexams.com/fr/bem/tarbia-islamia', type: 'exam' },
      { label: 'BEM Tarbia Islamia 2024', url: 'https://www.dzexams.com/fr/bem/tarbia-islamia', type: 'exam' },
      { label: 'BEM Tarbia Islamia 2023', url: 'https://www.dzexams.com/fr/bem/tarbia-islamia', type: 'exam' },
    ]},
    { level: '1AS', title: 'مقاصد الشريعة', links: [
      { label: 'درس: مقاصد الشريعة', url: subjUrl('islamic', '1as'), type: 'course' },
      { label: 'تمارين: قواعد الفقه', url: subjUrl('islamic', '1as'), type: 'td' },
      { label: 'فروض واختبارات 1AS', url: 'https://www.dzexams.com/fr/1as/tarbia-islamia', type: 'exam' },
    ]},
    { level: '2AS', title: 'علم الكلام والفكر الإسلامي', links: [
      { label: 'درس: التوحيد والصفات', url: subjUrl('islamic', '2as'), type: 'course' },
      { label: 'تمارين: الفرق الإسلامية', url: subjUrl('islamic', '2as'), type: 'td' },
      { label: 'فروض واختبارات 2AS', url: 'https://www.dzexams.com/fr/2as/tarbia-islamia', type: 'exam' },
    ]},
    { level: '3AS', title: 'الاجتهاد والتجديد — تحضير BAC', links: [
      { label: 'درس: الاجتهاد الفقهي', url: subjUrl('islamic', '3as'), type: 'course' },
      { label: 'تمارين: أدلة الأحكام', url: subjUrl('islamic', '3as'), type: 'td' },
      { label: 'فروض واختبارات 3AS', url: 'https://www.dzexams.com/fr/3as/tarbia-islamia', type: 'exam' },
      { label: 'BAC Tarbia Islamia 2025', url: 'https://www.dzexams.com/fr/bac/tarbia-islamia', type: 'exam' },
      { label: 'BAC Tarbia Islamia 2024', url: 'https://www.dzexams.com/fr/bac/tarbia-islamia', type: 'exam' },
      { label: 'BAC Tarbia Islamia 2023', url: 'https://www.dzexams.com/fr/bac/tarbia-islamia', type: 'exam' },
      { label: 'BAC Tarbia Islamia 2022', url: 'https://www.dzexams.com/fr/bac/tarbia-islamia', type: 'exam' },
      { label: 'BAC Tarbia Islamia 2021', url: 'https://www.dzexams.com/fr/bac/tarbia-islamia', type: 'exam' },
    ]},
  ],
  civic: [
    { level: '1AM', title: 'الحقوق والواجبات', links: [
      { label: 'درس: حقوق الإنسان', url: subjUrl('civic', '1am'), type: 'course' },
      { label: 'تمارين: المواطنة', url: subjUrl('civic', '1am'), type: 'td' },
      { label: 'فروض واختبارات 1AM', url: 'https://www.dzexams.com/fr/1am/education-civique', type: 'exam' },
    ]},
    { level: '2AM', title: 'المؤسسات والدستور', links: [
      { label: 'درس: الدستور الجزائري', url: subjUrl('civic', '2am'), type: 'course' },
      { label: 'تمارين: مؤسسات الدولة', url: subjUrl('civic', '2am'), type: 'td' },
      { label: 'فروض واختبارات 2AM', url: 'https://www.dzexams.com/fr/2am/education-civique', type: 'exam' },
    ]},
    { level: '3AM', title: 'المشاركة المجتمعية', links: [
      { label: 'درس: الانتخابات', url: subjUrl('civic', '3am'), type: 'course' },
      { label: 'تمارين: المجتمع المدني', url: subjUrl('civic', '3am'), type: 'td' },
      { label: 'فروض واختبارات 3AM', url: 'https://www.dzexams.com/fr/3am/education-civique', type: 'exam' },
    ]},
    { level: '4AM', title: 'الهوية الوطنية — تحضير BEM', links: [
      { label: 'دروس 4AM تربية مدنية', url: subjUrl('civic', '4am'), type: 'course' },
      { label: 'BEM 2025 — Éducation Civique', url: 'https://www.dzexams.com/fr/bem/education-civique', type: 'exam' },
      { label: 'BEM 2024 — Éducation Civique', url: 'https://www.dzexams.com/fr/bem/education-civique', type: 'exam' },
      { label: 'BEM 2023 — Éducation Civique', url: 'https://www.dzexams.com/fr/bem/education-civique', type: 'exam' },
    ]},
    { level: '1AS', title: 'النظام السياسي الجزائري', links: [
      { label: 'درس: السلطات الثلاث', url: subjUrl('civic', '1as'), type: 'course' },
      { label: 'تمارين: الديمقراطية', url: subjUrl('civic', '1as'), type: 'td' },
    ]},
    { level: '2AS', title: 'القانون والعدالة', links: [
      { label: 'درس: القضاء الجزائري', url: subjUrl('civic', '2as'), type: 'course' },
      { label: 'تمارين: حقوق المتهم', url: subjUrl('civic', '2as'), type: 'td' },
    ]},
    { level: '3AS', title: 'المواطنة العالمية — BAC', links: [
      { label: 'درس: المنظمات الدولية', url: subjUrl('civic', '3as'), type: 'course' },
      { label: 'BAC 2025 — Éducation Civique', url: 'https://www.dzexams.com/fr/bac/education-civique', type: 'exam' },
      { label: 'BAC 2024 — Éducation Civique', url: 'https://www.dzexams.com/fr/bac/education-civique', type: 'exam' },
    ]},
  ],
};

const examSections = [
  { title: '📄 BEM — جميع المواد مع التصحيح', years: bemYears, url: 'https://www.dzexams.com/fr/bem', type: 'exam' },
  { title: '📄 BAC — جميع المواد مع التصحيح', years: bacYears, url: 'https://www.dzexams.com/fr/bac', type: 'exam' },
];

export function LessonsPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = [
    { key: 'all', label: 'All', icon: Filter },
    { key: 'course', label: 'Courses', icon: BookOpen },
    { key: 'exam', label: 'Exams', icon: FileText },
    { key: 'td', label: 'Exercises', icon: FileText },
  ];

  const filteredResources = useMemo(() => {
    if (!selectedSubject) return [];
    const resources = resourceData[selectedSubject] || [];
    return resources.filter(r => selectedLevel === 'all' || r.level === selectedLevel);
  }, [selectedSubject, selectedLevel]);

  return (
    <div className="min-h-full bg-background p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">📚 Lessons & Exams — Algeria</h1>
        <p className="text-sm text-muted-foreground mt-1">
          المنهاج الجزائري — 1AM → 4AM (BEM) → 1AS → 3AS (BAC) — جميع المواد مع التصحيح
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="https://www.dzexams.com/fr/bem" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-rose-500/20 to-rose-600/10 border border-rose-500/30 hover:border-rose-500/50 transition group">
          <FileText size={28} className="text-rose-400" />
          <div className="flex-1">
            <p className="font-bold text-foreground">BEM — Brevet d'Enseignement Moyen</p>
            <p className="text-xs text-muted-foreground">{bemYears.length} years · جميع المواد مع التصحيح</p>
          </div>
          <ExternalLink size={16} className="text-rose-400 opacity-0 group-hover:opacity-100 transition" />
        </a>
        <a href="https://www.dzexams.com/fr/bac" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-violet-500/20 to-violet-600/10 border border-violet-500/30 hover:border-violet-500/50 transition group">
          <FileText size={28} className="text-violet-400" />
          <div className="flex-1">
            <p className="font-bold text-foreground">BAC — Baccalauréat Algérien</p>
            <p className="text-xs text-muted-foreground">{bacYears.length} years · جميع المواد مع التصحيح</p>
          </div>
          <ExternalLink size={16} className="text-violet-400 opacity-0 group-hover:opacity-100 transition" />
        </a>
      </div>

      <div>
        <h2 className="text-sm font-bold text-foreground mb-3">Browse by Subject</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {subjects.map((subj) => {
            const Icon = subj.icon;
            const isSelected = selectedSubject === subj.id;
            return (
              <button key={subj.id} onClick={() => setSelectedSubject(isSelected ? null : subj.id)}
                className={`p-4 rounded-xl text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br ${subj.color} ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-105' : ''}`}>
                <Icon size={28} strokeWidth={1.5} className="mb-1.5" />
                <p className="font-semibold text-sm">{subj.name}</p>
                <p className="text-[10px] opacity-80 mt-1">{subj.ar}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:ring-1 focus:ring-primary transition" />
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-muted-foreground" />
          <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:ring-1 focus:ring-primary transition text-foreground">
            <option value="all">All Levels</option>
            {allLevels.map((l) => (<option key={l} value={l}>{l}</option>))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => {
          const Icon = f.icon;
          return (
            <button key={f.key} onClick={() => setResourceFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${resourceFilter === f.key ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              <Icon size={13} /> {f.label}
            </button>
          );
        })}
      </div>

      {!selectedSubject ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subj) => {
              const Icon = subj.icon;
              const res = resourceData[subj.id];
              const totalLinks = res.reduce((s, r) => s + r.links.length, 0);
              return (
                <button key={subj.id} onClick={() => setSelectedSubject(subj.id)}
                  className="rounded-xl border border-border bg-card p-5 hover:shadow-lg hover:border-primary/30 transition-all text-left group">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${subj.color} text-white mb-3`}>
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">{subj.name}</h3>
                  <p className="text-[11px] text-muted-foreground mb-1">{subj.ar}</p>
                  <p className="text-xs text-muted-foreground mb-3">{res.length} levels · {totalLinks} resources</p>
                  <div className="flex flex-wrap gap-1">
                    {allLevels.map((l) => (
                      <span key={l} className={`px-2 py-0.5 rounded text-[9px] font-semibold ${levelBadge[l]}`}>{l}</span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-base font-bold text-foreground mb-4">📄 All BEM & BAC Exams (2000–2025)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {examSections.map((sec) => (
                <a key={sec.title} href={sec.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition group border border-border">
                  <FileText size={20} className="text-rose-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{sec.title}</p>
                    <p className="text-[10px] text-muted-foreground">{sec.years.length} years of exams + corrections</p>
                  </div>
                  <ExternalLink size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition shrink-0" />
                </a>
              ))}
            </div>
            <details className="mt-3">
              <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition">View all BEM years →</summary>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {bemYears.map(y => (
                  <a key={y} href="https://www.dzexams.com/fr/bem" target="_blank" rel="noopener noreferrer"
                    className="px-2 py-1 text-[10px] rounded-md bg-rose-900/20 text-rose-300 hover:bg-rose-900/40 transition font-medium">
                    BEM {y}
                  </a>
                ))}
              </div>
            </details>
            <details className="mt-2">
              <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition">View all BAC years →</summary>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {bacYears.map(y => (
                  <a key={y} href="https://www.dzexams.com/fr/bac" target="_blank" rel="noopener noreferrer"
                    className="px-2 py-1 text-[10px] rounded-md bg-violet-900/20 text-violet-300 hover:bg-violet-900/40 transition font-medium">
                    BAC {y}
                  </a>
                ))}
              </div>
            </details>
          </div>
        </>
      ) : (
        <div>
          <button onClick={() => setSelectedSubject(null)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition">
            <ChevronRight size={16} /> Back to all subjects
          </button>

          {(() => {
            const subj = subjects.find(s => s.id === selectedSubject)!;
            const Icon = subj.icon;
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${subj.color} text-white`}>
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{subj.name}</h2>
                    <p className="text-xs text-muted-foreground">{subj.ar} · {filteredResources.length} levels</p>
                  </div>
                </div>

                {filteredResources.map((levelRes) => {
                  const filteredLinks = levelRes.links.filter(l => {
                    if (resourceFilter !== 'all' && l.type !== resourceFilter) return false;
                    if (searchQuery && !l.label.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                    return true;
                  });
                  if (filteredLinks.length === 0) return null;
                  return (
                  <div key={levelRes.level} className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border-b border-border">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${levelBadge[levelRes.level]}`}>{levelRes.level}</span>
                        <h3 className="text-sm font-bold text-foreground">{levelRes.title}</h3>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{filteredLinks.length} resources</span>
                    </div>
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {filteredLinks.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition hover:shadow-sm ${linkTypes[link.type] || 'bg-secondary text-foreground'}`}>
                          <ExternalLink size={12} />
                          <span className="flex-1 truncate">{link.label}</span>
                          <span className="text-[9px] opacity-70 uppercase font-bold">{link.type}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
