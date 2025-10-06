import { pool } from '../server/db';

async function grantAdminByEmail() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Error: Email address is required');
    console.log('Usage: tsx scripts/grant-admin-by-email.ts EMAIL');
    console.log('Example: tsx scripts/grant-admin-by-email.ts user@example.com');
    process.exit(1);
  }

  try {
    // Find user by email
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, username, email, role',
      ['admin', email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      console.error(`❌ Error: No user found with email '${email}'`);
      console.log('');
      console.log('Available users:');
      const users = await pool.query('SELECT id, username, email, role FROM users ORDER BY id');
      console.table(users.rows);
      process.exit(1);
    }

    const user = result.rows[0];
    console.log('✅ User granted admin privileges!');
    console.log('');
    console.log('Updated user:', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

grantAdminByEmail();
