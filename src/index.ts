import { Hono } from 'hono'
import { type Ctx } from './ctx-types'
import { dbClient } from './db/db'
import * as Drizzle from './drz'

const fn = new Hono<Ctx>()

fn.use(async (c, next) => {
  const db = await dbClient(c.env.HYPERDRIVE.connectionString);
  c.set("db", db);

  await next();

  c.executionCtx.waitUntil(db.$client.end());
})

fn.get("/api/users", Drizzle.listUsers)
  .get("/api/users/:id", Drizzle.getUserById)
  .post("/api/users", Drizzle.createUser)
  .put("/api/users/:id", Drizzle.updateUser)
  .delete("/api/users/:id", Drizzle.deleteUser)

fn.get("/api/books", Drizzle.listBooks)
  .get("/api/books/:id", Drizzle.getBookById)
  .post("/api/books", Drizzle.createBook)
  .put("/api/books/:id", Drizzle.updateBook)
  .delete("/api/books/:id", Drizzle.deleteBook)

fn.get("/api/borrow", Drizzle.listBorrows)
  .get("/api/borrow/books/:userId", Drizzle.getBorrowByUserId)
  .get("/api/borrow/users/:bookId", Drizzle.getBorrowByBookId)
  .get("/api/borrow/:userId/:bookId", Drizzle.getBorrowById)
  .post("/api/borrow", Drizzle.createBorrow)

export default fn
