// models/formModel.js
const mongoose = require('mongoose');

const formSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  type:{
    type:String,
    required:true,
  },
  claimStatus:{
    type:Boolean,
    default: false,
    required:true,
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: null
  },
  item: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  date_lost: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  contact_name: {
    type: String,
    required: true,
  },
  contact_email: {
    type: String,
    required: true,
  },
  contact_phone: {
    type: String,
    required: true,
  },
  reward_offer: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  image: {
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    },
  }
}, { timestamps: true });

const FormModel = mongoose.model('form', formSchema);

module.exports = FormModel;