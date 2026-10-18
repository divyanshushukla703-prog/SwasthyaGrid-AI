import { runAllSystemTests } from './src/tests/system.test';

try {
  runAllSystemTests();
  process.exit(0);
} catch (error) {
  console.error(error);
  process.exit(1);
}
