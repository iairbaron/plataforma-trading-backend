import { Request, Response } from 'express';
import prisma from '../prisma';

export const addFavorite = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.body;
    const userId = req.user?.id; // from auth middleware

    const favorite = await prisma.favorite.create({
      data: {
        symbol,
        userId: userId as string
      }
    });

    res.status(201).json({
      status: 'success',
      data: favorite
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error adding favorite'
    });
  }
};

export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const userId = req.user?.id;

    await prisma.favorite.deleteMany({
      where: {
        symbol,
        userId
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Favorite removed successfully'
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error removing favorite'
    });
  }
};

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const favorites = await prisma.favorite.findMany({
      where: {
        userId
      }
    });

    res.status(200).json({
      status: 'success',
      data: favorites
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching favorites'
    });
  }
}; 