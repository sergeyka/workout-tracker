import { DataSource, Logger } from "typeorm";

export function setQueryLogging(dataSource: DataSource, enable: boolean): void {
  dataSource.setOptions({
        logging: enable,
        logger: "advanced-console"
      })
}