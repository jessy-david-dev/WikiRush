// GET /api/rooms/[code]/stream - SSE : pousse l'état de la room en temps réel
// Le client s'abonne une seule fois ; chaque saveRoom publie sur Redis et notifie ici.

import { NextRequest } from "next/server";
import { createSubscriber, roomChannel } from "../../../../../lib/redis";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const channel = roomChannel(code.toUpperCase());

  const sub = createSubscriber();

  const stream = new ReadableStream({
    start(controller) {
      const encode = (data: string) =>
        new TextEncoder().encode(`data: ${data}\n\n`);

      // Ping toutes les 25s pour garder la connexion alive (proxys/Coolify)
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(": ping\n\n"));
        } catch {
          clearInterval(keepAlive);
        }
      }, 25_000);

      sub.subscribe(channel, (err) => {
        if (err) {
          controller.close();
          clearInterval(keepAlive);
          sub.disconnect();
        }
      });

      sub.on("message", (_chan: string, message: string) => {
        try {
          controller.enqueue(encode(message));
        } catch {
          // Client déconnecté
        }
      });

      sub.on("error", () => {
        clearInterval(keepAlive);
        try {
          controller.close();
        } catch {
          /* déjà fermé */
        }
        sub.disconnect();
      });
    },
    cancel() {
      sub.unsubscribe(channel);
      sub.disconnect();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // désactive le buffering nginx/Coolify
    },
  });
}
