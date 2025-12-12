import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const isPostgres = knex.client.config.client === 'pg';
  const isMssql = knex.client.config.client === 'mssql';

  // Create enum types (PostgreSQL) or use VARCHAR with CHECK constraints (MSSQL)
  if (isPostgres) {
    await knex.raw(`
      CREATE TYPE user_role AS ENUM ('admin', 'user');
      CREATE TYPE challenge_difficulty AS ENUM ('easy', 'medium', 'hard', 'expert');
    `);
  }

  // Users table
  await knex.schema.createTable('users', (table) => {
    if (isPostgres) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    } else {
      table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    }
    table.string('username', 50).notNullable().unique();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    
    if (isPostgres) {
      table.specificType('role', 'user_role').notNullable().defaultTo('user');
    } else {
      table.string('role', 20).notNullable().defaultTo('user');
    }
    
    table.string('country', 3);
    table.string('affiliation', 100);
    table.boolean('is_verified').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_login');
    table.timestamps(true, true);
  });

  // Add CHECK constraints for MSSQL enums
  if (isMssql) {
    await knex.raw(`ALTER TABLE users ADD CONSTRAINT chk_user_role CHECK (role IN ('admin', 'user'))`);
  }

  // Teams table
  await knex.schema.createTable('teams', (table) => {
    if (isPostgres) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    } else {
      table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    }
    table.string('name', 100).notNullable().unique();
    table.text('description');
    table.string('country', 3);
    table.string('affiliation', 100);
    table.uuid('captain_id').references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);
  });

  // Team members junction table
  await knex.schema.createTable('team_members', (table) => {
    if (isPostgres) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    } else {
      table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    }
    table.uuid('team_id').references('id').inTable('teams').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('joined_at').defaultTo(knex.fn.now());
    table.unique(['team_id', 'user_id']);
  });

  // Challenges table
  await knex.schema.createTable('challenges', (table) => {
    if (isPostgres) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    } else {
      table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    }
    table.string('title', 200).notNullable();
    table.text('description').notNullable();
    
    if (isPostgres) {
      table.specificType('difficulty', 'challenge_difficulty').notNullable();
    } else {
      table.string('difficulty', 20).notNullable();
    }
    
    table.string('category', 50).notNullable();
    table.integer('points').notNullable();
    table.string('flag_hash', 64).notNullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('max_attempts').defaultTo(null);
    table.integer('order_index').defaultTo(0);
    
    if (isPostgres) {
      table.jsonb('metadata');
    } else {
      table.text('metadata'); // MSSQL doesn't have jsonb, use nvarchar(max)
    }
    
    table.timestamps(true, true);
  });

  // Add CHECK constraints for MSSQL enums
  if (isMssql) {
    await knex.raw(`ALTER TABLE challenges ADD CONSTRAINT chk_challenge_difficulty CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert'))`);
  }

  // Challenge files/artifacts table
  await knex.schema.createTable('challenge_files', (table) => {
    if (isPostgres) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    } else {
      table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    }
    table.uuid('challenge_id').references('id').inTable('challenges').onDelete('CASCADE');
    table.string('filename', 255).notNullable();
    table.string('file_path', 500).notNullable();
    table.string('file_type', 50);
    table.integer('file_size');
    table.text('description');
    table.timestamps(true, true);
  });

  // Hints table
  await knex.schema.createTable('hints', (table) => {
    if (isPostgres) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    } else {
      table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    }
    table.uuid('challenge_id').references('id').inTable('challenges').onDelete('CASCADE');
    table.text('content').notNullable();
    table.integer('penalty_points').notNullable().defaultTo(0);
    table.integer('order').notNullable().defaultTo(1);
    table.timestamps(true, true);
  });

  // Submissions table
  await knex.schema.createTable('submissions', (table) => {
    if (isPostgres) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    } else {
      table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    }
    table.uuid('challenge_id').references('id').inTable('challenges').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('team_id').references('id').inTable('teams').onDelete('CASCADE');
    table.string('submitted_flag', 255).notNullable();
    table.boolean('is_correct').notNullable();
    table.integer('points_awarded').defaultTo(0);
    table.boolean('is_first_blood').defaultTo(false);
    table.timestamp('submitted_at').defaultTo(knex.fn.now());
    table.index(['challenge_id', 'user_id']);
    table.index(['challenge_id', 'team_id']);
  });

  // Hint unlocks table
  await knex.schema.createTable('hint_unlocks', (table) => {
    if (isPostgres) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    } else {
      table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    }
    table.uuid('challenge_id').references('id').inTable('challenges').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('hint_index').notNullable();
    table.integer('points_deducted').defaultTo(0);
    table.timestamp('unlocked_at').defaultTo(knex.fn.now());
    table.unique(['challenge_id', 'user_id', 'hint_index']);
    table.index(['user_id']);
  });

  // Scoreboard cache table
  await knex.schema.createTable('scoreboard_cache', (table) => {
    if (isPostgres) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    } else {
      table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    }
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').unique();
    table.uuid('team_id').references('id').inTable('teams').onDelete('CASCADE').unique();
    table.integer('total_points').notNullable().defaultTo(0);
    table.integer('challenges_solved').notNullable().defaultTo(0);
    table.timestamp('last_solve_time');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index('total_points');
    table.index('team_id');
  });

  // Achievements table
  await knex.schema.createTable('achievements', (table) => {
    if (isPostgres) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.jsonb('criteria');
    } else {
      table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
      table.text('criteria');
    }
    table.string('name', 100).notNullable();
    table.text('description');
    table.string('badge_icon', 255);
    table.timestamps(true, true);
  });

  // User achievements junction table
  await knex.schema.createTable('user_achievements', (table) => {
    if (isPostgres) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    } else {
      table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    }
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('achievement_id').references('id').inTable('achievements').onDelete('CASCADE');
    table.timestamp('earned_at').defaultTo(knex.fn.now());
    table.unique(['user_id', 'achievement_id']);
  });

  // Create indexes for performance
  await knex.schema.table('submissions', (table) => {
    table.index('is_correct', 'idx_submissions_correct');
  });
  await knex.schema.table('challenges', (table) => {
    table.index('is_active', 'idx_challenges_active');
  });
  await knex.schema.table('users', (table) => {
    table.index('is_active', 'idx_users_active');
  });
  await knex.schema.table('submissions', (table) => {
    table.index('submitted_at', 'idx_submissions_time');
  });
}

export async function down(knex: Knex): Promise<void> {
  const isPostgres = knex.client.config.client === 'pg';

  await knex.schema.dropTableIfExists('user_achievements');
  await knex.schema.dropTableIfExists('achievements');
  await knex.schema.dropTableIfExists('scoreboard_cache');
  await knex.schema.dropTableIfExists('hint_unlocks');
  await knex.schema.dropTableIfExists('submissions');
  await knex.schema.dropTableIfExists('hints');
  await knex.schema.dropTableIfExists('challenge_files');
  await knex.schema.dropTableIfExists('challenges');
  await knex.schema.dropTableIfExists('team_members');
  await knex.schema.dropTableIfExists('teams');
  await knex.schema.dropTableIfExists('users');

  if (isPostgres) {
    await knex.raw(`
      DROP TYPE IF EXISTS challenge_difficulty;
      DROP TYPE IF EXISTS challenge_type;
      DROP TYPE IF EXISTS user_role;
    `);
  }
}
