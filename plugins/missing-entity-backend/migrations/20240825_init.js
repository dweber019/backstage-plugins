/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('missing_entity', table => {
    table.comment('Table containing results from running missing entity');
    table
      .bigIncrements('index')
      .notNullable()
      .comment('An insert counter to ensure ordering');
    table
      .string('entity_ref')
      .unique()
      .notNullable()
      .comment('The entity_ref that is referencing missing entity_refs_missing');
    table
      .text('entity_refs_missing')
      .comment('The entity_refs_missing referenced by entity_ref');
    table
      .dateTime('processed_date')
      .comment('The timestamp when this entity was processed');
    table
      .dateTime('created_at')
      .defaultTo(knex.fn.now())
      .notNullable()
      .comment('The timestamp when this entry was created');
    table.index('index', 'missing_entity_index_idx');
    table.index('entity_ref', 'missing_entity_entity_ref_idx');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('missing_entity', table => {
    table.dropIndex([], 'missing_entity_index_idx');
    table.dropIndex([], 'missing_entity_entity_ref_idx');
  });
  await knex.schema.dropTable('missing_entity');
};
