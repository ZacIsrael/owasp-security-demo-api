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
    // Vulnerable & bad practice: No password hashing
    // Vulnerable to SQL Injection attack
    const result = await db.query(
      `INSERT INTO ${usersTable} (email, display_name, password_hash) VALUES ('${dto.email}', '${dto.display_name}', '${dto.password}') RETURNING *`
    );

    // Proper way: hash password
    // const hashedPassword = await hashPassword(dto.password);

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
};
