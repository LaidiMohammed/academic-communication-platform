'use client';

import { useState } from 'react';
import { FileText, Loader2, AlertCircle, CheckCircle2, Download } from 'lucide-react';

interface ReportOption {
  id: string;
  label: string;
}

interface AdminReportGeneratorProps {
  tiers: ReportOption[];
  modules: string[];
  onGenerateComplete?: (reportId: string) => void;
}

export function AdminReportGenerator({
  tiers = [],
  modules = [],
  onGenerateComplete,
}: AdminReportGeneratorProps) {
  const [selectedTier, setSelectedTier] = useState<string>(tiers[0]?.id || '');
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set(modules.slice(0, 3)));
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  const toggleModule = (moduleId: string) => {
    const newSet = new Set(selectedModules);
    if (newSet.has(moduleId)) {
      newSet.delete(moduleId);
    } else {
      newSet.add(moduleId);
    }
    setSelectedModules(newSet);
  };

  const handleGenerateReport = async () => {
    if (!selectedTier || selectedModules.size === 0) {
      setMessage({ type: 'error', text: 'Please select tier and at least one module' });
      return;
    }

    setIsGenerating(true);
    setMessage(null);
    setDownloadUrl('');

    try {
      const res = await fetch('/api/admin/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(window as any).__auth_token}`,
        },
        body: JSON.stringify({
          tier: selectedTier,
          modules: Array.from(selectedModules),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Report generation failed' });
        return;
      }

      setDownloadUrl(data.downloadUrl);
      setMessage({ type: 'success', text: 'Report generated successfully' });
      onGenerateComplete?.(data.reportId);

      // Auto-download if link provided
      if (data.downloadUrl) {
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = data.downloadUrl;
          a.download = `report_${selectedTier}_${Date.now()}.pdf`;
          a.click();
        }, 500);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-card border border-border rounded-2xl">
      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
        <FileText size={20} />
        PDF Report Generator
      </h3>

      {/* Tier Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground">Academic Tier</label>
        <select
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value)}
          disabled={isGenerating}
          className="px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary transition disabled:opacity-50"
        >
          {tiers.map(tier => (
            <option key={tier.id} value={tier.id}>{tier.label}</option>
          ))}
        </select>
      </div>

      {/* Module Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground mb-1">Modules (Select Multiple)</label>
        <div className="grid grid-cols-2 gap-2">
          {modules.map(module => (
            <label key={module} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedModules.has(module)}
                onChange={() => toggleModule(module)}
                disabled={isGenerating}
                className="w-4 h-4 rounded border-border bg-secondary border cursor-pointer disabled:opacity-50"
              />
              <span className="text-sm text-foreground">{module}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Report Info */}
      <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Report Contents</p>
        <ul className="space-y-1 text-xs text-foreground">
          <li>• Student Full Name</li>
          <li>• Age (calculated from DOB)</li>
          <li>• Global Status (Active/Inactive)</li>
          <li>• Remaining Sessions per Module</li>
          <li>• Generated Timestamp</li>
        </ul>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerateReport}
        disabled={isGenerating || !selectedTier || selectedModules.size === 0}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Generating Report...
          </>
        ) : (
          <>
            <FileText size={18} />
            Generate PDF Report
          </>
        )}
      </button>

      {/* Message Display */}
      {message && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-green-500/10 border border-green-500/30 text-green-600'
            : 'bg-destructive/10 border border-destructive/30 text-destructive'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 size={16} className="shrink-0" />
          ) : (
            <AlertCircle size={16} className="shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* Download Button (if PDF was generated) */}
      {downloadUrl && (
        <a
          href={downloadUrl}
          download
          className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-foreground font-semibold rounded-lg hover:bg-secondary/80 transition border border-border"
        >
          <Download size={16} />
          Download PDF
        </a>
      )}
    </div>
  );
}
