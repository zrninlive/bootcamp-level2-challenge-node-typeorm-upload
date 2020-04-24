import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';
import AppError from '../errors/AppError';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionRepository.find({
    relations: ['category'],
  });

  return response.json({
    transactions,
    balance: await transactionRepository.getBalance(),
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const CreateTransaction = new CreateTransactionService();

  const transaction = await CreateTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.status(201).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const transactionRepository = getCustomRepository(TransactionsRepository);

  const transaction = await transactionRepository.findOne(id);

  if (!transaction) {
    throw new AppError('Invalid transaction ID, try again!');
  }

  await transactionRepository.delete({ id });

  return response.status(204).send();
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;
