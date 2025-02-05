// kedbog-backend/app.js
const express    = require('express');
const mongoose   = require('mongoose');
const bodyParser = require('body-parser');
const path       = require('path');
const cors       = require('cors');
const session    = require('express-session');
const http       = require('http');
const socketIo   = require('socket.io');

// Route files
const authRoutes     = require('./routes/auth');
const paymentRoutes  = require('./routes/payment'); // Updated to be a function accepting io
const merchantRoutes = require('./routes/merchant');
const profileRoutes  = require('./routes/profile');
const pagesRoutes    = require('./routes/pages');

const app = express();

// Create an HTTP server and initialize Socket.IO.
const server = http.createServer(app);
const io = socketIo(server);

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Express-session middleware (adjust secret/config for production)
app.use(session({
  secret: 'mySuperSecret',
  resave: false,
  saveUninitialized: false
}));

// Set view engine (EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Connect to MongoDB Atlas
const dbURI = 'mongodb+srv://kassuvidid:Yash%401234@kassucluster.5ggjq.mongodb.net/?retryWrites=true&w=majority&appName=KassuCluster';
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Atlas connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mount API Routes
// IMPORTANT: Pass the Socket.IO instance into the payment routes.
// app.use('/api/payment', paymentRoutes(io));
app.use('/payment', paymentRoutes(io));
app.use('/api/merchant', merchantRoutes);
app.use('/api/profile', profileRoutes);

// Mount Auth routes (signup, login, logout)
app.use('/', authRoutes);

// Mount Frontend Pages routes (dashboard, profile, etc.)
app.use('/', pagesRoutes);

// Serve static files (for example, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Default home route
app.get('/', (req, res) => {
  res.render('index', { title: 'Home', user: req.session.user });
});

// NEW: Payment Window Route.
// This is the URL that will be returned from /api/payment/initiate and opened in a new window.
// app.get('/payment/view/:paymentid', (req, res) => {
//   res.render('payment', { paymentid: req.params.paymentid });
// });

// Socket.IO connection handling.
io.on('connection', (socket) => {
  socket.on('joinPaymentRoom', (data) => {
    const { paymentId } = data;  // Corrected: use "paymentId" (camelCase)
    if (paymentId) {
      socket.join(paymentId);
      console.log(`Socket ${socket.id} joined room ${paymentId}`);
    } else {
      console.warn(`Socket ${socket.id} attempted to join without a valid paymentId`);
    }
  });
});
// Start Server using the HTTP server.
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});