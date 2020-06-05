'use strict'

const fp = require('fastify-plugin')
const path = require('path');
const pg = require('pg');
const pgp = require('pg-promise');
const { migrate } = require('postgres-migrations');

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(async function (fastify, opts) {
  const uri = 'postgresql://job_queue:localhost@localhost/job_queue';

  const client = new pg.Client(uri);
  await client.connect();
  await migrate({ client }, path.join(__dirname, '../migrations'));

  const db = pgp()(uri)

  let jobNumber = 1;

  const insertJob = async (payload = 'pay') => {
    await db.query(`
  INSERT INTO job_queue (payload)
  VALUES ($1)
  `, [payload + '-' + jobNumber++]);

    return false;
  }

  const getNextJob = async () => {
    return db.tx(async t => {

      // advisory locks are really cool
      await t.query('select pg_advisory_xact_lock(1)')

      const data = await t.manyOrNone(`
      SELECT id, payload
      FROM job_queue
      WHERE status = 'pending'
      ORDER BY created_at ASC
      LIMIT 10
      `)
      for (let row of data) {
        await t.query(`UPDATE job_queue SET status = 'complete' WHERE id = $1`, [row.id]);
        console.log('processing job id - ' + row.id)
      }

      return false;
    })

  };

  fastify.decorate('db', {
    db, insertJob, getNextJob
  });
})
