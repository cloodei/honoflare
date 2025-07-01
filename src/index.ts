import { Hono } from 'hono'
import { Hyperdrive } from '@cloudflare/workers-types'
import * as Pg from './pg'
import * as Drizzle from './drz_w_redis'

const fn = new Hono<{
  Bindings: {
    HYPERDRIVE: Hyperdrive
  }
}>()

fn.get("/api/users", Drizzle.listUsers)
  .get("/api/users/:id", Drizzle.getUserById)
  .post("/api/users", Drizzle.createUser)
  .put("/api/users/:id", Drizzle.updateUser)
  .delete("/api/users/:id", Drizzle.deleteUser)

fn.get("/api/books", Pg.listBooks)
  .get("/api/books/:id", Pg.getBookById)
  .post("/api/books", Pg.createBook)
  .put("/api/books/:id", Pg.updateBook)
  .delete("/api/books/:id", Pg.deleteBook)

fn.get("/api/borrow", Pg.listBorrows)
  .get("/api/borrow/books/:userId", Pg.getBorrowByUserId)
  .get("/api/borrow/users/:bookId", Pg.getBorrowByBookId)
  .get("/api/borrow/:userId/:bookId", Pg.getBorrowById)
  .post("/api/borrow", Pg.createBorrow)

export default fn
