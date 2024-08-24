/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('subscriptions', table => {
    table.comment('Table containing subscriptions');
    table.string('entity_ref').notNullable();
    table.string('user_entity_ref').notNullable();
    table.string('type').notNullable();
    table.index('entity_ref', 'entity_ref_idx');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('subscriptions', table => {
    table.dropIndex([], 'entity_ref_idx');
  });
  await knex.schema.dropTable('subscriptions');
};
