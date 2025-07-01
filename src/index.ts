import { Hono } from 'hono'
import { type Ctx } from './ctx-types'
import * as Drizzle from './drz'

const fn = new Hono<Ctx>()

fn.get("/api/users", Drizzle.listUsers)
  .get("/api/users/:id", Drizzle.getUserById)
  .post("/api/users", Drizzle.createUser)
  .post("/api/users/:id", Drizzle.createUser)
  .put("/api/users/:id", Drizzle.updateUser)
  .delete("/api/users/:id", Drizzle.deleteUser)

fn.get("/api/books", Drizzle.listBooks)
  .get("/api/books/:id", Drizzle.getBookById)
  .post("/api/books", Drizzle.createBook)
  .post("/api/books/:id", Drizzle.createBook)
  .put("/api/books/:id", Drizzle.updateBook)
  .delete("/api/books/:id", Drizzle.deleteBook)

fn.get("/api/borrow", Drizzle.listBorrows)
  .get("/api/borrow/books/:userId", Drizzle.getBorrowByUserId)
  .get("/api/borrow/users/:bookId", Drizzle.getBorrowByBookId)
  .get("/api/borrow/:userId/:bookId", Drizzle.getBorrowById)
  .post("/api/borrow", Drizzle.createBorrow)
  .post("/api/borrow/:id", Drizzle.createBorrow)
  .post("/api/borrow/:userId/:bookId", Drizzle.createBorrow)

export default fn
