import mongoose from 'mongoose';

const interactionItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  reason: { type: String, required: true },
  itemDate: {
    startDateTime: { type: Date, required: true },
    endDateTime: Date
  },
  resolution: String,
  status: {
    type: String,
    enum: ['pending', 'inProgress', 'resolved', 'cancelled'],
    default: 'pending'
  },
  item: {
    role: String,
    entity: {
      id: String,
      href: String,
      name: String,
      referredType: String
    }
  }
});

const partyInteractionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  href: String,
  interactionDate: {
    startDateTime: { type: Date, required: true },
    endDateTime: Date
  },
  description: { type: String, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['opened', 'inProgress', 'completed', 'cancelled'],
    default: 'opened'
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  relatedParty: [{
    role: {
      type: String,
      required: true,
      enum: ['customer', 'agent', 'supervisor', 'system']
    },
    partyOrPartyRole: {
      id: { type: String, required: true },
      href: String,
      name: { type: String, required: true },
      referredType: {
        type: String,
        enum: ['Individual', 'Organization', 'System'],
        required: true
      }
    }
  }],
  interactionItem: [interactionItemSchema],
  relatedChannel: [{
    role: String,
    channel: {
      id: String,
      name: {
        type: String,
        enum: ['phone', 'email', 'chat', 'store', 'web', 'mobile', 'social']
      }
    }
  }],
  attachment: [{
    id: String,
    href: String,
    name: String,
    description: String,
    attachmentType: String,
    mimeType: String,
    size: {
      amount: Number,
      units: String
    },
    url: String
  }],
  note: [{
    id: String,
    text: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }],
  category: String,
  subCategory: String,
  tags: [String]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for interaction duration
partyInteractionSchema.virtual('duration').get(function() {
  if (this.interactionDate.endDateTime && this.interactionDate.startDateTime) {
    return Math.round((this.interactionDate.endDateTime - this.interactionDate.startDateTime) / (1000 * 60)); // in minutes
  }
  return null;
});

// Index for better query performance
partyInteractionSchema.index({ status: 1, createdAt: -1 });
partyInteractionSchema.index({ 'relatedParty.partyOrPartyRole.id': 1 });
partyInteractionSchema.index({ direction: 1, status: 1 });

export default mongoose.model('PartyInteraction', partyInteractionSchema);