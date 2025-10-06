import bcrypt from 'bcrypt';
import { pool } from '../server/db';

const SALT_ROUNDS = 10;

async function addAdmin() {
  const email = process.argv[2];
  const username = process.argv[3];
  const password = process.argv[4];

  if (!email || !username || !password) {
    console.error('❌ Error: Missing required arguments');
    console.log('Usage: tsx scripts/add-admin.ts EMAIL USERNAME PASSWORD');
    console.log('Example: tsx scripts/add-admin.ts admin@example.com adminuser MySecurePass123');
    process.exit(1);
  }

  try {
    // Check if user with this email already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email.toLowerCase().trim(), username]
    );

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      
      // If user exists, just update their role to admin
      await pool.query(
        'UPDATE users SET role = $1 WHERE id = $2',
        ['admin', user.id]
      );
      
      console.log('✅ Existing user upgraded to admin!');
      console.log({
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'admin'
      });
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      
      const result = await pool.query(
        `INSERT INTO users (username, email, password, role, is_active, email_verified) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, username, email, role`,
        [username, email.toLowerCase().trim(), hashedPassword, 'admin', true, true]
      );
      
      const newUser = result.rows[0];
      console.log('✅ New admin user created successfully!');
      console.log({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      });
    }

    console.log('');
    console.log('🔑 Admin credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addAdmin();
