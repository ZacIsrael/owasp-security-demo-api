import { assertIsObject } from "../utils/helpers";
import { isValidUUID, rejectUnknownFields } from "../utils/validation";

// Generic :id validator (for POstgreSQL)
// For routes like /users/:id

export class IdParamDTO {
  id: string;

  constructor(data: unknown) {
    const payload = assertIsObject(data, "Route params must be a valid object");

    rejectUnknownFields(payload, ["id"]);

    // Deconstruct payload object and retrieve id
    const { id } = payload;

    // Check if the id is in PostgreSQL  id format
    if (!isValidUUID(id)) {
      throw new Error("Route parameter 'id' must be a PostgreSQL id");
    }

    // Assign the validated id
    this.id = id;
  }
}
