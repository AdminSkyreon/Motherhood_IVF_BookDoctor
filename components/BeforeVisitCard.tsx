import { FileText, IdCard, Plus } from "lucide-react";

const ITEMS = [
  { icon: FileText, label: "Past Reports" },
  { icon: IdCard, label: "Photo ID" },
  { icon: Plus, label: "Medications" },
];

export function BeforeVisitCard() {
  return (
    <section className="rounded-[1.25rem] border border-line bg-white px-4 pb-4 pt-4 shadow-card" aria-labelledby="before-visit">
      <h2 id="before-visit" className="flex items-center gap-2 text-[0.9375rem] font-bold text-navy">
        <span className="h-2 w-2 rounded-full bg-brand" aria-hidden />
        Before your visit
      </h2>
      <p className="mt-2 border-b border-line pb-3 text-[0.875rem] leading-relaxed text-ink/80">
        Please bring any previous reports and scans, a list of medicines you take, and a photo ID. Arrive 15 minutes
        early for registration.
      </p>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {ITEMS.map(({ icon: Icon, label }) => (
          <li key={label} className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 px-2 py-3 text-[0.75rem] font-medium text-navy">
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
