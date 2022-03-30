import { rejects } from "assert";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to get statement", async () => {
    const { id } = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com",
      password: "1234",
    });

    const depositStatement = {
      user_id: id,
      type: "deposit" as OperationType,
      amount: 1000,
      description: "test deposit",
    };

    const statement = await createStatementUseCase.execute(depositStatement);

    const foundStatement = await getStatementOperationUseCase.execute({
      user_id: id,
      statement_id: statement.id as string,
    });

    expect(statement).toEqual(foundStatement);
  });
  it("should be able to get statement", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "Userid",
        statement_id: "statementId",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
