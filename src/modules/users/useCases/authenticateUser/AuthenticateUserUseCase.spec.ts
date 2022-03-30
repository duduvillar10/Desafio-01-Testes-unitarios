import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
describe("Authenticate User", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    await createUserUseCase.execute({
      name: "test",
      email: "test@test.com",
      password: "1234",
    });
  });

  it("should be able to authenticate an user", async () => {
    const authenticatedUser = await authenticateUserUseCase.execute({
      email: "test@test.com",
      password: "1234",
    });

    expect(authenticatedUser).toHaveProperty("token");
  });

  it("should not be able to return a token with a non-existent user", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "adfasdfasdfdfd",
        password: "1234",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to authenticate with incorrext password", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "test@test.com",
        password: "w1234",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
