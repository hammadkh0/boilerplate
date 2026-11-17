import { MARKETING_COPY } from '@/constants/copy/marketing';

export function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10">
      <h2 className="text-2xl font-semibold">{MARKETING_COPY.HOW_TITLE}</h2>
      <ol className="mt-6 grid gap-4 md:grid-cols-3">
        {MARKETING_COPY.HOW_STEPS.map((step, index) => (
          <li key={step.title} className="rounded-xl border p-4">
            <p className="text-primary text-sm font-medium">{index + 1}</p>
            <h3 className="mt-2 font-medium">{step.title}</h3>
            <p className="text-muted-foreground mt-1 text-sm">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
