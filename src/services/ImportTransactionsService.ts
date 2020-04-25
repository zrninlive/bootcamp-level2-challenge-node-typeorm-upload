import { getCustomRepository, In } from 'typeorm';
import fs from 'fs';
import csv from 'csv-parse';

import CategoriesRepository from '../repositories/CategoriesRepository';
import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';

interface CSVImport {
  title: string;
  type: string;
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactions: CSVImport[] = [];
    const categories: string[] = [];

    const categoriesRepository = getCustomRepository(CategoriesRepository);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const readmStream = fs
      .createReadStream(filePath)
      .pipe(csv({ from_line: 2, trim: true }));

    const csvParsed = readmStream.on('data', async row => {
      const [title, type, value, category] = row;

      const transaction = {
        title,
        type,
        value,
        category,
      };

      categories.push(category);
      transactions.push(transaction);
    });

    await new Promise(resolve => csvParsed.on('end', resolve));

    const existentsCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existentsCategoriesTitles: string[] = existentsCategories.map(
      category => category.title,
    );

    const categoriesToAdd: string[] = categories
      .filter(category => !existentsCategoriesTitles.includes(category))
      .filter((value, key, self) => self.indexOf(value) === key);

    const newCategories = categoriesRepository.create(
      categoriesToAdd.map(category => ({
        title: category,
      })),
    );

    await categoriesRepository.save(newCategories);

    const transactionsCategories = [...newCategories, ...existentsCategories];

    const importedTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: transactionsCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(importedTransactions);

    fs.unlinkSync(filePath);

    return importedTransactions;
  }
}

export default ImportTransactionsService;
