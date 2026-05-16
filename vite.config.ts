import type { IncomingMessage, ServerResponse } from "node:http";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

function readJsonBody(req: IncomingMessage) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf-8");
        resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, payload: unknown) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function getLastSentence(chatText: string) {
  const lines = chatText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const lastLine = lines[lines.length - 1] ?? "没事，你忙吧。";
  return lastLine.replace(/^[^:：]{0,8}[:：]\s*/, "").trim() || lastLine;
}

function createDevApiPlugin(): Plugin {
  const handler = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url || req.method !== "POST") {
      next();
      return;
    }

    if (req.url === "/api/love-translate") {
      const body = await readJsonBody(req);
      const chatText = String(body.chatText ?? "");
      const context = (body.context ?? {}) as Record<string, unknown>;
      const fearType = String(context.fearType ?? "害怕说真话");
      const original = getLastSentence(chatText);

      const toneMap: Record<string, string> = {
        害怕被抛下: "我不是不在意，我是在担心一旦开口，你会更快离开。",
        害怕被控制: "我不是都可以，我只是不想一表达就被推着走。",
        害怕说真话: "我不是没感觉，只是还没准备好把受伤直接说出口。",
      };

      sendJson(res, {
        original,
        possibleMeaning: toneMap[fearType] ?? toneMap["害怕说真话"],
        sharpTranslation: `真正想说的是：${toneMap[fearType] ?? toneMap["害怕说真话"]}`,
        betterExpression: "这件事让我有点不舒服，我想把真实感受和期待直接告诉你，而不是让你猜。",
        actionAdvice: "先说事实，再说情绪和期待，能减少关系里的误读和试探。",
      });
      return;
    }

    if (req.url === "/api/share-line") {
      const body = await readJsonBody(req);
      const endingType = String(body.endingType ?? "梦醒翻译家");
      const lineMap: Record<string, string> = {
        草稿幽灵: "你删掉的话，比你发出去的更诚实。",
        反话感染者: "最伤人的不是冷淡，是把在意伪装成没事。",
        梦醒翻译家: "通关之后，你终于肯把情绪翻译成人话。",
      };

      sendJson(res, {
        shareLine: lineMap[endingType] ?? "你没有输给关系，你只是输给了那句没说出口的话。",
      });
      return;
    }

    next();
  };

  return {
    name: "ta-say-dev-api",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void handler(req, res, next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        void handler(req, res, next);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), createDevApiPlugin()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.ts",
  },
});
