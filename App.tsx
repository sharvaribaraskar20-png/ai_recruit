import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { JobDescription } from './types/job';
import { Candidate } from './types/candidate';
import { PipelineRun } from './types/agent';
import { DEFAULT_JOB_DESCRIPTION } from './data/defaultJob';
import { DEFAULT_CANDIDATES } from './data/defaultCandidates';
import { AgentOrchestrator } from './agents/AgentOrchestrator';
import { ExportService } from './services/exportService';

// Components
import { Navbar, ActiveTab } from './components/layout/Navbar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { JobAnalysisView } from './components/job/JobAnalysisView';
import { PipelineVisualizerView } from './components/pipeline/PipelineVisualizerView';
import { CandidateShortlistView } from './components/shortlist/CandidateShortlistView';
import { KeywordVsEvidenceExplorer } from './components/signature/KeywordVsEvidenceExplorer';
import { InterviewIntelligenceView } from './components/interview/InterviewIntelligenceView';
import { CandidateDetailModal } from './components/candidate-detail/CandidateDetailModal';
import { CandidateComparisonModal } from './components/comparison/CandidateComparisonModal';
import { CreateProjectModal } from './components/upload/CreateProjectModal';

export function App() {
  const [job, setJob] = useState<JobDescription>(DEFAULT_JOB_DESCRIPTION);
  const [candidates, setCandidates] = useState<Candidate[]>(DEFAULT_CANDIDATES);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals & Inspection State
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [compareCandidates, setCompareCandidates] = useState<Candidate[] | null>(null);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  // Pipeline Run State
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [pipelineRun, setPipelineRun] = useState<PipelineRun>({
    id: 'run-init',
    jobId: DEFAULT_JOB_DESCRIPTION.id,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    status: 'completed',
    totalCandidates: DEFAULT_CANDIDATES.length,
    processedCandidates: DEFAULT_CANDIDATES.length,
    agents: {
      jd_analysis: {
        id: 'jd_analysis',
        name: 'JD Analysis Agent',
        role: 'Job Description Intelligence',
        description: 'Parses job specifications, separates Must-Haves vs Nice-to-Haves, assigns criticality weights, and flags ambiguities.',
        icon: 'FileText',
        status: 'completed',
        progress: 100,
        durationMs: 410,
        logs: [
          { id: '1', timestamp: '12:00:01', level: 'info', message: 'Loaded target JD: Senior Backend & Distributed Systems Engineer' },
          { id: '2', timestamp: '12:00:02', level: 'accent', message: 'Extracted 5 Must-Haves, 3 Nice-to-Haves, 2 Contextual requirements' },
          { id: '3', timestamp: '12:00:02', level: 'warn', message: 'Identified 2 ambiguous clauses regarding role scope and frameworks' }
        ],
        summary: 'Extracted 10 requirements and 2 ambiguity alerts.'
      },
      resume_parsing: {
        id: 'resume_parsing',
        name: 'Resume Intelligence Agent',
        role: 'Document & Career Parsing',
        description: 'Extracts structured candidate data, career history, achievements, metrics, education, and dates from raw documents.',
        icon: 'UserCheck',
        status: 'completed',
        progress: 100,
        durationMs: 520,
        logs: [
          { id: '4', timestamp: '12:00:03', level: 'info', message: 'Parsed structured candidate profiles across 8 test cohorts' },
          { id: '5', timestamp: '12:00:03', level: 'accent', message: 'Extracted career timelines, tenures, and measurable achievement metrics' }
        ],
        summary: 'Parsed 8 candidates and cataloged 18 enterprise positions.'
      },
      skill_normalization: {
        id: 'skill_normalization',
        name: 'Skill Normalization Agent',
        role: 'Taxonomy & Entity Resolution',
        description: 'Resolves technological aliases (e.g. PostgreSQL → Postgres, Amazon Web Services → AWS) while preventing false merges.',
        icon: 'GitMerge',
        status: 'completed',
        progress: 100,
        durationMs: 380,
        logs: [
          { id: '6', timestamp: '12:00:04', level: 'info', message: 'Resolved technological aliases to canonical taxonomy' },
          { id: '7', timestamp: '12:00:04', level: 'accent', message: 'Enforced strict boundaries: Java ≠ JavaScript, Apache Kafka ≠ RabbitMQ' }
        ],
        summary: 'Normalized 142 tokens with zero false merges.'
      },
      evidence_extraction: {
        id: 'evidence_extraction',
        name: 'Evidence Extraction Agent',
        role: 'Empirical Proof & Verification',
        description: 'Scrutinizes resume text to classify proof into 5 distinct tiers (Achievement, Professional, Project, Skills Section, Mentioned Only).',
        icon: 'SearchCheck',
        status: 'completed',
        progress: 100,
        durationMs: 640,
        logs: [
          { id: '8', timestamp: '12:00:05', level: 'info', message: 'Audited all candidate skill claims into 5 empirical evidence tiers' },
          { id: '9', timestamp: '12:00:05', level: 'accent', message: 'Classified 18 measurable achievements vs 42 ungrounded skill list items' }
        ],
        summary: 'Audited 100% of skills against employment citations.'
      },
      candidate_matching: {
        id: 'candidate_matching',
        name: 'Matching Agent',
        role: 'Requirement-Evidence Verification',
        description: 'Evaluates candidate empirical evidence against every JD requirement, classifying matches into 6 distinct validation tiers.',
        icon: 'Layers',
        status: 'completed',
        progress: 100,
        durationMs: 510,
        logs: [
          { id: '10', timestamp: '12:00:06', level: 'info', message: 'Matched candidate evidence against each JD requirement' },
          { id: '11', timestamp: '12:00:06', level: 'accent', message: 'Classified Strong, Partial, Weak, and No Evidence statuses' }
        ],
        summary: 'Evaluated 80 requirement match pairs.'
      },
      noise_detection: {
        id: 'noise_detection',
        name: 'Noise Detection Agent',
        role: 'Keyword Inflation & Risk Analysis',
        description: 'Detects keyword stuffing, unsubstantiated skill lists, and buzzword density using neutral, empirical diagnostic language.',
        icon: 'ShieldAlert',
        status: 'completed',
        progress: 100,
        durationMs: 490,
        logs: [
          { id: '12', timestamp: '12:00:07', level: 'info', message: 'Scanned candidate documents for keyword stuffing and ungrounded skill dumps' },
          { id: '13', timestamp: '12:00:07', level: 'warn', message: 'Flagged Kevin Vance for high keyword inflation (-42% score discrepancy)' },
          { id: '14', timestamp: '12:00:07', level: 'warn', message: 'Flagged Jason Miller for 70% ungrounded skill claims' }
        ],
        summary: 'Identified 2 high-noise profiles and formulated neutral diagnostics.'
      },
      shortlist_generation: {
        id: 'shortlist_generation',
        name: 'Shortlist Agent',
        role: 'Evidence-Backed Ranking & Explainability',
        description: 'Synthesizes transparent multi-factor evidence scoring, penalizes ungrounded keyword stuffing, and builds grounded interview questions.',
        icon: 'Award',
        status: 'completed',
        progress: 100,
        durationMs: 580,
        logs: [
          { id: '15', timestamp: '12:00:08', level: 'info', message: 'Synthesized multi-factor evidence scores and explainable rationale' },
          { id: '16', timestamp: '12:00:08', level: 'success', message: 'Generated explainable shortlist and personalized interview rubrics' }
        ],
        summary: 'Generated shortlist with 4 recommended candidates.'
      }
    },
    systemLog: []
  });

  // Orchestrate the 7-agent pipeline
  const handleRunPipeline = async (speed: 'normal' | 'fast' = 'normal') => {
    setIsPipelineRunning(true);
    setActiveTab('pipeline');

    try {
      const { run, analyzedCandidates } = await AgentOrchestrator.executePipeline(
        job,
        candidates,
        (updatedRun) => setPipelineRun(updatedRun),
        speed
      );

      setPipelineRun(run);
      setCandidates(analyzedCandidates);

      // Trigger celebratory confetti on completion
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Pipeline execution error:', err);
    } finally {
      setIsPipelineRunning(false);
    }
  };

  const handleProjectCreated = (newJob: JobDescription, newCandidates: Candidate[]) => {
    setJob(newJob);
    setCandidates(newCandidates);
    setActiveTab('dashboard');
  };

  const handleExportData = () => {
    ExportService.exportToCsv(job, candidates);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
        onRunPipeline={() => handleRunPipeline('normal')}
        onExport={handleExportData}
        candidateCount={candidates.length}
        isPipelineRunning={isPipelineRunning}
        activeJobTitle={job.title}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            candidates={candidates}
            job={job}
            onNavigateTab={setActiveTab}
            onSelectCandidate={setSelectedCandidate}
            onRunPipeline={() => handleRunPipeline('normal')}
          />
        )}

        {activeTab === 'job_analysis' && (
          <JobAnalysisView job={job} />
        )}

        {activeTab === 'pipeline' && (
          <PipelineVisualizerView
            pipelineRun={pipelineRun}
            onRerunPipeline={handleRunPipeline}
            isPipelineRunning={isPipelineRunning}
          />
        )}

        {activeTab === 'shortlist' && (
          <CandidateShortlistView
            candidates={candidates}
            job={job}
            onSelectCandidate={setSelectedCandidate}
            onCompareCandidates={setCompareCandidates}
            onOpenInterviewPrep={(c) => {
              setSelectedCandidate(c);
            }}
          />
        )}

        {activeTab === 'signature_explorer' && (
          <KeywordVsEvidenceExplorer
            candidates={candidates}
            job={job}
            onSelectCandidate={setSelectedCandidate}
          />
        )}

        {activeTab === 'interview_intelligence' && (
          <InterviewIntelligenceView
            candidates={candidates}
            job={job}
            onSelectCandidate={setSelectedCandidate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/70 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-300">RecruitIQ</span>
            <span>&bull;</span>
            <span>Evidence-Based AI Recruitment Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Core Principle: Never rank candidates merely by keyword count</span>
          </div>
        </div>
      </footer>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          job={job}
          onClose={() => setSelectedCandidate(null)}
          onOpenInterviewPrep={() => {}}
        />
      )}

      {/* Multi-Candidate Comparison Modal */}
      {compareCandidates && (
        <CandidateComparisonModal
          candidates={compareCandidates}
          job={job}
          onClose={() => setCompareCandidates(null)}
          onSelectCandidate={(c) => {
            setCompareCandidates(null);
            setSelectedCandidate(c);
          }}
        />
      )}

      {/* Create New Project / Upload Wizard Modal */}
      {isNewProjectOpen && (
        <CreateProjectModal
          onClose={() => setIsNewProjectOpen(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
}

export default App;
