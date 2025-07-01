import { Hono } from 'hono'
import { Hyperdrive } from '@cloudflare/workers-types'
import * as Pg from './pg'

const fn = new Hono<{
  Bindings: {
    HYPERDRIVE: Hyperdrive
  }
}>()

fn.get("/api/users", Pg.listUsers)
  .get("/api/users/:id", Pg.getUserById)
  .post("/api/users", Pg.createUser)
  .put("/api/users/:id", Pg.updateUser)
  .delete("/api/users/:id", Pg.deleteUser)

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
