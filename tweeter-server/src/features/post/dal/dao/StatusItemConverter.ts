import { Status, User } from "tweeter-shared";

/**
 * Shape of an item storing a status record in DynamoDB (used by both Story and Feed tables).
 */
export interface StatusTableRecord {
  readonly post: string;
  readonly timestamp: number;
  readonly sender_alias: string;
  readonly sender_firstName: string;
  readonly sender_lastName: string;
  readonly sender_imageUrl: string;
}

/**
 * Shared helper for deserializing and converting raw DynamoDB status items into domain Status objects.
 */
export class StatusItemConverter {
  public static fromRecords(items: StatusTableRecord[]): Status[] {
    const statuses: Status[] = [];
    for (const item of items) {
      if (
        item &&
        typeof item.post === "string" &&
        typeof item.sender_firstName === "string" &&
        typeof item.sender_lastName === "string" &&
        typeof item.sender_alias === "string" &&
        typeof item.sender_imageUrl === "string" &&
        typeof item.timestamp === "number"
      ) {
        const author = new User(
          item.sender_firstName,
          item.sender_lastName,
          item.sender_alias,
          item.sender_imageUrl
        );
        statuses.push(new Status(item.post, author, item.timestamp));
      }
    }
    return statuses;
  }
}
