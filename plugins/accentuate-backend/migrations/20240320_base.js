/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('accentuates', table => {
    table.comment('Table containing accentuates');
    table.string('entity_ref').notNullable().unique();
    table.text('data').notNullable();
    table.dateTime('changed_at').defaultTo(knex.fn.now()).notNullable();
    table.string('changed_by_entity_ref').nullable();
    table.index('entity_ref', 'entity_ref_idx');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('accentuates', table => {
    table.dropIndex([], 'entity_ref_idx');
  });
  await knex.schema.dropTable('accentuates');
};
