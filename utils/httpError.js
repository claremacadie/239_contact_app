export default class HttpError extends Error {
    constructor(status, statusText, bodyText='') {
      super(`${status} ${statusText}${bodyText ? ` — ${bodyText}` : ''}`);
      this.name = 'HttpError';
      this.status = status;
    }
  }
  