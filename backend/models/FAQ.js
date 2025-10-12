const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500
  },
  answer: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 2000
  },
  category: { 
    type: String, 
    required: true,
    enum: [
      'admissions',
      'academics',
      'enrollment',
      'schedules',
      'payments',
      'facilities',
      'events',
      'policies',
      'technical',
      'general'
    ],
    index: true
  },
  subcategory: {
    type: String,
    trim: true,
    default: null
  },
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  alternativeQuestions: [{
    type: String,
    trim: true,
    maxlength: 500
  }],
  priority: { 
    type: Number, 
    default: 1,
    min: 1,
    max: 10
  },
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  },
  language: {
    type: String,
    enum: ['en', 'fil'],
    default: 'en',
    index: true
  },
  translations: [{
    language: {
      type: String,
      enum: ['en', 'fil'],
      required: true
    },
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    answer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  }],
  usageCount: { 
    type: Number, 
    default: 0,
    index: true
  },
  lastUsed: { 
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  relatedFAQs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FAQ'
  }],
  feedback: {
    helpful: { type: Number, default: 0 },
    notHelpful: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 }
  }
}, {
  timestamps: true
});

// Text indexes for search functionality
faqSchema.index({ 
  question: 'text', 
  answer: 'text', 
  keywords: 'text',
  'translations.question': 'text',
  'translations.answer': 'text',
  'translations.keywords': 'text'
});

// Compound indexes for efficient querying
faqSchema.index({ category: 1, isActive: 1, priority: -1 });
faqSchema.index({ language: 1, isActive: 1, usageCount: -1 });
faqSchema.index({ isActive: 1, usageCount: -1 });

// Pre-save middleware to update keywords
faqSchema.pre('save', function(next) {
  if (this.isModified('question') || this.isModified('answer')) {
    // Extract keywords from question and answer
    const text = `${this.question} ${this.answer}`.toLowerCase();
    const words = text.match(/\b\w{3,}\b/g) || [];
    
    // Filter out common words and duplicates
    const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'];
    const uniqueWords = [...new Set(words.filter(word => 
      word.length > 2 && 
      !commonWords.includes(word) &&
      !/^\d+$/.test(word)
    ))];
    
    // Merge with existing keywords, avoiding duplicates
    this.keywords = [...new Set([...this.keywords, ...uniqueWords])];
  }
  next();
});

// Instance methods
faqSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

faqSchema.methods.addFeedback = function(isHelpful, rating = null) {
  if (isHelpful) {
    this.feedback.helpful += 1;
  } else {
    this.feedback.notHelpful += 1;
  }
  
  if (rating !== null && rating >= 1 && rating <= 5) {
    const totalRatings = this.feedback.totalRatings;
    const currentAverage = this.feedback.averageRating;
    
    this.feedback.totalRatings += 1;
    this.feedback.averageRating = ((currentAverage * totalRatings) + rating) / this.feedback.totalRatings;
  }
  
  return this.save();
};

faqSchema.methods.addTranslation = function(language, question, answer, keywords = []) {
  // Remove existing translation for the same language
  this.translations = this.translations.filter(t => t.language !== language);
  
  // Add new translation
  this.translations.push({
    language,
    question: question.trim(),
    answer: answer.trim(),
    keywords: keywords.map(k => k.toLowerCase().trim())
  });
  
  return this.save();
};

// Static methods
faqSchema.statics.searchFAQs = function(query, options = {}) {
  const {
    category = null,
    language = 'en',
    limit = 10,
    includeInactive = false
  } = options;
  
  const searchCriteria = {
    $text: { $search: query }
  };
  
  // Only add language filter for supported languages
  if (language === 'en') {
    searchCriteria.language = language;
  }
  
  if (!includeInactive) {
    searchCriteria.isActive = true;
  }
  
  if (category) {
    searchCriteria.category = category;
  }
  
  return this.find(searchCriteria, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, priority: -1, usageCount: -1 })
    .limit(limit);
};

faqSchema.statics.findByCategory = function(category, language = 'en', limit = 20) {
  return this.find({
    category: category,
    language: language,
    isActive: true
  })
  .sort({ priority: -1, usageCount: -1 })
  .limit(limit);
};

faqSchema.statics.getPopularFAQs = function(language = 'en', limit = 10) {
  return this.find({
    language: language,
    isActive: true
  })
  .sort({ usageCount: -1, priority: -1 })
  .limit(limit);
};

faqSchema.statics.findSimilar = function(faqId, limit = 5) {
  return this.findById(faqId)
    .then(faq => {
      if (!faq) return [];
      
      return this.find({
        _id: { $ne: faqId },
        category: faq.category,
        language: faq.language,
        isActive: true,
        $or: [
          { keywords: { $in: faq.keywords } },
          { tags: { $in: faq.tags } }
        ]
      })
      .sort({ usageCount: -1, priority: -1 })
      .limit(limit);
    });
};

faqSchema.statics.getAnalytics = function(dateRange = {}) {
  const matchStage = { isActive: true };
  
  if (dateRange.start || dateRange.end) {
    matchStage.createdAt = {};
    if (dateRange.start) matchStage.createdAt.$gte = new Date(dateRange.start);
    if (dateRange.end) matchStage.createdAt.$lte = new Date(dateRange.end);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$category',
        totalFAQs: { $sum: 1 },
        totalUsage: { $sum: '$usageCount' },
        averageRating: { $avg: '$feedback.averageRating' },
        helpfulFeedback: { $sum: '$feedback.helpful' },
        notHelpfulFeedback: { $sum: '$feedback.notHelpful' }
      }
    },
    { $sort: { totalUsage: -1 } }
  ]);
};

module.exports = mongoose.model('FAQ', faqSchema);