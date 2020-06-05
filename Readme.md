### Postgres Job Queue Table Example

1. basic job queue

2. supports full on horizontal scaling thanks to advisory locks

3. important files are `/plugins/db.js` and `/plugins/queue.js`


The gist is, insert thousands of job records that are marked as pending - they are in incrementing order by id so you can verify transaction order is maintained.

Uncomment the task in `queue.js`

Scale the process horizontally

Watch aggregated logs and notice all transactions are run in order :)


Hint: For simple horizontal scale testing locally checkout `npm i -g pm2`

`pm2 start app.js --name app && pm2 scale app +3` - is an easy quick start to scale out 4 processes immediately

