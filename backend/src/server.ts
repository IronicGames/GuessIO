import app from './app';
import { config } from './constants/env';

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
