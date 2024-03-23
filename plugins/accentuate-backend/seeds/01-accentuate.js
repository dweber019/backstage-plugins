/* eslint-disable */
const { DateTime } = require('luxon');

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function seed(knex) {
  const component = createAccentuate('component:default/component-accentuate', {
    spec: {
      system: 'system:default/system-accentuate',
      dependsOn: ['resource:default/resource-accentuate'],
    },
  });
  const group = createAccentuate('group:default/group-accentuate', {
    spec: {
      members: ['user:default/user-accentuate'],
    },
  });
  const resource = createAccentuate('resource:default/resource-accentuate', {
    spec: {
      owner: 'user:default/user-accentuate',
      system: 'system:default/system-accentuate',
    },
  });
  const user = createAccentuate('user:default/user-accentuate', {
    spec: {
      profile: {
        email: 'john-doe@accentuate.com',
      },
    },
  });
  const system = createAccentuate('system:default/system-accentuate', {
    spec: {
      owner: 'user:default/user-accentuate',
    },
  });

  await knex('accentuates').truncate();
  await knex('accentuates').insert([component, group, resource, user, system]);
};

function createAccentuate(entity_ref, data) {
  return {
    entity_ref,
    data: JSON.stringify(data),
    changed_at: DateTime.now().toFormat('yyyy-MM-dd TT'),
    changed_by_entity_ref: 'user:default/user-accentuate',
  };
}
