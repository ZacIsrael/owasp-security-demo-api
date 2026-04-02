// postgres client object that allows interaction with the database
import { db } from "../database/postgres/connection";

// Structure of a User object
import { CreateUserInterface, User } from "../interfaces/user.interface";
import { hashPassword } from "../utils/helpers";

// constants for tables in the postgreSQL database
const usersTable = "users";

export const userService = {
  // function that adds a user to the users table in the postgreSQL database
  async createUser(
    // Improper way; unsanitized data
    dto: CreateUserInterface
    // Proper way; data is sanitized via data transfer object
    // dto: CreateUserDTO
  ): Promise<{ user: User }> {
    // Proper way: hash password
    const hashedPassword = await hashPassword(dto.password);

    // Vulnerable & bad practice: No password hashing
    // Vulnerable to SQL Injection attack
    const result = await db.query(
      `INSERT INTO ${usersTable} (email, display_name, password_hash) VALUES ('${dto.email}', '${dto.display_name}', '${hashedPassword}') RETURNING *`
    );

    // Proper way to prevent SQL Injection attack
    // const result = await db.query(
    //   `INSERT INTO ${usersTable} (email, display_name, password_hash) VALUES ($1, $2, $3) RETURNING *`,
    //   [dto.email, dto.display_name, hashedPassword]
    // );

    // RETURNING * includes the inserted user in the result
    const user = result.rows[0];

    return {
      user,
    };
  },

  // Retrieve a user by their email; used for login controller function
  async getUserByEmail(email: string): Promise<{ user: User | null }> {
    // Vulnerable & bad practice: No password hashing
    // Vulnerable to SQL Injection attack
    const result = await db.query(
      `SELECT * FROM ${usersTable} WHERE email = '${email}'`
    );

    // Proper way to prevent SQL Injection attack
    // const result = await db.query(
    //   `SELECT * FROM ${usersTable} WHERE email = ($1)`,
    //   [email]
    // );

    // Schema enforces unique emails so no need to check if
    // there is more than 1 user with the same email.
    // Either the user with that email has been found or they don't exist.
    const user: User | null = result.rows[0] || null;

    return {
      user,
    };
  },

  // Retrieve a user by its id
  async getUserById(id: string): Promise<{ user: User | null }> {
    // vulnerable way
    const result = await db.query(
      `SELECT * FROM users WHERE id = '${id}' LIMIT 1`
    );

    // Proper way
    // const result = await db.query(`SELECT * FROM users WHERE id = $1 LIMIT 1`, [
    //   id,
    // ]);

    const user: User | null = result.rows[0] || null;

    return { user };
  },
};
