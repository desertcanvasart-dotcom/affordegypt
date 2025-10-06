import bcrypt from 'bcrypt';
import { pool } from '../server/db';

const SALT_ROUNDS = 10;

async function changeAdminPassword() {
  const username = 'staff'; // Admin username
  const newPassword = process.argv[2]; // Get password from command line argument

  if (!newPassword) {
    console.error('❌ Error: Please provide a new password as an argument');
    console.log('Usage: tsx scripts/change-admin-password.ts YOUR_NEW_PASSWORD');
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error('❌ Error: Password must be at least 6 characters long');
    process.exit(1);
  }

  try {
    // Hash the new password
    console.log('🔐 Hashing new password...');
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update the database
    console.log('💾 Updating database...');
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE username = $2 RETURNING id, username, email, role',
      [hashedPassword, username]
    );

    if (result.rows.length === 0) {
      console.error(`❌ Error: User '${username}' not found`);
      process.exit(1);
    }

    const user = result.rows[0];
    console.log('✅ Password updated successfully!');
    console.log('');
    console.log('Updated user:', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
    console.log('');
    console.log('🔑 New credentials:');
    console.log(`   Username: ${user.username}`);
    console.log(`   Password: ${newPassword}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating password:', error);
    process.exit(1);
  }
}

changeAdminPassword();
