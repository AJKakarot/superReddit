// server/src/controllers/mention.controller.ts

import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// GET /api/mentions
export const getMentions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const clientId = req.user.clientId;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;

    const [mentions, total] = await Promise.all([
      prisma.mention.findMany({
        where: { clientId },
        orderBy: { found_at: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.mention.count({ where: { clientId } }),
    ]);

    res.json({ mentions, total, page, pageSize });
  } catch (error) {
    console.error("Failed to fetch mentions:", error);
    res.status(500).json({ error: 'Failed to fetch mentions' });
  }
};