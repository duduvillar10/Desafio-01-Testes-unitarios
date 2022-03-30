import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a deposit statement", async () => {
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

    expect(statement).toHaveProperty("id");
  });

  it("should not be able to create a deposit statement with nonexistent user", async () => {
    const depositStatement = {
      user_id: "13412341234124123412",
      type: "deposit" as OperationType,
      amount: 1000,
      description: "test deposit",
    };

    expect(async () => {
      await createStatementUseCase.execute(depositStatement);
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should be able to create a withdraw statement", async () => {
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

    const withdrawStatement = {
      user_id: id,
      type: "withdraw" as OperationType,
      amount: 100,
      description: "test withdraw",
    };

    await createStatementUseCase.execute(depositStatement);
    const statement = await createStatementUseCase.execute(withdrawStatement);

    expect(statement).toHaveProperty("id");
  });

  it("should not be able to create a withdraw statement with insuficient funds", async () => {
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

    const withdrawStatement = {
      user_id: id,
      type: "withdraw" as OperationType,
      amount: 1100,
      description: "test withdraw",
    };

    await createStatementUseCase.execute(depositStatement);

    expect(async () => {
      await createStatementUseCase.execute(withdrawStatement);
    }).rejects.toBeInstanceOf(AppError);
  });
});
