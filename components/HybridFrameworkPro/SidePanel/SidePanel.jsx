// components/HybridFrameworkPro/SidePanel/SidePanel.jsx
import { X } from 'lucide-react';
import CommentsPanel from '../CommentsPanel';

function Section({ title, dotClass, children }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        {dotClass && <span className={`inline-block h-2 w-2 rounded-full ${dotClass}`} />}
        <h4 className="uppercase tracking-widest text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
          {title}
        </h4>
      </div>
      <div className="grid grid-cols-1 gap-1 text-sm text-neutral-700 dark:text-neutral-300">
        {children}
      </div>
    </section>
  );
}

function KeyVal({ k, v }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-32 text-neutral-400 uppercase tracking-widest text-[10px]">{k}</div>
      <div className="text-neutral-700 dark:text-neutral-300">{v}</div>
    </div>
  );
}

export default function SidePanel({
  onClose,
  moment,
  personasIndex,
  onEdit,
  onDelete,
  commentsMap,
  onAddComment,
  onDeleteComment,
  currentUser,
  presentMode,
  stages = [],
  viewMode = 'journey',          // ✅ NEW
  visibleLanes = {},             // ✅ NEW
}) {
  // Resolve full stage title for this moment (fallbacks to moment.stage or key)
  const stageKey = moment.stageKey || moment.stage;
  const resolvedStage = (stages || []).find((s) => s.key === stageKey);
  const stageTitle =
    (resolvedStage && (resolvedStage.title || resolvedStage.label)) ||
    (typeof moment.stage === 'string' ? moment.stage : stageKey) ||
    '—';

  // Perspective gating
  const inLens = viewMode === 'lens';
  const vis = {
    experience: true,
    ai: true,
    behaviour: true,
    governance: true,
    ...(visibleLanes || {}),
  };

  const showExperience = !inLens || !!vis.experience;
  const showAI         = !inLens || !!vis.ai;
  const showBehaviour  = !inLens || !!vis.behaviour;
  const showGovernance = !inLens || !!vis.governance;

  // If in Lens view and nothing is selected, show a gentle hint
  const nothingVisibleInLens =
    inLens &&
    !vis.experience &&
    !vis.ai &&
    !vis.behaviour &&
    !vis.governance;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] md:w-[560px] bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 z-40 shadow-xl">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="text-xs uppercase tracking-widest text-neutral-500">Moment Details</div>
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Toolbar (hidden in Present mode) */}
      {!presentMode && (
        <div className="p-2 flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => onEdit?.(moment)}
            className="px-3 py-1.5 text-xs rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete?.(moment)}
            className="px-3 py-1.5 text-xs rounded-md border border-rose-300 text-rose-600 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            Delete
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-6 overflow-y-auto h=[calc(100%-6rem)]">
        <header>
          <div className="text-[10px] uppercase tracking-widest text-neutral-400">{stageTitle}</div>
          <h3 className="text-xl font-semibold mt-1">{moment.title}</h3>
          {moment.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">{moment.description}</p>
          )}
        </header>

        {nothingVisibleInLens && (
          <div className="text-xs text-neutral-500">
            No perspectives selected. Toggle one or more in the Perspectives bar to view details here.
          </div>
        )}

        {/* Value & Experience */}
        {showExperience && moment.experience && (
          <Section title="Value & Experience" dotClass="bg-emerald-500">
            {moment.experience.personas?.length > 0 && (
              <KeyVal k="Personas" v={moment.experience.personas.join(', ')} />
            )}
            {moment.experience.jobsToBeDone?.length > 0 && (
              <KeyVal k="Jobs" v={moment.experience.jobsToBeDone.join('; ')} />
            )}
            {moment.experience.momentsOfTruth?.length > 0 && (
              <KeyVal k="Moments of Truth" v={moment.experience.momentsOfTruth.join(' • ')} />
            )}
            {moment.experience.artefacts?.length > 0 && (
              <KeyVal k="Artefacts" v={moment.experience.artefacts.join(', ')} />
            )}
          </Section>
        )}

        {/* AI & Data */}
        {showAI && moment.ai && (
          <Section title="AI & Data" dotClass="bg-sky-500">
            {moment.ai.signals?.length > 0 && <KeyVal k="Signals" v={moment.ai.signals.join(', ')} />}
            {moment.ai.models?.length > 0 && <KeyVal k="Models" v={moment.ai.models.join(', ')} />}
            {moment.ai.automations?.length > 0 && (
              <KeyVal k="Automations" v={moment.ai.automations.join(', ')} />
            )}
            {moment.ai.risks?.length > 0 && <KeyVal k="Risks" v={moment.ai.risks.join(', ')} />}
          </Section>
        )}

        {/* Behavioural Adoption */}
        {showBehaviour && moment.behaviour && (
          <Section title="Behavioural Adoption" dotClass="bg-amber-500">
            {moment.behaviour.barriers?.length > 0 && (
              <KeyVal k="Barriers" v={moment.behaviour.barriers.join(', ')} />
            )}
            {moment.behaviour.nudges?.length > 0 && (
              <KeyVal k="Nudges" v={moment.behaviour.nudges.join(', ')} />
            )}
            {moment.behaviour.frameworks?.length > 0 && (
              <KeyVal k="Frameworks" v={moment.behaviour.frameworks.join(', ')} />
            )}
            {moment.behaviour.habit && <KeyVal k="Habit" v={moment.behaviour.habit} />}
          </Section>
        )}

        {/* Governance & Risk */}
        {showGovernance && moment.governance && (
          <Section title="Governance & Risk" dotClass="bg-rose-500">
            {moment.governance.checks?.length > 0 && (
              <KeyVal k="Checks" v={moment.governance.checks.join(', ')} />
            )}
            {moment.governance.metrics?.length > 0 && (
              <KeyVal k="Metrics" v={moment.governance.metrics.join(', ')} />
            )}
          </Section>
        )}

        {/* Comments (hidden in Present mode) */}
        {!presentMode && (
          <CommentsPanel
            momentId={moment.id}
            dataComments={commentsMap}
            onAdd={(text) => onAddComment?.(moment.id, text)}
            onDelete={(cid) => onDeleteComment?.(moment.id, cid)}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  );
}
