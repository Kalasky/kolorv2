const mongoose = require('mongoose')

const colorSchema = new mongoose.Schema(
  {
    vs_colors: {
      type: Array,
      trim: true,
      // required: true,
    },
    s_colors: {
      type: Array,
      trim: true,
      // required: true,
    },
    f_colors: {
      type: Array,
      trim: true,
      // required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Color', colorSchema)
