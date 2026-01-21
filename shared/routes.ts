import { z } from 'zod';
import { insertGameScoreSchema, insertScamReportSchema, gameScores, scamReports, detectionHistory } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  game: {
    submitScore: {
      method: 'POST' as const,
      path: '/api/game/score',
      input: insertGameScoreSchema,
      responses: {
        201: z.custom<typeof gameScores.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    getLeaderboard: {
      method: 'GET' as const,
      path: '/api/game/leaderboard',
      responses: {
        200: z.array(z.custom<typeof gameScores.$inferSelect>()),
      },
    },
  },
  radar: {
    submitReport: {
      method: 'POST' as const,
      path: '/api/radar/report',
      input: insertScamReportSchema,
      responses: {
        201: z.custom<typeof scamReports.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    getStats: {
      method: 'GET' as const,
      path: '/api/radar/stats',
      responses: {
        200: z.object({
          scamTypes: z.array(z.object({ type: z.string(), count: z.number() })),
          recentReports: z.array(z.custom<typeof scamReports.$inferSelect>()),
        }),
      },
    },
  },
  detection: {
    analyze: {
      method: 'POST' as const,
      path: '/api/detection/analyze',
      input: z.any(),
      responses: {
        200: z.object({
          isDeepfake: z.boolean(),
          confidence: z.number(),
          analysis: z.string(),
          type: z.string(),
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/detection/history',
      responses: {
        200: z.array(z.custom<typeof detectionHistory.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type GameScoreInput = z.infer<typeof api.game.submitScore.input>;
export type LeaderboardResponse = z.infer<typeof api.game.getLeaderboard.responses[200]>;
export type ScamReportInput = z.infer<typeof api.radar.submitReport.input>;
export type RadarStatsResponse = z.infer<typeof api.radar.getStats.responses[200]>;
export type DetectionResponse = z.infer<typeof api.detection.analyze.responses[200]>;