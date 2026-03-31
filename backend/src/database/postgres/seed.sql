INSERT INTO
    users (email, password_hash, display_name, bio, role)
VALUES
    (
        'zac@example.com',
        '$2b$10$replace_this_with_a_real_bcrypt_hash',
        'Zac',
        'Software engineer building a security demo app.',
        'admin'
    ),
    (
        'demo@example.com',
        '$2b$10$replace_this_with_a_real_bcrypt_hash',
        'Demo User',
        'Hello, I am a normal user.',
        'user'
    ),
    (
        'john@example.com',
        '$2b$10$replace_this_with_a_real_bcrypt_hash',
        'John',
        'Hello, I am a normal user.',
        'user'
    );

;