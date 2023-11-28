const request = require("supertest");

const app = require("../src/app");
const database = require("../database")

afterAll(() => database.end());


const crypto = require("node:crypto");


describe("POST /api/users", () => {
  it("should return created user", async () => {
    const newUser = {
      firstname: "Marie",
      lastname: "Martin",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Paris",
      language: "French",
    };

const response = await request(app).post("/api/users").send(newUser);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(typeof response.body.id).toBe("number");

    const [results] = await database.query(
      "SELECT * FROM users WHERE id=?",
      response.body.id
    );

    const [usersInDatabase] = results;

    expect(usersInDatabase).toHaveProperty("id");

    expect(usersInDatabase).toHaveProperty("firstname");
    expect(usersInDatabase.firstname).toStrictEqual(newUser.firstname);
  });

  it("should return an error", async () => {
    const userWithMissingProps = { firstname: "Agathe" };

    const response = await request(app)
      .post("/api/users")
      .send(userWithMissingProps);

    expect(response.status).toEqual(500);
  });
});


describe("GET /api/users", () => {
  it("should return all users", async () => {
    const response = await request(app).get("/api/users");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });
});

describe("GET /api/users/:id", () => {
  it("should return one user", async () => {
    const response = await request(app).get("/api/users/1");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });

  it("should return no user", async () => {
    const response = await request(app).get("/api/users/0");

    expect(response.status).toEqual(404);
  });
});


describe("PUT /api/users/:id", () => {
  it("should edit Users", async () => {
    const newUsers = {
      firstname: "Alexandra",
      lastname: "Depourtouxe",
      email: "users.email",
      city: "Montreal",
      language: "56M de forme de comunication",
    };

    const [result] = await database.query(
      "INSERT INTO users(firstname, lastname, email, city, language) VALUES (?, ?, ?, ?, ?)",
      [newUsers.firstname, newUsers.lastname, newUsers.email, newUsers.city, newUsers.language]
    );

    const id = result.insertId;

    const updatedUsers = {
      firstname: "Emanuelle",
      lastname: "Macon",
      email: "users.email",
      city: "Paris",
      language: "Franglais",
    };

    const response = await request(app)
      .put(`/api/users/${id}`)
      .send(updatedUsers);

    expect(response.status).toEqual(204);

    const [result1] = await database.query("SELECT * FROM users WHERE id=?", id);

    const [usersInDatabase] = result1;

    expect(usersInDatabase).toHaveProperty("id");

    expect(usersInDatabase).toHaveProperty("firstname");
    expect(usersInDatabase.title).toStrictEqual(updatedUsers.firstname);

    expect(usersInDatabase).toHaveProperty("lastname");
    expect(usersInDatabase.director).toStrictEqual(updatedUsers.lastname);

    expect(usersInDatabase).toHaveProperty("email");
    expect(usersInDatabase.year).toStrictEqual(updatedUsers.email);

    expect(usersInDatabase).toHaveProperty("city");
    expect(usersInDatabase.color).toStrictEqual(updatedUsers.city);

    expect(usersInDatabase).toHaveProperty("language");
    expect(usersInDatabase.duration).toStrictEqual(updatedUsers.language);
  });

  it("should return an error", async () => {
    const usersWithMissingProps = { title: "Agathe" };

    const response = await request(app)
      .put(`/api/users/1`)
      .send(usersWithMissingProps);

    expect(response.status).toEqual(500);
  });

  it("should return no users", async () => {
    const newUsers = {
      firstname: "Alexandra",
      lastname: "Depourtouxe",
      email: "users.email",
      city: "Montreal",
      language: "56M de forme de comunication",
    };

    const response = await request(app).put("/api/users/0").send(newUsers);

    expect(response.status).toEqual(404);
  });
});