/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('tasks', table => {
    table.comment('Table containing tasks');
    table.uuid('id').unique().notNullable();
    table.string('title').notNullable();
    table.text('text').nullable();
    table.boolean('completed').defaultTo(false).notNullable();
    table.dateTime('due_date').nullable();
    table.dateTime('created_at').defaultTo(knex.fn.now()).notNullable();
    table.string('created_by_entity_ref').nullable();
    table.string('updated_by_entity_ref').nullable();
    table.string('parent_task_id').nullable();
    table
      .foreign('parent_task_id')
      .references('id')
      .inTable('tasks')
      .onDelete('CASCADE');
    table.index('created_by_entity_ref', 'created_by_entity_ref_idx');
    table.index('updated_by_entity_ref', 'updated_by_entity_ref_idx');
  });

  await knex.schema.createTable('entity_refs', table => {
    table.string('task_id').notNullable().comment('Foreign key to tasks.id');
    table
      .foreign('task_id')
      .references('id')
      .inTable('tasks')
      .onDelete('CASCADE');
    table.index('task_id', 'task_id_idx');
    table
      .enum('type', ['assignee', 'target'])
      .comment('Describes the type of relation');
    table
      .string('entity_ref')
      .comment(
        'Is restricted depending on the type, e.g. assignee only users and groups',
      );
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('tasks', table => {
    table.dropIndex([], 'created_by_entity_ref_idx');
    table.dropIndex([], 'updated_by_entity_ref_idx');
  });
  await knex.schema.dropTable('tasks');
  await knex.schema.alterTable('entity_refs', table => {
    table.dropIndex([], 'task_id_idx');
  });
  await knex.schema.dropTable('entity_refs');
};
