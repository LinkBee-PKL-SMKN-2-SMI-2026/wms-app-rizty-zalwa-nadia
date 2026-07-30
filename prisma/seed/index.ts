import 'dotenv/config';
import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { genSaltSync, hashSync } from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const salt = genSaltSync(10)

//hi
async function main() {
  console.log('🌱 Mulai melakukan seeding data...');
  
  const User = await prisma.users.upsert({
    where: { email: 'admin@wms.com' },
    update: {},
    create: {
      name: 'Admin WMS',
      email: 'admin@wms.com',
      password: hashSync('admin123', salt),
      role: 'ADMIN'
    },
  });
  
  const elektronik = await prisma.categories.upsert({
    where: { name: 'Elektronik' },
    update: {},
    create: {
      name: 'Elektronik',
      description: 'Perangkat elektronik dan gadget'
    },
  });
  const furniture = await prisma.categories.upsert({
    where: { name: 'Furniture' },
    update: {},
    create: {
      name: 'Furniture',
      description: 'Peralatan mebel kantor dan rumah'
    },
  });
  const atk = await prisma.categories.upsert({
    where: { name: 'ATK' },
    update: {},
    create: {
      name: 'ATK',
      description: 'Alat Tulis Kantor'
    },
  });
  
  const rakA1 = await prisma.locations.upsert({
    where: { code: 'RAK-A1' },
    update: {},
    create: {
      name: 'Rak A1',
      code: 'RAK-A1'
    },
  });
  const rakA2 = await prisma.locations.upsert({
    where: { code: 'RAK-A2' },
    update: {},
    create: {
      name: 'Rak A2',
      code: 'RAK-A2' },
  });
  const gudangB1 = await prisma.locations.upsert({
    where: { code: 'GUD-B1' },
    update: {},
    create: { name: 'Gudang B1', code: 'GUD-B1' },
  });
  
  const productsData = [
    { 
        name: 'Laptop Asus', sku: 'LAP-ASUS-001', 
        description: 'Laptop performa tinggi untuk kerja', 
        stock: 5, minimumStock: 2, 
        categoryId: elektronik.id, locationId: rakA1.id 
    },
    { 
        name: 'Meja Kantor', sku: 'FUR-MEJA-001', 
        description: 'Meja kayu minimalis', 
        stock: 10, minimumStock: 3, 
        categoryId: furniture.id, locationId: gudangB1.id 
    },
    { 
        name: 'Kursi Gaming', sku: 'FUR-KURSI-001', 
        description: 'Kursi ergonomis nyaman', 
        stock: 8, minimumStock: 2, 
        categoryId: furniture.id, locationId: gudangB1.id 
    },
    { 
        name: 'Kertas A4', sku: 'ATK-KERTAS-001', 
        description: 'Kertas HVS 80gr', 
        stock: 100, minimumStock: 20, 
        categoryId: atk.id, locationId: rakA2.id 
    },
    { 
        name: 'Mouse Wireless', sku: 'ELK-MOUSE-001', 
        description: 'Mouse ergonomis tanpa kabel', 
        stock: 15, minimumStock: 5, 
        categoryId: elektronik.id, locationId: rakA1.id 
    },
  ];

  for (const p of productsData) {
    await prisma.products.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
  }

  console.log('✅ Seeding selesai!');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
