import type { Messages } from "../config";
import { coreMessages } from "./core";
import { calendarMessages } from "./calendar";
import { entityMessages } from "./entities";
import { journeyMessages } from "./journey";
import { workspaceMessages } from "./workspace";
import { discoveryMessages } from "./discovery";
import { styleHeroMessages } from "./style-hero";
import { filtersMessages } from "./filters";
export const messageGroups = [
  styleHeroMessages,
  filtersMessages,
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
