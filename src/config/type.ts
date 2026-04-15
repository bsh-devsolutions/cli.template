export type Config = {
  logger: {
    level: 'info' | 'debug';
    file: {
      enable: boolean;
      path: string;
    };
  };
};
