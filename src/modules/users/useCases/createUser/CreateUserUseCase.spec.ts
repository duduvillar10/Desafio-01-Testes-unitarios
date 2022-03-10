import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { CreateUserError } from './CreateUserError'
import { CreateUserUseCase } from './CreateUserUseCase'

let inMemoryUsersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase

describe("Create user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: 'test',
      email: 'test@test.com',
      password: '1234'
    })
    expect(user).toHaveProperty('id')
  })

  it("should not be able to create a user with exist email", () => {

    expect(async () => {
      const user = {
        name: 'test',
        email: 'test@test.com',
        password: '1234'
      }

      await createUserUseCase.execute(user)
      await createUserUseCase.execute(user)

    }).rejects.toBeInstanceOf(CreateUserError)
  })
})
