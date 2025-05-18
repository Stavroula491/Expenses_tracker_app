# Expenses_tracker_app

Steps:
1. Clone the repo.
2. Install dependencies.
3. Set up a PostgreSQL database:
   -Create a datadase (e.g., expenses)
   -Create the required tables:
   '''sql

  CREATE TABLE expenses_summary(
    id SERIAL PRIMARY KEY,
    date DATE,
    category VARCHAR(100),
    title VARCHAR(100),
    amount FLOAT
);
   '''
4. In the index.js replace the following with your details
  const db = new pg.Client({
  user: 'username',
  host: 'localhost',
  database: 'databse_name',
  password: 'yourpassword',
  port: 5432,
  });

5. Run the application.
