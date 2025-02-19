import { PrismaClient } from '@prisma/client';
import readline from 'readline';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (question: string): Promise<string> => {
    return new Promise((resolve) => rl.question(question, resolve));
};

const main = async () => {
    try {
        const username = await askQuestion('Enter username: ');
        const email = await askQuestion('Enter email: ');
        const password = await askQuestion('Enter password: ');

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: {
                username,
                email,
                password: hashedPassword,
                isAdmin: true
            }
        });
        const { password: userPassword, ...userWithoutPassword } = user;
        console.log('User created:', userWithoutPassword);
    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
};

main();