// src/utils/error-handling.ts
import { UserError } from "fastmcp";
import {
  isNotionClientError,
  APIErrorCode,
  ClientErrorCode
} from "@notionhq/client";

/**
 * Handle Notion API errors in a type-safe way and convert them to appropriate FastMCP errors
 * @param error The caught error of unknown type
 * @param context Optional context about the operation that failed 
 * @returns Never returns, always throws an appropriate error
 */
export function handleNotionError(error: unknown, context?: string): never {
  // First check if it's a Notion-specific error using the SDK's type guard
  if (isNotionClientError(error)) {
    // Now we can safely access error.code and other properties
    const contextPrefix = context ? `[${context}] ` : '';

    switch (error.code) {
      // Client-side errors
      case ClientErrorCode.RequestTimeout:
        throw new UserError(`${contextPrefix}The request to Notion API timed out. Please try again.`);

      case ClientErrorCode.ResponseError:
        throw new UserError(`${contextPrefix}Received an unexpected response from Notion API.`);

      // Server-side errors (API errors)
      case APIErrorCode.Unauthorized:
        throw new UserError(`${contextPrefix}Not authorized to access this Notion resource. Please check your API token.`);

      case APIErrorCode.RestrictedResource:
        throw new UserError(`${contextPrefix}This Notion resource is restricted and cannot be accessed.`);

      case APIErrorCode.ObjectNotFound:
        throw new UserError(`${contextPrefix}The requested Notion object was not found. Please check the ID.`);

      case APIErrorCode.RateLimited:
        throw new UserError(`${contextPrefix}Rate limit exceeded. Please try again later.`);

      case APIErrorCode.InvalidJSON:
        throw new UserError(`${contextPrefix}Invalid JSON was provided to Notion API.`);

      case APIErrorCode.InvalidRequestURL:
        throw new UserError(`${contextPrefix}Invalid request URL. This is likely a bug in the tool.`);

      case APIErrorCode.InvalidRequest:
        throw new UserError(`${contextPrefix}Invalid request to Notion API: ${error.message}`);

      case APIErrorCode.ValidationError:
        throw new UserError(`${contextPrefix}Validation error: ${error.message}`);

      case APIErrorCode.ConflictError:
        throw new UserError(`${contextPrefix}Conflict error: Another update to this resource was made. Please try again.`);

      case APIErrorCode.InternalServerError:
        throw new UserError(`${contextPrefix}Notion API encountered an internal server error. Please try again later.`);

      case APIErrorCode.ServiceUnavailable:
        throw new UserError(`${contextPrefix}Notion API service is currently unavailable. Please try again later.`);

      default:
        // For any unhandled API error codes
        throw new UserError(`${contextPrefix}Unknown Notion API error`);
    }
  }

  // Handle other types of errors
  if (error instanceof Error) {
    const contextPrefix = context ? `[${context}] ` : '';
    throw new UserError(`${contextPrefix}Error: ${error.message}`);
  }

  // For completely unknown errors
  throw new UserError(`An unknown error occurred when working with Notion API.`);
}
