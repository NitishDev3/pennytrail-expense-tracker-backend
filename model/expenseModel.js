const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Food & Groceries',
            'Transport',
            'Lifestyle',
            'Utilities & Bills',
            'Health',
            'Others',
        ],
    },
    date: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
},
    {
        timestamps: true,
    });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;