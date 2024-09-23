import app from './app';
import sequelize from './config/db';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });
