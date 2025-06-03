import { teardown } from 'jest-dev-server';

export default async (globalConfig: unknown) => {
  await teardown(globalConfig as any);
};
