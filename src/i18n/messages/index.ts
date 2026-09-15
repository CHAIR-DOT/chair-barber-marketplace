import type { Messages } from "../config";
import { coreMessages } from "./core";
import { calendarMessages } from "./calendar";
import { entityMessages } from "./entities";
import { journeyMessages } from "./journey";
import { workspaceMessages } from "./workspace";
import { discoveryMessages } from "./discovery";
export const messageGroups = [
  coreMessages,
  calendarMessages,
  entityMessages,
  journeyMessages,
  workspaceMessages,
  discoveryMessages,
];
export const messages: Messages = { ka: {}, en: {}, ru: {} };
for (const group of messageGroups)
  for (const locale of ["ka", "en", "ru"] as const)
    Object.assign(messages[locale], group[locale]);
