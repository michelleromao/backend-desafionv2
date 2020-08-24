import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('You do not have enough balance!', 400);
    }

    const categoryAlreadyExists = await categoryRepository.findOne({
      where: { title: category },
    });
    const transaction = await transactionRepository.create({
      title,
      value,
      type,
    });

    if (categoryAlreadyExists) {
      transaction.category_id = categoryAlreadyExists.id;
      await transactionRepository.save(transaction);

      return transaction;
    }

    const createCategory = categoryRepository.create({ title: category });
    const newCategory = await categoryRepository.save(createCategory);
    transaction.category_id = newCategory.id;
    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
