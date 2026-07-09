CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE
);

INSERT INTO users (name, email) VALUES ('张三', 'zhangsan@example.com'), ('李四', 'lisi@example.com')
ON CONFLICT (email) DO NOTHING;
