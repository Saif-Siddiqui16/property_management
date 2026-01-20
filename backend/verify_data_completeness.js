const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
    console.log('--- Starting Data Completeness Verification ---');

    try {
        // 1. Create a test company with full address and contacts
        console.log('\nTesting Company creation with full data...');
        const testCompany = await prisma.user.create({
            data: {
                name: 'Test Tech Corp',
                email: `tech-${Date.now()}@example.com`,
                phone: '123-456-7890',
                type: 'COMPANY',
                companyName: 'Test Tech Corp',
                street: '123 Innovation Way',
                street2: 'Suite 500',
                city: 'Silicon Valley',
                state: 'CA',
                postalCode: '94025',
                country: 'USA',
                role: 'TENANT',
                companyContacts: {
                    create: [
                        { name: 'John Doe', email: 'john@testtech.com', phone: '111-222-3333', role: 'CTO' },
                        { name: 'Jane Smith', email: 'jane@testtech.com', role: 'Operations' }
                    ]
                }
            },
            include: {
                companyContacts: true
            }
        });

        console.log('Result:', {
            id: testCompany.id,
            address: `${testCompany.street}, ${testCompany.street2}, ${testCompany.city}`,
            contactsCount: testCompany.companyContacts.length
        });

        if (testCompany.street2 === 'Suite 500' && testCompany.companyContacts.length === 2) {
            console.log('✅ Company data persistence verified.');
        } else {
            console.error('❌ Company data persistence failed.');
        }

        // 2. Create a test resident with contact info
        console.log('\nTesting Resident creation with email/phone...');
        const testResident = await prisma.resident.create({
            data: {
                tenantId: testCompany.id,
                firstName: 'Resident',
                lastName: 'One',
                email: 'resident1@example.com',
                phone: '555-0199'
            }
        });

        console.log('Result:', {
            id: testResident.id,
            email: testResident.email,
            phone: testResident.phone
        });

        if (testResident.email === 'resident1@example.com' && testResident.phone === '555-0199') {
            console.log('✅ Resident data persistence verified.');
        } else {
            console.error('❌ Resident data persistence failed.');
        }

        // 3. Clean up
        console.log('\nCleaning up test data...');
        await prisma.resident.delete({ where: { id: testResident.id } });
        await prisma.companyContact.deleteMany({ where: { companyId: testCompany.id } });
        await prisma.user.delete({ where: { id: testCompany.id } });
        console.log('✅ Cleanup successful.');

    } catch (error) {
        console.error('❌ Verification failed with error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
