// This file validates and sanitizes the data coming from
// API requests for users (logging in & registering).
import {
  CreateUserInterface,
  LoginUserInterface,
} from "../interfaces/user.interface";
import { UpdateUserBody } from "../types/user.types";
import {
  assertIsObject,
  isBoolean,
  isNonEmptyString,
  sanitizePlainText,
} from "../utils/helpers";
import {
  isAllowedEnumValue,
  isValidEmail,
  isValidPassword,
  rejectUnknownFields,
} from "../utils/validation";

/*

    // Body for creating a new user
    export interface CreateUserInterface {
      email: string;
      password: string;
      display_name: string;
      bio?: string;
      role?: UserRole;
      is_active?: boolean;
    }
    
    // Body for logging a user in
    export interface LoginUserInterface {
      email: string;
      password: string;
    }

*/

// A user can be an "admin" or just a regular "user"
const PUBLIC_USER_ROLES = ["user", "admin"] as const;

// class for registering a user
export class CreateUserDTO {
  // Declare class properties with their expected types
  email: string;
  password: string;
  display_name: string;
  bio?: string;
  // enum: 'user' or 'admin'
  role?: (typeof PUBLIC_USER_ROLES)[number];
  is_active?: boolean;

  constructor(data: unknown) {
    // ensure that data is an object
    const payload = assertIsObject(data, "Request body must be a valid object");

    // Only allow fields expected for registration
    rejectUnknownFields(data, [
      "email",
      "password",
      "display_name",
      "bio",
      "role",
      "is_active",
    ]);

    const { display_name, email, bio, role, password, is_active } = payload;
    // required fields
    if (!isNonEmptyString(display_name)) {
      throw new Error(
        "display_name field is required and must be a non-empty string."
      );
    }

    // Sanitize user-provided name input to strip malicious HTML/JS (XSS prevention)
    const sanitizedDisplayName = sanitizePlainText(display_name.trim());

    // Enforce max length defined in schema
    if (sanitizedDisplayName.length > 100) {
      throw new Error("Name can't be longer than 100 characters");
    }

    // Assign validated name to DTO
    this.display_name = sanitizedDisplayName;

    if (!isValidEmail(email)) {
      throw new Error("A valid email is required");
    }

    this.email = email.trim().toLowerCase();

    if (!isValidPassword(password)) {
      throw new Error("Password must be between 8 and 128 characters");
    }

    this.password = password;

    if (bio !== undefined) {
      // The frontend sends bio in body of the request regardless if it's
      // empty or not so it'll never be undefined.
      // Empty strings are valid for bios
      // if (!isNonEmptyString(bio)) {
      //   throw new Error("bio must be a non-empty string when provided");
      // }

      // Ensure the the bio is a string
      if (typeof bio !== "string") {
        throw new Error("bio must be a string when provided");
      }

      // remove any possible malicious text
      const sanitizedBio = sanitizePlainText(bio.trim());

      if (sanitizedBio.length > 500) {
        throw new Error("Bio can't exceed 500 characters");
      }

      this.bio = sanitizedBio;
    } else {
      this.bio = "";
    }

    if (role !== undefined) {
      if (!isAllowedEnumValue(role, PUBLIC_USER_ROLES)) {
        throw new Error("role must be either 'user' or 'admin'");
      }

      this.role = role;
    } else {
      this.role = "user";
    }

    if (is_active !== undefined) {
      if (!isBoolean(is_active)) {
        throw new Error("is_active must be a boolean");
      }

      this.is_active = is_active;
    } else {
      // Match PostgreSQL schema default
      this.is_active = true;
    }
  }
}

// class for logging a user in
export class LoginUserDTO implements LoginUserInterface {
  email: string;
  password: string;

  constructor(data: unknown) {
    const payload = assertIsObject(data, "Request body must be a valid object");

    rejectUnknownFields(payload, ["email", "password"]);

    const { email, password } = payload;

    if (!isValidEmail(email)) {
      throw new Error("A valid email is required");
    }

    this.email = email.trim().toLowerCase();

    if (!isValidPassword(password)) {
      throw new Error("Password must be between 8 and 128 characters");
    }

    this.password = password;
  }
}

export class UpdateUserDTO {
  email?: string;
  display_name?: string;
  bio?: string;

  constructor(data: unknown) {
    // Ensure that the data parameter is a valid object
    const payload = assertIsObject(data, "Request body must be a valid object");

    // Only allow fields users are permitted to update here.
    rejectUnknownFields(payload, ["display_name", "email", "bio"]);

    // destructure object
    const { display_name, email, bio } = payload;

    if (
      email === undefined &&
      display_name === undefined &&
      bio === undefined
    ) {
      throw new Error(
        "At least one of the following fields must be updated: display_name, email, bio"
      );
    }

    if (email !== undefined) {
      // Ensure that the email passed in is valid
      if (!isValidEmail(email)) {
        throw new Error("A valid email address is required");
      }

      // Assign trimmed & lowercased validated email; entries in the database need to be consistent
      this.email = email.trim().toLowerCase();
    }

    if (display_name !== undefined) {
      if (!isNonEmptyString(display_name)) {
        throw new Error("Name must be a non-empty string");
      }

      // Sanitize user-provided display_name input to strip malicious HTML/JS (XSS prevention)
      const sanitizedDisplayName = sanitizePlainText(display_name.trim());

      // Enforce max length defined in schema
      if (sanitizedDisplayName.length > 100) {
        throw new Error("Name can't be longer than 100 characters");
      }

      // Assign validated name to DTO
      this.display_name = sanitizedDisplayName;
    }

    if (bio !== undefined) {
      // A user can update their bio to be an empty string if they'd like
      // so there's no need to check if bio is empty
      if (typeof bio !== "string") {
        throw new Error("bio must be a string when provided");
      }
      // Defense against XSS
      const sanitizedBio = sanitizePlainText(bio.trim());

      // Vulnerable to XSS attacks: unsaniztized user input
      // const sanitizedBio = bio.trim();

      if (sanitizedBio.length > 500) {
        throw new Error("Bio can't exceed 500 characters");
      }

      this.bio = sanitizedBio;
    }
  }
}
