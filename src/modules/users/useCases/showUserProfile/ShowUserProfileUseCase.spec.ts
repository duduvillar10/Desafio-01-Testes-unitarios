import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: IUsersRepository;

describe("Show user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to show an user", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "test",
      email: "test@test.com",
      password: "1234",
    });

    const shownUser = await showUserProfileUseCase.execute(user.id);

    expect(shownUser).toEqual(user);
  });

  it("should not be able to show non-exist user", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("2452345235");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
