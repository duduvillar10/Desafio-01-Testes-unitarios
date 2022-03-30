import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate User Controller", () => {
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

  it("should be able to return a token", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "1234",
    });

    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to return a token with a non-existent user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "adfasdfasdfdfd",
      password: "1234",
    });

    expect(response.status).toBe(401);
  });
});
