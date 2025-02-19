const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

/**
 * Main seeding function
 * This will:
 * 1. Generate Prisma client
 * 2. Run database migrations
 * 3. Create a development user if none exists
 */
async function main() {
  try {
    // Setup database and generate Prisma client
    console.log('Setting up database...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });

    // Check if a user already exists
    const existingUser = await prisma.users.findFirst();
    
    if (!existingUser) {
      console.log('Creating development user...');
      
      // Create default development user
      await prisma.users.create({
        data: {
          email: 'test@test.com',
          username: 'test',
          password: await bcrypt.hash('test', 10),
          isAdmin: true,
          description: 'Development User'
        }
      });

      console.log('Development user created successfully!');
      console.log('Credentials:');
      console.log('- Email: test@test.com');
      console.log('- Password: test');
    } else {
      console.log('A user already exists in the database.');
    }
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
