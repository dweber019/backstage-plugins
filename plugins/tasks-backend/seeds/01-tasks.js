/* eslint-disable */
const { DateTime } = require('luxon');
const { faker } = require('@faker-js/faker');

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function seed(knex) {
  const taskSimple = createTask(
    'Simple task',
    undefined,
    false,
    undefined,
    undefined,
    undefined,
    undefined,
  );
  const taskWithTarget = createTask(
    'Simple task for task-1',
    undefined,
    false,
    undefined,
    undefined,
    undefined,
    undefined,
  );
  const taskLageText = createTask(
    'Log text task - ' + faker.lorem.sentence(10),
    faker.lorem.text(),
    false,
    undefined,
    undefined,
    undefined,
    undefined,
  );
  const taskDueDate = createTask(
    'Due date task',
    undefined,
    false,
    DateTime.fromJSDate(faker.date.soon({ days: 10 })).toFormat(
      'yyyy-LL-dd TT',
    ),
    undefined,
    undefined,
    undefined,
  );

  const taskParent = createTask(
    'Simple parent task',
    undefined,
    false,
    undefined,
    undefined,
    undefined,
    undefined,
  );
  const subTask1 = createTask(
    'Simple sub task 1',
    undefined,
    false,
    undefined,
    undefined,
    undefined,
    taskParent.id,
  );
  const subTask2 = createTask(
    'Simple sub task 2',
    undefined,
    false,
    undefined,
    undefined,
    undefined,
    taskParent.id,
  );

  await knex('tasks').truncate();
  await knex('tasks').insert([
    taskSimple,
    taskWithTarget,
    taskLageText,
    taskDueDate,
    taskParent,
    subTask1,
    subTask2,
  ]);

  await knex('entity_refs').truncate();
  await knex('entity_refs').insert([
    createEntityRef(taskWithTarget.id, 'target', 'component:default/task-1'),
  ]);
};

function createTask(
  title,
  text,
  completed,
  due_date,
  created_by_entity_ref,
  updated_by_entity_ref,
  parent_task_id,
) {
  return {
    id: faker.string.uuid(),
    title,
    text,
    completed,
    due_date,
    created_by_entity_ref,
    updated_by_entity_ref,
    parent_task_id,
  };
}

function createEntityRef(task_id, type, entity_ref) {
  return {
    task_id,
    type,
    entity_ref,
  };
}
