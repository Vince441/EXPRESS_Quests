const request = require("supertest");
const crypto = require("node:crypto");
const app = require("../src/app");
const database = require("../database")

afterAll(() => database.end());

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



describe("POST /api/users", () =>{
  it("should return created users", async () =>{
const newUsers = {
  lastname: "Vincent",
  firstname : "Louvart",
  email : `${crypto.randomUUID()}@wild.co`,
  city : "Nantes",
  language : "Js",
};
const response = await request(app).post("/api/users").send(newUsers);

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(typeof response.body.id).toBe("number");

    const [result] = await database.query(
      "SELECT * FROM users WHERE id=?",
      response.body.id
    );

    const [usersInDatabase] = result;

    expect(usersInDatabase).toHaveProperty("id");

    expect(usersInDatabase).toHaveProperty("firstname");
    expect(usersInDatabase.firstname).toStrictEqual(newUsers.firstname);

  });
  it("should return an error", async () => {
    const usersWithMissingProps = { firstname: "Sephiroth" };

    const response = await request(app)
      .post("/api/users")
      .send(usersWithMissingProps);

      expect(response.status).toEqual(422);

  });
});


describe("PUT /api/users/:id", () => {
  it("should edit users", async () => {
    const newUsers = {
      firstname: "Alexandri",
      lastname: "Depourtouxe",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Montreal",
      language: "Muette",
    };
    const [result] = await database.query(
      "INSERT INTO users(firstname, lastname, email, city, language) VALUES (?, ?, ?, ?, ?)",
      [newUsers.firstname, newUsers.lastname, newUsers.email, newUsers.city, newUsers.language]
    );

    const id = result.insertId;

    const updatedUser = {
      firstname: "Alexandra",
      lastname: "Depourtoux",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Nantes",
      language: "Français",
    };

    const response = await request(app)
      .put(`/api/users/${id}`)
      .send(updatedUser);

    expect(response.status).toEqual(204);
    const [users] = await database.query("SELECT * FROM users WHERE id=?", id);

    const [usersInDatabase] = users;

    expect(usersInDatabase).toHaveProperty("id");

    expect(usersInDatabase).toHaveProperty("firstname");
    expect(usersInDatabase.firstname).toStrictEqual(updatedUser.firstname);

    expect(usersInDatabase).toHaveProperty("lastname");
    expect(usersInDatabase.lastname).toStrictEqual(updatedUser.lastname);

    expect(usersInDatabase).toHaveProperty("email");
    expect(usersInDatabase.email).toStrictEqual(updatedUser.email);

    expect(usersInDatabase).toHaveProperty("city");
    expect(usersInDatabase.city).toStrictEqual(updatedUser.city);

    expect(usersInDatabase).toHaveProperty("language");
    expect(usersInDatabase.language).toStrictEqual(updatedUser.language);
  });
  it("should return an error", async () => {
    const userWithMissingProps = { firstname: "Sephiroth" };

    const response = await request(app)
      .put(`/api/users/1`)
      .send(userWithMissingProps);

    expect(response.status).toEqual(422);

});
it("should return no User", async () => {
  newUsers = {
    firstname: "Alexandri",
    lastname: "Depourtouxe",
    email: `${crypto.randomUUID()}@wild.co`,
    city: "Montreal",
    language: "Muette",
  }

  const response = await request(app).put("/api/users/0").send(newUsers);

  expect(response.status).toEqual(404);
});
});


describe("DELETE /api/movies/:id", () => {
  it("should edit users", async () => {
    const newUsers = {
      firstname: "Alexandri",
      lastname: "Depourtouxe",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Montreal",
      language: "Muette",
    };
    const [results] = await database.query(
      "INSERT INTO users(firstname, lastname, email, city, language) VALUES (?, ?, ?, ?, ?)",
      [newUsers.firstname, newUsers.lastname, newUsers.email, newUsers.city, newUsers.language]
    );
    const id = results.insertId;

    const response = await request(app)
      .delete(`/api/users/${id}`)
      .send("Delete done");

    expect(response.status).toEqual(204);

    
  });

  it("should fail", async () => {

    
    const response = await request(app)
    .delete(`/api/users/5000`)
   

    expect(response.status).toEqual(404);
  })


});