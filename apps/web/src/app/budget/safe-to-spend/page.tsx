import { SafeToSpendCard } from '@/components/SafeToSpendCard';

export default function SafeToSpendPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Safe to Spend</h1>
      <SafeToSpendCard
        safeToSpend={0}
        currentBalance={0}
        budgetRiskLevel="LOW"
        tinyNextAction="Add your bills to calculate safe-to-spend."
        summary="Protect rent, food, utilities, phone, pets, transport, and meds first."
      />
    </div>
  );
}
