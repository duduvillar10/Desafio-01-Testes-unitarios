import { Connection, createConnection } from "typeorm";
import request from 'supertest'
import { app } from "../../../../app";

let connection: Connection

describe("Show user profile", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations()

    await request(app).post('/api/v1/users').send({
      name:'test',
      email: 'test@test.com',
      password: '1234'
    })
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close();
  })

  it("should be able to return an authenticated user", async () => {

    const responseToken = await request(app)
    .post('/api/v1/sessions')
    .send({
      email: 'test@test.com',
      password: '1234'
    })

    const { token } = responseToken.body

    const response = await request(app).get('/api/v1/profile').set({Authorization: `Bearer ${token}`})

    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('name')
    expect(response.body.name).toEqual('test')
  })
})
