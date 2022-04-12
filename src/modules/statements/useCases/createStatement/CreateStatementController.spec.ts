import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Create Statement", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@test.com",
      password: "1234",
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a deposit statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "1234",
    });

    const { user, token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .set({ Authorization: `Bearer ${token}` })
      .send({ amount: 999, description: "test deposit" });

    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toEqual(999);
    expect(response.body.user_id).toEqual(user.id);
    expect(response.status).toBe(201);
  });

  it("should be able to create a withdraw statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "1234",
    });

    const { user, token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({ Authorization: `Bearer ${token}` })
      .send({ amount: 199, description: "test withdraw" });

    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toEqual(199);
    expect(response.body.user_id).toEqual(user.id);
    expect(response.status).toBe(201);
  });

  it("should be able to create a transfer statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "1234",
    });

    const { body: receiverUser } = await request(app)
      .post("/api/v1/users")
      .send({
        name: "test2",
        email: "test2@test.com",
        password: "1234",
      });

    const { user, token } = responseToken.body;

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${receiverUser.id}`)
      .set({ Authorization: `Bearer ${token}` })
      .send({ amount: 199, description: "test transfer" });

    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toEqual(199);
    expect(response.body.receiver_id).toEqual(receiverUser.id);
    expect(response.body.user_id).toEqual(user.id);
    expect(response.status).toBe(201);
  });

  it("should be able to create a withdraw without funds", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "1234",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({ Authorization: `Bearer ${token}` })
      .send({ amount: 999, description: "test withdraw" });

    expect(response.status).toBe(400);
  });

  it("should not be able to create a transfer statement without funds", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "1234",
    });

    const { body: receiverUser } = await request(app)
      .post("/api/v1/users")
      .send({
        name: "test3",
        email: "test3@test.com",
        password: "1234",
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${receiverUser.id}`)
      .set({ Authorization: `Bearer ${token}` })
      .send({ amount: 999, description: "test transfer" });

    expect(response.status).toBe(400);
  });
});
