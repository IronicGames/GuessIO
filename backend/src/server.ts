import app from './app';
import { config } from './utils/constants/env';

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
