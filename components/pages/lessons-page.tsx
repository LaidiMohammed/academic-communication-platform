'use client';

import { useState, useMemo } from 'react';
import {
  Calculator, BookOpen, Atom, FlaskConical, Landmark, Dna,
  Search, Filter, ExternalLink, ChevronRight, FileText, Play,
  Languages, Shield,
} from 'lucide-react';
import type { ResourceType, LinkItem, LevelRes } from '@/lib/lessons-types';
import {
  subjects as subjectData, allLevels, resourceData, levelBadge,
  linkTypes, linkLabels, examSections, bemYears, bacYears, iconMap,
} from '@/lib/lessons-content';

const iconComponents: Record<string, React.ElementType> = {
  Calculator, Atom, FlaskConical, BookOpen, Landmark, Dna, Languages, Shield,
};

const resourceTypeIcons: Record<string, React.ElementType> = {
  course: BookOpen,
  exam: FileText,
  td: FileText,
  tp: FileText,
  video: Play,
  pdf: FileText,
};

export function LessonsPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterDefs = [
    { key: 'all', label: 'All', icon: Filter },
    { key: 'course', label: linkLabels.course, icon: BookOpen },
    { key: 'exam', label: linkLabels.exam, icon: FileText },
    { key: 'td', label: linkLabels.td, icon: FileText },
    { key: 'video', label: linkLabels.video, icon: Play },
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
          {subjectData.map((subj) => {
            const Icon = iconComponents[subj.icon];
            const isSelected = selectedSubject === subj.id;
            return (
              <button key={subj.id} onClick={() => setSelectedSubject(isSelected ? null : subj.id)}
                className={`p-4 rounded-xl text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br ${subj.color} ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-105' : ''}`}>
                {Icon ? <Icon size={28} strokeWidth={1.5} className="mb-1.5" /> : <span className="text-2xl mb-1.5 block">{iconMap[subj.icon]}</span>}
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
        {filterDefs.map((f) => {
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
            {subjectData.map((subj) => {
              const Icon = iconComponents[subj.icon];
              const res = resourceData[subj.id];
              const totalLinks = res ? res.reduce((s: number, r: LevelRes) => s + r.links.length, 0) : 0;
              return (
                <button key={subj.id} onClick={() => setSelectedSubject(subj.id)}
                  className="rounded-xl border border-border bg-card p-5 hover:shadow-lg hover:border-primary/30 transition-all text-left group">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${subj.color} text-white mb-3`}>
                    {Icon ? <Icon size={24} strokeWidth={1.5} /> : <span className="text-xl">{iconMap[subj.icon]}</span>}
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">{subj.name}</h3>
                  <p className="text-[11px] text-muted-foreground mb-1">{subj.ar}</p>
                  <p className="text-xs text-muted-foreground mb-3">{res ? res.length : 0} levels · {totalLinks} resources</p>
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
            const subj = subjectData.find(s => s.id === selectedSubject)!;
            const Icon = iconComponents[subj.icon];
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${subj.color} text-white`}>
                    {Icon ? <Icon size={20} strokeWidth={1.5} /> : <span className="text-lg">{iconMap[subj.icon]}</span>}
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
                      {filteredLinks.map((link, i) => {
                        const TypeIcon = resourceTypeIcons[link.type] || ExternalLink;
                        return (
                          <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition hover:shadow-sm ${linkTypes[link.type] || 'bg-secondary text-foreground'}`}>
                            <TypeIcon size={14} />
                            <span className="flex-1 truncate">{link.label}</span>
                            <span className="text-[9px] opacity-70 uppercase font-bold whitespace-nowrap">{linkLabels[link.type] || link.type}</span>
                          </a>
                        );
                      })}
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
