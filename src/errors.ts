import { createError } from "conway-errors";

const createErrorCtx = createError([
  { errorType: "FrontendLogicError" },
  { errorType: "BackendInteractionError" },
  { errorType: "TelegramError" },
] as const);

export const errorCtx = createErrorCtx("TMA-exchange");

export const APILayerError = errorCtx.feature("APILayerError");
