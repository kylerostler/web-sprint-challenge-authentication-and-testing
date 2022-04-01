const request = require('supertest')
const db = require('../data/dbConfig')
const server = require('./server')

const testUser = { username: 'darth', password: 'vader'}

const Users = require('./users/users-model')

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
})

beforeEach(async () => {
  await db('users').truncate();
})

afterAll(async () => {
  await db.destroy();
})

test('sanity', () => {
  expect(1).toBe(1)
})

test('[POST] /api/auth/register will register a new user', async () => {
  const res = await request(server).post('/api/auth/register')
    .send(testUser)
  expect(res.status).toBe(201)
})

test('[POST] /api/auth/register will send error if no password or username', async () => {
  const res = await request(server).post('/api/auth/register')
    .send({ username: 'foo' })
  expect(res.status).toBe(422)
})

test('[POST] /api/auth/login will respond with error if no such user', async () => {
  const res = await request(server).post('/api/auth/login')
    .send(testUser)
  expect(res.status).toBe(401)
})

test('[POST] /api/auth/login will login with correct info', async () => {
  await request(server).post('/api/auth/register').send(testUser)

  let res
  res = await request(server).post('/api/auth/login')
    .send(testUser)
  expect(res.body.message).toBe('welcome, darth')
})

test('[GET] /api/jokes send back error if no token', async () => {
  const res = await request(server).get('/api/jokes')
  expect(res.body.message).toBe('token required')
})

test('[GET] /api/jokes send back jokes if there is a token', async () => {
  await request(server).post('/api/auth/register').send(testUser)
  const loggedUser = await request(server).post('/api/auth/login').send(testUser)
  let token = await loggedUser.body.token
  let res
  res = await request(server).get('/api/jokes').set('Authorization', token)
  expect(res.status).toBe(200)
})