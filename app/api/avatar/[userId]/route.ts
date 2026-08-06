import { getCurrentUser } from "@/lib/dal/context";
import { getAvatar } from "@/lib/dal/profile";

// Serve a user's avatar bytes. Auth required (avatars are shown inside the app);
// the URL is cache-busted via ?v= on update, so responses can cache long.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const me = await getCurrentUser();
  if (!me) return new Response(null, { status: 404 });

  const { userId } = await params;
  const avatar = await getAvatar(userId);
  if (!avatar) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(avatar.data), {
    headers: {
      "Content-Type": avatar.mime,
      "Cache-Control": "private, max-age=86400",
      "Content-Length": String(avatar.data.length),
    },
  });
}
