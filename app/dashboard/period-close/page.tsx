// app/dashboard/period-close/page.tsx
import PeriodCloseForm from '@/app/ui/period-close/period-close-form';

export default function PeriodClosePage() {
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Period Close Settings</h1>
      </div>
      <PeriodCloseForm />
    </div>
  );
}
