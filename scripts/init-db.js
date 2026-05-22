const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DEMO_PASSWORD_HASH = '$2a$10$G9Z92a55vySQDiKuZjvdt.MWgEwWK3ko.oy8svGQOXYYt8E69Xh0y';

async function createSchema() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'USER',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Ticket" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'OPEN',
      "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "authorId" TEXT NOT NULL,
      "assigneeId" TEXT,
      CONSTRAINT "Ticket_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "Ticket_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Comment" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "content" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "ticketId" TEXT NOT NULL,
      "authorId" TEXT NOT NULL,
      CONSTRAINT "Comment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );
  `);
}

async function seedData() {
  await prisma.user.upsert({
    where: { email: 'admin@helpdesk.io' },
    update: {},
    create: {
      id: 'admin-demo',
      email: 'admin@helpdesk.io',
      password: DEMO_PASSWORD_HASH,
      name: 'Alice Admin',
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'agent@helpdesk.io' },
    update: {},
    create: {
      id: 'agent-demo',
      email: 'agent@helpdesk.io',
      password: DEMO_PASSWORD_HASH,
      name: 'Bob Support',
      role: 'AGENT',
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@helpdesk.io' },
    update: {},
    create: {
      id: 'user-demo',
      email: 'user@helpdesk.io',
      password: DEMO_PASSWORD_HASH,
      name: 'Charlie Client',
      role: 'USER',
    },
  });

  const ticketCount = await prisma.ticket.count();
  if (ticketCount > 0) return;

  await prisma.ticket.createMany({
    data: [
      {
        id: 'ticket-login-demo',
        title: 'Impossible de se connecter a mon compte',
        description: 'Quand je tente de me connecter, je recois une erreur 500.',
        status: 'OPEN',
        priority: 'HIGH',
        authorId: 'user-demo',
        assigneeId: 'agent-demo',
      },
      {
        id: 'ticket-reset-demo',
        title: 'Demande de reinitialisation de mot de passe',
        description: 'Le lien de reset recu par email est expire.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        authorId: 'user-demo',
        assigneeId: 'agent-demo',
      },
      {
        id: 'ticket-invoice-demo',
        title: 'Facture incorrecte',
        description: 'Ma facture de novembre contient une ligne en double.',
        status: 'RESOLVED',
        priority: 'LOW',
        authorId: 'user-demo',
      },
    ],
  });
}

async function main() {
  await createSchema();
  await seedData();
  console.log('Database ready');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
