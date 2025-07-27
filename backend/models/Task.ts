import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:     { type: String, required: true },
    description: String,
    status:    { type: String, enum: ['todo', 'doing', 'done'], default: 'todo' },
    priority:  { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate:   Date,
    tags:      [String],
    createdAt: { type: Date, default: Date.now }
});