import { Logger, ILogObj } from 'tslog';

export const logger: Logger<ILogObj> = new Logger({
  prettyLogTemplate: '{{yyyy}}-{{mm}}-{{dd}} {{hh}}:{{MM}}:{{ss}}\t{{logLevelName}}\t',
  prettyLogTimeZone: 'local',
  minLevel: process.env.DEBUG ? 2 : 3,
});
