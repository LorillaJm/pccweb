const bcrypt = require('bcryptjs');
const db = require('./config/database');

// Script to create a super admin user for testing
async function createSuperAdmin() {
  try {
    console.log('Creating super admin user...');

    const adminData = {
      email: 'admin@pcc.edu.ph',
      password: 'admin123',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      employeeId: 'ADMIN001'
    };

    // Check if admin already exists
    const existingAdmin = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [adminData.email]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('✅ Super admin already exists:', adminData.email);
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(adminData.password, 12);

    // Insert admin user
    const result = await db.query(`
      INSERT INTO users (
        employee_id, email, password_hash, role,
        first_name, last_name, is_active, email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, true, true)
      RETURNING id, email, role, first_name, last_name
    `, [
      adminData.employeeId,
      adminData.email,
      passwordHash,
      adminData.role,
      adminData.firstName,
      adminData.lastName
    ]);

    console.log('✅ Super admin created successfully:');
    console.log('   Email:', adminData.email);
    console.log('   Password:', adminData.password);
    console.log('   Role:', adminData.role);
    console.log('   ID:', result.rows[0].id);

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
  } finally {
    process.exit();
  }
}

// Run if called directly
if (require.main === module) {
  createSuperAdmin();
}

module.exports = { createSuperAdmin };
