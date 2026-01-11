import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// POST /api/keywords
export const createKeyword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { term } = req.body;
    const clientId = req.user.clientId;
    if (!term) {
      res.status(400).json({ error: 'Keyword term is required' });
      return;
    }
    const keyword = await prisma.keyword.create({
      data: { term, clientId },
    });
    res.status(201).json(keyword);
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Keyword already exists for this client' });
      return;
    }
    res.status(500).json({ error: 'Failed to create keyword' });
  }
};

// GET /api/keywords
export const getKeywords = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const clientId = req.user.clientId;
    const keywords = await prisma.keyword.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(keywords);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch keywords' });
  }
};

// DELETE /api/keywords/:id
export const deleteKeyword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'Keyword id is required' });
      return;
    }
    const clientId = req.user.clientId;
    // Ensure ownership
    const keyword = await prisma.keyword.findUnique({ where: { id } });
    if (!keyword || keyword.clientId !== clientId) {
      res.status(404).json({ error: 'Keyword not found' });
      return;
    }
    await prisma.keyword.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete keyword' });
  }
}; 