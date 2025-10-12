const FAQ = require('../models/FAQ');
const mongoose = require('mongoose');

class KnowledgeBaseService {
  /**
   * Search for relevant FAQs based on user query
   * @param {string} query - User's search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of relevant FAQs
   */
  async searchRelevantInfo(query, options = {}) {
    try {
      const {
        category = null,
        language = 'en',
        limit = 5,
        threshold = 0.1
      } = options;

      // First try exact text search
      let faqs = await FAQ.searchFAQs(query, {
        category,
        language,
        limit: limit * 2 // Get more results for filtering
      });

      // If no results from text search, try keyword matching
      if (faqs.length === 0) {
        const keywords = this._extractKeywords(query);
        faqs = await FAQ.find({
          keywords: { $in: keywords },
          language: language,
          isActive: true,
          ...(category && { category })
        })
        .sort({ priority: -1, usageCount: -1 })
        .limit(limit);
      }

      // Filter by relevance score if available
      if (faqs.length > 0 && faqs[0].score) {
        faqs = faqs.filter(faq => faq.score >= threshold);
      }

      // Increment usage count for returned FAQs
      const faqIds = faqs.slice(0, limit).map(faq => faq._id);
      if (faqIds.length > 0) {
        await FAQ.updateMany(
          { _id: { $in: faqIds } },
          { 
            $inc: { usageCount: 1 },
            $set: { lastUsed: new Date() }
          }
        );
      }

      return faqs.slice(0, limit);
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      throw new Error('Failed to search knowledge base');
    }
  }

  /**
   * Get FAQ by ID with related FAQs
   * @param {string} faqId - FAQ ID
   * @returns {Promise<Object>} FAQ with related FAQs
   */
  async getFAQById(faqId) {
    try {
      const faq = await FAQ.findById(faqId);
      if (!faq) {
        throw new Error('FAQ not found');
      }

      const relatedFAQs = await FAQ.findSimilar(faqId, 3);
      
      return {
        faq,
        relatedFAQs
      };
    } catch (error) {
      console.error('Error getting FAQ by ID:', error);
      throw error;
    }
  }

  /**
   * Get FAQs by category
   * @param {string} category - FAQ category
   * @param {string} language - Language code
   * @returns {Promise<Array>} Array of FAQs in category
   */
  async getFAQsByCategory(category, language = 'en') {
    try {
      return await FAQ.findByCategory(category, language);
    } catch (error) {
      console.error('Error getting FAQs by category:', error);
      throw new Error('Failed to get FAQs by category');
    }
  }

  /**
   * Get popular FAQs
   * @param {string} language - Language code
   * @param {number} limit - Number of FAQs to return
   * @returns {Promise<Array>} Array of popular FAQs
   */
  async getPopularFAQs(language = 'en', limit = 10) {
    try {
      return await FAQ.getPopularFAQs(language, limit);
    } catch (error) {
      console.error('Error getting popular FAQs:', error);
      throw new Error('Failed to get popular FAQs');
    }
  }

  /**
   * Add new FAQ to knowledge base
   * @param {Object} faqData - FAQ data
   * @param {string} createdBy - User ID who created the FAQ
   * @returns {Promise<Object>} Created FAQ
   */
  async addFAQ(faqData, createdBy) {
    try {
      const faq = new FAQ({
        ...faqData,
        createdBy: createdBy
      });

      return await faq.save();
    } catch (error) {
      console.error('Error adding FAQ:', error);
      throw new Error('Failed to add FAQ to knowledge base');
    }
  }

