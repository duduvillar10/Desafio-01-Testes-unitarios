import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Get Balance", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@test.com",
      password: "1234",
    });

    await request(app).post("/api/v1/users").send({
      name: "test2",
      email: "test2@test.com",
      password: "1234",
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get balance", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "1234",
    });

    const responseToken2 = await request(app).post("/api/v1/sessions").send({
      email: "test2@test.com",
      password: "1234",
    });

    const { user: user2, token: token2 } = responseToken2.body;

    const { user, token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .set({ Authorization: `Bearer ${token}` })
      .send({ amount: 100, description: "test deposit" });

    await request(app)
      .post("/api/v1/statements/deposit")
      .set({ Authorization: `Bearer ${token2}` })
      .send({ amount: 100, description: "test deposit" });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .set({ Authorization: `Bearer ${token}` })
      .send({ amount: 50, description: "test withdraw" });

    await request(app)
      .post(`/api/v1/statements/transfer/${user.id}`)
      .set({ Authorization: `Bearer ${token2}` })
      .send({ amount: 50, description: "test transfer" });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body.balance).toEqual(100);
  });
});
