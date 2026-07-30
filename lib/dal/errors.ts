import "server-only";

/** Thrown when there is no valid, active session. Pages redirect to /login;
 *  server actions / route handlers should map this to a 401. */
export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Thrown when the user is authenticated but lacks the required privilege.
 *  Pages render the no-access screen; actions map this to a 403. */
export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Thrown when a scoped lookup finds nothing the caller may see. Deliberately
 *  indistinguishable from "forbidden" to avoid leaking existence. */
export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}
