import { siteConfig } from '@/config/site.config';
import { MARKETING_COPY } from '@/constants/copy/marketing';

type LegalSection = {
  title: string;
  body: string;
};

export function LegalPage({
  title,
  intro,
  contactLead,
  sections,
}: {
  title: string;
  intro: string;
  contactLead: string;
  sections: readonly LegalSection[];
}) {
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <p className="text-muted-foreground text-sm">{MARKETING_COPY.LEGAL_TEMPLATE}</p>
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="text-muted-foreground text-sm">
        {MARKETING_COPY.LEGAL_UPDATED(siteConfig.legalUpdatedLabel)}
      </p>
      <p>{intro}</p>
      {sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-2">
          <h2 className="text-xl font-medium">{section.title}</h2>
          <p className="text-muted-foreground">{section.body}</p>
        </section>
      ))}
      <p>
        {contactLead}{' '}
        <a
          className="text-primary underline-offset-4 hover:underline"
          href={`mailto:${siteConfig.contactEmail}`}
        >
          {siteConfig.contactEmail}
        </a>
      </p>
    </article>
  );
}
