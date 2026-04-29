import { prisma } from "@repo/db/client";

async function main() {
  const clips = await prisma.editorClip.findMany({ take: 5, orderBy: { timelineStartMs: 'asc' } });
  console.log(JSON.stringify(clips, null, 2));
}
main().catch(console.error);
