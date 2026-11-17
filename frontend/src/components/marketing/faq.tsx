import { MARKETING_COPY } from '@/constants/copy/marketing';

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: MARKETING_COPY.FAQ.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export function Faq() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10">
      <h2 className="text-2xl font-semibold">{MARKETING_COPY.FAQ_TITLE}</h2>
      <div className="mt-6 flex flex-col gap-2">
        {MARKETING_COPY.FAQ.map((item) => (
          <details key={item.question} className="rounded-lg border px-4 py-1">
            <summary className="flex min-h-10 cursor-pointer items-center font-medium">
              {item.question}
            </summary>
            <p className="text-muted-foreground pb-3 text-sm">{item.answer}</p>
          </details>
        ))}
      </div>
      {/* JSON-LD is built from copy constants, not from anything a visitor typed. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </section>
  );
}
