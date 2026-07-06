import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { EditForm } from "./edit-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect(`/login?callbackUrl=/edit/${id}`);

  const [prompt] = await db
    .select()
    .from(prompts)
    .where(eq(prompts.id, id))
    .limit(1);

  if (!prompt) notFound();

  if (prompt.creatorId !== session.user.id && session.user.role !== "admin") {
    redirect("/dashboard/prompts");
  }

  return (
    <EditForm
      promptId={id}
      initial={{
        title: prompt.title,
        subtitle: prompt.subtitle,
        description: prompt.description,
        category: prompt.category,
        fullContent: prompt.fullContent,
        previewContent: prompt.previewContent,
        difficulty: prompt.difficulty,
        modelSupport: prompt.modelSupport ?? [],
        pricingType: prompt.pricingType,
        priceCents: prompt.priceCents,
        minPriceCents: prompt.minPriceCents,
        slug: prompt.slug,
        seoTitle: prompt.seoTitle,
        seoDescription: prompt.seoDescription,
        coverImageUrl: prompt.coverImageUrl,
        demoOutputUrl: prompt.demoOutputUrl,
        useCases: prompt.useCases ?? [],
      }}
    />
  );
}
