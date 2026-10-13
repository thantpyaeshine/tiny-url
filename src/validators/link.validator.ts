import type { Validator } from "@/types/express";
import { body, param } from "express-validator";
import { validate } from "./validator.js";

export const validateURL: Validator = validate([
    body('url').isURL().withMessage('url must be a valid URL')
]);

export const validateSlug: Validator = validate([
    param('slug').isString().withMessage('slug must be a string')
]);