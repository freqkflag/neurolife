import { CapacityBattery } from '@neurolife/design-system';
import { SafeToSpendCard } from '@/components/SafeToSpendCard';
import { SpecialistAIWorkspace } from '@/components/SpecialistAIWorkspace';
import { TinyNextActionCard } from '@neurolife/design-system';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Command Center</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <CapacityBattery score={50} />
        <SafeToSpendCard
          safeToSpend={0}
          currentBalance={0}
          budgetRiskLevel="LOW"
          tinyNextAction="Set your current balance in Budget."
          summary="Connect your account to see safe-to-spend."
        />
        <TinyNextActionCard action="Check one bill or appointment today." />
        <div
          className="rounded-xl border p-4"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Body need
          </p>
          <p className="mt-1">Have you had water today?</p>
        </div>
      </div>
      <div className="mt-8">
        <SpecialistAIWorkspace />
      </div>
    </div>
  );
}
