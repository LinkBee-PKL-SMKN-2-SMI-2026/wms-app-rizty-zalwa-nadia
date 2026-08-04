import 'dotenv/config';
import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Mulai melakukan seeding data...');

  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.users.upsert({
    where: {
      email: 'admin@wms.com',
    },
    update: {},
    create: {
      name: 'Admin WMS',
      email: 'admin@wms.com',
      password: passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  const elektronik = await prisma.categories.upsert({
    where: {
      name: 'Elektronik',
    },
    update: {},
    create: {
      name: 'Elektronik',
      description: 'Produk elektronik',
    },
  });

  const furniture = await prisma.categories.upsert({
    where: {
      name: 'Furniture',
    },
    update: {},
    create: {
      name: 'Furniture',
      description: 'Perabotan kantor',
    },
  });

  const atk = await prisma.categories.upsert({
    where: {
      name: 'ATK',
    },
    update: {},
    create: {
      name: 'ATK',
      description: 'Alat tulis kantor',
    },
  });

  const rakA1 = await prisma.locations.upsert({
    where: {
      code: 'A1',
    },
    update: {},
    create: {
      name: 'Rak A1',
      code: 'A1',
    },
  });

  const rakA2 = await prisma.locations.upsert({
    where: {
      code: 'A2',
    },
    update: {},
    create: {
      name: 'Rak A2',
      code: 'A2',
    },
  });

  const gudangB1 = await prisma.locations.upsert({
    where: {
      code: 'B1',
    },
    update: {},
    create: {
      name: 'Gudang B1',
      code: 'B1',
    },
  });

  await prisma.products.upsert({
    where: {
      sku: 'ELK-001',
    },
    update: {},
    create: {
      name: 'Laptop',
      sku: 'ELK-001',
      description: 'Laptop untuk kebutuhan kantor',
      stock: 10,
      minimumStock: 2,
      categoryId: elektronik.id,
      locationId: rakA1.id,
    },
  });

  await prisma.products.upsert({
    where: {
      sku: 'ELK-002',
    },
    update: {},
    create: {
      name: 'Keyboard',
      sku: 'ELK-002',
      description: 'Keyboard untuk komputer',
      stock: 20,
      minimumStock: 5,
      categoryId: elektronik.id,
      locationId: rakA1.id,
    },
  });

  await prisma.products.upsert({
    where: {
      sku: 'FUR-001',
    },
    update: {},
    create: {
      name: 'Meja Kantor',
      sku: 'FUR-001',
      description: 'Meja untuk kebutuhan kantor',
      stock: 5,
      minimumStock: 1,
      categoryId: furniture.id,
      locationId: rakA2.id,
    },
  });

  await prisma.products.upsert({
    where: {
      sku: 'FUR-002',
    },
    update: {},
    create: {
      name: 'Kursi Kantor',
      sku: 'FUR-002',
      description: 'Kursi untuk kebutuhan kantor',
      stock: 10,
      minimumStock: 2,
      categoryId: furniture.id,
      locationId: gudangB1.id,
    },
  });

  await prisma.products.upsert({
    where: {
      sku: 'ATK-001',
    },
    update: {},
    create: {
      name: 'Buku Tulis',
      sku: 'ATK-001',
      description: 'Buku tulis untuk kebutuhan kantor',
      stock: 50,
      minimumStock: 10,
      categoryId: atk.id,
      locationId: rakA2.id,
    },
  });

  console.log('✅ Seeding selesai! Data yang dibuat:');
  console.log('Admin:', admin.email);
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
