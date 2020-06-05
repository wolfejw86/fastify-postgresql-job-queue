const fp = require('fastify-plugin')
const { EventEmitter } = require('events');

class RepeatTask {
  constructor(task = async () => true) {
    this.task = task;
    this.emitter = new EventEmitter();
    this.total = 1;
    this.emitter.on('run', this.runTask.bind(this));
  }

  async runTask() {
    try {
      console.log('running task ' + this.total++);
      const pauseAfterFinished = await this.task();

      if (pauseAfterFinished) {
        await this.sleep();
      }
    } catch (error) {
      console.log(error);
      await this.sleep();
    } finally {
      this.run();
    }
  }

  run() {
    this.emitter.emit('run');
  }

  sleep() {
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
}

module.exports = fp((fastify, opts, next) => {

  // uncomment after there are thousands of records in db
  // startup app.js and scale the process out to as many as you like
  // notice all jobs still run in order

  const task1 = new RepeatTask(async () => {
    return fastify.db.getNextJob();
  });
  task1.run();

  // let app insert thousands of records with incrementing payloads
  // then comment this task out
  // const task2 = new RepeatTask(async () => {
  //   return fastify.db.insertJob();
  // });
  // task2.run();



  

  next();
});