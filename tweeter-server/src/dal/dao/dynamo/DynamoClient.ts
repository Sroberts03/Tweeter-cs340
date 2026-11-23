import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * Shared singleton helper that provides the AWS SDK v3 DynamoDBDocumentClient.
 * Translates native JavaScript types to and from DynamoDB AttributeValues automatically.
 */
export class DynamoClient {
  private static instance: DynamoDBDocumentClient | null = null;

  public static getDocumentClient(): DynamoDBDocumentClient {
    if (!this.instance) {
      const region = process.env.AWS_REGION || "us-east-1";
      const dbClient = new DynamoDBClient({ region });
      this.instance = DynamoDBDocumentClient.from(dbClient, {
        marshallOptions: {
          removeUndefinedValues: true,
          convertClassInstanceToMap: true,
        },
      });
    }
    return this.instance;
  }
}
