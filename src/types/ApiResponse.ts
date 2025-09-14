// Shared API response contract used across client/components
// Define Message locally to avoid importing from non-existent modules
export interface Message {
  id: string;
  content: string;
  // When sent over the wire, dates are strings; in app code, may be a Date
  createdAt: string | Date;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: Array<Message>
};