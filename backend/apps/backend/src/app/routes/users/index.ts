import { FastifyInstance } from 'fastify';
import { z } from 'zod';

// Schema for user creation
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().optional(),
});

// Schema for user update
const updateUserSchema = z.object({
  email: z.string().email().optional(),
  full_name: z.string().optional(),
});

export default async function (fastify: FastifyInstance) {
  // Get all users
  fastify.get('/', async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'SELECT id, email, full_name, created_at, updated_at FROM users'
      );
      return result.rows;
    } finally {
      client.release();
    }
  });

  // Get user by ID
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const client = await fastify.pg.connect();
    try {
      const result = await client.query(
        'SELECT id, email, full_name, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        reply.code(404);
        return { error: 'User not found' };
      }
      
      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Create new user
  fastify.post('/', async (request, reply) => {
    const userData = createUserSchema.parse(request.body);
    const client = await fastify.pg.connect();
    
    try {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [userData.email]
      );
      
      if (existingUser.rows.length > 0) {
        reply.code(409);
        return { error: 'User with this email already exists' };
      }

      // TODO: Hash password before storing
      const result = await client.query(
        'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, created_at, updated_at',
        [userData.email, userData.password, userData.full_name]
      );
      
      reply.code(201);
      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Update user
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const updateData = updateUserSchema.parse(request.body);
    const client = await fastify.pg.connect();
    
    try {
      // Check if user exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE id = $1',
        [id]
      );
      
      if (existingUser.rows.length === 0) {
        reply.code(404);
        return { error: 'User not found' };
      }

      // Build update query dynamically based on provided fields
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (updateData.email) {
        updates.push(`email = $${paramCount}`);
        values.push(updateData.email);
        paramCount++;
      }

      if (updateData.full_name) {
        updates.push(`full_name = $${paramCount}`);
        values.push(updateData.full_name);
        paramCount++;
      }

      if (updates.length === 0) {
        return { message: 'No fields to update' };
      }

      values.push(id);
      const result = await client.query(
        `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $${paramCount} 
         RETURNING id, email, full_name, created_at, updated_at`,
        values
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  });

  // Delete user
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const client = await fastify.pg.connect();
    
    try {
      const result = await client.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );
      
      if (result.rows.length === 0) {
        reply.code(404);
        return { error: 'User not found' };
      }
      
      return { message: 'User deleted successfully' };
    } finally {
      client.release();
    }
  });
} 