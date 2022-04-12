import { getRepository, Repository } from "typeorm";

import { Statement } from "../entities/Statement";
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "./IStatementsRepository";

export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = getRepository(Statement);
  }

  async create({
    user_id,
    amount,
    description,
    receiver_id,
    type,
  }: ICreateStatementDTO): Promise<Statement> {
    const statement = this.repository.create({
      user_id,
      amount,
      description,
      type,
      receiver_id,
    });

    return this.repository.save(statement);
  }

  async findStatementOperation({
    statement_id,
    user_id,
  }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.repository.findOne(statement_id, {
      where: { user_id },
    });
  }

  async getUserBalance({
    user_id,
    with_statement = false,
  }: IGetBalanceDTO): Promise<
    { balance: number } | { balance: number; statement: Statement[] }
  > {
    const statement = await this.repository.find({
      where: { user_id },
    });

    const balance = statement.reduce((acc, operation) => {
      if (operation.type === "deposit") {
        return acc + operation.amount;
      } else {
        return acc - operation.amount;
      }
    }, 0);

    const transferStatement = await this.repository.find({
      where: { receiver_id: user_id },
    });

    const balanceWithTransfers = transferStatement.reduce(
      (acc, operation) => acc + operation.amount,
      balance
    );

    if (with_statement) {
      return {
        statement,
        balance: balanceWithTransfers,
      };
    }

    return { balance: balanceWithTransfers };
  }
}