  /**
   * Update existing FAQ
   * @param {string} faqId - FAQ ID
   * @param {Object} updateData - Update data
   * @param {string} updatedBy - User ID who updated the FAQ
   * @returns {Promise<Object>} Updated FAQ
   */
  async updateFAQ(faqId, updateData, updatedBy) {
    try {
      const faq = await FAQ.findByIdAndUpdate(
        faqId,
        {
          ...updateData,
          updatedBy: updatedBy,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );

      if (!faq) {
        throw new Error('FAQ not found');
      }

      return faq;
    } catch (error) {
      console.error('Error updating FAQ:', error);
      throw error;
    }
  }

  /**
   * Delete FAQ
   * @param {string} faqId - FAQ ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteFAQ(faqId) {
    try {
      const result = await FAQ.findByIdAndDelete(faqId);
      return !!result;
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      throw new Error('Failed to delete FAQ');
    }
  }

  /**
   * Add feedback to FAQ
   * @param {string} faqId - FAQ ID
   * @param {boolean} isHelpful - Whether the FAQ was helpful
   * @param {number} rating - Rating (1-5)
   * @returns {Promise<Object>} Updated FAQ
   */
  async addFeedback(faqId, isHelpful, rating = null) {
    try {
      const faq = await FAQ.findById(faqId);
      if (!faq) {
        throw new Error('FAQ not found');
      }

      await faq.addFeedback(isHelpful, rating);
      return faq;
    } catch (error) {
      console.error('Error adding FAQ feedback:', error);
      throw error;
    }
  }

  /**
   * Get knowledge base analytics
   * @param {Object} dateRange - Date range for analytics
   * @returns {Promise<Object>} Analytics data
   */
  async getAnalytics(dateRange = {}) {
    try {
      const categoryAnalytics = await FAQ.getAnalytics(dateRange);
      
      const totalFAQs = await FAQ.countDocuments({ isActive: true });
      const totalUsage = await FAQ.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$usageCount' } } }
      ]);

      return {
        totalFAQs,
        totalUsage: totalUsage[0]?.total || 0,
        categoryBreakdown: categoryAnalytics
      };
    } catch (error) {
      console.error('Error getting knowledge base analytics:', error);
      throw new Error('Failed to get analytics');
    }
  }

  /**
   * Bulk import FAQs
   * @param {Array} faqsData - Array of FAQ data
   * @param {string} createdBy - User ID who imported the FAQs
   * @returns {Promise<Object>} Import results
   */
  async bulkImportFAQs(faqsData, createdBy) {
    try {
      const results = {
        successful: 0,
        failed: 0,
        errors: []
      };

      for (const faqData of faqsData) {
        try {
          await this.addFAQ(faqData, createdBy);
          results.successful++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            faq: faqData.question,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error bulk importing FAQs:', error);
      throw new Error('Failed to bulk import FAQs');
    }
  }

  /**
   * Extract keywords from text
   * @param {string} text - Text to extract keywords from
   * @returns {Array} Array of keywords
   * @private
   */
  _extractKeywords(text) {
    const words = text.toLowerCase().match(/\b\w{3,}\b/g) || [];
    const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'];
    
    return [...new Set(words.filter(word => 
      word.length > 2 && 
      !commonWords.includes(word) &&
      !/^\d+$/.test(word)
    ))];
  }

  /**
   * Initialize knowledge base with default FAQs
   * @param {string} createdBy - User ID who creates the default FAQs
   * @returns {Promise<void>}
   */
  async initializeDefaultFAQs(createdBy) {
    try {
      const existingFAQs = await FAQ.countDocuments();
      if (existingFAQs > 0) {
        console.log('Knowledge base already has FAQs, skipping initialization');
        return;
      }

      const defaultFAQs = [
        {
          question: "How do I enroll for the next semester?",
          answer: "To enroll for the next semester, log into your student portal, go to the Enrollment section, select your subjects, and submit your enrollment form. Make sure to complete payment before the deadline.",
          category: "enrollment",
          keywords: ["enroll", "enrollment", "semester", "subjects", "payment"],
          priority: 10
        },
        {
          question: "What are the admission requirements?",
          answer: "Admission requirements include: completed application form, high school diploma or equivalent, transcript of records, birth certificate, and entrance exam results. Additional requirements may vary by program.",
          category: "admissions",
          keywords: ["admission", "requirements", "application", "diploma", "transcript"],
          priority: 10
        },
        {
          question: "How can I check my grades?",
          answer: "You can check your grades by logging into the student portal and navigating to the Grades section. Grades are typically updated within 2 weeks after the end of each term.",
          category: "academics",
          keywords: ["grades", "check", "portal", "student", "term"],
          priority: 9
        },
        {
          question: "What is the tuition fee payment deadline?",
          answer: "Tuition fee payment deadlines vary by semester. Generally, full payment is due before the start of classes, or you can opt for installment plans. Check the Academic Calendar for specific dates.",
          category: "payments",
          keywords: ["tuition", "payment", "deadline", "installment", "calendar"],
          priority: 9
        },
        {
          question: "How do I access the library?",
          answer: "The library is open Monday to Friday, 8 AM to 6 PM, and Saturday 8 AM to 4 PM. You need your student ID to enter. Digital resources are available 24/7 through the library portal.",
          category: "facilities",
          keywords: ["library", "access", "hours", "student", "digital"],
          priority: 7
        }
      ];

      await this.bulkImportFAQs(defaultFAQs, createdBy);
      console.log('Default FAQs initialized successfully');
    } catch (error) {
      console.error('Error initializing default FAQs:', error);
      throw error;
    }
  }
}

module.exports = new KnowledgeBaseService();