const expenseService = require('../services/expenseService');
const { validationResult } = require('express-validator');

class ExpenseController {
  // Create a new expense
  async createExpense(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { category, title, description, receipt_total, group_id } = req.body;
      
      const expenseData = {
        category,
        title,
        description,
        receipt_total,
        group_id,
        created_by: req.user.tenant_id // Assuming user has tenant_id from auth middleware
      };

      const expense = await expenseService.createExpense(expenseData);
      
      res.status(201).json({
        success: true,
        message: 'Expense created successfully',
        data: expense
      });
    } catch (error) {
      console.error('Error creating expense:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create expense'
      });
    }
  }

  // Get all expenses for a group
  async getExpensesByGroup(req, res) {
    try {
      const { groupId } = req.params;
      
      const expenses = await expenseService.getExpensesByGroup(groupId);
      
      res.status(200).json({
        success: true,
        data: expenses
      });
    } catch (error) {
      console.error('Error getting expenses:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get expenses'
      });
    }
  }

  // Get a specific expense by ID
  async getExpenseById(req, res) {
    try {
      const { expenseId } = req.params;
      
      const expense = await expenseService.getExpenseById(expenseId);
      
      res.status(200).json({
        success: true,
        data: expense
      });
    } catch (error) {
      console.error('Error getting expense:', error);
      if (error.message === 'Expense not found') {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get expense'
      });
    }
  }

  // Update an expense
  async updateExpense(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { expenseId } = req.params;
      const updateData = req.body;
      
      const expense = await expenseService.updateExpense(expenseId, updateData);
      
      res.status(200).json({
        success: true,
        message: 'Expense updated successfully',
        data: expense
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      if (error.message === 'Expense not found') {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update expense'
      });
    }
  }

  // Delete an expense
  async deleteExpense(req, res) {
    try {
      const { expenseId } = req.params;
      
      const result = await expenseService.deleteExpense(expenseId);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      if (error.message === 'Expense not found') {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete expense'
      });
    }
  }

  // Get expenses by category
  async getExpensesByCategory(req, res) {
    try {
      const { groupId, category } = req.params;
      
      const expenses = await expenseService.getExpensesByCategory(groupId, category);
      
      res.status(200).json({
        success: true,
        data: expenses
      });
    } catch (error) {
      console.error('Error getting expenses by category:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get expenses by category'
      });
    }
  }

  // Get total expenses for a group
  async getTotalExpensesByGroup(req, res) {
    try {
      const { groupId } = req.params;
      
      const total = await expenseService.getTotalExpensesByGroup(groupId);
      
      res.status(200).json({
        success: true,
        data: { total }
      });
    } catch (error) {
      console.error('Error getting total expenses:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get total expenses'
      });
    }
  }
}

const expenseController = new ExpenseController();

// Bind all methods to preserve 'this' context
module.exports = {
  createExpense: expenseController.createExpense.bind(expenseController),
  getExpensesByGroup: expenseController.getExpensesByGroup.bind(expenseController),
  getExpenseById: expenseController.getExpenseById.bind(expenseController),
  updateExpense: expenseController.updateExpense.bind(expenseController),
  deleteExpense: expenseController.deleteExpense.bind(expenseController),
  getExpensesByCategory: expenseController.getExpensesByCategory.bind(expenseController),
  getTotalExpensesByGroup: expenseController.getTotalExpensesByGroup.bind(expenseController)
};
