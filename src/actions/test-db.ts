"use server";

import { PrismaClient } from "../generated/prisma/client";
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

// Create adapter using PoolConfig as required by Prisma v7
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function testDbConnection() {
  try {
    // We create a test connection record
    const record = await prisma.testConnection.create({
      data: {
        message: "Hello from Server Action! Connection successful."
      }
    });
    
    // We fetch all records
    const records = await prisma.testConnection.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return { 
      success: true, 
      message: "Database connection tested successfully!",
      records
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || String(error)
    };
  }
}
