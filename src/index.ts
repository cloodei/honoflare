import { Hono } from 'hono'
import { Hyperdrive } from '@cloudflare/workers-types'
import * as users from './drz/users'
import * as books from './drz/books'
import * as borrow from './drz/borrow'

const app = new Hono<{
  Bindings: {
    HYPERDRIVE: Hyperdrive
  }
}>()

app.get("/api/users", users.listUsers)
app.get("/api/users/:id", users.getUserById)
app.post("/api/users", users.createUser)
app.put("/api/users/:id", users.updateUser)
app.delete("/api/users/:id", users.deleteUser)

app.get("/api/books", books.listBooks)
app.get("/api/books/:id", books.getBookById)
app.post("/api/books", books.createBook)
app.put("/api/books/:id", books.updateBook)
app.delete("/api/books/:id", books.deleteBook)

app.get("/api/borrow", borrow.listBorrows)
app.get("/api/borrow/books/:userId", borrow.getBorrowByUserId)
app.get("/api/borrow/users/:bookId", borrow.getBorrowByBookId)
app.get("/api/borrow/:userId/:bookId", borrow.getBorrowById)
app.post("/api/borrow", borrow.createBorrow)

export default app
