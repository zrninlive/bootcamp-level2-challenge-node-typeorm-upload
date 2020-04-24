import { getRepository, getCustomRepository } from 'typeorm';
// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income | outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const categoryExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (categoryExists) {
      const new_transaction = transactionsRepository.create({
        title,
        value,
        type,
        category_id: categoryExists.id,
      });

      await transactionsRepository.save(new_transaction);

      return new_transaction;
    }

    const new_category = categoriesRepository.create({ title: category });
    await categoriesRepository.save(new_category);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: new_category.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
