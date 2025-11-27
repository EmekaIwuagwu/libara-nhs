#!/usr/bin/env node
/**
 * Debug script to test authentication flow
 * Run: node debug-auth.js
 */

const User = require('./src/models/User');
const bcrypt = require('bcrypt');

async function debugAuth() {
  console.log('\n🔍 Authentication Debug Script\n');

  try {
    // Test 1: Check if we can find a recently created user
    console.log('📋 Test 1: Checking recent users...');
    const { query } = require('./src/config/database');

    const recentUsers = await query(
      'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );

    console.log(`Found ${recentUsers.length} recent users:`);
    recentUsers.forEach(user => {
      console.log(`  - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
    });

    if (recentUsers.length === 0) {
      console.log('❌ No users found in database!');
      process.exit(0);
    }

    // Test 2: Check session table
    console.log('\n📋 Test 2: Checking sessions table...');
    const sessions = await query('SELECT * FROM sessions ORDER BY expires DESC LIMIT 5');
    console.log(`Found ${sessions.length} sessions in database`);

    // Test 3: Try to login with the most recent user
    const testUser = recentUsers[0];
    console.log(`\n📋 Test 3: Testing login for user: ${testUser.username}`);
    console.log('Enter the password you used during registration:');

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('Password: ', async (password) => {
      readline.close();

      // Find user
      const user = await User.findByUsername(testUser.username);
      if (!user) {
        console.log('❌ User not found by findByUsername');
        process.exit(1);
      }

      console.log('✓ User found:', user.username);
      console.log('  Stored password hash:', user.password.substring(0, 20) + '...');

      // Verify password
      const isValid = await User.verifyPassword(password, user.password);
      console.log('  Password verification:', isValid ? '✓ VALID' : '❌ INVALID');

      if (!isValid) {
        console.log('\n💡 Password does not match. This is why login fails.');
        console.log('   Try registering a new account or use the correct password.');
      } else {
        console.log('\n✓ Password is correct! Login should work.');
        console.log('   If login still fails, the issue is with session management.');
      }

      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error during debug:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  debugAuth();
}
