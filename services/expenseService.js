const Expense = require('../models/Expense');
const Group = require('../models/Group');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Split = require('../models/Split');
const sequelize = require('../configs/database');

class ExpenseService {
  // Create a new expense
  async createExpense(expenseData) {
    try {
      const expense = await Expense.create(expenseData);
      return expense;
    } catch (error) {
      throw new Error(`Failed to create expense: ${error.message}`);
    }
  }

  // Get all expenses for a group
  async getExpensesByGroup(groupId) {
    try {
      const expenses = await Expense.findAll({
        where: { group_id: groupId },
        include: [
          {
            model: Group,
            as: 'group',
            attributes: ['id', 'name']
          },
          {
            model: Tenant,
            as: 'creator',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          },
          {
            model: Split,
            as: 'splits',
            include: [
              {
                model: Tenant,
                as: 'assignedTenant',
                include: [
                  {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'full_name', 'email', 'phone_no']
                  }
                ]
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });
      return expenses;
    } catch (error) {
      throw new Error(`Failed to get expenses: ${error.message}`);
    }
  }

  // Get a specific expense by ID
  async getExpenseById(expenseId) {
    try {
      const expense = await Expense.findByPk(expenseId, {
        include: [
          {
            model: Group,
            as: 'group',
            attributes: ['id', 'name']
          },
          {
            model: Tenant,
            as: 'creator',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          },
          {
            model: Split,
            as: 'splits',
            include: [
              {
                model: Tenant,
                as: 'assignedTenant',
                include: [
                  {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'full_name', 'email', 'phone_no']
                  }
                ]
              }
            ]
          }
        ]
      });
      
      if (!expense) {
        throw new Error('Expense not found');
      }
      
      return expense;
    } catch (error) {
      throw new Error(`Failed to get expense: ${error.message}`);
    }
  }

  // Update an expense
  async updateExpense(expenseId, updateData) {
    try {
      const expense = await Expense.findByPk(expenseId);
      if (!expense) {
        throw new Error('Expense not found');
      }
      
      await expense.update(updateData);
      return expense;
    } catch (error) {
      throw new Error(`Failed to update expense: ${error.message}`);
    }
  }

  // Delete an expense
  async deleteExpense(expenseId) {
    try {
      const expense = await Expense.findByPk(expenseId);
      if (!expense) {
        throw new Error('Expense not found');
      }
      
      await expense.destroy();
      return { message: 'Expense deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete expense: ${error.message}`);
    }
  }

  // Get expenses by category
  async getExpensesByCategory(groupId, category) {
    try {
      const expenses = await Expense.findAll({
        where: { 
          group_id: groupId,
          category: category
        },
        include: [
          {
            model: Group,
            as: 'group',
            attributes: ['id', 'name']
          },
          {
            model: Tenant,
            as: 'creator',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'full_name', 'email', 'phone_no']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });
      return expenses;
    } catch (error) {
      throw new Error(`Failed to get expenses by category: ${error.message}`);
    }
  }

  // Get total expenses for a group
  async getTotalExpensesByGroup(groupId) {
    try {
      const result = await Expense.findOne({
        where: { group_id: groupId },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('receipt_total')), 'total']
        ]
      });
      
      return result ? parseFloat(result.dataValues.total) || 0 : 0;
    } catch (error) {
      throw new Error(`Failed to get total expenses: ${error.message}`);
    }
  }
}

module.exports = new ExpenseService();
