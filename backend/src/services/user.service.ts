// postgres client object that allows interaction with the database
import { db } from "../database/postgres/connection";

// Structure of a User object
import { CreateUserInterface, User } from "../interfaces/user.interface";
import { UpdateUserBody } from "../types/user.types";
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

  // Update a user with a given id
  async updateUserById(
    // id of the user
    id: string,
    // The body can only contain fields that are in UpdateUserBody type
    body: UpdateUserBody
  ): Promise<User | null> {
    // Check whether the user with this id exists
    const existingUserResult = await db.query(
      `SELECT * FROM users WHERE id = $1 LIMIT 1`,
      [id]
    );

    const existingUser: User | null = existingUserResult.rows[0] || null;

    if (existingUser === null) {
      // There is no user with the given id
      return null;
    }
    
    // Only allow specific fields to be updated.
    // This protects the query from updating columns that
    // should not be changed or trying to update columns that do not exist.

    // email, display_name, & bio are the only fields that the user can update
    // via this function.

    // If they want to change their password, that will be handled in a separate
    // service function and will be called by a separate controller function.
    // (Though this is out of scope/not needed for this app. The sole purpose of this app
    // is to expose security vulnerabilities (defined by OWASP) and how to defend against them)
    const allowedFields = ["email", "display_name", "bio"];

    // Iterate through the object that was passed in as a parameter and
    // only keep fields that are allowed and actually provided.
    const updates = Object.entries(body).filter(([key, value]) => {
      return allowedFields.includes(key) && value !== undefined;
    });

    // If no valid fields were passed in, just return the existing user as-is.
    // I could throw an error here but that's not the purpose of this simple app.
    // In fact, the controller function will catch the error prior to this function
    // even getting called.
    if (updates.length === 0) {
      return existingUser;
    }

    /*
      The SQL query to update a row in a table is:

      UPDATE {table-name}
        SET column1 = value1,
          column2 = value2
        WHERE id = '${id}';
      
      so the SET clause must be built dynamically
    */
    // Build the SET clause dynamically.
    // Example: display_name = $1, bio = $2,
    const setClause = updates
      .map(([key], index) => `${key} = $${index + 1}`)
      .join(", ");

    // Needed for parameterized queries

    // Extract just the values in the same order as the SET clause.
    const values = updates.map(([, value]) => value);

    // Add the id as the final parameter for the WHERE clause.
    values.push(id);

    // Run the dynamic update query
    const updatedUserResult = await db.query(
      `
      UPDATE ${usersTable}
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${values.length}
      RETURNING *;
    `,
      values
    );

    // return the updated row.
    const updatedUser: User | null = updatedUserResult.rows[0] || null;
    return updatedUser;
  },
};
