import { getCustomRepository } from 'typeorm';

import TransactionRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

interface Request {
  transaction_id: string;
}

class DeleteTransactionService {
  public async execute({ transaction_id }: Request): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const transaction = await transactionRepository.findOne({
      where: { id: transaction_id },
    });

    if (!transaction) {
      throw new AppError('Transaction do not exists!', 400);
    }
    await transactionRepository.remove(transaction);
  }
}

export default DeleteTransactionService;
