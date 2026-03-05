const Razorpay = require('razorpay');
const crypto = require('crypto');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * @desc    Create Razorpay Order
 * @route   POST /api/v1/payments/create-order
 * @access  Private
 */
exports.createOrder = asyncHandler(async (req, res) => {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
        throw new ApiError(400, 'Amount is required');
    }

    const options = {
        amount: amount * 100, // amount in the smallest currency unit (paise)
        currency,
        receipt: receipt || `receipt_${Date.now()}`
    };

    // Demo Mode Bypass: If using placeholder keys, return a mock order
    if (process.env.RAZORPAY_KEY_ID === 'rzp_test_V8h7X6c5B4n3M2') {
        return res.status(200).json({
            success: true,
            demoMode: true,
            order: {
                id: `order_demo_${Date.now()}`,
                amount: amount * 100,
                currency: 'INR',
                receipt: options.receipt,
                status: 'created'
            }
        });
    }

    try {
        const order = await razorpay.orders.create(options);
        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        throw new ApiError(500, 'Error creating Razorpay order');
    }
});

/**
 * @desc    Verify Razorpay Payment
 * @route   POST /api/v1/payments/verify
 * @access  Private
 */
exports.verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Demo Mode Bypass
    if (razorpay_order_id.startsWith('order_demo_')) {
        return res.status(200).json({
            success: true,
            demoMode: true,
            message: "Payment verified successfully (Demo Mode)"
        });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

    if (razorpay_signature === expectedSign) {
        res.status(200).json({
            success: true,
            message: "Payment verified successfully"
        });
    } else {
        throw new ApiError(400, "Invalid payment signature");
    }
});
