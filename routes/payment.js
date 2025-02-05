const express = require('express');
const router  = express.Router();
const Payment = require('../models/Payment');
const User    = require('../models/User');  // User model contains the merchant profile// Import the User model to fetch merchant details
module.exports = (io) => {
  const router = express.Router();

  /**
   * POST /api/payment/initiate
   * Creates a new Payment document and returns a redirect URL.
   */
    // Change the route from '/api/initiate' to just '/initiate'
    router.post('/initiate', async (req, res) => {
      try {
        const {
          paymentId,
          merchantId,
          amount,
          payeeName,
          payeeUpiId,
          redirectUri,
          successUri,
          failureUri,
          expiredAt
        } = req.body;
  
        if (!paymentId || !merchantId || !amount || !payeeName || !payeeUpiId) {
          return res.status(400).json({ message: "Missing required fields" });
        }
  
        const newPayment = new Payment({
          paymentId,
          merchantId,
          amount,
          payeeName,
          payeeUpiId,
          redirectUri: redirectUri || null,
          successUri: successUri || null,
          failureUri: failureUri || null,
          expiredAt: expiredAt ? new Date(expiredAt) : undefined,
        });
  
        await newPayment.save();
  
        // Update the redirectUrl to use the correct path
        const redirectUrl = `http://localhost:3000/payment/view/${paymentId}`;
        res.json({ status: "success", redirectUrl });
      } catch (err) {
        console.error("Payment initiation error:", err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

  /**
   * POST /api/payment/update-status
   * Updates the payment status and emits a Socket.IO event.
   */
  router.post('/api/update-status', async (req, res) => {
    try {
      const { paymentId, status } = req.body;
      if (!paymentId || !status) {
        return res.status(400).json({ message: "paymentId and status are required" });
      }

      const allowedStatuses = ["pending", "success", "failed"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value. Allowed values: pending, success, failed" });
      }

      const payment = await Payment.findOne({ paymentId });
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      payment.status = status;
      await payment.save();

      // Emit WS event to the room identified by paymentId.
      if (status === "success") {
        io.to(paymentId).emit("paymentSuccess", { paymentId });
      } else if (status === "pending") {
        io.to(paymentId).emit("paymentPending", { paymentId });
      } else if (status === "failed") {
        io.to(paymentId).emit("paymentFailed", { paymentId });
      }

      res.json({ message: `Payment status updated to ${status}` });
    } catch (err) {
      console.error("Update status error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  /**
   * GET /api/payment/dashboard-data
   * Retrieves payments that are still pending.
   */
  router.get('/api/dashboard-data', async (req, res) => {
    try {
      const pendingPayments = await Payment.find({ status: "pending" });
      res.json(pendingPayments);
    } catch (err) {
      console.error("Dashboard data error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  /**
   * GET /api/payment/history
   * Retrieves the full list of payments.
   */
  router.get('/api/history', async (req, res) => {
    try {
      const history = await Payment.find({});
      res.json(history);
    } catch (err) {
      console.error("Payment history error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  /**
   * GET /payment/view/:paymentid
   * Renders the payment window (payment.ejs) with payment details.
   */
  router.get('/view/:paymentid', async (req, res) => {
    try {
      const payment = await Payment.findOne({ paymentId: req.params.paymentid });
      if (!payment) {
        return res.status(404).send("Payment not found");
      }
  
      let upiId = "";
      let upiName = "";
      console.log("Merchant ID from payment:", payment.merchantId);
      if (payment.merchantId) {
        const merchant = await User.findOne({ merchantId: payment.merchantId });
        console.log("Found merchant:", merchant);
        if (merchant) {
          upiId = merchant.upiId || "";
          upiName = merchant.upiName || "";
        }
      }
  
      // Render the payment page with variables needed by the template.
      res.render('payment', {
        paymentid: payment.paymentId,
        successUri: payment.successUri || "",
        failureUri: payment.failureUri || "",
        amount: payment.amount,
        upiId,    // Merchant's UPI ID
        upiName   // Merchant's UPI Name
      });
    } catch (error) {
      console.error("Error in /view/:paymentid:", error);
      res.status(500).send("Internal Server Error");
    }
  });


  return router;
};