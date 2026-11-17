import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MARKETING_COPY } from '@/constants/copy/marketing';

export function Features() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10">
      <h2 className="text-2xl font-semibold">{MARKETING_COPY.FEATURES_TITLE}</h2>
      <p className="text-muted-foreground mt-2 max-w-2xl">{MARKETING_COPY.FEATURES_INTRO}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {MARKETING_COPY.FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
