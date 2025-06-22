// metaGraphApi.ts
import axios, { AxiosRequestConfig, Method } from "axios";

const GRAPH_BASE_URL = "https://graph.facebook.com/v23.0";

/**
 * Options for a Graph API request.
 */
export interface GraphApiRequestOptions {
  /**
   * The relative path for the Graph API endpoint.
   * Example: "/me", "/{page-id}/feed"
   */
  path: string;

  /**
   * URL query parameters (for GET, DELETE).
   */
  params?: Record<string, any>;

  /**
   * Request body payload (for POST, PUT).
   */
  data?: Record<string, any>;

  /**
   * Additional headers to send with the request.
   */
  headers?: Record<string, string>;

  /**
   * The access token (page or user) to authenticate the request.
   */
  token: string;
}

/**
 * Internal function to send a request to the Facebook Graph API.
 *
 * @param method - The HTTP method (GET, POST, PUT, DELETE).
 * @param options - Request options including path, token, params, and body.
 * @returns The parsed JSON response data.
 * @throws If the response status is 4xx or any other error occurs.
 */
async function request(method: Method, { path, params = {}, data = {}, headers = {}, token }: GraphApiRequestOptions) {
  const url = `${GRAPH_BASE_URL}${path}`;

  const config: AxiosRequestConfig = {
    method,
    url,
    params: {
      ...params,
      access_token: token
    },
    data,
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    validateStatus: status => status < 500 // Only throw on 5xx
  };

  try {
    const response = await axios(config);

    if (response.status >= 400) {
      throw {
        status: response.status,
        error: response.data?.error || response.statusText
      };
    }

    return response.data;
  } catch (error: any) {
    console.error("[GraphAPI] Error:", error);
    throw error;
  }
}

/**
 * Facebook Graph API client with full method support.
 * Provides `.get()`, `.post()`, `.delete()`, and `.put()` functions.
 */
export const fbGraphApi = {
  /**
   * Sends a GET request to the Graph API.
   */
  get: (opts: GraphApiRequestOptions) => request("GET", opts),

  /**
   * Sends a POST request to the Graph API.
   */
  post: (opts: GraphApiRequestOptions) => request("POST", opts),

  /**
   * Sends a DELETE request to the Graph API.
   */
  delete: (opts: GraphApiRequestOptions) => request("DELETE", opts),

  /**
   * Sends a PUT request to the Graph API.
   */
  put: (opts: GraphApiRequestOptions) => request("PUT", opts)
};
