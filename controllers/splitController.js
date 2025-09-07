const splitService = require('../services/splitService');
const notificationService = require('../services/notificationService');
const socketService = require('../services/socketService');
const { validationResult } = require('express-validator');

class SplitController {
  // Create a new split
  async createSplit(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status, split_amount, assigned_to, expense_id } = req.body;
      
      const splitData = {
        status,
        split_amount,
        assigned_to,
        expense_id
      };

      const split = await splitService.createSplit(splitData);
      
      res.status(201).json({
        success: true,
        message: 'Split created successfully',
        data: split
      });
    } catch (error) {
      console.error('Error creating split:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create split'
      });
    }
  }

  // Create multiple splits for an expense
  async createSplitsForExpense(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { expenseId } = req.params;
      const { splits } = req.body;
      
      if (!Array.isArray(splits) || splits.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Splits array is required and must not be empty'
        });
      }

      const createdSplits = await splitService.createSplitsForExpense(expenseId, splits);
      
      res.status(201).json({
        success: true,
        message: 'Splits created successfully',
        data: createdSplits
      });
    } catch (error) {
      console.error('Error creating splits:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create splits'
      });
    }
  }

  // Get all splits for an expense
  async getSplitsByExpense(req, res) {
    try {
      const { expenseId } = req.params;
      
      const splits = await splitService.getSplitsByExpense(expenseId);
      
      res.status(200).json({
        success: true,
        data: splits
      });
    } catch (error) {
      console.error('Error getting splits:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get splits'
      });
    }
  }

  // Get splits by tenant
  async getSplitsByTenant(req, res) {
    try {
      const { tenantId } = req.params;
      
      const splits = await splitService.getSplitsByTenant(tenantId);
      
      res.status(200).json({
        success: true,
        data: splits
      });
    } catch (error) {
      console.error('Error getting tenant splits:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get tenant splits'
      });
    }
  }

  // Get a specific split by ID
  async getSplitById(req, res) {
    try {
      const { splitId } = req.params;
      
      const split = await splitService.getSplitById(splitId);
      
      res.status(200).json({
        success: true,
        data: split
      });
    } catch (error) {
      console.error('Error getting split:', error);
      if (error.message === 'Split not found') {
        return res.status(404).json({
          success: false,
          message: 'Split not found'
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get split'
      });
    }
  }

  // Update a split
  async updateSplit(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { splitId } = req.params;
      const updateData = req.body;
      
      const split = await splitService.updateSplit(splitId, updateData);
      
      res.status(200).json({
        success: true,
        message: 'Split updated successfully',
        data: split
      });
    } catch (error) {
      console.error('Error updating split:', error);
      if (error.message === 'Split not found') {
        return res.status(404).json({
          success: false,
          message: 'Split not found'
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update split'
      });
    }
  }

  // Update split status
  async updateSplitStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { splitId } = req.params;
      const { status, paid_date } = req.body;
      
      const split = await splitService.updateSplitStatus(splitId, status, paid_date);
      
      // Send notification if split was marked as paid
      if (status === 'paid') {
        try {
          const notification = await notificationService.createSplitPaidNotification(
            split,
            split.expense,
            split.assignedTenant,
            split.expense.creator
          );
          
          // Send real-time notification
          socketService.sendNotificationToTenant(notification.recipient_id, {
            id: notification.id,
            message: notification.message,
            type: notification.type,
            created_at: notification.created_at,
            metadata: notification.metadata
          });
        } catch (notificationError) {
          console.error('Error sending split paid notification:', notificationError);
          // Don't fail the split update if notifications fail
        }
      }
      
      res.status(200).json({
        success: true,
        message: 'Split status updated successfully',
        data: split
      });
    } catch (error) {
      console.error('Error updating split status:', error);
      if (error.message === 'Split not found') {
        return res.status(404).json({
          success: false,
          message: 'Split not found'
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update split status'
      });
    }
  }

  // Delete a split
  async deleteSplit(req, res) {
    try {
      const { splitId } = req.params;
      
      const result = await splitService.deleteSplit(splitId);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error deleting split:', error);
      if (error.message === 'Split not found') {
        return res.status(404).json({
          success: false,
          message: 'Split not found'
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete split'
      });
    }
  }

  // Get splits by status
  async getSplitsByStatus(req, res) {
    try {
      const { expenseId, status } = req.params;
      
      const splits = await splitService.getSplitsByStatus(expenseId, status);
      
      res.status(200).json({
        success: true,
        data: splits
      });
    } catch (error) {
      console.error('Error getting splits by status:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get splits by status'
      });
    }
  }

  // Get total amount for splits by status
  async getTotalSplitsByStatus(req, res) {
    try {
      const { expenseId, status } = req.params;
      
      const total = await splitService.getTotalSplitsByStatus(expenseId, status);
      
      res.status(200).json({
        success: true,
        data: { total }
      });
    } catch (error) {
      console.error('Error getting total splits by status:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get total splits by status'
      });
    }
  }

  // Get splits that the current user needs to pay
  async getToPaySplits(req, res) {
    try {
      const userId = req.user.id;
      
      const splits = await splitService.getToPaySplits(userId);
      
      res.status(200).json({
        success: true,
        data: splits
      });
    } catch (error) {
      console.error('Error fetching to pay splits:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch to pay splits'
      });
    }
  }

  // Get splits that the current user should receive
  async getToReceiveSplits(req, res) {
    try {
      const userId = req.user.id;
      
      const splits = await splitService.getToReceiveSplits(userId);
      
      res.status(200).json({
        success: true,
        data: splits
      });
    } catch (error) {
      console.error('Error fetching to receive splits:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch to receive splits'
      });
    }
  }

  // Get split history for the current user
  async getSplitHistory(req, res) {
    try {
      const userId = req.user.id;
      const splits = await splitService.getSplitHistory(userId);
      
      res.status(200).json({
        success: true,
        data: splits
      });
    } catch (error) {
      console.error('Error fetching split history:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch split history'
      });
    }
  }

  // Get split summary for the current user
  async getSplitSummary(req, res) {
    try {
      const userId = req.user.id;
      const summary = await splitService.getSplitSummary(userId);
      
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error fetching split summary:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch split summary'
      });
    }
  }
}

const splitController = new SplitController();

// Bind all methods to preserve 'this' context
module.exports = {
  createSplit: splitController.createSplit.bind(splitController),
  createSplitsForExpense: splitController.createSplitsForExpense.bind(splitController),
  getSplitsByExpense: splitController.getSplitsByExpense.bind(splitController),
  getSplitsByTenant: splitController.getSplitsByTenant.bind(splitController),
  getToPaySplits: splitController.getToPaySplits.bind(splitController),
  getToReceiveSplits: splitController.getToReceiveSplits.bind(splitController),
  getSplitHistory: splitController.getSplitHistory.bind(splitController),
  getSplitSummary: splitController.getSplitSummary.bind(splitController),
  getSplitById: splitController.getSplitById.bind(splitController),
  updateSplit: splitController.updateSplit.bind(splitController),
  updateSplitStatus: splitController.updateSplitStatus.bind(splitController),
  deleteSplit: splitController.deleteSplit.bind(splitController),
  getSplitsByStatus: splitController.getSplitsByStatus.bind(splitController),
  getTotalSplitsByStatus: splitController.getTotalSplitsByStatus.bind(splitController)
};
