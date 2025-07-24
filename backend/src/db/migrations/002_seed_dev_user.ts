import { Migration } from "../migrationRunner";

const migration: Migration = {
  id: "002",
  name: "seed_dev_user",

  up: () => `
    INSERT OR IGNORE INTO users (name, username, password) VALUES 
      ('DevUser', 'dev', '${process.env.DEV_USER_PASSWORD_HASH}');
  `,

  down: `
    DELETE FROM users WHERE username = 'dev';
  `,
};

export default migration;
