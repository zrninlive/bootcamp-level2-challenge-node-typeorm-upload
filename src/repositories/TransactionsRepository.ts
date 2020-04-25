import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const reducerTransaction = (value: number, current: Transaction): number =>
      value + current.value;

    const income = transactions
      .filter(transaction => transaction.type === 'income')
      .reduce(reducerTransaction, 0);

    const outcome = transactions
      .filter(transaction => transaction.type === 'outcome')
      .reduce(reducerTransaction, 0);

    const currentBalance = {
      income,
      outcome,
      total: income - outcome,
    };

    return currentBalance;
  }
}

export default TransactionsRepository;
